import { notFound } from "next/navigation";
import type { AppLocale } from "@/shared/config/routes";
import { buildHandlePath } from "@/shared/config/routes";
import { getGalleryPage } from "@/lib/cookshare/gallery";
import { parseGalleryState } from "@/lib/cookshare/gallery-query";
import GalleryClient from "./GalleryClient";
import styles from "./HandleGallery.module.css";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function HandleGallery({
  handle,
  locale,
  searchParams,
}: {
  handle: string;
  locale: AppLocale;
  searchParams?: SearchParams;
}) {
  const normalizedHandle = handle.replace(/^@/, "").toLowerCase();
  const state = parseGalleryState(locale, {
    ...(searchParams ?? {}),
    scope: "handle",
    handle: normalizedHandle,
  });
  const page = await getGalleryPage(state);
  if (!page.ownerId) notFound();
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className="cp-eyebrow">CookShare</p>
            <h1>@{normalizedHandle}</h1>
            <p className={styles.lead}>{locale === "es" ? "Recetas y colecciones compartidas desde CookPilot." : "Recipes and collections shared from CookPilot."}</p>
          </div>
          <span className={styles.publicBadge}>{locale === "es" ? "Perfil CookShare" : "CookShare profile"}</span>
        </div>
        <GalleryClient initial={page} basePath={buildHandlePath(locale, normalizedHandle)} />
      </div>
    </main>
  );
}
