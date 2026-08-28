export type EventSource = "culture" | "ntpc";

/** 活動圖片來源：official=API 原圖；og=官網 og:image；search=關鍵字搜圖（Phase 2） */
export type EventImageSource = "official" | "og" | "search";

/** 統一活動格式（多來源整合後） */
export interface CanonicalEvent {
  id: string;
  source: EventSource;
  sourceId?: string;
  /** festival | 1–17 | ntpc */
  category?: string;
  title: string;
  startTime: string;
  endTime: string;
  cityName: string;
  address: string;
  description: string;
  website: string;
  imageUrl: string;
  imageSource?: EventImageSource;
  syncedAt: string;
}

/**
 * 前端 UI 仍使用的格式（相容層）。
 * 新資料由 CanonicalEvent mapper 產出；文化部舊格式也吻合。
 */
export interface OrgEvent {
  /** canonical id，例如 culture:924 / ntpc:abc */
  id: string;
  source?: EventSource;
  category?: string;
  actId: number;
  cityName: string;
  actName: string;
  startTime: string;
  endTime: string;
  address: string;
  imageUrl: string;
  description: string;
  website: string;
}
