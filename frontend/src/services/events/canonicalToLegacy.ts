import { CanonicalEvent, OrgEvent } from "@/types/event";
import { eventCityName } from "@/utils/city";
import { favoriteIdAliases, toCanonicalId } from "@/utils/eventId";

function toActId(event: CanonicalEvent): number {
  if (event.source === "culture" && event.sourceId) {
    const n = Number(event.sourceId);
    if (Number.isFinite(n)) return n;
  }
  let hash = 0;
  for (let i = 0; i < event.id.length; i += 1) {
    hash = (Math.imul(31, hash) + event.id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function canonicalToOrgEvent(event: CanonicalEvent): OrgEvent {
  return {
    id: event.id,
    source: event.source,
    actId: toActId(event),
    actName: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    cityName:
      eventCityName({ cityName: event.cityName, address: event.address }) ??
      event.cityName ??
      "",
    address: event.address,
    description: event.description,
    website: event.website,
    imageUrl: event.imageUrl,
  };
}

export function canonicalListToOrgEvents(events: CanonicalEvent[]): OrgEvent[] {
  return events.map(canonicalToOrgEvent);
}

/** 依路由 id（culture-901 等 dash 格式）找活動 */
export function findOrgEventByRouteId(
  events: OrgEvent[],
  rawId: string,
): OrgEvent | null {
  const id = toCanonicalId(rawId);
  if (!id) return null;

  const direct = events.find((event) => event.id === id);
  if (direct) return direct;

  for (const alias of favoriteIdAliases(id)) {
    const byId = events.find((event) => event.id === alias);
    if (byId) return byId;
  }

  return null;
}
