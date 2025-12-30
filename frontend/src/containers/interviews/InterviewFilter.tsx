import { useState, useEffect } from "react";
import { InterviewTag } from "@/types/interview";
import { INTERVIEW_TAG_GROUPS } from "@/data/interviews/interviewTagGroups";
import { useLocale } from "@/locales/contexts/LocaleContext";

export type FilterTag = InterviewTag | "all";

function TagButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition
        ${
          active
            ? "bg-primary text-white"
            : "bg-white hover:bg-primaryGray text-gray-700"
        }`}
    >
      {children}
    </button>
  );
}

export default function InterviewFilter({
  active,
  onChange,
}: {
  active: FilterTag;
  onChange: (tag: FilterTag) => void;
}) {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // ① 防止背景 scroll
    document.body.style.overflow = "hidden";
    // ② ESC 關閉選單
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    // ③ cleanup（非常重要）
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [isOpen]);

  return (
    <>
      {/* Filter Trigger */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="
            px-4 py-2
            rounded-full
            border
            text-sm
            flex items-center gap-2
            hover:bg-gray-500
            transition
          "
        >
          <span className="opacity-60">Filter</span>
          <span className="opacity-40">·</span>
          {active === "all"
            ? t.interviews.tagMap.all
            : t.interviews.tagMap[active]}
        </button>
      </div>

      {/* Drawer */}
      <div
        onClick={() => setIsOpen(false)}
        className={`
          fixed bottom-0 left-0 z-40 w-full
          bg-gray-900/80
          rounded-t-2xl
          overflow-hidden
          transition-all duration-500
          ${
            isOpen
              ? "h-[100vh] opacity-100 pointer-events-auto"
              : "h-0 opacity-0 pointer-events-none"
          }
        `}
      >
        {/* Handle */}
        <div className="p-4 flex justify-center">
          <div className="w-10 h-1.5 bg-gray-400 rounded-full" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {/* All */}
          <div className="flex justify-center">
            <TagButton
              active={active === "all"}
              onClick={() => {
                onChange("all");
                setIsOpen(false);
              }}
            >
              {t.interviews.tagMap.all}
            </TagButton>
          </div>

          {/* Groups */}
          {INTERVIEW_TAG_GROUPS.map((group) => (
            <div key={group.labelKey} className="space-y-2">
              <p className="text-xs tracking-widest text-gray-400 uppercase text-center">
                {t.interviews.filter.group[group.labelKey]}
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {group.tags.map((tag) => (
                  <TagButton
                    key={tag}
                    active={active === tag}
                    onClick={() => {
                      onChange(tag);
                      setIsOpen(false);
                    }}
                  >
                    {t.interviews.tagMap[tag]}
                  </TagButton>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
