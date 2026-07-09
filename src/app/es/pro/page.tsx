import type { Metadata } from "next";
import { proContent } from "@/content/pro";
import ProPageContent from "@/components/ProPageContent";

export const metadata: Metadata = {
  title: "Pro | CookPilot",
  description: "Desbloquea el sistema completo de CookPilot para planificar, ajustar, comprar y cocinar de forma recurrente.",
  alternates: {
    canonical: "https://cookpilot.pro/es/pro",
    languages: {
      "es": "https://cookpilot.pro/es/pro",
      "en": "https://cookpilot.pro/en/pro",
    },
  },
};

export default function Page() {
  return <ProPageContent content={proContent.es} />;
}
