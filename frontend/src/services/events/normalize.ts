import { createHash } from "node:crypto";
import { toCityName } from "@/utils/city";
import { toISODateTime } from "@/utils/date";

export function stableEventHash(parts: string[]): string {
  return createHash("sha256")
    .update(parts.join("|"))
    .digest("hex")
    .slice(0, 12);
}

export function normalizeWebsite(url?: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

export function normalizeTitle(title?: string): string {
  return (title ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

export function toEventIsoDate(
  value?: string,
  endOfDay = false,
): string {
  if (!value) return "";

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const suffix = endOfDay ? "T23:59:59+08:00" : "T00:00:00+08:00";
    return new Date(`${trimmed}${suffix}`).toISOString();
  }

  return toISODateTime(trimmed);
}

export function resolveCityName(
  cityName?: string,
  address?: string,
  fallback?: string,
): string {
  return (
    toCityName(cityName) ??
    toCityName(address) ??
    fallback ??
    ""
  );
}

/** 從新北 description 前段嘗試抽出地址（常見「標題,地址,單位,...」） */
export function extractAddressFromDescription(description?: string): string {
  if (!description) return "";

  const firstSegment = description.split(",")[0]?.trim() ?? "";
  if (/[縣市]/.test(firstSegment) && firstSegment.length <= 80) {
    return firstSegment;
  }

  const match = description.match(
    /(?:台|臺)?(?:北|新北|桃園|新竹|苗栗|中|彰化|南投|雲林|嘉義|南|高|屏東|宜蘭|花蓮|東|澎湖|金門|連江)[^,，。\n]{0,40}/,
  );

  return match?.[0]?.trim() ?? "";
}

/** 寫入 Sheet 前截斷，減輕 GAS listEvents 體積 */
export function truncateText(value?: string, max = 300): string {
  const text = (value ?? "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}
