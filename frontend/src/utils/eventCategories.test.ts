import { describe, expect, it } from "vitest";
import {
  EventCategoryCode,
  categoryCodeToId,
  categoryIdToCode,
  normalizeCategoryId,
  parseCategoryQuery,
  serializeCategoriesForQuery,
  ALL_EVENT_CATEGORY_IDS,
} from "@/utils/eventCategories";

describe("EventCategoryCode", () => {
  it("中文 id ↔ 代號雙向對得起來", () => {
    expect(categoryIdToCode("展覽")).toBe(EventCategoryCode.Exhibition);
    expect(categoryCodeToId(EventCategoryCode.Exhibition)).toBe("展覽");
    expect(normalizeCategoryId("exhibition")).toBe("展覽");
    expect(normalizeCategoryId("展覽")).toBe("展覽");
  });

  it("serialize 用代號；全選省略", () => {
    expect(serializeCategoriesForQuery(["音樂", "展覽"])).toBe(
      "music,exhibition",
    );
    expect(serializeCategoriesForQuery(ALL_EVENT_CATEGORY_IDS)).toBeNull();
  });

  it("parse 代號與舊中文", () => {
    expect(parseCategoryQuery("music,exhibition")).toEqual(["音樂", "展覽"]);
    expect(parseCategoryQuery("音樂,展覽")).toEqual(["音樂", "展覽"]);
  });
});
