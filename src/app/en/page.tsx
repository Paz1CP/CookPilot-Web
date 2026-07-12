import type { Metadata } from "next";
import HomePageContent from "@/features/home/HomePageContent";

export const metadata: Metadata = {
  title: "CookPilot — Organize your kitchen, shopping and nutrition",
  description:
    "Plan menus, organize purchases, adjust nutrition, import recipes and cook step by step with CookPilot.",
  alternates: {
    canonical: "/en",
    languages: {
      "es-PE": "/es",
      "en-US": "/en",
    },
  },
};

export default function Page() {
  return <HomePageContent />;
}
