//* client =「前端呼叫 API 的代理」，特徵有 fetch('/api/...')，「幫 React 呼叫後端 API 的薄包裝」

import { FavoriteExtraPayload } from "@/types/favorite";

export type ToggleFavoriteClientPayload = {
  userId: string;
  eventId: string;
  lineUserId?: string;
} & FavoriteExtraPayload;

export type ToggleFavoriteClientResponse = {
  success: boolean;
  isFavorite?: boolean;
};

export async function toggleFavoriteClient(
  payload: ToggleFavoriteClientPayload
): Promise<ToggleFavoriteClientResponse> {
  const res = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}
