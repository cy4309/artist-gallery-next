"use client";

import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { OrgEvent } from "@/types/event";
import { formatDateSmart, toISODateTime } from "@/utils/date";
import { getCultureImageUrl } from "@/utils/imageProxy";
import { eventCityName } from "@/utils/city";

type OrgEventCardProps = {
  event: OrgEvent;
};

function formatDateRange(startTime?: string, endTime?: string): string {
  const start = formatDateSmart(startTime);
  const end = formatDateSmart(endTime);
  if (start && end && start !== end) return `${start} – ${end}`;
  return start || end;
}

export default function OrgEventCard({ event }: OrgEventCardProps) {
  const imageUrl = getCultureImageUrl(event.imageUrl);
  const city = eventCityName(event);
  const favoriteImageUrl =
    (process.env.NEXT_PUBLIC_BASE_URL || "") + imageUrl;

  return (
    <Link
      href={`/events/${event.actId}`}
      className="block rounded-2xl overflow-hidden border-[3px] border-primary dark:border-primaryGray bg-white/90 dark:bg-primary/90 backdrop-blur-md transition-opacity hover:opacity-90 active:opacity-80"
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-200 dark:bg-gray-700">
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
        <div
          className="absolute top-2.5 right-2.5 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <FavoriteButton
            eventId={String(event.actId)}
            eventTitle={event.actName}
            eventStartDate={toISODateTime(event.startTime)}
            eventEndDate={toISODateTime(event.endTime)}
            eventLocation={event.address}
            eventUrl={event.website}
            imageUrl={favoriteImageUrl}
          />
        </div>
      </div>

      <div className="p-5 space-y-2">
        <h3 className="text-[16px] font-bold leading-[22px] line-clamp-2">
          {event.actName}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDateRange(event.startTime, event.endTime)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
          {event.address || event.cityName}
        </p>
        {city ? (
          <p className="pt-1 text-xs font-semibold tracking-wide text-primaryBlue dark:text-blue-300">
            {city}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
