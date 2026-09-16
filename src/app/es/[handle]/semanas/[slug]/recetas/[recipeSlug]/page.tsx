import type { Metadata } from "next";
import { metadataForContextualCookShareRecipe, renderContextualCookShareRecipe } from "@/lib/cookshare/page";

async function input(params: Promise<{ handle: string; slug: string; recipeSlug: string }>) {
  const value = await params;
  return { locale: "es" as const, parentType: "week" as const, parentHandle: value.handle, parentSlug: value.slug, recipeSlug: value.recipeSlug };
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string; slug: string; recipeSlug: string }> }): Promise<Metadata> {
  return metadataForContextualCookShareRecipe(await input(params));
}

export default async function Page({ params }: { params: Promise<{ handle: string; slug: string; recipeSlug: string }> }) {
  return renderContextualCookShareRecipe(await input(params));
}

export const revalidate = 0;
export const dynamic = "force-dynamic";
