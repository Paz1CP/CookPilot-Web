"use client";
/* eslint-disable @next/next/no-img-element -- public media is validated against the Cloudflare host */

import { useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { AppLocale } from "@/shared/config/routes";
import type { CookShareResolvedObject } from "@/lib/cookshare/types";
import { extractMediaUrl, mediaUrl } from "@/lib/cookshare/media";
import { formatCookShareQuantity } from "@/lib/cookshare/quantity-format";
import { getTranslations } from "@/lib/i18n";
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
  const preferred = locale === "en" ? [keys[1], keys[0]] : keys;
  return preferred.map((key) => textValue(value[key])).find(Boolean) ?? getTranslations(locale).public_object.list.default_ingredient;
}

function localizedOptional(value: PublicRecord, locale: AppLocale, keys: [string, string]): string | null {
  const preferred = locale === "en" ? [keys[1], keys[0]] : keys;
  return preferred.map((key) => textValue(value[key])).find(Boolean) ?? null;
}

function recipeKey(value: PublicRecord, index: number): string {
  return textValue(value.key) ?? `recipe-${index}-${textValue(value.title) ?? "item"}`;
}

type RecipeCard = {
  key: string;
  title: string;
  image: string | null;
  items: PublicRecord[];
  menuKey?: string;
};

function recipeCards(value: unknown, locale: AppLocale): RecipeCard[] {
  return records(value).flatMap((group, groupIndex) => {
    const nested = records(group.recipes);
    const groupItems = records(group.items);
    if (nested.length) {
      return nested.map((recipe, recipeIndex) => ({
        key: recipeKey(recipe, groupIndex * 100 + recipeIndex),
        title: localizedText(recipe, locale, ["title", "title_en"]),
        image: extractMediaUrl(recipe) ?? (Array.isArray(group.image_urls) ? mediaUrl(group.image_urls[recipeIndex]) : null) ?? extractMediaUrl(group),
        items: records(recipe.items).length || nested.length === 1 ? records(recipe.items).length ? records(recipe.items) : groupItems : groupItems,
      }));
    }
    const image = extractMediaUrl(group);
    const title = localizedText(group, locale, ["title", "title_en"]);
    return [{ key: recipeKey(group, groupIndex), title, image, items: groupItems }];
  }).sort((a, b) => a.title.localeCompare(b.title, locale, { sensitivity: "base" }))
    .filter((card, index, cards) => cards.findIndex((candidate) => `${candidate.title.toLocaleLowerCase()}|${candidate.image ?? ""}` === `${card.title.toLocaleLowerCase()}|${card.image ?? ""}`) === index);
}

function categoryFor(item: PublicRecord, locale: AppLocale): { key: string; title: string; icon: string | null } {
  const category = item.category && typeof item.category === "object" && !Array.isArray(item.category)
    ? item.category as PublicRecord
    : null;
  const title = category ? localizedText(category, locale, ["name", "name_en"]) : getTranslations(locale).public_object.list.other;
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
    .sort((a, b) => a.title.localeCompare(b.title, locale, { sensitivity: "base" }))
    .map((category) => ({
      ...category,
      items: [...category.items].sort((a, b) => localizedText(a, locale, ["name", "name_en"]).localeCompare(localizedText(b, locale, ["name", "name_en"]), locale, { sensitivity: "base" })),
    }));
}

function mergedItems(items: PublicRecord[]): PublicRecord[] {
  const merged = new Map<string, PublicRecord>();
  for (const item of items) {
    const name = textValue(item.name) ?? textValue(item.name_en) ?? "ingredient";
    const unit = textValue(item.unit) ?? "";
    const category = item.category && typeof item.category === "object" && !Array.isArray(item.category)
      ? textValue((item.category as PublicRecord).name) ?? "other"
      : "other";
    const key = `${name.toLocaleLowerCase()}|${unit.toLocaleLowerCase()}|${category.toLocaleLowerCase()}`;
    const quantity = typeof item.quantity === "number" ? item.quantity : Number(item.quantity);
    const current = merged.get(key);
    if (!current) {
      merged.set(key, { ...item, quantity: Number.isFinite(quantity) ? quantity : 0 });
      continue;
    }
    const currentQuantity = typeof current.quantity === "number" ? current.quantity : Number(current.quantity);
    current.quantity = (Number.isFinite(currentQuantity) ? currentQuantity : 0) + (Number.isFinite(quantity) ? quantity : 0);
  }
  return [...merged.values()];
}

type MenuSection = {
  key: string;
  title: string;
  cards: RecipeCard[];
  items: PublicRecord[];
};

function menuSections(groups: PublicRecord[], locale: AppLocale): MenuSection[] {
  const sections = new Map<string, MenuSection>();
  groups.forEach((group, index) => {
    const key = textValue(group.menu_key) ?? `menu-${index}`;
    const title = localizedOptional(group, locale, ["menu_title", "menu_title_en"])
      ?? localizedText(group, locale, ["title", "title_en"]);
    const cards = recipeCards([group], locale).map((card) => ({ ...card, menuKey: key }));
    const current = sections.get(key) ?? { key, title, cards: [], items: [] };
    current.cards.push(...cards);
    current.items.push(...records(group.items));
    sections.set(key, current);
  });
  return [...sections.values()].map((section) => ({
    ...section,
    cards: section.cards.filter((card, index, cards) => cards.findIndex((candidate) => candidate.key === card.key) === index),
    items: mergedItems(section.items),
  }));
}

