export const dynamic = "force-dynamic"; // 強制這支 route 每次請求都「動態執行」，不要被預先快取或當成 static。
export const runtime = "nodejs"; // 這支 route 要跑在 Node.js Runtime，而不是 Edge Runtime。

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { setUserCookies } from "@/utils/setUserCookies";
import { UserInitPayload } from "@/types/user";
import { GAS_ACTION } from "@/constants/gas";

const LINE_LOGIN_CHANNEL_ID = process.env.LINE_LOGIN_CHANNEL_ID!;
const LINE_LOGIN_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET!;
const GAS_URL = process.env.GAS_URL!;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const isProd = process.env.NODE_ENV === "production";

function getBaseUrl() {
  if (isProd) return NEXT_PUBLIC_BASE_URL;
  // 開發用
  // return "http://localhost:3000";
  return "https://f21ff5445295.ngrok-free.app";
  // 測試要改: 上面這行
  // 測試要改: login channel: line login callback, liff endpoint要一起改
  // 測試要改: messaging api: Webhook URL
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl();
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const initialReturnTo = searchParams.get("returnTo") || "/";

    const redirectUri = `${baseUrl}/api/auth/login-line`;

    // =====================================================
    // STEP 1 — 沒有 code → 送去 LINE Login 授權頁
    // =====================================================
    if (!code) {
      // 把 returnTo 放進 state，之後會原封不動帶回來
      const statePayload = {
        returnTo: initialReturnTo,
        ts: Date.now(),
      };
      const state = Buffer.from(JSON.stringify(statePayload)).toString(
        "base64url"
      );

      const authUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", LINE_LOGIN_CHANNEL_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", "openid profile"); // 之後要 email 可改為 "openid profile email"
      authUrl.searchParams.set("state", state);

      return NextResponse.redirect(authUrl.toString());
    }

    // =====================================================
    // STEP 2 — 有 code → 換 access_token + id_token
    // =====================================================

    // 解析 state 拿回 returnTo
    let returnTo = "/";
    if (stateParam) {
      try {
        const decoded = JSON.parse(
          Buffer.from(stateParam, "base64url").toString("utf8")
        );
        if (decoded.returnTo && typeof decoded.returnTo === "string") {
          returnTo = decoded.returnTo;
        }
      } catch {
        returnTo = "/";
      }
    }

    // token 交換
    const tokenBody = new URLSearchParams();
    tokenBody.set("grant_type", "authorization_code");
    tokenBody.set("code", code);
    tokenBody.set("redirect_uri", redirectUri);
    tokenBody.set("client_id", LINE_LOGIN_CHANNEL_ID);
    tokenBody.set("client_secret", LINE_LOGIN_CHANNEL_SECRET);

    const tokenRes = await axios.post(
      "https://api.line.me/oauth2/v2.1/token",
      tokenBody.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { id_token } = tokenRes.data as { id_token: string };

    // =====================================================
    // STEP 3 — 驗證 id_token（官方 verify API）
    // =====================================================
    const verifyBody = new URLSearchParams();
    verifyBody.set("id_token", id_token);
    verifyBody.set("client_id", LINE_LOGIN_CHANNEL_ID);

    const verifyRes = await axios.post(
      "https://api.line.me/oauth2/v2.1/verify",
      verifyBody.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const payload = verifyRes.data as {
      sub: string; // LINE userId
      name?: string;
      picture?: string;
      email?: string;
    };

    // =====================================================
    // STEP 4 — 正規化 User 物件
    // =====================================================
    const lineUserId = payload.sub; // 推播等用途要用這個
    const normalizedUser: UserInitPayload = {
      id: `line_${lineUserId}`, // 系統主鍵
      provider: "line",
      lineUserId, // ⭐ 真正推播用 ID
      email: payload.email ?? "",
      name: payload.name ?? "LINE User",
      picture: payload.picture ?? "",
    };

    // =====================================================
    // STEP 5 — 與 GAS 同步（checkLineUser / createLineUser / updateLineUser）
    // =====================================================
    // 1) 先檢查是否存在
    const checkRes = await axios.post(GAS_URL, {
      action: GAS_ACTION.CHECK_LINE_USER,
      userId: normalizedUser.id, // 對應 GAS 裡 USERS.id（line_xxx）
    });

    let finalUser = normalizedUser;

    if (!checkRes.data.exists) {
      const createRes = await axios.post(GAS_URL, {
        action: GAS_ACTION.CREATE_LINE_USER,
        user: normalizedUser,
      });
      if (createRes.data?.user) {
        finalUser = createRes.data.user;
      }
    } else {
      const updateRes = await axios.post(GAS_URL, {
        action: GAS_ACTION.UPDATE_LINE_USER,
        user: normalizedUser,
      });
      if (updateRes.data?.user) {
        finalUser = updateRes.data.user;
      }
    }

    // =====================================================
    // STEP 6 — 寫 Cookie + Redirect 回原頁面
    // =====================================================
    const redirectResponse = NextResponse.redirect(
      `${baseUrl}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
      { status: 302 }
    );

    setUserCookies(redirectResponse, finalUser);

    return redirectResponse;
  } catch (err: any) {
    console.error("[LINE Login OAuth Error]", err?.response?.data || err);
    return NextResponse.json(
      { error: err?.response?.data || err?.message || "LINE login error" },
      { status: 500 }
    );
  }
}
