import type { Metadata } from "next";
import { metadataForCookShareObject, renderCookShareObject } from "@/lib/cookshare/page";
import { getSemanticCollection, semanticCollectionMetadata } from "@/lib/cookshare/semantic";
import SemanticCollection from "@/features/gallery/SemanticCollection";

async function input(params: Promise<{ segments: string[] }>) {
  const segments = (await params).segments;
  return { locale: "en" as const, objectType: "ingredient" as const, slug: segments.at(-1) ?? "" };
}
export async function generateMetadata({ params, searchParams }: { params: Promise<{ segments: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const segments = (await params).segments;
  if (segments.length === 1) return metadataForCookShareObject(await input(Promise.resolve({ segments })));
  return semanticCollectionMetadata(await getSemanticCollection("en", "ingredient", segments), "en", "ingredient", Object.keys(await searchParams).length > 0);
}
export default async function Page({ params }: { params: Promise<{ segments: string[] }> }) {
  const segments = (await params).segments;
  if (segments.length === 1) return renderCookShareObject(await input(Promise.resolve({ segments })));
  const collection = await getSemanticCollection("en", "ingredient", segments);
  return <SemanticCollection {...collection} />;
}
