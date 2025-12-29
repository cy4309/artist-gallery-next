import { InterviewTag } from "@/types/interview";
import { INTERVIEW_TAG_GROUPS } from "@/data/interviews/interviewTagGroups";
import { useLocale } from "@/locales/contexts/LocaleContext";

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
            ? "bg-black text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
    >
      {children}
    </button>
  );
}

export type FilterTag = InterviewTag | "all";

export default function InterviewFilter({
  active,
  onChange,
}: {
  active: FilterTag;
  onChange: (tag: FilterTag) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      {/* All */}
      <div className="flex justify-center">
        <TagButton active={active === "all"} onClick={() => onChange("all")}>
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
                onClick={() => onChange(tag)}
              >
                {t.interviews.tagMap[tag]}
              </TagButton>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
