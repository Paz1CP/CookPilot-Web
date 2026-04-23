import type { Metadata } from "next";
import { Outfit, Permanent_Marker } from "next/font/google";
import "./globals.css";

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
  title: "CookPilot — Recupera el control de tu cocina",
  description:
    "Ahorra plata, tiempo y come mejor. CookPilot resuelve decisiones de cocina con claridad, contexto real y cultura peruana.",
  keywords: [
    "CookPilot",
    "cocina",
    "ahorro",
    "meal planning",
    "Perú",
    "nutrición",
  ],
  openGraph: {
    title: "CookPilot — Recupera el control de tu cocina",
    description:
      "Ahorra plata, tiempo y come mejor. CookPilot resuelve decisiones de cocina con claridad.",
    type: "website",
    locale: "es_PE",
    siteName: "CookPilot",
  },
  icons: {
    icon: "/images/img_favicon.png",
  },
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
      <body>{children}</body>
    </html>
  );
}
