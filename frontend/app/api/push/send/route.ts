export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

type SendPushPayload = {
  expoPushToken: string;
  title?: string;
  body?: string;
};

type ExpoPushTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SendPushPayload;
    const token = body?.expoPushToken?.trim();

    if (!token?.startsWith("ExponentPushToken[")) {
      return NextResponse.json(
        { success: false, error: "Invalid expoPushToken" },
        { status: 400 },
      );
    }

    const title = body.title?.trim() || "CYC ZINE";
    const message = body.body?.trim() || "這是一則來自後端的測試推播。";

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title,
        body: message,
        data: { source: "cyc-zine-test" },
      }),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result?.errors?.[0]?.message || `Expo Push HTTP ${res.status}`,
        },
        { status: 502 },
      );
    }

    const ticket = (
      Array.isArray(result?.data) ? result.data[0] : result?.data
    ) as ExpoPushTicket | undefined;

    if (!ticket || ticket.status === "error") {
      return NextResponse.json(
        {
          success: false,
          error:
            ticket?.message ||
            ticket?.details?.error ||
            "Expo Push rejected the notification",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[/api/push/send]", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
