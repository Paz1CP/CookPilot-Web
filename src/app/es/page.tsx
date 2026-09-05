import type { Metadata } from "next";
import HomePageContent from "@/features/home/HomePageContent";
import { createLocalizedMetadata } from "@/shared/config/metadata";
import LandingGalleryPreview from "@/features/gallery/LandingGalleryPreview";

export const metadata: Metadata = createLocalizedMetadata("home", "es");

export default function Page() {
  return <HomePageContent heroAfter={<LandingGalleryPreview locale="es" />} />;
}
