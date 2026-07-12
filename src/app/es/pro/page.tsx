import type { Metadata } from "next";
import { proContent } from "@/content/pro";
import ProPageContent from "@/features/pro/ProPageContent";
import { createLocalizedMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createLocalizedMetadata("pro", "es");

export default function Page() {
  return <ProPageContent content={proContent.es} />;
}

