import type { Metadata } from "next";
import { Suspense } from "react";
import { guiasContent } from "@/content/guias";
import GuiasContent from "@/features/guides/GuiasContent";

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
  return (
    <Suspense fallback={null}>
      <GuiasContent content={guiasContent.es} />
    </Suspense>
  );
}
