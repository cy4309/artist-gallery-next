//* repo =「跟資料來源說話」，特徵只做 CRUD，「唯一可以跟資料來源說話的地方」
import type {
  ToggleFavoriteRepoParams,
  ListFavoritesResponse,
} from "@/types/favorite";

const GAS_URL = process.env.GAS_URL!;

export async function toggleFavorite(
  params: ToggleFavoriteRepoParams
): Promise<boolean> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "toggleFavorite",
      ...params,
    }),
  });

  if (!res.ok) {
    throw new Error("toggleFavorite GAS request failed");
  }

  const data = await res.json();
  if (!data?.success) {
    throw new Error("toggleFavorite GAS logic failed");
  }

  return Boolean(data.isFavorite);
}

export async function checkFavorite(
  userId: string,
  eventId: string
): Promise<boolean> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "checkFavorite",
      userId,
      eventId,
    }),
  });

  if (!res.ok) {
    throw new Error("checkFavorite GAS request failed");
  }

  const data = await res.json();
  return Boolean(data.isFavorite);
}

export async function ensureFavorite(
  userId: string,
  eventId: string
): Promise<void> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "ensureFavorite",
      userId,
      eventId,
    }),
  });

  if (!res.ok) {
    throw new Error("ensureFavorite GAS request failed");
  }
}

export async function listFavorites(
  userId: string
): Promise<ListFavoritesResponse> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "listFavorites",
      userId,
    }),
  });

  if (!res.ok) {
    throw new Error("listFavorites GAS request failed");
  }

  return res.json();
}
