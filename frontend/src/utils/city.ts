/** 縣市顯示名（台，不用臺）；順序依常見北到南 */
export const CITY_ORDER = [
  "台北市",
  "新北市",
  "基隆市",
  "桃園市",
  "新竹市",
  "新竹縣",
  "苗栗縣",
  "台中市",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義市",
  "嘉義縣",
  "台南市",
  "高雄市",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "台東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
] as const;

export type CityName = (typeof CITY_ORDER)[number];

/** 與 CityPicker.ALL_CITIES 同值 */
export const CITY_ALL_LABEL = "全部";

/** URL／i18n 穩定代號（勿用中文當 query） */
export enum CityCode {
  All = "all",
  Taipei = "taipei",
  NewTaipei = "newtaipei",
  Keelung = "keelung",
  Taoyuan = "taoyuan",
  HsinchuCity = "hsinchu-city",
  HsinchuCounty = "hsinchu-county",
  Miaoli = "miaoli",
  Taichung = "taichung",
  Changhua = "changhua",
  Nantou = "nantou",
  Yunlin = "yunlin",
  ChiayiCity = "chiayi-city",
  ChiayiCounty = "chiayi-county",
  Tainan = "tainan",
  Kaohsiung = "kaohsiung",
  Pingtung = "pingtung",
  Yilan = "yilan",
  Hualien = "hualien",
  Taitung = "taitung",
  Penghu = "penghu",
  Kinmen = "kinmen",
  Lienchiang = "lienchiang",
}

const CITY_NAME_TO_CODE: Record<CityName, CityCode> = {
  台北市: CityCode.Taipei,
  新北市: CityCode.NewTaipei,
  基隆市: CityCode.Keelung,
  桃園市: CityCode.Taoyuan,
  新竹市: CityCode.HsinchuCity,
  新竹縣: CityCode.HsinchuCounty,
  苗栗縣: CityCode.Miaoli,
  台中市: CityCode.Taichung,
  彰化縣: CityCode.Changhua,
  南投縣: CityCode.Nantou,
  雲林縣: CityCode.Yunlin,
  嘉義市: CityCode.ChiayiCity,
  嘉義縣: CityCode.ChiayiCounty,
  台南市: CityCode.Tainan,
  高雄市: CityCode.Kaohsiung,
  屏東縣: CityCode.Pingtung,
  宜蘭縣: CityCode.Yilan,
  花蓮縣: CityCode.Hualien,
  台東縣: CityCode.Taitung,
  澎湖縣: CityCode.Penghu,
  金門縣: CityCode.Kinmen,
  連江縣: CityCode.Lienchiang,
};

const CITY_CODE_TO_NAME: Record<CityCode, CityName | typeof CITY_ALL_LABEL> = {
  [CityCode.All]: CITY_ALL_LABEL,
  [CityCode.Taipei]: "台北市",
  [CityCode.NewTaipei]: "新北市",
  [CityCode.Keelung]: "基隆市",
  [CityCode.Taoyuan]: "桃園市",
  [CityCode.HsinchuCity]: "新竹市",
  [CityCode.HsinchuCounty]: "新竹縣",
  [CityCode.Miaoli]: "苗栗縣",
  [CityCode.Taichung]: "台中市",
  [CityCode.Changhua]: "彰化縣",
  [CityCode.Nantou]: "南投縣",
  [CityCode.Yunlin]: "雲林縣",
  [CityCode.ChiayiCity]: "嘉義市",
  [CityCode.ChiayiCounty]: "嘉義縣",
  [CityCode.Tainan]: "台南市",
  [CityCode.Kaohsiung]: "高雄市",
  [CityCode.Pingtung]: "屏東縣",
  [CityCode.Yilan]: "宜蘭縣",
  [CityCode.Hualien]: "花蓮縣",
  [CityCode.Taitung]: "台東縣",
  [CityCode.Penghu]: "澎湖縣",
  [CityCode.Kinmen]: "金門縣",
  [CityCode.Lienchiang]: "連江縣",
};

const CITY_CODE_VALUES = new Set<string>(Object.values(CityCode));

function unifyTai(value: string): string {
  return value.replace(/臺/g, "台").trim();
}

