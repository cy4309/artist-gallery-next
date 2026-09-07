"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { getOrgData } from "@/services/client/orgDataClient";
import MapTw from "@/containers/evnets/MapTw";
import BaseButton from "@/components/BaseButton";
import BackButton from "@/components/BackButton";
import EventsMobileList from "@/components/events/EventsMobileList";
import EventCategoryPicker from "@/components/events/EventCategoryPicker";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import {
  EventAdvancedSearchPanel,
  EventAdvancedSearchTrigger,
  EventSearchInline,
  EventSearchTrigger,
} from "@/components/events/EventSearchToggle";
import OrgEventCard from "@/components/events/OrgEventCard";
import { OrgEvent } from "@/types/event";
import { useLocale } from "@/locales/contexts/LocaleContext";
import LoadingIndicator from "@/components/LoadingIndicator";
import { CITY_ALL_LABEL, displayCityName } from "@/utils/city";
import { filterEvents, hasKeywordSearch } from "@/utils/eventSearch";
import { hasEventDateFilter } from "@/utils/eventDateFilter";
import {
  EventCategoryId,
  ALL_EVENT_CATEGORY_IDS,
  loadSessionCategories,
  saveSessionCategories,
} from "@/utils/eventCategories";
import {
  EVENTS_NAV_RESET_EVENT,
  captureEventsScrollY,
  clearEventsBrowseState,
  getEventsScrollRoot,
  loadEventsBrowseState,
  restoreEventsScrollY,
  saveEventsBrowseState,
  saveEventsBrowseStatePreservingScroll,
} from "@/utils/eventsBrowseState";
import { useEventSearchCatalog } from "@/hooks/useEventSearchCatalog";
import { useEventsListUrl } from "@/hooks/useEventsListUrl";
import { buildCityBrowseFetchOptions } from "@/utils/eventsListUrl";

export default function EventsPage() {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <EventsPageContent />
    </Suspense>
  );
}

