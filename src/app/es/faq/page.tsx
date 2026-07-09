import type { Metadata } from "next";
import { faqContent } from "@/content/faq";
import FaqPageContent from "@/components/FaqPageContent";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | CookPilot",
  description: "Respuestas claras sobre la planificación de menús, compras de supermercado, macros de nutrición, importaciones y planes Pro en CookPilot.",
  alternates: {
    canonical: "https://cookpilot.pro/es/faq",
    languages: {
      "es": "https://cookpilot.pro/es/faq",
      "en": "https://cookpilot.pro/en/faq",
    },
  },
};

export default function Page() {
  return <FaqPageContent content={faqContent.es} />;
}
