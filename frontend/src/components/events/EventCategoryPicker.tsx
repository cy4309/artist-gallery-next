"use client";

import { CloseOutlined } from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import {
  ALL_EVENT_CATEGORY_IDS,
  EVENT_CATEGORY_OPTIONS,
  EventCategoryId,
} from "@/utils/eventCategories";
import { displayCityName } from "@/utils/city";

type EventCategoryPickerProps = {
  city: string;
  selected: EventCategoryId[];
  onChange: (next: EventCategoryId[]) => void;
  onConfirm: (selected: EventCategoryId[]) => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function EventCategoryPicker({
  city,
  selected,
  onChange,
  onConfirm,
  onCancel,
  loading = false,
}: EventCategoryPickerProps) {
  const selectedSet = new Set(selected);
  const allSelected = selected.length === ALL_EVENT_CATEGORY_IDS.length;

  const toggle = (id: EventCategoryId) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => onChange([...ALL_EVENT_CATEGORY_IDS]);
  const clearAll = () => onChange([]);

  return (
    <div className="relative w-full max-w-lg mx-auto rounded-2xl border-[3px] border-primary dark:border-primaryGray bg-white/95 dark:bg-primary/95 p-5 space-y-4">
      <div className="absolute top-3 right-3 z-10">
        <BaseButton
          onClick={onCancel}
          className={`bg-white dark:bg-primary ${loading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <CloseOutlined />
        </BaseButton>
      </div>

      <div className="pr-10">
        <p className="text-xs tracking-wide text-gray-500 dark:text-gray-400">
          已選縣市
        </p>
        <h2 className="mt-1 text-xl font-bold">
          {displayCityName(city) || city}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          請勾選想看的活動類型（預設不選），確認後再載入
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600"
        >
          全選
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600"
        >
          清空
        </button>
        <span className="text-xs text-gray-400 self-center">
          已選 {selected.length}/{ALL_EVENT_CATEGORY_IDS.length}
          {allSelected ? "（全部）" : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
        {EVENT_CATEGORY_OPTIONS.map((option) => {
          const active = selectedSet.has(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-opacity ${
                active
                  ? "border-primary dark:border-primaryGray bg-primary/10 dark:bg-white/10"
                  : "border-slate-200 dark:border-slate-700 opacity-70"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center pt-1">
        <BaseButton
          className={`!px-4 ${loading || selected.length === 0 ? "opacity-50 pointer-events-none" : ""}`}
          onClick={() => {
            if (loading || selected.length === 0) return;
            onConfirm(selected);
          }}
        >
          {loading ? "載入中…" : "確認載入"}
        </BaseButton>
      </div>
    </div>
  );
}
