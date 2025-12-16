//* repo =「跟資料來源說話」，特徵只做 CRUD，「唯一可以跟資料來源說話的地方」

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL!;

export async function toggleFavorite(userId: string, eventId: string) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "toggleFavorite",
      userId,
      eventId,
    }),
  });

  const data = await res.json();
  if (!data.success) throw new Error("Failed to toggle favorite");

  return data.isFavorite as boolean;
}

export async function checkFavorite(userId: string, eventId: string) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "checkFavorite",
      userId,
      eventId,
    }),
  });

  const data = await res.json();
  return data.isFavorite as boolean;
}

export async function ensureFavorite(userId: string, eventId: string) {
  return fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "ensureFavorite",
      userId,
      eventId,
    }),
  });
}

export async function listFavorites(userId: string) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({
      action: "listFavorites",
      userId,
    }),
  });

  return res.json();
}
