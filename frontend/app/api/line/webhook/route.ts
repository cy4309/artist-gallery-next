//* 1.驗證 signature
//* 2.把 events 丟給 router

import crypto from "crypto";
import { handleLineEvents } from "@/services/line/webhook";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const channelSecret = process.env.LINE_CHANNEL_SECRET!;
  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");

  if (hash !== signature) {
    console.error("[LINE] Invalid signature");
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(body);

  await handleLineEvents(payload.events);

  return Response.json({ success: true });
}
