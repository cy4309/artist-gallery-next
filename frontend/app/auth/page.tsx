"use client";

import { useEffect, useState } from "react";
import BaseButton from "@/components/BaseButton";
// import BaseButtonNormal from "@/components/BaseButtonNormal";
import Image from "next/image";
import { GoogleOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function AuthPage() {
  const [isWebView, setIsWebView] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("line") || ua.includes("fb") || ua.includes("instagram")) {
      setIsWebView(true);
      // queueMicrotask(() => setIsWebView(true)); // react19, 非同步寫法
    }
  }, []);

  if (isWebView) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-bold mb-4">無法在應用程式內登入 Google</p>
        <p className="text-sm text-gray-600 mb-6">
          請點選右上角「在外部瀏覽器開啟」後再登入。
        </p>

        <a
          href={`${window.location.href}?openExternalBrowser=1`}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          在瀏覽器開啟
        </a>
      </div>
    );
  }

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
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/images/cyc-logo.png"
            width={64}
            height={64}
            alt="CYC Studio logo"
            className="opacity-90"
          />
          <h1 className="text-2xl md:text-3xl font-dela tracking-wide">
            CYC Studio
          </h1>

          {/* <p className="text-slate-600 dark:text-slate-300 text-center text-sm">
            Discover stories, events, and inspirations — powered by Google
            login.
          </p> */}
          <h2 className="text-lg md:text-xl text-slate-600 dark:text-slate-300 text-center font-dela tracking-wide">
            Discover Taiwan’s cultural stories. Build your own inspiration map.
          </h2>

          <p className="text-slate-600 dark:text-slate-300 opacity-75 text-sm leading-6 mt-3">
            Sign in to:
            <br />⭐ Save your favorite events
            <br />
            📅 Add events to Google Calendar
            {/* <br />
            📌 Track your cultural journey
            <br />
            🔑 Enjoy secure and password-free access with Google Login
            <br /> */}
            <span className="text-xs text-slate-600 dark:text-slate-300 block mt-3 opacity-75">
              * CYC STUDIO only uses your basic Google profile (name, email &
              avatar).
            </span>
          </p>
        </div>

        {/* Google Login Button */}
        <BaseButton onClick={() => (window.location.href = "/api/auth/login")}>
          <GoogleOutlined />
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
