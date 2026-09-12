"use client";

import { useRef } from "react";
import { useArrivalReveal } from "./hooks/useArrivalReveal";
import FilmScreen from "./screens/FilmScreen";
import MenuStoryScreen from "./screens/MenuStoryScreen";
import WeeklyPlanScreen from "./screens/WeeklyPlanScreen";
import ShoppingListScreen from "./screens/ShoppingListScreen";
import GuidedCookingScreen from "./screens/GuidedCookingScreen";
import SavedRecipesScreen from "./screens/SavedRecipesScreen";
import DownloadScreen from "./screens/DownloadScreen";
import DiscoveryScreen from "./screens/DiscoveryScreen";
import ProComparisonScreen from "./screens/ProComparisonScreen";
import BrandFooter from "./screens/BrandFooter";
import "./styles/film.css";
import "./styles/landing.css";

export default function LandingPage() {
  const continuation = useRef<HTMLDivElement>(null);
  useArrivalReveal(continuation);

  return (
    <main className="cp-landing">
      <FilmScreen />
      <div className="lc" ref={continuation}>
        <MenuStoryScreen />
        <WeeklyPlanScreen />
        <ShoppingListScreen />
        <GuidedCookingScreen />
        <SavedRecipesScreen />
        <DownloadScreen />
        <DiscoveryScreen />
        <ProComparisonScreen />
        <BrandFooter />
      </div>
    </main>
  );
}
