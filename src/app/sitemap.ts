import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cookpilot.pro";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          "es-PE": baseUrl,
          "en-US": baseUrl,
        },
      },
    },
    {
      url: `${baseUrl}/privacy-and-terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          "es-PE": `${baseUrl}/privacy-and-terms`,
          "en-US": `${baseUrl}/privacy-and-terms`,
        },
      },
    },
    {
      url: `${baseUrl}/delete-account`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          "es-PE": `${baseUrl}/delete-account`,
          "en-US": `${baseUrl}/delete-account`,
        },
      },
    },
  ];
}
