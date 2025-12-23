import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/server/authService";
import { GAS_ACTION } from "@/types/gas/actionConstants";

const GAS_URL = process.env.GAS_URL!;

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Missing eventId" },
        { status: 400 }
      );
    }

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: GAS_ACTION.CHECK_FAVORITE,
        userId: user.id,
        eventId,
      }),
    });

    if (!res.ok) {
      throw new Error("GAS checkFavorite failed");
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      isFavorite: Boolean(data?.isFavorite),
    });
  } catch (err: any) {
    console.error("[/api/favorites/check]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
