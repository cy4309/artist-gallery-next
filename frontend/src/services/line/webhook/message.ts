import { replyTextMessage } from "@/services/line/messaging";

export async function handleMessageEvent(event: any) {
  if (event.message?.type !== "text") return;

  const text = event.message.text;
  const replyToken = event.replyToken;

  // 暫時先 echo
  await replyTextMessage(replyToken, `你剛剛說了：${text}`);
}
