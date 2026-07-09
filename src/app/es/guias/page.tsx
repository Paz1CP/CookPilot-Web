import type { Metadata } from "next";
import { guiasContent } from "@/content/guias";
import GuiasContent from "@/components/GuiasContent";

export const metadata: Metadata = {
  title: "Guías | CookPilot",
  description: "Aprende a dominar CookPilot paso a paso: planificación, compras, nutrición, cocina guiada, importación y reutilización.",
  alternates: {
    canonical: "https://cookpilot.pro/es/guias",
    languages: {
      "es": "https://cookpilot.pro/es/guias",
      "en": "https://cookpilot.pro/en/guides",
    },
  },
};

export default function Page() {
  return <GuiasContent content={guiasContent.es} />;
}
