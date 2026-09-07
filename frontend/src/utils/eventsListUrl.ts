import {
  EventCategoryId,
  isAllCategories,
  parseCategoryQuery,
  serializeCategoriesForQuery,
} from "@/utils/eventCategories";
import {
  CITY_ALL_LABEL,
  parseCityQuery,
  serializeCityForQuery,
} from "@/utils/city";

/** 與 CityPicker.ALL_CITIES 同值 */
export const EVENTS_LIST_ALL_CITIES = CITY_ALL_LABEL;

export type EventsListUrlState = {
  /** 內部中文縣市名或「全部」 */
  city?: string;
  categories?: EventCategoryId[];
};

export function parseEventsListSearchParams(
  params: Pick<URLSearchParams, "get">,
): EventsListUrlState {
  const city = parseCityQuery(params.get("city"));
  const categories = parseCategoryQuery(params.get("categories")) ?? undefined;
  return {
    city,
    categories: categories?.length ? categories : undefined,
  };
}

/** 組出列表 path；city／categories 皆用代號，逗號不編碼 */
export function eventsListPath(state: EventsListUrlState): string {
  const parts: string[] = [];
  const cityQuery = serializeCityForQuery(state.city);
  if (cityQuery) parts.push(`city=${cityQuery}`);
  const categoriesQuery = serializeCategoriesForQuery(state.categories);
  if (categoriesQuery) parts.push(`categories=${categoriesQuery}`);
  return parts.length > 0 ? `/events?${parts.join("&")}` : "/events";
}

/**
 * 縣市瀏覽打 /api/events 的參數。
 * - 沒有 city → null
 * - city=全部 + 有縮小類型 → 只帶 categories
 * - city=全部 + 全選類型 → {}（不過濾，等同舊版全台列表）
 * - 一般縣市 → 帶中文 city；全選類型時不帶 categories
 */
export function buildCityBrowseFetchOptions(
  city: string | null | undefined,
  categories?: EventCategoryId[] | null,
): { city?: string; categories?: EventCategoryId[] } | null {
  const trimmed = city?.trim();
  if (!trimmed) return null;

  const cats =
    categories && categories.length > 0 && !isAllCategories(categories)
      ? [...categories]
      : undefined;

  if (trimmed === EVENTS_LIST_ALL_CITIES) {
    if (!cats?.length) return {};
    return { categories: cats };
  }

  return cats?.length ? { city: trimmed, categories: cats } : { city: trimmed };
}
