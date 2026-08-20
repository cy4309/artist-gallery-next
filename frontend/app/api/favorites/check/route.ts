import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/server/authService";
import { isFavoriteWithAliases } from "@/services/server/favoriteIdResolve";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Missing eventId" },
        { status: 400 },
      );
    }

    const isFavorite = await isFavoriteWithAliases(user.id, eventId);

    return NextResponse.json({
      success: true,
      isFavorite,
    });
  } catch (err: unknown) {
    console.error("[/api/favorites/check]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 },
    );
  }
}
