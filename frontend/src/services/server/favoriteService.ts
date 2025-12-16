//* service =「做事情的流程」，特徵可以呼叫 repo + 第三方 service（LINE），「把多個動作串成一個產品行為」

import { toggleFavorite } from "../repo/favoriteRepo";
import { pushFavoriteFlexMessage } from "@/services/line/messaging";

interface ToggleFavoritePayload {
  userId: string;
  eventId: string;
  lineUserId?: string;
  eventTitle?: string;
  imageUrl?: string;
  dateText?: string;
  locationText?: string;
  eventUrl?: string;
}

export async function toggleFavoriteAndNotify(payload: ToggleFavoritePayload) {
  const {
    userId,
    eventId,
    lineUserId,
    eventTitle,
    imageUrl,
    dateText,
    locationText,
    eventUrl,
  } = payload;

  const isFavorite = await toggleFavorite(userId, eventId);
  const canNotify = isFavorite && lineUserId && eventTitle;

  if (canNotify) {
    try {
      await pushFavoriteFlexMessage({
        lineUserId,
        title: eventTitle, // TS 現在知道一定是 string
        imageUrl,
        dateText,
        locationText,
        eventUrl,
      });
    } catch (err) {
      // ⭐ 非致命錯誤：不要影響收藏成功
      console.error("[LINE notify failed]", err);
    }
  }

  return { isFavorite };
}

// export async function toggleFavorite(userId: string, eventId: string) {
//   const res = await fetch(process.env.NEXT_PUBLIC_GAS_URL!, {
//     method: "POST",
//     body: JSON.stringify({
//       action: "toggleFavorite",
//       userId,
//       eventId,
//     }),
//   });

//   const data = await res.json();
//   if (!data.success) throw new Error("Failed to toggle favorite");
//   return data.isFavorite; // true / false
// }

// export async function checkFavorite(userId: string, eventId: string) {
//   const res = await fetch(process.env.NEXT_PUBLIC_GAS_URL!, {
//     method: "POST",
//     body: JSON.stringify({
//       action: "checkFavorite",
//       userId,
//       eventId,
//     }),
//   });

//   const data = await res.json();
//   return data.isFavorite;
// }

// export async function ensureFavorite(userId: string, eventId: string) {
//   return fetch(process.env.NEXT_PUBLIC_GAS_URL!, {
//     method: "POST",
//     body: JSON.stringify({
//       action: "ensureFavorite",
//       userId,
//       eventId,
//     }),
//   });
// }

// export async function listFavorites(userId: string) {
//   const res = await fetch(process.env.NEXT_PUBLIC_GAS_URL!, {
//     method: "POST",
//     cache: "no-store",
//     body: JSON.stringify({
//       action: "listFavorites",
//       userId,
//     }),
//   });

//   const data = await res.json();
//   return data;
// }
