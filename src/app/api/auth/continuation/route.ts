import { NextResponse, type NextRequest } from "next/server";
import { resolvePublicObject } from "@/lib/cookshare/resolver";
import { setContinuationCookie } from "@/lib/auth/continuation";
import type { AppLocale } from "@/shared/config/routes";
import type { ContinuationAction } from "@/lib/auth/continuation";
import type { CookShareObjectType } from "@/lib/cookshare/types";

const actions = new Set<ContinuationAction>(["view", "unlock", "cook"]);
const objectTypes = new Set<CookShareObjectType>([
  "recipe", "menu", "day", "week", "list", "ingredient", "category",
]);

export async function POST(request: NextRequest) {
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const locale = input.locale === "en" ? "en" : input.locale === "es" ? "es" : null;
  const objectType = typeof input.objectType === "string" && objectTypes.has(input.objectType as CookShareObjectType)
    ? input.objectType as CookShareObjectType
    : null;
  const action = typeof input.action === "string" && actions.has(input.action as ContinuationAction)
    ? input.action as ContinuationAction
    : "view";
  const slug = typeof input.slug === "string" ? input.slug : "";
  const handle = typeof input.handle === "string" ? input.handle : null;
  if (!locale || !objectType || !slug) return NextResponse.json({ error: "invalid request" }, { status: 400 });

  const resolved = await resolvePublicObject({
    locale: locale as AppLocale,
    objectType,
    handle,
    slug,
  });
  if (!resolved) return NextResponse.json({ error: "not found" }, { status: 404 });

  const response = NextResponse.json({ ok: true });
  setContinuationCookie(response, {
    objectType,
    objectId: resolved.identity.object_id,
    ownerId: resolved.identity.owner_id,
    locale: locale as AppLocale,
    canonicalPath: resolved.identity.canonical_path,
    action,
    createdAt: Date.now(),
  });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
