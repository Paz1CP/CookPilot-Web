import type { Metadata } from "next";
import { faqContent } from "@/content/faq";
import FaqPageContent from "@/features/faq/FaqPageContent";

export const metadata: Metadata = {
  title: "FAQ | CookPilot",
  description: "Clear answers about menu planning, grocery shopping, nutrition macros, imports, and Pro plans in CookPilot.",
  alternates: {
    canonical: "https://cookpilot.pro/en/faq",
    languages: {
      "es": "https://cookpilot.pro/es/faq",
      "en": "https://cookpilot.pro/en/faq",
    },
  },
};

export default function Page() {
  return <FaqPageContent content={faqContent.en} />;
}
