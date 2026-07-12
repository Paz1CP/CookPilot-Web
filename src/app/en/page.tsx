import type { Metadata } from "next";
import HomePageContent from "@/features/home/HomePageContent";
import { createLocalizedMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createLocalizedMetadata("home", "en");

export default function Page() {
  return <HomePageContent />;
}

