"use client";

import { useState, useEffect } from "react";
import { toggleFavorite, checkFavorite } from "@/services/favoriteService";
import { useUser } from "@/hooks/useUser";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

export default function FavoriteButton({ eventId }: { eventId: string }) {
  const { user, loading: userLoading, openLoginModal } = useUser();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初次載入檢查是否已收藏
  useEffect(() => {
    async function load() {
      if (userLoading) return; // ⭐ 避免 user 尚未 load 就判斷錯
      if (!user) {
        setLoading(false);
        return;
      }

      const res = await checkFavorite(user.id, eventId);
      setIsFavorite(res.isFavorite);
      setLoading(false);
    }

    load();
  }, [user, eventId]);

  async function handleClick() {
    if (userLoading) return; // ⭐ 等 user load 完才可以按

    if (!user) {
      openLoginModal({
        afterLoginAction: {
          type: "favorite",
          eventId,
          returnTo: typeof window !== "undefined" ? window.location.href : "/",
        },
      });
      return;
    }

    const newState = await toggleFavorite(user.id, eventId);
    setIsFavorite(newState);

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
  if (userLoading) {
    return (
      <button className="px-3 py-2 opacity-50 cursor-wait bg-gray-300 rounded-lg">
        <HeartOutlined className="text-xl" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || userLoading}
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
