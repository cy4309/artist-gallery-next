"use client";

import { createContext, useContext, useEffect, useState } from "react";
import liff from "@line/liff";
import type { LiffProfile } from "@/types/enum";

interface LiffContextType {
  profile: LiffProfile | null;
  loginWithLine: () => void;
  isInClient: boolean;
  loading: boolean;
  error: string | null;
}

export const LiffContext = createContext<LiffContextType | null>(null);

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [isInClient, setIsInClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // ① 初始化 LIFF
  // -----------------------------
  useEffect(() => {
    async function initLiff() {
      try {
        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID!,
          withLoginOnExternalBrowser: false,
        });

        const insideLine = liff.isInClient();
        setIsInClient(insideLine);

        // A. 在 LINE App 裡的情況
        if (insideLine) {
          if (!liff.isLoggedIn()) {
            console.log("[LIFF] In LINE client, not logged in → login");
            liff.login({
              redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth`,
            });
            return;
          }

          const pf = await liff.getProfile();
          console.log("[LIFF] In client, profile:", pf);

          setProfile({
            userId: pf.userId,
            displayName: pf.displayName,
            pictureUrl: pf.pictureUrl ?? null,
          });
        } else {
          // B. 在「瀏覽器」裡的情況（包括 /auth 回跳）
          console.log("[LIFF] Running in external browser");

          // 若已經登入（從 LINE Login 回跳）→ 直接取 profile
          if (liff.isLoggedIn()) {
            const pf = await liff.getProfile();
            console.log("[LIFF] Browser, logged in, profile:", pf);

            setProfile({
              userId: pf.userId,
              displayName: pf.displayName,
              pictureUrl: pf.pictureUrl ?? null,
            });
          } else {
            // 沒登入就靜靜等使用者按 Sign in with LINE
            console.log("[LIFF] Browser, not logged in yet");
          }
        }
      } catch (e: any) {
        console.error("LIFF 初始化錯誤:", e);
        setError(e?.message ?? "LIFF init failed");
      } finally {
        setLoading(false);
      }
    }

    initLiff();
  }, []);

  // -----------------------------
  // ② Profile → 同步到後端，寫 cyc_user cookie
  // -----------------------------
  useEffect(() => {
    if (!profile) return;

    async function syncToBackend() {
      try {
        const res = await fetch("/api/auth/login-line", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });

        const data = await res.json();
        console.log("[LINE Login Backend]", data);
      } catch (err) {
        console.error("[LINE backend sync FAILED]", err);
      }
    }

    syncToBackend();
  }, [profile]);

  // -----------------------------
  // ③ 外部瀏覽器用的 LINE Login 按鈕
  // -----------------------------
  function loginWithLine() {
    if (typeof window === "undefined") return;

    // 記錄 returnTo（包含 query）
    localStorage.setItem(
      "returnTo",
      window.location.pathname + window.location.search
    );

    console.log("[LIFF] Manual login triggered");

    liff.login({
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth`,
    });
  }

  return (
    <LiffContext.Provider
      value={{ profile, loginWithLine, isInClient, loading, error }}
    >
      {children}
    </LiffContext.Provider>
  );
}

export function useLiffProfile() {
  const ctx = useContext(LiffContext);
  if (!ctx)
    throw new Error("useLiffProfile must be used inside <LiffProvider>");
  return ctx.profile;
}

export function useLiff() {
  const ctx = useContext(LiffContext);
  if (!ctx) throw new Error("useLiff must be used inside <LiffProvider>");
  return ctx;
}
