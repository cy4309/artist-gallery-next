"use client";

import { useMemo, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { CITY_ALL_LABEL, displayCityName } from "@/utils/city";

export const ALL_CITIES = CITY_ALL_LABEL;
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
  placeholder,
}: CityPickerProps) {
  const { t } = useLocale();
  const copy = t.events.cityPicker;
  const resolvedPlaceholder = placeholder ?? t.events.selectCityPlaceholder;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const list = [ALL_CITIES, ...cities];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((city) => {
      const label = displayCityName(city, t.cities).toLowerCase();
      return label.includes(q) || city.toLowerCase().includes(q);
    });
  }, [cities, query, t.cities]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const pick = (city: string) => {
    onSelect(city);
    close();
  };

  const hasSelection = Boolean(selected);
  const displayLabel = hasSelection
    ? displayCityName(selected, t.cities)
    : resolvedPlaceholder;

  return (
    <>
      <div className="px-5 pb-3 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between rounded-2xl border-2 border-primary dark:border-primaryGray bg-white/90 dark:bg-primary/90 px-4 py-3 text-left hover:opacity-90"
          aria-label={
            hasSelection
              ? copy.ariaCurrent.replace("{city}", displayLabel)
              : copy.ariaSelect
          }
        >
          <span className="min-w-0">
            <span className="block text-xs tracking-wide text-gray-500 dark:text-gray-400">
              {copy.fieldLabel}
            </span>
            <span
              className={`mt-0.5 block truncate text-lg ${
                hasSelection
                  ? "font-bold"
                  : "font-medium text-gray-400 dark:text-gray-500"
              }`}
            >
              {displayLabel}
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-primaryBlue dark:text-blue-300">
            {copy.choose}
          </span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-primary"
          role="dialog"
          aria-modal="true"
          aria-label={copy.title}
        >
          <div className="p-4 w-full flex justify-between items-center">
            <h2 className="text-xl font-black tracking-[2px]">{copy.title}</h2>
            <BaseButton onClick={close} className="bg-white dark:bg-primary">
              <CloseOutlined />
            </BaseButton>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="mx-5 mb-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-white/5 px-4 py-3 text-base placeholder:text-gray-400 outline-none focus:border-primary dark:focus:border-primaryGray"
            autoCorrect="off"
          />

          <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-3">
            {options.length === 0 ? (
              <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {copy.noResults}
              </p>
            ) : (
              options.map((item) => {
                const active = hasSelection && item === selected;
                const label = displayCityName(item, t.cities);
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
                    <span className="text-base font-semibold">{label}</span>
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
