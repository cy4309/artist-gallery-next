//* service =「做事情的流程」，特徵可以呼叫 repo + 第三方 service（LINE），「把多個動作串成一個產品行為」

import { toggleFavorite } from "../repo/favoriteRepo";
import { pushFavoriteFlexMessage } from "@/services/line/messaging";
import type {
  ToggleFavoritePayload,
  ToggleFavoriteRepoParams,
} from "@/types/favorite";

export async function toggleFavoriteAndNotify(
  payload: ToggleFavoritePayload
): Promise<{ isFavorite: boolean }> {
  const {
    userId,
    eventId,
    eventTitle,
    eventStartDate,
    eventEndDate,
    eventLocation,
    eventUrl,
    lineUserId,
    imageUrl,
  } = payload;

  // ⭐ 只把 repo 真正需要的東西丟下去
  const repoParams: ToggleFavoriteRepoParams = {
    userId,
    eventId,
    eventTitle,
    eventStartDate,
    eventEndDate,
    eventLocation,
    eventUrl,
    imageUrl,
  };

  const isFavorite = await toggleFavorite(repoParams);

  // ⭐ 只有「新增收藏」才需要完整資料、才推播
  if (isFavorite && lineUserId && eventTitle) {
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

  return { isFavorite };
}
