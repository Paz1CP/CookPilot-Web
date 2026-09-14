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
};
type GalleryCursor = { rank: number };
type CategoryRow = { id?: string | null; parent_id?: string | null; slug?: string | null; name?: string | null; name_en?: string | null; sort_order?: number | null };

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
  const rank = numberValue(row.rank);
  return rank === null ? null : Buffer.from(JSON.stringify({ rank }), "utf8").toString("base64url");
}
function decodeCursor(cursor: string | null): GalleryCursor | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as Partial<GalleryCursor>;
    return typeof parsed.rank === "number" && Number.isSafeInteger(parsed.rank) && parsed.rank >= 0 ? { rank: parsed.rank } : null;
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
function localizedFacetOptions(locale: AppLocale): GalleryFacetOptions {
  const labels = locale === "es" ? es : en;
  return {
    categories: [],
    mealMoments: galleryMealMoments.map((value) => ({ value, label: labels.mealOptions[value] })),
    componentTypes: galleryComponentTypes.map((value) => ({ value, label: labels.componentOptions[value] })),
    timeMinutes: [...GALLERY_TIME_OPTIONS],
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
async function getFacetOptions(locale: AppLocale) {
  const options = localizedFacetOptions(locale);
  const result = await createSupabasePublicClient().schema("menu").from("recipe_categories")
    .select("id,parent_id,slug,name,name_en,sort_order").order("sort_order", { ascending: true }).limit(500);
  if (!result.error && Array.isArray(result.data)) options.categories = categoryOptions(result.data as CategoryRow[], locale);
  return options;
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
  const cursor = decodeCursor(state.cursor);
  const args: Record<string, unknown> = { p_locale: state.locale, p_type: state.type, p_limit: limit, p_filters: toGalleryRpcFilters(state.filters) };
  if (state.q) args.p_query = state.q;
  if (state.handle) args.p_handle = state.handle;
  if (cursor) args.p_after_rank = cursor.rank;
  return args;
}
export async function executeGallerySearch(state: GalleryQueryState, limit = PAGE_SIZE): Promise<GalleryPage> {
  const boundedLimit = Math.min(Math.max(limit, 1), PAGE_SIZE);
  const normalizedState = { ...state, filters: state.filters ?? emptyGalleryFilters() };
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
  return { items: cards, nextCursor: rows.length > boundedLimit && lastRow ? encodeCursor(lastRow) : null, state: normalizedState, hasMore: rows.length > boundedLimit, facetOptions };
}
export const getGalleryPage = executeGallerySearch;
export { parseGalleryQueryState } from "./gallery-query";
export function getGalleryFingerprint(state: GalleryQueryState) { return galleryQueryFingerprint(state); }
export { hasActiveGalleryFilters };
