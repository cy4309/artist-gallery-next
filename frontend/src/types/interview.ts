export type InterviewTagGroupKey = "type" | "culture" | "role" | "medium";

export type InterviewTag =
  | "music"
  | "visual"
  | "underground"
  | "indie"
  | "tattoo"
  | "curation"
  | "artManagement"
  | "threeDAnimation"
  | "digitalArt"
  | "photography";

export interface InterviewPerson {
  slug: string;
  name: string;
  role: string;
  firm: string;
  coverImage: string;
  websiteSrc: string;
  demoSrc: string;
  tags: InterviewTag[];
  // sum: string;
  // sumDetail: string;
}
