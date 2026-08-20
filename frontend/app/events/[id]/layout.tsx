import type { Metadata } from "next";
import { fetchOrgEventByRouteId } from "@/services/server/eventsServer";
import { formatDateSmart } from "@/utils/date";
import { getEventOgImageUrl } from "@/utils/imageProxy";
import { eventDetailPath } from "@/utils/eventId";
import {
  getSiteBaseUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/utils/siteMetadata";

export const dynamic = "force-dynamic";

function buildEventDescription(event: {
  startTime: string;
  endTime: string;
  address: string;
  cityName: string;
  description: string;
}): string {
  const start = formatDateSmart(event.startTime);
  const end = formatDateSmart(event.endTime);
  const datePart =
    start && end && start !== end ? `${start} – ${end}` : start || end;
  const location = event.address || event.cityName;

  const summary = [datePart, location].filter(Boolean).join(" · ");
  if (summary) return summary;

  const trimmed = event.description?.trim();
  if (trimmed) return trimmed.slice(0, 160);

  return "活動詳情";
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { id: rawId } = await params;
  const baseUrl = getSiteBaseUrl();

  try {
    const event = await fetchOrgEventByRouteId(rawId);
    if (!event) {
      return {
        title: { absolute: SITE_NAME },
        description: "找不到這個活動",
      };
    }

    const ogTitle = event.actName;
    const description = buildEventDescription(event);
    const pageUrl = `${baseUrl}${eventDetailPath(event.id)}`;
    const imageUrl = getEventOgImageUrl(event.id, baseUrl);

    return {
      title: { absolute: SITE_NAME },
      description,
      openGraph: {
        title: ogTitle,
        description,
        url: pageUrl,
        siteName: SITE_NAME,
        type: "website",
        locale: "zh_TW",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: ogTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: ogTitle,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: { absolute: SITE_NAME },
      description: SITE_DESCRIPTION,
    };
  }
}

export default function EventDetailLayout({ children }: LayoutProps) {
  return children;
}
