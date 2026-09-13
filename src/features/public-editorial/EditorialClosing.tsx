"use client";
import Image from "next/image";
import { useLocale } from "@/contexts/LanguageContext";
import { DownloadButton } from "@/shared/download/DownloadExperience";
import styles from "./Editorial.module.css";

export default function EditorialClosing() {
  const { t } = useLocale();
  return (
    <section id="download-final" className={styles.closing}>
      <div className={styles.closingPanel}>
        <div className={styles.closingCopy}>
          <h2>{t.download.title}</h2>
          <p>{t.download.subtitle}</p>
          <DownloadButton className="cp-btn cp-btn--primary">{t.header.descargar}<span aria-hidden="true">↗</span></DownloadButton>
        </div>
        <div className={styles.closingArt} aria-hidden="true">
          <Image src="/images/food/lomo_saltado.webp" alt="" fill sizes="(max-width: 760px) 100vw, 42vw" />
        </div>
      </div>
    </section>
  );
}
