import { CanonicalEvent } from "@/types/event";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { fetchOgImageUrl } from "@/services/events/ogImage";
import {
  getDataBackend,
  postToDataBackend,
} from "@/services/server/dataBackendClient";
import {
  invalidateEventsCache,
  listEventsFromSheet,
} from "@/services/server/eventsSheetService";

const DEFAULT_LIMIT = 40;
const DEFAULT_CONCURRENCY = 6;

export type EnrichOgImagesResult = {
  backend: ReturnType<typeof getDataBackend>;
  /** 本輪實際處理筆數 */
  attempted: number;
  /** 本輪抓到 og 圖的筆數 */
  matched: number;
  /** 本輪寫入 DB 的筆數 */
  updated: number;
  /** 本輪開始前：缺圖且有官網的總數 */
  queueTotal: number;
  /** 本輪後仍缺圖且有官網的數量 */
  remaining: number;
  /** 下一輪建議 offset（連續掃描用） */
  nextOffset: number;
  /** 本輪 offset */
  offset: number;
  /** 是否已掃完佇列尾端 */
  scannedAll: boolean;
  skipped?: string;
};

type ImagePatch = {
  id: string;
  imageUrl: string;
  imageSource: "og";
};

function isMissingImage(event: CanonicalEvent): boolean {
  return !event.imageUrl?.trim();
}

function hasWebsite(event: CanonicalEvent): boolean {
  return Boolean(event.website?.trim());
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export async function enrichEventsWithOgImages(options?: {
  limit?: number;
  concurrency?: number;
  /** 連續掃描時跳過佇列前 N 筆 */
  offset?: number;
}): Promise<EnrichOgImagesResult> {
  const backend = getDataBackend();
  if (backend !== "cloudflare") {
    return {
      backend,
      attempted: 0,
      matched: 0,
      updated: 0,
      queueTotal: 0,
      remaining: 0,
      nextOffset: 0,
      offset: 0,
      scannedAll: true,
      skipped: "cloudflare only",
    };
  }

  const limit = options?.limit ?? DEFAULT_LIMIT;
  const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY;
  const offset = Math.max(0, options?.offset ?? 0);
  const events = await listEventsFromSheet();
  const targets = events.filter(
    (event) => isMissingImage(event) && hasWebsite(event),
  );
  const queueTotal = targets.length;
  const batch = targets.slice(offset, offset + limit);
  const nextOffset = offset + batch.length;
  const scannedAll = nextOffset >= queueTotal;

  if (batch.length === 0) {
    return {
      backend,
      attempted: 0,
      matched: 0,
      updated: 0,
      queueTotal,
      remaining: queueTotal,
      nextOffset: offset,
      offset,
      scannedAll: true,
    };
  }

  const patches = (
    await mapWithConcurrency(batch, concurrency, async (event) => {
      const imageUrl = await fetchOgImageUrl(event.website);
      if (!imageUrl) return null;
      return {
        id: event.id,
        imageUrl,
        imageSource: "og" as const,
      };
    })
  ).filter((patch): patch is ImagePatch => Boolean(patch));

  let updated = 0;
  if (patches.length > 0) {
    const json = await postToDataBackend<{
      ok?: boolean;
      updated?: number;
      error?: string;
    }>({
      action: GAS_ACTION.PATCH_EVENT_IMAGES,
      patches,
    });

    if (!json.ok) {
      throw new Error(`patchEventImages failed: ${json.error ?? "unknown"}`);
    }

    updated = json.updated ?? 0;
    invalidateEventsCache();
  }

  return {
    backend,
    attempted: batch.length,
    matched: patches.length,
    updated,
    queueTotal,
    remaining: Math.max(0, queueTotal - updated),
    nextOffset: scannedAll ? 0 : nextOffset,
    offset,
    scannedAll,
  };
}
