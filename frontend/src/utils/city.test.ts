import { describe, expect, it } from "vitest";
import {
  CityCode,
  cityCodeToName,
  cityNameToCode,
  displayCityName,
  parseCityQuery,
  serializeCityForQuery,
  toCityName,
} from "@/utils/city";

describe("CityCode", () => {
  it("中文 ↔ 代號雙向", () => {
    expect(cityNameToCode("台北市")).toBe(CityCode.Taipei);
    expect(cityCodeToName(CityCode.Taipei)).toBe("台北市");
    expect(cityNameToCode("基隆市")).toBe(CityCode.Keelung);
    expect(serializeCityForQuery("新竹縣")).toBe(CityCode.HsinchuCounty);
    expect(toCityName("hsinchu-county")).toBe("新竹縣");
  });

  it("parse 代號與舊中文", () => {
    expect(parseCityQuery("taipei")).toBe("台北市");
    expect(parseCityQuery("台北市")).toBe("台北市");
    expect(parseCityQuery("all")).toBe("全部");
  });

  it("displayCityName 可依語系 labels 顯示", () => {
    expect(displayCityName("台北市")).toBe("台北市");
    expect(
      displayCityName("台北市", { [CityCode.Taipei]: "Taipei City" }),
    ).toBe("Taipei City");
    expect(displayCityName("全部", { [CityCode.All]: "All cities" })).toBe(
      "All cities",
    );
  });
});
