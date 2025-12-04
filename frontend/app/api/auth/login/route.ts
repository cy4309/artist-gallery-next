export const dynamic = "force-dynamic"; // 強制這支 route 每次請求都「動態執行」，不要被預先快取或當成 static。
export const runtime = "nodejs"; // 這支 route 要跑在 Node.js Runtime，而不是 Edge Runtime。

import { NextResponse, NextRequest } from "next/server";
// import axios, { AxiosError } from "axios";
import axios from "axios";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const NEXT_PUBLIC_GAS_URL = process.env.NEXT_PUBLIC_GAS_URL!;

// ⭐ 智能判斷 Base URL，用 host 自動變 localhost:3000 或 vercel domain
function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("host")!;
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function GET(req: NextRequest) {
  try {
    console.log("=== Google OAuth Callback ===");
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/login`;

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      // redirect to Google
      const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authURL.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authURL.searchParams.set("redirect_uri", redirectUri);
      authURL.searchParams.set("response_type", "code");
      authURL.searchParams.set("scope", "openid email profile");

      return NextResponse.redirect(authURL.toString());
    }

    // STEP 2 — Exchange token
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const { id_token, access_token } = tokenRes.data;

    // STEP 3 — UserInfo
    const userInfoRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      { headers: { Authorization: `Bearer ${id_token}` } }
    );

    const googleUser = userInfoRes.data;

    console.log("=== GOOGLE USER INFO ===");
    console.log(googleUser);

    // STEP 4 — Ask GAS: does user exist?
    const checkUser = await axios.post(NEXT_PUBLIC_GAS_URL, {
      action: "checkUser",
      email: googleUser.email,
    });

    console.log("=== GAS checkUser result ===");
    console.log(JSON.stringify(checkUser.data, null, 2));

    let finalUser = googleUser;

    if (!checkUser.data.exists) {
      // First register
      await axios.post(NEXT_PUBLIC_GAS_URL, {
        action: "createUser",
        user: googleUser,
      });
    } else {
      // Already exists → GAS version wins
      finalUser = checkUser.data.user;

      // optional: update name/photo every login
      await axios.post(NEXT_PUBLIC_GAS_URL, {
        action: "updateUser",
        user: googleUser,
      });
    }

    // STEP 5 — Cookie
    const response = NextResponse.redirect(`${baseUrl}/auth/callback`, {
      status: 302, // ⭐ 必加
    });

    console.log("➡ Setting cookie cyc_session:", finalUser);

    const isProd = process.env.NODE_ENV === "production"; // cookies本地secure: false, 上線secure: ture
    // const isLocalhost = req.headers.get("host")?.includes("localhost");

    // Secure session cookie
    response.cookies.set("cyc_session", JSON.stringify(finalUser), {
      httpOnly: true, // JavaScript 無法讀取 cookie
      sameSite: "lax",
      secure: isProd,
      // secure: false,
      // secure: !isLocalhost,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Public user cookie (給前端讀取)
    response.cookies.set("cyc_user", JSON.stringify(finalUser), {
      httpOnly: false, // ⭐ 要能被 JS 取得
      sameSite: "lax",
      secure: isProd,
      // secure: false,
      // secure: !isLocalhost,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.response?.data || err.message },
      { status: 500 }
    );
  }
}
