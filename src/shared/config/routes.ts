export type AppLocale = "es" | "en";

type LocalizedRouteKey =
  | "home"
  | "howItWorks"
  | "guides"
  | "pro"
  | "faq"
  | "compare";

const localizedRoutes = {
  es: {
    home: "/es",
    howItWorks: "/es/como-funciona",
    guides: "/es/guias",
    pro: "/es/pro",
    faq: "/es/faq",
    compare: "/es/comparativas",
  },
  en: {
    home: "/en",
    howItWorks: "/en/how-it-works",
    guides: "/en/guides",
    pro: "/en/pro",
    faq: "/en/faq",
    compare: "/en/compare",
  },
} as const satisfies Record<AppLocale, Record<LocalizedRouteKey, string>>;

const alternateRoutes = Object.fromEntries(
  Object.keys(localizedRoutes.es).flatMap((key) => [
    [localizedRoutes.es[key as LocalizedRouteKey], localizedRoutes.en[key as LocalizedRouteKey]],
    [localizedRoutes.en[key as LocalizedRouteKey], localizedRoutes.es[key as LocalizedRouteKey]],
  ]),
) as Record<string, string>;

export function getLocalizedRoute(
  locale: AppLocale,
  route: LocalizedRouteKey,
) {
  return localizedRoutes[locale][route];
}

export function getAlternateLocalizedRoute(pathname: string) {
  return alternateRoutes[pathname];
}
