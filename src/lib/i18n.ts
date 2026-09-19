import es from "@/locales/es.json";
import en from "@/locales/en.json";
import landingSpanish from "@/locales/landing.es.json";
import landingEnglish from "@/locales/landing.en.json";
import galleryEs from "@/locales/gallery.es.json";
import galleryEn from "@/locales/gallery.en.json";
import type { AppLocale } from "@/shared/config/routes";

const esTranslations = { ...es, ...landingSpanish };
const enTranslations = { ...en, ...landingEnglish };

export type Translations = typeof enTranslations;
export type GalleryTranslations = typeof galleryEn;

const translations: Record<AppLocale, Translations> = {
  es: esTranslations as Translations,
  en: enTranslations,
};

const galleryTranslations: Record<AppLocale, GalleryTranslations> = {
  es: galleryEs as GalleryTranslations,
  en: galleryEn,
};

export function getTranslations(locale: AppLocale): Translations {
  return translations[locale] ?? translations.es;
}

export function getGalleryTranslations(locale: AppLocale): GalleryTranslations {
  return galleryTranslations[locale] ?? galleryTranslations.es;
}
