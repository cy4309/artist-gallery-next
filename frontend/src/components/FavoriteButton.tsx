"use client";

import { useState, useEffect } from "react";
import { toggleFavorite, checkFavorite } from "@/services/favoriteService";
import { useUser } from "@/hooks/useUser";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

export default function FavoriteButton({ eventId }: { eventId: string }) {
  const {
    user,
    loading: userLoading,
    openLoginModal,
    favorites,
    reloadFavorites,
  } = useUser();
  const [pending, setPending] = useState(false);
  const isFavorite = user ? favorites.includes(eventId) : false;

  // async function handleClick() {
  //   if (userLoading) return;

  //   if (!user) {
  //     openLoginModal({
  //       afterLoginAction: {
  //         type: "favorite",
  //         eventId,
  //       },
  //     });
  //     return;
  //   }

  //   setPending(true);
  //   try {
  //     await toggleFavorite(user.id, eventId);
  //     await reloadFavorites(); // ⭐ 更新全域 favorites 狀態
  //   } finally {
  //     setPending(false);
  //   }

  async function handleClick() {
    if (userLoading || pending) return;

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

    // ⭐ 已登入 → 切換收藏
    setPending(true);
    await toggleFavorite(user.id, eventId);
    await reloadFavorites();
    setPending(false);

    // ---- Optimistic Update ----
    // const previous = isFavorite;
    // setIsFavorite(!previous);
    // try {
    //   const res = await toggleFavorite(user.id, eventId);
    //   // 最終狀態以 GAS 回傳為準（避免不同裝置衝突）
    //   setIsFavorite(res.isFavorite);
    // } catch (err) {
    //   console.error("toggleFavorite failed:", err);
    //   // 🛑 一旦失敗 → 回復到原本狀態
    //   setIsFavorite(previous);
    // }
  }

  // 如果 UserProvider 還在載入 → 不要跑 FavoriteButton 邏輯
  // if (userLoading) {
  //   return (
  //     <button className="px-3 py-2 opacity-50 cursor-wait bg-gray-300 rounded-lg">
  //       <HeartOutlined className="text-xl" />
  //     </button>
  //   );
  // }

  return (
    <button
      onClick={handleClick}
      disabled={userLoading || pending}
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
