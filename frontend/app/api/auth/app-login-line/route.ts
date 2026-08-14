export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { setUserCookies } from "@/utils/setUserCookies";
import { upsertLineUser } from "@/services/line/upsertLineUser";
import { isAllowedAppReturnTo } from "@/utils/appReturnTo";
import type { UserInitPayload } from "@/types/user";

const LINE_LOGIN_CHANNEL_ID = process.env.LINE_LOGIN_CHANNEL_ID!;
const LINE_LOGIN_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET!;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const isProd = process.env.NODE_ENV === "production";

function getBaseUrl() {
  return isProd ? NEXT_PUBLIC_BASE_URL : "http://localhost:3000";
}

function getErrorMessage(err: unknown): unknown {
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data !== undefined) return data;
  }
  return err;
}

function getErrorText(err: unknown): string {
  return err instanceof Error ? err.message : "LINE app login error";
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl();
    const redirectUri = `${baseUrl}/api/auth/app-login-line`;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const returnToParam = searchParams.get("returnTo") || "";

    if (!code) {
      if (!isAllowedAppReturnTo(returnToParam)) {
        return NextResponse.json(
          { error: "Invalid returnTo" },
          { status: 400 },
        );
      }

      const state = Buffer.from(
        JSON.stringify({ returnTo: returnToParam, ts: Date.now() }),
      ).toString("base64url");

      const authUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", LINE_LOGIN_CHANNEL_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", "openid profile");
      authUrl.searchParams.set("state", state);

      return NextResponse.redirect(authUrl.toString());
    }

    let returnTo = "";
    if (stateParam) {
      try {
        const decoded = JSON.parse(
          Buffer.from(stateParam, "base64url").toString("utf8"),
        ) as { returnTo?: unknown };
        if (typeof decoded.returnTo === "string") {
          returnTo = decoded.returnTo;
        }
      } catch {
        returnTo = "";
      }
    }

    if (!isAllowedAppReturnTo(returnTo)) {
      return NextResponse.json({ error: "Invalid returnTo" }, { status: 400 });
    }

    const tokenBody = new URLSearchParams();
    tokenBody.set("grant_type", "authorization_code");
    tokenBody.set("code", code);
    tokenBody.set("redirect_uri", redirectUri);
    tokenBody.set("client_id", LINE_LOGIN_CHANNEL_ID);
    tokenBody.set("client_secret", LINE_LOGIN_CHANNEL_SECRET);

    const tokenRes = await axios.post(
      "https://api.line.me/oauth2/v2.1/token",
      tokenBody.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const { id_token } = tokenRes.data as { id_token: string };

    const verifyBody = new URLSearchParams();
    verifyBody.set("id_token", id_token);
    verifyBody.set("client_id", LINE_LOGIN_CHANNEL_ID);

    const verifyRes = await axios.post(
      "https://api.line.me/oauth2/v2.1/verify",
      verifyBody.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const payload = verifyRes.data as {
      sub: string;
      name?: string;
      picture?: string;
      email?: string;
    };

    const lineUserId = payload.sub;
    const normalized: UserInitPayload = {
      id: `line_${lineUserId}`,
      provider: "line",
      lineUserId,
      email: payload.email ?? "",
      name: payload.name ?? "LINE User",
      picture: payload.picture ?? "",
    };

    const finalUser = await upsertLineUser(normalized);

    const separator = returnTo.includes("?") ? "&" : "?";
    const target = `${returnTo}${separator}session=${encodeURIComponent(
      JSON.stringify(finalUser),
    )}`;

    const redirectResponse = NextResponse.redirect(target, {
      status: 302,
    });
    setUserCookies(redirectResponse, finalUser);
    return redirectResponse;
  } catch (err: unknown) {
    console.error("[LINE App Login]", getErrorMessage(err));
    return NextResponse.json(
      { error: getErrorText(err) },
      { status: 500 },
    );
  }
}
