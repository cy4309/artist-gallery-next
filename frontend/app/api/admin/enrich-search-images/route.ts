import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import { enrichEventsWithSearchImages } from "@/services/events/enrichEventSearchImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function parseExcludeIds(req: NextRequest, body?: { excludeIds?: unknown }): string[] {
  if (Array.isArray(body?.excludeIds)) {
    return body.excludeIds.map((id) => String(id)).filter(Boolean);
  }

  const raw = req.nextUrl.searchParams.get("excludeIds");
  if (!raw) return [];
  return raw.split(",").map((id) => id.trim()).filter(Boolean);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: { excludeIds?: unknown } = {};
    try {
      body = (await req.json()) as { excludeIds?: unknown };
    } catch {
      body = {};
    }

    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;
    const result = await enrichEventsWithSearchImages({
      limit: Number.isFinite(limit) && limit! > 0 ? limit : undefined,
      excludeIds: parseExcludeIds(req, body),
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[/api/admin/enrich-search-images]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
