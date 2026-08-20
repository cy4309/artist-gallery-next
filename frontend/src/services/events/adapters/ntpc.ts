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

  return all.map((event) => {
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
      title,
      startTime: toEventIsoDate(startdate),
      endTime: toEventIsoDate(enddate || startdate, true),
      cityName: resolveCityName(undefined, address, "新北市"),
      address,
      description,
      website: link,
      imageUrl: "",
      syncedAt,
    };
  });
}
