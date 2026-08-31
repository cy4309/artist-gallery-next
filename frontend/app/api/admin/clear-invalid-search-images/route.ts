import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import { clearInvalidSupplementalImages } from "@/services/events/clearInvalidSearchImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await clearInvalidSupplementalImages();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[/api/admin/clear-invalid-search-images]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
