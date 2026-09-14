import { supabaseConfig } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { buildCookSharePath, type AppLocale } from "@/shared/config/routes";
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

type GalleryRpcRow = {
  object_type: string;
  object_id: string;
  handle?: string | null;
  slug: string;
  title?: string | null;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  image_url?: string | null;
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

function emptyFacetOptions(locale: AppLocale): GalleryFacetOptions {
  const labels = locale === "es"
    ? {
      meals: ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena", "Madrugada"],
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
    times: [0, 5, 15, 30, 45, 60],
  };
}

async function getFacetOptions(locale: AppLocale) {
  const options = emptyFacetOptions(locale);
  const result = await createSupabasePublicClient().schema("menu").from("recipe_categories")
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

async function resolveRow(
  row: GalleryRpcRow,
  state: GalleryState,
): Promise<GalleryCard | null> {
  const objectType = row.object_type as CookShareObjectType;
  if (!row.slug) return null;
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
    title,
    description: state.locale === "en"
      ? row.description_en ?? row.description ?? null
      : row.description ?? row.description_en ?? null,
    imageUrl: mediaUrl(row.image_url),
    href,
    timeMinutes: numberValue(row.time_minutes),
    nutrition,
  } satisfies GalleryCard;
}

function emptyPage(state: GalleryState, facetOptions: GalleryFacetOptions): GalleryPage {
  return {
    items: [],
    nextCursor: null,
    state,
    hasMore: false,
    facetOptions,
  };
}

export function getEmptyGalleryPage(state: GalleryState): GalleryPage {
  const normalizedState = { ...state, facets: state.facets ?? emptyGalleryFacets() };
  return emptyPage(normalizedState, emptyFacetOptions(normalizedState.locale));
}

export async function getGalleryPage(state: GalleryState, limit = PAGE_SIZE): Promise<GalleryPage> {
  const boundedLimit = Math.min(Math.max(limit, 1), PAGE_SIZE);
  const normalizedState = { ...state, facets: state.facets ?? emptyGalleryFacets() };
  const type = normalizedState.type;
  const cursor = decodeCursor(normalizedState.cursor);
  const rpcArgs: Record<string, unknown> = {
    p_locale: normalizedState.locale,
    p_type: type,
    p_handle: "",
    p_categories: normalizedState.facets.categories,
    p_meals: normalizedState.facets.meals,
    p_components: normalizedState.facets.components,
    p_ingredients: normalizedState.facets.ingredients,
    p_excluded_ingredients: normalizedState.facets.excludedIngredients,
    p_access: "all",
    p_limit: boundedLimit + 1,
  };
  if (normalizedState.q) rpcArgs.p_query = normalizedState.q;
  if (normalizedState.facets.minTime !== null) rpcArgs.p_min_time = normalizedState.facets.minTime;
  if (normalizedState.facets.maxTime !== null) rpcArgs.p_max_time = normalizedState.facets.maxTime;
  if (cursor) {
    rpcArgs.p_after_rank = cursor.rank;
    rpcArgs.p_after_title = cursor.title;
    rpcArgs.p_after_id = cursor.id;
    rpcArgs.p_after_object_type = cursor.objectType;
  }
  const client = createSupabasePublicClient();
  const [facetOptions, result] = await Promise.all([
    getFacetOptions(normalizedState.locale),
    client.schema("home").rpc("rpc_cookshare_gallery_candidates", rpcArgs, { get: true }),
  ]);
  if (result.error || !Array.isArray(result.data)) return emptyPage(normalizedState, facetOptions);
  const rows = result.data as GalleryRpcRow[];
  const selected = rows.slice(0, boundedLimit);
  const cards = (await Promise.all(selected.map((row) => resolveRow(row, normalizedState))))
    .filter((card): card is GalleryCard => Boolean(card));
  const lastRow = selected.at(-1);
  const nextCursor = rows.length > boundedLimit && lastRow ? encodeCursor(lastRow) : null;
  return {
    items: cards,
    nextCursor,
    state: normalizedState,
    hasMore: Boolean(nextCursor),
    facetOptions,
  };
}

export function getGalleryFingerprint(state: GalleryState) {
  return galleryQueryFingerprint(state);
}

export { hasActiveGalleryFacets };
