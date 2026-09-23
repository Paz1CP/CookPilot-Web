import type { Metadata } from "next";
import { getGalleryPage, parseGalleryQueryState } from "@/lib/cookshare/gallery";
import GalleryDiscovery from "@/features/gallery/GalleryDiscovery";
import { createGalleryMetadata } from "@/shared/config/metadata";

export const preferredRegion = "gru1";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const state = parseGalleryQueryState("es", await searchParams);
  return createGalleryMetadata("es", state);
}
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const state = parseGalleryQueryState("es", await searchParams);
  const page = await getGalleryPage(state);
  return <GalleryDiscovery initial={page} />;
}

export const revalidate = 60;
