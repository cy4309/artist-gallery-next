"use client";

import { useMemo, useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import CityPicker, { ALL_CITIES } from "@/components/events/CityPicker";
import {
  EventSearchPanel,
  EventSearchTrigger,
} from "@/components/events/EventSearchToggle";
import OrgEventCard from "@/components/events/OrgEventCard";
import { OrgEvent } from "@/types/event";
import { eventCityName, uniqueCityNames } from "@/utils/city";
import { filterEventsByKeyword } from "@/utils/eventSearch";
import { useLocale } from "@/locales/contexts/LocaleContext";

type EventsMobileListProps = {
  orgData: OrgEvent[];
  orgLoading: boolean;
};

export default function EventsMobileList({
  orgData,
  orgLoading,
}: EventsMobileListProps) {
  const { t } = useLocale();
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setSearchQuery("");
      return !open;
    });
  };

  const cities = useMemo(() => uniqueCityNames(orgData), [orgData]);

  const filtered = useMemo(() => {
    const byCity =
      selectedCity === ALL_CITIES
        ? orgData
        : orgData.filter((event) => eventCityName(event) === selectedCity);
    return filterEventsByKeyword(byCity, searchQuery);
  }, [orgData, selectedCity, searchQuery]);

  const hasSearch = searchQuery.trim().length > 0;

  if (orgLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="min-h-dvh">
      <div className="flex items-center justify-end gap-3 px-5 pt-4 pb-2">
        <p className="text-sm text-gray-400">{`${filtered.length} 筆`}</p>
        {orgData.length > 0 && (
          <EventSearchTrigger
            expanded={searchOpen}
            onToggle={toggleSearch}
            label={t.events.searchPlaceholder}
          />
        )}
      </div>

      {orgData.length > 0 && (
        <>
          <EventSearchPanel
            expanded={searchOpen}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.events.searchPlaceholder}
          />
          <CityPicker
            cities={cities}
            selected={selectedCity}
            onSelect={setSelectedCity}
          />
        </>
      )}

      {orgData.length === 0 && (
        <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-lg font-semibold">目前沒有活動</p>
          <p className="text-sm text-gray-400">稍後再回來看看</p>
        </div>
      )}

      {orgData.length > 0 && filtered.length === 0 && (
        <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-lg font-semibold">
            {hasSearch ? t.events.searchNoResults : "這個縣市暫無活動"}
          </p>
          <p className="text-sm text-gray-400">
            {hasSearch ? t.events.searchHint : "試試選「全部」或其他縣市"}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="px-5 pt-4 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((event) => (
            <OrgEventCard key={event.actId} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
