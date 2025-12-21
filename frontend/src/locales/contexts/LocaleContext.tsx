"use client";

import { createContext, useContext, useState } from "react";
import { zh } from "@/locales/zh";
import { en } from "@/locales/en";

type Locale = "zh" | "en";
const dictionaries = { zh, en };

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof zh;
} | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");

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
