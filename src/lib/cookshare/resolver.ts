import { createSupabaseServerClient } from "@/lib/supabase/server";
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

function normalizeSlug(value: string | undefined) {
  const slug = value?.trim().toLowerCase() ?? "";
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(slug) ? slug : null;
}

function normalizeHandle(value: string | undefined) {
  const handle = value?.trim().replace(/^@/, "").toLowerCase() ?? "";
  return /^[a-z0-9][a-z0-9._-]{2,29}$/.test(handle) ? handle : null;
}

export interface PublicObjectRouteInput {
  locale: AppLocale;
  objectType: CookShareObjectType;
  handle?: string | null;
  slug: string;
}

export async function resolvePublicObject(
  input: PublicObjectRouteInput,
  client?: SupabaseClient,
): Promise<CookShareResolvedObject | null> {
  if (!objectTypes.has(input.objectType)) return null;
  const slug = normalizeSlug(input.slug);
  if (!slug) return null;
  const handle = input.handle ? normalizeHandle(input.handle) : null;
  if (input.objectType !== "recipe" && input.objectType !== "ingredient" && input.objectType !== "category" && !handle) {
    return null;
  }

  const supabase = client ?? await createSupabaseServerClient();
  const { data, error } = await supabase.schema("home").rpc(
    "rpc_resolve_cookshare_public_object",
    {
      p_locale: input.locale,
      p_object_type: input.objectType,
      p_handle: handle,
      p_slug: slug,
    },
  );

  if (error || !data || typeof data !== "object") return null;
  return data as CookShareResolvedObject;
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
