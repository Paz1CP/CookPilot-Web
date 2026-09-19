"use client";

import {
  Activity,
  CalendarAdd,
  CalendarTick,
  Magicpen,
  People,
  Play,
  Save2,
  ScanBarcode,
  SearchFavorite,
  ShoppingCart,
  TaskSquare,
} from "iconsax-reactjs";
import type { Icon } from "iconsax-reactjs";
import { useEffect, useState } from "react";
import { useLocale } from "@/contexts/LanguageContext";
import { emptyGalleryFilters, galleryIncludeIngredientsHash, galleryUrl } from "@/lib/cookshare/gallery-query";
import type { CookShareObjectType } from "@/lib/cookshare/types";
import { getLocalizedRoute, type AppLocale } from "@/shared/config/routes";
import { DownloadButton, type DownloadDialogContext } from "@/shared/download/DownloadExperience";
import type { CookShareAppAction } from "@/shared/download/cookshare-install-links";
import { useLiquidGlass } from "@/shared/ui/useLiquidGlass";
import styles from "./CookShareActionDock.module.css";

type ActionKey =
  | "create_version"
  | "cook_now"
  | "add_to_plan"
  | "add_to_shopping"
  | "adjust_goals"
  | "cook_menu"
  | "save_menu"
  | "buy_menu"
  | "adjust_servings"
  | "use_day"
  | "save_day"
  | "adapt_day"
  | "use_week"
  | "save_week"
  | "adapt_week"
  | "use_list"
  | "scan_shopping"
  | "recipes_with_ingredient";

const RECIPE_APP_ACTIONS: Partial<Record<ActionKey, CookShareAppAction>> = {
  create_version: "remix",
  cook_now: "cook",
  add_to_plan: "plan",
  add_to_shopping: "list",
  adjust_goals: "fit",
};

const APP_ACTIONS: Partial<
  Record<CookShareObjectType, Partial<Record<ActionKey, CookShareAppAction>>>
> = {
  recipe: RECIPE_APP_ACTIONS,
  menu: {
    cook_menu: "cook",
    save_menu: "save",
    buy_menu: "list",
    adjust_servings: "view",
    adjust_goals: "fit",
  },
  day: {
    use_day: "plan",
    save_day: "save",
    adapt_day: "fit",
  },
  week: {
    use_week: "plan",
    save_week: "save",
    adapt_week: "fit",
  },
  list: {
    use_list: "list",
    scan_shopping: "scan",
  },
};

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
    { key: "save_menu", icon: Save2 },
    { key: "buy_menu", icon: ShoppingCart },
    { key: "adjust_servings", icon: People },
    { key: "adjust_goals", icon: Activity },
  ],
  day: [
    { key: "use_day", icon: CalendarTick },
    { key: "save_day", icon: Save2 },
    { key: "adapt_day", icon: Magicpen, featured: true },
  ],
  week: [
    { key: "use_week", icon: CalendarTick },
    { key: "save_week", icon: Save2 },
    { key: "adapt_week", icon: Magicpen, featured: true },
  ],
  list: [
    { key: "use_list", icon: TaskSquare },
    { key: "scan_shopping", icon: ScanBarcode, featured: true },
  ],
  ingredient: [
    { key: "recipes_with_ingredient", icon: SearchFavorite, featured: true },
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

function ingredientRecipesHref(path: string, locale: AppLocale) {
  const rawSlug = path.split("?")[0].split("/").filter(Boolean).at(-1) ?? "";
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    // Keep the route segment; the public gallery applies its own validation.
  }
  const filters = emptyGalleryFilters();
  if (slug) filters.ingredients_include = [slug];
  const galleryPath = getLocalizedRoute(locale, "gallery");
  return `${galleryUrl(galleryPath, {
    locale,
    q: "",
    type: "recipes",
    handle: null,
    cursor: null,
    filters,
  })}${galleryIncludeIngredientsHash}`;
}

export default function CookShareActionDock({
  objectType,
  path,
}: {
  objectType: CookShareObjectType;
  path: string;
}) {
  const { locale, t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const { targetRef, style: glassStyle, filter: glassFilter } = useLiquidGlass<HTMLElement>();
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
    {glassFilter}
    <nav
      ref={targetRef}
      className={`cp-appbar-glass ${scrolled ? "cp-appbar-glass--scrolled" : ""} ${styles.dock}`}
      aria-label={t.cookshare_action_dock.navigation_label}
      style={glassStyle}
    >
      {definitions.map(({ key, icon: ActionIcon, featured }) => {
        const copy = copyFor(t.cookshare_action_dock, objectType, key);
        if (!copy) return null;
        if (objectType === "ingredient" && key === "recipes_with_ingredient") {
          return (
            <a
              key={key}
              className={`${styles.action} ${featured ? styles.featured : ""}`}
              href={ingredientRecipesHref(path, locale)}
              aria-label={copy.label}
              title={copy.label}
            >
              <ActionIcon size={20} variant="Outline" aria-hidden="true" />
              <span className={styles.label}>{copy.label}</span>
            </a>
          );
        }
        return (
          <DownloadButton
            key={key}
            className={`${styles.action} ${featured ? styles.featured : ""}`}
            cookSharePath={path}
            appAction={APP_ACTIONS[objectType]?.[key]}
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
