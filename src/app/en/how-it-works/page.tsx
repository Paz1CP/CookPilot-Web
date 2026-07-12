import type { Metadata } from "next";
import { comoFuncionaContent } from "@/content/comoFunciona";
import HowItWorksContent from "@/features/how-it-works/HowItWorksContent";
import { createLocalizedMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createLocalizedMetadata("howItWorks", "en");

export default function Page() {
  return <HowItWorksContent content={comoFuncionaContent.en} />;
}

