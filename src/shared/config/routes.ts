export type AppLocale = "es" | "en";

export type LocalizedRouteKey =
  | "home"
  | "howItWorks"
  | "guides"
  | "faq"
  | "compare"
  | "gallery";

export const localizedRoutes = {
  es: {
    home: "/es",
    howItWorks: "/es/como-funciona",
    guides: "/es/guias",
    faq: "/es/faq",
    compare: "/es/comparativas",
    gallery: "/es/gallery",
  },
  en: {
    home: "/en",
    howItWorks: "/en/how-it-works",
    guides: "/en/guides",
    faq: "/en/faq",
    compare: "/en/compare",
    gallery: "/en/gallery",
  },
} as const satisfies Record<AppLocale, Record<LocalizedRouteKey, string>>;

export const appLocales = ["es", "en"] as const satisfies readonly AppLocale[];
export const defaultLocale = "es" satisfies AppLocale;

export function getLocaleFromAcceptLanguage(value: string | null | undefined): AppLocale {
  const preferred = (value ?? "")
    .split(",")
    .map((entry, index) => {
      const [rawTag, ...parameters] = entry.trim().split(";");
      const qualityParameter = parameters.find((parameter) => parameter.trim().toLowerCase().startsWith("q="));
      const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;
      return { tag: rawTag.toLowerCase(), quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter((entry) => entry.tag && entry.tag !== "*" && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)[0]?.tag;

  if (preferred === "en" || preferred?.startsWith("en-")) return "en";
  if (preferred === "es" || preferred?.startsWith("es-")) return "es";
  return defaultLocale;
}

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
  if (alternateRoutes[pathname]) return alternateRoutes[pathname];
  return switchCookShareLocalePath(pathname, pathname.startsWith("/en") ? "es" : "en");
}

export type CookShareRouteObjectType =
  | "recipe"
  | "menu"
  | "day"
  | "week"
  | "list"
  | "ingredient"
  | "category";

const objectSegments: Record<AppLocale, Record<CookShareRouteObjectType, string>> = {
  es: {
    recipe: "recetas",
    menu: "menus",
    day: "dias",
    week: "semanas",
    list: "listas",
    ingredient: "ingredientes",
    category: "categorias",
  },
  en: {
    recipe: "recipes",
    menu: "menus",
    day: "days",
    week: "weeks",
    list: "lists",
    ingredient: "ingredients",
    category: "categories",
  },
};

export function buildCookSharePath(input: {
  locale: AppLocale;
  objectType: CookShareRouteObjectType;
  handle?: string | null;
  slug: string;
}) {
  const segment = objectSegments[input.locale][input.objectType];
  const handle = input.handle ? `@${input.handle.replace(/^@/, "").toLowerCase()}` : "";
  const prefix = handle ? `/${handle}` : "";
  return `${input.locale === "es" ? "/es" : "/en"}${prefix}/${segment}/${input.slug}`;
}

const cookShareSegmentAliases: Record<string, string> = {
  recetas: "recipes",
  recipes: "recetas",
  ingredientes: "ingredients",
  ingredients: "ingredientes",
  categorias: "categories",
  categories: "categorias",
  dias: "days",
  days: "dias",
  semanas: "weeks",
  weeks: "semanas",
  listas: "lists",
  lists: "listas",
};

export function switchCookShareLocalePath(pathname: string, locale: AppLocale) {
  const sourceLocale = pathname.startsWith("/en") ? "en" : pathname.startsWith("/es") ? "es" : null;
  if (!sourceLocale || sourceLocale === locale) return pathname;
  const parts = pathname.split("/").filter(Boolean);
  parts[0] = locale;
  for (let index = 1; index < parts.length; index += 1) {
    parts[index] = cookShareSegmentAliases[parts[index]] ?? parts[index];
  }
  return `/${parts.join("/")}`;
}
