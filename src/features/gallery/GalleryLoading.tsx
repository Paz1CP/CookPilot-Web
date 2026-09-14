import GallerySkeleton from "./GallerySkeleton";
import styles from "./GalleryLoading.module.css";

export default function GalleryLoading() {
  return (
    <div className={styles.loading} aria-hidden="true">
      <div className={`${styles.block} ${styles.eyebrow}`} />
      <div className={`${styles.block} ${styles.heading}`} />
      <div className={`${styles.block} ${styles.lead}`} />
      <GallerySkeleton count={12} />
    </div>
  );
}
