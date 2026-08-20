/** 以台灣時區判斷活動是否仍有效（結束日當天仍算有效） */

function taiwanDateKey(input?: string | Date): string | null {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
}

/** 結束日（台灣日曆）是否早於今天 → 已過期 */
export function isEventExpired(endTime?: string): boolean {
  const endKey = taiwanDateKey(endTime);
  if (!endKey) return false; // 無結束日：不過濾掉

  const todayKey = taiwanDateKey(new Date());
  if (!todayKey) return false;

  return endKey < todayKey;
}

export function isEventActive(endTime?: string): boolean {
  return !isEventExpired(endTime);
}

export function filterActiveEvents<T extends { endTime?: string }>(
  events: T[],
): T[] {
  return events.filter((event) => isEventActive(event.endTime));
}
