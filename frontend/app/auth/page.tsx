"use client";

import { useEffect, useState } from "react";
import BaseButton from "@/components/BaseButton";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faLine } from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/navigation";
// import { showSwal } from "@/utils/notification";

export default function AuthPage() {
  // const [isWebView, setIsWebView] = useState(false);
  const [processingCallback, setProcessingCallback] = useState(false);
  const router = useRouter();

  // ① 處理 Google Login 回調（/auth?code=...）
  useEffect(() => {
    async function handleGoogleCallback() {
      const params = new URLSearchParams(window.location.search);
      const hasCode = params.has("code");

      // 這裡我們預設只有 Google 會 redirect 到 /auth?code=...
      // （LINE Login 已經在 /api/auth/login-line 做完 redirect）
      if (!hasCode) return;

      console.log("[Auth] Detected Google callback");
      setProcessingCallback(true);

      const returnTo = localStorage.getItem("returnTo") ?? "/";
      localStorage.removeItem("returnTo");

      router.replace(returnTo);
    }

    handleGoogleCallback();
  }, [router]);

  // ③ Google Login 按鈕行為
  function loginWithGoogle() {
    const ua = navigator.userAgent.toLowerCase();
    const isWebView =
      ua.includes("line") || ua.includes("fb") || ua.includes("instagram");

    const returnTo = window.location.pathname + window.location.search;
    localStorage.setItem("returnTo", returnTo);

    if (isWebView) {
      // 在 LINE / IG / FB WebView 裡 → 自動開外部瀏覽器，再讓使用者登入 Google
      window.location.href = `${window.location.href}?openExternalBrowser=1`;
      return;
    }

    // 外部瀏覽器 → 直接走 Google OAuth Flow
    window.location.href = "/api/auth/login";
  }

  // ④ 若正在處理 callback → 顯示 Loading
  if (processingCallback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-bold mb-3">Signing you in...</p>
        <p className="text-sm text-gray-600">
          Please wait while we complete your login.
        </p>
      </div>
    );
  }

  function loginWithLine() {
    const returnTo = window.location.pathname + window.location.search;
    // 這裡不一定要用 localStorage，因為我們會透過 URL 的 ?returnTo 傳給後端做 state
    const url = `/api/auth/login-line?returnTo=${encodeURIComponent(returnTo)}`;
    window.location.href = url;
  }

  // ⑥ 正常登入畫面（你原本的 UI）
  return (
    <div className="p-4 w-full h-full flex justify-center items-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-black dark:to-slate-900">
      <div
        className="
          w-full max-w-md
          bg-white/90 dark:bg-white/5 backdrop-blur-xl
          border border-white/20 dark:border-white/10
          shadow-xl rounded-2xl 
          p-8 md:p-10
          flex flex-col items-center gap-8
        "
      >
        {/* Logo + 文案 */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/images/cyc-logo.png"
            width={64}
            height={64}
            alt="CYC logo"
            className="opacity-90"
          />
          <h1 className="text-2xl md:text-3xl font-dela tracking-wide">
            CYC Zine
          </h1>

          <h2 className="text-lg md:text-xl text-slate-600 dark:text-slate-300 text-center font-dela tracking-wide">
            Discover Taiwan’s cultural stories. Build your own inspiration map.
          </h2>

          <p className="text-slate-600 dark:text-slate-300 opacity-75 text-sm leading-6 mt-3">
            Sign in to:
            <br />⭐ Save your favorite events
            <br />
            📅 Add events to Google Calendar
            <span className="text-xs text-slate-600 dark:text-slate-300 block mt-3 opacity-75">
              * CYC Zine only uses your basic Google profile (name, email &
              avatar).
            </span>
          </p>
        </div>

        {/* LINE Login Button */}
        <BaseButton
          className="w-full text-white bg-[#00C300] hover:bg-[#00a800]"
          onClick={loginWithLine}
        >
          <FontAwesomeIcon icon={faLine} className="text-xl w-5 h-5 shrink-0" />
          <span className="font-medium ml-4">Sign in with LINE</span>
        </BaseButton>

        {/* Google Login Button */}
        <BaseButton
          className="w-full text-white bg-[#4285F4] hover:bg-[#3367D6]"
          onClick={loginWithGoogle}
        >
          <FontAwesomeIcon
            icon={faGoogle}
            className="text-xl w-5 h-5 shrink-0"
          />
          <span className="font-medium ml-4">Sign in with Google</span>
        </BaseButton>

        {/* Divider */}
        <div className="flex items-center w-full gap-4">
          <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
          <span className="text-xs text-slate-500 dark:text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Footer Text */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-6">
          By signing in, you agree to our{" "}
          <Link
            href="/privacy"
            className="underline cursor-pointer hover:opacity-70"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/terms"
            className="underline cursor-pointer hover:opacity-70"
          >
            Terms of Use
          </Link>
        </p>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import BaseButton from "@/components/BaseButton";
// import Image from "next/image";
// import Link from "next/link";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGoogle, faLine } from "@fortawesome/free-brands-svg-icons";
// import { useRouter } from "next/navigation";
// // import { showSwal } from "@/utils/notification";

// export default function AuthPage() {
//   // const [isWebView, setIsWebView] = useState(false);
//   const [processingCallback, setProcessingCallback] = useState(false);
//   const router = useRouter();

//   // --------------------------------------------------------
//   // ② 掛載：如果剛從外部瀏覽器回來（openExternalBrowser=1）
//   //    而且 pendingGoogleLogin = 1 → 自動開啟 Google OAuth
//   // --------------------------------------------------------
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const open = params.get("openExternalBrowser");
//     const pendingGoogle = localStorage.getItem("pendingGoogleLogin") === "1";

//     if (open === "1" && pendingGoogle) {
//       console.log("[Auth] Auto continue Google flow after external browser.");

//       // 清除 pending flag（避免回圈）
//       localStorage.removeItem("pendingGoogleLogin");

//       // 清掉 query
//       params.delete("openExternalBrowser");
//       const cleanUrl =
//         window.location.pathname +
//         (params.toString() ? `?${params.toString()}` : "");
//       window.history.replaceState({}, "", cleanUrl);

//       // 轉到 Google OAuth
//       window.location.href = "/api/auth/login";
//     }
//   }, []);

//   // --------------------------------------------------------
//   // ③ 判斷 callback 是 Google 還是 LINE
//   // --------------------------------------------------------
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const hasCode = params.has("code");

//     if (!hasCode) {
//       // 完全不是 callback
//       return;
//     }

//     const pendingGoogle = localStorage.getItem("pendingGoogleLogin") === "1";

//     // ① 這是真正的 Google callback（因為 pendingGoogleLogin 是你按 Google 觸發的）
//     if (pendingGoogle) {
//       console.log("[Auth] Handling Google callback.");

//       localStorage.removeItem("pendingGoogleLogin");
//       setProcessingCallback(true);

//       const returnTo = localStorage.getItem("returnTo") ?? "/";
//       localStorage.removeItem("returnTo");

//       router.replace(returnTo);
//       return;
//     }

//     // ② 其他狀況：必定是 LINE Login callback（由 LiffProvider 處理 cookie）
//     console.log("[Auth] Detected LINE callback. Ignore here.");
//     return;
//   }, [router]);

//   // ③ Google Login 按鈕行為
//   function loginWithGoogle() {
//     // 若在 LINE/FB/IG WebView → 自動開外部瀏覽器
//     const ua = navigator.userAgent.toLowerCase();
//     const isWebView =
//       ua.includes("line") || ua.includes("fb") || ua.includes("instagram");

//     // 標記使用者是「真的」按了 Google Login
//     localStorage.setItem("pendingGoogleLogin", "1");
//     // 保留 returnTo
//     localStorage.setItem(
//       "returnTo",
//       window.location.pathname + window.location.search
//     );

//     // Google Login cannot work inside WebView → open external browser
//     if (isWebView) {
//       // ⭐ 自動開啟外部瀏覽器（LINE 允許）
//       window.location.href = `${window.location.href}?openExternalBrowser=1`;
//       return;
//     }

//     // 👉 外部瀏覽器 → 正常流程
//     window.location.href = "/api/auth/login";
//   }

//   // ④ 若正在處理 callback → 顯示 Loading
//   if (processingCallback) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
//         <p className="text-lg font-bold mb-3">Signing you in...</p>
//         <p className="text-sm text-gray-600">
//           Please wait while we complete your login.
//         </p>
//       </div>
//     );
//   }

//   // ⑥ 正常登入畫面（你原本的 UI）
//   return (
//     <div className="p-4 w-full h-full flex justify-center items-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-black dark:to-slate-900">
//       <div
//         className="
//           w-full max-w-md
//           bg-white/90 dark:bg-white/5 backdrop-blur-xl
//           border border-white/20 dark:border-white/10
//           shadow-xl rounded-2xl
//           p-8 md:p-10
//           flex flex-col items-center gap-8
//         "
//       >
//         {/* Logo + 文案 */}
//         <div className="flex flex-col items-center gap-4">
//           <Image
//             src="/images/cyc-logo.png"
//             width={64}
//             height={64}
//             alt="CYC logo"
//             className="opacity-90"
//           />
//           <h1 className="text-2xl md:text-3xl font-dela tracking-wide">
//             CYC Zine
//           </h1>

//           <h2 className="text-lg md:text-xl text-slate-600 dark:text-slate-300 text-center font-dela tracking-wide">
//             Discover Taiwan’s cultural stories. Build your own inspiration map.
//           </h2>

//           <p className="text-slate-600 dark:text-slate-300 opacity-75 text-sm leading-6 mt-3">
//             Sign in to:
//             <br />⭐ Save your favorite events
//             <br />
//             📅 Add events to Google Calendar
//             <span className="text-xs text-slate-600 dark:text-slate-300 block mt-3 opacity-75">
//               * CYC Zine only uses your basic Google profile (name, email &
//               avatar).
//             </span>
//           </p>
//         </div>

//         {/* LINE Login Button */}
//         <BaseButton
//           className="w-full text-white bg-[#00C300] hover:bg-[#00a800]"
//           onClick={loginWithLine}
//         >
//           <FontAwesomeIcon icon={faLine} className="text-xl" />
//           <span className="font-medium ml-4">Sign in with LINE</span>
//         </BaseButton>

//         {/* Google Login Button */}
//         <BaseButton
//           className="w-full text-white bg-[#4285F4] hover:bg-[#3367D6]"
//           onClick={loginWithGoogle}
//         >
//           <FontAwesomeIcon icon={faGoogle} className="text-xl" />
//           <span className="font-medium ml-4">Sign in with Google</span>
//         </BaseButton>

//         {/* Divider */}
//         <div className="flex items-center w-full gap-4">
//           <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
//           <span className="text-xs text-slate-500 dark:text-slate-400">or</span>
//           <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
//         </div>

//         {/* Footer Text */}
//         <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-6">
//           By signing in, you agree to our{" "}
//           <Link
//             href="/privacy"
//             className="underline cursor-pointer hover:opacity-70"
//           >
//             Privacy Policy
//           </Link>{" "}
//           and{" "}
//           <Link
//             href="/terms"
//             className="underline cursor-pointer hover:opacity-70"
//           >
//             Terms of Use
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
