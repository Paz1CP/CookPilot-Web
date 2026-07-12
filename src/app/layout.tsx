import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Outfit, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/shared/layout/Header";
import Footer from "@/shared/layout/Footer";
import DownloadExperience from "@/shared/download/DownloadExperience";
import { absoluteUrl, siteConfig } from "@/shared/config/site";
import { getDocumentLocale, getHtmlLanguage } from "@/shared/config/metadata";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.publicUrl),
  title: {
    default: siteConfig.localizedPageMetadata.es.home.title,
    template: `%s`,
  },
  description: siteConfig.baseDescription.es,
  applicationName: siteConfig.productName,
  referrer: "origin-when-cross-origin",
  creator: siteConfig.productName,
  publisher: siteConfig.productName,
  icons: {
    icon: [
      {
        url: "/images/img_favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: "/images/img_app_icon.png",
  },
  openGraph: {
    title: siteConfig.localizedPageMetadata.es.home.title,
    description: siteConfig.localizedPageMetadata.es.home.description,
    url: absoluteUrl(siteConfig.localizedRoutes.es.home),
    siteName: siteConfig.productName,
    locale: "es_PE",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: absoluteUrl(siteConfig.defaultOpenGraphImage.path),
        width: siteConfig.defaultOpenGraphImage.width,
        height: siteConfig.defaultOpenGraphImage.height,
        alt: siteConfig.defaultOpenGraphImage.alt.es,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.localizedPageMetadata.es.home.title,
    description: siteConfig.localizedPageMetadata.es.home.description,
    images: [
      {
        url: absoluteUrl(siteConfig.defaultOpenGraphImage.path),
        alt: siteConfig.defaultOpenGraphImage.alt.es,
      },
    ],
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.publicUrl}/#organization`,
      name: siteConfig.publicData.name,
      url: siteConfig.publicUrl,
      logo: absoluteUrl("/images/img_app_icon.png"),
      contactPoint: {
        "@type": "ContactPoint",
        email: siteConfig.publicData.contactEmail,
        contactType: "customer support",
      },
      sameAs: [siteConfig.publicData.social.linkedin],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.publicUrl}/#website`,
      name: siteConfig.productName,
      url: siteConfig.publicUrl,
      publisher: {
        "@id": `${siteConfig.publicUrl}/#organization`,
      },
      inLanguage: ["es", "en"],
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale =
    requestHeaders.get("x-cp-locale") === "en"
      ? "en"
      : getDocumentLocale(requestHeaders.get("x-cp-pathname"));

  return (
    <html
      lang={getHtmlLanguage(locale)}
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
        <LanguageProvider>
          <Header />
          {children}
          <DownloadExperience />
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
