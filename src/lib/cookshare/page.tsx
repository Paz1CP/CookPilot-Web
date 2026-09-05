import { notFound, permanentRedirect } from "next/navigation";
import { createSupabaseServerClient, getRequestUser } from "@/lib/supabase/server";
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
  const [{ user }, object] = await Promise.all([
    getRequestUser(client),
    resolvePublicObject(input, client),
  ]);
  return { object, actorId: user?.id ?? null, client };
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
  const { object, actorId, client } = await getCookShareObject(input);
  if (!object) return createMissingCookShareMetadata(input.locale);
  const alternateLocale = input.locale === "es" ? "en" : "es";
  const alternate = await resolvePublicObject({ ...input, locale: alternateLocale }, client);
  const visibility = await client.schema("home").rpc("fn_cookshare_effective_public", {
    p_object_type: object.object_type,
    p_object_id: object.object_id,
    p_actor_id: actorId,
  });
  return createCookShareMetadata(object, input.locale, {
    alternate: alternate?.object_id === object.object_id ? alternate : null,
    noindex: object.object_type === "list" || (visibility.error ? false : visibility.data !== true),
  });
}
