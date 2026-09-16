import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CookShareObjectType,
  CookShareResolvedObject,
} from "./types";
import type { AppLocale } from "@/shared/config/routes";

const objectTypes = new Set<CookShareObjectType>([
  "recipe",
  "menu",
  "day",
  "week",
  "list",
  "ingredient",
  "category",
]);

function decodeRouteParam(value: string | undefined) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function normalizeSlug(value: string | undefined) {
  const decoded = decodeRouteParam(value);
  const slug = decoded?.trim().toLowerCase() ?? "";
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(slug) ? slug : null;
}

function normalizeHandle(value: string | undefined) {
  const decoded = decodeRouteParam(value);
  const handle = decoded?.trim().replace(/^@/, "").toLowerCase() ?? "";
  return /^[a-z0-9][a-z0-9._-]{2,29}$/.test(handle) ? handle : null;
}

function contextualParentPath(
  locale: AppLocale,
  parentType: ContextualRecipeRouteInput["parentType"],
  handle: string,
  slug: string,
) {
  const segment = parentType === "menu"
    ? "menus"
    : parentType === "day"
      ? locale === "es" ? "dias" : "days"
      : parentType === "week"
        ? locale === "es" ? "semanas" : "weeks"
        : locale === "es" ? "listas" : "lists";
  return `/${locale}/@${handle}/${segment}/${slug}`;
}

export interface PublicObjectRouteInput {
  locale: AppLocale;
  objectType: CookShareObjectType;
  handle?: string | null;
  slug: string;
}

export interface ContextualRecipeRouteInput {
  locale: AppLocale;
  parentType: Extract<CookShareObjectType, "menu" | "day" | "week" | "list">;
  parentHandle: string;
  parentSlug: string;
  recipeSlug: string;
}

type ContextualRecipePayload = CookShareResolvedObject & {
  context?: {
    parent_type?: string;
    parent_canonical_path?: string;
    requested_recipe_slug?: string;
    recipe_slug?: string;
    is_recipe_alias?: boolean;
  };
};

function stripInternalIdentifiers(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripInternalIdentifiers);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "owner_id" && key !== "object_id" && key !== "id" && !key.endsWith("_id") && !key.endsWith("_ids"))
      .map(([key, item]) => [key, stripInternalIdentifiers(item)]),
  );
}

export async function resolvePublicObject(
  input: PublicObjectRouteInput,
  client?: SupabaseClient,
): Promise<CookShareResolvedObject | null> {
  if (!objectTypes.has(input.objectType)) return null;
  const slug = normalizeSlug(input.slug);
  if (!slug) return null;
  const handle = input.handle ? normalizeHandle(input.handle) : null;
  const supabase = client ?? createSupabasePublicClient();
  const { data, error } = await supabase.schema("home").rpc(
    "rpc_resolve_cookshare_public_content",
    {
      p_locale: input.locale,
      p_object_type: input.objectType,
      p_handle: handle ?? "",
      p_slug: slug,
    },
    { get: false },
  );

  if (error || !data || typeof data !== "object") return null;
  return stripInternalIdentifiers(data) as CookShareResolvedObject;
}

export async function resolveContextualRecipe(
  input: ContextualRecipeRouteInput,
  client?: SupabaseClient,
): Promise<{ object: CookShareResolvedObject; canonicalPath: string; isAlias: boolean } | null> {
  const parentHandle = normalizeHandle(input.parentHandle);
  const parentSlug = normalizeSlug(input.parentSlug);
  const recipeSlug = normalizeSlug(input.recipeSlug);
  if (!parentHandle || !parentSlug || !recipeSlug) return null;

  const supabase = client ?? createSupabasePublicClient();
  const { data, error } = await supabase.schema("home").rpc(
    "rpc_resolve_cookshare_contextual_recipe",
    {
      p_parent_type: input.parentType,
      p_parent_handle: parentHandle,
      p_parent_slug: parentSlug,
      p_recipe_slug: recipeSlug,
      p_locale: input.locale,
    },
    { get: false },
  );
  if (error || !data || typeof data !== "object") return null;

  const payload = stripInternalIdentifiers(data) as ContextualRecipePayload;
  const parentPath = payload.context?.parent_canonical_path;
  const canonicalRecipeSlug = normalizeSlug(payload.context?.recipe_slug);
  if (payload.object_type !== "recipe" || !payload.identity || !parentPath || !canonicalRecipeSlug) return null;

  const recipeSegment = input.locale === "es" ? "recetas" : "recipes";
  const canonicalPath = `${parentPath}/${recipeSegment}/${canonicalRecipeSlug}`;
  return {
    object: {
      ...payload,
      identity: {
        ...payload.identity,
        canonical_path: canonicalPath,
        is_alias: false,
      },
    },
    canonicalPath,
    isAlias: parentPath !== contextualParentPath(input.locale, input.parentType, parentHandle, parentSlug)
      || payload.context?.is_recipe_alias === true,
  };
}

export function publicTitle(object: CookShareResolvedObject, locale: AppLocale) {
  if (object.object_type === "ingredient" || object.object_type === "category") {
    return (locale === "en" ? object.name_en : object.name) ?? object.name ?? object.name_en ?? "CookPilot";
  }
  return object.title ?? "CookPilot";
}

export function publicDescription(object: CookShareResolvedObject) {
  return typeof object.description === "string" ? object.description : null;
}
