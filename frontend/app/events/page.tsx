"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrgData } from "@/services/client/orgDataClient";
import MapTw from "@/containers/evnets/MapTw";
import BaseButton from "@/components/BaseButton";
import BackButton from "@/components/BackButton";
import EventsMobileList from "@/components/events/EventsMobileList";
import EventCategoryPicker from "@/components/events/EventCategoryPicker";
import {
  EventSearchInline,
  EventSearchTrigger,
} from "@/components/events/EventSearchToggle";
import OrgEventCard from "@/components/events/OrgEventCard";
import { OrgEvent } from "@/types/event";
import { useLocale } from "@/locales/contexts/LocaleContext";
import LoadingIndicator from "@/components/LoadingIndicator";
import { displayCityName } from "@/utils/city";
import { eventDetailPath } from "@/utils/eventId";
import { filterEventsByKeyword } from "@/utils/eventSearch";
import {
  EventCategoryId,
  loadSessionCategories,
  saveSessionCategories,
} from "@/utils/eventCategories";
import { useEventSearchCatalog } from "@/hooks/useEventSearchCatalog";

export default function EventsPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [pickingCategories, setPickingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<
    EventCategoryId[]
  >([]);
  const [orgData, setOrgData] = useState<OrgEvent[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [emptyCity, setEmptyCity] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const {
    catalog,
    catalogLoading,
    ensureCatalog,
  } = useEventSearchCatalog();

  const searchResults = useMemo(
    () => filterEventsByKeyword(catalog, searchQuery),
    [catalog, searchQuery],
  );

  const isSearching = searchQuery.trim().length > 0;
  const showLoading = orgLoading || (searchOpen && catalogLoading);

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

  const loadCityEvents = useCallback(
    async (city: string, categories: EventCategoryId[]) => {
      try {
        setOrgLoading(true);
        setEmptyCity(false);
        setPickingCategories(false);
        const events = await getOrgData({ city, categories });
        setOrgData(events);

        if (events.length === 0) {
          setEmptyCity(true);
          return;
        }

        router.push(eventDetailPath(events[0].id));
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEmptyCity(true);
      } finally {
        setOrgLoading(false);
      }
    },
    [router],
  );

  const handleMapHover = (id: string | null) => {
    setHoveredId(id);
  };

  const handleMapClick = (id: string) => {
    setClickedId(id);
    setEmptyCity(false);
    setOrgData([]);
    setSearchQuery("");
    setSearchOpen(false);

    const saved = loadSessionCategories();
    if (saved && saved.length > 0) {
      setSelectedCategories(saved);
      void loadCityEvents(id, saved);
      return;
    }

    setSelectedCategories([]);
    setPickingCategories(true);
  };

  const handleCancelPick = () => {
    setPickingCategories(false);
    if (!loadSessionCategories()) {
      setClickedId(null);
      setHoveredId(null);
    }
    setEmptyCity(false);
  };

  const handleChangeCategories = () => {
    const saved = loadSessionCategories();
    setSelectedCategories(saved && saved.length > 0 ? saved : []);
    setEmptyCity(false);
    setOrgData([]);
    setSearchQuery("");
    setSearchOpen(false);
    setPickingCategories(true);
  };

  const handleCloseEmpty = () => {
    setEmptyCity(false);
    setClickedId(null);
    setHoveredId(null);
    setOrgData([]);
  };

  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      <div className="lg:hidden flex flex-col flex-1 min-h-0">
        <EventsMobileList />
      </div>

      <div className="hidden lg:flex flex-col w-full h-full min-h-0">
        <div className="w-full shrink-0 flex items-center justify-end gap-2 pb-2">
          <button
            type="button"
            onClick={handleChangeCategories}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 underline-offset-2 hover:underline px-2"
          >
            變更活動類型
          </button>
          <div className="flex items-center">
            <EventSearchTrigger
              expanded={searchOpen}
              onToggle={toggleSearch}
              label={t.events.searchPlaceholder}
            />
            <EventSearchInline
              expanded={searchOpen}
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t.events.searchPlaceholder}
            />
            {isSearching && !catalogLoading && (
              <p className="text-sm text-gray-400 whitespace-nowrap">
                {searchResults.length} 筆
              </p>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 flex-1 min-h-0 flex flex-col">
          {showLoading && <LoadingIndicator />}

          {!showLoading && isSearching && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                  <p className="text-lg font-semibold">
                    {t.events.searchNoResults}
                  </p>
                  <p className="text-sm text-gray-400">{t.events.searchHint}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl mx-auto pb-8">
                  {searchResults.map((event) => (
                    <OrgEventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!showLoading && !isSearching && (
            <div className="flex-1 min-h-0 flex flex-col justify-center items-center">
              {!pickingCategories && !emptyCity && (
                <div className="w-full h-full min-h-0 flex flex-col justify-center items-center">
                  {(hoveredId ?? t.events.title) && (
                    <BaseButton className="my-4 shrink-0">
                      <h5 className="text-center text-xl font-bold">
                        - {displayCityName(hoveredId) || t.events.title} -
                      </h5>
                    </BaseButton>
                  )}

                  <section className="p-4 flex-1 min-h-0 w-full flex items-center justify-center">
                    <MapTw onHover={handleMapHover} onClick={handleMapClick} />
                  </section>
                </div>
              )}

              {pickingCategories && (
                <div className="w-full flex flex-col items-center gap-4 px-4">
                  <EventCategoryPicker
                    city={clickedId || "活動類型"}
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                    onConfirm={async (categories) => {
                      if (categories.length === 0) return;
                      setSelectedCategories(categories);
                      saveSessionCategories(categories);
                      if (clickedId) {
                        await loadCityEvents(clickedId, categories);
                      } else {
                        setPickingCategories(false);
                      }
                    }}
                    onCancel={handleCancelPick}
                    loading={orgLoading}
                  />
                </div>
              )}

              {emptyCity && (
                <div className="m-4 w-full flex flex-col justify-center items-center">
                  <BackButton onClick={handleCloseEmpty} />
                  <p className="my-4 text-center">
                    {displayCityName(clickedId)} · 共 0 筆
                  </p>
                  <p className="text-sm text-gray-400">這個縣市目前沒有符合的活動</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
