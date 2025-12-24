import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/server/authService";
import { GAS_ACTION } from "@/types/gas/actionConstants";

const GAS_URL = process.env.GAS_URL!;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: GAS_ACTION.LIST_FAVORITES,
        userId: user.id,
      }),
    });

    if (!res.ok) {
      throw new Error("GAS listFavorites failed");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[/api/favorites/list]", err);
    return NextResponse.json({ favorites: [] }, { status: 500 });
  }
}
