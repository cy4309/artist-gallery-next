import { OrgEvent } from "@/types/event";

const ORG_API =
  "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindFestivalTypeJ";

export async function fetchOrgEvents(): Promise<OrgEvent[]> {
  const res = await fetch(ORG_API, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`ORG API failed: ${res.status}`);
  }

  return res.json();
}

export async function fetchOrgEventById(
  actId: string,
): Promise<OrgEvent | null> {
  const events = await fetchOrgEvents();
  return events.find((item) => String(item.actId) === String(actId)) ?? null;
}
