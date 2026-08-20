import { toggleFavoriteAndNotify } from "@/services/server/favoriteService";
import { getCurrentUser } from "@/services/server/authService";
import { resolveFavoriteEventId } from "@/services/server/favoriteIdResolve";
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
    const eventId = await resolveFavoriteEventId(user.id, body.eventId);

    const gasRes = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: GAS_ACTION.TOGGLE_FAVORITE,
        userId: user.id,
        ...body,
        eventId,
      }),
    });

    if (!gasRes.ok) {
      throw new Error("GAS toggleFavorite failed");
    }

    const gasData = await gasRes.json();
    const isFavorite = Boolean(gasData.isFavorite);

    await toggleFavoriteAndNotify({
      ...body,
      eventId,
      isFavorite,
      lineUserId: user.lineUserId,
    });

    return Response.json({
      success: true,
      isFavorite,
      eventId,
    });
  } catch (err) {
    console.error("[/api/favorite/toggle]", err);
    return Response.json({ success: false }, { status: 500 });
  }
}
