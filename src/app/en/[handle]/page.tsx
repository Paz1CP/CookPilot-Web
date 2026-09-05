import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HandleGallery from "@/features/gallery/HandleGallery";
import { buildHandlePath } from "@/shared/config/routes";
import { absoluteUrl } from "@/shared/config/site";
import { createMissingCookShareMetadata } from "@/shared/config/metadata";
import { getGalleryPage } from "@/lib/cookshare/gallery";
import { parseGalleryState } from "@/lib/cookshare/gallery-query";
import { hasActiveGalleryFacets } from "@/lib/cookshare/gallery-query";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ handle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const handle = (await params).handle.replace(/^@/, "");
  const path = buildHandlePath("en", handle);
  const state = parseGalleryState("en", { ...(await searchParams), scope: "handle", handle });
  const page = await getGalleryPage(state, 1);
  if (!page.ownerId) return createMissingCookShareMetadata("en");
  const filtered = Boolean(state.q || state.type !== "all" || hasActiveGalleryFacets(state));
  return {
    title: `@${handle} | CookShare`,
    description: "CookShare on CookPilot",
    alternates: { canonical: absoluteUrl(path), languages: { es: absoluteUrl(buildHandlePath("es", handle)), en: absoluteUrl(path) } },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function Page({ params, searchParams }: { params: Promise<{ handle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const handle = (await params).handle;
  if (!handle.startsWith("@")) notFound();
  return <HandleGallery handle={handle} locale="en" searchParams={await searchParams} />;
}
