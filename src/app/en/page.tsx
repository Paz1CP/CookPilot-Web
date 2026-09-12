import type { Metadata } from "next";
import LandingPage from "@/features/landing/LandingPage";
import { createLocalizedMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createLocalizedMetadata("home", "en");

export default function Page() {
  return <LandingPage />;
}
