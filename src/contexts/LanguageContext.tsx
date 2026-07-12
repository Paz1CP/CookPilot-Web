"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import es from "@/locales/es.json";
import en from "@/locales/en.json";
import {
  getAlternateLocalizedRoute,
  type AppLocale,
} from "@/shared/config/routes";

export type Locale = AppLocale;
export type Translations = typeof es;

const locales: Record<Locale, Translations> = { es, en };

function getLocaleFromPath(pathname: string): Locale | null {
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/es")) return "es";
  return null;
}

function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "es";

  const savedLocale = window.localStorage.getItem("cp-locale");
  return savedLocale === "en" ? "en" : "es";
}

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [fallbackLocale, setFallbackLocale] = useState<Locale>(getSavedLocale);
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPath(pathname) ?? fallbackLocale;

  useEffect(() => {
    window.localStorage.setItem("cp-locale", locale);
    document.cookie = `cp-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  const toggleLocale = () => {
    const next: Locale = locale === "es" ? "en" : "es";
    setFallbackLocale(next);

    const targetPath = getAlternateLocalizedRoute(pathname);
    if (targetPath) {
      router.push(targetPath);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ locale, t: locales[locale], toggleLocale }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLocale must be used inside <LanguageProvider>");
  return ctx;
}
