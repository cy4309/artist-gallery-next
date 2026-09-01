"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import Carousel, { CarouselItem } from "@/components/Carousel";
import { getOrgData } from "@/services/client/orgDataClient";
import { OrgEvent } from "@/types/event";
import { eventCityName, displayCityName } from "@/utils/city";
import {
  eventDetailPath,
  favoriteIdAliases,
  toCanonicalId,
} from "@/utils/eventId";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { findOrgEventByRouteId } from "@/services/events/canonicalToLegacy";
import { loadSessionCategories } from "@/utils/eventCategories";

export default function EventDetailPage() {
  const { t } = useLocale();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [orgData, setOrgData] = useState<OrgEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setStatus("loading");
      const categories = loadSessionCategories() ?? undefined;
      const events = (await getOrgData({
        id: String(id),
        categories,
      })) as OrgEvent[];
      setOrgData(events);
      setStatus("success");
    } catch (error) {
      console.error("Failed to load event detail:", error);
      setErrorMessage("載入失敗");
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const event = useMemo(() => {
    if (!id) return null;
    return findOrgEventByRouteId(orgData, String(id));
  }, [orgData, id]);

  const city = event ? eventCityName(event) : null;

  const cityEvents = useMemo(() => {
    if (!event) return [];
    if (city) {
      return orgData.filter((item) => eventCityName(item) === city);
    }
    return orgData.filter((item) => item.cityName === event.cityName);
  }, [orgData, event, city]);

  const routeId = params?.id;
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
      const nextUrl = eventDetailPath(item.id);
      if (window.location.pathname === nextUrl) return;
      window.history.replaceState(null, "", nextUrl);
    },
    [],
  );

  const carouselPositionLabel = useMemo(() => {
    if (!event || cityEvents.length === 0) return null;
    const cityLabel =
      displayCityName(city ?? event.cityName) || t.events.title;
    return t.events.listPositionWithCity
      .replace("{city}", cityLabel)
      .replace("{current}", String(carouselIndex + 1))
      .replace("{total}", String(cityEvents.length));
  }, [carouselIndex, city, cityEvents.length, event, t.events]);

  const notFound = status === "success" && !event;

  if (status === "loading") {
    return <LoadingIndicator />;
  }

  return (
    <div className="container mx-auto flex min-h-0 w-full flex-col items-center px-4 py-4 lg:py-6">
      {(status === "error" || notFound) && (
        <div className="flex w-full max-w-[600px] flex-col items-center justify-center">
          <BackButton />
          <p className="my-4 text-center">
            {notFound ? "找不到這個活動" : errorMessage}
          </p>
          {status === "error" ? (
            <button
              type="button"
              onClick={load}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
            >
              再試一次
            </button>
          ) : null}
        </div>
      )}

      {status === "success" && event && (
        <div className="flex w-full max-w-[600px] flex-col items-center">
          <div className="mb-4 flex w-full items-center justify-between gap-3">
            <BackButton className="shrink-0" />
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
      )}
    </div>
  );
}
