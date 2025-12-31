"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface BackButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function BackButton({
  label,
  className,
  onClick,
  children,
}: BackButtonProps) {
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
      onClick={() => {
        // 優先使用外部onClick
        if (onClick) {
          onClick();
          return;
        }
        // 沒有就走handleBack
        handleBack();
      }}
      // className={`cursor-pointer transition-transform duration-300 flex justify-center items-center border border-primaryBlue rounded-md border-l-0 border-r-0 p-2 mb-6 hover:rotate-180 ${className}`}
      className={`
        px-4 py-2
        rounded-md
        border border-gray-500
        text-sm
        flex items-center gap-2
        hover:bg-gray-500
        transition
        ${className}
      `}
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
      {children ?? label}
    </button>
  );
}
