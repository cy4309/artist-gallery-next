export const dynamic = "force-dynamic"; // 強制這支 route 每次請求都「動態執行」，不要被預先快取或當成 static。
export const runtime = "nodejs"; // 這支 route 要跑在 Node.js Runtime，而不是 Edge Runtime。

import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { setUserCookies } from "@/utils/setUserCookies";
import { UserInitPayload } from "@/types/user";
import { GAS_ACTION } from "@/types/gas/actionConstants";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GAS_URL = process.env.GAS_URL!;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const isProd = process.env.NODE_ENV === "production"; // cookies本地secure: false, 上線secure: ture

function getBaseUrl() {
  return isProd ? NEXT_PUBLIC_BASE_URL : "http://localhost:3000"; // 直接寫死就行，因為google console只接受localhost，但不影響next使用https或是0.0.0.0
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl();
    const redirectUri = `${baseUrl}/api/auth/login`;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    // STEP 1 — Redirect to Google login
    if (!code) {
      const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authURL.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authURL.searchParams.set("redirect_uri", redirectUri);
      authURL.searchParams.set("response_type", "code");
      authURL.searchParams.set("scope", "openid email profile");
      authURL.searchParams.set("prompt", "select_account"); // ⭐ 強制每次都選帳號

      const state = crypto.randomUUID();
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
      }
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

    // STEP 4 — Sync to GAS (check or create)
    // 1️⃣ 檢查 Google user（用 email）
    const checkRes = await axios.post(GAS_URL, {
      action: GAS_ACTION.CHECK_GOOGLE_USER,
      email: normalizedUser.email,
    });

    let finalUser = normalizedUser;

    if (!checkRes.data.exists) {
      const createRes = await axios.post(GAS_URL, {
        action: GAS_ACTION.CREATE_GOOGLE_USER,
        user: normalizedUser,
      });

      if (createRes.data?.user) {
        finalUser = createRes.data.user;
      }
    } else {
      const updateRes = await axios.post(GAS_URL, {
        action: GAS_ACTION.UPDATE_GOOGLE_USER,
        user: normalizedUser,
      });

      if (updateRes.data?.user) {
        finalUser = updateRes.data.user;
      }
    }

    // STEP 5 — Set cookies
    const res = NextResponse.redirect(`${baseUrl}/auth/callback`);
    setUserCookies(res, finalUser);
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.response?.data || err.message },
      { status: 500 }
    );
  }
}
