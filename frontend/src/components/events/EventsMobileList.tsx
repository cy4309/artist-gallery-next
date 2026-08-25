"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  captureEventsScrollY,
  clearEventsBrowseState,
  getEventsScrollRoot,
  loadEventsBrowseState,
  restoreEventsScrollY,
  saveEventsBrowseState,
} from "@/utils/eventsBrowseState";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { useEventSearchCatalog } from "@/hooks/useEventSearchCatalog";

export default function EventsMobileList() {
  const { t } = useLocale();
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);
  const [pickingCategories, setPickingCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<
    EventCategoryId[]
  >([]);
  const [orgData, setOrgData] = useState<OrgEvent[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [restoreScrollY, setRestoreScrollY] = useState<number | null>(null);
  const {
    catalog,
    catalogLoading,
    ensureCatalog,
  } = useEventSearchCatalog();

  const cities = useMemo(() => [...CITY_ORDER], []);

  const resolveCategories = useCallback((): EventCategoryId[] => {
    if (selectedCategories.length > 0) return selectedCategories;
    return loadSessionCategories() ?? [];
  }, [selectedCategories]);

  const persistBrowseState = useCallback(
    (scrollY = captureEventsScrollY()) => {
      if (!hasConfirmed && !searchQuery.trim()) return;
      saveEventsBrowseState({
        source: "mobile",
        mode: searchQuery.trim() ? "search" : "city",
        city: selectedCity,
        searchQuery: searchQuery.trim(),
        scrollY,
      });
    },
    [hasConfirmed, searchQuery, selectedCity],
  );

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
        saveEventsBrowseState({
          source: "mobile",
          mode: "city",
          city,
          searchQuery: "",
          scrollY: 0,
        });
        return events;
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setOrgData([]);
        setHasConfirmed(true);
        return [];
      } finally {
        setOrgLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const categories = loadSessionCategories();
        if (!categories?.length) {
          if (!cancelled) setPickingCategories(true);
          return;
        }

        if (!cancelled) {
          setSelectedCategories(categories);
          setPickingCategories(false);
        }

        const browse = loadEventsBrowseState();
        if (browse?.source === "mobile") {
          if (browse.mode === "search" && browse.searchQuery) {
            if (!cancelled) {
              setSearchQuery(browse.searchQuery);
              setSearchOpen(true);
            }
            await ensureCatalog();
            if (!cancelled) setRestoreScrollY(browse.scrollY);
          } else if (browse.city) {
            if (!cancelled) setSelectedCity(browse.city);
            setOrgLoading(true);
            try {
              const events = await getOrgData({
                city:
                  browse.city === ALL_CITIES ? undefined : browse.city,
                categories,
              });
              if (!cancelled) {
                setOrgData(events);
                setHasConfirmed(true);
                setRestoreScrollY(browse.scrollY);
              }
            } catch (error) {
              console.error("Failed to restore events browse:", error);
              if (!cancelled) {
                setOrgData([]);
                setHasConfirmed(true);
              }
            } finally {
              if (!cancelled) setOrgLoading(false);
            }
          }
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // 只在進頁時還原一次；ensureCatalog 不放入 deps，避免重複 init
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (restoreScrollY === null) return;
    if (orgLoading || (searchQuery.trim() && catalogLoading)) return;
    if (!hasConfirmed && !searchQuery.trim()) return;

    const y = restoreScrollY;
    setRestoreScrollY(null);

    let attempts = 0;
    const apply = () => {
      restoreEventsScrollY(y);
      attempts += 1;
      // 列表／圖片尚未撐高時再試幾次
      if (attempts < 8) {
        requestAnimationFrame(apply);
      }
    };
    requestAnimationFrame(apply);
  }, [
    restoreScrollY,
    orgLoading,
    catalogLoading,
    searchQuery,
    hasConfirmed,
    orgData.length,
    catalog.length,
  ]);

  useEffect(() => {
    if (initializing) return;
    if (!hasConfirmed && !searchQuery.trim()) return;

    const root = getEventsScrollRoot();
    if (!root) return;

    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => persistBrowseState(), 150);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      root.removeEventListener("scroll", onScroll);
    };
  }, [initializing, hasConfirmed, searchQuery, persistBrowseState]);

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

  const handleSelectCity = (city: string) => {
    const categories = resolveCategories();
    if (categories.length === 0) {
      setPickingCategories(true);
      return;
    }

    setSelectedCity(city);
    setHasConfirmed(false);
    setOrgData([]);
    setSearchQuery("");
    void loadEvents(city, categories);
  };

  const handleCancelPick = () => {
    if (loadSessionCategories()) {
      setPickingCategories(false);
    }
  };

  const handleConfirmCategories = async (categories: EventCategoryId[]) => {
    if (categories.length === 0) return;
    setSelectedCategories(categories);
    saveSessionCategories(categories);
    setPickingCategories(false);
    clearEventsBrowseState();
    if (hasConfirmed) {
      await loadEvents(selectedCity, categories);
    }
  };

  const handleChangeCategories = () => {
    const saved = loadSessionCategories();
    setSelectedCategories(saved && saved.length > 0 ? saved : []);
    setPickingCategories(true);
    setSearchQuery("");
    setSearchOpen(false);
    clearEventsBrowseState();
  };

  if (pickingCategories && !hasSearch) {
    return (
      <EventCategoryPicker
        selected={selectedCategories}
        onChange={setSelectedCategories}
        onConfirm={handleConfirmCategories}
        onCancel={handleCancelPick}
        loading={orgLoading}
      />
    );
  }

  if (initializing || orgLoading || (hasSearch && catalogLoading)) {
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
            也可直接用上方搜尋；換縣市時會沿用已選的活動類型
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
            <OrgEventCard
              key={event.id}
              event={event}
              onBeforeNavigate={persistBrowseState}
            />
          ))}
        </div>
      )}
    </div>
  );
}
