import { describe, expect, it } from "vitest";
import { zh } from "@/locales/zh";
import {
  EVENT_NOT_FOUND_MESSAGE,
  isEventDetailNotFound,
} from "@/utils/eventDetailCopy";

describe("eventDetailCopy", () => {
  it("假 id／查無活動 → 顯示「找不到這個活動」", () => {
    expect(isEventDetailNotFound("success", null)).toBe(true);
    expect(isEventDetailNotFound("success", undefined)).toBe(true);
    expect(EVENT_NOT_FOUND_MESSAGE).toBe("找不到這個活動");
    expect(zh.events.notFound).toBe(EVENT_NOT_FOUND_MESSAGE);
  });

  it("loading／error／有活動時不算 notFound", () => {
    expect(isEventDetailNotFound("loading", null)).toBe(false);
    expect(isEventDetailNotFound("error", null)).toBe(false);
    expect(isEventDetailNotFound("success", { id: "culture:1" })).toBe(false);
  });
});
