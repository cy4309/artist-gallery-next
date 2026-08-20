import type { MetadataRoute } from "next";
import { interviews } from "@/data/interviews/interviews";
import { fetchOrgEventsFromSheet } from "@/services/server/eventsServer";
import { eventDetailPath } from "@/utils/eventId";
import { getSiteBaseUrl } from "@/utils/siteMetadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/interviews`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const events = await fetchOrgEventsFromSheet();
    eventRoutes = events.map((event) => ({
      url: `${baseUrl}${eventDetailPath(event.id)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("[sitemap] failed to fetch events:", error);
  }

  const interviewRoutes: MetadataRoute.Sitemap = interviews.map((person) => ({
    url: `${baseUrl}/interviews/${person.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...eventRoutes, ...interviewRoutes];
}
