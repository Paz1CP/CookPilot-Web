export type AppLocale = "es" | "en";

export type LocalizedRouteKey =
  | "home"
  | "howItWorks"
  | "guides"
  | "pro"
  | "faq"
  | "compare"
  | "gallery";

export const localizedRoutes = {
  es: {
    home: "/es",
    howItWorks: "/es/como-funciona",
    guides: "/es/guias",
    pro: "/es/pro",
    faq: "/es/faq",
    compare: "/es/comparativas",
    gallery: "/es/gallery",
  },
  en: {
    home: "/en",
    howItWorks: "/en/how-it-works",
    guides: "/en/guides",
    pro: "/en/pro",
    faq: "/en/faq",
    compare: "/en/compare",
    gallery: "/en/gallery",
  },
} as const satisfies Record<AppLocale, Record<LocalizedRouteKey, string>>;

export const appLocales = ["es", "en"] as const satisfies readonly AppLocale[];
export const defaultLocale = "es" satisfies AppLocale;

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

export function buildHandlePath(locale: AppLocale, handle: string) {
  return `${locale === "es" ? "/es" : "/en"}/@${handle.replace(/^@/, "").toLowerCase()}`;
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
