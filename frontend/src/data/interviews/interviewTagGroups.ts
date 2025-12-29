import { InterviewTag, InterviewTagGroupKey } from "@/types/interview";

export const INTERVIEW_TAG_GROUPS: {
  labelKey: InterviewTagGroupKey;
  tags: InterviewTag[];
}[] = [
  {
    labelKey: "type",
    tags: ["music", "visual"],
  },
  {
    labelKey: "culture",
    tags: ["underground", "indie"],
  },
  {
    labelKey: "role",
    tags: ["curation", "artManagement"],
  },
  {
    labelKey: "medium",
    tags: ["tattoo", "threeDAnimation", "digitalArt", "photography"],
  },
];
