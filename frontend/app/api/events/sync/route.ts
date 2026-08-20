export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { fetchAllCanonicalEvents } from "@/services/events/fetchAllEvents";
import { filterActiveEvents } from "@/services/events/filterActive";
import { writeEventsToSheet } from "@/services/server/eventsSheetService";

const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(req: NextRequest): boolean {
  // 未設定 → 本機開發方便，不擋
  if (!CRON_SECRET) return true;

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && auth.slice("Bearer ".length) === CRON_SECRET) {
    return true;
  }

  // 手動觸發可用同一 secret
  const syncHeader = req.headers.get("x-cron-secret");
  if (syncHeader === CRON_SECRET) return true;

  return false;
}

async function runSync() {
  const { events: rawEvents, meta } = await fetchAllCanonicalEvents();
  const events = filterActiveEvents(rawEvents);

  if (events.length === 0) {
    return NextResponse.json(
      {
        error: "No active events fetched, skipping Sheet write",
        meta: { ...meta, activeTotal: 0 },
      },
      { status: 502 },
    );
  }

  await writeEventsToSheet(events);

  return NextResponse.json({
    ok: true,
    written: events.length,
    meta: {
      ...meta,
      activeTotal: events.length,
      expiredFiltered: rawEvents.length - events.length,
    },
  });
}

/** Vercel Cron 預設打 GET；手動／腳本可用 POST */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runSync();
  } catch (error) {
    console.error("[/api/events/sync] GET error:", error);
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
    return await runSync();
  } catch (error) {
    console.error("[/api/events/sync] POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
