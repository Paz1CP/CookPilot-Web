import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getHtmlLanguage } from "@/shared/config/metadata";
import { defaultLocale, type AppLocale } from "@/shared/config/routes";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Página no encontrada | CookPilot",
  robots: {
    index: false,
    follow: false,
  },
};

const copy = {
  es: {
    title: "Página no encontrada.",
    description: "La ruta que buscas no existe o ya no está disponible.",
    action: "Volver al inicio",
  },
  en: {
    title: "Page not found.",
    description: "The route you are looking for does not exist or is no longer available.",
    action: "Go home",
  },
} satisfies Record<AppLocale, Record<string, string>>;

function getLocale(value: string | null): AppLocale {
  return value === "en" ? "en" : defaultLocale;
}

export default async function NotFound() {
  const requestHeaders = await headers();
  const locale = getLocale(requestHeaders.get("x-cp-locale"));
  const t = copy[locale];

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

