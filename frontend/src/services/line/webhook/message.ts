// 使用者傳訊

import { replyTextMessage } from "@/services/line/messaging";

export async function handleMessageEvent(event: any) {
  if (event.message?.type !== "text") return;
  if (!event.replyToken) return;

  const text = event.message.text.trim();
  const replyToken = event.replyToken;

  console.log("[LINE message]", text);

  if (text === "help") {
    await replyTextMessage(
      replyToken,
      "👋 歡迎使用 CYC Zine\n\n" +
        "目前這裡主要提供活動與內容查詢，\n" +
        "你可以試試輸入以下關鍵字：\n\n" +
        "• 活動\n" +
        "• 收藏\n" +
        "• 專欄"
    );
    return;
  }

  if (text === "活動") {
    await replyTextMessage(
      replyToken,
      "❤️ 你的活動可以在這裡查看：\nhttps://liff.line.me/2008669370-m1lKqEaj/events"
    );
    return;
  }

  if (text === "收藏") {
    await replyTextMessage(
      replyToken,
      "❤️ 你的收藏可以在這裡查看：\nhttps://liff.line.me/2008669370-m1lKqEaj/favorites"
    );
    return;
  }

  if (text === "專欄") {
    await replyTextMessage(
      replyToken,
      "❤️ 你的專欄可以在這裡查看：\nhttps://liff.line.me/2008669370-m1lKqEaj/interviews"
    );
    return;
  }

  // fallback
  await replyTextMessage(
    replyToken,
    "感謝你的訊息 🙌\n\n" +
      "工作人員會盡快回覆你，\n" +
      "或輸入「help」查看完整功能 😊"
  );
}
