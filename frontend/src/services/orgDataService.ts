import axios from "axios";
import { showSwal } from "@/utils/notification";

export const getOrgData = async () => {
  try {
    const response = await axios.get(
      // "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=all"
      "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindFestivalTypeJ"
    );
    return response.data;
  } catch (error) {
    showSwal({
      isSuccess: false,
      title: "API occurs an error",
    });
    throw error;
  }
};
