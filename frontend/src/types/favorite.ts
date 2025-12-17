// 收藏時額外帶的活動資料（用於 GAS + LINE）
export interface FavoriteExtraPayload {
  eventTitle?: string; // UI optional, server will fallback
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventUrl?: string;
  imageUrl?: string;
}

// Server 端 toggle favorite 完整 payload
export interface ToggleFavoritePayload extends FavoriteExtraPayload {
  userId: string;
  eventId: string;
  lineUserId?: string;
}

// Repo 寫入 GAS 時需要的最小必要資料
export interface ToggleFavoriteRepoParams {
  userId: string;
  eventId: string;
  eventTitle?: string; // ✅ repo 層一定要
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventUrl?: string;
}

// 收藏紀錄
export interface FavoriteRecord {
  userId: string;
  eventId: string;
  eventTitle: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventUrl?: string;
  createdAt?: string;
}

export interface ListFavoritesResponse {
  favorites: FavoriteRecord[];
}
