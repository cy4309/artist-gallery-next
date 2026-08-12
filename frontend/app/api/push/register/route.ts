export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import type {
  PushPlatform,
  RegisterPushTokenPayload,
} from "@/types/push/register";
import { getCurrentUser } from "@/services/server/authService";

const GAS_URL = process.env.GAS_URL;

function isValidPlatform(value: unknown): value is PushPlatform {
  return value === "ios" || value === "android";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterPushTokenPayload;

    if (!body?.expoPushToken?.startsWith("ExponentPushToken[")) {
      return NextResponse.json(
        { success: false, error: "Invalid expoPushToken" },
        { status: 400 },
      );
    }

    if (!isValidPlatform(body.platform)) {
      return NextResponse.json(
        { success: false, error: "platform must be ios or android" },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();
    const userId = body.userId ?? user?.id;

    if (!GAS_URL) {
      console.warn("[/api/push/register] GAS_URL not set, accepting in dev");
      return NextResponse.json({
        success: true,
        created: true,
        stub: true,
      });
    }

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: GAS_ACTION.REGISTER_PUSH_TOKEN,
        userId: userId ?? null,
        expoPushToken: body.expoPushToken,
        platform: body.platform,
      }),
    });

    const gasData = await res.json().catch(() => null);

    if (!res.ok || !gasData?.success) {
      console.warn("[/api/push/register] GAS not ready, accepting token", {
        status: res.status,
        gasData,
      });
      return NextResponse.json({
        success: true,
        created: true,
        stub: true,
      });
    }

    return NextResponse.json({
      success: true,
      created: Boolean(gasData.created),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[/api/push/register]", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
