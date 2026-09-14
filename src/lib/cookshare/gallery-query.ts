import type { AppLocale } from "@/shared/config/routes";
import type {
  GalleryComponentType,
  GalleryFilters,
  GalleryMealMoment,
  GalleryQueryState,
  GallerySearchType,
} from "./types";

export const gallerySearchTypes = ["all", "recipes", "menus", "days", "weeks", "ingredients"] as const satisfies readonly GallerySearchType[];
export const galleryMealMoments = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner", "late_night"] as const satisfies readonly GalleryMealMoment[];
export const galleryComponentTypes = ["main_dish", "appetizer", "side_dish", "salad", "beverage", "sauce", "dessert", "dressing"] as const satisfies readonly GalleryComponentType[];

const arrayFilterKeys = [
  "categories", "meal_moments", "component_types", "ingredients_include", "ingredients_exclude", "cultural_profiles", "badges",
  "excluded_meal_moments", "excluded_component_types", "menu_function_roles", "service_modes", "cultural_intents", "taste_profiles",
  "component_profiles", "ingredient_categories", "matrix_families", "ingredient_states", "processing_types",
] as const satisfies readonly (keyof GalleryFilters)[];
const numericFilterKeys = [
  "time_min_minutes", "time_max_minutes", "kcal_min", "kcal_max", "protein_min", "protein_max", "carbs_min", "carbs_max",
  "fat_min", "fat_max", "fiber_min", "fiber_max", "nutritional_score_min", "nutritional_score_max", "servings_min", "servings_max",
  "ingredient_kcal_min", "ingredient_kcal_max", "ingredient_protein_min", "ingredient_protein_max", "ingredient_carbs_min", "ingredient_carbs_max",
  "ingredient_fat_min", "ingredient_fat_max", "ingredient_fiber_min", "ingredient_fiber_max",
] as const satisfies readonly (keyof GalleryFilters)[];

type ArrayFilterKey = (typeof arrayFilterKeys)[number];
type NumericFilterKey = (typeof numericFilterKeys)[number];

const typeValues = new Set<string>(gallerySearchTypes);
const mealValues = new Set<string>(galleryMealMoments);
const componentValues = new Set<string>(galleryComponentTypes);
const enumFilterValues: Partial<Record<ArrayFilterKey, Set<string>>> = {
  meal_moments: mealValues,
  component_types: componentValues,
  excluded_meal_moments: mealValues,
  excluded_component_types: componentValues,
};

const arrayUrlKeys: Record<ArrayFilterKey, string> = {
  categories: "category", meal_moments: "meal", component_types: "component", ingredients_include: "ingredient",
  ingredients_exclude: "exclude_ingredient", cultural_profiles: "cultural_profile", badges: "badge",
  excluded_meal_moments: "exclude_meal", excluded_component_types: "exclude_component", menu_function_roles: "menu_role",
  service_modes: "service_mode", cultural_intents: "cultural_intent", taste_profiles: "taste_profile",
  component_profiles: "component_profile", ingredient_categories: "ingredient_category", matrix_families: "matrix_family",
  ingredient_states: "ingredient_state", processing_types: "processing_type",
};
const numericUrlKeys: Record<NumericFilterKey, string> = {
  time_min_minutes: "time_min", time_max_minutes: "time_max", kcal_min: "kcal_min", kcal_max: "kcal_max",
  protein_min: "protein_min", protein_max: "protein_max", carbs_min: "carbs_min", carbs_max: "carbs_max",
  fat_min: "fat_min", fat_max: "fat_max", fiber_min: "fiber_min", fiber_max: "fiber_max",
  nutritional_score_min: "nutritional_score_min", nutritional_score_max: "nutritional_score_max",
  servings_min: "servings_min", servings_max: "servings_max", ingredient_kcal_min: "ingredient_kcal_min", ingredient_kcal_max: "ingredient_kcal_max",
  ingredient_protein_min: "ingredient_protein_min", ingredient_protein_max: "ingredient_protein_max",
  ingredient_carbs_min: "ingredient_carbs_min", ingredient_carbs_max: "ingredient_carbs_max",
  ingredient_fat_min: "ingredient_fat_min", ingredient_fat_max: "ingredient_fat_max",
  ingredient_fiber_min: "ingredient_fiber_min", ingredient_fiber_max: "ingredient_fiber_max",
};

export function emptyGalleryFilters(): GalleryFilters {
  return {
    categories: [], meal_moments: [], component_types: [], ingredients_include: [], ingredients_exclude: [], cultural_profiles: [], badges: [],
    excluded_meal_moments: [], excluded_component_types: [], menu_function_roles: [], service_modes: [], cultural_intents: [], taste_profiles: [],
    component_profiles: [], ingredient_categories: [], matrix_families: [], ingredient_states: [], processing_types: [],
    time_min_minutes: null, time_max_minutes: null, kcal_min: null, kcal_max: null, protein_min: null, protein_max: null,
    carbs_min: null, carbs_max: null, fat_min: null, fat_max: null, fiber_min: null, fiber_max: null,
    nutritional_score_min: null, nutritional_score_max: null, servings_min: null, servings_max: null,
    ingredient_kcal_min: null, ingredient_kcal_max: null, ingredient_protein_min: null, ingredient_protein_max: null,
    ingredient_carbs_min: null, ingredient_carbs_max: null, ingredient_fat_min: null, ingredient_fat_max: null,
    ingredient_fiber_min: null, ingredient_fiber_max: null,
  };
}

