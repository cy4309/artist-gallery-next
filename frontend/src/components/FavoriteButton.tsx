"use client";

import { useUser } from "@/hooks/useUser";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

export interface FavoriteButtonProps {
  eventId: string;
  eventTitle?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventUrl?: string;
  imageUrl?: string;
  onUnfavorite?: () => void; // ⭐ 用於 /favorites 立即移除卡片
}

export default function FavoriteButton({
  eventId,
  eventTitle,
  eventStartDate,
  eventEndDate,
  eventLocation,
  eventUrl,
  imageUrl,
  onUnfavorite,
}: FavoriteButtonProps) {
  const {
    user,
    loading: userLoading,
    loadUser,
    openLoginModal,
    favorites,
    toggleFavoriteWithSync,
  } = useUser();
  const isFavorite = user ? favorites.includes(eventId) : false;

  async function handleClick() {
    if (userLoading) return;

    let currentUser = user; // 用「區域變數」鎖定登入後的 user

    // ⭐ 未登入 → 必須跳 /auth
    if (!currentUser) {
      currentUser = await loadUser();
      if (!currentUser) {
        openLoginModal({
          afterLoginAction: {
            type: "favorite",
            eventId,
            returnTo: window.location.pathname + window.location.search,
          },
        });
        return;
      }
    }

    // ⭐ 記住點擊前狀態（關鍵）
    const wasFavorited = isFavorite;

    // ⭐ 已登入 → 切換收藏，樂觀更新Optimistic UI
    await toggleFavoriteWithSync(currentUser.id, eventId, {
      eventTitle,
      eventStartDate,
      eventEndDate,
      eventLocation,
      eventUrl,
      imageUrl,
    });

    // ⭐ 只在「取消收藏」時，通知父層立刻移除卡片
    if (wasFavorited) {
      onUnfavorite?.();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={userLoading}
      className={`px-3 py-2 rounded-lg transition-all ${
        isFavorite
          ? "bg-red-500 text-white shadow-lg"
          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
      }`}
    >
      {isFavorite ? (
        <HeartFilled className="text-xl" />
      ) : (
        <HeartOutlined className="text-xl" />
      )}
    </button>
  );
}
