"use client";

import { useUser } from "@/hooks/useUser";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { event } from "@/helpers/ga";
import { showConfirmSwal, showSwal } from "@/utils/notification";
import { useLocale } from "@/locales/contexts/LocaleContext";

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
  const { t } = useLocale();
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

    // ⭐ 未登入 → 跳登入
    if (!currentUser) {
      currentUser = await loadUser();
      if (!currentUser) {
        openLoginModal({
          afterLoginAction: {
            type: "favorite",
            returnTo: window.location.pathname + window.location.search,
            payload: {
              eventId,
              eventTitle,
              eventStartDate,
              eventEndDate,
              eventLocation,
              eventUrl,
              imageUrl,
            },
          },
        });
        return;
      }
    }

    const wasFavorite = favorites.includes(eventId);

    /** ------------------------------
     * ① 取消收藏 → confirm
     * ----------------------------- */
    if (wasFavorite) {
      const confirmed = await showConfirmSwal({
        title: t.notification.unfavoriteConfirm.title,
        text: t.notification.unfavoriteConfirm.text,
        confirmText: t.notification.unfavoriteConfirm.confirm,
        cancelText: t.notification.unfavoriteConfirm.cancel,
      });

      if (!confirmed) return;

      // /favorites 頁立即移除卡片
      onUnfavorite?.();
    }

    /** ------------------------------
     * ② ⭐ 樂觀 UI：立刻顯示成功提示
     * ----------------------------- */
    showSwal({
      isSuccess: true,
      title: wasFavorite
        ? t.notification.unfavoriteSuccess.title
        : t.notification.favoriteSuccess.title,
    });

    /** ------------------------------
     * ③ 背景同步 Server（失敗才 rollback）
     * ----------------------------- */
    try {
      await toggleFavoriteWithSync(eventId, {
        eventTitle,
        eventStartDate,
        eventEndDate,
        eventLocation,
        eventUrl,
        imageUrl,
      });
    } catch (err) {
      console.error("[favorite sync failed]", err);

      // ⭐ rollback UI（UserContext 裡已經有 optimistic toggle）
      // 這裡只需要再 toggle 一次
      await toggleFavoriteWithSync(eventId, {
        eventTitle,
        eventStartDate,
        eventEndDate,
        eventLocation,
        eventUrl,
        imageUrl,
      });

      // showSwal({
      //   isSuccess: false,
      //   title: t.notification.favoriteError.title,
      // });
    }

    /** ------------------------------
     * ④ GA
     * ----------------------------- */
    event({
      action: wasFavorite ? "remove_favorite" : "add_favorite",
      category: "engagement",
      label: eventId,
    });
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
