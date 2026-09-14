import type { Metadata } from "next";
import { getEmptyGalleryPage, parseGalleryState } from "@/lib/cookshare/gallery";
import GalleryDiscovery from "@/features/gallery/GalleryDiscovery";
import { createGalleryMetadata } from "@/shared/config/metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const state = parseGalleryState("en", await searchParams);
  return createGalleryMetadata("en", state);
}
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const state = parseGalleryState("en", await searchParams);
  const page = getEmptyGalleryPage(state);
  return <GalleryDiscovery initial={page} />;
}

export const revalidate = 60;
