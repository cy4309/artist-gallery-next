import { OrgEvent } from "@/types/event";
import { eventCityName } from "@/utils/city";
import {
  EventDateFilter,
  filterEventsByDateRange,
  hasEventDateFilter,
} from "@/utils/eventDateFilter";

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

export function hasKeywordSearch(query?: string): boolean {
  return Boolean(query?.trim());
}

export function filterEvents(
  events: OrgEvent[],
  options: { query?: string; date?: EventDateFilter },
): OrgEvent[] {
  let list = events;
  if (options.query?.trim()) {
    list = filterEventsByKeyword(list, options.query);
  }
  if (options.date && hasEventDateFilter(options.date)) {
    list = filterEventsByDateRange(list, options.date);
  }
  return list;
}

/** @deprecated 關鍵字與日期篩選 scope 不同，請改用 hasKeywordSearch / hasEventDateFilter */
export function hasEventSearchFilter(options: {
  query?: string;
  date?: EventDateFilter;
}): boolean {
  return hasKeywordSearch(options.query) || hasEventDateFilter(options.date ?? {});
}
