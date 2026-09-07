/** 活動類型（Sheet／篩選內部仍用中文 id；URL 用 EventCategoryCode） */

export type EventCategoryId =
  | "節慶"
  | "展覽"
  | "音樂"
  | "戲劇"
  | "舞蹈"
  | "演唱會"
  | "獨立音樂"
  | "親子"
  | "講座／體驗"
  | "電影"
  | "綜藝"
  | "競賽"
  | "徵選"
  | "其他"
  | "活動／比賽"
  | "新北文化局";

/** URL／i18n 穩定代號（勿用中文當 query） */
export enum EventCategoryCode {
  Festival = "festival",
  Exhibition = "exhibition",
  Music = "music",
  Drama = "drama",
  Dance = "dance",
  Concert = "concert",
  Indie = "indie",
  Family = "family",
  Workshop = "workshop",
  Film = "film",
  Variety = "variety",
  Competition = "competition",
  Audition = "audition",
  Other = "other",
  Activity = "activity",
  Ntpc = "ntpc",
}

const CATEGORY_ID_TO_CODE: Record<EventCategoryId, EventCategoryCode> = {
  節慶: EventCategoryCode.Festival,
  展覽: EventCategoryCode.Exhibition,
  音樂: EventCategoryCode.Music,
  戲劇: EventCategoryCode.Drama,
  舞蹈: EventCategoryCode.Dance,
  演唱會: EventCategoryCode.Concert,
  獨立音樂: EventCategoryCode.Indie,
  親子: EventCategoryCode.Family,
  "講座／體驗": EventCategoryCode.Workshop,
  電影: EventCategoryCode.Film,
  綜藝: EventCategoryCode.Variety,
  競賽: EventCategoryCode.Competition,
  徵選: EventCategoryCode.Audition,
  其他: EventCategoryCode.Other,
  "活動／比賽": EventCategoryCode.Activity,
  新北文化局: EventCategoryCode.Ntpc,
};

const CATEGORY_CODE_TO_ID: Record<EventCategoryCode, EventCategoryId> = {
  [EventCategoryCode.Festival]: "節慶",
  [EventCategoryCode.Exhibition]: "展覽",
  [EventCategoryCode.Music]: "音樂",
  [EventCategoryCode.Drama]: "戲劇",
  [EventCategoryCode.Dance]: "舞蹈",
  [EventCategoryCode.Concert]: "演唱會",
  [EventCategoryCode.Indie]: "獨立音樂",
  [EventCategoryCode.Family]: "親子",
  [EventCategoryCode.Workshop]: "講座／體驗",
  [EventCategoryCode.Film]: "電影",
  [EventCategoryCode.Variety]: "綜藝",
  [EventCategoryCode.Competition]: "競賽",
  [EventCategoryCode.Audition]: "徵選",
  [EventCategoryCode.Other]: "其他",
  [EventCategoryCode.Activity]: "活動／比賽",
  [EventCategoryCode.Ntpc]: "新北文化局",
};

const CATEGORY_CODE_VALUES = new Set<string>(Object.values(EventCategoryCode));

export type EventCategoryOption = {
  id: EventCategoryId;
  code: EventCategoryCode;
  label: string;
};

/** 文化部 doFindTypeJ 代碼 → 中文類型 */
export const CULTURE_API_CATEGORY_MAP: Record<string, EventCategoryId> = {
  "1": "音樂",
  "2": "戲劇",
  "3": "舞蹈",
  "4": "親子",
  "5": "獨立音樂",
  "6": "展覽",
  "7": "講座／體驗",
  "8": "電影",
  "11": "綜藝",
  "13": "競賽",
  "14": "徵選",
  "15": "其他",
  "16": "活動／比賽",
  "17": "演唱會",
};

/** 舊版 id（festival / 數字 / ntpc）→ 中文 */
const LEGACY_CATEGORY_MAP: Record<string, EventCategoryId> = {
  festival: "節慶",
  ntpc: "新北文化局",
  ...CULTURE_API_CATEGORY_MAP,
};

export const CULTURE_TYPE_CATEGORY_IDS = Object.keys(
  CULTURE_API_CATEGORY_MAP,
) as Array<keyof typeof CULTURE_API_CATEGORY_MAP>;

export const EVENT_CATEGORY_OPTIONS: EventCategoryOption[] = [
  { id: "節慶", code: EventCategoryCode.Festival, label: "節慶" },
  { id: "展覽", code: EventCategoryCode.Exhibition, label: "展覽" },
  { id: "音樂", code: EventCategoryCode.Music, label: "音樂" },
  { id: "戲劇", code: EventCategoryCode.Drama, label: "戲劇" },
  { id: "舞蹈", code: EventCategoryCode.Dance, label: "舞蹈" },
  { id: "演唱會", code: EventCategoryCode.Concert, label: "演唱會" },
  { id: "獨立音樂", code: EventCategoryCode.Indie, label: "獨立音樂" },
  { id: "親子", code: EventCategoryCode.Family, label: "親子" },
  { id: "講座／體驗", code: EventCategoryCode.Workshop, label: "講座／體驗" },
  { id: "電影", code: EventCategoryCode.Film, label: "電影" },
  { id: "綜藝", code: EventCategoryCode.Variety, label: "綜藝" },
  { id: "競賽", code: EventCategoryCode.Competition, label: "競賽" },
  { id: "徵選", code: EventCategoryCode.Audition, label: "徵選" },
  { id: "其他", code: EventCategoryCode.Other, label: "其他" },
  { id: "活動／比賽", code: EventCategoryCode.Activity, label: "活動／比賽" },
  { id: "新北文化局", code: EventCategoryCode.Ntpc, label: "新北文化局" },
];

