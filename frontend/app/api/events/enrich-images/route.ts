export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { enrichEventsWithOgImages } from "@/services/events/enrichEventImages";

const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(req: NextRequest): boolean {
  if (!CRON_SECRET) return true;

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && auth.slice("Bearer ".length) === CRON_SECRET) {
    return true;
  }

  const syncHeader = req.headers.get("x-cron-secret");
  if (syncHeader === CRON_SECRET) return true;

  return false;
}

async function runEnrich(req: NextRequest) {
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const excludeIds = req.nextUrl.searchParams.get("excludeIds");

  const result = await enrichEventsWithOgImages({
    limit: Number.isFinite(limit) && limit! > 0 ? limit : undefined,
    excludeIds: excludeIds
      ? excludeIds.split(",").map((id) => id.trim()).filter(Boolean)
      : undefined,
  });

  return NextResponse.json({ ok: true, result });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runEnrich(req);
  } catch (error) {
    console.error("[/api/events/enrich-images] GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runEnrich(req);
  } catch (error) {
    console.error("[/api/events/enrich-images] POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
