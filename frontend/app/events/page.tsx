"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrgData } from "@/services/client/orgDataClient";
import MapTw from "@/containers/evnets/MapTw";
import BaseButton from "@/components/BaseButton";
import BackButton from "@/components/BackButton";
import EventsMobileList from "@/components/events/EventsMobileList";
import {
  EventSearchInline,
  EventSearchTrigger,
} from "@/components/events/EventSearchToggle";
import OrgEventCard from "@/components/events/OrgEventCard";
import { OrgEvent } from "@/types/event";
import { useLocale } from "@/locales/contexts/LocaleContext";
import LoadingIndicator from "@/components/LoadingIndicator";
import { filterEventsByKeyword } from "@/utils/eventSearch";

export default function EventsPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [isMapClicked, setIsMapClicked] = useState(false);
  const [orgData, setOrgData] = useState<OrgEvent[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setSearchQuery("");
      return !open;
    });
  };

  const nowData = useMemo(() => {
    if (!clickedId) return [];
    return orgData.filter((data) => data.cityName.includes(clickedId));
  }, [clickedId, orgData]);

  const searchResults = useMemo(
    () => filterEventsByKeyword(orgData, searchQuery),
    [orgData, searchQuery],
  );

  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setOrgLoading(true);
        const response = await getOrgData();
        setOrgData(response as OrgEvent[]);
      } catch (error) {
        console.error("Failed to fetch org data:", error);
      } finally {
        setOrgLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  const handleMapHover = (id: string | null) => {
    setHoveredId(id);
  };

  const handleMapClick = (id: string) => {
    setClickedId(id);
  };

  useEffect(() => {
    if (!clickedId || orgLoading || isSearching) return;

    const timer = setTimeout(() => {
      if (nowData.length > 0) {
        router.push(`/events/${nowData[0].actId}`);
        return;
      }
      setIsMapClicked(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [clickedId, orgLoading, nowData, router, isSearching]);

  const handleCloseList = () => {
    setIsMapClicked(false);
    setClickedId(null);
    setHoveredId(null);
  };

  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      <div className="lg:hidden flex flex-col flex-1 min-h-0">
        <EventsMobileList orgData={orgData} orgLoading={orgLoading} />
      </div>

      <div className="hidden lg:flex flex-col w-full h-full min-h-0">
        <div className="w-full shrink-0 flex items-center justify-end gap-2 pb-2">
          {!orgLoading && orgData.length > 0 && (
            <div className="flex items-center">
              <EventSearchTrigger
                expanded={searchOpen}
                onToggle={toggleSearch}
                label={t.events.searchPlaceholder}
              />
              <EventSearchInline
                expanded={searchOpen}
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t.events.searchPlaceholder}
              />
              {isSearching && (
                <p className="text-sm text-gray-400 whitespace-nowrap">
                  {searchResults.length} 筆
                </p>
              )}
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 flex-1 min-h-0 flex flex-col">
          {orgLoading && <LoadingIndicator />}

          {!orgLoading && isSearching && (
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
                    <OrgEventCard key={event.actId} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!orgLoading && !isSearching && (
            <div className="flex-1 min-h-0 flex flex-col justify-center items-center">
              {!isMapClicked && (
                <div className="w-full h-full min-h-0 flex flex-col justify-center items-center">
                  {(hoveredId ?? t.events.title) && (
                    <BaseButton className="my-4 shrink-0">
                      <h5 className="text-center text-xl font-bold">
                        - {hoveredId ?? t.events.title} -
                      </h5>
                    </BaseButton>
                  )}

                  <section className="p-4 flex-1 min-h-0 w-full flex items-center justify-center">
                    <MapTw onHover={handleMapHover} onClick={handleMapClick} />
                  </section>
                </div>
              )}

              {isMapClicked && (
                <div className="m-4 w-full flex flex-col justify-center items-center">
                  <BackButton onClick={handleCloseList} />
                  <p className="my-4 text-center">
                    No events found - {clickedId} -
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
