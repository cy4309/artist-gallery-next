import { CanonicalEvent } from "@/types/event";
import { fetchOrgEvents } from "@/services/server/orgDataServer";
import {
  resolveCityName,
  toEventIsoDate,
  truncateText,
} from "@/services/events/normalize";
import { CULTURE_TYPE_CATEGORY_IDS, cultureApiCodeToCategory } from "@/utils/eventCategories";

const CULTURE_TYPE_API =
  "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ";

type CultureShowInfo = {
  time?: string;
  endTime?: string;
  location?: string;
  locationName?: string;
};

type CultureTypeEvent = {
  UID?: string;
  title?: string;
  category?: string;
  descriptionFilterHtml?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  sourceWebPromote?: string;
  webSales?: string;
  showInfo?: CultureShowInfo[];
};

function normalizeCultureImageUrl(raw?: string): string {
  if (!raw?.trim()) return "";
  let url = raw.trim();
  url = url.replace(
    /^https?:\/\/cloud\.culture\.twhttps?:\/\/cloud\.culture\.tw/i,
    "https://cloud.culture.tw",
  );
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.startsWith("/")
    ? `https://cloud.culture.tw${url}`
    : `https://cloud.culture.tw/${url}`;
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickShowInfo(event: CultureTypeEvent): CultureShowInfo | undefined {
  return event.showInfo?.[0];
}

function mapTypeEvent(
  event: CultureTypeEvent,
  syncedAt: string,
  apiCode: string,
): CanonicalEvent | null {
  const sourceId = String(event.UID ?? "").trim();
  if (!sourceId) return null;

  const show = pickShowInfo(event);
  const address = show?.location?.trim() ?? "";
  const cityName =
    resolveCityName(undefined, address) ||
    resolveCityName(undefined, show?.locationName) ||
    "";

  const startRaw = event.startDate || show?.time || "";
  const endRaw = event.endDate || show?.endTime || startRaw;
  const category = cultureApiCodeToCategory(
    String(event.category ?? apiCode).trim() || apiCode,
  );

  return {
    id: `culture:${sourceId}`,
    source: "culture",
    sourceId,
    category,
    title: event.title?.trim() ?? "",
    startTime: toEventIsoDate(startRaw),
    endTime: toEventIsoDate(endRaw, true),
    cityName,
    address,
    description: truncateText(stripHtml(event.descriptionFilterHtml), 300),
    website: event.sourceWebPromote?.trim() || event.webSales?.trim() || "",
    imageUrl: normalizeCultureImageUrl(event.imageUrl),
    syncedAt,
  };
}

async function fetchCultureCategory(
  apiCode: string,
  syncedAt: string,
): Promise<CanonicalEvent[]> {
  const url = `${CULTURE_TYPE_API}&category=${apiCode}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Culture category ${apiCode} failed: ${res.status}`);
  }

  const data = (await res.json()) as CultureTypeEvent[];
  if (!Array.isArray(data)) return [];

  const mapped: CanonicalEvent[] = [];
  for (const event of data) {
    const item = mapTypeEvent(event, syncedAt, apiCode);
    if (item) mapped.push(item);
  }
  return mapped;
}

/** 節慶專區 + 全部 iCulture category */
export async function fetchCultureCanonicalEvents(): Promise<CanonicalEvent[]> {
  const syncedAt = new Date().toISOString();
  const events: CanonicalEvent[] = [];

  const festivalResult = await Promise.allSettled([fetchOrgEvents()]);
  if (festivalResult[0].status === "fulfilled") {
    for (const event of festivalResult[0].value) {
      const sourceId = String(event.actId);
      const cityName =
        resolveCityName(event.cityName, event.address) ||
        event.cityName ||
        "";

      events.push({
        id: `culture:${sourceId}`,
        source: "culture",
        sourceId,
        category: "節慶",
        title: event.actName ?? "",
        startTime: toEventIsoDate(event.startTime),
        endTime: toEventIsoDate(event.endTime, true),
        cityName,
        address: event.address ?? "",
        description: truncateText(event.description ?? "", 300),
        website: event.website ?? "",
        imageUrl: event.imageUrl ?? "",
        syncedAt,
      });
    }
  } else {
    console.warn(
      "[culture] festival fetch failed:",
      festivalResult[0].reason instanceof Error
        ? festivalResult[0].reason.message
        : festivalResult[0].reason,
    );
  }

  const categoryResults = await Promise.allSettled(
    CULTURE_TYPE_CATEGORY_IDS.map((apiCode) =>
      fetchCultureCategory(apiCode, syncedAt),
    ),
  );

  categoryResults.forEach((result, index) => {
    const apiCode = CULTURE_TYPE_CATEGORY_IDS[index];
    if (result.status === "fulfilled") {
      events.push(...result.value);
    } else {
      console.warn(
        `[culture] category ${apiCode} failed:`,
        result.reason instanceof Error ? result.reason.message : result.reason,
      );
    }
  });

  if (events.length === 0) {
    throw new Error("Culture fetch returned empty");
  }

  return events;
}

export function cultureLegacyActId(event: CanonicalEvent): number | null {
  if (event.source !== "culture" || !event.sourceId) return null;
  const actId = Number(event.sourceId);
  return Number.isFinite(actId) ? actId : null;
}

export function cultureLegacyIdFromActId(actId: string | number): string {
  return `culture:${actId}`;
}

export function legacyActIdFromEventId(id: string): string | null {
  if (id.startsWith("culture:")) {
    return id.slice("culture:".length);
  }
  return null;
}
