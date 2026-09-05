import type { MetadataRoute } from "next";
import { createSupabaseInternalClient } from "@/lib/supabase/internal";
import { absoluteUrl, siteConfig } from "@/shared/config/site";
import { buildCookSharePath, buildHandlePath, type AppLocale, type CookShareRouteObjectType } from "@/shared/config/routes";
import { getLocalizedAlternates } from "@/shared/config/metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type QueryResponse<T> = {
  data: T[] | null;
  error: unknown;
};

type RouteRow = {
  object_type: string;
  object_id: string;
  owner_id: string | null;
  handle: string | null;
  slug: string;
  created_at: string | null;
};

type IdentityRow = {
  object_type: string;
  object_id: string;
  owner_id: string | null;
  current_slug: string;
  publication_override: boolean | null;
  admin_disabled: boolean;
  lifecycle: string;
  updated_at: string | null;
};

type RecipeRow = {
  id: string;
  origin: string | null;
  source_recipe_id: string | null;
};

type PreferenceRow = {
  user_id: string;
  cookshare_public_by_default: boolean | null;
};

type DynamicRoute = RouteRow & {
  identity: IdentityRow;
};

const pageSize = 1000;

async function fetchAll<T>(load: (from: number, to: number) => Promise<QueryResponse<T>>) {
  const rows: T[] = [];
  for (let from = 0; from < 50000; from += pageSize) {
    const result = await load(from, from + pageSize - 1);
    if (result.error) return rows;
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

function staticEntries(): MetadataRoute.Sitemap {
  const lastModified = new Date(siteConfig.lastModified);
  const localizedItems = Object.entries(siteConfig.sitemap).flatMap(([route, config]) =>
    siteConfig.locales.map((locale) => ({
      url: absoluteUrl(siteConfig.localizedRoutes[locale][route as keyof typeof siteConfig.sitemap]),
      lastModified,
      changeFrequency: config.changeFrequency,
      priority: config.priority,
      alternates: { languages: getLocalizedAlternates(route as keyof typeof siteConfig.sitemap) },
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

function normalizeHandle(value: string | null) {
  const handle = value?.replace(/^@/, "").trim().toLowerCase() ?? "";
  return /^[a-z0-9][a-z0-9._-]{2,29}$/.test(handle) ? handle : null;
}

function dateFrom(...values: Array<string | null | undefined>) {
  const timestamp = values
    .map((value) => value ? Date.parse(value) : Number.NaN)
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  return Number.isFinite(timestamp) ? new Date(timestamp) : new Date(siteConfig.lastModified);
}

function localizedObjectUrls(route: DynamicRoute) {
  const objectType = route.object_type as CookShareRouteObjectType;
  if (!["recipe", "menu", "day", "week"].includes(objectType) && !["ingredient", "category"].includes(objectType)) return null;
  const paths = Object.fromEntries(siteConfig.locales.map((locale: AppLocale) => [
    locale,
    buildCookSharePath({
      locale,
      objectType,
      handle: route.handle,
      slug: route.slug,
    }),
  ])) as Record<AppLocale, string>;
  return paths;
}

function isPublic(route: DynamicRoute, recipe: RecipeRow | undefined, defaults: Map<string, boolean>) {
  const { identity } = route;
  if (identity.lifecycle !== "active" || identity.admin_disabled) return false;
  if (route.object_type === "ingredient" || route.object_type === "category") return true;
  if (route.object_type === "list") return false;
  if (route.object_type === "recipe" && recipe?.origin?.toLowerCase() === "official" && !recipe.source_recipe_id) return true;
  if (identity.publication_override !== null) return identity.publication_override;
  const ownerId = identity.owner_id ?? route.owner_id;
  return Boolean(ownerId && defaults.get(ownerId));
}

async function dynamicEntries(): Promise<MetadataRoute.Sitemap> {
  let internal: ReturnType<typeof createSupabaseInternalClient>;
  try {
    internal = createSupabaseInternalClient();
  } catch {
    return staticEntries();
  }

  const [routeRows, identityRows, recipeRows, preferenceRows] = await Promise.all([
    fetchAll<RouteRow>(async (from, to) => {
      const result = await internal.schema("home").from("cookshare_public_routes")
        .select("object_type,object_id,owner_id,handle,slug,created_at")
        .eq("is_current", true)
        .eq("route_kind", "current")
        .order("created_at", { ascending: false })
        .range(from, to);
      return { data: result.data as RouteRow[] | null, error: result.error };
    }),
    fetchAll<IdentityRow>(async (from, to) => {
      const result = await internal.schema("home").from("cookshare_public_identities")
        .select("object_type,object_id,owner_id,current_slug,publication_override,admin_disabled,lifecycle,updated_at")
        .range(from, to);
      return { data: result.data as IdentityRow[] | null, error: result.error };
    }),
    fetchAll<RecipeRow>(async (from, to) => {
      const result = await internal.schema("menu").from("recipes")
        .select("id,origin,source_recipe_id")
        .range(from, to);
      return { data: result.data as RecipeRow[] | null, error: result.error };
    }),
    fetchAll<PreferenceRow>(async (from, to) => {
      const result = await internal.schema("users").from("user_preferences")
        .select("user_id,cookshare_public_by_default")
        .range(from, to);
      return { data: result.data as PreferenceRow[] | null, error: result.error };
    }),
  ]);

  const identities = new Map(identityRows.map((row) => [`${row.object_type}:${row.object_id}`, row]));
  const recipes = new Map(recipeRows.map((row) => [row.id, row]));
  const defaults = new Map(preferenceRows.map((row) => [row.user_id, Boolean(row.cookshare_public_by_default)]));
  const routes: DynamicRoute[] = routeRows.flatMap((route) => {
    const identity = identities.get(`${route.object_type}:${route.object_id}`);
    return identity ? [{ ...route, identity }] : [];
  });

  const entries: MetadataRoute.Sitemap = [...staticEntries()];
  const handles = new Set<string>();
  for (const route of routes) {
    if (!route.slug || !isPublic(route, recipes.get(route.object_id), defaults)) continue;
    const paths = localizedObjectUrls(route);
    if (!paths) continue;
    const priority = route.object_type === "recipe"
      ? recipes.get(route.object_id)?.origin?.toLowerCase() === "official" ? 0.8 : 0.6
      : route.object_type === "menu" ? 0.7 : route.object_type === "week" ? 0.7 : route.object_type === "day" ? 0.5 : 0.5;
    entries.push(...siteConfig.locales.map((locale) => ({
      url: absoluteUrl(paths[locale]),
      lastModified: dateFrom(route.identity.updated_at, route.created_at),
      changeFrequency: route.object_type === "ingredient" || route.object_type === "category" ? "monthly" as const : "weekly" as const,
      priority,
      alternates: { languages: { es: absoluteUrl(paths.es), en: absoluteUrl(paths.en) } },
    })));
    const handle = normalizeHandle(route.handle);
    if (handle && ["recipe", "menu", "day", "week"].includes(route.object_type)) handles.add(handle);
  }

  for (const handle of handles) {
    const paths = Object.fromEntries(siteConfig.locales.map((locale: AppLocale) => [locale, buildHandlePath(locale, handle)])) as Record<AppLocale, string>;
    entries.push(...siteConfig.locales.map((locale) => ({
      url: absoluteUrl(paths[locale]),
      lastModified: new Date(siteConfig.lastModified),
      changeFrequency: "weekly" as const,
      priority: 0.4,
      alternates: { languages: { es: absoluteUrl(paths.es), en: absoluteUrl(paths.en) } },
    })));
  }
  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return dynamicEntries();
}
