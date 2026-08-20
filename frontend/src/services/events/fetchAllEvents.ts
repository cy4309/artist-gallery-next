import { fetchCultureCanonicalEvents } from "@/services/events/adapters/culture";
import { fetchNtpcCanonicalEvents } from "@/services/events/adapters/ntpc";
import { countBySource, mergeEvents } from "@/services/events/merge";
import { CanonicalEvent } from "@/types/event";

export type FetchAllEventsResult = {
  events: CanonicalEvent[];
  meta: {
    total: number;
    mergedTotal: number;
    sources: Record<string, number>;
    fetchedAt: string;
    errors: Partial<Record<"culture" | "ntpc", string>>;
  };
};

export async function fetchAllCanonicalEvents(): Promise<FetchAllEventsResult> {
  const fetchedAt = new Date().toISOString();
  const errors: Partial<Record<"culture" | "ntpc", string>> = {};
  const batches: CanonicalEvent[][] = [];

  const [cultureResult, ntpcResult] = await Promise.allSettled([
    fetchCultureCanonicalEvents(),
    fetchNtpcCanonicalEvents(),
  ]);

  if (cultureResult.status === "fulfilled") {
    batches.push(cultureResult.value);
  } else {
    errors.culture =
      cultureResult.reason instanceof Error
        ? cultureResult.reason.message
        : "culture fetch failed";
  }

  if (ntpcResult.status === "fulfilled") {
    batches.push(ntpcResult.value);
  } else {
    errors.ntpc =
      ntpcResult.reason instanceof Error
        ? ntpcResult.reason.message
        : "ntpc fetch failed";
  }

  const raw = batches.flat();
  const events = mergeEvents(raw);

  return {
    events,
    meta: {
      total: raw.length,
      mergedTotal: events.length,
      sources: countBySource(raw),
      fetchedAt,
      errors,
    },
  };
}
