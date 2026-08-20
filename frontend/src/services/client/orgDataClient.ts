import { canonicalListToOrgEvents } from "@/services/events/canonicalToLegacy";
import { CanonicalEvent } from "@/types/event";

export async function getOrgData() {
  const res = await fetch("/api/events");

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const json = (await res.json()) as { events?: CanonicalEvent[] };
  const events: CanonicalEvent[] = Array.isArray(json.events) ? json.events : [];
  return canonicalListToOrgEvents(events);
}

// export async function getOrgData() {
//   const response = await axios.get(
//     "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindFestivalTypeJ"
//   );

//   return response.data;
// }

// import axios from "axios";
// import { showSwal } from "@/utils/notification";

// export const getOrgData = async () => {
//   try {
//     const response = await axios.get(
//       // "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=all"
//       "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindFestivalTypeJ"
//     );
//     return response.data;
//   } catch (error) {
//     showSwal({
//       isSuccess: false,
//       title: "API occurs an error",
//     });
//     throw error;
//   }
// };
