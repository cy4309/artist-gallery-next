/**
 * 文化部圖片（cloud.culture.tw）專用 proxy
 * 保證回傳 https-safe 的圖片 URL
 * 文化部 cloud.culture.tw 的圖片，在前端請用 http://，不是 https://，這支供前端使用
 */
export function getCultureImageUrl(path?: string) {
  if (!path) return "/images/placeholder-no-image.png";

  // 如果已經是完整 URL（http 或 https），直接用
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(path)}`;
  }

  // 確保 path 以 / 開頭
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  /**
   * 策略：
   * - 先假設 https（現在有些政府單位其實有）
   * - proxy 抓不到再由 proxy 自己 fallback（或你未來加）
   */
  const rawUrl = `https://cloud.culture.tw${normalizedPath}`;

  return `/api/image-proxy?url=${encodeURIComponent(rawUrl)}`;
}
