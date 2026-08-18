import { OrgEvent } from "@/types/event";

const ORG_API =
  "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindFestivalTypeJ";

function buildCultureRawUrls(path: string): string[] {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return [path];
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return [
    `https://cloud.culture.tw${normalizedPath}`,
    `http://cloud.culture.tw${normalizedPath}`,
  ];
}

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

export async function fetchCultureImageResponse(
  path?: string,
): Promise<Response | null> {
  if (!path) return null;

  for (const url of buildCultureRawUrls(path)) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return res;
    } catch {
      // try next URL
    }
  }

  return null;
}
