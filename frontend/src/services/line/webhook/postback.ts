// Rich Menu / Button，目前可能先用line oa接liff不用這

import { replyTextMessage } from "@/services/line/messaging";

export async function handlePostbackEvent(event: any) {
  const replyToken = event.replyToken;
  const data = event.postback?.data;

  console.log("[LINE postback]", data);

  if (!replyToken || !data) return;

  switch (data) {
    case "OPEN_EVENTS":
      await replyTextMessage(
        replyToken,
        "🎭 最新活動都在這裡：\nhttps://liff.line.me/2008669370-m1lKqEaj/events"
      );
      break;

    case "OPEN_FAVORITES":
      await replyTextMessage(
        replyToken,
        "👉 點這裡查看收藏：\nhttps://liff.line.me/2008669370-m1lKqEaj/favorites"
      );
      break;

    case "OPEN_INTERVIEWS":
      await replyTextMessage(
        replyToken,
        "👉 點這裡查看專欄：\nhttps://liff.line.me/2008669370-m1lKqEaj/interviews"
      );
      break;

    default:
      await replyTextMessage(replyToken, "尚未支援的操作");
  }
}
