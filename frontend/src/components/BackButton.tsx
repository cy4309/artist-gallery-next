"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocale } from "@/locales/contexts/LocaleContext";

interface BackButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  /** 無上一頁可返回時的導向，預設回首頁 */
  fallbackHref?: string;
}

export default function BackButton({
  label,
  className,
  onClick,
  children,
  fallbackHref = "/",
}: BackButtonProps) {
  const { t } = useLocale();
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
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
      <span className="ml-2">{t.buttons.back}</span>
      {children ?? label}
    </button>
  );
}
