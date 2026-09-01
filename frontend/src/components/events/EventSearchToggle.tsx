"use client";

import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import EventDateRangeFilter from "@/components/events/EventDateRangeFilter";

type EventSearchTriggerProps = {
  expanded: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
};

export function EventSearchTrigger({
  expanded,
  onToggle,
  label,
  className = "",
}: EventSearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={expanded}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors hover:border-primary dark:hover:border-primaryGray ${className}`}
    >
      <FontAwesomeIcon
        icon={expanded ? faXmark : faMagnifyingGlass}
        className="h-4 w-4"
      />
    </button>
  );
}

type EventSearchInlineProps = {
  expanded: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** flex：吃滿該列剩餘寬度；fixed：固定 w-40（桌面用） */
  size?: "flex" | "fixed";
};

export function EventSearchInline({
  expanded,
  value,
  onChange,
  placeholder,
  size = "flex",
}: EventSearchInlineProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(timer);
    }
  }, [expanded]);

  const expandedContainerClass =
    size === "fixed"
      ? "ml-2 w-40 max-w-40 shrink-0 opacity-100"
      : "ml-2 max-w-full flex-1 opacity-100";

  const inputClassName =
    size === "fixed" ? "w-40" : "w-full min-w-0";

  return (
    <div
      className={`min-w-0 overflow-hidden transition-[max-width,opacity,margin,width] duration-300 ease-out ${
        expanded ? expandedContainerClass : "max-w-0 flex-[0_0_0px] opacity-0"
      }`}
    >
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClassName} rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-white/5 px-3 py-1.5 text-base placeholder:text-gray-400 outline-none focus:border-primary dark:focus:border-primaryGray`}
        autoCorrect="off"
        enterKeyHint="search"
      />
    </div>
  );
}

type EventAdvancedSearchTriggerProps = {
  expanded: boolean;
  onToggle: () => void;
  label: string;
  active?: boolean;
  className?: string;
};

export function EventAdvancedSearchTrigger({
  expanded,
  onToggle,
  label,
  active = false,
  className = "",
}: EventAdvancedSearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={`text-xs font-semibold underline-offset-2 hover:underline px-1 whitespace-nowrap ${
        expanded || active
          ? "text-primary dark:text-primaryGray"
          : "text-gray-500 dark:text-gray-400"
      } ${className}`}
    >
      {label}
    </button>
  );
}

type EventKeywordPanelProps = {
  expanded: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
  className?: string;
  innerClassName?: string;
};

export function EventKeywordPanel({
  expanded,
  value,
  onChange,
  placeholder,
  hint,
  className = "",
  innerClassName = "",
}: EventKeywordPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(timer);
    }
  }, [expanded]);

  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      } ${className}`}
    >
      <div className="overflow-hidden min-h-0">
        <div className={`space-y-2 px-5 pb-3 pt-1 ${innerClassName}`}>
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-white/5 px-3 py-2 text-base placeholder:text-gray-400 outline-none focus:border-primary dark:focus:border-primaryGray"
            autoCorrect="off"
            enterKeyHint="search"
          />
          {hint ? <p className="text-xs text-gray-400">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

/** @deprecated 請改用 EventKeywordPanel */
export const EventSearchPanel = EventKeywordPanel;

type EventAdvancedSearchPanelProps = {
  expanded: boolean;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onConfirmDates?: () => void;
  confirmDatesDisabled?: boolean;
  onClearDates?: () => void;
  dateHint?: string;
  compact?: boolean;
  className?: string;
  innerClassName?: string;
};

export function EventAdvancedSearchPanel({
  expanded,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onConfirmDates,
  confirmDatesDisabled,
  onClearDates,
  dateHint,
  compact = false,
  className = "",
  innerClassName = "",
}: EventAdvancedSearchPanelProps) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      } ${className}`}
    >
      <div className="overflow-hidden min-h-0">
        <div className={`space-y-2 pb-3 pt-1 ${innerClassName}`}>
          <EventDateRangeFilter
            from={dateFrom}
            to={dateTo}
            onFromChange={onDateFromChange}
            onToChange={onDateToChange}
            onConfirm={onConfirmDates}
            confirmDisabled={confirmDatesDisabled}
            onClear={onClearDates}
            compact={compact}
          />
          {dateHint ? (
            <p
              className={`text-xs text-gray-400 ${compact ? "text-right" : ""}`}
            >
              {dateHint}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
