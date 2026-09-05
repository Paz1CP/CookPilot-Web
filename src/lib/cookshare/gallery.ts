import { supabaseConfig } from "@/lib/supabase/config";
import { createSupabaseInternalClient } from "@/lib/supabase/internal";
import { createSupabaseServerClient, getRequestUser } from "@/lib/supabase/server";
import { buildCookSharePath, buildHandlePath, type AppLocale } from "@/shared/config/routes";
import {
  emptyGalleryFacets,
  galleryQueryFingerprint,
  hasActiveGalleryFacets,
} from "./gallery-query";
import type {
  CookShareObjectType,
  GalleryCard,
  GalleryFacetOptions,
  GalleryPage,
  GalleryState,
} from "./types";

export { parseGalleryState } from "./gallery-query";

const PAGE_SIZE = 24;
const RPC_LIMIT = 600;

type GalleryRpcRow = {
  object_type: string;
  object_id: string;
  owner_id?: string | null;
  handle?: string | null;
  slug: string;
  title?: string | null;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  is_free?: boolean | null;
  time_minutes?: number | null;
  nutrition?: Record<string, number | string | null> | null;
  rank?: number | null;
  component?: string | null;
  slot_profile?: Record<string, number | string | null> | null;
  ingredients?: string[] | null;
};

type GalleryCursor = {
  rank: number;
  title: string;
  id: string;
  objectType?: string;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHandle(value: string | null | undefined) {
  const handle = value?.replace(/^@/, "").trim().toLowerCase() ?? "";
  return /^[a-z0-9][a-z0-9._-]{2,29}$/.test(handle) ? handle : null;
}

function mediaUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const expected = new URL(supabaseConfig.mediaBaseUrl);
    const candidate = new URL(value, expected);
    return candidate.protocol === "https:" && candidate.origin === expected.origin
      ? candidate.toString()
      : null;
  } catch {
    return null;
  }
}

function numberValue(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function encodeCursor(row: GalleryRpcRow) {
  return Buffer.from(JSON.stringify({
    rank: numberValue(row.rank) ?? 0,
    title: normalizeText(row.title ?? row.title_en ?? ""),
    id: row.object_id,
    objectType: row.object_type,
  }), "utf8").toString("base64url");
}

function decodeCursor(cursor: string | null): GalleryCursor | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as Partial<GalleryCursor>;
    if (typeof parsed.rank !== "number" || typeof parsed.title !== "string" || typeof parsed.id !== "string") return null;
    return parsed as GalleryCursor;
  } catch {
    return null;
  }
}

function compareRows(a: GalleryRpcRow, b: GalleryRpcRow) {
  const rank = (numberValue(a.rank) ?? 0) - (numberValue(b.rank) ?? 0);
  if (rank) return rank;
  const title = normalizeText(a.title ?? a.title_en ?? "").localeCompare(normalizeText(b.title ?? b.title_en ?? ""));
  if (title) return title;
  const id = a.object_id.localeCompare(b.object_id);
  return id || a.object_type.localeCompare(b.object_type);
}

function compareCursor(row: GalleryRpcRow, cursor: GalleryCursor) {
  const rank = (numberValue(row.rank) ?? 0) - cursor.rank;
  if (rank) return rank;
  const title = normalizeText(row.title ?? row.title_en ?? "").localeCompare(cursor.title);
  if (title) return title;
  const id = row.object_id.localeCompare(cursor.id);
  return id || row.object_type.localeCompare(cursor.objectType ?? "");
}

