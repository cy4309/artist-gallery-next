import { replyTextMessage } from "@/services/line/messaging";

export async function handleFollowEvent(event: any) {
  const replyToken = event.replyToken;

  await replyTextMessage(
    replyToken,
    "👋 歡迎加入 CYC Zine！\n你可以在這裡探索藝文活動～"
  );
}
