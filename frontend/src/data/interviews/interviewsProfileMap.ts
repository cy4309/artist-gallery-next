import ProfileSectionWenChia from "@/containers/interviews/ProfileSectionWenChia";
import ProfileSectionBoan from "@/containers/interviews/ProfileSectionBoan";
import ProfileSectionLemon from "@/containers/interviews/ProfileSectionLemon";
import ProfileSectionLuke from "@/containers/interviews/ProfileSectionLuke";

export const PROFILE_SECTION_MAP: Record<string, React.ComponentType> = {
  "wen-chia": ProfileSectionWenChia,
  boan: ProfileSectionBoan,
  lemon: ProfileSectionLemon,
  luke: ProfileSectionLuke,
};
