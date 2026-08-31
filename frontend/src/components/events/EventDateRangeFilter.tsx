"use client";

import { useLocale } from "@/locales/contexts/LocaleContext";

type EventDateRangeFilterProps = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  onClear?: () => void;
  className?: string;
  compact?: boolean;
};

export default function EventDateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onConfirm,
  confirmDisabled = false,
  onClear,
  className = "",
  compact = false,
}: EventDateRangeFilterProps) {
  const { t } = useLocale();

  return (
    <div
      className={`flex flex-wrap items-end gap-2 ${compact ? "" : "gap-3"} ${className}`}
    >
      <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-xs text-gray-500">
        <span>{t.events.dateFrom}</span>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded-lg border-2 border-slate-200 bg-white/90 px-2 py-1.5 text-sm text-gray-800 outline-none focus:border-primary dark:border-slate-700 dark:bg-white/5 dark:text-gray-100 dark:focus:border-primaryGray"
        />
      </label>
      <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-xs text-gray-500">
        <span>{t.events.dateTo}</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded-lg border-2 border-slate-200 bg-white/90 px-2 py-1.5 text-sm text-gray-800 outline-none focus:border-primary dark:border-slate-700 dark:bg-white/5 dark:text-gray-100 dark:focus:border-primaryGray"
        />
      </label>
      {onConfirm ? (
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className="rounded-lg border-2 border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-white dark:border-primaryGray disabled:opacity-40"
        >
          {t.events.dateConfirm}
        </button>
      ) : null}
      {(from || to) && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border-2 border-slate-300 px-3 py-1.5 text-xs font-semibold text-gray-500 dark:border-slate-600"
        >
          {t.events.clearDates}
        </button>
      ) : null}
    </div>
  );
}
