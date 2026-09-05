import type { AppLocale } from "@/shared/config/routes";

export type CookShareObjectType =
  | "recipe"
  | "menu"
  | "day"
  | "week"
  | "list"
  | "ingredient"
  | "category";

export type GalleryType =
  | "all"
  | "recipes"
  | "menus"
  | "days"
  | "weeks"
  | "ingredients";

export type EntitlementTier = "anonymous" | "free" | "pro" | string;

export interface CookShareIdentity {
  object_type: CookShareObjectType;
  object_id: string;
  owner_id: string | null;
  handle: string | null;
  slug: string;
  canonical_path: string;
  is_alias: boolean;
  lifecycle: string;
}

export interface CookShareEntitlement {
  tier: EntitlementTier;
  is_owner: boolean;
}

export interface RecipeIngredient {
  rci_id?: string;
  ingredient_name?: string | null;
  quantity?: number | null;
  unit?: string | null;
  display_quantity?: string | null;
  display_unit?: string | null;
  is_optional?: boolean;
}

export interface RecipeStep {
  step_number?: number;
  instruction?: string | null;
}

export interface RecipeProjection {
  object_type: "recipe";
  object_id: string;
  title: string;
  description?: string | null;
  cover_photo_url?: string | null;
  time?: Record<string, number | null> | null;
  servings?: number | null;
  nutrition?: Record<string, number | null> | null;
  is_free_recipe?: boolean;
  is_preview?: boolean;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  [key: string]: unknown;
}

export interface CookShareResolvedObject {
  object_type: CookShareObjectType;
  object_id: string;
  title?: string | null;
  description?: string | null;
  name?: string | null;
  name_en?: string | null;
  cover_photo_url?: string | null;
  image_url?: string | null;
  identity: CookShareIdentity;
  entitlement: CookShareEntitlement;
  [key: string]: unknown;
}

export interface GalleryState {
  locale: AppLocale;
  q: string;
  type: GalleryType;
  cursor: string | null;
}

export interface GalleryCard {
  objectType: "recipe";
  objectId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  href: string;
  isFree: boolean;
  timeMinutes: number | null;
  nutrition: Record<string, number | null> | null;
}

export interface GalleryPage {
  items: GalleryCard[];
  nextCursor: string | null;
  state: GalleryState;
}

export interface HandleGalleryCard {
  objectType: CookShareObjectType;
  objectId: string;
  title: string;
  href: string;
  imageUrl: string | null;
  isPrivate: boolean;
}
