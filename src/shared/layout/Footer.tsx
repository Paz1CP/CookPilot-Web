"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal, fadeUp } from "@/shared/motion/motion";
import styles from "./Footer.module.css";
import { useLocale } from "@/contexts/LanguageContext";
import { getLocalizedRoute } from "@/shared/config/routes";

export default function Footer() {
  const { t, locale, toggleLocale } = useLocale();

  const currentYear = new Date().getFullYear();

  // Helper to change locale explicitly
  const setLanguage = (lang: "es" | "en") => {
    if (locale !== lang) {
      toggleLocale();
    }
  };

  const productLinks = [
    { label: t.footer.como_funciona, href: getLocalizedRoute(locale, "howItWorks") },
    { label: t.footer.pro, href: getLocalizedRoute(locale, "pro") },
    { label: t.footer.descargar, href: "#download-final" },
  ];

  const learnLinks = [
    { label: t.footer.guias, href: getLocalizedRoute(locale, "guides") },
    { label: t.footer.faq, href: getLocalizedRoute(locale, "faq") },
    { label: t.footer.comparativas, href: getLocalizedRoute(locale, "compare") },
  ];

  return (
    <footer className={styles.footer}>
      <Reveal variants={fadeUp}>
        <div className={styles.inner}>
          
          {/* Logo & Made in info */}
          <div className={styles.brandCol}>
            <Link href={locale === "es" ? "/es" : "/en"} className={styles.logo}>
              <Image
                src="/images/img_app_icon.png"
                alt={t.footer.logo_alt}
                width={32}
                height={32}
                className={styles.logoImage}
              />
              <span className={styles.logoText}>
                <span className="brand-cook">Cook</span>
                <span className="brand-pilot">Pilot</span>
              </span>
            </Link>
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
            <p className={styles.copyright}>
              &copy; {currentYear} CookPilot.
            </p>
          </div>

          {/* Links Grid */}
          <div className={styles.linksGrid}>
            {/* Column 1: Product */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>{t.footer.product_title}</h4>
              <ul className={styles.list}>
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Learn */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>{t.footer.learn_title}</h4>
              <ul className={styles.list}>
                {learnLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal & Stores */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>{t.footer.legal_title}</h4>
              <ul className={styles.list}>
                <li>
                  <Link href="/privacy-and-terms" className={styles.link}>
                    {t.footer.privacy_terms}
                  </Link>
                </li>
              </ul>

              <h4 className={`${styles.colTitle} ${styles.storesTitle}`}>
                {t.footer.stores_title}
              </h4>
              <ul className={styles.list}>
                <li>
                  <a
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {t.footer.google_play}
                  </a>
                </li>
                <li>
                  <a
                    href="https://appgallery.huawei.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {t.footer.app_gallery}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Social & Language */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>{t.footer.social_title}</h4>
              <ul className={styles.list}>
                <li>
                  <a
                    href="https://www.linkedin.com/company/cookpilot/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLinkLink}
                  >
                    <Image
                      src="/icons/linkedln-icon.svg"
                      alt=""
                      width={16}
                      height={16}
                      className={styles.socialIcon}
                    />
                    <span>{t.footer.linkedin}</span>
                  </a>
                </li>
              </ul>

              <h4 className={`${styles.colTitle} ${styles.languageTitle}`}>
                {t.footer.language_title}
              </h4>
              <ul className={styles.langList}>
                <li>
                  <button
                    onClick={() => setLanguage("es")}
                    className={`${styles.langBtn} ${locale === "es" ? styles.activeLang : ""}`}
                  >
                    {t.footer.es}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`${styles.langBtn} ${locale === "en" ? styles.activeLang : ""}`}
                  >
                    {t.footer.en}
                  </button>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </Reveal>
    </footer>
  );
}
