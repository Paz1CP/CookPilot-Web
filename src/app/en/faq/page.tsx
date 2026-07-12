import type { Metadata } from "next";
import { faqContent } from "@/content/faq";
import FaqPageContent from "@/features/faq/FaqPageContent";
import { createLocalizedMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createLocalizedMetadata("faq", "en");

export default function Page() {
  return <FaqPageContent content={faqContent.en} />;
}

