"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { zh } from "@/locales/zh";
import { en } from "@/locales/en";

type Locale = "zh" | "en";

/** 對齊 next-themes：client localStorage 持久化 */
const LOCALE_STORAGE_KEY = "cyc-locale";

const dictionaries = { zh, en };

function isLocale(value: string | null): value is Locale {
  return value === "zh" || value === "en";
}

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(raw)) return raw;
  } catch {
    // private mode / 禁用 storage
  }
  return "zh";
}

function writeStoredLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof zh;
} | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // SSR／首屏與 theme 一樣先用預設，掛載後再讀 storage（避免 hydration mismatch）
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant" : "en";
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    writeStoredLocale(next);
  }

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        t: dictionaries[locale],
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
