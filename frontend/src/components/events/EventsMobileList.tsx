"use client";

import { useCallback, useMemo, useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import CityPicker, { ALL_CITIES } from "@/components/events/CityPicker";
import EventCategoryPicker from "@/components/events/EventCategoryPicker";
import {
  EventSearchPanel,
  EventSearchTrigger,
} from "@/components/events/EventSearchToggle";
import OrgEventCard from "@/components/events/OrgEventCard";
import { getOrgData } from "@/services/client/orgDataClient";
import { OrgEvent } from "@/types/event";
import { CITY_ORDER } from "@/utils/city";
import { filterEventsByKeyword } from "@/utils/eventSearch";
import {
  EventCategoryId,
  loadSessionCategories,
  saveSessionCategories,
} from "@/utils/eventCategories";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { useEventSearchCatalog } from "@/hooks/useEventSearchCatalog";

export default function EventsMobileList() {
  const { t } = useLocale();
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);
  const [pickingCategories, setPickingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<
    EventCategoryId[]
  >([]);
  const [orgData, setOrgData] = useState<OrgEvent[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const {
    catalog,
    catalogLoading,
    ensureCatalog,
  } = useEventSearchCatalog();

  const cities = useMemo(() => [...CITY_ORDER], []);

  const searchResults = useMemo(
    () => filterEventsByKeyword(catalog, searchQuery),
    [catalog, searchQuery],
  );

  const cityFiltered = useMemo(
    () => filterEventsByKeyword(orgData, searchQuery),
    [orgData, searchQuery],
  );

  const hasSearch = searchQuery.trim().length > 0;
  const listEvents = hasSearch ? searchResults : cityFiltered;

  const toggleSearch = () => {
    setSearchOpen((open) => {
      const next = !open;
      if (!next) setSearchQuery("");
      else void ensureCatalog();
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) void ensureCatalog();
  };

  const loadEvents = useCallback(
    async (city: string, categories: EventCategoryId[]) => {
      try {
        setOrgLoading(true);
        setPickingCategories(false);
        const events = await getOrgData({
          city: city === ALL_CITIES ? undefined : city,
          categories,
        });
        setOrgData(events);
        setHasConfirmed(true);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setOrgData([]);
        setHasConfirmed(true);
      } finally {
        setOrgLoading(false);
      }
    },
    [],
  );

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setHasConfirmed(false);
    setOrgData([]);
    setSearchQuery("");

    const saved = loadSessionCategories();
    if (saved && saved.length > 0) {
      setSelectedCategories(saved);
      void loadEvents(city, saved);
      return;
    }

    setSelectedCategories([]);
    setPickingCategories(true);
  };

  const handleCancelPick = () => {
    setPickingCategories(false);
  };

  const handleConfirmCategories = async (categories: EventCategoryId[]) => {
    if (categories.length === 0) return;
    setSelectedCategories(categories);
    saveSessionCategories(categories);
    await loadEvents(selectedCity, categories);
  };

  const handleChangeCategories = () => {
    const saved = loadSessionCategories();
    setSelectedCategories(saved && saved.length > 0 ? saved : []);
    setPickingCategories(true);
    setHasConfirmed(false);
    setOrgData([]);
    setSearchQuery("");
    setSearchOpen(false);
  };

  if (pickingCategories && !hasSearch) {
    return (
      <div className="min-h-dvh px-5 py-6">
        <EventCategoryPicker
          city={selectedCity === ALL_CITIES ? "全部縣市" : selectedCity}
          selected={selectedCategories}
          onChange={setSelectedCategories}
          onConfirm={handleConfirmCategories}
          onCancel={handleCancelPick}
          loading={orgLoading}
        />
      </div>
    );
  }

  if (orgLoading || (hasSearch && catalogLoading)) {
    return <LoadingIndicator />;
  }

  return (
    <div className="min-h-dvh">
      <div className="flex items-center justify-end gap-3 px-5 pt-4 pb-2">
        <button
          type="button"
          onClick={handleChangeCategories}
          className="text-xs font-semibold text-gray-500 dark:text-gray-400 underline-offset-2 hover:underline"
        >
          變更類型
        </button>
        <p className="text-sm text-gray-400">{`${listEvents.length} 筆`}</p>
        <EventSearchTrigger
          expanded={searchOpen}
          onToggle={toggleSearch}
          label={t.events.searchPlaceholder}
        />
      </div>

      <EventSearchPanel
        expanded={searchOpen}
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder={t.events.searchPlaceholder}
      />

      {!hasSearch && (
        <CityPicker
          cities={cities}
          selected={selectedCity}
          onSelect={handleSelectCity}
        />
      )}

      {!hasSearch && !hasConfirmed && (
        <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-lg font-semibold">選擇縣市開始瀏覽</p>
          <p className="text-sm text-gray-400">
            也可直接用上方搜尋；第一次選縣市時會請你選活動類型
          </p>
        </div>
      )}

      {!hasSearch && hasConfirmed && orgData.length === 0 && (
        <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-lg font-semibold">目前沒有符合的活動</p>
          <p className="text-sm text-gray-400">試試其他縣市或變更類型</p>
        </div>
      )}

      {!hasSearch && hasConfirmed && orgData.length > 0 && listEvents.length === 0 && (
        <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-lg font-semibold">沒有符合的活動</p>
          <p className="text-sm text-gray-400">試試調整搜尋關鍵字</p>
        </div>
      )}

      {hasSearch && listEvents.length === 0 && (
        <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-lg font-semibold">{t.events.searchNoResults}</p>
          <p className="text-sm text-gray-400">{t.events.searchHint}</p>
        </div>
      )}

      {listEvents.length > 0 && (hasSearch || hasConfirmed) && (
        <div className="px-5 pt-4 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {listEvents.map((event) => (
            <OrgEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
