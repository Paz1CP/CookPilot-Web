/* eslint-disable @next/next/no-img-element -- public editorial media keeps its intrinsic source ratio */
import Link from "next/link";
import type { AppLocale } from "@/shared/config/routes";
import { publicDescription, publicTitle } from "@/lib/cookshare/resolver";
import { buildCookShareStructuredData } from "@/lib/cookshare/structured-data";
import { emptyGalleryFilters, galleryIncludeIngredientsHash, galleryUrl } from "@/lib/cookshare/gallery-query";
import type { CookShareResolvedObject, GalleryCard, IngredientNutritionProjection, RecipeProjection } from "@/lib/cookshare/types";
import { parseInlineMarkdown } from "@/lib/cookshare/inline-markdown";
import siteEn from "@/locales/en.json";
import siteEs from "@/locales/es.json";
import GalleryReturnLink from "./GalleryReturnLink";
import GalleryCardView from "../gallery/GalleryCardView";
import ShareActions from "./ShareActions";
import styles from "./PublicObjectRenderer.module.css";

function mediaUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "media.cookpilot.pro" ? url.toString() : null;
  } catch {
    return null;
  }
}
function objectTypeLabel(objectType: CookShareResolvedObject["object_type"], locale: AppLocale) {
  const labels = locale === "es"
    ? { recipe: "Receta", menu: "Menú", day: "Día", week: "Semana", list: "Lista", ingredient: "Ingrediente", category: "Categoría" }
    : { recipe: "Recipe", menu: "Menu", day: "Day", week: "Week", list: "List", ingredient: "Ingredient", category: "Category" };
  return labels[objectType];
}

function InlineMarkdown({ value }: { value: string | null | undefined }) {
  return <>{parseInlineMarkdown(value).map((token, index) => {
    if (token.type === "strong") return <strong key={`${token.type}-${index}`}>{token.value}</strong>;
    if (token.type === "emphasis") return <em key={`${token.type}-${index}`}>{token.value}</em>;
    return <span key={`${token.type}-${index}`}>{token.value}</span>;
  })}</>;
}

type PublicObjectCopy = {
  nutrition_facts: string;
  key_values: string;
  macro_breakdown: string;
  micronutrients: string;
  recipes_for_ingredient: string;
  view_more: string;
  labels: Record<string, string>;
  units: { kcal: string; g: string; mg: string };
};

function publicObjectCopy(locale: AppLocale): PublicObjectCopy {
  return (locale === "es" ? siteEs.public_object : siteEn.public_object) as PublicObjectCopy;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function recipeCardFromPublicObject(object: CookShareResolvedObject, locale: AppLocale): GalleryCard | null {
  if (object.object_type !== "recipe" || !object.identity?.canonical_path) return null;
  const time = object.time && typeof object.time === "object" && !Array.isArray(object.time)
    ? object.time as Record<string, unknown>
    : null;
  const nutrition = object.nutrition && typeof object.nutrition === "object" && !Array.isArray(object.nutrition)
    ? object.nutrition as Record<string, unknown>
    : null;
  const badges = Array.isArray(nutrition?.badges) ? nutrition.badges.filter((badge): badge is string => typeof badge === "string") : [];
  return {
    objectType: "recipe",
    objectId: object.identity.canonical_path,
    title: publicTitle(object, locale),
    description: publicDescription(object),
    imageUrl: mediaUrl(object.cover_photo_url ?? object.image_url),
    href: object.identity.canonical_path,
    timeMinutes: numberValue(time?.total_minutes ?? object.time_minutes),
    nutrition: nutrition ? {
      kcal: numberValue(nutrition.kcal),
      proteinG: numberValue(nutrition.protein_g),
      carbsG: numberValue(nutrition.carbs_g),
      fatG: numberValue(nutrition.fat_g),
      fiberG: numberValue(nutrition.fiber_g),
      nutritionalScore: numberValue(nutrition.nutritional_score),
      badges,
    } : null,
    component: null,
    matchType: null,
    relevanceScore: null,
  };
}

function ingredientGalleryHref(object: CookShareResolvedObject, locale: AppLocale) {
  const filters = emptyGalleryFilters();
  filters.ingredients_include = [object.identity.slug];
  return `${galleryUrl(locale === "es" ? "/es/gallery" : "/en/gallery", {
    locale,
    q: "",
    type: "recipes",
    handle: null,
    cursor: null,
    filters,
  })}${galleryIncludeIngredientsHash}`;
}

function nutritionLabel(key: string, locale: AppLocale) {
  return publicObjectCopy(locale).labels[key] ?? key.replace(/_/g, " ");
}

function nutritionUnit(key: string, locale: AppLocale) {
  const units = publicObjectCopy(locale).units;
  if (/(?:kcal|calories)/i.test(key)) return units.kcal;
  if (/_mg$/i.test(key)) return units.mg;
  return units.g;
}

function nutritionValue(value: number, locale: AppLocale) {
  return new Intl.NumberFormat(locale === "es" ? "es-PE" : "en-US", {
    maximumFractionDigits: 3,
  }).format(value);
}

function numericNutrition(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).filter(([, entry]) => typeof entry === "number" && Number.isFinite(entry)) as [string, number][];
}

