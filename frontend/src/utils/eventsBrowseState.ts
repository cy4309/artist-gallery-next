/** 從活動詳情返回時還原列表捲動位置（session 內有效） */

export type EventsBrowseState = {
  source: "mobile" | "desktop";
  mode: "city" | "search";
  city?: string;
  searchQuery?: string;
  scrollY: number;
};

const BROWSE_KEY = "cyc-events-browse";

/** 導覽列點「活動」時廣播，讓 /events 回到初始狀態 */
export const EVENTS_NAV_RESET_EVENT = "cyc-events-nav-reset";

/** 實際捲動容器：layout 的 <main overflow-y-auto>，不是 window */
export function getEventsScrollRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector("main");
}

export function captureEventsScrollY(): number {
  const root = getEventsScrollRoot();
  if (root) return root.scrollTop;
  if (typeof window === "undefined") return 0;
  return window.scrollY || document.documentElement.scrollTop || 0;
}

export function restoreEventsScrollY(y: number): void {
  const root = getEventsScrollRoot();
  if (root) {
    root.scrollTop = y;
    return;
  }
  if (typeof window !== "undefined") {
    window.scrollTo({ top: y, behavior: "auto" });
  }
}

export function saveEventsBrowseState(state: EventsBrowseState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BROWSE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}

export function loadEventsBrowseState(): EventsBrowseState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BROWSE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EventsBrowseState;
    if (!parsed || typeof parsed.scrollY !== "number") return null;
    if (parsed.source !== "mobile" && parsed.source !== "desktop") return null;
    if (parsed.mode !== "city" && parsed.mode !== "search") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearEventsBrowseState(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BROWSE_KEY);
}

/** 導覽進入活動頁：清掉縣市／捲動還原，並通知頁面重置 */
export function requestEventsNavReset(): void {
  clearEventsBrowseState();
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENTS_NAV_RESET_EVENT));
}