function emptyFacetOptions(locale: AppLocale): GalleryFacetOptions {
  const labels = locale === "es"
    ? {
      meals: ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena", "Noche"],
      components: ["Plato principal", "Entrada", "Acompañamiento", "Ensalada", "Bebida", "Salsa", "Postre", "Aderezo"],
    }
    : {
      meals: ["Breakfast", "Morning snack", "Lunch", "Afternoon snack", "Dinner", "Late night"],
      components: ["Main dish", "Appetizer", "Side dish", "Salad", "Beverage", "Sauce", "Dessert", "Dressing"],
    };
  return {
    categories: [],
    meals: [
      "breakfast",
      "morning_snack",
      "lunch",
      "afternoon_snack",
      "dinner",
      "late_night",
    ].map((value, index) => ({ value, label: labels.meals[index] })),
    components: [
      "main_dish",
      "appetizer",
      "side_dish",
      "salad",
      "beverage",
      "sauce",
      "dessert",
      "dressing",
    ].map((value, index) => ({ value, label: labels.components[index] })),
    times: [15, 30, 45, 60],
  };
}

async function getFacetOptions(locale: AppLocale, internal: ReturnType<typeof createSupabaseInternalClient> | null) {
  const options = emptyFacetOptions(locale);
  if (!internal) return options;
  const result = await internal.schema("menu").from("recipe_categories")
    .select("slug,name,name_en,sort_order")
    .order("sort_order", { ascending: true })
    .limit(100);
  if (result.error || !Array.isArray(result.data)) return options;
  options.categories = (result.data as Array<{ slug?: string | null; name?: string | null; name_en?: string | null }>).flatMap((row) => {
    if (!row.slug) return [];
    return [{ value: row.slug.toLowerCase(), label: locale === "en" ? row.name_en || row.name || row.slug : row.name || row.name_en || row.slug }];
  });
  return options;
}

async function getSearchHandleRows(
  state: GalleryState,
  client: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  internal: ReturnType<typeof createSupabaseInternalClient> | null,
): Promise<GalleryRpcRow[]> {
  if (!internal || state.type !== "all" || !state.q || state.scope !== "global") return [];
  const result = await internal.schema("home").from("cookshare_public_routes")
    .select("object_type,object_id,owner_id,handle,slug,route_kind,is_current")
    .eq("is_current", true)
    .eq("route_kind", "current")
    .not("handle", "is", null)
    .ilike("handle", `%${state.q}%`)
    .limit(60);
  if (result.error || !Array.isArray(result.data)) return [];
  const seen = new Set<string>();
  const rows: GalleryRpcRow[] = [];
  for (const [index, raw] of (result.data as RouteRow[]).entries()) {
    const handle = normalizeHandle(raw.handle);
    if (!handle || seen.has(handle) || !raw.owner_id) continue;
    const check = await client.schema("home").rpc("fn_cookshare_effective_public", {
      p_object_type: raw.object_type,
      p_object_id: raw.object_id,
      p_actor_id: null,
    });
    if (check.error || check.data !== true) continue;
    seen.add(handle);
    rows.push({
      object_type: "handle",
      object_id: raw.owner_id,
      owner_id: raw.owner_id,
      handle,
      slug: handle,
      title: `@${handle}`,
      title_en: `@${handle}`,
      description: null,
      description_en: null,
      image_url: null,
      is_free: false,
      time_minutes: null,
      nutrition: null,
      rank: 40000 + index,
      component: null,
      slot_profile: null,
      ingredients: [],
    });
  }
  return rows;
}

type RouteRow = {
  object_type: string;
  object_id: string;
  owner_id?: string | null;
  handle?: string | null;
  slug: string;
  route_kind?: string | null;
  is_current?: boolean | null;
};

