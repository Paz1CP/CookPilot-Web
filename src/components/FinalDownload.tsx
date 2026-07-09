"use client";

import { Reveal, fadeUp } from "./motion";
import styles from "./FinalDownload.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function FinalDownload() {
  const { t } = useLocale();

  return (
    <section className={styles.download} id="download-final">
      <div className={styles.inner}>
        <div className={styles.box}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.title}>{t.download.title}</h2>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <p className={styles.subtitle}>{t.download.subtitle}</p>
          </Reveal>
          
          <Reveal variants={fadeUp} delay={0.2}>
            <div className={styles.buttons}>
              <a href="#" className="cp-btn cp-btn--primary">
                {t.hero.download_google_play}
              </a>
              <a href="#" className="cp-btn cp-btn--ghost">
                {t.hero.download_appgallery}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
