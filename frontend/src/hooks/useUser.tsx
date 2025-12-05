// "use client";

// import { createContext, useContext, useEffect, useState } from "react";

// interface User {
//   id: string;
//   email: string;
//   name: string;
//   picture: string;
// }

// interface AfterLoginAction {
//   type: "favorite" | "calendar";
//   eventId?: string;
//   eventName?: string;
// }

// interface UserContextType {
//   user: User | null;
//   loading: boolean;
//   loadUser: () => Promise<User | null>;
//   openLoginModal: (opts?: { afterLoginAction?: AfterLoginAction }) => void;
// }

// const UserContext = createContext<UserContextType | null>(null);

// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true); // ⭐ 避免無限登入

//   async function loadUser(): Promise<User | null> {
//     try {
//       const res = await fetch("/api/auth/me", { cache: "no-store" });
//       const data = await res.json();

//       setUser(data.user || null);
//       setLoading(false);
//       return data.user || null;
//     } catch (err) {
//       console.error("Failed to load user:", err);
//       setUser(null);
//       setLoading(false);
//       return null;
//     }
//   }

//   function openLoginModal(options?: { afterLoginAction?: AfterLoginAction }) {
//     if (options?.afterLoginAction) {
//       localStorage.setItem(
//         "afterLoginAction",
//         JSON.stringify(options.afterLoginAction)
//       );
//     }

//     window.location.href = "/api/auth/login";
//   }

//   useEffect(() => {
//     loadUser();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, loading, loadUser, openLoginModal }}>
//       {children}
//     </UserContext.Provider>
//   );
// }

// export function useUser() {
//   const ctx = useContext(UserContext);
//   if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
//   return ctx;
// }

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { listFavorites } from "@/services/favoriteService";

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
  reloadFavorites: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  /**************************************************
   * 1) Server-side 檢查登入狀態 (/api/auth/me)
   **************************************************/
  async function loadUser(): Promise<User | null> {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
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

    window.location.href = "/api/auth/login";
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
