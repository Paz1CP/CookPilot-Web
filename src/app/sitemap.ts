import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/shared/config/site";
import { getLocalizedAlternates } from "@/shared/config/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(siteConfig.lastModified);

  const localizedItems = Object.entries(siteConfig.sitemap).flatMap(
    ([route, config]) =>
      siteConfig.locales.map((locale) => ({
        url: absoluteUrl(siteConfig.localizedRoutes[locale][route as keyof typeof siteConfig.sitemap]),
        lastModified,
        changeFrequency: config.changeFrequency,
        priority: config.priority,
        alternates: {
          languages: getLocalizedAlternates(route as keyof typeof siteConfig.sitemap),
        },
      })),
  );

  const utilityItems = Object.values(siteConfig.utilityRoutes).map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.sitemap.changeFrequency,
    priority: route.sitemap.priority,
  }));

  return [...localizedItems, ...utilityItems];
}

