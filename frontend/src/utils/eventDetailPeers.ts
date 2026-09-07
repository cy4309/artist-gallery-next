import { CanonicalEvent } from "@/types/event";
import { eventMatchesCity } from "@/utils/city";
import {
  EventCategoryId,
  eventMatchesCategories,
} from "@/utils/eventCategories";
import {
  canonicalListToOrgEvents,
  findOrgEventByRouteId,
} from "@/services/events/canonicalToLegacy";

/**
 * 詳情頁同城 peers（與 /api/events?id= 邏輯一致）。
 * 有 categories 時篩同城；目前這筆一定保留。
 */
export function buildEventDetailCityPeers(
  events: CanonicalEvent[],
  routeId: string,
  categories?: EventCategoryId[] | null,
): CanonicalEvent[] {
  const orgEvents = canonicalListToOrgEvents(events);
  const hit = findOrgEventByRouteId(orgEvents, routeId);
  if (!hit) return [];

  const hitCanonical =
    events.find((event) => event.id === hit.id) ??
    events.find(
      (event) =>
        eventMatchesCity(event, hit.cityName) && event.title === hit.actName,
    );

  let cityPeers = events.filter((event) =>
    eventMatchesCity(event, hit.cityName),
  );

  if (categories && categories.length > 0) {
    cityPeers = cityPeers.filter((event) =>
      eventMatchesCategories(event, categories),
    );
  }

  if (hitCanonical && !cityPeers.some((event) => event.id === hitCanonical.id)) {
    cityPeers = [hitCanonical, ...cityPeers];
  }

  return cityPeers;
}
