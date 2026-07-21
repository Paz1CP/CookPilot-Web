import {
  appLocales,
  defaultLocale,
  localizedRoutes,
  type AppLocale,
  type LocalizedRouteKey,
} from "@/shared/config/routes";

export type PublicUtilityRouteKey = "privacyAndTerms" | "deleteAccount";

type PageMeta = {
  title: string;
  description: string;
};

type SitemapConfig = {
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

const publicUrl = "https://cookpilot.pro";

export const siteConfig = {
  publicUrl,
  productName: "CookPilot",
  baseDescription: {
    es: "CookPilot organiza menús, compras, nutrición, recetas y cocina guiada en un solo sistema.",
    en: "CookPilot organizes menus, shopping, nutrition, recipes, and guided cooking in one system.",
  },
  locales: appLocales,
  defaultLocale,
  localizedRoutes,
  defaultOpenGraphImage: {
    path: "/images/og/cookpilot-og.png",
    width: 1200,
    height: 630,
    alt: {
      es: "CookPilot, sistema para organizar comida, compras y cocina",
      en: "CookPilot, a system to organize food, shopping, and cooking",
    },
  },
  publicData: {
    name: "CookPilot",
    legalName: "CookPilot",
    originCountry: "PE",
    contactEmail: "support@cookpilot.pro",
    social: {
      linkedin: "https://www.linkedin.com/company/cookpilot/",
    },
    stores: {
      googlePlay: "https://play.google.com/store/apps/details?id=com.cookpilot.pe",
      appGallery: "https://appgallery.cloud.huawei.com/ag/n/app/C118044413",
    },
  },
  lastModified: "2026-07-12",
  localizedPageMetadata: {
    es: {
      home: {
        title: "CookPilot - Organiza tu cocina, compras y nutrición",
        description:
          "Planifica menús, organiza compras, ajusta nutrición, importa recetas y cocina paso a paso con CookPilot.",
      },
      howItWorks: {
        title: "Cómo funciona | CookPilot",
        description:
          "CookPilot conecta planificación, compras, nutrición, cocina guiada y reutilización en un solo sistema.",
      },
      guides: {
        title: "Guías | CookPilot",
        description:
          "Aprende a dominar CookPilot paso a paso: planificación, compras, nutrición, cocina guiada, importación y reutilización.",
      },
      pro: {
        title: "Pro | CookPilot",
        description:
          "Desbloquea el sistema completo de CookPilot para planificar, ajustar, comprar y cocinar de forma recurrente.",
      },
      faq: {
        title: "Preguntas frecuentes | CookPilot",
        description:
          "Respuestas claras sobre planificación de menús, compras, macros, importaciones y planes Pro en CookPilot.",
      },
      compare: {
        title: "Comparativas | CookPilot",
        description:
          "Compara cómo se organiza tu alimentación diaria con CookPilot frente a apps de recetas, planners, trackers, notas y delivery.",
      },
    },
    en: {
      home: {
        title: "CookPilot - Organize your kitchen, shopping, and nutrition",
        description:
          "Plan menus, organize shopping, adjust nutrition, import recipes, and cook step by step with CookPilot.",
      },
      howItWorks: {
        title: "How it works | CookPilot",
        description:
          "CookPilot connects planning, shopping, nutrition, guided cooking, and reuse in a single system.",
      },
      guides: {
        title: "Guides | CookPilot",
        description:
          "Learn how to master CookPilot step by step: planning, shopping, nutrition, guided cooking, import, and reuse.",
      },
      pro: {
        title: "Pro | CookPilot",
        description:
          "Unlock the complete CookPilot system to plan, adjust, shop, and cook on a recurring basis.",
      },
      faq: {
        title: "FAQ | CookPilot",
        description:
          "Clear answers about menu planning, grocery shopping, nutrition macros, imports, and Pro plans in CookPilot.",
      },
      compare: {
        title: "Compare | CookPilot",
        description:
          "Compare how your daily food is organized using CookPilot versus recipe apps, meal planners, macro trackers, notes, and delivery.",
      },
    },
  } satisfies Record<AppLocale, Record<LocalizedRouteKey, PageMeta>>,
  utilityRoutes: {
    privacyAndTerms: {
      path: "/privacy-and-terms",
      title: "Privacidad y términos | CookPilot",
      description:
        "Política de privacidad, términos, eliminación de cuenta, procesamiento de datos, AI, pagos y contacto de CookPilot.",
      openGraphType: "article",
      sitemap: {
        changeFrequency: "monthly",
        priority: 0.7,
      },
    },
    deleteAccount: {
      path: "/delete-account",
      title: "Eliminar cuenta de CookPilot | CookPilot",
      description:
        "Instrucciones y verificación pública para solicitar la eliminación permanente de una cuenta de CookPilot.",
      openGraphType: "website",
      sitemap: {
        changeFrequency: "monthly",
        priority: 0.6,
      },
    },
  } satisfies Record<
    PublicUtilityRouteKey,
    PageMeta & { path: string; openGraphType: "website" | "article"; sitemap: SitemapConfig }
  >,
  sitemap: {
    home: { changeFrequency: "weekly", priority: 1 },
    howItWorks: { changeFrequency: "weekly", priority: 0.8 },
    guides: { changeFrequency: "weekly", priority: 0.8 },
    pro: { changeFrequency: "weekly", priority: 0.9 },
    faq: { changeFrequency: "weekly", priority: 0.7 },
    compare: { changeFrequency: "weekly", priority: 0.8 },
  } satisfies Record<LocalizedRouteKey, SitemapConfig>,
} as const;

export function absoluteUrl(path = "") {
  if (!path) return siteConfig.publicUrl;
  if (path.startsWith("http")) return path;
  return `${siteConfig.publicUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

