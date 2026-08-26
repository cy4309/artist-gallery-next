export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import type {
  PushPlatform,
  RegisterPushTokenPayload,
} from "@/types/push/register";
import { getCurrentUser } from "@/services/server/authService";
import {
  getDataBackend,
  postToDataBackend,
} from "@/services/server/dataBackendClient";

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

    const backend = getDataBackend();
    if (backend === "gas" && !process.env.GAS_URL) {
      console.warn("[/api/push/register] GAS_URL not set, accepting in dev");
      return NextResponse.json({
        success: true,
        created: true,
        stub: true,
      });
    }
    if (backend === "cloudflare" && !process.env.CF_DATA_API_URL) {
      console.warn(
        "[/api/push/register] CF_DATA_API_URL not set, accepting in dev",
      );
      return NextResponse.json({
        success: true,
        created: true,
        stub: true,
      });
    }

    try {
      const gasData = await postToDataBackend<{
        success?: boolean;
        created?: boolean;
      }>({
        action: GAS_ACTION.REGISTER_PUSH_TOKEN,
        userId: userId ?? null,
        expoPushToken: body.expoPushToken,
        platform: body.platform,
      });

      if (!gasData?.success) {
        console.warn("[/api/push/register] backend not ready, accepting", {
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
    } catch (err) {
      console.warn("[/api/push/register] backend error, accepting token", err);
      return NextResponse.json({
        success: true,
        created: true,
        stub: true,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[/api/push/register]", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
