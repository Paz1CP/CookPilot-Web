import type { Metadata } from "next";
import { comparativasContent } from "@/content/comparativas";
import ComparativasPageContent from "@/features/compare/ComparativasPageContent";
import { createLocalizedMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createLocalizedMetadata("compare", "es");

export default function Page() {
  return <ComparativasPageContent content={comparativasContent.es} />;
}

