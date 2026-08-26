import { favoriteIdAliases } from "@/utils/eventId";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { postToDataBackend } from "@/services/server/dataBackendClient";

async function checkFavoriteRaw(
  userId: string,
  eventId: string,
): Promise<boolean> {
  const data = await postToDataBackend<{ isFavorite?: boolean }>({
    action: GAS_ACTION.CHECK_FAVORITE,
    userId,
    eventId,
  });
  return Boolean(data?.isFavorite);
}

/**
 * 解析實際應寫入／刪除的 eventId：
 * - 若任一別名已收藏 → 回傳已存的那個（用來取消）
 * - 否則回傳呼叫端傳入的 canonical id（用來新增）
 */
export async function resolveFavoriteEventId(
  userId: string,
  eventId: string,
): Promise<string> {
  const aliases = favoriteIdAliases(eventId);

  for (const alias of aliases) {
    if (await checkFavoriteRaw(userId, alias)) {
      return alias;
    }
  }

  return eventId;
}

export async function isFavoriteWithAliases(
  userId: string,
  eventId: string,
): Promise<boolean> {
  const aliases = favoriteIdAliases(eventId);
  for (const alias of aliases) {
    if (await checkFavoriteRaw(userId, alias)) return true;
  }
  return false;
}
