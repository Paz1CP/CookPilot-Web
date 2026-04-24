import type { Metadata, Viewport } from "next";
import { Outfit, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SpeedInsights } from "@vercel/speed-insights/next"
const outfit = Outfit({
  variable: "--cp-font-sans-loaded",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  variable: "--cp-font-marker-loaded",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const SITE_URL = "https://cookpilot.pro";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CookPilot — Recupera el control de tu cocina",
  description:
    "Ahorra plata, tiempo y come mejor. CookPilot resuelve decisiones de cocina con claridad, contexto real y cultura peruana.",
  applicationName: "CookPilot",
  referrer: "origin-when-cross-origin",
  creator: "CookPilot",
  publisher: "CookPilot",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "es-PE": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    title: "CookPilot — Recupera el control de tu cocina",
    description:
      "Ahorra plata, tiempo y come mejor. CookPilot resuelve qué cocinar con claridad, contexto real y cultura peruana.",
    url: SITE_URL,
    siteName: "CookPilot",
    locale: "es_PE",
    alternateLocale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/img_app_icon.png",
        width: 1200,
        height: 630,
        alt: "CookPilot — Cocina con control, ahorra plata, tiempo y come mejor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CookPilot — Recupera el control de tu cocina",
    description:
      "Ahorra plata, tiempo y come mejor. CookPilot resuelve decisiones de cocina con claridad.",
    images: ["/images/img_app_icon.png"],
  },
  icons: {
    icon: "/images/img_favicon.png",
    apple: "/images/img_app_icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "CookPilot",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
  ],
};

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "CookPilot",
      url: SITE_URL,
      logo: `${SITE_URL}/images/img_app_icon.png`,
      description:
        "CookPilot ayuda a decidir qué cocinar con más claridad, ahorrando plata, tiempo y mejorando la alimentación.",
    },
    {
      "@type": "WebSite",
      name: "CookPilot",
      url: SITE_URL,
      inLanguage: ["es-PE", "en-US"],
      description:
        "Ahorra plata, tiempo y come mejor. CookPilot resuelve decisiones de cocina con claridad, contexto real y cultura peruana.",
    },
    {
      "@type": "SoftwareApplication",
      name: "CookPilot",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Android, iOS",
      description:
        "Aplicación de cocina inteligente que ayuda a resolver qué cocinar con criterio, reduciendo costo, tiempo y mejorando la nutrición.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "PEN",
        availability: "https://schema.org/PreOrder",
      },
      inLanguage: ["es", "en"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-theme="dark"
      className={`${outfit.variable} ${permanentMarker.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
