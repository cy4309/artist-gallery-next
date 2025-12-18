//* 1.驗證 signature
//* 2.把 events 丟給 router

export const runtime = "nodejs"; // 沒有宣告 runtime，Vercel 可能會用 Edge Runtime，而 Edge 不能用 Node 的 crypto

import crypto from "crypto";
import { handleLineEvents } from "@/services/line/webhook";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!signature) {
      // 即使錯誤也要回 200，否則 LINE 仍會 retry
      return new Response(null, { status: 200 });
    }

    const hash = crypto
      .createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
      .update(body)
      .digest("base64");

    if (hash !== signature) {
      console.error("[LINE] Invalid signature");
      return new Response(null, { status: 200 });
    }

    // parse payload
    const json = JSON.parse(body);

    // 立即回 200 不阻塞
    // （你也可以 make async handler 之後再做 event 處理）
    const events = json.events || [];
    handleLineEvents(events).catch((err) => {
      console.error("[LINE webhook async error]", err);
    });

    return new Response(null, { status: 200 });
  } catch (err) {
    // 不管有沒有錯誤，都回 200
    console.error("[LINE webhook error catch]", err);
    return new Response(null, { status: 200 });
  }
}
