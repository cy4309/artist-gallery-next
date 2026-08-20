import { listEventsFromSheet } from "@/services/server/eventsSheetService";
import { fetchAllCanonicalEvents } from "@/services/events/fetchAllEvents";
import {
  canonicalListToOrgEvents,
  canonicalToOrgEvent,
} from "@/services/events/canonicalToLegacy";
import { filterActiveEvents } from "@/services/events/filterActive";
import { favoriteIdAliases, toCanonicalId } from "@/utils/eventId";
import { CanonicalEvent, OrgEvent } from "@/types/event";

async function getCanonicalEvents(): Promise<CanonicalEvent[]> {
  try {
    const events = filterActiveEvents(await listEventsFromSheet());
    if (events.length > 0) return events;
  } catch {
    // fallthrough to live
  }

  const { events } = await fetchAllCanonicalEvents();
  return filterActiveEvents(events);
}

/** Server 側 CanonicalEvent 列表（Sheet → fallback live） */
export async function fetchCanonicalEvents(): Promise<CanonicalEvent[]> {
  return getCanonicalEvents();
}

/** Server 側 OrgEvent 列表（給 sitemap / OG layout 用） */
export async function fetchOrgEventsFromSheet(): Promise<OrgEvent[]> {
  const events = await getCanonicalEvents();
  return canonicalListToOrgEvents(events);
}

/** 透過 canonical id 或 dash 路徑 id 找活動 */
export async function fetchCanonicalEventById(
  rawId: string,
): Promise<CanonicalEvent | null> {
  const id = toCanonicalId(rawId);
  if (!id) return null;

  const events = await getCanonicalEvents();

  const direct = events.find((event) => event.id === id);
  if (direct) return direct;

  for (const alias of favoriteIdAliases(id)) {
    const hit = events.find((event) => event.id === alias);
    if (hit) return hit;
  }

  return null;
}

/** 路由 id（culture-901 / culture:901）→ OrgEvent */
export async function fetchOrgEventByActId(
  routeId: string,
): Promise<OrgEvent | null> {
  const event = await fetchCanonicalEventById(routeId);
  return event ? canonicalToOrgEvent(event) : null;
}

export async function fetchOrgEventByRouteId(
  routeId: string,
): Promise<OrgEvent | null> {
  return fetchOrgEventByActId(routeId);
}
