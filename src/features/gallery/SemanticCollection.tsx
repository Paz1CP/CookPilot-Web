import type { GalleryPage } from "@/lib/cookshare/types";
import GalleryClient from "./GalleryClient";
import styles from "./GalleryPage.module.css";

export default function SemanticCollection({
  title,
  description,
  page,
  canonicalPath,
}: {
  title: string;
  description: string;
  page: GalleryPage;
  canonicalPath: string;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <p className="cp-eyebrow">CookShare</p>
        <h1>{title}</h1>
        <p className={styles.lead}>{description}</p>
        <GalleryClient
          initial={page}
          basePath={canonicalPath}
          fixedState={{
            type: page.state.type,
            filters: {
              categories: page.state.filters.categories,
              ingredients_include: page.state.filters.ingredients_include,
            },
          }}
        />
      </div>
    </main>
  );
}
