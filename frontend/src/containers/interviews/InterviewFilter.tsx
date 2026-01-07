import { InterviewTag } from "@/types/interview";
import { INTERVIEW_TAG_GROUPS } from "@/data/interviews/interviewTagGroups";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { useDrawer } from "@/hooks/useDrawer";

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
      className={`px-4 py-2 rounded-md text-sm transition
        ${
          active
            ? "bg-primaryBlue text-white"
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
  const drawer = useDrawer();
  const { t } = useLocale();

  return (
    <>
      {/* Filter Trigger */}
      <div className="flex justify-center">
        <button
          onClick={drawer.open}
          className="
            px-4 py-2
            rounded-md
            border
            text-sm
            flex items-center gap-2
            hover:bg-gray-500
            transition
          "
        >
          <span className="opacity-60">{t.interviews.filter.title}</span>
          <span className="opacity-40">·</span>
          {active === "all"
            ? t.interviews.tagMap.all
            : t.interviews.tagMap[active]}
        </button>
      </div>

      {/* Drawer */}
      {/* <div
        onClick={drawer.close}
        className={`
          fixed bottom-0 left-0 z-40 w-full min-h-dvh
          bg-gray-900/80
          backdrop-blur-md
          overflow-hidden
          transition-transform duration-500 ease-out
            ${drawer.isOpen ? "translate-y-0" : "translate-y-full"}
        `}
      > */}
      <div
        onClick={drawer.close}
        className={`
          fixed bottom-0 left-0 z-40 w-full min-h-dvh
          bg-gray-900/80
          backdrop-blur-md
          overflow-hidden
          transition-all duration-500 ease-out
          ${
            drawer.isOpen
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-full opacity-0 pointer-events-none"
          }
        `}
      >
        {/* Handle */}
        <div className="p-4 flex justify-center">
          <div className="w-10 h-1.5 bg-gray-400 rounded-md" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {/* All */}
          <div className="flex justify-center">
            <TagButton
              active={active === "all"}
              onClick={() => {
                onChange("all");
                drawer.close();
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
                      drawer.close();
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
