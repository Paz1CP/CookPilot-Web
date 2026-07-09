import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import PrivacyAndTermsPage from "./PrivacyAndTermsPage";

const SITE_URL = "https://cookpilot.pro";

export const metadata: Metadata = {
  title: "Privacy & Terms | CookPilot",
  description:
    "CookPilot privacy policy, terms, account deletion details, data rights, AI processing, subscriptions, and contact information.",
  alternates: {
    canonical: "/privacy-and-terms",
    languages: {
      "es-PE": "/privacy-and-terms",
      "en-US": "/privacy-and-terms",
    },
  },
  openGraph: {
    title: "Privacy & Terms | CookPilot",
    description:
      "Privacy, terms, data processing, account deletion, AI providers, subscriptions, and user rights for CookPilot.",
    url: `${SITE_URL}/privacy-and-terms`,
    siteName: "CookPilot",
    locale: "es_PE",
    alternateLocale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Privacy & Terms | CookPilot",
    description:
      "Privacy, terms, account deletion, subscriptions, AI processing, and data rights for CookPilot.",
  },
};

async function readPolicyFile(fileName: string) {
  return readFile(
    join(process.cwd(), "src", "app", "privacy-and-terms", "content", fileName),
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
