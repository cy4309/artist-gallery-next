/** 活動路由 / 收藏用的 canonical id 工具 */

import {
  EventCategoryId,
  serializeCategoriesForQuery,
} from "@/utils/eventCategories";

export function toCanonicalId(raw: string): string {
  const id = decodeEventPathId(raw).trim();
  if (!id) return "";

  if (id.includes(":")) return id;

  const dashed = id.match(/^(culture|ntpc)-(.+)$/);
  if (dashed) return `${dashed[1]}:${dashed[2]}`;

  return id;
}

export function decodeEventPathId(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** 乾淨路徑：/events/culture-901、/events/ntpc-abc123 */
export function eventDetailPath(canonicalId: string): string {
  const canonical = toCanonicalId(canonicalId);
  const parts = canonical.match(/^(culture|ntpc):(.+)$/);
  if (parts) {
    return `/events/${parts[1]}-${parts[2]}`;
  }
  return `/events/${encodeURIComponent(canonical)}`;
}

/** 詳情連結；可帶 categories 代號讓 Server 篩同城 peers（全選則不帶） */
export function eventDetailHref(
  canonicalId: string,
  categories?: EventCategoryId[] | null,
): string {
  const path = eventDetailPath(canonicalId);
  const query = serializeCategoriesForQuery(categories);
  if (!query) return path;
  return `${path}?categories=${query}`;
}

/**
 * 收藏 id 別名（僅 canonical ↔ dash 路徑格式）：
 * - culture:924 ↔ culture-924
 */
export function favoriteIdAliases(eventId: string): string[] {
  const id = String(eventId).trim();
  if (!id) return [];

  const aliases = new Set<string>([id]);
  const canonical = toCanonicalId(id);
  aliases.add(canonical);

  const parts = canonical.match(/^(culture|ntpc):(.+)$/);
  if (parts) {
    aliases.add(`${parts[1]}-${parts[2]}`);
  }

  if (id.startsWith("culture:")) {
    aliases.add(`culture-${id.slice("culture:".length)}`);
  } else if (id.startsWith("ntpc:")) {
    aliases.add(`ntpc-${id.slice("ntpc:".length)}`);
  }

  return [...aliases];
}

export function favoritesInclude(
  favorites: string[],
  eventId: string,
): boolean {
  const aliases = favoriteIdAliases(eventId);
  return favorites.some((f) => aliases.includes(String(f)));
}

export function findStoredFavoriteId(
  favorites: string[],
  eventId: string,
): string | null {
  const aliases = new Set(favoriteIdAliases(eventId));
  const hit = favorites.find((f) => aliases.has(String(f)));
  return hit ?? null;
}

