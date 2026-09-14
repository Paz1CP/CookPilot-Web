import es from "@/locales/gallery.es.json";
import en from "@/locales/gallery.en.json";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { buildCookSharePath, type AppLocale } from "@/shared/config/routes";
import {
  emptyGalleryFilters,
  galleryComponentTypes,
  galleryMealMoments,
  galleryQueryFingerprint,
  hasActiveGalleryFilters,
  normalizeGalleryQueryState,
  toGalleryRpcFilters,
} from "./gallery-query";
import type {
  CookShareObjectType,
  GalleryCard,
  GalleryFacetOption,
  GalleryFacetOptions,
  GalleryPage,
  GalleryQueryState,
} from "./types";

const PAGE_SIZE = 9;
const GALLERY_TIME_OPTIONS = [0, 5, 15, 30, 45, 60, 90, 120] as const;
const publicObjectTypes = new Set<CookShareObjectType>(["recipe", "menu", "day", "week", "list", "ingredient", "category"]);
const galleryCultureProfiles = ["sacred_loved", "iconic", "daily", "none"] as const;
const galleryMenuFunctionRoles = ["anchor", "support", "cut", "refresh", "close"] as const;
const galleryServiceModes = ["hot", "warm", "cold", "room_temp", "refreshing", "digestive"] as const;
const galleryTasteProfiles = ["sweet", "salty", "sour", "spicy", "umami", "low_bitter"] as const;
const galleryTextureProfileCandidates = ["creamy", "soft", "crispy", "crunchy", "juicy", "tender", "firm", "smooth", "liquid", "saucy", "chewy", "flaky"] as const;

type GalleryRpcRow = {
  object_type: string;
  object_id: string;
  handle?: string | null;
  slug?: string | null;
  title?: string | null;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  time_minutes?: number | null;
  nutrition?: Record<string, unknown> | null;
  rank?: number | null;
  component?: string | null;
  match_type?: string | null;
  relevance_score?: number | string | null;
  total_count?: number | string | null;
  cursor?: Record<string, unknown> | null;
};
type GalleryCursor = Record<string, unknown>;
type CategoryRow = { id?: string | null; parent_id?: string | null; slug?: string | null; name?: string | null; name_en?: string | null; sort_order?: number | null };
type IngredientRow = { name?: string | null; name_en?: string | null; search_slug?: string | null; matrix_family?: string | null; state?: string | null; nutritional_type?: string | null };
type IngredientCategoryRow = { code?: string | null; name_es?: string | null; name_en?: string | null };
type NutritionProfileRow = { recipe_nutritional_tags?: string[] | null };
type SensoryRow = { texture_primary_raw?: string | null; texture_secondary_raw?: string | null };

