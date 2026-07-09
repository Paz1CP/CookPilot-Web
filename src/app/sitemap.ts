import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cookpilot.pro";

  const routes = [
    { es: "/es", en: "/en", priority: 1.0, changeFrequency: "weekly" as const },
    { es: "/es/como-funciona", en: "/en/how-it-works", priority: 0.8, changeFrequency: "weekly" as const },
    { es: "/es/guias", en: "/en/guides", priority: 0.8, changeFrequency: "weekly" as const },
    { es: "/es/pro", en: "/en/pro", priority: 0.9, changeFrequency: "weekly" as const },
    { es: "/es/faq", en: "/en/faq", priority: 0.7, changeFrequency: "weekly" as const },
    { es: "/es/comparativas", en: "/en/compare", priority: 0.8, changeFrequency: "weekly" as const },
  ];

  const localizedItems = routes.flatMap((route) => [
    {
      url: `${baseUrl}${route.es}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          "es": `${baseUrl}${route.es}`,
          "en": `${baseUrl}${route.en}`,
        },
      },
    },
    {
      url: `${baseUrl}${route.en}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          "es": `${baseUrl}${route.es}`,
          "en": `${baseUrl}${route.en}`,
        },
      },
    },
  ]);

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
      alternates: {
        languages: {
          "es": `${baseUrl}/es`,
          "en": `${baseUrl}/en`,
        },
      },
    },
    ...localizedItems,
    {
      url: `${baseUrl}/privacy-and-terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          "es": `${baseUrl}/privacy-and-terms`,
          "en": `${baseUrl}/privacy-and-terms`,
        },
      },
    },
    {
      url: `${baseUrl}/delete-account`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          "es": `${baseUrl}/delete-account`,
          "en": `${baseUrl}/delete-account`,
        },
      },
    },
  ];
}
