import type { Metadata } from "next";
import { comoFuncionaContent } from "@/content/comoFunciona";
import HowItWorksContent from "@/features/how-it-works/HowItWorksContent";

export const metadata: Metadata = {
  title: "Cómo funciona | CookPilot",
  description: "CookPilot conecta planificación, compras, nutrición, cocina guiada y reutilización en un solo sistema.",
  alternates: {
    canonical: "https://cookpilot.pro/es/como-funciona",
    languages: {
      es: "https://cookpilot.pro/es/como-funciona",
      en: "https://cookpilot.pro/en/how-it-works",
    },
  },
};

export default function Page() {
  return <HowItWorksContent content={comoFuncionaContent.es} />;
}
