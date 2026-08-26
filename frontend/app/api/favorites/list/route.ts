import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/server/authService";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { postToDataBackend } from "@/services/server/dataBackendClient";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    const data = await postToDataBackend<{ favorites?: unknown[] }>({
      action: GAS_ACTION.LIST_FAVORITES,
      userId: user.id,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[/api/favorites/list]", err);
    return NextResponse.json({ favorites: [] }, { status: 500 });
  }
}