function EventsPageContent() {
  const { t } = useLocale();
  const { listUrlState, replaceListUrl, clearListUrl } = useEventsListUrl();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [pickingCategories, setPickingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<
    EventCategoryId[]
  >([]);
  const [emptyCity, setEmptyCity] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [draftDateFrom, setDraftDateFrom] = useState("");
  const [draftDateTo, setDraftDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [keywordOpen, setKeywordOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [browseOrgData, setBrowseOrgData] = useState<OrgEvent[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [mobileListKey, setMobileListKey] = useState(0);
  const [desktopInitializing, setDesktopInitializing] = useState(true);
  const [restoreScrollY, setRestoreScrollY] = useState<number | null>(null);
  const [mapHighlightAll, setMapHighlightAll] = useState(false);

  const resetToStart = useCallback(() => {
    clearEventsBrowseState();
    clearListUrl();
    setHoveredId(null);
    setClickedId(null);
    setEmptyCity(false);
    setSearchQuery("");
    setDraftDateFrom("");
    setDraftDateTo("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setKeywordOpen(false);
    setAdvancedOpen(false);
    setBrowseOrgData([]);
    setBrowseLoading(false);
    setDesktopInitializing(false);
    setRestoreScrollY(null);
    const saved = loadSessionCategories();
    if (saved && saved.length > 0) {
      setSelectedCategories(saved);
      setPickingCategories(false);
      replaceListUrl({ categories: saved });
    } else {
      setSelectedCategories([]);
      setPickingCategories(true);
    }
    setMobileListKey((key) => key + 1);
    restoreEventsScrollY(0);
  }, [clearListUrl, replaceListUrl]);

  useEffect(() => {
    const onNavReset = () => resetToStart();
    window.addEventListener(EVENTS_NAV_RESET_EVENT, onNavReset);
    return () => window.removeEventListener(EVENTS_NAV_RESET_EVENT, onNavReset);
  }, [resetToStart]);

  const resolveCategories = useCallback((): EventCategoryId[] => {
    if (selectedCategories.length > 0) return selectedCategories;
    return loadSessionCategories() ?? [];
  }, [selectedCategories]);

  const { catalog, catalogLoading, ensureCatalog } = useEventSearchCatalog();

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

  const loadBrowseEvents = useCallback(
    async (city: string, categories: EventCategoryId[]) => {
      const fetchOptions = buildCityBrowseFetchOptions(city, categories);
      if (!fetchOptions) {
        setBrowseOrgData([]);
        setEmptyCity(true);
        return [];
      }

      try {
        setBrowseLoading(true);
        setEmptyCity(false);
        replaceListUrl({
          city,
          categories: categories.length > 0 ? categories : undefined,
        });
        const events = await getOrgData(fetchOptions);
        setBrowseOrgData(events);
        if (events.length === 0) {
          setEmptyCity(true);
        }
        saveEventsBrowseStatePreservingScroll({
          source: "desktop",
          mode: "city",
          city,
          searchQuery: "",
        });
        return events;
      } catch (error) {
        console.error("Failed to load browse events:", error);
        setBrowseOrgData([]);
        setEmptyCity(true);
        return [];
      } finally {
        setBrowseLoading(false);
      }
    },
    [replaceListUrl],
  );

  const keywordResults = useMemo(
    () => filterEvents(catalog, { query: searchQuery }),
    [catalog, searchQuery],
  );

  const browseResults = useMemo(
    () => filterEvents(browseOrgData, { date: dateFilter }),
    [browseOrgData, dateFilter],
  );

  const hasKeyword = hasKeywordSearch(searchQuery);
  const hasDateFilter = hasEventDateFilter(dateFilter);
  const showCityBrowse = Boolean(clickedId) && !hasKeyword;

  const persistBrowseState = useCallback(
    (scrollY = captureEventsScrollY()) => {
      if (!showCityBrowse && !hasKeyword) return;
      saveEventsBrowseState({
        source: "desktop",
        mode: hasKeyword ? "search" : "city",
        city: clickedId ?? undefined,
        searchQuery: searchQuery.trim(),
        dateFrom: appliedDateFrom || undefined,
        dateTo: appliedDateTo || undefined,
        scrollY,
      });
    },
    [
      appliedDateFrom,
      appliedDateTo,
      clickedId,
      hasKeyword,
      searchQuery,
      showCityBrowse,
    ],
  );

  const showLoading =
    desktopInitializing ||
    browseLoading ||
    (hasKeyword && catalogLoading);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const urlCity = listUrlState.city;
        const urlCategories = listUrlState.categories;
        const sessionCategories = loadSessionCategories();
        const urlHasCategoriesParam = Boolean(
          urlCategories && urlCategories.length > 0,
        );

        // URL 有 city 但無 categories → 視為全選類型（省略 param）
        const categories =
          urlHasCategoriesParam
            ? urlCategories!
            : urlCity
              ? ALL_EVENT_CATEGORY_IDS
              : sessionCategories && sessionCategories.length > 0
                ? sessionCategories
                : null;

        if (categories?.length) {
          if (!cancelled) {
            setSelectedCategories(categories);
            setPickingCategories(false);
            saveSessionCategories(categories);
          }
        } else if (!cancelled) {
          setSelectedCategories([]);
          setPickingCategories(true);
        }

        if (urlCity) {
          if (!cancelled) setClickedId(urlCity);
          const fetchOptions = buildCityBrowseFetchOptions(
            urlCity,
            categories ?? ALL_EVENT_CATEGORY_IDS,
          );
          if (!fetchOptions) return;
          setBrowseLoading(true);
          try {
            const events = await getOrgData(fetchOptions);
            if (!cancelled) {
              setBrowseOrgData(events);
              setEmptyCity(events.length === 0);
              replaceListUrl({
                city: urlCity,
                categories: categories ?? undefined,
              });
              const browse = loadEventsBrowseState();
              if (browse?.source === "desktop" && browse.scrollY > 0) {
                setRestoreScrollY(browse.scrollY);
              }
            }
          } catch (error) {
            console.error("Failed to restore events from URL:", error);
            if (!cancelled) {
              setBrowseOrgData([]);
              setEmptyCity(true);
            }
          } finally {
            if (!cancelled) setBrowseLoading(false);
          }
          return;
        }

        if (urlCategories?.length && !urlCity) {
          if (!cancelled) replaceListUrl({ categories: urlCategories });
          return;
        }

        const browse = loadEventsBrowseState();
        if (browse?.source !== "desktop") return;
        if (!categories?.length) return;

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
            setClickedId(browse.city);
            replaceListUrl({ city: browse.city, categories });
            if (restoredDate) {
              setDraftDateFrom(browse.dateFrom ?? "");
              setDraftDateTo(browse.dateTo ?? "");
              setAppliedDateFrom(browse.dateFrom ?? "");
              setAppliedDateTo(browse.dateTo ?? "");
              setAdvancedOpen(true);
            }
          }
          const fetchOptions = buildCityBrowseFetchOptions(
            browse.city,
            categories,
          );
          if (!fetchOptions) return;
          setBrowseLoading(true);
          try {
            const events = await getOrgData(fetchOptions);
            if (!cancelled) {
              setBrowseOrgData(events);
              setEmptyCity(events.length === 0);
              setRestoreScrollY(browse.scrollY);
            }
          } catch (error) {
            console.error("Failed to restore desktop events browse:", error);
            if (!cancelled) {
              setBrowseOrgData([]);
              setEmptyCity(true);
            }
          } finally {
            if (!cancelled) setBrowseLoading(false);
          }
        }
      } finally {
        if (!cancelled) setDesktopInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (restoreScrollY === null) return;
    if (desktopInitializing || browseLoading || (hasKeyword && catalogLoading)) {
      return;
    }
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
    desktopInitializing,
    browseLoading,
    catalogLoading,
    searchQuery,
    appliedDateFrom,
    appliedDateTo,
    showCityBrowse,
    hasKeyword,
    browseOrgData.length,
    keywordResults.length,
  ]);

  useEffect(() => {
    if (desktopInitializing) return;
    if (!showCityBrowse && !hasKeyword) return;

    const root = getEventsScrollRoot();
    if (!root) return;

    let persistTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(persistTimer);
      persistTimer = setTimeout(() => persistBrowseState(), 150);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(persistTimer);
      root.removeEventListener("scroll", onScroll);
    };
  }, [
    desktopInitializing,
    showCityBrowse,
    hasKeyword,
    persistBrowseState,
  ]);

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

  const handleMapHover = (id: string | null) => {
    setHoveredId(id);
  };

  const handleMapClick = (id: string) => {
    const categories = resolveCategories();
    if (categories.length === 0) {
      setPickingCategories(true);
      return;
    }

    setClickedId(id);
    setSearchQuery("");
    clearDateFilters();
    setKeywordOpen(false);
    setAdvancedOpen(false);
    void loadBrowseEvents(id, categories);
  };

  const handleCancelPick = () => {
    if (loadSessionCategories()) {
      setPickingCategories(false);
    }
    setEmptyCity(false);
  };

  const handleConfirmCategories = async (categories: EventCategoryId[]) => {
    if (categories.length === 0) return;
    setSelectedCategories(categories);
    saveSessionCategories(categories);
    setPickingCategories(false);
    if (clickedId) {
      await loadBrowseEvents(clickedId, categories);
    } else {
      replaceListUrl({ categories });
    }
  };

  const handleBackToMap = useCallback(() => {
    setEmptyCity(false);
    setClickedId(null);
    setHoveredId(null);
    setBrowseOrgData([]);
    clearDateFilters();
    setAdvancedOpen(false);
    clearEventsBrowseState();
    const cats = resolveCategories();
    if (cats.length > 0) replaceListUrl({ categories: cats });
    else clearListUrl();
    restoreEventsScrollY(0);
  }, [clearDateFilters, clearListUrl, replaceListUrl, resolveCategories]);

  const handleChangeCategories = () => {
    const saved = loadSessionCategories();
    setSelectedCategories(saved && saved.length > 0 ? saved : []);

    setEmptyCity(false);

    setClickedId(null);

    setBrowseOrgData([]);

    setSearchQuery("");

    clearDateFilters();

    setKeywordOpen(false);

    setAdvancedOpen(false);

    setPickingCategories(true);

    clearEventsBrowseState();
    clearListUrl();
  };

  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      <div className="lg:hidden flex flex-col flex-1 min-h-0">
        <EventsMobileList key={mobileListKey} />
      </div>

      <div className="hidden lg:flex flex-col w-full h-full min-h-0">
        <div className="w-full shrink-0 space-y-2 pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {showCityBrowse ? (
                <BackButton onClick={handleBackToMap} className="mb-0 shrink-0" />
              ) : (
                <>
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
                    size="fixed"
                  />
                </>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {showCityBrowse ? (
                <>
                  <button
                    type="button"
                    onClick={handleChangeCategories}
                    className={`shrink-0 text-xs font-semibold underline underline-offset-2 px-2 transition-colors hover:text-black dark:hover:text-white ${
                      pickingCategories
                        ? "text-black dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {t.events.changeCategories}
                  </button>
                  <EventAdvancedSearchTrigger
                    expanded={advancedOpen}
                    onToggle={toggleAdvanced}
                    label={t.events.advancedSearch}
                    active={hasDateFilter}
                  />
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleChangeCategories}
                  className={`shrink-0 text-xs font-semibold underline underline-offset-2 px-2 transition-colors hover:text-black dark:hover:text-white ${
                    pickingCategories
                      ? "text-black dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {t.events.changeCategories}
                </button>
              )}
            </div>
          </div>

          {showCityBrowse ? (
            <div className="flex justify-end">
              <p className="text-sm text-gray-400 whitespace-nowrap">
                {t.events.listCount.replace(
                  "{count}",
                  String(browseResults.length),
                )}
              </p>
            </div>
          ) : null}

          {keywordOpen && !showCityBrowse ? (
            <div className="flex justify-start">
              <p className="text-left text-xs text-gray-400 max-w-xl w-full pl-1">
                {t.events.searchHint}
              </p>
            </div>
          ) : null}

          {advancedOpen && showCityBrowse ? (
            <div className="flex justify-end">
              <div className="w-full max-w-xl">
                <EventAdvancedSearchPanel
                  expanded={advancedOpen}
                  dateFrom={draftDateFrom}
                  dateTo={draftDateTo}
                  onDateFromChange={handleDateFromChange}
                  onDateToChange={handleDateToChange}
                  onConfirmDates={handleConfirmDates}
                  confirmDatesDisabled={!dateDraftDirty}
                  onClearDates={handleClearDates}
                  dateHint={`${displayCityName(clickedId, t.cities)} · ${t.events.dateFilterHint}`}
                  compact
                  innerClassName="px-0"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="container mx-auto px-4 flex-1 min-h-0 flex flex-col">
          {showLoading && <LoadingIndicator />}

          {!showLoading && hasKeyword && (
            <div className="flex-1 min-h-0">
              {keywordResults.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                  <p className="text-lg font-semibold">
                    {t.events.searchNoResults}
                  </p>

                  <p className="text-sm text-gray-400">{t.events.searchHint}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl mx-auto pb-8">
                  {keywordResults.map((event) => (
                    <OrgEventCard
                      key={event.id}
                      event={event}
                      categories={selectedCategories}
                      onBeforeNavigate={persistBrowseState}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!showLoading && showCityBrowse && !emptyCity && (
            <div className="flex-1 min-h-0">
              {browseResults.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                  <p className="text-lg font-semibold">
                    {t.events.browseDateNoResults}
                  </p>

                  <p className="text-sm text-gray-400">
                    {displayCityName(clickedId, t.cities)} · {t.events.dateFilterHint}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl mx-auto pb-8">
                  {browseResults.map((event) => (
                    <OrgEventCard
                      key={event.id}
                      event={event}
                      categories={selectedCategories}
                      onBeforeNavigate={persistBrowseState}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!showLoading && !hasKeyword && !showCityBrowse && (
            <div className="flex-1 min-h-0 flex flex-col justify-center items-center">
              {!pickingCategories && !emptyCity && (
                <div className="w-full h-full min-h-0 flex flex-col justify-center items-center">
                  {(hoveredId ?? t.events.title) && (
                    <BaseButton className="my-4 shrink-0">
                      <h5 className="text-center text-xl font-bold">
                        - {displayCityName(hoveredId, t.cities) || t.events.title} -
                      </h5>
                    </BaseButton>
                  )}

                  <p className="mb-2 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {t.events.browseCityHint}
                    <button
                      type="button"
                      onClick={() => handleMapClick(CITY_ALL_LABEL)}
                      onMouseEnter={() => {
                        setMapHighlightAll(true);
                        handleMapHover(CITY_ALL_LABEL);
                      }}
                      onMouseLeave={() => {
                        setMapHighlightAll(false);
                        handleMapHover(null);
                      }}
                      className={`underline underline-offset-2 transition-colors hover:text-black dark:hover:text-white ${
                        mapHighlightAll
                          ? "text-black dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {t.events.browseAllCities}
                    </button>
                  </p>

                  <section className="p-4 flex-1 min-h-0 w-full flex items-center justify-center">
                    <MapTw
                      onHover={handleMapHover}
                      onClick={handleMapClick}
                      highlightAll={mapHighlightAll}
                    />
                  </section>
                </div>
              )}

              {pickingCategories && (
                <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4">
                  <EventCategoryPicker
                    variant="inline"
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                    onConfirm={handleConfirmCategories}
                    onCancel={handleCancelPick}
                    loading={browseLoading}
                    confirmLoadsData={Boolean(clickedId)}
                  />
                </div>
              )}

              {emptyCity && (
                <div className="m-4 w-full flex flex-col justify-center items-center">
                  <p className="my-4 text-center">
                    {t.events.listCountZero.replace(
                      "{city}",
                      displayCityName(clickedId, t.cities),
                    )}
                  </p>

                  <p className="text-sm text-gray-400">
                    {t.events.emptyCityNoResults}
                  </p>
                </div>
              )}
            </div>
          )}

          {!showLoading && showCityBrowse && emptyCity && (
            <div className="m-4 w-full flex flex-col justify-center items-center flex-1">
              <p className="my-4 text-center">
                {t.events.listCountZero.replace(
                  "{city}",
                  displayCityName(clickedId, t.cities),
                )}
              </p>

              <p className="text-sm text-gray-400">
                {t.events.emptyCityNoResults}
              </p>
            </div>
          )}
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
