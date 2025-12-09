"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { listFavorites, toggleFavorite } from "@/services/favoriteService";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AfterLoginAction {
  type: "favorite" | "calendar";
  eventId?: string;
  eventName?: string;
  returnTo?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  loadUser: () => Promise<User | null>;
  loadUserFromCookie: () => User | null;
  openLoginModal: (opts?: { afterLoginAction?: AfterLoginAction }) => void;
  favorites: string[]; // ⭐ 全域收藏列表
  reloadFavorites: (userId?: string) => Promise<void>;
  logout: () => void;
  toggleFavoriteOptimistic: (eventId: string) => void;
  toggleFavoriteWithSync: (userId: string, eventId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  /**************************************************
   * 1) Server-side 檢查登入狀態 (/api/auth/check-cyc-cookies)
   **************************************************/
  async function loadUser(): Promise<User | null> {
    try {
      const res = await fetch("/api/auth/check-cyc-cookies", {
        cache: "no-store",
      });
      const data = await res.json();

      setUser(data.user || null);
      if (data.user) {
        await reloadFavorites(data.user.id);
      }
      setLoading(false);

      return data.user || null;
    } catch (err) {
      console.error("Failed to load user:", err);
      setUser(null);
      setLoading(false);
      return null;
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
        JSON.stringify(options.afterLoginAction)
      );
    }

    window.location.href = "/auth";
  }

  async function reloadFavorites(userId?: string) {
    try {
      const uid = userId || user?.id;
      if (!uid) return;

      const res = await listFavorites(uid);

      if (!res || !Array.isArray(res.favorites)) {
        setFavorites([]);
        return;
      }

      setFavorites(res.favorites.map((f: any) => f.eventId));
    } catch (err) {
      console.error("reloadFavorites error:", err);
      setFavorites([]);
    }
  }

  function logout() {
    setUser(null);
    setFavorites([]); // 如果你有 favorites
  }

  function toggleFavoriteOptimistic(eventId: string) {
    setFavorites((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  }

  async function toggleFavoriteWithSync(userId: string, eventId: string) {
    // 1) 樂觀更新 UI
    toggleFavoriteOptimistic(eventId);

    try {
      await toggleFavorite(userId, eventId); // ★ 你的 API 呼叫
      await reloadFavorites(); // ★ 讓前後一致
    } catch (err) {
      console.error("toggleFavorite failed, rolling back");
      // 2) API 失敗 → rollback
      toggleFavoriteOptimistic(eventId);
    }
  }

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
