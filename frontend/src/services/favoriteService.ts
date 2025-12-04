export async function toggleFavorite(userId: string, eventId: string) {
  const res = await fetch(process.env.NEXT_PUBLIC_GAS_URL!, {
    method: "POST",
    // headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "toggleFavorite",
      userId,
      eventId,
    }),
  });

  const data = await res.json();
  if (!data.success) throw new Error("Failed to toggle favorite");
  return data.isFavorite; // true / false
}

export async function checkFavorite(userId: string, eventId: string) {
  const res = await fetch(process.env.NEXT_PUBLIC_GAS_URL!, {
    method: "POST",
    // headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "checkFavorite",
      userId,
      eventId,
    }),
  });

  const data = await res.json();
  return data.isFavorite;
}

export async function listFavorites(userId: string) {
  const res = await fetch(process.env.NEXT_PUBLIC_GAS_URL!, {
    method: "POST",
    // headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "listFavorites",
      userId,
    }),
  });

  const data = await res.json();
  return data.favorites; // [{ eventId, name }]
}