export const ALL_EVENT_CATEGORY_IDS: EventCategoryId[] =
  EVENT_CATEGORY_OPTIONS.map((option) => option.id);

const ALLOWED = new Set<string>(ALL_EVENT_CATEGORY_IDS);

const LOCAL_CATEGORIES_KEY = "cyc-event-categories";
/** v2：避免舊版「預設全選後直接確認」把全部寫進 localStorage */
const PREFS_VERSION = 2;

type StoredCategoryPrefs = {
  v: number;
  ids: EventCategoryId[];
};

export function categoryIdToCode(id: EventCategoryId): EventCategoryCode {
  return CATEGORY_ID_TO_CODE[id];
}

export function categoryCodeToId(code: EventCategoryCode): EventCategoryId {
  return CATEGORY_CODE_TO_ID[code];
}

export function normalizeCategoryId(raw?: string | null): EventCategoryId | "" {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (ALLOWED.has(value)) return value as EventCategoryId;
  if (CATEGORY_CODE_VALUES.has(value)) {
    return CATEGORY_CODE_TO_ID[value as EventCategoryCode];
  }
  if (value in LEGACY_CATEGORY_MAP) return LEGACY_CATEGORY_MAP[value];
  return "";
}

export function cultureApiCodeToCategory(code: string): EventCategoryId {
  return CULTURE_API_CATEGORY_MAP[code] ?? "其他";
}

function normalizeCategoryList(raw: unknown[]): EventCategoryId[] {
  const ids = raw
    .map((id) => normalizeCategoryId(String(id)))
    .filter((id): id is EventCategoryId => Boolean(id));
  return [...new Set(ids)];
}

export function isAllCategories(categories: EventCategoryId[]): boolean {
  if (categories.length !== ALL_EVENT_CATEGORY_IDS.length) return false;
  const set = new Set(categories);
  return ALL_EVENT_CATEGORY_IDS.every((id) => set.has(id));
}

/**
 * 寫進 URL 的 categories query。
 * 空或全選 → null（省略 param，避免超長網址）。
 */
export function serializeCategoriesForQuery(
  categories?: EventCategoryId[] | null,
): string | null {
  if (!categories?.length) return null;
  if (isAllCategories(categories)) return null;
  return categories.map(categoryIdToCode).join(",");
}

export function getEventCategoryLabel(
  event: {
    category?: string;
    source?: string;
  },
  labels?: Partial<Record<EventCategoryCode, string>> | Record<string, string>,
): string {
  const normalized = normalizeCategoryId(event.category);
  if (normalized) {
    const code = categoryIdToCode(normalized);
    return labels?.[code] ?? normalized;
  }
  if (event.source === "ntpc") {
    return labels?.[EventCategoryCode.Ntpc] ?? "新北文化局";
  }
  if (event.source === "culture") {
    return labels?.[EventCategoryCode.Festival] ?? "節慶";
  }
  return "";
}

export function getCategoryOptionLabel(
  id: EventCategoryId,
  labels?: Partial<Record<EventCategoryCode, string>> | Record<string, string>,
): string {
  const code = categoryIdToCode(id);
  return labels?.[code] ?? id;
}

export function parseCategoryQuery(
  raw?: string | null,
): EventCategoryId[] | null {
  if (!raw?.trim()) return null;
  const ids = raw
    .split(",")
    .map((part) => normalizeCategoryId(part.trim()))
    .filter((part): part is EventCategoryId => Boolean(part));
  return ids.length > 0 ? [...new Set(ids)] : null;
}

export function eventMatchesCategories(
  event: { category?: string; source?: string },
  categories: EventCategoryId[],
): boolean {
  if (categories.length === 0) return true;
  if (isAllCategories(categories)) return true;
  const set = new Set(categories);
  const normalized = normalizeCategoryId(event.category);
  if (normalized && set.has(normalized)) return true;

  if (!event.category) {
    if (event.source === "ntpc") return set.has("新北文化局");
    if (event.source === "culture") return set.has("節慶");
  }
  return false;
}

/** 記住使用者選的類型（跨分頁／重新開啟仍有效） */
export function loadSessionCategories(): EventCategoryId[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;

    // 舊格式：純陣列。若等於「全部」，多半是舊 UI 預設全選誤存 → 清掉重選
    if (Array.isArray(parsed)) {
      const ids = normalizeCategoryList(parsed);
      if (ids.length === 0 || isAllCategories(ids)) {
        localStorage.removeItem(LOCAL_CATEGORIES_KEY);
        return null;
      }
      saveSessionCategories(ids);
      return ids;
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "ids" in parsed &&
      Array.isArray((parsed as StoredCategoryPrefs).ids)
    ) {
      const prefs = parsed as StoredCategoryPrefs;
      const ids = normalizeCategoryList(prefs.ids);
      if (ids.length === 0) return null;
      if (prefs.v !== PREFS_VERSION) {
        saveSessionCategories(ids);
      }
      return ids;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveSessionCategories(categories: EventCategoryId[]): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeCategoryList(categories);
  if (normalized.length === 0) return;
  const payload: StoredCategoryPrefs = { v: PREFS_VERSION, ids: normalized };
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(payload));
}

export function clearSessionCategories(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_CATEGORIES_KEY);
  try {
    sessionStorage.removeItem("cyc-event-categories");
  } catch {
    // ignore
  }
}
