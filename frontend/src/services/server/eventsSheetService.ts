/**
 * GAS 薄層 — 只負責「整批寫入 / 整批讀取」Events Sheet。
 * 所有業務邏輯（normalize、merge、dedupe）都在 Next.js 這邊。
 */

import { CanonicalEvent } from "@/types/event";
import { GAS_ACTION } from "@/types/gas/actionConstants";

const GAS_URL = process.env.GAS_URL!;

const EVENTS_COLUMNS = [
  "id",
  "source",
  "sourceId",
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

export async function writeEventsToSheet(
  events: CanonicalEvent[],
): Promise<void> {
  if (!GAS_URL) throw new Error("GAS_URL not set");

  const rows = events.map((event) =>
    EVENTS_COLUMNS.map((col) => event[col] ?? ""),
  );

  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: GAS_ACTION.REPLACE_EVENTS,
      columns: EVENTS_COLUMNS,
      rows,
    }),
  });

  if (!res.ok) {
    throw new Error(`GAS replaceEvents failed: ${res.status}`);
  }

  const json = (await res.json()) as { ok?: boolean; error?: string };
  if (!json.ok) {
    throw new Error(`GAS replaceEvents logic failed: ${json.error ?? "unknown"}`);
  }
}

export async function listEventsFromSheet(): Promise<CanonicalEvent[]> {
  if (!GAS_URL) throw new Error("GAS_URL not set");

  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: GAS_ACTION.LIST_EVENTS }),
  });

  if (!res.ok) {
    throw new Error(`GAS listEvents failed: ${res.status}`);
  }

  const json = (await res.json()) as {
    ok?: boolean;
    events?: CanonicalEvent[];
    error?: string;
  };

  if (!json.ok) {
    throw new Error(`GAS listEvents logic failed: ${json.error ?? "unknown"}`);
  }

  return Array.isArray(json.events) ? json.events : [];
}
