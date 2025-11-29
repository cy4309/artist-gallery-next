export const dynamic = "force-dynamic"; // 強制這支 route 每次請求都「動態執行」，不要被預先快取或當成 static。
export const runtime = "nodejs"; // 這支 route 要跑在 Node.js Runtime，而不是 Edge Runtime。

import { NextResponse, NextRequest } from "next/server";
import axios, { AxiosError } from "axios";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GAS_URL = process.env.GAS_URL!;
// const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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
    // ⭐ 不用 GOOGLE_REDIRECT_URI 的值，直接智能生成
    const redirectUri = `${baseUrl}/api/auth/login`;

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    console.log("code:", code);

    if (!code) {
      console.log("→ No code, redirect to Google");

      const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authURL.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authURL.searchParams.set("redirect_uri", redirectUri);
      authURL.searchParams.set("response_type", "code");
      authURL.searchParams.set("scope", "openid email profile");

      return NextResponse.redirect(authURL.toString());
    }

    // STEP 2：用 code 換 token
    console.log("→ Fetching Google token...");
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    console.log("tokenRes:", tokenRes.data);

    const { id_token, access_token } = tokenRes.data;
    console.log("id_token:", !!id_token, "access_token:", !!access_token);

    // STEP 3：取得 userinfo
    console.log("→ Fetching Google UserInfo...");
    const userInfoRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      { headers: { Authorization: `Bearer ${id_token}` } }
    );

    console.log("userinfo:", userInfoRes.data);
    const user = userInfoRes.data;

    // STEP 4：寫入 GAS
    console.log("→ Writing to GAS...");
    const gasRes = await axios.post(GAS_URL, {
      action: "registerOrLoginGoogle",
      user,
    });

    console.log("gasRes:", gasRes.data);

    // STEP 5：設定 cookie
    console.log("→ Setting cookie...");
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);

    response.cookies.set("cyc_session", JSON.stringify(user), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log("→ Login DONE. Redirect...");
    return response;
  } catch (err: unknown) {
    // 這裡不再用 any，改用 axios.isAxiosError 做 type guard
    let details: unknown = "Unknown error";

    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      details = axiosError.response?.data || axiosError.message;
      console.error("🔥 OAuth ERROR (Axios):", details);
    } else if (err instanceof Error) {
      details = err.message;
      console.error("🔥 OAuth ERROR (Error):", err.message);
    } else {
      console.error("🔥 OAuth ERROR (Unknown):", err);
    }

    return NextResponse.json(
      {
        error: "OAuth Login Failed",
        details,
      },
      { status: 500 }
    );
  }
}
