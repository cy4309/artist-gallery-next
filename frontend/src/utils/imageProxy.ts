/**
 * 文化部圖片（cloud.culture.tw）專用 proxy
 * 保證回傳 https-safe 的圖片 URL
 * 文化部 cloud.culture.tw 的圖片，在前端請用 http://，不是 https://
 */
export function getCultureImageUrl(path?: string) {
  if (!path) return "/images/placeholder.jpg";

  // 確保 path 以 / 開頭
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const rawUrl = `http://cloud.culture.tw${normalizedPath}`;

  return `/api/image-proxy?url=${encodeURIComponent(rawUrl)}`;
}
