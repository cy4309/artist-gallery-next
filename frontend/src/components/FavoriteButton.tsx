"use client";

import { useUser } from "@/hooks/useUser";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

export default function FavoriteButton({ eventId }: { eventId: string }) {
  const {
    user,
    loading: userLoading,
    openLoginModal,
    favorites,
    toggleFavoriteWithSync,
  } = useUser();
  const isFavorite = user ? favorites.includes(eventId) : false;

  async function handleClick() {
    if (userLoading) return;

    // ⭐ 未登入 → 必須跳 /auth
    if (!user) {
      openLoginModal({
        afterLoginAction: {
          type: "favorite",
          eventId,
        },
      });
      return;
    }

    // ⭐ 已登入 → 切換收藏，樂觀更新Optimistic UI
    await toggleFavoriteWithSync(user.id, eventId);
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
