import type { Metadata } from "next";
import { metadataForCookShareObject, renderCookShareObject } from "@/lib/cookshare/page";
async function input(params: Promise<{ handle: string; slug: string }>) { const value = await params; return { locale: "es" as const, objectType: "day" as const, handle: value.handle, slug: value.slug }; }
export async function generateMetadata({ params }: { params: Promise<{ handle: string; slug: string }> }): Promise<Metadata> { return metadataForCookShareObject(await input(params)); }
export default async function Page({ params }: { params: Promise<{ handle: string; slug: string }> }) { return renderCookShareObject(await input(params)); }
