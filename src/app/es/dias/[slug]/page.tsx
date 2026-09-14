import type { Metadata } from "next";
import { metadataForCookShareObject, renderCookShareObject } from "@/lib/cookshare/page";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return metadataForCookShareObject({ locale: "es", objectType: "day", slug: (await params).slug });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return renderCookShareObject({ locale: "es", objectType: "day", slug: (await params).slug });
}

export const revalidate = 0;
export const dynamic = "force-dynamic";
