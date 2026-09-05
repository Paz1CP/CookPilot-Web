import { notFound, permanentRedirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCookShareMetadata, createMissingCookShareMetadata } from "@/shared/config/metadata";
import type { AppLocale } from "@/shared/config/routes";
import type { CookShareObjectType, CookShareResolvedObject } from "./types";
import { resolvePublicObject } from "./resolver";
import PublicObjectRenderer from "@/features/public-object/PublicObjectRenderer";

export async function getCookShareObject(input: {
  locale: AppLocale;
  objectType: CookShareObjectType;
  handle?: string | null;
  slug: string;
}) {
  const client = await createSupabaseServerClient();
  const [{ data: userData }, object] = await Promise.all([
    client.auth.getUser(),
    resolvePublicObject(input, client),
  ]);
  return { object, actorId: userData.user?.id ?? null };
}

export async function renderCookShareObject(input: {
  locale: AppLocale;
  objectType: CookShareObjectType;
  handle?: string | null;
  slug: string;
}) {
  const { object, actorId } = await getCookShareObject(input);
  if (!object) notFound();
  if (object.identity.is_alias) permanentRedirect(object.identity.canonical_path);
  return <PublicObjectRenderer object={object as CookShareResolvedObject} locale={input.locale} actorId={actorId} />;
}

export async function metadataForCookShareObject(input: {
  locale: AppLocale;
  objectType: CookShareObjectType;
  handle?: string | null;
  slug: string;
}) {
  const { object } = await getCookShareObject(input);
  return object ? createCookShareMetadata(object, input.locale) : createMissingCookShareMetadata(input.locale);
}
