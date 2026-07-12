import type { Metadata } from "next";
import { siteConfig, absoluteUrl, type PublicUtilityRouteKey } from "@/shared/config/site";
import { type AppLocale, type LocalizedRouteKey } from "@/shared/config/routes";

const ogLocale = {
  es: "es_PE",
  en: "en_US",
} satisfies Record<AppLocale, string>;

const languageCode = {
  es: "es",
  en: "en",
} satisfies Record<AppLocale, string>;

const indexRobots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
} satisfies Metadata["robots"];

export function getLocalizedAlternates(route: LocalizedRouteKey) {
  return {
    es: absoluteUrl(siteConfig.localizedRoutes.es[route]),
    en: absoluteUrl(siteConfig.localizedRoutes.en[route]),
    "x-default": absoluteUrl(siteConfig.localizedRoutes[siteConfig.defaultLocale][route]),
  };
}

export function createLocalizedMetadata(route: LocalizedRouteKey, locale: AppLocale): Metadata {
  const page = siteConfig.localizedPageMetadata[locale][route];
  const url = absoluteUrl(siteConfig.localizedRoutes[locale][route]);
  const image = siteConfig.defaultOpenGraphImage;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
      languages: getLocalizedAlternates(route),
    },
    robots: indexRobots,
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: siteConfig.productName,
      locale: ogLocale[locale],
      alternateLocale: siteConfig.locales
        .filter((item) => item !== locale)
        .map((item) => ogLocale[item]),
      type: "website",
      images: [
        {
          url: absoluteUrl(image.path),
          width: image.width,
          height: image.height,
          alt: image.alt[locale],
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [
        {
          url: absoluteUrl(image.path),
          alt: image.alt[locale],
        },
      ],
    },
  };
}

export function createUtilityMetadata(route: PublicUtilityRouteKey): Metadata {
  const page = siteConfig.utilityRoutes[route];
  const url = absoluteUrl(page.path);
  const image = siteConfig.defaultOpenGraphImage;
  const locale = siteConfig.defaultLocale;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    robots: indexRobots,
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: siteConfig.productName,
      locale: ogLocale[locale],
      type: page.openGraphType,
      images: [
        {
          url: absoluteUrl(image.path),
          width: image.width,
          height: image.height,
          alt: image.alt[locale],
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [
        {
          url: absoluteUrl(image.path),
          alt: image.alt[locale],
        },
      ],
    },
  };
}

export function getDocumentLocale(pathname: string | null): AppLocale {
  if (pathname?.startsWith("/en")) return "en";
  return siteConfig.defaultLocale;
}

export function getHtmlLanguage(locale: AppLocale) {
  return languageCode[locale];
}

