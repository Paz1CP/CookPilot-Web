import { notFound, permanentRedirect } from "next/navigation";
import { absoluteUrl } from "@/shared/config/site";
import type { AppLocale } from "@/shared/config/routes";
import { getCookShareObject } from "./page";
import { emptyGalleryFacets } from "./gallery-query";
import { getGalleryPage } from "./gallery";
import { publicTitle } from "./resolver";
import type { GalleryPage } from "./types";

type SemanticType = "category" | "ingredient";

const slugPattern = /^[a-z0-9][a-z0-9-]{0,63}$/;

function pathFor(locale: AppLocale, type: SemanticType, segments: string[]) {
  const section = type === "category"
    ? locale === "es" ? "categorias" : "categories"
    : locale === "es" ? "ingredientes" : "ingredients";
  return `/${locale}/${section}/${segments.join("/")}`;
}

function equalSegments(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export interface SemanticCollection {
  page: GalleryPage;
  title: string;
  description: string;
  canonicalPath: string;
}

export async function getSemanticCollection(
  locale: AppLocale,
  type: SemanticType,
  rawSegments: string[],
): Promise<SemanticCollection> {
  if (!rawSegments.length || rawSegments.length > 3) notFound();
  const segments = rawSegments.map((segment) => segment.trim().toLowerCase());
  if (segments.some((segment) => !slugPattern.test(segment)) || new Set(segments).size !== segments.length) notFound();

  const primary = await getCookShareObject({ locale, objectType: type, slug: segments[0] });
  if (!primary.object) notFound();

  const categorySegments = type === "category" ? segments : segments.slice(1);
  const categoryResults = await Promise.all(categorySegments.map((slug) => getCookShareObject({ locale, objectType: "category", slug })));
  if (categoryResults.some((result) => !result.object)) notFound();

  const canonicalPrimary = primary.object.identity.slug.toLowerCase();
  const canonicalCategories = categoryResults
    .map((result) => result.object!.identity.slug.toLowerCase())
    .sort();
  const canonicalSegments = type === "category"
    ? canonicalCategories
    : [canonicalPrimary, ...canonicalCategories];
  if (!equalSegments(segments, canonicalSegments) || primary.object.identity.is_alias || categoryResults.some((result) => result.object!.identity.is_alias)) {
    permanentRedirect(pathFor(locale, type, canonicalSegments));
  }

  const facets = emptyGalleryFacets();
  facets.categories = canonicalCategories;
  if (type === "ingredient") {
    facets.ingredients = [
      primary.object.name,
      primary.object.name_en,
      primary.object.identity.slug,
    ].filter((value): value is string => Boolean(value)).slice(0, 6);
  }
  const page = await getGalleryPage({
    locale,
    q: "",
    type: "recipes",
    cursor: null,
    scope: "global",
    handle: null,
    facets,
  });
  if (!page.items.length) notFound();

  const labels = canonicalCategories.map((slug, index) => {
    const result = categoryResults[index];
    return result?.object ? publicTitle(result.object, locale) : slug;
  });
  const primaryTitle = publicTitle(primary.object, locale);
  const title = type === "category" ? labels.join(" · ") : `${primaryTitle} · ${labels.join(" · ")}`;
  const description = type === "category"
    ? locale === "es" ? "Recetas públicas que coinciden con estas categorías." : "Public recipes matching these categories."
    : locale === "es" ? `Recetas públicas con ${primaryTitle.toLowerCase()}.` : `Public recipes with ${primaryTitle.toLowerCase()}.`;
  return { page, title, description, canonicalPath: pathFor(locale, type, canonicalSegments) };
}

export function semanticCollectionMetadata(
  collection: SemanticCollection,
  locale: AppLocale,
  type: SemanticType,
  hasSearchState = false,
) {
  const alternateLocale: AppLocale = locale === "es" ? "en" : "es";
  const segments = collection.canonicalPath.split("/").filter(Boolean).slice(2);
  const alternatePath = pathFor(alternateLocale, type, segments);
  return {
    title: `${collection.title} | CookPilot`,
    description: collection.description,
    alternates: {
      canonical: absoluteUrl(collection.canonicalPath),
      languages: {
        [locale]: absoluteUrl(collection.canonicalPath),
        [alternateLocale]: absoluteUrl(alternatePath),
      },
    },
    robots: hasSearchState ? { index: false, follow: true } : { index: true, follow: true },
  } as const;
}
