export const dynamic = "force-dynamic"; // 強制這支 route 每次請求都「動態執行」，不要被預先快取或當成 static。
export const runtime = "nodejs"; // 這支 route 要跑在 Node.js Runtime，而不是 Edge Runtime。

import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { setUserCookies } from "@/utils/setUserCookies";
import { UserInitPayload } from "@/types/user";
import { isAllowedAppReturnTo } from "@/utils/appReturnTo";
import { upsertGoogleUser } from "@/services/server/upsertGoogleUser";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const isProd = process.env.NODE_ENV === "production"; // cookies本地secure: false, 上線secure: ture

function getBaseUrl() {
  return isProd ? NEXT_PUBLIC_BASE_URL : "http://localhost:3000"; // 直接寫死就行，因為google console只接受localhost，但不影響next使用https或是0.0.0.0
}

function getErrorMessage(err: unknown): unknown {
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data !== undefined) return data;
  }
  if (err instanceof Error) return err.message;
  return "Google login error";
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl();
    const redirectUri = `${baseUrl}/api/auth/login`;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const returnToParam = searchParams.get("returnTo") || "";

    // STEP 1 — Redirect to Google login
    if (!code) {
      const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authURL.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authURL.searchParams.set("redirect_uri", redirectUri);
      authURL.searchParams.set("response_type", "code");
      authURL.searchParams.set("scope", "openid email profile");
      authURL.searchParams.set("prompt", "select_account");

      const state = isAllowedAppReturnTo(returnToParam)
        ? Buffer.from(
            JSON.stringify({ returnTo: returnToParam, ts: Date.now() }),
          ).toString("base64url")
        : crypto.randomUUID();
      authURL.searchParams.set("state", state);

      return NextResponse.redirect(authURL.toString());
    }

    // if (!code) {
    //   const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    //   authURL.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    //   authURL.searchParams.set("redirect_uri", redirectUri);
    //   authURL.searchParams.set("response_type", "code");
    //   authURL.searchParams.set("scope", "openid email profile");
    //   authURL.searchParams.set("prompt", "select_account");
    //   // ⭐ 把 returnTo 放進 state
    //   const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/";
    //   const statePayload = {
    //     returnTo,
    //     ts: Date.now(),
    //   };
    //   const state = Buffer.from(JSON.stringify(statePayload)).toString(
    //     "base64url"
    //   );
    //   authURL.searchParams.set("state", state);
    //   return NextResponse.redirect(authURL.toString());
    // }

    // STEP 2 — Exchange code for token
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const { id_token, access_token } = tokenRes.data;

    // STEP 3 — Fetch Google user info
    // const userInfoRes = await axios.get(
    //   `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    //   { headers: { Authorization: `Bearer ${id_token}` } }
    // );
    const userInfoRes = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const googleUser = userInfoRes.data;

    // Normalize user format
    const normalizedUser: UserInitPayload = {
      id: `google_${googleUser.id}`, // ⭐ 統一前綴
      provider: "google" as const,
      lineUserId: "", // ⭐ Google 一定是空字串
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    };

    // STEP 4 — Sync user to data backend (check or create)
    let finalUser = await upsertGoogleUser(normalizedUser);

    // 雙保險：最終一定要有 Google picture
    if (!finalUser.picture && normalizedUser.picture) {
      finalUser = { ...finalUser, picture: normalizedUser.picture };
    }

    // STEP 5 — Set cookies + redirect（網站回 callback；App 帶回 session）
    let appReturnTo = "";
    if (stateParam) {
      try {
        const decoded = JSON.parse(
          Buffer.from(stateParam, "base64url").toString("utf8"),
        );
        if (typeof decoded.returnTo === "string") {
          appReturnTo = decoded.returnTo;
        }
      } catch {
        appReturnTo = "";
      }
    }

    const target = isAllowedAppReturnTo(appReturnTo)
      ? `${appReturnTo}${appReturnTo.includes("?") ? "&" : "?"}session=${encodeURIComponent(
          JSON.stringify(finalUser),
        )}`
      : `${baseUrl}/auth/callback`;

    const res = NextResponse.redirect(target);
    setUserCookies(res, finalUser);
    return res;
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