function NutritionMetricGrid({ entries, locale }: { entries: [string, number][]; locale: AppLocale }) {
  return (
    <dl className={styles.nutrition}>
      {entries.map(([key, value]) => (
        <div key={key}><dt>{nutritionLabel(key, locale)}</dt><dd>{nutritionValue(value, locale)} {nutritionUnit(key, locale)}</dd></div>
      ))}
    </dl>
  );
}

function RecipeDetails({ recipe, locale }: { recipe: RecipeProjection; locale: AppLocale }) {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const nutrition = recipe.nutrition ?? {};
  const hasNutrition = Object.values(nutrition).some((value) => typeof value === "number");
  return (
    <div className={`${styles.recipeDetails} ${hasNutrition ? styles.withNutrition : styles.withoutNutrition}`}>
      <section className={`${styles.detailCard} ${styles.ingredientsCard}`} aria-labelledby="ingredients-title">
        <div className={styles.sectionHeading}>
          <h2 id="ingredients-title">{locale === "es" ? "Ingredientes" : "Ingredients"}</h2>
        </div>
        {ingredients.length ? (
          <ul className={styles.ingredientList}>
            {ingredients.map((item, index) => (
              <li key={`${item.ingredient_name ?? "ingredient"}-${index}`}>
                <strong>{item.ingredient_name ?? ""}</strong>
                <span>{item.display_quantity ?? item.quantity ?? ""} {item.display_unit ?? item.unit ?? ""}</span>
              </li>
            ))}
          </ul>
        ) : <p className={styles.muted}>{locale === "es" ? "Ingredientes no disponibles." : "Ingredients unavailable."}</p>}
      </section>
      {hasNutrition ? (
        <section className={`${styles.detailCard} ${styles.nutritionCard}`} aria-labelledby="nutrition-title">
          <div className={styles.sectionHeading}>
            <h2 id="nutrition-title">{locale === "es" ? "Nutrición" : "Nutrition"}</h2>
          </div>
          <NutritionMetricGrid entries={numericNutrition(nutrition)} locale={locale} />
        </section>
      ) : null}
      {steps.length ? (
        <section className={`${styles.detailCard} ${styles.stepsCard}`} aria-labelledby="steps-title">
          <div className={styles.sectionHeading}>
            <h2 id="steps-title">{locale === "es" ? "Preparación" : "Preparation"}</h2>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, index) => <li key={`${step.step_number ?? index}`}><span>{step.step_number ?? index + 1}</span><p><InlineMarkdown value={step.instruction} /></p></li>)}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

function IngredientNutrition({ object, locale }: { object: CookShareResolvedObject; locale: AppLocale }) {
  const nutrition = object.nutrition;
  const copy = publicObjectCopy(locale);
  const projection = nutrition && typeof nutrition === "object" && !Array.isArray(nutrition)
    ? nutrition as IngredientNutritionProjection
    : null;
  const groups = [
    { id: "base", title: copy.key_values, entries: numericNutrition(projection?.base) },
    { id: "macro-breakdown", title: copy.macro_breakdown, entries: numericNutrition(projection?.macro_breakdown) },
    { id: "micronutrients", title: copy.micronutrients, entries: numericNutrition(projection?.micronutrients) },
  ].filter((group) => group.entries.length);
  const legacyEntries = groups.length ? [] : numericNutrition(nutrition);
  if (!groups.length && !legacyEntries.length) return null;
  return (
    <section className={`${styles.detailCard} ${styles.ingredientNutrition}`} aria-labelledby="ingredient-nutrition-title">
      <div className={styles.sectionHeading}>
        <h2 id="ingredient-nutrition-title">{copy.nutrition_facts}</h2>
      </div>
      <div className={styles.nutritionGroups}>
        {groups.map((group) => (
          <div key={group.id} className={styles.nutritionGroup}>
            <h3>{group.title}</h3>
            <NutritionMetricGrid entries={group.entries} locale={locale} />
          </div>
        ))}
        {legacyEntries.length ? <NutritionMetricGrid entries={legacyEntries} locale={locale} /> : null}
      </div>
    </section>
  );
}

function ComponentSection({ object, locale }: { object: CookShareResolvedObject; locale: AppLocale }) {
  const components = Array.isArray(object.components) ? object.components.filter((value): value is CookShareResolvedObject => Boolean(value && typeof value === "object")) : [];
  const recipes = Array.isArray(object.recipes) ? object.recipes.filter((value): value is CookShareResolvedObject => Boolean(value && typeof value === "object")) : [];
  const isIngredient = object.object_type === "ingredient";
  const recipeCards = isIngredient ? recipes.flatMap((recipe) => {
    const card = recipeCardFromPublicObject(recipe, locale);
    return card ? [card] : [];
  }) : [];
  const values = [...components, ...recipes];
  if (isIngredient && !recipeCards.length) return null;
  if (!isIngredient && !values.length) return null;
  const heading = object.object_type === "category"
    ? locale === "es" ? "Recetas de esta categoría" : "Recipes in this category"
    : locale === "es" ? "Contenido" : "Content";
  return (
    <section className={styles.components} aria-labelledby="object-content-title">
      <div className={`${styles.sectionHeading} ${isIngredient ? styles.sectionHeadingWithAction : ""}`}>
        <h2 id="object-content-title">{isIngredient ? publicObjectCopy(locale).recipes_for_ingredient : heading}</h2>
        {isIngredient ? <Link href={ingredientGalleryHref(object, locale)} className={styles.sectionAction}>{publicObjectCopy(locale).view_more}</Link> : null}
      </div>
      <div className={styles.componentGrid}>
        {isIngredient ? recipeCards.map((card, index) => (
          <GalleryCardView key={card.href} card={card} locale={locale} index={index} />
        )) : values.map((component, index) => {
          const identity = component.identity;
          const title = component.title ?? component.name ?? `${heading} ${index + 1}`;
          const content = (
            <>
              <span className={styles.componentType}>{objectTypeLabel(component.object_type, locale)}</span>
              <h3>{title}</h3>
              {typeof component.description === "string" ? <p><InlineMarkdown value={component.description} /></p> : null}
            </>
          );
          const key = `${component.object_type}-${identity?.canonical_path ?? index}`;
          return identity?.canonical_path ? <Link href={identity.canonical_path} key={key} className={styles.componentCard}>{content}</Link> : <article key={key} className={styles.componentCard}>{content}</article>;
        })}
      </div>
    </section>
  );
}

type StructureRow = { label: string; detail: string | null };

function displayStructureRows(value: unknown, locale: AppLocale): StructureRow[] {
  const rows: StructureRow[] = [];
  const seen = new Set<string>();
  const humanize = (value: string) => value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  const text = (entry: unknown) => typeof entry === "string" && entry.trim() ? entry.trim() : null;
  const number = (entry: unknown) => typeof entry === "number" && Number.isFinite(entry)
    ? String(entry)
    : typeof entry === "string" && entry.trim() && /^\d+(?:\.\d+)?$/.test(entry.trim()) ? entry.trim() : null;

  const visit = (entry: unknown, index = 0) => {
    if (Array.isArray(entry)) {
      entry.forEach((item, itemIndex) => visit(item, itemIndex));
      return;
    }
    if (!entry || typeof entry !== "object") return;
    const record = entry as Record<string, unknown>;
    const nestedMenu = record.menu && typeof record.menu === "object" ? record.menu as Record<string, unknown> : null;
    const label = text(record.custom_label) ?? text(record.slot_key) ?? text(record.component_type)
      ?? (Array.isArray(record.days) ? (locale === "es" ? "Día" : "Day") : null)
      ?? (index ? `${locale === "es" ? "Elemento" : "Item"} ${index + 1}` : null);
    const title = text(record.title) ?? text(nestedMenu?.title);
    const servings = number(record.servings);
    const detailParts = [title, servings ? `${servings} ${locale === "es" ? "porciones" : "servings"}` : null].filter(Boolean) as string[];
    if (label || title) {
      const rowLabel = label ? humanize(label) : title as string;
      const key = `${rowLabel}|${detailParts.join("|")}`;
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ label: rowLabel, detail: detailParts.filter((part) => part !== rowLabel).join(" · ") || null });
      }
    }
    ["days", "slots", "menu", "components"].forEach((key) => visit(record[key]));
  };

  visit(value);
  return rows.slice(0, 80);
}

