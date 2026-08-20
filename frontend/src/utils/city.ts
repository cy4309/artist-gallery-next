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

function unifyTai(value: string): string {
  return value.replace(/臺/g, "台").trim();
}

/** 統一顯示為「台」寫法（已知縣市回標準名，其餘只做台/臺轉換） */
export function displayCityName(raw?: string | null): string {
  if (!raw) return "";
  return toCityName(raw) ?? unifyTai(raw);
}

function cityAliases(city: CityName): string[] {
  const withTai = city.replace(/台/g, "臺");
  return withTai === city ? [city] : [city, withTai];
}

/** 從 API 的 cityName／地址抽出縣市，鄉鎮區不保留 */
export function toCityName(raw?: string): CityName | null {
  if (!raw) return null;
  const text = unifyTai(raw);
  if (!text) return null;

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
export function matchesCity(
  raw?: string,
  target?: string,
): boolean {
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
