//* service =「做事情的流程」，特徵可以呼叫 repo + 第三方 service（LINE），「把多個動作串成一個產品行為」

import { pushFavoriteFlexMessage } from "@/services/line/messaging";
import type { ToggleFavoriteServerPayload } from "@/types/favorite/server";

export async function toggleFavoriteAndNotify(
  payload: ToggleFavoriteServerPayload & {
    isFavorite: boolean;
    lineUserId?: string;
  }
) {
  const {
    isFavorite,
    lineUserId,
    eventTitle,
    eventStartDate,
    eventEndDate,
    eventLocation,
    eventUrl,
    imageUrl,
  } = payload;

  // ⭐ 只有「新增收藏」才需要完整資料、才推播
  if (!isFavorite || !lineUserId || !eventTitle) return;

  try {
    await pushFavoriteFlexMessage({
      title: eventTitle,
      eventStartDate,
      eventEndDate,
      eventLocation,
      eventUrl,
      lineUserId,
      imageUrl,
    });
  } catch (err) {
    // 非致命錯誤，不影響收藏成功
    console.error("[LINE notify failed]", err);
  }
}
