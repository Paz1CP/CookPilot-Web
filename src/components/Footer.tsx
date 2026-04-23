"use client";

import { Reveal, fadeUp } from "./motion";
import styles from "./Footer.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className={styles.footer}>
      <Reveal variants={fadeUp}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <div className={styles.logo}>
              <img
                src="/images/img_app_icon.png"
                alt={t.footer.logo_alt}
                className={styles.logoImage}
              />
              <span className={styles.logoText}>
                <span className="brand-cook">Cook</span>
                <span className="brand-pilot">Pilot</span>
              </span>
            </div>
          </div>

          <div className={styles.right}>
            <span className={styles.madeIn}>{t.footer.made_in}</span>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