async function resolveRow(
  row: GalleryRpcRow,
  state: GalleryState,
): Promise<GalleryCard | null> {
  if (row.object_type === "handle") {
    const handle = normalizeHandle(row.handle);
    if (!handle) return null;
    return {
      objectType: "handle" as const,
      objectId: row.object_id,
      title: row.title ?? `@${handle}`,
      description: null,
      imageUrl: null,
      href: buildHandlePath(state.locale, handle),
      isFree: false,
      timeMinutes: null,
      nutrition: null,
    } satisfies GalleryCard;
  }
  const objectType = row.object_type as CookShareObjectType;
  if (!row.slug || (objectType !== "recipe" && objectType !== "ingredient" && objectType !== "category" && !normalizeHandle(row.handle))) return null;
  const handle = normalizeHandle(row.handle);
  const title = state.locale === "en"
    ? row.title_en ?? row.title ?? row.slug
    : row.title ?? row.title_en ?? row.slug;
  const href = buildCookSharePath({ locale: state.locale, objectType, handle, slug: row.slug });
  const nutrition = row.nutrition
    ? Object.fromEntries(Object.entries(row.nutrition).map(([key, value]) => [key, numberValue(value)]))
    : null;
  return {
    objectType,
    objectId: row.object_id,
    title,
    description: state.locale === "en"
      ? row.description_en ?? row.description ?? null
      : row.description ?? row.description_en ?? null,
    imageUrl: mediaUrl(row.image_url),
    href,
    isFree: Boolean(row.is_free),
    timeMinutes: numberValue(row.time_minutes),
    nutrition,
  } satisfies GalleryCard;
}

function emptyPage(state: GalleryState, facetOptions: GalleryFacetOptions, ownerId: string | null = null): GalleryPage {
  return {
    items: [],
    nextCursor: null,
    state,
    hasMore: false,
    facetOptions,
    ownerId,
  };
}

export async function getGalleryPage(state: GalleryState, limit = PAGE_SIZE): Promise<GalleryPage> {
  const boundedLimit = Math.min(Math.max(limit, 1), PAGE_SIZE);
  const request = await getRequestUser();
  const internal = (() => {
    try { return createSupabaseInternalClient(); } catch { return null; }
  })();
  const normalizedState = { ...state, facets: state.facets ?? emptyGalleryFacets() };
  const facetOptions = await getFacetOptions(normalizedState.locale, internal);
  const type = normalizedState.type;
  const handle = normalizedState.scope === "handle" ? normalizeHandle(normalizedState.handle) : null;
  const rpcArgs = {
    p_locale: normalizedState.locale,
    p_type: type,
    p_query: normalizedState.q || null,
    p_handle: handle,
    p_categories: normalizedState.facets.categories,
    p_meals: normalizedState.facets.meals,
    p_components: normalizedState.facets.components,
    p_ingredients: normalizedState.facets.ingredients,
    p_excluded_ingredients: normalizedState.facets.excludedIngredients,
    p_min_time: normalizedState.facets.minTime,
    p_max_time: normalizedState.facets.maxTime,
    p_access: normalizedState.facets.access,
    p_limit: RPC_LIMIT,
  };
  const result = await request.client.schema("home").rpc("rpc_cookshare_gallery_candidates", rpcArgs);
  if (result.error || !Array.isArray(result.data)) return emptyPage(normalizedState, facetOptions);
  let rows = result.data as GalleryRpcRow[];
  if (normalizedState.scope === "handle" && !handle) return emptyPage(normalizedState, facetOptions);
  if (normalizedState.scope === "global" && normalizedState.type === "all" && !normalizedState.q) {
    rows = rows.filter((row) => row.object_type === "recipe");
  }
  rows = [...rows, ...(await getSearchHandleRows(normalizedState, request.client, internal))].sort(compareRows);
  const cursor = decodeCursor(normalizedState.cursor);
  if (cursor) rows = rows.filter((row) => compareCursor(row, cursor) > 0);
  const selected = rows.slice(0, boundedLimit);
  const cards = (await Promise.all(selected.map((row) => resolveRow(row, normalizedState))))
    .filter((card): card is GalleryCard => Boolean(card));
  const lastRow = selected.at(-1);
  const nextCursor = rows.length > boundedLimit && lastRow ? encodeCursor(lastRow) : null;
  const ownerId = handle
    ? rows.find((row) => row.owner_id)?.owner_id ?? null
    : null;
  return {
    items: cards,
    nextCursor,
    state: normalizedState,
    hasMore: Boolean(nextCursor),
    facetOptions,
    ownerId,
  };
}

export function getGalleryFingerprint(state: GalleryState) {
  return galleryQueryFingerprint(state);
}

export { hasActiveGalleryFacets };
