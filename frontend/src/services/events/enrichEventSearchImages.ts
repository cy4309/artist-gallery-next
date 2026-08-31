import { CanonicalEvent } from "@/types/event";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { buildEventSearchKeywords } from "@/services/events/searchKeywords";
import { SEARCH_IMAGES_AUTO_PUBLISH } from "@/services/events/searchImageConfig";
import { searchStockImageUrl } from "@/services/events/stockImageSearch";
import { validateRemoteImageUrl } from "@/services/events/validateImageUrl";
import {
  getDataBackend,
  postToDataBackend,
} from "@/services/server/dataBackendClient";
import {
  invalidateEventsCache,
  listEventsFromSheet,
} from "@/services/server/eventsSheetService";

const DEFAULT_LIMIT = 30;
const DEFAULT_CONCURRENCY = 4;

export type SearchImagePreview = {
  id: string;
  title: string;
  cityName: string;
  keyword: string;
  imageUrl: string;
};

export type EnrichSearchImagesResult = {
  backend: ReturnType<typeof getDataBackend>;
  mode: "publish" | "preview";
  attempted: number;
  matched: number;
  updated: number;
  queueTotal: number;
  remaining: number;
  attemptedIds: string[];
  failedIds: string[];
  passComplete: boolean;
  previews?: SearchImagePreview[];
  skipped?: string;
};

type ImagePatch = {
  id: string;
  imageUrl: string;
  imageSource: "search";
};

type SearchMatch = ImagePatch & {
  title: string;
  cityName: string;
  keyword: string;
};

function isMissingImage(event: CanonicalEvent): boolean {
  return !event.imageUrl?.trim();
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

async function findSearchImageForEvent(
  event: CanonicalEvent,
): Promise<{ imageUrl: string; keyword: string } | null> {
  const keywords = buildEventSearchKeywords(event);
  for (const keyword of keywords) {
    const candidate = await searchStockImageUrl(keyword);
    if (!candidate) continue;
    const valid = await validateRemoteImageUrl(candidate);
    if (valid) return { imageUrl: candidate, keyword };
  }
  return null;
}

export async function enrichEventsWithSearchImages(options?: {
  limit?: number;
  concurrency?: number;
  excludeIds?: string[];
}): Promise<EnrichSearchImagesResult> {
  const backend = getDataBackend();
  const mode = SEARCH_IMAGES_AUTO_PUBLISH ? "publish" : "preview";

  if (backend !== "cloudflare") {
    return {
      backend,
      mode,
      attempted: 0,
      matched: 0,
      updated: 0,
      queueTotal: 0,
      remaining: 0,
      attemptedIds: [],
      failedIds: [],
      passComplete: true,
      skipped: "cloudflare only",
    };
  }

  const limit = options?.limit ?? DEFAULT_LIMIT;
  const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY;
  const exclude = new Set(options?.excludeIds ?? []);
  const events = await listEventsFromSheet();
  const queueTotal = events.filter((event) => isMissingImage(event)).length;
  const targets = events.filter(
    (event) => isMissingImage(event) && !exclude.has(event.id),
  );
  const batch = targets.slice(0, limit);
  const passComplete = batch.length === 0;

  if (passComplete) {
    return {
      backend,
      mode,
      attempted: 0,
      matched: 0,
      updated: 0,
      queueTotal,
      remaining: queueTotal,
      attemptedIds: [],
      failedIds: [],
      passComplete: true,
    };
  }

  const attemptedIds = batch.map((event) => event.id);

  const matchResults = await mapWithConcurrency(
    batch,
    concurrency,
    async (event) => {
      const hit = await findSearchImageForEvent(event);
      if (!hit) return null;
      return {
        id: event.id,
        imageUrl: hit.imageUrl,
        imageSource: "search" as const,
        title: event.title?.trim() ?? "",
        cityName: event.cityName?.trim() ?? "",
        keyword: hit.keyword,
      };
    },
  );

  const matches = matchResults.filter((match): match is SearchMatch =>
    Boolean(match),
  );
  const failedIds = attemptedIds.filter(
    (id) => !matches.some((match) => match.id === id),
  );

  const previews: SearchImagePreview[] = matches.map(
    ({ id, title, cityName, keyword, imageUrl }) => ({
      id,
      title,
      cityName,
      keyword,
      imageUrl,
    }),
  );

  let updated = 0;
  if (SEARCH_IMAGES_AUTO_PUBLISH && matches.length > 0) {
    const patches: ImagePatch[] = matches.map(
      ({ id, imageUrl, imageSource }) => ({
        id,
        imageUrl,
        imageSource,
      }),
    );

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
    mode,
    attempted: batch.length,
    matched: matches.length,
    updated,
    queueTotal,
    remaining: SEARCH_IMAGES_AUTO_PUBLISH
      ? Math.max(0, queueTotal - updated)
      : queueTotal,
    attemptedIds,
    failedIds,
    passComplete: false,
    previews: previews.length ? previews : undefined,
    skipped: SEARCH_IMAGES_AUTO_PUBLISH
      ? undefined
      : "preview only — 未寫入 D1",
  };
}
