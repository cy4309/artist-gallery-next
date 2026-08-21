import { canonicalListToOrgEvents } from "@/services/events/canonicalToLegacy";
import { CanonicalEvent } from "@/types/event";

export type GetOrgDataOptions = {
  city?: string;
  categories?: string[];
  id?: string;
};

export async function getOrgData(options: GetOrgDataOptions = {}) {
  const params = new URLSearchParams();
  if (options.city) params.set("city", options.city);
  if (options.categories?.length) {
    params.set("categories", options.categories.join(","));
  }
  if (options.id) params.set("id", options.id);

  const query = params.toString();
  const res = await fetch(query ? `/api/events?${query}` : "/api/events");

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const json = (await res.json()) as { events?: CanonicalEvent[] };
  const events: CanonicalEvent[] = Array.isArray(json.events) ? json.events : [];
  return canonicalListToOrgEvents(events);
}