export class GalleryRpcError extends Error {
  constructor(message: string) { super(message); this.name = "GalleryRpcError"; }
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}
function normalizeHandle(value: string | null | undefined) { return value?.trim().replace(/^@/, "").toLowerCase() || null; }
function mediaUrl(value: string | null | undefined) { return value?.trim() || null; }
function encodeCursor(row: GalleryRpcRow) {
  if (!row.cursor || typeof row.cursor !== "object" || Array.isArray(row.cursor)) return null;
  return Buffer.from(JSON.stringify(row.cursor), "utf8").toString("base64url");
}
function decodeCursor(cursor: string | null): GalleryCursor | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as GalleryCursor : null;
  } catch { return null; }
}
function nutritionValue(value: GalleryRpcRow["nutrition"]): GalleryCard["nutrition"] {
  if (!value || Array.isArray(value)) return null;
  const badges = Array.isArray(value.badges) ? value.badges.filter((badge): badge is string => typeof badge === "string") : [];
  return {
    kcal: numberValue(value.kcal), proteinG: numberValue(value.protein_g), carbsG: numberValue(value.carbs_g), fatG: numberValue(value.fat_g),
    fiberG: numberValue(value.fiber_g), nutritionalScore: numberValue(value.nutritional_score), badges,
  };
}
function humanize(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function localizedOption(map: Record<string, string>, value: string) { return map[value] ?? humanize(value); }

function localizedFacetOptions(locale: AppLocale): GalleryFacetOptions {
  const labels = locale === "es" ? es : en;
  return {
    categories: [],
    mealMoments: galleryMealMoments.map((value) => ({ value, label: labels.mealOptions[value] })),
    componentTypes: galleryComponentTypes.map((value) => ({ value, label: labels.componentOptions[value] })),
    timeMinutes: [...GALLERY_TIME_OPTIONS],
    ingredients: [],
    ingredientCategories: [],
    matrixFamilies: [],
    ingredientStates: [],
    processingTypes: [],
    culturalProfiles: galleryCultureProfiles.map((value) => ({ value, label: labels.culturalOptions[value] })),
    menuFunctionRoles: galleryMenuFunctionRoles.map((value) => ({ value, label: labels.menuRoleOptions[value] })),
    serviceModes: galleryServiceModes.map((value) => ({ value, label: labels.serviceOptions[value] })),
    tasteProfiles: galleryTasteProfiles.map((value) => ({ value, label: labels.tasteOptions[value] })),
    textures: [],
    badges: [],
  };
}
function categoryOptions(rows: CategoryRow[], locale: AppLocale) {
  const validRows = rows.flatMap((row) => row.id && row.slug ? [{
    id: row.id, parentId: row.parent_id ?? null, value: row.slug.toLowerCase(),
    label: locale === "en" ? row.name_en || row.name || row.slug : row.name || row.name_en || row.slug,
    sortOrder: row.sort_order ?? Number.MAX_SAFE_INTEGER,
  }] : []);
  const byParent = new Map<string | null, typeof validRows>();
  for (const row of validRows) byParent.set(row.parentId, [...(byParent.get(row.parentId) ?? []), row]);
  for (const values of byParent.values()) values.sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
  const options: GalleryFacetOption[] = [];
  const visited = new Set<string>();
  const visit = (parentId: string | null, depth: number, parentValue: string | null) => {
    for (const row of byParent.get(parentId) ?? []) {
      if (visited.has(row.id)) continue;
      visited.add(row.id);
      options.push({ value: row.value, label: `${"— ".repeat(depth)}${row.label}`, parentValue });
      visit(row.id, depth + 1, row.value);
    }
  };
  visit(null, 0, null);
  for (const row of validRows) if (!visited.has(row.id)) { options.push({ value: row.value, label: row.label, parentValue: null }); visit(row.id, 1, row.value); }
  return options;
}
const facetOptionsCache = new Map<AppLocale, Promise<GalleryFacetOptions>>();

async function loadFacetOptions(locale: AppLocale) {
  const options = localizedFacetOptions(locale);
  const client = createSupabasePublicClient();
  const [categoryResult, ingredientResult, ingredientCategoryResult, profileResult, sensoryResult] = await Promise.all([
    client.schema("menu").from("recipe_categories").select("id,parent_id,slug,name,name_en,sort_order").order("sort_order", { ascending: true }).limit(500),
    client.schema("nutrition").from("ingredients").select("name,name_en,search_slug,matrix_family,state,nutritional_type").limit(5000),
    client.schema("nutrition").from("ingredient_categories").select("code,name_es,name_en").limit(200),
    client.schema("menu").from("recipe_nutritional_profiles").select("recipe_nutritional_tags").limit(5000),
    client.schema("home").from("mesa_recipe_sensory_cache").select("texture_primary_raw,texture_secondary_raw").limit(5000),
  ]);

  if (!categoryResult.error && Array.isArray(categoryResult.data)) options.categories = categoryOptions(categoryResult.data as CategoryRow[], locale);

  const labels = locale === "es" ? es : en;
  const ingredientRows = !ingredientResult.error && Array.isArray(ingredientResult.data) ? ingredientResult.data as IngredientRow[] : [];
  const ingredientOptions = new Map<string, GalleryFacetOption>();
  const matrixValues = new Set<string>();
  const stateValues = new Set<string>();
  const processingValues = new Set<string>();
  for (const row of ingredientRows) {
    const value = row.search_slug?.trim().toLowerCase();
    if (value) ingredientOptions.set(value, { value, label: locale === "en" ? row.name_en || row.name || value : row.name || row.name_en || value });
    if (row.matrix_family) matrixValues.add(row.matrix_family.toLowerCase());
    if (row.state) stateValues.add(row.state.toLowerCase());
    if (row.nutritional_type) processingValues.add(row.nutritional_type.toLowerCase());
  }
  options.ingredients = [...ingredientOptions.values()].sort((left, right) => left.label.localeCompare(right.label, locale));
  options.matrixFamilies = [...matrixValues].sort().map((value) => ({ value, label: localizedOption(labels.matrixFamilyOptions, value) }));
  options.ingredientStates = [...stateValues].sort().map((value) => ({ value, label: localizedOption(labels.ingredientStateOptions, value) }));
  options.processingTypes = [...processingValues].sort().map((value) => ({ value, label: localizedOption(labels.processingOptions, value) }));

  const categoryRows = !ingredientCategoryResult.error && Array.isArray(ingredientCategoryResult.data) ? ingredientCategoryResult.data as IngredientCategoryRow[] : [];
  options.ingredientCategories = categoryRows
    .flatMap((row) => row.code ? [{ value: row.code.toLowerCase(), label: locale === "en" ? row.name_en || row.code : row.name_es || row.name_en || row.code }] : [])
    .sort((left, right) => left.label.localeCompare(right.label, locale));

  const badgeValues = new Set<string>();
  const profileRows = !profileResult.error && Array.isArray(profileResult.data) ? profileResult.data as NutritionProfileRow[] : [];
  for (const row of profileRows) for (const badge of row.recipe_nutritional_tags ?? []) if (badge) badgeValues.add(badge.toLowerCase());
  options.badges = [...badgeValues].sort().map((value) => ({ value, label: localizedOption(labels.badgeOptions, value) }));

  const textureValues = new Set<string>();
  const sensoryRows = !sensoryResult.error && Array.isArray(sensoryResult.data) ? sensoryResult.data as SensoryRow[] : [];
  for (const row of sensoryRows) for (const value of [row.texture_primary_raw, row.texture_secondary_raw]) if (value?.trim()) textureValues.add(value.trim().toLowerCase());
  options.textures = galleryTextureProfileCandidates
    .filter((value) => textureValues.has(value))
    .map((value) => ({ value, label: localizedOption(labels.textureOptions, value) }));
  return options;
}

function getFacetOptions(locale: AppLocale) {
  const cached = facetOptionsCache.get(locale);
  if (cached) return cached;
  const pending = loadFacetOptions(locale);
  facetOptionsCache.set(locale, pending);
  return pending;
}
function isPublicObjectType(value: string): value is CookShareObjectType { return publicObjectTypes.has(value as CookShareObjectType); }
function resolveRow(row: GalleryRpcRow, state: GalleryQueryState): GalleryCard | null {
  if (!row.object_id || !row.slug || !isPublicObjectType(row.object_type)) return null;
  const title = state.locale === "en" ? row.title_en ?? row.title ?? row.slug : row.title ?? row.title_en ?? row.slug;
  return {
    objectType: row.object_type, objectId: row.object_id, title,
    description: state.locale === "en" ? row.description_en ?? row.description ?? null : row.description ?? row.description_en ?? null,
    imageUrl: mediaUrl(row.image_url),
    href: buildCookSharePath({ locale: state.locale, objectType: row.object_type, handle: normalizeHandle(row.handle), slug: row.slug }),
    timeMinutes: numberValue(row.time_minutes), nutrition: nutritionValue(row.nutrition),
    component: row.component ?? null, matchType: row.match_type ?? null, relevanceScore: numberValue(row.relevance_score),
  };
}
/** The only Gallery Web-to-RPC adapter. The RPC owns matching, filters and rank. */
export function mapGalleryStateToRpcArgs(state: GalleryQueryState, limit: number) {
  const normalizedState = normalizeGalleryQueryState(state);
  const cursor = decodeCursor(normalizedState.cursor);
  const args: Record<string, unknown> = { p_locale: normalizedState.locale, p_type: normalizedState.type, p_limit: limit, p_filters: toGalleryRpcFilters(normalizedState.filters) };
  if (normalizedState.q) args.p_query = normalizedState.q;
  if (normalizedState.handle) args.p_handle = normalizedState.handle;
  if (cursor) args.p_cursor = cursor;
  return args;
}
export async function executeGallerySearch(state: GalleryQueryState, limit = PAGE_SIZE): Promise<GalleryPage> {
  const boundedLimit = Math.min(Math.max(limit, 1), PAGE_SIZE);
  const normalizedState = normalizeGalleryQueryState({ ...state, filters: state.filters ?? emptyGalleryFilters() });
  const [facetOptions, result] = await Promise.all([
    getFacetOptions(normalizedState.locale),
    createSupabasePublicClient().schema("home").rpc("rpc_cookshare_gallery_candidates", mapGalleryStateToRpcArgs(normalizedState, boundedLimit + 1)),
  ]);
  if (result.error) throw new GalleryRpcError(result.error.message);
  if (!Array.isArray(result.data)) throw new GalleryRpcError("Gallery RPC returned an invalid response.");
  const rows = result.data as GalleryRpcRow[];
  const selected = rows.slice(0, boundedLimit);
  const cards = selected.flatMap((row) => { const card = resolveRow(row, normalizedState); return card ? [card] : []; });
  const lastRow = selected.at(-1);
  const hasMore = rows.length > boundedLimit;
  const reportedTotal = numberValue(rows[0]?.total_count);
  const totalCount = cards.length === 0
    ? 0
    : reportedTotal !== null && reportedTotal >= cards.length
      ? reportedTotal
      : hasMore
        ? null
        : cards.length;
  return { items: cards, totalCount, nextCursor: hasMore && lastRow ? encodeCursor(lastRow) : null, state: normalizedState, hasMore, facetOptions };
}
export const getGalleryPage = executeGallerySearch;
export { parseGalleryQueryState } from "./gallery-query";
export function getGalleryFingerprint(state: GalleryQueryState) { return galleryQueryFingerprint(state); }
export { hasActiveGalleryFilters };
