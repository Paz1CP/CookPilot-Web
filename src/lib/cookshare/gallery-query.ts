import type { AppLocale } from "@/shared/config/routes";
import type {
  GalleryFacetState,
  GalleryState,
  GalleryType,
} from "./types";

const galleryTypes = new Set<GalleryType>([
  "all",
  "recipes",
  "menus",
  "days",
  "weeks",
  "lists",
  "ingredients",
  "categories",
]);
const mealValues = new Set([
  "breakfast",
  "morning_snack",
  "lunch",
  "afternoon_snack",
  "dinner",
  "late_night",
]);
const componentValues = new Set([
  "main_dish",
  "appetizer",
  "side_dish",
  "salad",
  "beverage",
  "sauce",
  "dessert",
  "dressing",
]);
const timeValues = new Set([15, 30, 45, 60]);

export const emptyGalleryFacets = (): GalleryFacetState => ({
  categories: [],
  meals: [],
  components: [],
  ingredients: [],
  excludedIngredients: [],
  minTime: null,
  maxTime: null,
});

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined, max = 8) {
  const values = Array.isArray(value) ? value : value?.split(",") ?? [];
  return [...new Set(values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean))].slice(0, max);
}

function validList(
  value: string | string[] | undefined,
  allowed: Set<string>,
  max = 8,
) {
  return list(value, max).filter((item) => allowed.has(item));
}

function validTime(value: string | string[] | undefined) {
  const parsed = Number.parseInt(first(value) ?? "", 10);
  return timeValues.has(parsed) ? parsed : null;
}

function normalizeQuery(value: string | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function parseGalleryState(
  locale: AppLocale,
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): GalleryState {
  const get = (key: string) => searchParams instanceof URLSearchParams
    ? searchParams.getAll(key)
    : searchParams[key];
  const rawType = first(get("type"));
  const type = galleryTypes.has(rawType as GalleryType) ? rawType as GalleryType : "all";
  const rawCursor = first(get("cursor"));
  return {
    locale,
    q: normalizeQuery(first(get("q"))),
    type,
    cursor: rawCursor?.trim() || null,
    facets: {
      categories: list(get("category")),
      meals: validList(get("meal"), mealValues),
      components: validList(get("component"), componentValues),
      ingredients: list(get("ingredient"), 6),
      excludedIngredients: list(get("exclude_ingredient"), 6),
      minTime: validTime(get("min_time")),
      maxTime: validTime(get("max_time")),
    },
  };
}

function appendMany(params: URLSearchParams, key: string, values: string[]) {
  [...values].sort().forEach((value) => params.append(key, value));
}

export function toGallerySearchParams(
  state: GalleryState,
  options: { includeCursor?: boolean; includeLocale?: boolean } = {},
) {
  const params = new URLSearchParams();
  if (options.includeLocale) params.set("locale", state.locale);
  if (state.q) params.set("q", state.q);
  if (state.type !== "all") params.set("type", state.type);
  appendMany(params, "category", state.facets.categories);
  appendMany(params, "meal", state.facets.meals);
  appendMany(params, "component", state.facets.components);
  appendMany(params, "ingredient", state.facets.ingredients);
  appendMany(params, "exclude_ingredient", state.facets.excludedIngredients);
  if (state.facets.minTime !== null) params.set("min_time", String(state.facets.minTime));
  if (state.facets.maxTime !== null) params.set("max_time", String(state.facets.maxTime));
  if (options.includeCursor && state.cursor) params.set("cursor", state.cursor);
  return params;
}

export function galleryUrl(path: string, state: GalleryState) {
  const params = toGallerySearchParams(state);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function hasActiveGalleryFacets(state: GalleryState) {
  const { facets } = state;
  return Boolean(
    facets.categories.length ||
    facets.meals.length ||
    facets.components.length ||
    facets.ingredients.length ||
    facets.excludedIngredients.length ||
    facets.minTime !== null ||
    facets.maxTime !== null,
  );
}

export function galleryQueryFingerprint(state: GalleryState) {
  return toGallerySearchParams(state).toString();
}
