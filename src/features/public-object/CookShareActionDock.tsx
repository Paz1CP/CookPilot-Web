"use client";

import {
  Activity,
  CalendarAdd,
  CalendarTick,
  Discover,
  Edit2,
  Magicpen,
  People,
  Play,
  Repeat,
  Save2,
  ScanBarcode,
  SearchFavorite,
  ShoppingCart,
  TaskSquare,
} from "iconsax-reactjs";
import type { Icon } from "iconsax-reactjs";
import { useEffect, useState } from "react";
import { useLocale } from "@/contexts/LanguageContext";
import type { CookShareObjectType } from "@/lib/cookshare/types";
import { DownloadButton, type DownloadDialogContext } from "@/shared/download/DownloadExperience";
import { useLiquidGlass } from "@/shared/ui/useLiquidGlass";
import styles from "./CookShareActionDock.module.css";

type ActionKey =
  | "create_version"
  | "cook_now"
  | "add_to_plan"
  | "add_to_shopping"
  | "adjust_goals"
  | "cook_menu"
  | "buy_menu"
  | "adjust_servings"
  | "use_day"
  | "edit_meals"
  | "buy_day"
  | "save_day"
  | "adapt_day"
  | "use_week"
  | "repeat_week"
  | "buy_week"
  | "save_template"
  | "adapt_week"
  | "use_list"
  | "add_all_to_shopping"
  | "adjust_quantities"
  | "scan_shopping"
  | "recipes_with_ingredient"
  | "explore_in_cookpilot";

type ActionDefinition = {
  key: ActionKey;
  icon: Icon;
  featured?: boolean;
};

const ACTIONS: Partial<Record<CookShareObjectType, readonly ActionDefinition[]>> = {
  recipe: [
    { key: "create_version", icon: Magicpen, featured: true },
    { key: "cook_now", icon: Play },
    { key: "add_to_plan", icon: CalendarAdd },
    { key: "add_to_shopping", icon: ShoppingCart },
    { key: "adjust_goals", icon: Activity },
  ],
  menu: [
    { key: "cook_menu", icon: Play, featured: true },
    { key: "add_to_plan", icon: CalendarAdd },
    { key: "buy_menu", icon: ShoppingCart },
    { key: "adjust_servings", icon: People },
    { key: "adjust_goals", icon: Activity },
  ],
  day: [
    { key: "use_day", icon: CalendarTick },
    { key: "edit_meals", icon: Edit2 },
    { key: "buy_day", icon: ShoppingCart },
    { key: "save_day", icon: Save2 },
    { key: "adapt_day", icon: Magicpen, featured: true },
  ],
  week: [
    { key: "use_week", icon: CalendarTick },
    { key: "repeat_week", icon: Repeat },
    { key: "buy_week", icon: ShoppingCart },
    { key: "save_template", icon: Save2 },
    { key: "adapt_week", icon: Magicpen, featured: true },
  ],
  list: [
    { key: "use_list", icon: TaskSquare },
    { key: "add_all_to_shopping", icon: ShoppingCart },
    { key: "adjust_quantities", icon: Edit2 },
    { key: "scan_shopping", icon: ScanBarcode, featured: true },
  ],
  ingredient: [
    { key: "recipes_with_ingredient", icon: SearchFavorite, featured: true },
    { key: "add_to_shopping", icon: ShoppingCart },
    { key: "explore_in_cookpilot", icon: Discover },
  ],
};

type ActionCopy = DownloadDialogContext & { label: string };

function copyFor(
  translations: unknown,
  objectType: CookShareObjectType,
  key: ActionKey,
) {
  const groups = translations as Record<string, Record<string, ActionCopy>>;
  return groups[objectType]?.[key] ?? null;
}

export default function CookShareActionDock({
  objectType,
  path,
}: {
  objectType: CookShareObjectType;
  path: string;
}) {
  const { t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const liquidGlass = useLiquidGlass<HTMLElement>();
  const definitions = ACTIONS[objectType] ?? [];

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 40);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  if (!definitions.length) return null;

  return (
    <>
    {liquidGlass.filter}
    <nav
      ref={liquidGlass.ref}
      className={`cp-appbar-glass ${scrolled ? "cp-appbar-glass--scrolled" : ""} ${styles.dock}`}
      aria-label={t.cookshare_action_dock.navigation_label}
      style={liquidGlass.style}
    >
      {definitions.map(({ key, icon: ActionIcon, featured }) => {
        const copy = copyFor(t.cookshare_action_dock, objectType, key);
        if (!copy) return null;
        return (
          <DownloadButton
            key={key}
            className={`${styles.action} ${featured ? styles.featured : ""}`}
            cookSharePath={path}
            downloadContext={{ title: copy.title, description: copy.description }}
            aria-label={copy.label}
            title={copy.label}
          >
            <ActionIcon size={20} variant="Outline" aria-hidden="true" />
            <span className={styles.label}>{copy.label}</span>
          </DownloadButton>
        );
      })}
    </nav>
    </>
  );
}
