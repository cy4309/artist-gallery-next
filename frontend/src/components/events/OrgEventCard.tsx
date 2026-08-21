"use client";

import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { OrgEvent } from "@/types/event";
import { formatDateSmart, toISODateTime } from "@/utils/date";
import { getCultureImageUrl } from "@/utils/imageProxy";
import { eventCityName } from "@/utils/city";
import { eventDetailPath } from "@/utils/eventId";
import { getEventCategoryLabel } from "@/utils/eventCategories";

const PLACEHOLDER_IMAGE = "/images/placeholder-no-image.png";

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
  const hasImage = Boolean(event.imageUrl?.trim());
  const imageUrl = hasImage
    ? getCultureImageUrl(event.imageUrl)
    : PLACEHOLDER_IMAGE;
  const city = eventCityName(event);
  const categoryLabel = getEventCategoryLabel(event);
  const favoriteImageUrl = hasImage
    ? (process.env.NEXT_PUBLIC_BASE_URL || "") + imageUrl
    : undefined;

  return (
    <Link
      href={eventDetailPath(event.id)}
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
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
        />
        {categoryLabel ? (
          <span className="absolute top-2.5 left-2.5 z-10 rounded-md bg-black/65 px-2 py-1 text-[11px] font-semibold tracking-wide text-white">
            {categoryLabel}
          </span>
        ) : null}
        <div
          className="absolute top-2.5 right-2.5 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
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
