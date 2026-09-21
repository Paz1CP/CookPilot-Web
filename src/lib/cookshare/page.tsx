import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createCookShareMetadata, createMissingCookShareMetadata } from "@/shared/config/metadata";
import { getAlternateLocale, type AppLocale } from "@/shared/config/routes";
import type { CookShareObjectType, CookShareResolvedObject } from "./types";
import { resolveContextualRecipe, resolvePublicObject, type ContextualRecipeRouteInput } from "./resolver";
import PublicObjectRenderer from "@/features/public-object/PublicObjectRenderer";

type CookSharePageInput = {
  locale: AppLocale;
  objectType: CookShareObjectType;
  handle?: string | null;
  slug: string;
};

const loadCookShareObject = cache(async (
  locale: AppLocale,
  objectType: CookShareObjectType,
  handle: string | null,
  slug: string,
) => {
  // Deduplicate metadata/render within one request; no-store keeps the next
  // request current after an object is published or revoked.
  const client = createSupabasePublicClient({ cache: "no-store" });
  const object = await resolvePublicObject({ locale, objectType, handle, slug }, client);
  return { object, client };
});

const loadContextualCookShareRecipe = cache((
  locale: AppLocale,
  parentType: ContextualRecipeRouteInput["parentType"],
  parentHandle: string,
  parentSlug: string,
  recipeSlug: string,
) => {
  const client = createSupabasePublicClient({ cache: "no-store" });
  return resolveContextualRecipe({ locale, parentType, parentHandle, parentSlug, recipeSlug }, client);
});

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
  if (!object) return createMissingCookShareMetadata();
  const alternateLocale = getAlternateLocale(input.locale);
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
  const resolved = await loadContextualCookShareRecipe(
    input.locale,
    input.parentType,
    input.parentHandle,
    input.parentSlug,
    input.recipeSlug,
  );
  if (!resolved) notFound();
  if (resolved.isAlias) permanentRedirect(resolved.canonicalPath);
  return <PublicObjectRenderer object={resolved.object} locale={input.locale} />;
}

export async function metadataForContextualCookShareRecipe(input: ContextualRecipeRouteInput) {
  const resolved = await loadContextualCookShareRecipe(
    input.locale,
    input.parentType,
    input.parentHandle,
    input.parentSlug,
    input.recipeSlug,
  );
  if (!resolved) return createMissingCookShareMetadata();
  return createCookShareMetadata(resolved.object, input.locale, { noindex: true });
}
