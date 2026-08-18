import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/utils/siteMetadata";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/auth/",
        "/dashboard/",
        "/favorites/",
        "/entry/",
        "/for-icons/",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
