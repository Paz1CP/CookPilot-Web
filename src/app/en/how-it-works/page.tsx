import type { Metadata } from "next";
import { comoFuncionaContent } from "@/content/comoFunciona";
import HowItWorksContent from "@/components/HowItWorksContent";

export const metadata: Metadata = {
  title: "How it works | CookPilot",
  description: "CookPilot connects planning, shopping, nutrition, guided cooking, and reuse in a single system.",
  alternates: {
    canonical: "https://cookpilot.pro/en/how-it-works",
    languages: {
      es: "https://cookpilot.pro/es/como-funciona",
      en: "https://cookpilot.pro/en/how-it-works",
    },
  },
};

export default function Page() {
  return <HowItWorksContent content={comoFuncionaContent.en} />;
}
