import { DiscoverySkeleton } from "@/features/gallery/GalleryDiscovery";
import styles from "@/features/gallery/GalleryDiscovery.module.css";
import labels from "@/locales/gallery.en.json";

export default function Loading() {
  return <main className={styles.page}><section className={styles.hero}><h1>{labels.title} <span>{labels.titleAccent}</span></h1><div className={styles.search} aria-hidden="true"><div className={styles.countSkeleton} /></div></section><div className={styles.layout}><div className={styles.sidebar} aria-hidden="true" /><DiscoverySkeleton /></div></main>;
}
