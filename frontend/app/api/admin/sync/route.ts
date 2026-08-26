import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import { fetchAllCanonicalEvents } from "@/services/events/fetchAllEvents";
import { filterActiveEvents } from "@/services/events/filterActive";
import { writeEventsToSheet } from "@/services/server/eventsSheetService";
import { getDataBackend } from "@/services/server/dataBackendClient";

/**
 * 在「目前這台 Next」直接跑 sync（不再 HTTP 打 NEXT_PUBLIC_BASE_URL，
 * 避免本機 admin 誤觸發正式站 GAS）。
 */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backend = getDataBackend();
    const { events: rawEvents, meta } = await fetchAllCanonicalEvents();
    const events = filterActiveEvents(rawEvents);

    if (events.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          status: 502,
          result: {
            error: "No active events fetched, skipping write",
            meta: { ...meta, activeTotal: 0 },
            backend,
          },
        },
        { status: 502 },
      );
    }

    await writeEventsToSheet(events);

    return NextResponse.json({
      ok: true,
      status: 200,
      result: {
        ok: true,
        written: events.length,
        backend,
        meta: {
          ...meta,
          activeTotal: events.length,
          expiredFiltered: rawEvents.length - events.length,
        },
      },
    });
  } catch (error) {
    console.error("[/api/admin/sync]", error);
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        result: {
          error: error instanceof Error ? error.message : "Internal error",
          backend: getDataBackend(),
        },
      },
      { status: 500 },
    );
  }
}
