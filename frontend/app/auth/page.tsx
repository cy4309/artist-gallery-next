"use client";

import BaseButton from "@/components/BaseButton";
import BaseButtonNormal from "@/components/BaseButtonNormal";
import Image from "next/image";
import { GoogleOutlined } from "@ant-design/icons";

export default function AuthPage() {
  return (
    // <div className="h-full flex justify-center items-center">
    //   <BaseButton
    //     onClick={() => (window.location.href = "/api/auth/login")}
    //     className="bg-blue-600"
    //   >
    //     Sign in with Google
    //   </BaseButton>
    // </div>
    <div className="w-full min-h-dvh flex justify-center items-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-black dark:to-slate-900 px-4">
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
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/images/cyc-logo.png"
            width={64}
            height={64}
            alt="CYC Studio logo"
            className="opacity-90"
          />
          <h1 className="text-2xl md:text-3xl font-dela tracking-wide text-primary dark:text-white">
            CYC Studio
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-center text-sm">
            Discover stories, events, and inspirations — powered by Google
            login.
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
          <span className="underline cursor-pointer">Terms</span> and{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
