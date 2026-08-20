/**
 * 文化部圖片（cloud.culture.tw）專用 proxy
 * 保證回傳 https-safe 的圖片 URL
 * 文化部 cloud.culture.tw 的圖片，在前端請用 http://，不是 https://，這支供前端使用
 */
import { eventDetailPath } from "@/utils/eventId";

function buildCultureRawUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `https://cloud.culture.tw${normalizedPath}`;
}

export function getCultureImageUrl(path?: string) {
  if (!path) return "/images/placeholder-no-image.png";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(path)}`;
  }

  return `/api/image-proxy?url=${encodeURIComponent(buildCultureRawUrl(path))}`;
}

/** 供 Open Graph / 爬蟲使用的絕對 HTTPS 圖片 URL */
export function getCultureImageAbsoluteUrl(
  path: string | undefined,
  baseUrl: string,
): string {
  const origin = baseUrl.replace(/\/$/, "");
  if (!path) return `${origin}/images/placeholder-no-image.png`;

  const rawUrl = buildCultureRawUrl(path);
  return `${origin}/api/image-proxy?url=${encodeURIComponent(rawUrl)}`;
}

/** 活動分享用 OG 圖（路徑用 culture-901 格式，不用 %3A） */
export function getEventOgImageUrl(
  eventId: number | string,
  baseUrl: string,
): string {
  const segment =
    typeof eventId === "string" && eventId.includes(":")
      ? eventDetailPath(eventId).replace(/^\/events\//, "")
      : String(eventId);
  return `${baseUrl.replace(/\/$/, "")}/api/og/event/${encodeURIComponent(segment)}`;
}
