import styles from "./GallerySkeleton.module.css";

export default function GallerySkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.card} key={index}>
          <div className={`${styles.block} ${styles.media}`} />
          <div className={styles.body}>
            <div className={`${styles.block} ${styles.type}`} />
            <div className={`${styles.block} ${styles.title}`} />
            <div className={`${styles.block} ${styles.description}`} />
            <div className={`${styles.block} ${styles.descriptionShort}`} />
            <div className={`${styles.block} ${styles.meta}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
