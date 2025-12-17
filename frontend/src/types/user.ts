export type AuthProvider = "google" | "line";

export interface User {
  id: string;
  provider: AuthProvider;
  name: string;
  picture: string;
  email?: string;
  lineUserId?: string;
}

export interface UserInitPayload {
  id: string; // google_xxx | line_xxx（系統主鍵）
  provider: AuthProvider;
  lineUserId: string; // LINE 推播用，Google 使用者為 ""
  email: string;
  name: string;
  picture: string;
  created_at?: string;
  updated_at?: string;
}
