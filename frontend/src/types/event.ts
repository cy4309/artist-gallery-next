export type EventSource = "culture" | "ntpc";

/** 統一活動格式（多來源整合後） */
export interface CanonicalEvent {
  id: string;
  source: EventSource;
  sourceId?: string;
  title: string;
  startTime: string;
  endTime: string;
  cityName: string;
  address: string;
  description: string;
  website: string;
  imageUrl: string;
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
