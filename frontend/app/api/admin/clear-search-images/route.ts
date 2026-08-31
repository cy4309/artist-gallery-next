import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import { clearAllSearchImages } from "@/services/events/clearAllSearchImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await clearAllSearchImages();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[/api/admin/clear-search-images]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
