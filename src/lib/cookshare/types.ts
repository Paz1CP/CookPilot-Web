import type { AppLocale } from "@/shared/config/routes";

export type CookShareObjectType =
  | "recipe"
  | "menu"
  | "day"
  | "week"
  | "list"
  | "ingredient"
  | "category";

/** Public Gallery object modes. */
export type GallerySearchType = "all" | "recipes" | "menus" | "days" | "weeks" | "ingredients";

export type GalleryMealMoment =
  | "breakfast"
  | "morning_snack"
  | "lunch"
  | "afternoon_snack"
  | "dinner"
  | "late_night";

export type GalleryComponentType =
  | "main_dish"
  | "appetizer"
  | "side_dish"
  | "salad"
  | "beverage"
  | "sauce"
  | "dessert"
  | "dressing";

/** Exact public intent transport for home.rpc_cookshare_gallery_candidates. */
export interface GalleryFilters {
  categories: string[];
  meal_moments: GalleryMealMoment[];
  component_types: GalleryComponentType[];
  ingredients_include: string[];
  ingredients_exclude: string[];
  cultural_profiles: string[];
  badges: string[];
  excluded_meal_moments: GalleryMealMoment[];
  excluded_component_types: GalleryComponentType[];
  menu_function_roles: string[];
  service_modes: string[];
  cultural_intents: string[];
  taste_profiles: string[];
  component_profiles: string[];
  texture_profiles: string[];
  ingredient_categories: string[];
  matrix_families: string[];
  ingredient_states: string[];
  processing_types: string[];
  time_min_minutes: number | null;
  time_max_minutes: number | null;
  kcal_min: number | null;
  kcal_max: number | null;
  protein_min: number | null;
  protein_max: number | null;
  carbs_min: number | null;
  carbs_max: number | null;
  fat_min: number | null;
  fat_max: number | null;
  fiber_min: number | null;
  fiber_max: number | null;
  nutritional_score_min: number | null;
  nutritional_score_max: number | null;
  servings_min: number | null;
  servings_max: number | null;
  ingredient_kcal_min: number | null;
  ingredient_kcal_max: number | null;
  ingredient_protein_min: number | null;
  ingredient_protein_max: number | null;
  ingredient_carbs_min: number | null;
  ingredient_carbs_max: number | null;
  ingredient_fat_min: number | null;
  ingredient_fat_max: number | null;
  ingredient_fiber_min: number | null;
  ingredient_fiber_max: number | null;
}

export interface GalleryFacetOption {
  value: string;
  label: string;
  parentValue?: string | null;
}

export interface GalleryFacetOptions {
  categories: GalleryFacetOption[];
  mealMoments: GalleryFacetOption[];
  componentTypes: GalleryFacetOption[];
  timeMinutes: number[];
  ingredients: GalleryFacetOption[];
  ingredientCategories: GalleryFacetOption[];
  matrixFamilies: GalleryFacetOption[];
  ingredientStates: GalleryFacetOption[];
  processingTypes: GalleryFacetOption[];
  culturalProfiles: GalleryFacetOption[];
  menuFunctionRoles: GalleryFacetOption[];
  serviceModes: GalleryFacetOption[];
  tasteProfiles: GalleryFacetOption[];
  textures: GalleryFacetOption[];
  badges: GalleryFacetOption[];
}

export interface GalleryQueryState {
  locale: AppLocale;
  q: string;
  type: GallerySearchType;
  handle: string | null;
  cursor: string | null;
  filters: GalleryFilters;
}

export interface CookShareIdentity {
  object_type: CookShareObjectType;
  handle: string | null;
  slug: string;
  canonical_path: string;
  is_alias: boolean;
  lifecycle: string;
}

export interface RecipeIngredient {
  ingredient_name?: string | null;
  quantity?: number | null;
  unit?: string | null;
  display_quantity?: string | null;
  display_unit?: string | null;
  is_optional?: boolean;
}

export type NutritionValues = Record<string, number | null>;

export interface IngredientNutritionProjection {
  base: NutritionValues | null;
  macro_breakdown: NutritionValues | null;
  micronutrients: NutritionValues | null;
}

export interface RecipeStep {
  step_number?: number;
  instruction?: string | null;
}

export interface RecipeProjection {
  object_type: "recipe";
  title: string;
  description?: string | null;
  cover_photo_url?: string | null;
  time?: Record<string, number | null> | null;
  servings?: number | null;
  nutrition?: NutritionValues | null;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  [key: string]: unknown;
}

export interface CookShareResolvedObject {
  object_type: CookShareObjectType;
  title?: string | null;
  description?: string | null;
  name?: string | null;
  name_en?: string | null;
  cover_photo_url?: string | null;
  image_url?: string | null;
  nutrition?: NutritionValues | IngredientNutritionProjection | null;
  identity: CookShareIdentity;
  [key: string]: unknown;
}

export interface GalleryCard {
  objectType: CookShareObjectType;
  objectId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  href: string;
  timeMinutes: number | null;
  nutrition: {
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    fiberG: number | null;
    nutritionalScore: number | null;
    badges: string[];
  } | null;
  component: string | null;
  matchType: string | null;
  relevanceScore: number | null;
}

export interface GalleryPage {
  items: GalleryCard[];
  /** Null means the deployed RPC did not return its optional total_count field. */
  totalCount: number | null;
  nextCursor: string | null;
  state: GalleryQueryState;
  hasMore: boolean;
  facetOptions: GalleryFacetOptions;
}
