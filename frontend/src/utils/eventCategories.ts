/** 活動類型（寫入 Sheet／篩選一律用中文名稱） */

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

export type EventCategoryOption = {
  id: EventCategoryId;
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
  { id: "節慶", label: "節慶" },
  { id: "展覽", label: "展覽" },
  { id: "音樂", label: "音樂" },
  { id: "戲劇", label: "戲劇" },
  { id: "舞蹈", label: "舞蹈" },
  { id: "演唱會", label: "演唱會" },
  { id: "獨立音樂", label: "獨立音樂" },
  { id: "親子", label: "親子" },
  { id: "講座／體驗", label: "講座／體驗" },
  { id: "電影", label: "電影" },
  { id: "綜藝", label: "綜藝" },
  { id: "競賽", label: "競賽" },
  { id: "徵選", label: "徵選" },
  { id: "其他", label: "其他" },
  { id: "活動／比賽", label: "活動／比賽" },
  { id: "新北文化局", label: "新北文化局" },
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

export function normalizeCategoryId(raw?: string | null): EventCategoryId | "" {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (ALLOWED.has(value)) return value as EventCategoryId;
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

export function getEventCategoryLabel(event: {
  category?: string;
  source?: string;
}): string {
  const normalized = normalizeCategoryId(event.category);
  if (normalized) return normalized;
  if (event.source === "ntpc") return "新北文化局";
  if (event.source === "culture") return "節慶";
  return "";
}

export function parseCategoryQuery(
  raw?: string | null,
): EventCategoryId[] | null {
  if (!raw?.trim()) return null;
  const ids = raw
    .split(",")
    .map((part) => normalizeCategoryId(part))
    .filter((part): part is EventCategoryId => Boolean(part));
  return ids.length > 0 ? [...new Set(ids)] : null;
}

export function eventMatchesCategories(
  event: { category?: string; source?: string },
  categories: EventCategoryId[],
): boolean {
  if (categories.length === 0) return true;
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
