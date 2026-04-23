"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import es from "@/locales/es.json";
import en from "@/locales/en.json";

export type Locale = "es" | "en";
export type Translations = typeof es;

const locales: Record<Locale, Translations> = { es, en };

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");

  useEffect(() => {
    const saved = localStorage.getItem("cp-locale") as Locale | null;
    if (saved === "es" || saved === "en") {
      setLocale(saved);
    }
  }, []);

  const toggleLocale = () => {
    const next: Locale = locale === "es" ? "en" : "es";
    setLocale(next);
    localStorage.setItem("cp-locale", next);
    // Update the html lang attribute
    document.documentElement.setAttribute("lang", next);
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
