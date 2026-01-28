"use client";

import { createContext, useContext, useEffect, useState } from "react";
// import { useLiffProfile } from "@/components/LiffProvider";
import { FavoriteExtraPayload } from "@/types/favorite/shared";
import { User } from "@/types/user";
import { fetchCurrentUser } from "@/services/client/authClient";
import {
  toggleFavoriteClient,
  fetchFavoriteList,
} from "@/services/client/favoriteClient";

type AfterLoginAction =
  | {
      type: "favorite";
      returnTo?: string;
      payload: {
        eventId: string;
        eventTitle?: string;
        eventStartDate?: string;
        eventEndDate?: string;
        eventLocation?: string;
        eventUrl?: string;
        imageUrl?: string;
      };
    }
  | {
      type: "calendar";
      returnTo?: string;
    };

interface UserContextType {
  user: User | null;
  loading: boolean;
  loadUser: () => Promise<User | null>;
  loadUserFromCookie: () => User | null;
  openLoginModal: (opts?: { afterLoginAction?: AfterLoginAction }) => void;
  favorites: string[];
  reloadFavorites: () => Promise<void>;
  logout: () => void;
  toggleFavoriteOptimistic: (eventId: string) => void;
  toggleFavoriteWithSync: (
    eventId: string,
    extra?: FavoriteExtraPayload,
  ) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  // const lineProfile = useLiffProfile(); // ⭐⭐ 來自 LIFF 的 LINE Profile（若不是從 LINE 開啟則為 null）
  const [initialized, setInitialized] = useState(false);

  /**************************************************
   * 1) Server-side 檢查登入狀態 (/api/auth/check-cyc-cookies)
   **************************************************/
  async function loadUser(): Promise<User | null> {
    // ⭐ 已經跑過就不要再跑
    if (initialized) return user;

    setInitialized(true);
    setLoading(true);

    try {
      const data = await fetchCurrentUser();
      setUser(data.user || null);

      if (data.user) {
        await reloadFavorites();
      }
      setLoading(false);

      return data.user || null;
    } catch (err) {
      console.error("Failed to load user:", err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**************************************************
   * 2) 前端直接讀 cookie 中的 cyc_session（Auth Callback 用）
   **************************************************/
  function loadUserFromCookie(): User | null {
    try {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("cyc_user="));

      if (!cookie) return null;

      const value = decodeURIComponent(cookie.split("=")[1]);
      const parsed = JSON.parse(value);

      // ⭐ 同步寫進 UserContext
      setUser(parsed);
      return parsed;
    } catch (err) {
      console.error("Failed to parse cyc_session:", err);
      return null;
    }
  }

  /**************************************************
   * 3) 開啟登入（帶 afterLoginAction）
   **************************************************/
  function openLoginModal(options?: { afterLoginAction?: AfterLoginAction }) {
    if (options?.afterLoginAction) {
      localStorage.setItem(
        "afterLoginAction",
        JSON.stringify(options.afterLoginAction),
      );
    }

    window.location.href = "/auth";
  }

  async function reloadFavorites() {
    try {
      const { favorites } = await fetchFavoriteList();
      setFavorites(favorites.map((f) => String(f.eventId)));
    } catch (err) {
      console.error("reloadFavorites error:", err);
      setFavorites([]);
    }
  }

  function logout() {
    setUser(null);
    setFavorites([]);
  }

  function toggleFavoriteOptimistic(eventId: string) {
    setFavorites((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId],
    );
  }

  async function toggleFavoriteWithSync(
    eventId: string,
    extra?: FavoriteExtraPayload,
  ) {
    // ⭐ 1️⃣ 樂觀更新 UI（立刻）
    toggleFavoriteOptimistic(eventId);

    try {
      // await toggleFavorite(userId, eventId); // ★ 你的 API 呼叫
      // await reloadFavorites(); // ★ 讓前後一致
      // ⭐ 2️⃣ 改成打 Server API（唯一 toggle）
      const data = await toggleFavoriteClient({
        eventId,
        ...extra,
      });

      if (!data.success) {
        throw new Error("toggleFavorite failed");
      }

      // ⭐ 3️⃣ 用 Server 為準，校正一次
      // await reloadFavorites(userId);
    } catch (err) {
      console.error("toggleFavorite failed, rolling back");
      // ⭐ 4️⃣ rollback（Server 失敗才會走到這）
      toggleFavoriteOptimistic(eventId);
    }
  }

  /**************************************************
   * ⭐⭐ 核心：若有 LIFF Profile → 自動 LINE Login 登入後端
   **************************************************/
  // useEffect(() => {
  //   async function loginWithLine() {
  //     if (!lineProfile) return; // ⭐ TS 知道之後不是 null

  //     const { userId, displayName, pictureUrl } = lineProfile;

  //     try {
  //       const res = await fetch("/api/auth/login-line", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           lineUserId: userId,
  //           name: displayName,
  //           picture: pictureUrl,
  //         }),
  //       });

  //       const data = await res.json();
  //       if (data.user) {
  //         setUser(data.user);
  //         reloadFavorites(data.user.id);
  //       }

  //       setLoading(false);
  //     } catch (err) {
  //       console.error("LINE login failed:", err);
  //     }
  //   }

  //   loginWithLine();
  // }, [lineProfile]);

  /**************************************************
   * 初始化讀 user（server-side session）
   **************************************************/
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        favorites,
        reloadFavorites,
        loading,
        loadUser,
        loadUserFromCookie, // ⭐ 新增回傳
        openLoginModal,
        logout,
        toggleFavoriteOptimistic,
        toggleFavoriteWithSync,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**************************************************
 * Hook：安全使用 UserContext
 **************************************************/
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
