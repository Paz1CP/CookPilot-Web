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

export type Locale = "es" | "en";
export type Translations = typeof es;

const locales: Record<Locale, Translations> = { es, en };

const ROUTE_MAP: Record<string, string> = {
  "/es": "/en",
  "/en": "/es",
  "/es/como-funciona": "/en/how-it-works",
  "/en/how-it-works": "/es/como-funciona",
  "/es/guias": "/en/guides",
  "/en/guides": "/es/guias",
  "/es/pro": "/en/pro",
  "/en/pro": "/es/pro",
  "/es/faq": "/en/faq",
  "/en/faq": "/es/faq",
  "/es/comparativas": "/en/compare",
  "/en/compare": "/es/comparativas",
};

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");
  const pathname = usePathname();
  const router = useRouter();

  // Sync locale state with pathname changes
  useEffect(() => {
    let nextLocale: Locale | null = null;
    if (pathname.startsWith("/en")) {
      nextLocale = "en";
    } else if (pathname.startsWith("/es")) {
      nextLocale = "es";
    }

    if (nextLocale) {
      setLocale(nextLocale);
      localStorage.setItem("cp-locale", nextLocale);
      document.cookie = `cp-locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      // Fallback for non-locale paths like /privacy-and-terms
      const saved = window.localStorage.getItem("cp-locale") as Locale | null;
      if (saved === "es" || saved === "en") {
        setLocale(saved);
      }
    }
  }, [pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  const toggleLocale = () => {
    const next: Locale = locale === "es" ? "en" : "es";
    setLocale(next);
    localStorage.setItem("cp-locale", next);
    document.cookie = `cp-locale=${next}; path=/; max-age=31536000; SameSite=Lax`;

    const targetPath = ROUTE_MAP[pathname];
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
