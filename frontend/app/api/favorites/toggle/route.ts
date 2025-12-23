import { toggleFavoriteAndNotify } from "@/services/server/favoriteService";
import { getCurrentUser } from "@/services/server/authService";
import type { ToggleFavoriteServerPayload } from "@/types/favorite/server";
import { GAS_ACTION } from "@/types/gas/actionConstants";

const GAS_URL = process.env.GAS_URL!;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ success: false }, { status: 401 });
    }
    const body = (await req.json()) as ToggleFavoriteServerPayload;

    // ⭐ 1️⃣ 呼叫 GAS
    const gasRes = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: GAS_ACTION.TOGGLE_FAVORITE,
        userId: user.id,
        ...body,
      }),
    });

    if (!gasRes.ok) {
      throw new Error("GAS toggleFavorite failed");
    }

    const gasData = await gasRes.json();
    const isFavorite = Boolean(gasData.isFavorite);

    // ⭐ 2️⃣ 副作用（LINE）
    await toggleFavoriteAndNotify({
      ...body,
      isFavorite,
      lineUserId: user.lineUserId,
    });

    // ⭐ 3️⃣ 回傳 API 結果
    return Response.json({
      success: true,
      isFavorite,
    });
  } catch (err) {
    console.error("[/api/favorite/toggle]", err);
    return Response.json({ success: false }, { status: 500 });
  }
}
