import {
  CanonicalEvent,
  EventImageSource,
} from "@/types/event";

const SUPPLEMENTAL_SOURCES = new Set<EventImageSource>(["og", "search"]);

function isSupplementalSource(
  source: EventImageSource | undefined,
): source is EventImageSource {
  return Boolean(source && SUPPLEMENTAL_SOURCES.has(source));
}

/** sync 寫入前：官方有圖用 official；否則保留先前 og/search 補圖 */
export function mergeSupplementalImages(
  incoming: CanonicalEvent[],
  existing: CanonicalEvent[],
): CanonicalEvent[] {
  const supplemental = new Map<
    string,
    { imageUrl: string; imageSource: EventImageSource }
  >();

  for (const event of existing) {
    const imageUrl = event.imageUrl?.trim();
    if (!imageUrl || !isSupplementalSource(event.imageSource)) continue;
    supplemental.set(event.id, {
      imageUrl,
      imageSource: event.imageSource,
    });
  }

  return incoming.map((event) => {
    const officialUrl = event.imageUrl?.trim();
    if (officialUrl) {
      return { ...event, imageUrl: officialUrl, imageSource: "official" };
    }

    const kept = supplemental.get(event.id);
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
