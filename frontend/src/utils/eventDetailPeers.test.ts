import { describe, expect, it } from "vitest";
import { CanonicalEvent } from "@/types/event";
import { buildEventDetailCityPeers } from "@/utils/eventDetailPeers";
import { EVENT_NOT_FOUND_MESSAGE } from "@/utils/eventDetailCopy";

function event(
  partial: Partial<CanonicalEvent> & Pick<CanonicalEvent, "id" | "title">,
): CanonicalEvent {
  return {
    source: "culture",
    cityName: "台北市",
    startTime: "2026-01-01",
    endTime: "2026-01-02",
    address: "台北市",
    imageUrl: "",
    description: "",
    website: "",
    category: "展覽",
    syncedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("buildEventDetailCityPeers", () => {
  const catalog: CanonicalEvent[] = [
    event({ id: "culture:1", title: "北市展覽A", category: "展覽" }),
    event({ id: "culture:2", title: "北市音樂B", category: "音樂" }),
    event({
      id: "culture:3",
      title: "台中展覽C",
      cityName: "台中市",
      address: "台中市",
      category: "展覽",
    }),
  ];

  it("假 id → 空陣列（對應找不到這個活動）", () => {
    expect(buildEventDetailCityPeers(catalog, "culture-999")).toEqual([]);
    expect(EVENT_NOT_FOUND_MESSAGE).toBe("找不到這個活動");
  });

  it("有 id → 回同城 peers，並含目前這筆", () => {
    const peers = buildEventDetailCityPeers(catalog, "culture-1");
    expect(peers.map((item) => item.id).sort()).toEqual([
      "culture:1",
      "culture:2",
    ]);
  });

  it("有 categories 時篩同城類型，但仍保留目前這筆", () => {
    const peers = buildEventDetailCityPeers(catalog, "culture-2", ["展覽"]);
    // culture:2 是音樂，不在展覽篩選內，但仍必須保留
    expect(peers.map((item) => item.id).sort()).toEqual([
      "culture:1",
      "culture:2",
    ]);
  });
});

