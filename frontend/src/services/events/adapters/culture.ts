import { CanonicalEvent } from "@/types/event";
import { fetchOrgEvents } from "@/services/server/orgDataServer";
import {
  resolveCityName,
  toEventIsoDate,
} from "@/services/events/normalize";

export async function fetchCultureCanonicalEvents(): Promise<CanonicalEvent[]> {
  const events = await fetchOrgEvents();
  const syncedAt = new Date().toISOString();

  return events.map((event) => {
    const sourceId = String(event.actId);
    const cityName =
      resolveCityName(event.cityName, event.address) ||
      event.cityName ||
      "";

    return {
      id: `culture:${sourceId}`,
      source: "culture",
      sourceId,
      title: event.actName ?? "",
      startTime: toEventIsoDate(event.startTime),
      endTime: toEventIsoDate(event.endTime, true),
      cityName,
      address: event.address ?? "",
      description: event.description ?? "",
      website: event.website ?? "",
      imageUrl: event.imageUrl ?? "",
      syncedAt,
    };
  });
}

export function cultureLegacyActId(event: CanonicalEvent): number | null {
  if (event.source !== "culture" || !event.sourceId) return null;
  const actId = Number(event.sourceId);
  return Number.isFinite(actId) ? actId : null;
}

export function cultureLegacyIdFromActId(actId: string | number): string {
  return `culture:${actId}`;
}

export function legacyActIdFromEventId(id: string): string | null {
  if (id.startsWith("culture:")) {
    return id.slice("culture:".length);
  }
  return null;
}
