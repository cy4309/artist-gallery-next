// 加好友，這裡用 push，不是 reply，因為 follow event 沒有 replyToken

import { pushTextMessage } from "@/services/line/messaging";

export async function handleFollowEvent(event: any) {
  const lineUserId = event.source?.userId;

  if (!lineUserId) return;

  console.log("[LINE follow]", lineUserId);

  await pushTextMessage(
    lineUserId,
    "🎉 歡迎加入 CYC Zine！\n\n你可以透過下方選單查看：\n- 活動\n- 收藏\n- 專欄"
  );
}
