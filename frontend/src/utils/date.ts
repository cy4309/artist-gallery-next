// 日期ISO標準化存進資料庫
export function toISODateTime(input?: string): string {
  if (!input) return "";

  const d = new Date(input); // 可解析 "Nov 14, 2025 12:00:00 AM"
  if (Number.isNaN(d.getTime())) {
    console.warn("[toISODateTime] invalid date:", input);
    return "";
  }

  return d.toISOString();
}

// 供ISO轉ui使用
export function formatDateSmart(
  isoString?: string,
  options?: {
    locale?: string;
    timeZone?: string;
    dateOnlyFormat?: Intl.DateTimeFormatOptions;
    dateTimeFormat?: Intl.DateTimeFormatOptions;
  }
): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const {
    locale = "zh-TW",
    timeZone = "Asia/Taipei",
    dateOnlyFormat = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
    dateTimeFormat = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  } = options || {};

  // 🔑 先用「台灣時區 + 24h 制」判斷是否為 00:00
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // ⭐ 關鍵
  }).formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;

  const isMidnight = hour === "00" && minute === "00";

  // 🔑 顯示時「也要」強制 24 小時制
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour12: false, // ⭐⭐⭐ 關鍵修正
    ...(isMidnight ? dateOnlyFormat : dateTimeFormat),
  });

  return formatter.format(date);
}
