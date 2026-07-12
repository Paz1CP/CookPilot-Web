import type { Metadata } from "next";
import { Suspense } from "react";
import { guiasContent } from "@/content/guias";
import GuiasContent from "@/features/guides/GuiasContent";
import { createLocalizedMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createLocalizedMetadata("guides", "es");

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuiasContent content={guiasContent.es} />
    </Suspense>
  );
}