function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function getAll(source: URLSearchParams | Record<string, string | string[] | undefined>, key: string) {
  return source instanceof URLSearchParams ? source.getAll(key) : source[key];
}
function canonicalValues(value: string | string[] | undefined, allowed?: Set<string>, max = 20) {
  const values = (Array.isArray(value) ? value : value?.split(",") ?? [])
    .flatMap((item) => item.split(","))
    .map((item) => item.trim().toLowerCase())
    .filter((item) => Boolean(item) && (!allowed || allowed.has(item)));
  return [...new Set(values)].sort().slice(0, max);
}
function safeNumber(value: string | string[] | undefined) {
  const raw = first(value)?.trim();
  if (!raw || !/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= 1_000_000 ? parsed : null;
}
function setNumeric(filters: GalleryFilters, key: NumericFilterKey, value: number | null) {
  (filters as unknown as Record<NumericFilterKey, number | null>)[key] = value;
}
function getNumeric(filters: GalleryFilters, key: NumericFilterKey) {
  return (filters as unknown as Record<NumericFilterKey, number | null>)[key];
}
function getArray(filters: GalleryFilters, key: ArrayFilterKey) {
  return (filters as unknown as Record<ArrayFilterKey, string[]>)[key];
}
function normalizeRanges(filters: GalleryFilters) {
  const pairs: Array<[NumericFilterKey, NumericFilterKey]> = [
    ["time_min_minutes", "time_max_minutes"], ["kcal_min", "kcal_max"], ["protein_min", "protein_max"], ["carbs_min", "carbs_max"],
    ["fat_min", "fat_max"], ["fiber_min", "fiber_max"], ["nutritional_score_min", "nutritional_score_max"], ["servings_min", "servings_max"],
    ["ingredient_kcal_min", "ingredient_kcal_max"], ["ingredient_protein_min", "ingredient_protein_max"], ["ingredient_carbs_min", "ingredient_carbs_max"],
    ["ingredient_fat_min", "ingredient_fat_max"], ["ingredient_fiber_min", "ingredient_fiber_max"],
  ];
  for (const [minKey, maxKey] of pairs) {
    const min = getNumeric(filters, minKey);
    const max = getNumeric(filters, maxKey);
    if (min !== null && max !== null && min > max) { setNumeric(filters, minKey, null); setNumeric(filters, maxKey, null); }
  }
}

export function parseGalleryQueryState(locale: AppLocale, searchParams: URLSearchParams | Record<string, string | string[] | undefined>): GalleryQueryState {
  const rawType = first(getAll(searchParams, "type"))?.trim().toLowerCase();
  const filters = emptyGalleryFilters();
  for (const key of arrayFilterKeys) {
    (filters as unknown as Record<ArrayFilterKey, string[]>)[key] = canonicalValues(getAll(searchParams, arrayUrlKeys[key]), enumFilterValues[key]);
  }
  for (const key of numericFilterKeys) setNumeric(filters, key, safeNumber(getAll(searchParams, numericUrlKeys[key])));
  normalizeRanges(filters);
  const handle = first(getAll(searchParams, "handle"))?.trim().replace(/^@/, "").toLowerCase() || null;
  const cursor = first(getAll(searchParams, "cursor"))?.trim() || null;
  return {
    locale,
    q: (first(getAll(searchParams, "q")) ?? "").trim().slice(0, 160),
    type: typeValues.has(rawType ?? "") ? rawType as GallerySearchType : "all",
    handle: /^[a-z0-9][a-z0-9_-]{0,63}$/.test(handle ?? "") ? handle : null,
    cursor,
    filters,
  };
}

function appendMany(params: URLSearchParams, key: string, values: string[]) { values.forEach((value) => params.append(key, value)); }
export function toGallerySearchParams(state: GalleryQueryState, options: { includeCursor?: boolean; includeLocale?: boolean } = {}) {
  const params = new URLSearchParams();
  if (options.includeLocale) params.set("locale", state.locale);
  if (state.q) params.set("q", state.q);
  if (state.type !== "all") params.set("type", state.type);
  if (state.handle) params.set("handle", state.handle);
  for (const key of arrayFilterKeys) appendMany(params, arrayUrlKeys[key], getArray(state.filters, key));
  for (const key of numericFilterKeys) { const value = getNumeric(state.filters, key); if (value !== null) params.set(numericUrlKeys[key], String(value)); }
  if (options.includeCursor && state.cursor) params.set("cursor", state.cursor);
  return params;
}

export function toGalleryRpcFilters(filters: GalleryFilters) {
  const result: Record<string, string[] | number> = {};
  for (const key of arrayFilterKeys) { const values = getArray(filters, key); if (values.length) result[key] = values; }
  for (const key of numericFilterKeys) { const value = getNumeric(filters, key); if (value !== null) result[key] = value; }
  return result;
}
export function galleryUrl(path: string, state: GalleryQueryState) { const query = toGallerySearchParams(state).toString(); return query ? `${path}?${query}` : path; }
export function hasActiveGalleryFilters(state: GalleryQueryState) { return arrayFilterKeys.some((key) => getArray(state.filters, key).length > 0) || numericFilterKeys.some((key) => getNumeric(state.filters, key) !== null); }
export function galleryQueryFingerprint(state: GalleryQueryState) { return toGallerySearchParams({ ...state, cursor: null }).toString(); }
