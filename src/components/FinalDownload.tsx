"use client";

import Image from "next/image";
import { ArrowRight } from "iconsax-reactjs";
import { DownloadButton } from "./DownloadExperience";
import styles from "./FinalDownload.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function FinalDownload() {
  const { t } = useLocale();

  return (
    <section className={styles.download} id="download-final">
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.copy}>
            <h2>{t.download.title}</h2>
            <p>{t.download.subtitle}</p>
            <DownloadButton className={styles.primaryButton}>
              {t.header.descargar}
              <ArrowRight size={22} aria-hidden="true" />
            </DownloadButton>
          </div>
          <div className={styles.media}>
            <Image
              src="/images/food_images/img_dish_hero_signature.webp"
              alt=""
              fill
              sizes="(max-width: 960px) 100vw, 52vw"
              className={styles.food}
            />
            <div className={styles.mediaShade} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
