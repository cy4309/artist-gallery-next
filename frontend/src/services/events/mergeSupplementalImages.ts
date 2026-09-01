import {
  CanonicalEvent,
  EventImageSource,
} from "@/types/event";

/** sync 寫入前：API 有官方圖用 official；否則保留 DB 既有圖（含 og/search/先前補圖） */
export function mergeSupplementalImages(
  incoming: CanonicalEvent[],
  existing: CanonicalEvent[],
): CanonicalEvent[] {
  const existingImages = new Map<
    string,
    { imageUrl: string; imageSource?: EventImageSource }
  >();

  for (const event of existing) {
    const imageUrl = event.imageUrl?.trim();
    if (!imageUrl) continue;
    existingImages.set(event.id, {
      imageUrl,
      imageSource: event.imageSource,
    });
  }

  return incoming.map((event) => {
    const officialUrl = event.imageUrl?.trim();
    if (officialUrl) {
      return { ...event, imageUrl: officialUrl, imageSource: "official" };
    }

    const kept = existingImages.get(event.id);
    if (kept) {
      return {
        ...event,
        imageUrl: kept.imageUrl,
        imageSource: kept.imageSource,
      };
    }

    return { ...event, imageUrl: event.imageUrl ?? "" };
  });
}
