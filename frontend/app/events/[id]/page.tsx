import EventDetailClient from "@/components/events/EventDetailClient";
import EventDetailStatus from "@/components/events/EventDetailStatus";
import { fetchOrgEventCityPeersByRouteId } from "@/services/server/eventsServer";
import { findOrgEventByRouteId } from "@/services/events/canonicalToLegacy";
import type { OrgEvent } from "@/types/event";
import { parseCategoryQuery } from "@/utils/eventCategories";
import { eventDetailHref } from "@/utils/eventId";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ categories?: string | string[] }>;
};

function categoriesFromSearchParams(
  raw: string | string[] | undefined,
): ReturnType<typeof parseCategoryQuery> {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return parseCategoryQuery(value);
}

export default async function EventDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const categories = categoriesFromSearchParams(sp.categories);

  let cityEvents: OrgEvent[] = [];
  let loadError = false;

  try {
    cityEvents = await fetchOrgEventCityPeersByRouteId(id, categories);
  } catch (error) {
    console.error("Failed to load event detail:", error);
    cityEvents = [];
    loadError = true;
  }

  const event = findOrgEventByRouteId(cityEvents, id);

  if (loadError) {
    return (
      <div className="container mx-auto flex min-h-0 w-full flex-col items-center px-4 py-4 lg:py-6">
        <EventDetailStatus
          kind="loadError"
          retryHref={eventDetailHref(id, categories)}
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto flex min-h-0 w-full flex-col items-center px-4 py-4 lg:py-6">
        <EventDetailStatus kind="notFound" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-0 w-full flex-col items-center px-4 py-4 lg:py-6">
      <EventDetailClient routeId={id} cityEvents={cityEvents} />
    </div>
  );
}
