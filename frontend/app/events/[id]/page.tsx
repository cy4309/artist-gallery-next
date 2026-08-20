"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BaseButton from "@/components/BaseButton";
import FavoriteButton from "@/components/FavoriteButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import Carousel, { CarouselItem } from "@/components/Carousel";
import { getOrgData } from "@/services/client/orgDataClient";
import { OrgEvent } from "@/types/event";
import { formatDateSmart, toISODateTime } from "@/utils/date";
import { getCultureImageUrl } from "@/utils/imageProxy";
import { eventCityName } from "@/utils/city";
import { showConfirmSwal } from "@/utils/notification";
import { getEventShareUrl, shareEvent } from "@/utils/share";
import {
  eventDetailPath,
  favoriteIdAliases,
  toCanonicalId,
} from "@/utils/eventId";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { findOrgEventByRouteId } from "@/services/events/canonicalToLegacy";

function formatDateRange(startTime?: string, endTime?: string): string {
  const start = formatDateSmart(startTime);
  const end = formatDateSmart(endTime);
  if (start && end && start !== end) return `${start} – ${end}`;
  return start || end;
}

export default function EventDetailPage() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [orgData, setOrgData] = useState<OrgEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setStatus("loading");
      const events = (await getOrgData()) as OrgEvent[];
      setOrgData(events);
      setStatus("success");
    } catch (error) {
      console.error("Failed to load event detail:", error);
      setErrorMessage("載入失敗");
      setStatus("error");
    }
  }, []);

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

  const handleIndexChange = useCallback(
    (_index: number, item: CarouselItem) => {
      const nextUrl = eventDetailPath(item.id);
      if (window.location.pathname === nextUrl) return;
      window.history.replaceState(null, "", nextUrl);
    },
    [],
  );

  const imageUrl = event ? getCultureImageUrl(event.imageUrl) : "";
  const favoriteImageUrl = event
    ? (process.env.NEXT_PUBLIC_BASE_URL || "") + imageUrl
    : undefined;

  const notFound = status === "success" && !event;

  if (status === "loading") {
    return <LoadingIndicator />;
  }

  return (
    <>
      {/* 手機：活動詳情 */}
      <div className="lg:hidden min-h-dvh">
        <div className="flex items-center gap-3 px-5 pt-4 pb-4">
          <BackButton />
          <h1 className="text-lg font-bold tracking-[2px]">活動詳情</h1>
        </div>

        {status === "error" && (
          <div className="flex flex-1 min-h-0 w-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">載入失敗</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={load}
              className="mt-2 rounded-lg bg-primary text-white dark:bg-white dark:text-black px-5 py-2.5 text-sm font-semibold"
            >
              再試一次
            </button>
          </div>
        )}

        {notFound && (
          <div className="flex flex-1 min-h-0 w-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">找不到這個活動</p>
          </div>
        )}

        {status === "success" && event && (
          <div className="px-5 pb-8 space-y-3">
            <div className="relative overflow-hidden rounded-2xl border-[3px] border-primary dark:border-primaryGray bg-white/90 dark:bg-primary/90">
              <div className="relative w-full aspect-[16/9] bg-gray-200 dark:bg-gray-700">
                <img
                  loading="lazy"
                  decoding="async"
                  src={imageUrl}
                  alt={event.actName || "活動圖片"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/images/placeholder-no-image.png";
                  }}
                />
                <div className="absolute top-2.5 right-2.5 z-10">
                  <FavoriteButton
                    eventId={event.id}
                    eventTitle={event.actName}
                    eventStartDate={toISODateTime(event.startTime)}
                    eventEndDate={toISODateTime(event.endTime)}
                    eventLocation={event.address}
                    eventUrl={event.website}
                    imageUrl={favoriteImageUrl}
                  />
                </div>
              </div>
            </div>

            {city ? (
              <p className="text-xs font-semibold tracking-wide text-primaryBlue dark:text-blue-300">
                {city}
              </p>
            ) : null}

            <h2 className="text-xl font-bold leading-snug">{event.actName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDateRange(event.startTime, event.endTime)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {event.address || event.cityName}
            </p>

            {event.description ? (
              <p className="text-sm leading-7 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                {event.description}
              </p>
            ) : null}

            <div className="mt-2 flex flex-wrap justify-center gap-6">
              {event.website ? (
                <BaseButton
                  className="!px-4"
                  onClick={async () => {
                    const confirmed = await showConfirmSwal({
                      title: t.notification.confirmOpenExternal.title,
                      text: t.notification.confirmOpenExternal.text,
                      confirmText:
                        t.notification.confirmOpenExternal.confirmText,
                      cancelText: t.notification.confirmOpenExternal.cancelText,
                    });

                    if (confirmed) {
                      window.open(
                        event.website,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }
                  }}
                >
                  {t.buttons.visit}
                </BaseButton>
              ) : null}

              <BaseButton
                className="!px-4"
                onClick={() =>
                  shareEvent({
                    title: event.actName,
                    url: getEventShareUrl(event.id),
                    copiedTitle: t.notification.shareCopied.title,
                    copiedText: t.notification.shareCopied.text,
                  })
                }
              >
                {t.buttons.share}
              </BaseButton>
            </div>
          </div>
        )}
      </div>

      {/* 桌面：同一城市 Carousel，網址跟著目前活動走 */}
      <div className="hidden lg:block">
        <div className="container flex justify-center items-center mx-auto">
          {(status === "error" || notFound) && (
            <div className="m-4 w-full flex flex-col justify-center items-center">
              <BackButton onClick={() => router.push("/events")} />
              <p className="my-4 text-center">
                {notFound ? "找不到這個活動" : errorMessage}
              </p>
            </div>
          )}

          {status === "success" && event && (
            <div className="flex flex-col justify-center items-center">
              <div className="m-4 w-full flex justify-start items-center">
                <BackButton onClick={() => router.push("/events")} />
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
      </div>
    </>
  );
}
