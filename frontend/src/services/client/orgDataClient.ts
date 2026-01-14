export async function getOrgData() {
  const res = await fetch("/api/org", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch org data");
  }

  return res.json();
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
