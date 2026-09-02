"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import BackButton from "@/components/BackButton";
import CityPicker, {
  ALL_CITIES,
  NO_CITY_SELECTED,
} from "@/components/events/CityPicker";
import EventCategoryPicker from "@/components/events/EventCategoryPicker";
import {
  EventAdvancedSearchPanel,
  EventAdvancedSearchTrigger,
  EventSearchInline,
  EventSearchTrigger,
} from "@/components/events/EventSearchToggle";
import OrgEventCard from "@/components/events/OrgEventCard";
import { getOrgData } from "@/services/client/orgDataClient";
import { OrgEvent } from "@/types/event";
import { CITY_ORDER, displayCityName } from "@/utils/city";
import { filterEvents, hasKeywordSearch } from "@/utils/eventSearch";
import { hasEventDateFilter } from "@/utils/eventDateFilter";
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
  const [selectedCity, setSelectedCity] = useState(NO_CITY_SELECTED);
  const [pickingCategories, setPickingCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<
    EventCategoryId[]
  >([]);
  const [orgData, setOrgData] = useState<OrgEvent[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [draftDateFrom, setDraftDateFrom] = useState("");
  const [draftDateTo, setDraftDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [keywordOpen, setKeywordOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [restoreScrollY, setRestoreScrollY] = useState<number | null>(null);
  const { catalog, catalogLoading, catalogReady, ensureCatalog } =
    useEventSearchCatalog();

  const cities = useMemo(() => [...CITY_ORDER], []);

  const resolveCategories = useCallback((): EventCategoryId[] => {
    if (selectedCategories.length > 0) return selectedCategories;
    return loadSessionCategories() ?? [];
  }, [selectedCategories]);

  const dateFilter = useMemo(
    () => ({ from: appliedDateFrom, to: appliedDateTo }),
    [appliedDateFrom, appliedDateTo],
  );

  const dateDraftDirty =
    draftDateFrom !== appliedDateFrom || draftDateTo !== appliedDateTo;

  const clearDateFilters = useCallback(() => {
    setDraftDateFrom("");
    setDraftDateTo("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
  }, []);

  const hasKeyword = hasKeywordSearch(searchQuery);
  const hasDateFilter = hasEventDateFilter(dateFilter);
  const showCityBrowse = hasConfirmed && !hasKeyword;

  const persistBrowseState = useCallback(
    (scrollY = captureEventsScrollY()) => {
      if (!showCityBrowse && !hasKeyword) return;
      saveEventsBrowseState({
        source: "mobile",
        mode: hasKeyword ? "search" : "city",
        city: selectedCity,
        searchQuery: searchQuery.trim(),
        dateFrom: appliedDateFrom || undefined,
        dateTo: appliedDateTo || undefined,
        scrollY,
      });
    },
    [
      appliedDateFrom,
      appliedDateTo,
      hasKeyword,
      searchQuery,
      selectedCity,
      showCityBrowse,
    ],
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
          const restoredKeyword = hasKeywordSearch(browse.searchQuery);
          const restoredDate = hasEventDateFilter({
            from: browse.dateFrom,
            to: browse.dateTo,
          });

          if (restoredKeyword) {
            if (!cancelled) {
              setSearchQuery(browse.searchQuery ?? "");
              setKeywordOpen(true);
            }
            await ensureCatalog();
            if (!cancelled) setRestoreScrollY(browse.scrollY);
          } else if (browse.city) {
            if (!cancelled) {
              setSelectedCity(browse.city);
              if (restoredDate) {
                setDraftDateFrom(browse.dateFrom ?? "");
                setDraftDateTo(browse.dateTo ?? "");
                setAppliedDateFrom(browse.dateFrom ?? "");
                setAppliedDateTo(browse.dateTo ?? "");
                setAdvancedOpen(true);
              }
            }
            setOrgLoading(true);
            try {
              const events = await getOrgData({
                city: browse.city === ALL_CITIES ? undefined : browse.city,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (restoreScrollY === null) return;
    if (orgLoading || (hasKeyword && catalogLoading)) return;
    if (!showCityBrowse && !hasKeyword) return;

    const y = restoreScrollY;
    setRestoreScrollY(null);

    let attempts = 0;
    const apply = () => {
      restoreEventsScrollY(y);
      attempts += 1;
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
    appliedDateFrom,
    appliedDateTo,
    showCityBrowse,
    hasKeyword,
    orgData.length,
    catalog.length,
  ]);

  useEffect(() => {
    if (initializing) return;
    if (!showCityBrowse && !hasKeyword) return;

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
  }, [initializing, showCityBrowse, hasKeyword, persistBrowseState]);

  const keywordResults = useMemo(
    () => filterEvents(catalog, { query: searchQuery }),
    [catalog, searchQuery],
  );

  const browseResults = useMemo(
    () => filterEvents(orgData, { date: dateFilter }),
    [orgData, dateFilter],
  );

  const listEvents = hasKeyword ? keywordResults : browseResults;

  const toggleKeyword = () => {
    setKeywordOpen((open) => {
      const next = !open;
      if (!next) {
        setSearchQuery("");
      } else {
        setAdvancedOpen(false);
        void ensureCatalog();
      }
      return next;
    });
  };

  const toggleAdvanced = () => {
    setAdvancedOpen((open) => {
      const next = !open;
      if (next) {
        setDraftDateFrom(appliedDateFrom);
        setDraftDateTo(appliedDateTo);
        setKeywordOpen(false);
      }
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) void ensureCatalog();
  };

  const handleDateFromChange = (value: string) => {
    setDraftDateFrom(value);
  };

  const handleDateToChange = (value: string) => {
    setDraftDateTo(value);
  };

  const handleConfirmDates = () => {
    setAppliedDateFrom(draftDateFrom);
    setAppliedDateTo(draftDateTo);
  };

  const handleClearDates = () => {
    clearDateFilters();
  };

  const handleBackToCitySelect = useCallback(() => {
    setHasConfirmed(false);
    setSelectedCity(NO_CITY_SELECTED);
    setOrgData([]);
    clearDateFilters();
    setAdvancedOpen(false);
    clearEventsBrowseState();
    restoreEventsScrollY(0);
  }, [clearDateFilters]);

  const handleSelectCity = (city: string) => {
    const categories = resolveCategories();
    if (categories.length === 0) {
      setPickingCategories(true);
      return;
    }

    setSelectedCity(city);
    setSearchQuery("");
    clearDateFilters();
    setKeywordOpen(false);
    setAdvancedOpen(false);
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
    setHasConfirmed(false);
    setSelectedCity(NO_CITY_SELECTED);
    setOrgData([]);
    setPickingCategories(true);
    setSearchQuery("");
    clearDateFilters();
    setKeywordOpen(false);
    setAdvancedOpen(false);
    clearEventsBrowseState();
  };

  if (pickingCategories && !hasKeyword) {
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

  if (initializing || orgLoading) {
    return <LoadingIndicator />;
  }

  const cityLabel =
    selectedCity === ALL_CITIES ? ALL_CITIES : displayCityName(selectedCity);

  const headerChangeCategories = (
    <button
      type="button"
      onClick={handleChangeCategories}
      className="text-xs font-semibold text-gray-500 dark:text-gray-400 underline-offset-2 hover:underline shrink-0 px-2"
    >
      變更類型
    </button>
  );

  const keywordSearchControls = (showChangeCategories = true) => (
    <>
      <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
        <EventSearchTrigger
          expanded={keywordOpen}
          onToggle={toggleKeyword}
          label={t.events.searchPlaceholder}
        />
        <EventSearchInline
          expanded={keywordOpen}
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t.events.searchPlaceholder}
        />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {hasKeyword && (
          <p className="shrink-0 text-sm text-gray-400 whitespace-nowrap">
            {`${listEvents.length} 筆`}
          </p>
        )}
        {showChangeCategories && headerChangeCategories}
      </div>
    </>
  );

  const keywordSearchHint = keywordOpen ? (
    <div className="flex justify-start px-5 pb-2">
      <p className="text-left text-xs text-gray-400 max-w-xl w-full pl-1">
        {t.events.searchHint}
      </p>
    </div>
  ) : null;

  if (showCityBrowse) {
    return (
      <div className="min-h-dvh">
        <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-2">
          <BackButton onClick={handleBackToCitySelect} className="mb-0" />
          <div className="flex items-center justify-end gap-3 min-w-0">
            {headerChangeCategories}
            <EventAdvancedSearchTrigger
              expanded={advancedOpen}
              onToggle={toggleAdvanced}
              label={t.events.advancedSearch}
              active={hasDateFilter}
            />
            <p className="text-sm text-gray-400 whitespace-nowrap shrink-0">
              {`${listEvents.length} 筆`}
            </p>
          </div>
        </div>

        <EventAdvancedSearchPanel
          expanded={advancedOpen}
          dateFrom={draftDateFrom}
          dateTo={draftDateTo}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onConfirmDates={handleConfirmDates}
          confirmDatesDisabled={!dateDraftDirty}
          onClearDates={handleClearDates}
          dateHint={`${cityLabel} · ${t.events.dateFilterHint}`}
          innerClassName="px-5"
        />

        {orgData.length === 0 && (
          <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">目前沒有符合的活動</p>
            <p className="text-sm text-gray-400">
              {cityLabel} · 試試其他縣市或變更類型
            </p>
          </div>
        )}

        {orgData.length > 0 && listEvents.length === 0 && hasDateFilter && (
          <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">
              {t.events.browseDateNoResults}
            </p>
            <p className="text-sm text-gray-400">{t.events.dateFilterHint}</p>
          </div>
        )}

        {listEvents.length > 0 && (
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

  return (
    <div className="min-h-dvh">
      <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-2">
        {hasKeyword && hasConfirmed ? (
          <BackButton
            onClick={() => {
              setSearchQuery("");
              setKeywordOpen(false);
            }}
            className="mb-0 shrink-0"
          />
        ) : null}
        {keywordSearchControls(!hasConfirmed || !hasKeyword)}
      </div>

      {keywordSearchHint}

      {hasKeyword ? (
        catalogLoading && !catalogReady ? (
          <div className="min-h-[50dvh] flex items-center justify-center">
            <LoadingIndicator />
          </div>
        ) : listEvents.length === 0 ? (
          <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">{t.events.searchNoResults}</p>
            <p className="text-sm text-gray-400">{t.events.searchHint}</p>
          </div>
        ) : (
          <div className="px-5 pt-4 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {listEvents.map((event) => (
              <OrgEventCard
                key={event.id}
                event={event}
                onBeforeNavigate={persistBrowseState}
              />
            ))}
          </div>
        )
      ) : (
        <>
          <CityPicker
            cities={cities}
            selected={selectedCity}
            onSelect={handleSelectCity}
            placeholder={t.events.selectCityPlaceholder}
          />

          <div className="min-h-[40dvh] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">選擇縣市開始瀏覽</p>
            <p className="text-sm text-gray-400">
              也可直接用上方放大鏡全台搜尋；會沿用已選的活動類型
            </p>
          </div>
        </>
      )}
    </div>
  );
}
