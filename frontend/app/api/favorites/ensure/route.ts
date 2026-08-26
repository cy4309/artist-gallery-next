import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/server/authService";
import { resolveFavoriteEventId } from "@/services/server/favoriteIdResolve";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import type { ToggleFavoriteServerPayload } from "@/types/favorite/server";
import { postToDataBackend } from "@/services/server/dataBackendClient";

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

    const gasData = await postToDataBackend<{
      success?: boolean;
      created?: boolean;
    }>({
      action: GAS_ACTION.ENSURE_FAVORITE,
      userId: user.id,
      ...body,
      eventId,
    });

    if (!gasData?.success) {
      throw new Error("ensureFavorite logic failed");
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
