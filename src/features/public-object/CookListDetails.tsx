"use client";
/* eslint-disable @next/next/no-img-element -- public media is validated against the Cloudflare host */

import { useMemo, useState } from "react";
import type { AppLocale } from "@/shared/config/routes";
import type { CookShareResolvedObject } from "@/lib/cookshare/types";
import { mediaUrl } from "@/lib/cookshare/media";
import { formatCookShareQuantity } from "@/lib/cookshare/quantity-format";
import styles from "./PublicObjectRenderer.module.css";

type PublicRecord = Record<string, unknown>;

function records(value: unknown): PublicRecord[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is PublicRecord => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry))
    : [];
}

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function localizedText(value: PublicRecord, locale: AppLocale, keys: [string, string]): string {
  const preferred = locale === "en" ? keys : [keys[1], keys[0]];
  return preferred.map((key) => textValue(value[key])).find(Boolean) ?? (locale === "es" ? "Ingrediente" : "Ingredient");
}

function recipeKey(value: PublicRecord, index: number): string {
  return textValue(value.key) ?? `recipe-${index}-${textValue(value.title) ?? "item"}`;
}

type RecipeCard = {
  key: string;
  title: string;
  image: string | null;
  items: PublicRecord[];
};

function recipeCards(value: unknown, locale: AppLocale): RecipeCard[] {
  return records(value).flatMap((group, groupIndex) => {
    const nested = records(group.recipes);
    const groupItems = records(group.items);
    if (nested.length) {
      return nested.map((recipe, recipeIndex) => ({
        key: recipeKey(recipe, groupIndex * 100 + recipeIndex),
        title: localizedText(recipe, locale, ["title", "title_en"]),
        image: mediaUrl(recipe.image_url ?? recipe.cover_photo_url ?? (Array.isArray(group.image_urls) ? group.image_urls[recipeIndex] : null)),
        items: records(recipe.items).length || nested.length === 1 ? records(recipe.items).length ? records(recipe.items) : groupItems : groupItems,
      }));
    }
    const image = mediaUrl(group.image_url ?? group.cover_photo_url ?? (Array.isArray(group.image_urls) ? group.image_urls[0] : null));
    const title = localizedText(group, locale, ["title", "title_en"]);
    return [{ key: recipeKey(group, groupIndex), title, image, items: groupItems }];
  }).sort((a, b) => a.title.localeCompare(b.title, locale === "es" ? "es" : "en", { sensitivity: "base" }))
    .filter((card, index, cards) => cards.findIndex((candidate) => `${candidate.title.toLocaleLowerCase()}|${candidate.image ?? ""}` === `${card.title.toLocaleLowerCase()}|${card.image ?? ""}`) === index);
}

function categoryFor(item: PublicRecord, locale: AppLocale): { key: string; title: string; icon: string | null } {
  const category = item.category && typeof item.category === "object" && !Array.isArray(item.category)
    ? item.category as PublicRecord
    : null;
  const title = category ? localizedText(category, locale, ["name", "name_en"]) : (locale === "es" ? "Otros" : "Other");
  const icon = category ? mediaUrl(category.icon_url) : null;
  return { key: `${title.toLocaleLowerCase()}|${icon ?? ""}`, title, icon };
}

function groupedItems(items: PublicRecord[], locale: AppLocale) {
  const byCategory = new Map<string, { title: string; icon: string | null; items: PublicRecord[] }>();
  for (const item of items) {
    const category = categoryFor(item, locale);
    const current = byCategory.get(category.key) ?? { title: category.title, icon: category.icon, items: [] };
    current.items.push(item);
    byCategory.set(category.key, current);
  }
  return [...byCategory.values()]
    .sort((a, b) => a.title.localeCompare(b.title, locale === "es" ? "es" : "en", { sensitivity: "base" }))
    .map((category) => ({
      ...category,
      items: [...category.items].sort((a, b) => localizedText(a, locale, ["name", "name_en"]).localeCompare(localizedText(b, locale, ["name", "name_en"]), locale === "es" ? "es" : "en", { sensitivity: "base" })),
    }));
}

function IngredientRows({ items, locale }: { items: PublicRecord[]; locale: AppLocale }) {
  if (!items.length) {
    return <p className={styles.muted}>{locale === "es" ? "No hay ingredientes en esta lista." : "This list has no ingredients."}</p>;
  }
  return (
    <div className={styles.listCategoryGroups}>
      {groupedItems(items, locale).map((category) => (
        <section key={`${category.title}-${category.icon ?? "none"}`} className={styles.listCategory}>
          <div className={styles.listCategoryHeading}>
            {category.icon ? <img src={category.icon} alt="" loading="lazy" decoding="async" className={styles.listCategoryIcon} /> : null}
            <h3>{category.title}</h3>
          </div>
          <ul className={styles.ingredientList}>
            {category.items.map((item, index) => {
              const label = localizedText(item, locale, ["name", "name_en"]);
              const amount = formatCookShareQuantity(item.quantity, item.unit, locale);
              return (
                <li key={`${label}-${index}`}>
                  <strong>{label}</strong>
                  {amount ? <span>{amount}</span> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function CookListDetails({ object, locale }: { object: CookShareResolvedObject; locale: AppLocale }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const groups = useMemo(() => records(object.recipe_groups).length ? records(object.recipe_groups) : records(object.groups), [object.groups, object.recipe_groups]);
  const cards = useMemo(() => recipeCards(groups, locale), [groups, locale]);
  const flatItems = useMemo(() => records(object.items), [object.items]);
  const selected = selectedKey ? cards.find((card) => card.key === selectedKey) ?? null : null;
  const visibleItems = selected ? selected.items : flatItems;

  return (
    <section className={styles.components} aria-labelledby="list-content-title">
      {cards.length ? (
        <div className={styles.listRecipeRail} aria-label={locale === "es" ? "Recetas de esta lista" : "Recipes in this list"}>
          <button type="button" className={`${styles.listRecipeButton} ${selectedKey === null ? styles.listRecipeButtonActive : ""}`} aria-pressed={selectedKey === null} onClick={() => setSelectedKey(null)}>
            <span className={styles.listRecipeAll}>{locale === "es" ? "Todos" : "All"}</span>
          </button>
          {cards.map((card, index) => (
            <button key={card.key} type="button" className={`${styles.listRecipeButton} ${selectedKey === card.key ? styles.listRecipeButtonActive : ""}`} aria-pressed={selectedKey === card.key} onClick={() => setSelectedKey(card.key)}>
              {card.image ? <img src={card.image} alt="" loading={index === 0 ? "eager" : "lazy"} decoding="async" className={styles.listRecipeImage} /> : <span className={styles.listRecipeImageFallback} aria-hidden="true" />}
              <span className={styles.listRecipeTitle}>{card.title}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.sectionHeading}>
        <h2 id="list-content-title">{locale === "es" ? "Ingredientes" : "Ingredients"}</h2>
      </div>
      <IngredientRows items={visibleItems} locale={locale} />
    </section>
  );
}
