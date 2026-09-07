/** 活動詳情找不到時的中文文案（測試對齊；UI 走 t.events.notFound） */
export const EVENT_NOT_FOUND_MESSAGE = "找不到這個活動";

export function isEventDetailNotFound(
  status: "loading" | "success" | "error",
  event: unknown,
): boolean {
  return status === "success" && !event;
}
