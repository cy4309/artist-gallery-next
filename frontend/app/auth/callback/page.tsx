"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { toggleFavorite } from "@/services/favoriteService";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loadUserFromCookie } = useUser();
  const executed = useRef(false); // ⭐ 防止執行兩次

  useEffect(() => {
    async function run() {
      if (executed.current) return; // ⭐ 避免第二次執行
      executed.current = true;

      const user = loadUserFromCookie();
      if (!user) {
        router.push("/auth");
        return;
      }

      const pending = localStorage.getItem("afterLoginAction");

      if (pending) {
        const action = JSON.parse(pending);

        if (action.type === "favorite") {
          await toggleFavorite(user.id, action.eventId);
        }

        // const returnTo = action.returnTo || "/";

        localStorage.removeItem("afterLoginAction");

        // router.push(returnTo);
        router.push("/favorites");
        return;
      }

      router.replace("/");
    }

    run();
  }, []);

  return <LoadingIndicator />;
}
