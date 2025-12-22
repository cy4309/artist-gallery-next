"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { ensureFavorite } from "@/services/repo/favoriteRepo";
import { event } from "@/helpers/ga";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loadUserFromCookie } = useUser();
  const executed = useRef(false); // ⭐ 防止執行兩次

  useEffect(() => {
    async function run() {
      if (executed.current) return; // ⭐ 避免第二次執行
      executed.current = true;

      const user = loadUserFromCookie();
      // console.log(user);
      if (!user) {
        router.push("/auth");
        return;
      }

      // ✅ ⭐ 登入成功 → 送 GA（只送一次）
      event({
        action: "login",
        category: "auth",
        label: user.provider, // "google" | "line"
      });

      const pending = localStorage.getItem("afterLoginAction");
      if (pending) {
        const action = JSON.parse(pending);

        if (action.type === "favorite") {
          await ensureFavorite(user.id, action.eventId);
        }

        localStorage.removeItem("afterLoginAction");
        // const returnTo = action.returnTo || "/";
        // router.push("/favorites");
        router.replace(action.returnTo || "/favorites");
        return;
      }

      // router.replace("/");
      // ⭐ 沒有 pending action → 用 URL returnTo
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo") || "/";

      router.replace(returnTo);
    }

    run();
  }, []);
}
