import { describe, expect, it } from "vitest";
import {
  buildCityBrowseFetchOptions,
  eventsListPath,
  parseEventsListSearchParams,
} from "@/utils/eventsListUrl";
import {
  ALL_EVENT_CATEGORY_IDS,
  EventCategoryCode,
  serializeCategoriesForQuery,
} from "@/utils/eventCategories";
import { CityCode, parseCityQuery, serializeCityForQuery } from "@/utils/city";

describe("eventsListUrl", () => {
  it("city／categories 皆用英文代號，無 % 編碼醜字", () => {
    const path = eventsListPath({
      city: "台北市",
      categories: ["展覽", "音樂"],
    });
    expect(path).toBe(
      `/events?city=${CityCode.Taipei}&categories=${EventCategoryCode.Exhibition},${EventCategoryCode.Music}`,
    );
    expect(path).not.toContain("%");
    expect(
      parseEventsListSearchParams(
        new URL(path, "https://example.com").searchParams,
      ),
    ).toEqual({ city: "台北市", categories: ["展覽", "音樂"] });
  });

  it("全選類型時 URL 不寫 categories", () => {
    expect(
      eventsListPath({ city: "基隆市", categories: ALL_EVENT_CATEGORY_IDS }),
    ).toBe(`/events?city=${CityCode.Keelung}`);
    expect(serializeCategoriesForQuery(ALL_EVENT_CATEGORY_IDS)).toBeNull();
  });

  it("全部縣市用 city=all", () => {
    expect(serializeCityForQuery("全部")).toBe(CityCode.All);
    expect(parseCityQuery("all")).toBe("全部");
    expect(eventsListPath({ city: "全部", categories: ["音樂"] })).toBe(
      `/events?city=${CityCode.All}&categories=${EventCategoryCode.Music}`,
    );
  });

  it("相容舊中文 city query", () => {
    expect(parseCityQuery("台北市")).toBe("台北市");
    expect(
      parseEventsListSearchParams(
        new URLSearchParams("city=%E5%8F%B0%E5%8C%97%E5%B8%82&categories=music"),
      ),
    ).toEqual({ city: "台北市", categories: ["音樂"] });
  });

  it("點台北且已選類型 → fetch options 帶中文 city（契約）", () => {
    expect(buildCityBrowseFetchOptions("台北市", ["展覽", "音樂"])).toEqual({
      city: "台北市",
      categories: ["展覽", "音樂"],
    });
  });

  it("全選類型時 fetch 只帶 city、不帶 categories", () => {
    expect(
      buildCityBrowseFetchOptions("台北市", ALL_EVENT_CATEGORY_IDS),
    ).toEqual({ city: "台北市" });
  });

  it("沒有 city 時不產生縣市瀏覽 fetch（禁止灌全國）", () => {
    expect(buildCityBrowseFetchOptions("", ["展覽"])).toBeNull();
    expect(buildCityBrowseFetchOptions(null, ["展覽"])).toBeNull();
  });

  it("city=全部 + 全選類型 → 空篩選（全台列表）", () => {
    expect(
      buildCityBrowseFetchOptions("全部", ALL_EVENT_CATEGORY_IDS),
    ).toEqual({});
    expect(buildCityBrowseFetchOptions("全部", [])).toEqual({});
  });

  it("city=全部 + 縮小類型 → 只帶 categories", () => {
    expect(buildCityBrowseFetchOptions("全部", ["音樂"])).toEqual({
      categories: ["音樂"],
    });
  });
});
