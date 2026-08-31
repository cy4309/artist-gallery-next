import { isPlausiblePublicImageUrl } from "@/services/events/validateImageUrl";

const FETCH_TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 512 * 1024;
const USER_AGENT =
  "Mozilla/5.0 (compatible; ArtistGalleryBot/1.0; +https://artistgallery.tw)";

const META_PATTERNS = [
  /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
  /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i,
];

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local")
  ) {
    return true;
  }

  if (host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;

  const octets = ipv4.slice(1).map((part) => Number(part));
  if (octets.some((n) => n > 255)) return true;

  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function assertSafeHttpUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("invalid url");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("unsupported protocol");
  }

  if (isPrivateHostname(url.hostname)) {
    throw new Error("blocked hostname");
  }

  return url;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMetaImage(html: string): string | null {
  for (const pattern of META_PATTERNS) {
    const match = html.match(pattern);
    const candidate = match?.[1]?.trim();
    if (candidate) return decodeHtmlEntities(candidate);
  }
  return null;
}

function resolveImageUrl(pageUrl: URL, candidate: string): string | null {
  try {
    const resolved = new URL(candidate, pageUrl);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return null;
    }
    if (isPrivateHostname(resolved.hostname)) {
      return null;
    }
    const url = resolved.toString();
    if (!isPlausiblePublicImageUrl(url)) return null;
    return url;
  } catch {
    return null;
  }
}

async function readHtmlWithLimit(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) {
    const text = await res.text();
    return text.slice(0, MAX_HTML_BYTES);
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (total < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    total += value.byteLength;
  }

  await reader.cancel().catch(() => undefined);

  const merged = new Uint8Array(Math.min(total, MAX_HTML_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    const slice = chunk.subarray(0, Math.max(0, MAX_HTML_BYTES - offset));
    merged.set(slice, offset);
    offset += slice.byteLength;
    if (offset >= MAX_HTML_BYTES) break;
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

export async function fetchOgImageUrl(
  website: string,
  options?: { timeoutMs?: number },
): Promise<string | null> {
  const timeoutMs = options?.timeoutMs ?? FETCH_TIMEOUT_MS;
  let pageUrl: URL;

  try {
    pageUrl = assertSafeHttpUrl(website);
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(pageUrl.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return null;
    }

    const html = await readHtmlWithLimit(res);
    const candidate = extractMetaImage(html);
    if (!candidate) return null;

    return resolveImageUrl(pageUrl, candidate);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
