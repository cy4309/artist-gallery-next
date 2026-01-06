import { upsertLineUser } from "@/services/line/upsertLineUser";
import { getLineProfileLiff } from "@/services/line/getLineProfileLiff";
import type { UserInitPayload } from "@/types/user";

export async function handleFollowEvent(event: any) {
  const lineUserId = event.source?.userId;
  if (!lineUserId) return;

  console.log("[LINE follow]", lineUserId);

  let name = "LINE User";
  let picture = "";

  try {
    // ⭐ 關鍵：follow不會給使用者profile，這裡打liff主動抓profile，若資料不齊全，之後line login oauth會補齊
    const profile = await getLineProfileLiff(lineUserId);
    name = profile.displayName || name;
    picture = profile.pictureUrl || "";
  } catch (err) {
    console.warn("[LINE follow] failed to fetch profile", err);
    // 失敗也沒關係，用預設值
  }

  const user: UserInitPayload = {
    id: `line_${lineUserId}`,
    provider: "line",
    lineUserId,
    name,
    email: "", // follow 拿不到 email，正常
    picture,
  };

  // ❗ 不回訊、不 push，只做資料同步
  await upsertLineUser(user);
}

// ------------------------------------------------------------------------------------------------
// reply歡迎加入訊息，但是line oa那邊會自動回應，所以這邊註解
// import { replyTextMessage } from "@/services/line/messaging";

// export async function handleFollowEvent(event: any) {
//   const replyToken = event.replyToken;
//   if (!replyToken) return;

//   console.log("[LINE follow]", event.source?.userId);

//   await replyTextMessage(
//     replyToken,
//     `
//       感謝加入 CYC Zine 🙌

//       這裡蒐集台灣各地的藝文活動與人物專欄，
//       幫你建立屬於自己的文化靈感地圖。

//       目前你可以試試輸入以下關鍵字：
//       • 活動
//       • 收藏
//       • 專欄
//       • help（查看完整功能）

//       如果你有其他問題，工作人員也會盡快回覆你 😊
//     `
//   );
// }

// ------------------------------------------------------------------------------------------------
// 加好友，這裡試用 push，不是 reply
// import { pushTextMessage } from "@/services/line/messaging";

// export async function handleFollowEvent(event: any) {
//   const lineUserId = event.source?.userId;
//   if (!lineUserId) return;

//   console.log("[LINE follow]", lineUserId);

//   await pushTextMessage(
//     lineUserId,
//     "🎉 歡迎加入 CYC Zine！\n\n你可以透過下方選單查看：\n- 活動\n- 收藏\n- 專欄"
//   );
// }
