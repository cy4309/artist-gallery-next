export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { listEventsFromSheet } from "@/services/server/eventsSheetService";
import { fetchAllCanonicalEvents } from "@/services/events/fetchAllEvents";
import { filterActiveEvents } from "@/services/events/filterActive";
import { eventMatchesCity } from "@/utils/city";
import {
  eventMatchesCategories,
  parseCategoryQuery,
} from "@/utils/eventCategories";
import { findOrgEventByRouteId } from "@/services/events/canonicalToLegacy";
import { canonicalListToOrgEvents } from "@/services/events/canonicalToLegacy";
import { CanonicalEvent } from "@/types/event";

async function loadEvents(): Promise<{
  events: CanonicalEvent[];
  source: "sheet" | "live";
  meta?: Record<string, unknown>;
}> {
  try {
    const sheetEvents = filterActiveEvents(await listEventsFromSheet());
    if (sheetEvents.length > 0) {
      return { events: sheetEvents, source: "sheet" };
    }
    console.warn("[/api/events] Sheet empty, falling back to live merge");
  } catch (sheetError) {
    console.warn("[/api/events] Sheet failed, falling back to live:", sheetError);
  }

  const result = await fetchAllCanonicalEvents();
  return {
    events: filterActiveEvents(result.events),
    source: "live",
    meta: result.meta as unknown as Record<string, unknown>,
  };
}

function filterEvents(
  events: CanonicalEvent[],
  options: {
    city?: string | null;
    categories?: ReturnType<typeof parseCategoryQuery>;
    id?: string | null;
  },
): CanonicalEvent[] {
  // 詳情頁：同城活動；若有 categories 則一併篩選（仍保留目前這筆）
  if (options.id) {
    const orgEvents = canonicalListToOrgEvents(events);
    const hit = findOrgEventByRouteId(orgEvents, options.id);
    if (!hit) return [];

    const hitCanonical =
      events.find((event) => event.id === hit.id) ??
      events.find((event) =>
        eventMatchesCity(event, hit.cityName) && event.title === hit.actName,
      );

    let cityPeers = events.filter((event) =>
      eventMatchesCity(event, hit.cityName),
    );

    if (options.categories && options.categories.length > 0) {
      cityPeers = cityPeers.filter((event) =>
        eventMatchesCategories(event, options.categories!),
      );
    }

    if (hitCanonical && !cityPeers.some((event) => event.id === hitCanonical.id)) {
      cityPeers = [hitCanonical, ...cityPeers];
    }

    return cityPeers;
  }

  let list = events;

  if (options.city) {
    list = list.filter((event) => eventMatchesCity(event, options.city!));
  }

  if (options.categories && options.categories.length > 0) {
    list = list.filter((event) =>
      eventMatchesCategories(event, options.categories!),
    );
  }

  return list;
}

export async function GET(req: NextRequest) {
  const fetchedAt = new Date().toISOString();
  const city = req.nextUrl.searchParams.get("city");
  const categories = parseCategoryQuery(
    req.nextUrl.searchParams.get("categories"),
  );
  const id = req.nextUrl.searchParams.get("id");

  try {
    const loaded = await loadEvents();
    const events = filterEvents(loaded.events, { city, categories, id });

    return NextResponse.json(
      {
        events,
        meta: {
          total: events.length,
          source: loaded.source,
          fetchedAt,
          city: city || undefined,
          categories: categories || undefined,
          ...(loaded.meta ?? {}),
        },
      },
      {
        headers: {
          "Cache-Control":
            loaded.source === "sheet"
              ? "s-maxage=300, stale-while-revalidate=60"
              : "s-maxage=120, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    console.error("[/api/events] failed:", error);
    return NextResponse.json(
      { error: "All event sources unavailable" },
      { status: 502 },
    );
  }
}