/** 統一顯示為「台」寫法（已知縣市回標準名，其餘只做台/臺轉換） */
export function displayCityName(
  raw?: string | null,
  labels?: Partial<Record<CityCode, string>> | Record<string, string>,
): string {
  if (!raw) return "";
  if (raw === CITY_ALL_LABEL || raw === CityCode.All) {
    return labels?.[CityCode.All] ?? CITY_ALL_LABEL;
  }
  const name = toCityName(raw);
  if (!name) return unifyTai(raw);
  const code = cityNameToCode(name);
  return labels?.[code] ?? name;
}

function cityAliases(city: CityName): string[] {
  const withTai = city.replace(/台/g, "臺");
  return withTai === city ? [city] : [city, withTai];
}

export function cityNameToCode(
  city: CityName | typeof CITY_ALL_LABEL,
): CityCode {
  if (city === CITY_ALL_LABEL) return CityCode.All;
  return CITY_NAME_TO_CODE[city];
}

export function cityCodeToName(
  code: CityCode,
): CityName | typeof CITY_ALL_LABEL {
  return CITY_CODE_TO_NAME[code];
}

/**
 * 寫進 URL 的 city query（代號）。
 * 無法辨識則 null。
 */
export function serializeCityForQuery(city?: string | null): string | null {
  const trimmed = city?.trim();
  if (!trimmed) return null;
  if (trimmed === CITY_ALL_LABEL) return CityCode.All;
  if (CITY_CODE_VALUES.has(trimmed)) return trimmed;
  const name = toCityName(trimmed);
  if (!name) return null;
  return CITY_NAME_TO_CODE[name];
}

/**
 * 解析 URL city（代號或舊中文）→ 內部中文名／全部。
 */
export function parseCityQuery(raw?: string | null): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  if (CITY_CODE_VALUES.has(trimmed)) {
    return CITY_CODE_TO_NAME[trimmed as CityCode];
  }
  if (trimmed === CITY_ALL_LABEL) return CITY_ALL_LABEL;
  return toCityName(trimmed) ?? undefined;
}

/** 從 API 的 cityName／地址抽出縣市，鄉鎮區不保留；也可解析 URL 代號 */
export function toCityName(raw?: string): CityName | null {
  if (!raw) return null;
  const text = unifyTai(raw);
  if (!text) return null;

  if (CITY_CODE_VALUES.has(text) && text !== CityCode.All) {
    const mapped = CITY_CODE_TO_NAME[text as CityCode];
    if (mapped !== CITY_ALL_LABEL) return mapped;
  }

  let best: CityName | null = null;
  let bestIndex = Number.POSITIVE_INFINITY;

  for (const city of CITY_ORDER) {
    for (const alias of cityAliases(city)) {
      const index = unifyTai(raw).indexOf(unifyTai(alias));
      if (index >= 0 && index < bestIndex) {
        best = city;
        bestIndex = index;
      }
    }
  }

  return best;
}

export function eventCityName(event: {
  cityName?: string;
  address?: string;
}): CityName | null {
  return toCityName(event.cityName) ?? toCityName(event.address);
}

/** 兩段縣市文字是否指同一縣市（台／臺、含地址比對） */
export function matchesCity(raw?: string, target?: string): boolean {
  if (!raw || !target) return false;
  const a = toCityName(raw);
  const b = toCityName(target);
  if (a && b) return a === b;
  return unifyTai(raw).includes(unifyTai(target));
}

export function eventMatchesCity(
  event: { cityName?: string; address?: string },
  target?: string,
): boolean {
  if (!target) return false;
  const normalized = eventCityName(event);
  const targetCity = toCityName(target);
  if (normalized && targetCity) return normalized === targetCity;
  const haystack = unifyTai(`${event.cityName ?? ""}${event.address ?? ""}`);
  return haystack.includes(unifyTai(target));
}

export function uniqueCityNames(
  events: Array<{ cityName?: string; address?: string }>,
): CityName[] {
  const present = new Set<CityName>();
  for (const event of events) {
    const city = eventCityName(event);
    if (city) present.add(city);
  }
  return CITY_ORDER.filter((city) => present.has(city));
}
