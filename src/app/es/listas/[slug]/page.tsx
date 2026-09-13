import type { Metadata } from "next";
import { metadataForCookShareObject, renderCookShareObject } from "@/lib/cookshare/page";

async function input(params: Promise<{ slug: string }>) {
  return { locale: "es" as const, objectType: "list" as const, slug: (await params).slug };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return metadataForCookShareObject(await input(params));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return renderCookShareObject(await input(params));
}

export const revalidate = 60;
export const dynamic = "force-static";
