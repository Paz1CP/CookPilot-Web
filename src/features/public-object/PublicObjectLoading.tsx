import styles from "./PublicObjectLoading.module.css";

export default function PublicObjectLoading() {
  return (
    <main className={styles.page} aria-busy="true" aria-hidden="true">
      <div className={styles.shell}>
        <div className={`${styles.line} ${styles.breadcrumb}`} />
        <div className={styles.hero}>
          <div className={styles.copy}>
            <div className={`${styles.line} ${styles.kicker}`} />
            <div className={`${styles.line} ${styles.title}`} />
            <div className={`${styles.line} ${styles.description}`} />
            <div className={`${styles.line} ${styles.descriptionShort}`} />
            <div className={styles.meta}>
              <div className={`${styles.line} ${styles.metaItem}`} />
              <div className={`${styles.line} ${styles.metaItem}`} />
            </div>
            <div className={styles.actions}>
              <div className={`${styles.line} ${styles.action}`} />
              <div className={`${styles.line} ${styles.action}`} />
              <div className={`${styles.line} ${styles.actionSmall}`} />
              <div className={`${styles.line} ${styles.actionSmall}`} />
            </div>
          </div>
          <div className={`${styles.media} ${styles.shimmer}`} />
        </div>
        <div className={styles.cards}>
          <div className={`${styles.card} ${styles.shimmer}`} />
          <div className={`${styles.card} ${styles.shimmer}`} />
          <div className={`${styles.card} ${styles.shimmer}`} />
        </div>
      </div>
    </main>
  );
}
