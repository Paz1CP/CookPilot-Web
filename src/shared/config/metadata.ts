import type { Metadata } from "next";
import { siteConfig, absoluteUrl, type PublicUtilityRouteKey } from "@/shared/config/site";
import { type AppLocale, type LocalizedRouteKey } from "@/shared/config/routes";
import { hasActiveGalleryFacets } from "@/lib/cookshare/gallery-query";
import type { CookShareResolvedObject, GalleryState } from "@/lib/cookshare/types";

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

export function createCookShareMetadata(
  object: CookShareResolvedObject,
  locale: AppLocale,
  options: { noindex?: boolean; alternate?: CookShareResolvedObject | null } = {},
): Metadata {
  const title = object.object_type === "ingredient" || object.object_type === "category"
    ? (locale === "en" ? object.name_en : object.name) ?? object.name ?? object.name_en ?? "CookPilot"
    : object.title ?? "CookPilot";
  const description = typeof object.description === "string"
    ? object.description
    : locale === "en"
      ? "Discover this CookPilot food object and open it in the app."
      : "Descubre este objeto de CookPilot y ábrelo en la app.";
  const canonical = absoluteUrl(object.identity.canonical_path);
  const alternateLocale = locale === "es" ? "en" : "es";
  const image = [object.cover_photo_url, object.image_url].map((value) => {
    if (!value) return null;
    try {
      const candidate = new URL(value, siteConfig.publicUrl);
      return candidate.hostname === "media.cookpilot.pro" ? candidate.toString() : null;
    } catch {
      return null;
    }
  }).find((value): value is string => Boolean(value));

  const languages: Record<string, string> = { [locale]: canonical };
  if (options.alternate?.identity.object_id === object.identity.object_id) {
    languages[alternateLocale] = absoluteUrl(options.alternate.identity.canonical_path);
    languages["x-default"] = canonical;
  }

  return {
    title: `${title} | CookPilot`,
    description,
    alternates: {
      canonical,
      languages,
    },
    robots: options.noindex ? { index: false, follow: true } : indexRobots,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.productName,
      locale: ogLocale[locale],
      type: "website",
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function createGalleryMetadata(locale: AppLocale, state: GalleryState): Metadata {
  const page = siteConfig.localizedPageMetadata[locale].gallery;
  const hasQuery = Boolean(state.q || hasActiveGalleryFacets(state) || state.type !== "all");
  const title = state.q
    ? `${state.q} | ${page.title}`
    : page.title;
  const canonical = absoluteUrl(siteConfig.localizedRoutes[locale].gallery);
  return {
    title,
    description: page.description,
    alternates: {
      canonical,
      languages: getLocalizedAlternates("gallery"),
    },
    robots: hasQuery ? { index: false, follow: true } : indexRobots,
    openGraph: {
      title,
      description: page.description,
      url: canonical,
      siteName: siteConfig.productName,
      locale: ogLocale[locale],
      type: "website",
    },
  };
}

export function createMissingCookShareMetadata(locale: AppLocale): Metadata {
  return {
    title: locale === "en" ? "CookShare | CookPilot" : "CookShare | CookPilot",
    robots: { index: false, follow: false },
  };
}
