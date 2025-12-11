"use client";

import { useEffect, useState } from "react";
import BaseButton from "@/components/BaseButton";
import Image from "next/image";
import Link from "next/link";
import { useLiff } from "@/components/LiffProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faLine } from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/navigation";
import { showSwal } from "@/utils/notification";

export default function AuthPage() {
  const [isWebView, setIsWebView] = useState(false);
  const [processingCallback, setProcessingCallback] = useState(false);
  const { loginWithLine } = useLiff();
  const router = useRouter();

  // ① 回跳處理（LINE / Google 共用）
  useEffect(() => {
    async function handleLoginCallback() {
      const params = new URLSearchParams(window.location.search);
      const hasCode = params.has("code"); // LINE / Google 都會有 code

      if (!hasCode) {
        console.log("[Auth] No code in URL → normal login page");
        return;
      }

      console.log("[Auth] Detected login callback");
      setProcessingCallback(true);

      // 此時：
      // - LINE 流程：LiffProvider 會自己去 call /api/auth/login-line 寫 cookie
      // - Google 流程：你的 /api/auth/login 已經設定好 redirect & cookie
      // 這裡只負責 redirect 回原頁面即可

      const returnTo = localStorage.getItem("returnTo") ?? "/";
      localStorage.removeItem("returnTo");

      router.replace(returnTo);
    }

    handleLoginCallback();
  }, [router]);

  // ② 偵測 WebView（LINE / IG / FB 內建瀏覽器）
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("line") || ua.includes("fb") || ua.includes("instagram")) {
      setIsWebView(true);
    }
  }, []);

  // ③ Google Login 按鈕行為
  function loginWithGoogle() {
    if (isWebView) {
      showSwal({
        isSuccess: false,
        title: "無法在 App 內登入 Google，請點右上角『在外部瀏覽器開啟』",
      });
      return;
    }

    localStorage.setItem(
      "returnTo",
      window.location.pathname + window.location.search
    );
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

  // ⑤ 在 App 內（WebView）限制 Google，並提示外部開啟
  // if (isWebView) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
  //       <p className="text-lg font-bold mb-4">無法在應用程式內登入 Google</p>
  //       <p className="text-sm text-gray-600 mb-6">
  //         請點選右上角「在外部瀏覽器開啟」後再登入。
  //       </p>

  //       <a
  //         href={`${window.location.href}?openExternalBrowser=1`}
  //         className="bg-primaryBlue text-white px-4 py-2 rounded"
  //       >
  //         在瀏覽器開啟
  //       </a>
  //     </div>
  //   );
  // }

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
          <FontAwesomeIcon icon={faLine} className="text-xl" />
          <span className="font-medium ml-4">Sign in with LINE</span>
        </BaseButton>

        {/* Google Login Button */}
        <BaseButton
          className="w-full text-white bg-[#4285F4] hover:bg-[#3367D6]"
          onClick={loginWithGoogle}
        >
          <FontAwesomeIcon icon={faGoogle} className="text-xl" />
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
