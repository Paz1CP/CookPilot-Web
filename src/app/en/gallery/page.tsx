import type { Metadata } from "next";
import { getGalleryPage, parseGalleryState } from "@/lib/cookshare/gallery";
import GalleryClient from "@/features/gallery/GalleryClient";
import styles from "@/features/gallery/GalleryPage.module.css";
import { createLocalizedMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createLocalizedMetadata("gallery", "en");
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const state = parseGalleryState("en", await searchParams);
  const page = await getGalleryPage(state);
  return <main className={styles.page}><div className={styles.shell}><p className="cp-eyebrow">CookShare</p><h1>Gallery</h1><p className={styles.lead}>Real recipes to decide what to cook with clarity.</p><GalleryClient initial={page} /></div></main>;
}
