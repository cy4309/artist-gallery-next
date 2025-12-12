"use client";

import { createContext, useContext, useEffect, useState } from "react";
import liff from "@line/liff";

interface LiffContextType {
  isInClient: boolean; // 是否在 LINE App 內 webview
  ready: boolean; // LIFF 是否初始化完成
  error: string | null;
}

export const LiffContext = createContext<LiffContextType | null>(null);

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [isInClient, setIsInClient] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initLiff() {
      try {
        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID!,
          withLoginOnExternalBrowser: true,
        });

        setIsInClient(liff.isInClient());

        // 這邊只做一些 debug / deep link 解析就好
        console.log("[LIFF] initialized, inClient =", liff.isInClient());

        // 例如：如果你的 LIFF URL 是 /events，Next.js 本身就會接到 /events，
        // 這裡通常不需要再多做 redirect。
      } catch (e: any) {
        console.error("[LIFF init error]", e);
        setError(e?.message ?? "LIFF init failed");
      } finally {
        setReady(true);
      }
    }

    // 確保瀏覽器環境
    if (typeof window !== "undefined") {
      initLiff();
    }
  }, []);

  return (
    <LiffContext.Provider value={{ isInClient, ready, error }}>
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  const ctx = useContext(LiffContext);
  if (!ctx) throw new Error("useLiff must be used inside <LiffProvider>");
  return ctx;
}

// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import liff from "@line/liff";
// import type { LiffProfile } from "@/types/enum";
// import { useRouter } from "next/navigation";

// interface LiffContextType {
//   profile: LiffProfile | null;
//   loginWithLine: () => void;
//   isInClient: boolean;
//   loading: boolean;
//   error: string | null;
// }

// export const LiffContext = createContext<LiffContextType | null>(null);

// export function LiffProvider({ children }: { children: React.ReactNode }) {
//   const [profile, setProfile] = useState<LiffProfile | null>(null);
//   const [isInClient, setIsInClient] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const router = useRouter();

//   // ------------------------------------------------------
//   // ① 初始化 LIFF
//   // ------------------------------------------------------
//   useEffect(() => {
//     async function initLiff() {
//       try {
//         await liff.init({
//           liffId: process.env.NEXT_PUBLIC_LIFF_ID!,
//           withLoginOnExternalBrowser: true,
//         });

//         const insideLine = liff.isInClient();
//         setIsInClient(insideLine);

//         const currentPath = window.location.pathname; // for deep link
//         console.log("[LIFF] Loaded path =", currentPath);

//         // ⭐ Deep link routing：如果不是 root，就導過去
//         if (currentPath !== "/") {
//           router.replace(currentPath);
//         }

//         // -------------------------------------------------
//         // 外部瀏覽器（rich menu 開啟 / Web login）
//         // -------------------------------------------------
//         if (liff.isLoggedIn()) {
//           const pf = await liff.getProfile();
//           console.log("[LIFF] Profile loaded:", pf);

//           setProfile({
//             userId: pf.userId,
//             displayName: pf.displayName,
//             pictureUrl: pf.pictureUrl ?? null,
//           });
//         } else {
//           console.log("[LIFF] Not logged in, waiting user action");
//         }
//       } catch (err: any) {
//         console.error("LIFF init error:", err);
//         setError(err?.message ?? "LIFF init failed");
//       } finally {
//         setLoading(false);
//       }
//     }

//     initLiff();
//   }, []);

//   // ------------------------------------------------------
//   // ② Profile → 同步 GAS + 設置 cookie
//   // ------------------------------------------------------
//   useEffect(() => {
//     if (!profile) return;

//     async function syncBackend() {
//       try {
//         const res = await fetch("/api/auth/login-line", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(profile),
//         });

//         const data = await res.json();
//         console.log("[LINE Backend Sync Result]", data);

//         // ⭐ Backend 完成後再導回 returnTo
//         const returnTo =
//           localStorage.getItem("returnTo") ?? window.location.pathname ?? "/";
//         localStorage.removeItem("returnTo");

//         router.replace(returnTo);
//       } catch (err) {
//         console.error("[LINE sync FAILED]", err);
//       }
//     }

//     syncBackend();
//   }, [profile]);

//   // ------------------------------------------------------
//   // ③ 外部瀏覽器登入用的方法
//   // ------------------------------------------------------
//   function loginWithLine() {
//     if (typeof window === "undefined") return;

//     localStorage.setItem(
//       "returnTo",
//       window.location.pathname + window.location.search
//     );

//     console.log("[LIFF] Manual login");

//     // ⭐ Web Login：必須用 liff.login()，但 redirectUri 必須指向 LIFF URL
//     liff.login({
//       // redirectUri: window.location.origin, // LIFF 會自動補上 liffId
//       redirectUri: "https://cyc-zine.vercel.app/auth",
//     });
//   }

//   return (
//     <LiffContext.Provider
//       value={{ profile, loginWithLine, isInClient, loading, error }}
//     >
//       {children}
//     </LiffContext.Provider>
//   );
// }

// export function useLiffProfile() {
//   const ctx = useContext(LiffContext);
//   if (!ctx)
//     throw new Error("useLiffProfile must be used inside <LiffProvider>");
//   return ctx.profile;
// }

// export function useLiff() {
//   const ctx = useContext(LiffContext);
//   if (!ctx) throw new Error("useLiff must be used inside <LiffProvider>");
//   return ctx;
// }
