import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import { enrichEventsWithOgImages } from "@/services/events/enrichEventImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limitParam = req.nextUrl.searchParams.get("limit");
    const offsetParam = req.nextUrl.searchParams.get("offset");
    const limit = limitParam ? Number(limitParam) : undefined;
    const offset = offsetParam ? Number(offsetParam) : undefined;
    const result = await enrichEventsWithOgImages({
      limit: Number.isFinite(limit) && limit! > 0 ? limit : undefined,
      offset: Number.isFinite(offset) && offset! >= 0 ? offset : undefined,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[/api/admin/enrich-images]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
