"use client";

import Image from "next/image";
import { Sms } from "iconsax-reactjs";
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
              <Image
                src="/images/img_app_icon.png"
                alt={t.footer.logo_alt}
                width={28}
                height={28}
                className={styles.logoImage}
              />
              <span className={styles.logoText}>
                <span className="brand-cook">Cook</span>
                <span className="brand-pilot">Pilot</span>
              </span>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.socials}>
              <a
                href="https://www.linkedin.com/company/cookpilot/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <Image
                  src="/icons/linkedln-icon.svg"
                  alt=""
                  width={18}
                  height={18}
                  className={styles.socialIcon}
                />
              </a>
              <a
                href="mailto:founder@cookpilot.pro"
                className={styles.socialLink}
                aria-label="Email"
              >
                <Sms variant="Linear" size={20} className={styles.socialIconInner} />
              </a>
            </div>
            <div className={styles.madeIn}>
              <span>{t.footer.made_in}</span>
              <Image
                src="/icons/peru-icon.png"
                alt="Perú"
                width={18}
                height={18}
                className={styles.footerFlag}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
