"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/contexts/LanguageContext";
import { Check } from "../components/LandingIcons";
import FoodImage from "../components/FoodImage";
import { landingAssets } from "../data/landing-assets";

type Ingredient = {
  name: string;
  quantity: string;
  referencePrice: string;
  estimatedCost: string;
  sources: string[];
};

export default function ShoppingListScreen() {
  const copy = useLocale().t.landing.shopping;
  const itemsByCategory = copy.items as Record<string, Ingredient[]>;
  const [category, setCategory] = useState(copy.all);
  const [checked, setChecked] = useState<string[]>([]);
  const [focusedIngredient, setFocusedIngredient] = useState(copy.initialIngredient);
  const listTabs = useMemo(
    () => [{ name: copy.all, count: 26 }, ...copy.categories],
    [copy],
  );
  const allItems = useMemo(() => Object.values(itemsByCategory).flat(), [itemsByCategory]);
  const listItems = category === copy.all ? allItems : itemsByCategory[category] ?? allItems;
  const selectedItem = allItems.find((item) => item.name === focusedIngredient) ?? listItems[0];

  return (
    <section className="lc-shopping lc-wrap" id="your-list" aria-labelledby="lc-list-title">
      <div className="lc-list-surface" data-lc-reveal>
        <header>
          <span className="lc-small-brand">{copy.brandCook}<span>{copy.brandPilot}</span></span>
          <strong className="lc-list-total">{copy.total}</strong>
        </header>
        <div className="lc-categories" role="tablist" aria-label={copy.categoriesAria}>
          {listTabs.map((item) => (
            <button
              key={item.name}
              role="tab"
              aria-selected={category === item.name}
              onClick={() => {
                setCategory(item.name);
                setFocusedIngredient(item.name === copy.all ? copy.initialIngredient : itemsByCategory[item.name][0].name);
              }}
            >
              {item.name} <span>{item.count}</span>
            </button>
          ))}
        </div>
        <div className="lc-ingredient-rows" role="tabpanel" aria-label={`${category} ${copy.ingredientsSuffix}`}>
          {listItems.map((item) => {
            const isChecked = checked.includes(item.name);
            return (
              <button
                className={`lc-ingredient ${isChecked ? "is-done" : ""}`}
                key={item.name}
                role="checkbox"
                aria-checked={isChecked}
                onMouseEnter={() => setFocusedIngredient(item.name)}
                onFocus={() => setFocusedIngredient(item.name)}
                onClick={() => setChecked((old) => old.includes(item.name) ? old.filter((name) => name !== item.name) : [...old, item.name])}
              >
                <Check checked={isChecked} />
                <span className="lc-ingredient-copy"><strong>{item.name}</strong><small>{item.referencePrice}</small></span>
                <span className="lc-ingredient-amount"><strong>{item.quantity}</strong><small>{item.estimatedCost}</small></span>
              </button>
            );
          })}
        </div>
        <footer><span>{copy.priceNote}</span></footer>
      </div>
      <div className="lc-shopping-story" data-lc-reveal>
        <h2 id="lc-list-title">{copy.title}<br /><em>{copy.accent}</em></h2>
        <p className="lc-list-lead">
          <strong>{copy.leadStrong}</strong>{copy.leadBefore}<span>{copy.shared}</span>{copy.leadMiddle}<span>{copy.quantities}</span>{copy.leadAfter}<span>{copy.eachRecipe}</span>{copy.leadEnd}
        </p>
        <div className="lc-list-sources">
          {copy.recipes.map((recipe, index) => (
            <div className={selectedItem.sources.some((source) => source.startsWith(recipe.name)) ? "is-source" : ""} key={recipe.name}>
              <FoodImage src={landingAssets.shoppingRecipes[index]} name={recipe.name} />
              <strong>{recipe.name}</strong>
              <span>{recipe.servings} {copy.serving} · <b>{recipe.estimatedCost}</b></span>
            </div>
          ))}
        </div>
        <div className="lc-origin" aria-live="polite">
          <span className="lc-meta">{copy.where}</span>
          <strong>{selectedItem.name} <span>{selectedItem.quantity}</span></strong>
          <p>{selectedItem.sources.join(" + ")}</p>
        </div>
      </div>
    </section>
  );
}
