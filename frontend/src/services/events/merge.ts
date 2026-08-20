import { CanonicalEvent, EventSource } from "@/types/event";
import { normalizeTitle, normalizeWebsite } from "@/services/events/normalize";

const SOURCE_PRIORITY: Record<EventSource, number> = {
  culture: 0,
  ntpc: 1,
};

function startDateKey(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function completenessScore(event: CanonicalEvent): number {
  let score = 0;
  if (event.imageUrl) score += 4;
  if (event.address) score += 2;
  if (event.description) score += 1;
  if (event.website) score += 1;
  return score;
}

function pickBetter(
  current: CanonicalEvent,
  candidate: CanonicalEvent,
): CanonicalEvent {
  const currentPriority = SOURCE_PRIORITY[current.source];
  const candidatePriority = SOURCE_PRIORITY[candidate.source];

  if (candidatePriority < currentPriority) return candidate;
  if (candidatePriority > currentPriority) return current;

  const currentScore = completenessScore(current);
  const candidateScore = completenessScore(candidate);
  if (candidateScore > currentScore) return candidate;
  return current;
}

export function mergeEvents(events: CanonicalEvent[]): CanonicalEvent[] {
  const byWebsite = new Map<string, CanonicalEvent>();
  const byTitleDate = new Map<string, CanonicalEvent>();
  const merged: CanonicalEvent[] = [];

  for (const event of events) {
    const websiteKey = normalizeWebsite(event.website);
    const titleDateKey = `${normalizeTitle(event.title)}|${startDateKey(event.startTime)}`;

    let existing: CanonicalEvent | undefined;
    if (websiteKey) {
      existing = byWebsite.get(websiteKey);
    }
    if (!existing && titleDateKey !== "|") {
      existing = byTitleDate.get(titleDateKey);
    }

    if (!existing) {
      merged.push(event);
      if (websiteKey) byWebsite.set(websiteKey, event);
      if (titleDateKey !== "|") byTitleDate.set(titleDateKey, event);
      continue;
    }

    const winner = pickBetter(existing, event);
    if (winner !== existing) {
      const index = merged.indexOf(existing);
      if (index >= 0) merged[index] = winner;
      if (websiteKey) byWebsite.set(websiteKey, winner);
      if (titleDateKey !== "|") byTitleDate.set(titleDateKey, winner);
    }
  }

  return merged.sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    return aTime - bTime;
  });
}

export function countBySource(events: CanonicalEvent[]): Record<EventSource, number> {
  return events.reduce(
    (acc, event) => {
      acc[event.source] += 1;
      return acc;
    },
    { culture: 0, ntpc: 0 } as Record<EventSource, number>,
  );
}
