// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useUser } from "@/hooks/useUser";
// import { toggleFavorite } from "@/services/favoriteService";

// export default function CallbackPage() {
//   const router = useRouter();
//   const { loadUser } = useUser();

//   useEffect(() => {
//     async function run() {
//       const user = await loadUser();
//       const pending = localStorage.getItem("afterLoginAction");

//       if (pending && user) {
//         const action = JSON.parse(pending);

//         if (action.type === "favorite") {
//           await toggleFavorite(user.id, action.eventId);
//         }

//         localStorage.removeItem("afterLoginAction");
//       }

//       // router.refresh();
//       // router.back();
//       router.replace("/"); // ⭐ 避免 router.back 再觸發 FavoriteButton
//     }

//     run();
//   }, []);

//   return <div>登入中...</div>;
// }

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { toggleFavorite } from "@/services/favoriteService";

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

        const returnTo = action.returnTo || "/";

        localStorage.removeItem("afterLoginAction");

        router.push(returnTo);
        return;
      }

      router.replace("/");
    }

    run();
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center">
      登入中…
    </div>
  );
}
