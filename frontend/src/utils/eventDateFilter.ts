import { OrgEvent } from "@/types/event";

export type EventDateFilter = {
  from?: string;
  to?: string;
};

export function hasEventDateFilter(filter: EventDateFilter): boolean {
  return Boolean(filter.from?.trim() || filter.to?.trim());
}

/** 解析活動日期字串（ISO、YYYY-MM-DD 等） */
export function parseEventDate(value?: string): Date | null {
  if (!value?.trim()) return null;
  const raw = value.trim();

  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) return iso;

  const match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) return null;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function parseFilterBoundary(value: string, end: boolean): Date | null {
  const parsed = parseEventDate(value);
  if (!parsed) return null;
  return end ? endOfDay(parsed) : startOfDay(parsed);
}

/** 活動期間是否與篩選區間重疊 */
export function eventOverlapsDateRange(
  event: Pick<OrgEvent, "startTime" | "endTime">,
  filter: EventDateFilter,
): boolean {
  if (!hasEventDateFilter(filter)) return true;

  const rangeStart = filter.from
    ? parseFilterBoundary(filter.from, false)
    : null;
  const rangeEnd = filter.to ? parseFilterBoundary(filter.to, true) : null;

  const eventStart = parseEventDate(event.startTime);
  const eventEnd = parseEventDate(event.endTime || event.startTime);

  if (!eventStart && !eventEnd) return false;

  const effectiveStart = startOfDay(eventStart ?? eventEnd!);
  const effectiveEnd = endOfDay(eventEnd ?? eventStart!);

  if (rangeStart && effectiveEnd < rangeStart) return false;
  if (rangeEnd && effectiveStart > rangeEnd) return false;
  return true;
}

export function filterEventsByDateRange(
  events: OrgEvent[],
  filter: EventDateFilter,
): OrgEvent[] {
  if (!hasEventDateFilter(filter)) return events;
  return events.filter((event) => eventOverlapsDateRange(event, filter));
}
