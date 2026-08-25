"use client";

import { useEffect } from "react";
import { CloseOutlined } from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import {
  ALL_EVENT_CATEGORY_IDS,
  EVENT_CATEGORY_OPTIONS,
  EventCategoryId,
} from "@/utils/eventCategories";
import { getEventsScrollRoot } from "@/utils/eventsBrowseState";

type EventCategoryPickerProps = {
  selected: EventCategoryId[];
  onChange: (next: EventCategoryId[]) => void;
  onConfirm: (selected: EventCategoryId[]) => void;
  onCancel: () => void;
  loading?: boolean;
  /** 確認後會立刻載入資料時顯示「確認載入」 */
  confirmLoadsData?: boolean;
  /** modal：全螢幕固定（手機）；inline：嵌入版面（桌面） */
  variant?: "modal" | "inline";
};

export default function EventCategoryPicker({
  selected,
  onChange,
  onConfirm,
  onCancel,
  loading = false,
  confirmLoadsData = false,
  variant = "modal",
}: EventCategoryPickerProps) {
  const selectedSet = new Set(selected);
  const allSelected = selected.length === ALL_EVENT_CATEGORY_IDS.length;
  const isModal = variant === "modal";

  useEffect(() => {
    if (!isModal) return;
    const root = getEventsScrollRoot();
    if (!root) return;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prevOverflow;
    };
  }, [isModal]);

  const toggle = (id: EventCategoryId) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => onChange([...ALL_EVENT_CATEGORY_IDS]);
  const clearAll = () => onChange([]);

  const card = (
    <div
      className={`relative flex w-full max-w-lg min-h-0 flex-col rounded-2xl border-[3px] border-primary bg-white/95 p-5 dark:border-primaryGray dark:bg-primary/95 ${
        isModal
          ? "h-[min(90dvh,calc(100dvh-7rem))]"
          : "max-h-[min(85vh,40rem)]"
      }`}
    >
      <div className="absolute top-3 right-3 z-10">
        <BaseButton
          onClick={onCancel}
          className={`bg-white dark:bg-primary ${loading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <CloseOutlined />
        </BaseButton>
      </div>

      <div className="shrink-0 space-y-4 pr-10">
        <div>
          <p className="text-xs tracking-wide text-gray-500 dark:text-gray-400">
            步驟 1
          </p>
          <h2 className="mt-1 text-xl font-bold">活動類型</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            請勾選想看的活動類型（預設不選），確認後再選擇縣市
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
      </div>

      <div
        className={`mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain ${
          isModal ? "touch-pan-y [-webkit-overflow-scrolling:touch]" : ""
        }`}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
      </div>

      <div className="mt-4 flex shrink-0 justify-center border-t border-slate-200 pt-4 dark:border-slate-700">
        <BaseButton
          className={`!px-4 ${loading || selected.length === 0 ? "opacity-50 pointer-events-none" : ""}`}
          onClick={() => {
            if (loading || selected.length === 0) return;
            onConfirm(selected);
          }}
        >
          {loading ? "載入中…" : confirmLoadsData ? "確認載入" : "確認"}
        </BaseButton>
      </div>
    </div>
  );

  if (!isModal) {
    return card;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden px-5 py-4"
      role="dialog"
      aria-modal="true"
      aria-label="選擇活動類型"
    >
      {card}
    </div>
  );
}
