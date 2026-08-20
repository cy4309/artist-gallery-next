import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/server/authService";
import { resolveFavoriteEventId } from "@/services/server/favoriteIdResolve";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import type { ToggleFavoriteServerPayload } from "@/types/favorite/server";

const GAS_URL = process.env.GAS_URL!;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as ToggleFavoriteServerPayload;
    if (!body?.eventId) {
      return NextResponse.json(
        { success: false, error: "Missing eventId" },
        { status: 400 },
      );
    }

    const eventId = await resolveFavoriteEventId(user.id, body.eventId);

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: GAS_ACTION.ENSURE_FAVORITE,
        userId: user.id,
        ...body,
        eventId,
      }),
    });

    const gasData = await res.json();

    if (!res.ok || !gasData?.success) {
      throw new Error("GAS ensureFavorite logic failed");
    }

    return NextResponse.json({
      success: true,
      created: Boolean(gasData.created),
      eventId,
    });
  } catch (err: unknown) {
    console.error("[/api/favorites/ensure]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 },
    );
  }
}
