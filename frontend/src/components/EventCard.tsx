"use client";

import FavoriteButton from "@/components/FavoriteButton";
import { formatDateSmart } from "@/utils/date";
import type { FavoriteRecord } from "@/types/favorite/shared";
import { showConfirmSwal } from "@/utils/notification";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useLocale } from "@/locales/contexts/LocaleContext";

interface EventCardProps {
  item: FavoriteRecord;
  ended?: boolean;
  onUnfavorite?: () => void;
}

export default function EventCard({
  item,
  ended = false,
  onUnfavorite,
}: EventCardProps) {
  const { t } = useLocale();

  return (
    <div
      className={`
        group relative h-full
        rounded-2xl overflow-hidden
        backdrop-blur-md
        border-4 border-primary dark:border-primaryGray
        transition-all duration-300
        ${ended ? "opacity-70" : "hover:-translate-y-1 hover:shadow-2xl"}
      `}
    >
      {/* Image */}
      <div className="relative w-full min-w-0 aspect-[16/9] overflow-hidden bg-gray-700 rounded-md">
        <img
          loading="lazy"
          decoding="async"
          src={item.imageUrl || "/images/placeholder-no-image.png"}
          alt={item.eventTitle || "活動圖片"}
          className={`
            absolute inset-0 h-full w-full max-h-full max-w-full object-cover object-center
            transition-transform duration-500
            ${ended ? "grayscale" : "group-hover:scale-105"}
          `}
        />

        {/* Favorite */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton eventId={item.eventId} onUnfavorite={onUnfavorite} />
        </div>

        {/* Ended badge */}
        {ended && (
          <div className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full bg-black/70 text-gray-300 tracking-widest">
            已結束
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-base font-semibold leading-snug line-clamp-2">
          {item.eventTitle}
        </h3>

        {(item.eventStartDate || item.eventEndDate) && (
          <p className="text-xs text-gray-400">
            {formatDateSmart(item.eventStartDate)}
            {item.eventEndDate
              ? ` – ${formatDateSmart(item.eventEndDate)}`
              : ""}
          </p>
        )}

        {item.eventLocation && (
          <p className="text-xs text-gray-400 line-clamp-1">
            {item.eventLocation}
          </p>
        )}

        {item.eventUrl && (
          <button
            type="button"
            onClick={async () => {
              const confirmed = await showConfirmSwal({
                title: t.notification.confirmOpenExternal.title,
                text: t.notification.confirmOpenExternal.text,
                confirmText: t.notification.confirmOpenExternal.confirmText,
                cancelText: t.notification.confirmOpenExternal.cancelText,
              });

              if (confirmed) {
                window.open(item.eventUrl, "_blank", "noopener,noreferrer");
              }
            }}
            className="
              mt-2 gap-1
              flex justify-center items-center
              text-xs tracking-wide
              text-primaryBlue dark:text-blue-300
              hover:underline
            "
          >
            {t.buttons.visit}
            <span aria-hidden>
              <ArrowRightOutlined />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
