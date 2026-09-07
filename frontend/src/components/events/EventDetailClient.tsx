"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BackButton from "@/components/BackButton";
import Carousel, { CarouselItem } from "@/components/Carousel";
import { OrgEvent } from "@/types/event";
import { eventCityName, displayCityName } from "@/utils/city";
import {
  eventDetailPath,
  favoriteIdAliases,
  toCanonicalId,
} from "@/utils/eventId";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { findOrgEventByRouteId } from "@/services/events/canonicalToLegacy";

type EventDetailClientProps = {
  routeId: string;
  cityEvents: OrgEvent[];
};

export default function EventDetailClient({
  routeId,
  cityEvents,
}: EventDetailClientProps) {
  const { t } = useLocale();
  const event = findOrgEventByRouteId(cityEvents, routeId);
  const city = event ? eventCityName(event) : null;

  const [historyId, setHistoryId] = useState<string | null>(null);

  useEffect(() => {
    setHistoryId(null);
  }, [routeId]);

  useEffect(() => {
    const onPopState = () => {
      const match = window.location.pathname.match(/\/events\/([^/?#]+)/);
      if (match?.[1]) setHistoryId(match[1]);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const effectiveId = historyId ?? routeId;

  const activeIndex = useMemo(() => {
    if (!effectiveId) return 0;
    const decoded = toCanonicalId(String(effectiveId));
    const aliases = new Set(favoriteIdAliases(decoded));
    const index = cityEvents.findIndex(
      (item) => aliases.has(item.id) || item.id === decoded,
    );
    return index >= 0 ? index : 0;
  }, [cityEvents, effectiveId]);

  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    setCarouselIndex(activeIndex);
  }, [activeIndex]);

  const handleIndexChange = useCallback(
    (index: number, item: CarouselItem) => {
      setCarouselIndex(index);
      const nextUrl = `${eventDetailPath(item.id)}${window.location.search}`;
      if (`${window.location.pathname}${window.location.search}` === nextUrl) {
        return;
      }
      window.history.replaceState(null, "", nextUrl);
    },
    [],
  );

  const carouselPositionLabel = useMemo(() => {
    if (!event || cityEvents.length === 0) return null;
    const cityLabel =
      displayCityName(city ?? event.cityName, t.cities) || t.events.title;
    return t.events.listPositionWithCity
      .replace("{city}", cityLabel)
      .replace("{current}", String(carouselIndex + 1))
      .replace("{total}", String(cityEvents.length));
  }, [carouselIndex, city, cityEvents.length, event, t.cities, t.events]);

  if (!event) return null;

  return (
    <div className="flex w-full max-w-[600px] flex-col items-center">
      <div className="mb-4 flex w-full items-center justify-between gap-3">
        <BackButton className="shrink-0" fallbackHref="/events" />
        {carouselPositionLabel ? (
          <p className="whitespace-nowrap text-sm font-semibold text-gray-600 dark:text-gray-300">
            {carouselPositionLabel}
          </p>
        ) : null}
      </div>

      <Carousel
        key={city ?? event.cityName}
        autoplay={false}
        autoplayDelay={3000}
        baseWidth={300}
        items={cityEvents}
        loop={true}
        pauseOnHover={true}
        round={false}
        activeIndex={activeIndex}
        onIndexChange={handleIndexChange}
      />
    </div>
  );
}
