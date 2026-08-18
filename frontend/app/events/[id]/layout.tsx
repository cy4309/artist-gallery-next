import type { Metadata } from "next";
import { fetchOrgEventById } from "@/services/server/orgDataServer";
import { formatDateSmart } from "@/utils/date";
import { getEventOgImageUrl } from "@/utils/imageProxy";
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
  const { id } = await params;
  const baseUrl = getSiteBaseUrl();

  try {
    const event = await fetchOrgEventById(id);
    if (!event) {
      return {
        title: "找不到活動",
        description: "找不到這個活動",
      };
    }

    const title = event.actName;
    const description = buildEventDescription(event);
    const pageUrl = `${baseUrl}/events/${event.actId}`;
    const imageUrl = getEventOgImageUrl(event.actId, baseUrl);

    return {
      title,
      description,
      openGraph: {
        title,
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
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "活動",
      description: SITE_DESCRIPTION,
    };
  }
}

export default function EventDetailLayout({ children }: LayoutProps) {
  return children;
}
