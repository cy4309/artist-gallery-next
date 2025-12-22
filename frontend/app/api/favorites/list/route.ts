export const dynamic = "force-dynamic"; // 強制這支 route 每次請求都「動態執行」，不要被預先快取或當成 static。
export const runtime = "nodejs"; // 這支 route 要跑在 Node.js Runtime，而不是 Edge Runtime。

import { NextResponse } from "next/server";
import { listFavorites } from "@/services/repo/favoriteRepo";
import { getCurrentUser } from "@/services/server/authService";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await listFavorites(user.id);
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    console.error("[/api/favorites/list] ERROR:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
