export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl: string | null;
}

export interface InitUser {
  id: string; // google_xxx | line_xxx（系統主鍵）
  provider: "google" | "line";
  lineUserId: string; // LINE 推播用，Google 使用者為 ""
  email: string;
  name: string;
  picture: string;
  created_at?: string;
  updated_at?: string;
}

export interface FavoriteExtraPayload {
  eventTitle?: string; // UI optional, server will fallback
  imageUrl?: string;
  dateText?: string;
  locationText?: string;
  eventUrl?: string;
}
