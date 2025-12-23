//* client =「前端呼叫 API 的代理」，特徵有 fetch('/api/...')，「幫 React 呼叫後端 API 的薄包裝」

import type {
  ToggleFavoriteClientPayload,
  ToggleFavoriteClientResponse,
} from "@/types/favorite/client";
import type { ListFavoritesResponse } from "@/types/favorite/shared";

export async function toggleFavoriteClient(
  payload: ToggleFavoriteClientPayload
): Promise<ToggleFavoriteClientResponse> {
  const res = await fetch("/api/favorites/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("toggleFavoriteClient failed");
  return res.json();
}

export async function checkFavoriteClient(eventId: string): Promise<boolean> {
  const res = await fetch(`/api/favorites/check?eventId=${eventId}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("checkFavoriteClient failed");
  }

  const data = await res.json();
  return Boolean(data.isFavorite);
}

export async function ensureFavoriteClient(
  payload: ToggleFavoriteClientPayload
) {
  const res = await fetch("/api/favorites/ensure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "ensureFavoriteClient failed");
  }
  return data; // { success, created }
}

export async function fetchFavoriteList(): Promise<ListFavoritesResponse> {
  const res = await fetch("/api/favorites/list", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("fetchFavoriteList failed");
  // return res.json();
  const json = await res.json();
  return json.favorites ? json : { favorites: [] };
}
