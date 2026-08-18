export const SITE_NAME = "CYC Zine";

export const SITE_DESCRIPTION = "探索台灣文化活動、獨立專欄與 CYC 獨立雜誌。";

/** 全站預設 OG 圖（1200×630 比例較佳，路徑相對 public/） */
export const DEFAULT_OG_IMAGE = "/images/cyc-logo.png";

export function getSiteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "https://cyc-zine.vercel.app";
}

export function getDefaultOgImageUrl(baseUrl = getSiteBaseUrl()): string {
  return `${baseUrl.replace(/\/$/, "")}${DEFAULT_OG_IMAGE}`;
}
