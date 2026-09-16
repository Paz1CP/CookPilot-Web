import { notFound, permanentRedirect } from "next/navigation";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createCookShareMetadata, createMissingCookShareMetadata } from "@/shared/config/metadata";
import type { AppLocale } from "@/shared/config/routes";
import type { CookShareObjectType, CookShareResolvedObject } from "./types";
import { resolveContextualRecipe, resolvePublicObject, type ContextualRecipeRouteInput } from "./resolver";
import PublicObjectRenderer from "@/features/public-object/PublicObjectRenderer";

type CookSharePageInput = {
  locale: AppLocale;
  objectType: CookShareObjectType;
  handle?: string | null;
  slug: string;
};

const loadCookShareObject = async (
  locale: AppLocale,
  objectType: CookShareObjectType,
  handle: string | null,
  slug: string,
) => {
  // Detail resolution must observe publication changes immediately. Gallery
  // discovery keeps its own bounded cache, but object pages cannot reuse a
  // stale null after an object is published or revoked.
  const client = createSupabasePublicClient({ cache: "no-store" });
  const object = await resolvePublicObject({ locale, objectType, handle, slug }, client);
  return { object, client };
};

export async function getCookShareObject(input: CookSharePageInput) {
  return loadCookShareObject(input.locale, input.objectType, input.handle ?? null, input.slug);
}

export async function renderCookShareObject(input: CookSharePageInput) {
  const { object } = await getCookShareObject(input);
  if (!object) notFound();
  if (object.identity.is_alias) permanentRedirect(object.identity.canonical_path);
  return <PublicObjectRenderer object={object as CookShareResolvedObject} locale={input.locale} />;
}

export async function metadataForCookShareObject(input: CookSharePageInput) {
  const { object, client } = await getCookShareObject(input);
  if (!object) return createMissingCookShareMetadata(input.locale);
  const alternateLocale = input.locale === "es" ? "en" : "es";
  const alternate = await resolvePublicObject({ ...input, locale: alternateLocale }, client);
  return createCookShareMetadata(object, input.locale, {
    alternate: alternate && alternate.object_type === object.object_type
      && alternate.identity.slug === object.identity.slug
      && alternate.identity.handle === object.identity.handle
      ? alternate
      : null,
  });
}

export async function renderContextualCookShareRecipe(input: ContextualRecipeRouteInput) {
  const client = createSupabasePublicClient({ cache: "no-store" });
  const resolved = await resolveContextualRecipe(input, client);
  if (!resolved) notFound();
  if (resolved.isAlias) permanentRedirect(resolved.canonicalPath);
  return <PublicObjectRenderer object={resolved.object} locale={input.locale} />;
}

export async function metadataForContextualCookShareRecipe(input: ContextualRecipeRouteInput) {
  const client = createSupabasePublicClient({ cache: "no-store" });
  const resolved = await resolveContextualRecipe(input, client);
  if (!resolved) return createMissingCookShareMetadata(input.locale);
  return createCookShareMetadata(resolved.object, input.locale, { noindex: true });
}
