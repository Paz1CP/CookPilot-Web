import type { AppLocale } from "@/shared/config/routes";
import type {
  GalleryAccess,
  GalleryFacetState,
  GalleryScope,
  GalleryState,
  GalleryType,
} from "./types";

const galleryTypes = new Set<GalleryType>([
  "all",
  "recipes",
  "menus",
  "days",
  "weeks",
  "ingredients",
]);
const accesses = new Set<GalleryAccess>(["all", "free", "pro"]);
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
  access: "all",
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

function normalizeHandle(value: string | undefined) {
  const handle = value?.trim().replace(/^@/, "").toLowerCase() ?? "";
  return /^[a-z0-9][a-z0-9._-]{2,29}$/.test(handle) ? handle : null;
}

export function parseGalleryState(
  locale: AppLocale,
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): GalleryState {
  const get = (key: string) => searchParams instanceof URLSearchParams
    ? searchParams.getAll(key)
    : searchParams[key];
  const rawType = first(get("type"));
  const rawScope = first(get("scope"));
  const scope: GalleryScope = rawScope === "handle" ? "handle" : "global";
  const rawAccess = first(get("access"));
  const type = galleryTypes.has(rawType as GalleryType) ? rawType as GalleryType : "all";
  const rawCursor = first(get("cursor"));
  return {
    locale,
    q: normalizeQuery(first(get("q"))),
    type,
    cursor: rawCursor?.trim() || null,
    scope,
    handle: normalizeHandle(first(get("handle"))),
    facets: {
      categories: list(get("category")),
      meals: validList(get("meal"), mealValues),
      components: validList(get("component"), componentValues),
      ingredients: list(get("ingredient"), 6),
      excludedIngredients: list(get("exclude_ingredient"), 6),
      minTime: validTime(get("min_time")),
      maxTime: validTime(get("max_time")),
      access: accesses.has(rawAccess as GalleryAccess) ? rawAccess as GalleryAccess : "all",
    },
  };
}

function appendMany(params: URLSearchParams, key: string, values: string[]) {
  [...values].sort().forEach((value) => params.append(key, value));
}

export function toGallerySearchParams(
  state: GalleryState,
  options: { includeScope?: boolean; includeCursor?: boolean; includeLocale?: boolean } = {},
) {
  const params = new URLSearchParams();
  if (options.includeLocale) params.set("locale", state.locale);
  if (state.q) params.set("q", state.q);
  if (state.type !== "all") params.set("type", state.type);
  if (state.facets.access !== "all") params.set("access", state.facets.access);
  appendMany(params, "category", state.facets.categories);
  appendMany(params, "meal", state.facets.meals);
  appendMany(params, "component", state.facets.components);
  appendMany(params, "ingredient", state.facets.ingredients);
  appendMany(params, "exclude_ingredient", state.facets.excludedIngredients);
  if (state.facets.minTime !== null) params.set("min_time", String(state.facets.minTime));
  if (state.facets.maxTime !== null) params.set("max_time", String(state.facets.maxTime));
  if (options.includeScope && state.scope === "handle" && state.handle) {
    params.set("scope", "handle");
    params.set("handle", state.handle);
  }
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
    facets.maxTime !== null ||
    facets.access !== "all",
  );
}

export function galleryQueryFingerprint(state: GalleryState) {
  return toGallerySearchParams(state, { includeScope: true }).toString();
}
