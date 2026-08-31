import { isPlausiblePublicImageUrl } from "@/services/events/validateImageUrl";

const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT =
  "ArtistGalleryBot/1.0 (+https://artistgallery.tw; event image enrichment)";

const NON_IMAGE_EXTENSIONS =
  /\.(pdf|djvu|djv|zip|webm|mp4|ogg|mov|avi|wmv|flv|mkv|doc|docx|xls|xlsx)(\?|#|$)/i;

function isHttpUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value.startsWith("http://") || value.startsWith("https://"))
  );
}

/** 排除明顯不是可顯示圖片的 URL（例如 Wikimedia 原檔 PDF） */
export function isDisplayableImageUrl(
  candidate: string,
  mime?: string | null,
): boolean {
  if (!isHttpUrl(candidate)) return false;

  const lower = candidate.toLowerCase();
  if (NON_IMAGE_EXTENSIONS.test(lower)) return false;

  if (mime) {
    const normalized = mime.toLowerCase().split(";")[0].trim();
    if (!normalized.startsWith("image/")) return false;
    if (normalized === "image/svg+xml") return false;
  }

  return true;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type OpenverseResponse = {
  results?: Array<{ url?: string; filetype?: string }>;
};

async function searchOpenverse(query: string): Promise<string | null> {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", query);
  url.searchParams.set("page_size", "8");
  url.searchParams.set(
    "license",
    "cc0,by,by-sa,by-nd,by-nc,by-nc-sa,by-nc-nd",
  );

  const data = await fetchJson<OpenverseResponse>(url.toString());
  const hit = data?.results?.find(
    (item) =>
      item.filetype?.startsWith("image") &&
      isDisplayableImageUrl(item.url ?? ""),
  );
  return hit?.url ?? null;
}

type WikimediaImageInfo = {
  thumburl?: string;
  url?: string;
  mime?: string;
};

type WikimediaResponse = {
  query?: {
    pages?: Record<
      string,
      {
        imageinfo?: WikimediaImageInfo[];
      }
    >;
  };
};

function pickWikimediaImage(info?: WikimediaImageInfo): string | null {
  if (!info) return null;

  // 優先縮圖（通常是 JPEG/PNG），避免 url 指向 PDF 原檔
  if (isDisplayableImageUrl(info.thumburl ?? "", info.mime)) {
    return info.thumburl!;
  }
  if (isDisplayableImageUrl(info.url ?? "", info.mime)) {
    return info.url!;
  }
  return null;
}

async function searchWikimedia(query: string): Promise<string | null> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
  url.searchParams.set("gsrlimit", "8");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime");
  url.searchParams.set("iiurlwidth", "1200");

  const data = await fetchJson<WikimediaResponse>(url.toString());
  const pages = data?.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages)) {
    const picked = pickWikimediaImage(page.imageinfo?.[0]);
    if (picked) return picked;
  }

  return null;
}

/** 依序用 Openverse → Wikimedia 搜尋第一張可用圖 */
export async function searchStockImageUrl(query: string): Promise<string | null> {
  const q = query.trim();
  if (q.length < 2) return null;

  const openverse = await searchOpenverse(q);
  if (openverse && isPlausiblePublicImageUrl(openverse)) return openverse;

  const wikimedia = await searchWikimedia(q);
  if (wikimedia && isPlausiblePublicImageUrl(wikimedia)) return wikimedia;

  return null;
}
