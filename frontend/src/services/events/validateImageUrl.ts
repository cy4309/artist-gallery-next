import { isDisplayableImageUrl } from "@/services/events/stockImageSearch";

const VALIDATE_TIMEOUT_MS = 6000;
const USER_AGENT =
  "ArtistGalleryBot/1.0 (+https://artistgallery.tw; image validation)";

const BLOCKED_HOSTS = new Set(["data-service", "localhost"]);

/** 排除內部 hostname、無 TLD、明顯非圖片路徑 */
export function isPlausiblePublicImageUrl(url: string): boolean {
  if (!isDisplayableImageUrl(url)) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    return false;
  }

  // 真實公開網域至少要有 .
  if (!host.includes(".")) return false;

  const path = parsed.pathname.toLowerCase();
  // 常見錯誤 og：/storage/seo、/seo 等目錄而非圖檔
  if (/\/seo\/?$/.test(path) && !/\.(jpe?g|png|gif|webp|avif|bmp)(\?|$)/i.test(path)) {
    return false;
  }

  return true;
}

/** 遠端 HEAD/GET 確認可當圖片顯示（FB CDN 等常會失敗） */
export async function validateRemoteImageUrl(url: string): Promise<boolean> {
  if (!isPlausiblePublicImageUrl(url)) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VALIDATE_TIMEOUT_MS);
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "image/*,*/*;q=0.8",
  };

  try {
    let res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers,
    });

    if (
      res.status === 405 ||
      res.status === 501 ||
      res.status === 403 ||
      res.status === 404
    ) {
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { ...headers, Range: "bytes=0-2047" },
      });
    }

    if (!res.ok) return false;

    const contentType = (res.headers.get("content-type") || "")
      .toLowerCase()
      .split(";")[0]
      .trim();
    return contentType.startsWith("image/");
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
