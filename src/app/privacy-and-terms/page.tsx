import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import PrivacyAndTermsPage from "@/features/legal/PrivacyAndTermsPage";
import { createUtilityMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createUtilityMetadata("privacyAndTerms");

async function readPolicyFile(fileName: string) {
  return readFile(
    join(process.cwd(), "src", "features", "legal", "content", fileName),
    "utf8",
  );
}

export default async function PrivacyAndTermsRoute() {
  const [spanishPolicy, englishPolicy] = await Promise.all([
    readPolicyFile("privacy.es.md"),
    readPolicyFile("privacy.en.md"),
  ]);

  return (
    <main>
      <PrivacyAndTermsPage
        documents={{
          es: spanishPolicy,
          en: englishPolicy,
        }}
      />
    </main>
  );
}

