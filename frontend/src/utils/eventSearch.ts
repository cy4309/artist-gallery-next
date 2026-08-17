import { OrgEvent } from "@/types/event";
import { eventCityName } from "@/utils/city";

export function filterEventsByKeyword(
  events: OrgEvent[],
  query: string,
): OrgEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return events;

  return events.filter((event) => {
    const haystack = [
      event.actName,
      event.description,
      event.address,
      event.cityName,
      eventCityName(event),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
