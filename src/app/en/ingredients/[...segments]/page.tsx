import type { Metadata } from "next";
import { metadataForCookShareObject, renderCookShareObject } from "@/lib/cookshare/page";

async function input(params: Promise<{ segments: string[] }>) {
  const segments = (await params).segments;
  return { locale: "en" as const, objectType: "ingredient" as const, slug: segments.at(-1) ?? "" };
}
export async function generateMetadata({ params }: { params: Promise<{ segments: string[] }> }): Promise<Metadata> { return metadataForCookShareObject(await input(params)); }
export default async function Page({ params }: { params: Promise<{ segments: string[] }> }) { return renderCookShareObject(await input(params)); }
