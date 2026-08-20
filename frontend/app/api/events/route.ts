export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { listEventsFromSheet } from "@/services/server/eventsSheetService";
import { fetchAllCanonicalEvents } from "@/services/events/fetchAllEvents";
import { filterActiveEvents } from "@/services/events/filterActive";

export async function GET() {
  const fetchedAt = new Date().toISOString();

  try {
    let events = filterActiveEvents(await listEventsFromSheet());

    if (events.length > 0) {
      return NextResponse.json(
        { events, meta: { total: events.length, source: "sheet", fetchedAt } },
        { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } },
      );
    }

    console.warn("[/api/events] Sheet empty, falling back to live merge");
    const result = await fetchAllCanonicalEvents();
    events = filterActiveEvents(result.events);

    return NextResponse.json(
      {
        events,
        meta: { ...result.meta, total: events.length, source: "live" },
      },
      { headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=30" } },
    );
  } catch (sheetError) {
    console.warn("[/api/events] Sheet failed, falling back to live:", sheetError);

    try {
      const result = await fetchAllCanonicalEvents();
      const events = filterActiveEvents(result.events);
      return NextResponse.json(
        {
          events,
          meta: { ...result.meta, total: events.length, source: "live" },
        },
        { headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=30" } },
      );
    } catch (liveError) {
      console.error("[/api/events] both Sheet and live failed:", liveError);
      return NextResponse.json(
        { error: "All event sources unavailable" },
        { status: 502 },
      );
    }
  }
}
