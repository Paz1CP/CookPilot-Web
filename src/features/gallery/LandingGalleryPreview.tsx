import Image from "next/image";
import Link from "next/link";
import { getGalleryPage } from "@/lib/cookshare/gallery";
import { emptyGalleryFilters } from "@/lib/cookshare/gallery-query";
import { getTranslations } from "@/lib/i18n";
import { getLocalizedRoute, type AppLocale } from "@/shared/config/routes";
import styles from "./LandingGalleryPreview.module.css";

export default async function LandingGalleryPreview({ locale }: { locale: AppLocale }) {
  const page = await getGalleryPage(
    { locale, q: "", type: "recipes", handle: null, cursor: null, filters: emptyGalleryFilters() },
    6,
  );
  const t = getTranslations(locale).landing_gallery;
  const galleryHref = getLocalizedRoute(locale, "gallery");

  return (
    <section className={styles.section} aria-labelledby="landing-gallery-title">
      <div className={styles.shell}>
        <div className={styles.heading}>
          <div>
            <p className="cp-eyebrow">CookShare</p>
            <h2 id="landing-gallery-title">{t.title}</h2>
            <p>{t.description}</p>
          </div>
          <Link href={galleryHref} className="cp-btn cp-btn--secondary">
            {t.view_gallery}
          </Link>
        </div>
        {page.items.length ? (
          <div className={styles.grid}>
            {page.items.map((item) => (
              <Link href={item.href} key={item.href} className={styles.card}>
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={480}
                    height={320}
                    sizes="(max-width: 680px) 100vw, 33vw"
                  />
                ) : (
                  <div className={styles.fallback}>CookPilot</div>
                )}
                <div>
                  <h3>{item.title}</h3>
                  {item.timeMinutes ? <span>{item.timeMinutes} min</span> : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>{t.coming_soon}</p>
        )}
      </div>
    </section>
  );
}
