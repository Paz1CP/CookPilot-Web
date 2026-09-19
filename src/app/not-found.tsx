import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations } from "@/lib/i18n";
import { getHtmlLanguage } from "@/shared/config/metadata";
import { defaultLocale, type AppLocale } from "@/shared/config/routes";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: getTranslations(defaultLocale).not_found.meta_title,
  robots: {
    index: false,
    follow: false,
  },
};

function getLocale(value: string | null): AppLocale {
  return value === "en" ? "en" : defaultLocale;
}

export default async function NotFound() {
  const requestHeaders = await headers();
  const locale = getLocale(requestHeaders.get("x-cp-locale"));
  const t = getTranslations(locale).not_found;

  return (
    <main className={styles.page} lang={getHtmlLanguage(locale)}>
      <div className={styles.inner}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.description}>{t.description}</p>
        <Link href={`/${locale}`} className="cp-btn cp-btn--primary">
          {t.action}
        </Link>
      </div>
    </main>
  );
}

