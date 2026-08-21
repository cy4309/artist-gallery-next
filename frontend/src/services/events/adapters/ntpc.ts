import { CanonicalEvent } from "@/types/event";
import {
  extractAddressFromDescription,
  resolveCityName,
  stableEventHash,
  toEventIsoDate,
} from "@/services/events/normalize";

const NTPC_EVENTS_API =
  "https://data.ntpc.gov.tw/api/datasets/781b822e-214a-4b9a-b4db-32c9f4626d98/json";

const PAGE_SIZE = 100;

/** 只收較接近藝文展覽／活動的屬性，排除轉知、一般公告、徵件等 */
const NTPC_ALLOWED_TYPES = new Set([
  "活動、表演與節慶",
  "展　　覽",
  "展覽",
]);

type NtpcRawEvent = {
  author?: string;
  type?: string;
  startdate?: string;
  enddate?: string;
  title?: string;
  link?: string;
  description?: string;
  pubdate?: string;
};

function normalizeNtpcType(type?: string): string {
  return (type ?? "").replace(/\s+/g, "").trim();
}

function isAllowedNtpcType(type?: string): boolean {
  const raw = (type ?? "").trim();
  if (NTPC_ALLOWED_TYPES.has(raw)) return true;

  // 「展　　覽」空白數不固定時仍放行
  const compact = normalizeNtpcType(type);
  return compact === "展覽" || compact === "活動、表演與節慶";
}

async function fetchNtpcPage(page: number): Promise<NtpcRawEvent[]> {
  const url = `${NTPC_EVENTS_API}?page=${page}&size=${PAGE_SIZE}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`NTPC API failed: ${res.status}`);
  }

  const data = (await res.json()) as NtpcRawEvent[];
  return Array.isArray(data) ? data : [];
}

export async function fetchNtpcCanonicalEvents(): Promise<CanonicalEvent[]> {
  const syncedAt = new Date().toISOString();
  const all: NtpcRawEvent[] = [];

  for (let page = 0; page < 50; page += 1) {
    const batch = await fetchNtpcPage(page);
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }

  return all
    .filter((event) => isAllowedNtpcType(event.type))
    .map((event) => {
      const title = event.title?.trim() ?? "";
      const startdate = event.startdate ?? "";
      const enddate = event.enddate ?? "";
      const link = event.link ?? "";
      const description = event.description ?? "";
      const address = extractAddressFromDescription(description);
      const sourceId = stableEventHash([title, startdate, link]);

      return {
        id: `ntpc:${sourceId}`,
        source: "ntpc",
        sourceId,
        category: "新北文化局",
        title,
        startTime: toEventIsoDate(startdate),
        endTime: toEventIsoDate(enddate || startdate, true),
        cityName: resolveCityName(undefined, address, "新北市"),
        address,
        description: description.slice(0, 300),
        website: link,
        imageUrl: "",
        syncedAt,
      };
    });
}