function StructureSection({ object, locale }: { object: CookShareResolvedObject; locale: AppLocale }) {
  const rows = displayStructureRows(object.structure, locale);
  if (!rows.length) return null;
  return (
    <section className={styles.structure} aria-labelledby="object-structure-title">
      <div className={styles.sectionHeading}>
        <h2 id="object-structure-title">{locale === "es" ? "Estructura" : "Structure"}</h2>
      </div>
      <ul className={styles.structureList}>
        {rows.map((row, index) => <li key={`${row.label}-${row.detail ?? index}`}><strong>{row.label}</strong>{row.detail ? <span>{row.detail}</span> : null}</li>)}
      </ul>
    </section>
  );
}

export default function PublicObjectRenderer({
  object,
  locale,
}: {
  object: CookShareResolvedObject;
  locale: AppLocale;
}) {
  const title = publicTitle(object, locale);
  const description = publicDescription(object);
  const image = mediaUrl(object.cover_photo_url ?? object.image_url);
  const recipe = object.object_type === "recipe" ? object as unknown as RecipeProjection : null;
  const isIngredient = object.object_type === "ingredient";
  const structuredData = buildCookShareStructuredData(object, locale);
  const canonicalPath = object.identity.canonical_path;
  const siteCopy = locale === "es" ? siteEs : siteEn;
  const breadcrumbs = [
    { label: "CookPilot", href: locale === "es" ? "/es" : "/en" },
    { label: siteCopy.header.gallery, href: locale === "es" ? "/es/gallery" : "/en/gallery" },
    { label: title, href: canonicalPath },
  ];

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label={locale === "es" ? "Migas de navegación" : "Breadcrumbs"}>
          {breadcrumbs.map((item, index) => <span key={item.href}>{index ? <span aria-hidden="true">/</span> : null}{index === 1 ? <GalleryReturnLink href={item.href} label={item.label} locale={locale} /> : <Link href={item.href} aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}>{item.label}</Link>}</span>)}
        </nav>
        <div className={styles.heroGrid}>
          <div className={styles.copy}>
            <h1>{title}</h1>
            {description ? <p className={styles.description}><InlineMarkdown value={description} /></p> : null}
            {recipe?.time ? (
              <div className={styles.meta} aria-label={locale === "es" ? "Datos rápidos" : "Quick facts"}>
                {recipe.time.total_minutes ? <span>{recipe.time.total_minutes} min</span> : null}
                {recipe.servings ? <span>{recipe.servings} {locale === "es" ? "porciones" : "servings"}</span> : null}
              </div>
            ) : null}
            <ShareActions title={title} path={canonicalPath} locale={locale} />
          </div>
          {image ? <img src={image} alt={title} loading="eager" fetchPriority="high" decoding="async" className={`${styles.image} ${isIngredient ? styles.ingredientImage : ""}`} /> : <div className={`${styles.imageFallback} ${isIngredient ? styles.ingredientImageFallback : ""}`} aria-hidden="true"><span>CookPilot</span></div>}
        </div>

        {recipe ? <RecipeDetails recipe={recipe} locale={locale} /> : null}
        {isIngredient ? <IngredientNutrition object={object} locale={locale} /> : null}
        <StructureSection object={object} locale={locale} />
        <ComponentSection object={object} locale={locale} />

      </div>
    </main>
  );
}
