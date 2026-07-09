import type { Metadata } from "next";
import { comparativasContent } from "@/content/comparativas";
import ComparativasPageContent from "@/components/ComparativasPageContent";

export const metadata: Metadata = {
  title: "Comparativas | CookPilot",
  description: "Compara cómo se organiza tu alimentación diaria con CookPilot en comparación con apps de recetas, planners, trackers de macros, notas y delivery.",
  alternates: {
    canonical: "https://cookpilot.pro/es/comparativas",
    languages: {
      "es": "https://cookpilot.pro/es/comparativas",
      "en": "https://cookpilot.pro/en/compare",
    },
  },
};

export default function Page() {
  return <ComparativasPageContent content={comparativasContent.es} />;
}
