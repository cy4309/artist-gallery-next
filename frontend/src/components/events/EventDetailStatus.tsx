"use client";

import BackButton from "@/components/BackButton";
import { useLocale } from "@/locales/contexts/LocaleContext";

type EventDetailStatusProps = {
  kind: "notFound" | "loadError";
  retryHref?: string;
};

/** 詳情找不到／載入失敗：版面與成功態同一列返回按鈕 */
export default function EventDetailStatus({
  kind,
  retryHref,
}: EventDetailStatusProps) {
  const { t } = useLocale();

  return (
    <div className="flex w-full max-w-[600px] flex-col items-center">
      <div className="mb-4 flex w-full items-center justify-between gap-3">
        <BackButton className="shrink-0" fallbackHref="/events" />
      </div>
      <p className="my-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
        {kind === "notFound" ? t.events.notFound : t.events.loadError}
      </p>
      {kind === "loadError" && retryHref ? (
        <a
          href={retryHref}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
        >
          {t.events.retry}
        </a>
      ) : null}
    </div>
  );
}
