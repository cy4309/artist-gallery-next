"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleBack() {
    const isInterviewDetail =
      pathname.startsWith("/interviews/") && pathname.split("/").length === 3; // /interviews/{slug}

    // ⭐ 規則 1：interviews detail → 永遠回 /interviews
    if (isInterviewDetail) {
      router.push("/interviews");
      return;
    }

    // ⭐ 規則 2：referrer 是本站 → 正常 back
    if (
      document.referrer &&
      !document.referrer.includes(window.location.host)
    ) {
      // 若上一頁不是本站 → 回首頁
      router.push("/");
    } else {
      // 有上一頁 → 回上一頁
      router.back();
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`cursor-pointer transition-transform duration-300 flex justify-center items-center border border-primaryBlue rounded-md border-l-0 border-r-0 p-2 mb-6 hover:rotate-180 ${className}`}
      // className="
      //   mb-6 px-4 py-2
      //   flex items-center gap-2
      //   rounded-lg border border-slate-300 dark:border-slate-600
      //   hover:bg-slate-100 dark:hover:bg-slate-700
      //   transition-all
      // "
    >
      <ArrowLeftOutlined />
      <span className="ml-2">Back</span>
    </button>
  );
}