function RecipeRail({
  cards,
  selectedKey,
  includeAll,
  allActive,
  onSelect,
  locale,
}: {
  cards: RecipeCard[];
  selectedKey: string | null;
  includeAll?: boolean;
  allActive?: boolean;
  onSelect: (key: string | null) => void;
  locale: AppLocale;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ pointerId: -1, startX: 0, startScrollLeft: 0, moved: false, suppressClick: false });
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rail = railRef.current;
    if (!rail) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: rail.scrollLeft, moved: false, suppressClick: false };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    const rail = railRef.current;
    if (!rail || state.pointerId !== event.pointerId) return;
    const distance = event.clientX - state.startX;
    if (Math.abs(distance) > 6) state.moved = true;
    if (state.moved) {
      event.preventDefault();
      rail.scrollLeft = state.startScrollLeft - distance;
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (state.pointerId !== event.pointerId) return;
    state.suppressClick = state.moved;
    state.pointerId = -1;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current.suppressClick = false;
  };

  const copy = getTranslations(locale);

  return (
    <div
      ref={railRef}
      className={`${styles.listRecipeRail} ${dragging ? styles.listRecipeRailDragging : ""}`}
      aria-label={copy.public_object.list.recipes_aria}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClickCapture={handleClickCapture}
    >
      {includeAll ? (
        <button type="button" className={`${styles.listRecipeButton} ${styles.listRecipeButtonAll} ${allActive ? styles.listRecipeButtonActive : ""}`} aria-pressed={allActive} onClick={() => onSelect(null)}>
          <span className={styles.listRecipeAll}>{copy.public_object.list.all}</span>
        </button>
      ) : null}
      {cards.map((card, index) => (
        <button key={card.key} type="button" className={`${styles.listRecipeButton} ${selectedKey === card.key ? styles.listRecipeButtonActive : ""}`} aria-pressed={selectedKey === card.key} onClick={() => onSelect(card.key)}>
          {card.image ? <img src={card.image} alt="" loading={index === 0 ? "eager" : "lazy"} decoding="async" draggable="false" className={styles.listRecipeImage} /> : <span className={styles.listRecipeImageFallback} aria-hidden="true" />}
          <span className={styles.listRecipeTitle}>{card.title}</span>
        </button>
      ))}
    </div>
  );
}

function IngredientRows({ items, locale }: { items: PublicRecord[]; locale: AppLocale }) {
  const copy = getTranslations(locale);
  if (!items.length) {
    return <p className={styles.muted}>{copy.public_object.list.no_ingredients}</p>;
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
  const copy = getTranslations(locale);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showAllMenus, setShowAllMenus] = useState(false);
  const groups = useMemo(() => records(object.recipe_groups).length ? records(object.recipe_groups) : records(object.groups), [object.groups, object.recipe_groups]);
  const cards = useMemo(() => recipeCards(groups, locale), [groups, locale]);
  const flatItems = useMemo(() => records(object.items), [object.items]);
  const mode = textValue(object.mode) ?? "all";
  const menus = useMemo(() => menuSections(groups, locale), [groups, locale]);
  const selected = selectedKey ? cards.find((card) => card.key === selectedKey) ?? null : null;
  const allItems = flatItems.length ? flatItems : mergedItems(groups.flatMap((group) => records(group.items)));

  if (mode === "menus") {
    return (
      <section className={styles.components} aria-label={copy.public_object.list.organized_by_menus_aria}>
        <div className={styles.listMenuControls}>
          <button type="button" className={`${styles.listMenuAllButton} ${showAllMenus ? styles.listMenuAllButtonActive : ""}`} aria-pressed={showAllMenus} onClick={() => { setShowAllMenus(true); setSelectedKey(null); }}>
            {copy.public_object.list.all}
          </button>
        </div>
        {showAllMenus ? (
          <>
            <div className={styles.sectionHeading}>
              <h2 id="list-content-title">{copy.public_object.sections.ingredients}</h2>
            </div>
            <IngredientRows items={allItems} locale={locale} />
          </>
        ) : selected ? (
          <article className={styles.listMenuSection}>
            <div className={styles.sectionHeading}>
              <h2>{selected.title}</h2>
            </div>
            <div className={styles.sectionHeading}>
              <h2>{copy.public_object.sections.ingredients}</h2>
            </div>
            <IngredientRows items={selected.items} locale={locale} />
          </article>
        ) : (
          <div className={styles.listMenuSections}>
            {menus.map((menu) => (
              <article key={menu.key} className={styles.listMenuSection}>
                <div className={styles.sectionHeading}>
                  <h2>{menu.title}</h2>
                </div>
                {menu.cards.length ? <RecipeRail cards={menu.cards} selectedKey={selectedKey} onSelect={(key) => { setSelectedKey(key); setShowAllMenus(false); }} locale={locale} /> : null}
                <div className={styles.sectionHeading}>
                  <h2>{copy.public_object.sections.ingredients}</h2>
                </div>
                <IngredientRows items={menu.items} locale={locale} />
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  const visibleItems = selected ? selected.items : allItems;

  return (
    <section className={styles.components} aria-labelledby="list-content-title">
      {cards.length ? (
        <RecipeRail cards={cards} selectedKey={selectedKey} allActive={selectedKey === null} onSelect={setSelectedKey} includeAll locale={locale} />
      ) : null}
      <div className={styles.sectionHeading}>
        <h2 id="list-content-title">{copy.public_object.sections.ingredients}</h2>
      </div>
      <IngredientRows items={visibleItems} locale={locale} />
    </section>
  );
}
