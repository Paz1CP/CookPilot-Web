import Image from "next/image";
import Link from "next/link";
import type { AppLocale } from "@/shared/config/routes";
import { publicDescription, publicTitle } from "@/lib/cookshare/resolver";
import { buildCookShareStructuredData } from "@/lib/cookshare/structured-data";
import type { CookShareResolvedObject, RecipeProjection } from "@/lib/cookshare/types";
import { parseInlineMarkdown } from "@/lib/cookshare/inline-markdown";
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

function nutritionLabel(key: string, locale: AppLocale) {
  const labels: Record<string, [string, string]> = {
    kcal: ["Calorías", "Calories"],
    protein_g: ["Proteína (g)", "Protein (g)"],
    carbs_g: ["Carbohidratos (g)", "Carbohydrates (g)"],
    fat_g: ["Grasa (g)", "Fat (g)"],
    fiber_g: ["Fibra (g)", "Fiber (g)"],
  };
  return labels[key]?.[locale === "es" ? 0 : 1] ?? key.replace(/_/g, " ");
}

function RecipeDetails({ recipe, locale }: { recipe: RecipeProjection; locale: AppLocale }) {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const nutrition = recipe.nutrition ?? {};
  const hasNutrition = Object.values(nutrition).some((value) => typeof value === "number");
  return (
    <div className={styles.recipeDetails}>
      <section className={styles.detailCard} aria-labelledby="ingredients-title">
        <div className={styles.sectionHeading}>
          <p className="cp-eyebrow">{locale === "es" ? "Lo que necesitas" : "What you need"}</p>
          <h2 id="ingredients-title">{locale === "es" ? "Ingredientes" : "Ingredients"}</h2>
        </div>
        {ingredients.length ? (
          <ul className={styles.ingredientList}>
            {ingredients.map((item, index) => (
              <li key={`${item.ingredient_name ?? "ingredient"}-${index}`}>
                <span>{item.display_quantity ?? item.quantity ?? ""} {item.display_unit ?? item.unit ?? ""}</span>
                <strong>{item.ingredient_name ?? ""}</strong>
              </li>
            ))}
          </ul>
        ) : <p className={styles.muted}>{locale === "es" ? "Ingredientes no disponibles." : "Ingredients unavailable."}</p>}
      </section>
      {hasNutrition ? (
        <section className={styles.detailCard} aria-labelledby="nutrition-title">
          <div className={styles.sectionHeading}>
            <p className="cp-eyebrow">{locale === "es" ? "Por porción" : "Per serving"}</p>
            <h2 id="nutrition-title">{locale === "es" ? "Nutrición" : "Nutrition"}</h2>
          </div>
          <dl className={styles.nutrition}>
            {Object.entries(nutrition).filter(([, value]) => typeof value === "number").map(([key, value]) => (
              <div key={key}><dt>{nutritionLabel(key, locale)}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </section>
      ) : null}
      {steps.length ? (
        <section className={`${styles.detailCard} ${styles.stepsCard}`} aria-labelledby="steps-title">
          <div className={styles.sectionHeading}>
            <p className="cp-eyebrow">{locale === "es" ? "Paso a paso" : "Step by step"}</p>
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

function ComponentSection({ object, locale }: { object: CookShareResolvedObject; locale: AppLocale }) {
  const components = Array.isArray(object.components) ? object.components.filter((value): value is CookShareResolvedObject => Boolean(value && typeof value === "object")) : [];
  const recipes = Array.isArray(object.recipes) ? object.recipes.filter((value): value is CookShareResolvedObject => Boolean(value && typeof value === "object")) : [];
  const values = [...components, ...recipes];
  if (!values.length) return null;
  const heading = object.object_type === "category"
    ? locale === "es" ? "Recetas de esta categoría" : "Recipes in this category"
    : locale === "es" ? "Contenido" : "Content";
  return (
    <section className={styles.components} aria-labelledby="object-content-title">
      <div className={styles.sectionHeading}>
        <p className="cp-eyebrow">CookShare</p>
        <h2 id="object-content-title">{heading}</h2>
      </div>
      <div className={styles.componentGrid}>
        {values.map((component, index) => {
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
        <p className="cp-eyebrow">CookShare</p>
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
  const structuredData = buildCookShareStructuredData(object, locale);
  const canonicalPath = object.identity.canonical_path;
  const breadcrumbs = [
    { label: "CookPilot", href: locale === "es" ? "/es" : "/en" },
    { label: "CookShare", href: locale === "es" ? "/es/gallery" : "/en/gallery" },
    { label: title, href: canonicalPath },
  ];

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label={locale === "es" ? "Migas de navegación" : "Breadcrumbs"}>
          {breadcrumbs.map((item, index) => <span key={item.href}>{index ? <span aria-hidden="true">/</span> : null}<Link href={item.href} aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}>{item.label}</Link></span>)}
        </nav>
        <div className={styles.eyebrow}>{objectTypeLabel(object.object_type, locale)}</div>
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
          {image ? <Image src={image} alt={title} width={960} height={720} priority sizes="(max-width: 800px) 100vw, 50vw" className={styles.image} /> : <div className={styles.imageFallback} aria-hidden="true"><span>CookPilot</span></div>}
        </div>

        {recipe ? <RecipeDetails recipe={recipe} locale={locale} /> : null}
        <StructureSection object={object} locale={locale} />
        <ComponentSection object={object} locale={locale} />

      </div>
    </main>
  );
}
