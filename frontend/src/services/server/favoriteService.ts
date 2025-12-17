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

  // ❗ repo 層一定要 eventTitle，這裡防呆
  if (!eventTitle) {
    throw new Error("eventTitle is required for toggleFavorite");
  }

  const repoParams: ToggleFavoriteRepoParams = {
    userId,
    eventId,
    eventTitle,
    eventStartDate,
    eventEndDate,
    eventLocation,
    eventUrl,
  };

  const isFavorite = await toggleFavorite(repoParams);

  const canNotify = isFavorite && lineUserId && eventTitle;

  if (canNotify) {
    try {
      await pushFavoriteFlexMessage({
        title: eventTitle, // TS 現在知道一定是 string
        eventStartDate,
        eventEndDate,
        eventLocation,
        eventUrl,
        lineUserId,
        imageUrl,
      });
    } catch (err) {
      // ⭐ 非致命錯誤：不要影響收藏成功
      console.error("[LINE notify failed]", err);
    }
  }

  return { isFavorite };
}
