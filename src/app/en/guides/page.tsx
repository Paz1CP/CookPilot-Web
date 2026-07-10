import type { Metadata } from "next";
import { Suspense } from "react";
import { guiasContent } from "@/content/guias";
import GuiasContent from "@/components/GuiasContent";

export const metadata: Metadata = {
  title: "Guides | CookPilot",
  description: "Learn how to master CookPilot step by step: planning, shopping, nutrition, guided cooking, import, and reuse.",
  alternates: {
    canonical: "https://cookpilot.pro/en/guides",
    languages: {
      "es": "https://cookpilot.pro/es/guias",
      "en": "https://cookpilot.pro/en/guides",
    },
  },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuiasContent content={guiasContent.en} />
    </Suspense>
  );
}
