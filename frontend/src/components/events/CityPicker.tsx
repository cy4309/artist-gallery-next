"use client";

import { useMemo, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";

export const ALL_CITIES = "全部";
export const NO_CITY_SELECTED = "";

type CityPickerProps = {
  cities: string[];
  selected: string;
  onSelect: (city: string) => void;
  placeholder?: string;
};

export default function CityPicker({
  cities,
  selected,
  onSelect,
  placeholder = "請選擇縣市…",
}: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const q = query.trim();
    const list = [ALL_CITIES, ...cities];
    if (!q) return list;
    return list.filter((city) => city.includes(q));
  }, [cities, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const pick = (city: string) => {
    onSelect(city);
    close();
  };

  const hasSelection = Boolean(selected);
  const displayLabel = hasSelection ? selected : placeholder;

  return (
    <>
      <div className="px-5 pb-3 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between rounded-2xl border-2 border-primary dark:border-primaryGray bg-white/90 dark:bg-primary/90 px-4 py-3 text-left hover:opacity-90"
          aria-label={
            hasSelection ? `選擇縣市，目前 ${selected}` : "選擇縣市"
          }
        >
          <span>
            <span className="block text-xs tracking-wide text-gray-500 dark:text-gray-400">
              縣市
            </span>
            <span
              className={`mt-0.5 block text-lg ${
                hasSelection
                  ? "font-bold"
                  : "font-medium text-gray-400 dark:text-gray-500"
              }`}
            >
              {displayLabel}
            </span>
          </span>
          <span className="text-sm font-semibold text-primaryBlue dark:text-blue-300">
            選擇 ▾
          </span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-primary"
          role="dialog"
          aria-modal="true"
          aria-label="選擇縣市"
        >
          <div className="p-4 w-full flex justify-between items-center">
            <h2 className="text-lg font-bold tracking-[2px]">選擇縣市</h2>
            <BaseButton onClick={close} className="bg-white dark:bg-primary">
              <CloseOutlined />
            </BaseButton>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋縣市…"
            className="mx-5 mb-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-white/5 px-4 py-3 text-base placeholder:text-gray-400 outline-none focus:border-primary dark:focus:border-primaryGray"
            autoCorrect="off"
          />

          <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-3">
            {options.length === 0 ? (
              <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                找不到符合的縣市
              </p>
            ) : (
              options.map((item) => {
                const active = hasSelection && item === selected;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => pick(item)}
                    className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-4 text-left ${
                      active
                        ? "border-primary dark:border-primaryGray bg-primary text-white dark:bg-white dark:text-black"
                        : "border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-white/5"
                    }`}
                  >
                    <span className="text-base font-semibold">{item}</span>
                    {active ? (
                      <span className="text-base font-bold">✓</span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
