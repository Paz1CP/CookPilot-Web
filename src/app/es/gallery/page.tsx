import type { Metadata } from "next";
import { getGalleryPage, parseGalleryState } from "@/lib/cookshare/gallery";
import GalleryClient from "@/features/gallery/GalleryClient";
import styles from "@/features/gallery/GalleryPage.module.css";
import { createGalleryMetadata } from "@/shared/config/metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const state = parseGalleryState("es", await searchParams);
  return createGalleryMetadata("es", state);
}
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const state = parseGalleryState("es", await searchParams);
  const page = await getGalleryPage(state);
  return <main className={styles.page}><div className={styles.shell}><p className="cp-eyebrow">CookShare</p><h1>Galería</h1><p className={styles.lead}>Recetas reales para decidir qué cocinar con claridad.</p><GalleryClient initial={page} /></div></main>;
}
