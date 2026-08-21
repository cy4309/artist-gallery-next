/**
 * GAS 薄層 — 只負責「整批寫入 / 整批讀取」Events Sheet。
 * 記憶體快取降低 GAS 冷啟動反覆讀取成本。
 */

import { CanonicalEvent } from "@/types/event";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { postToGas } from "@/services/server/gasClient";
import { truncateText } from "@/services/events/normalize";
import { normalizeCategoryId } from "@/utils/eventCategories";

const EVENTS_COLUMNS = [
  "id",
  "source",
  "sourceId",
  "category",
  "title",
  "startTime",
  "endTime",
  "cityName",
  "address",
  "description",
  "website",
  "imageUrl",
  "syncedAt",
] as const satisfies ReadonlyArray<keyof CanonicalEvent>;

const CACHE_TTL_MS = 5 * 60 * 1000;

let eventsCache: { at: number; events: CanonicalEvent[] } | null = null;

function invalidateEventsCache() {
  eventsCache = null;
}

export async function writeEventsToSheet(
  events: CanonicalEvent[],
): Promise<void> {
  const rows = events.map((event) =>
    EVENTS_COLUMNS.map((col) => {
      const value = event[col] ?? "";
      if (col === "description") return truncateText(String(value), 300);
      if (col === "category") {
        return normalizeCategoryId(String(value)) || String(value);
      }
      return value;
    }),
  );

  const json = await postToGas<{ ok?: boolean; error?: string }>({
    action: GAS_ACTION.REPLACE_EVENTS,
    columns: EVENTS_COLUMNS,
    rows,
  });

  if (!json.ok) {
    throw new Error(`GAS replaceEvents logic failed: ${json.error ?? "unknown"}`);
  }

  invalidateEventsCache();
}

export async function listEventsFromSheet(): Promise<CanonicalEvent[]> {
  if (eventsCache && Date.now() - eventsCache.at < CACHE_TTL_MS) {
    return eventsCache.events;
  }

  const json = await postToGas<{
    ok?: boolean;
    events?: CanonicalEvent[];
    error?: string;
    status?: string;
  }>({ action: GAS_ACTION.LIST_EVENTS });

  if (!json.ok) {
    throw new Error(
      `GAS listEvents logic failed: ${json.error ?? json.status ?? JSON.stringify(json)}`,
    );
  }

  const events = Array.isArray(json.events)
    ? json.events.map((event) => ({
        ...event,
        category:
          normalizeCategoryId(event.category) || event.category || undefined,
      }))
    : [];
  eventsCache = { at: Date.now(), events };
  return events;
}
