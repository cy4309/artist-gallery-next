"use client";

import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

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
};

export function EventSearchInline({
  expanded,
  value,
  onChange,
  placeholder,
}: EventSearchInlineProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(timer);
    }
  }, [expanded]);

  return (
    <div
      className={`overflow-hidden transition-[max-width,opacity] duration-300 ease-out ${
        expanded ? "mx-2 max-w-xs opacity-100" : "max-w-0 opacity-0"
      }`}
    >
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-72 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-white/5 px-3 py-1.5 text-base placeholder:text-gray-400 outline-none focus:border-primary dark:focus:border-primaryGray"
        autoCorrect="off"
        enterKeyHint="search"
      />
    </div>
  );
}

type EventSearchPanelProps = {
  expanded: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  innerClassName?: string;
};

export function EventSearchPanel({
  expanded,
  value,
  onChange,
  placeholder,
  className = "",
  innerClassName = "",
}: EventSearchPanelProps) {
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
        <div className={`px-5 pb-3 pt-1 ${innerClassName}`}>
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
        </div>
      </div>
    </div>
  );
}
