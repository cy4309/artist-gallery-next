import { CanonicalEvent } from "@/types/event";
import { getEventCategoryLabel } from "@/utils/eventCategories";

const TITLE_NOISE =
  /\d{4}年?|\d{1,2}\/\d{1,2}|第\d+屆|系列|特展|聯展|個展|成果展|活動|表演|節慶|課程|場次|加場|巡迴|巡展/g;

const GENERIC_TOKENS = new Set([
  "活動",
  "表演",
  "展覽",
  "音樂會",
  "講座",
  "體驗",
  "其他",
  "新北文化局",
]);

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanTitle(title: string): string {
  return normalizeWhitespace(
    title
      .replace(/【[^】]*】/g, " ")
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/[「」『』《》（）()／/|·•\-–—_]/g, " ")
      .replace(TITLE_NOISE, " "),
  );
}

function extractVenueTokens(title: string): string[] {
  const matches = title.match(
    /[\u4e00-\u9fff]{2,10}(?:美術館|博物館|藝廊|文化中心|表演廳|音樂廳|雙年展|藝術節)/g,
  );
  return matches ? [...new Set(matches)] : [];
}

function shorten(value: string, max = 32): string {
  const text = normalizeWhitespace(value);
  if (text.length <= max) return text;
  return text.slice(0, max).trim();
}

/** 從活動欄位產生 1～4 組免費圖庫搜尋關鍵字（規則式，不用 AI） */
export function buildEventSearchKeywords(event: CanonicalEvent): string[] {
  const keywords: string[] = [];
  const title = event.title?.trim() ?? "";
  const city = event.cityName?.trim() ?? "";
  const category = getEventCategoryLabel(event) || event.category?.trim() || "";
  const cleanedTitle = cleanTitle(title);

  if (cleanedTitle.length >= 2) {
    keywords.push(shorten(cleanedTitle));
  }

  for (const venue of extractVenueTokens(title)) {
    keywords.push(city ? `${venue} ${city}` : venue);
  }

  if (city && category && !GENERIC_TOKENS.has(category)) {
    keywords.push(`${city} ${category}`);
  }

  if (city && cleanedTitle.length >= 4) {
    keywords.push(shorten(`${city} ${cleanedTitle}`, 40));
  }

  const unique = [...new Set(keywords.map((k) => normalizeWhitespace(k)))].filter(
    (k) => k.length >= 2 && !GENERIC_TOKENS.has(k),
  );

  return unique.slice(0, 4);
}
