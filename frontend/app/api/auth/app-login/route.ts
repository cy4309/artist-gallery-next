export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { setUserCookies } from "@/utils/setUserCookies";
import { upsertGoogleUser } from "@/services/server/upsertGoogleUser";
import { upsertLineUser } from "@/services/line/upsertLineUser";
import type { UserInitPayload } from "@/types/user";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const LINE_LOGIN_CHANNEL_ID = process.env.LINE_LOGIN_CHANNEL_ID!;
const LINE_LOGIN_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET!;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const isProd = process.env.NODE_ENV === "production";

function getBaseUrl() {
  return isProd ? NEXT_PUBLIC_BASE_URL : "http://localhost:3000";
}

type AppLoginBody = {
  provider?: "google" | "line";
  idToken?: string;
  code?: string;
  redirectUri?: string;
};

function getErrorMessage(err: unknown): unknown {
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data !== undefined) return data;
  }
  if (err instanceof Error) return err.message;
  return "App login failed";
}

function getErrorStatus(err: unknown): number {
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status?: unknown }).status;
    if (status === 400 || status === 401) return status;
  }
  return 401;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AppLoginBody;
    const provider = body.provider;

    if (provider !== "google" && provider !== "line") {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const user =
      provider === "google"
        ? await loginGoogle(body.idToken)
        : await loginLine(body.code, body.redirectUri);

    const res = NextResponse.json({ user });
    setUserCookies(res, user);
    return res;
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    const status = getErrorStatus(err);
    console.error("[/api/auth/app-login]", message);
    return NextResponse.json(
      { error: typeof message === "string" ? message : "App login failed" },
      { status: status === 400 ? 400 : 401 },
    );
  }
}

async function loginGoogle(idToken?: string): Promise<UserInitPayload> {
  if (!idToken) {
    const error = new Error("Missing idToken") as Error & { status: number };
    error.status = 400;
    throw error;
  }

  const tokenRes = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
    params: { id_token: idToken },
  });

  const payload = tokenRes.data as {
    aud?: string;
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  if (payload.aud !== GOOGLE_CLIENT_ID || !payload.sub || !payload.email) {
    const error = new Error("Invalid Google token") as Error & {
      status: number;
    };
    error.status = 401;
    throw error;
  }

  const normalized: UserInitPayload = {
    id: `google_${payload.sub}`,
    provider: "google",
    lineUserId: "",
    email: payload.email,
    name: payload.name ?? payload.email,
    picture: payload.picture ?? "",
  };

  return upsertGoogleUser(normalized);
}

async function loginLine(
  code?: string,
  redirectUri?: string,
): Promise<UserInitPayload> {
  if (!code || !redirectUri) {
    const error = new Error("Missing code or redirectUri") as Error & {
      status: number;
    };
    error.status = 400;
    throw error;
  }

  const allowedRedirect = `${getBaseUrl()}/api/auth/app-login-line`;
  if (redirectUri !== allowedRedirect) {
    const error = new Error("Invalid redirectUri") as Error & {
      status: number;
    };
    error.status = 400;
    throw error;
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

  return upsertLineUser(normalized);
}
