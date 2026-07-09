import type { Metadata } from "next";
import HomePageContent from "@/components/HomePageContent";

export const metadata: Metadata = {
  title: "CookPilot — Organiza tu cocina, compras y nutrición",
  description:
    "Planifica menús, organiza compras, ajusta nutrición, importa recetas y cocina paso a paso con CookPilot.",
  alternates: {
    canonical: "/es",
    languages: {
      "es-PE": "/es",
      "en-US": "/en",
    },
  },
};

export default function Page() {
  return <HomePageContent />;
}
