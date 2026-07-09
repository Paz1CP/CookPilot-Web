import type { Metadata } from "next";
import { proContent } from "@/content/pro";
import ProPageContent from "@/components/ProPageContent";

export const metadata: Metadata = {
  title: "Pro | CookPilot",
  description: "Unlock the complete CookPilot system to plan, adjust, shop, and cook on a recurring basis.",
  alternates: {
    canonical: "https://cookpilot.pro/en/pro",
    languages: {
      "es": "https://cookpilot.pro/es/pro",
      "en": "https://cookpilot.pro/en/pro",
    },
  },
};

export default function Page() {
  return <ProPageContent content={proContent.en} />;
}
