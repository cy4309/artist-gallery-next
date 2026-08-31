import { CanonicalEvent, EventImageSource } from "@/types/event";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { validateRemoteImageUrl } from "@/services/events/validateImageUrl";
import {
  getDataBackend,
  postToDataBackend,
} from "@/services/server/dataBackendClient";
import {
  invalidateEventsCache,
  listEventsFromSheet,
} from "@/services/server/eventsSheetService";

const VALIDATE_CONCURRENCY = 8;
const SUPPLEMENTAL_SOURCES = new Set<EventImageSource>(["og", "search"]);

export type ClearInvalidSupplementalImagesResult = {
  backend: ReturnType<typeof getDataBackend>;
  scanned: number;
  invalid: number;
  cleared: number;
  bySource: { og: number; search: number };
  skipped?: string;
};

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

export async function clearInvalidSupplementalImages(): Promise<ClearInvalidSupplementalImagesResult> {
  const backend = getDataBackend();
  if (backend !== "cloudflare") {
    return {
      backend,
      scanned: 0,
      invalid: 0,
      cleared: 0,
      bySource: { og: 0, search: 0 },
      skipped: "cloudflare only",
    };
  }

  const events = await listEventsFromSheet();
  const supplementalEvents = events.filter(
    (event): event is CanonicalEvent & { imageUrl: string; imageSource: EventImageSource } =>
      Boolean(event.imageUrl?.trim()) &&
      Boolean(event.imageSource && SUPPLEMENTAL_SOURCES.has(event.imageSource)),
  );

  const validationResults = await mapWithConcurrency(
    supplementalEvents,
    VALIDATE_CONCURRENCY,
    async (event) => {
      const valid = await validateRemoteImageUrl(event.imageUrl);
      return {
        id: event.id,
        source: event.imageSource,
        valid,
      };
    },
  );

  const invalid = validationResults.filter((result) => !result.valid);
  const invalidIds = invalid.map((result) => result.id);
  const bySource = {
    og: invalid.filter((r) => r.source === "og").length,
    search: invalid.filter((r) => r.source === "search").length,
  };

  if (!invalidIds.length) {
    return {
      backend,
      scanned: supplementalEvents.length,
      invalid: 0,
      cleared: 0,
      bySource,
    };
  }

  const json = await postToDataBackend<{
    ok?: boolean;
    cleared?: number;
    error?: string;
  }>({
    action: GAS_ACTION.CLEAR_EVENT_IMAGES,
    ids: invalidIds,
  });

  if (!json.ok) {
    throw new Error(`clearEventImages failed: ${json.error ?? "unknown"}`);
  }

  invalidateEventsCache();

  return {
    backend,
    scanned: supplementalEvents.length,
    invalid: invalidIds.length,
    cleared: json.cleared ?? 0,
    bySource,
  };
}

/** @deprecated 使用 clearInvalidSupplementalImages */
export const clearInvalidSearchImages = clearInvalidSupplementalImages;
