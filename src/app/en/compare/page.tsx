import type { Metadata } from "next";
import { comparativasContent } from "@/content/comparativas";
import ComparativasPageContent from "@/features/compare/ComparativasPageContent";

export const metadata: Metadata = {
  title: "Compare | CookPilot",
  description: "Compare how your daily food is organized using CookPilot versus recipe apps, meal planners, macro trackers, notes, and delivery.",
  alternates: {
    canonical: "https://cookpilot.pro/en/compare",
    languages: {
      "es": "https://cookpilot.pro/es/comparativas",
      "en": "https://cookpilot.pro/en/compare",
    },
  },
};

export default function Page() {
  return <ComparativasPageContent content={comparativasContent.en} />;
}
