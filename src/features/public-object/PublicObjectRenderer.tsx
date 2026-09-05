import Image from "next/image";
import Link from "next/link";
import type { AppLocale } from "@/shared/config/routes";
import { publicDescription, publicTitle } from "@/lib/cookshare/resolver";
import { buildCookShareStructuredData } from "@/lib/cookshare/structured-data";
import type { CookShareResolvedObject, RecipeProjection } from "@/lib/cookshare/types";
import CookPaywall from "@/features/web-billing/CookPaywall";
import AuthDialog from "@/features/auth-web/AuthDialog";
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
              <li key={item.rci_id ?? index}>
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
              <div key={key}><dt>{key.replace(/_/g, " ")}</dt><dd>{value}</dd></div>
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
            {steps.map((step, index) => <li key={`${step.step_number ?? index}`}><span>{step.step_number ?? index + 1}</span><p>{step.instruction}</p></li>)}
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
              {typeof component.description === "string" ? <p>{component.description}</p> : null}
              {Boolean(component.is_preview) ? <span className={styles.locked}>{locale === "es" ? "Contenido Pro" : "Pro content"}</span> : null}
            </>
          );
          return identity?.canonical_path ? <Link href={identity.canonical_path} key={component.object_id ?? index} className={styles.componentCard}>{content}</Link> : <article key={component.object_id ?? index} className={styles.componentCard}>{content}</article>;
        })}
      </div>
    </section>
  );
}

export default function PublicObjectRenderer({
  object,
  locale,
  actorId,
}: {
  object: CookShareResolvedObject;
  locale: AppLocale;
  actorId?: string | null;
}) {
  const title = publicTitle(object, locale);
  const description = publicDescription(object);
  const image = mediaUrl(object.cover_photo_url ?? object.image_url);
  const recipe = object.object_type === "recipe" ? object as unknown as RecipeProjection : null;
  const isProtectedPreview = Boolean(recipe?.is_preview && !object.entitlement.is_owner && object.entitlement.tier !== "pro");
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
            {description ? <p className={styles.description}>{description}</p> : null}
            {recipe?.time ? (
              <div className={styles.meta} aria-label={locale === "es" ? "Datos rápidos" : "Quick facts"}>
                {recipe.time.total_minutes ? <span>{recipe.time.total_minutes} min</span> : null}
                {recipe.servings ? <span>{recipe.servings} {locale === "es" ? "porciones" : "servings"}</span> : null}
                {recipe.is_free_recipe ? <span>{locale === "es" ? "Gratis" : "Free"}</span> : null}
              </div>
            ) : null}
            <ShareActions title={title} path={canonicalPath} locale={locale} />
          </div>
          {image ? <Image src={image} alt={title} width={960} height={720} priority sizes="(max-width: 800px) 100vw, 50vw" className={styles.image} /> : <div className={styles.imageFallback} aria-hidden="true"><span>CookPilot</span></div>}
        </div>

        {recipe ? <RecipeDetails recipe={recipe} locale={locale} /> : null}
        <ComponentSection object={object} locale={locale} />

        {isProtectedPreview ? (
          <aside className={styles.lockedPanel} aria-labelledby="locked-title">
            <p className="cp-eyebrow">CookPilot Pro</p>
            <h2 id="locked-title">{locale === "es" ? "Continúa cuando quieras cocinarla" : "Continue when you are ready to cook"}</h2>
            <p>{locale === "es" ? "Esta receta está disponible en vista previa. Desbloquea los pasos y la lista completa cuando quieras cocinarla." : "This recipe is available as a preview. Unlock the steps and complete list when you are ready to cook."}</p>
            {object.entitlement.tier === "anonymous" || !actorId
              ? <AuthDialog locale={locale} label={locale === "es" ? "Iniciar sesión para continuar" : "Sign in to continue"} continuation={{ locale, objectType: object.object_type, handle: object.identity.handle, slug: object.identity.slug, action: "unlock" }} />
              : <CookPaywall locale={locale} context={title} appUserId={actorId} />}
          </aside>
        ) : null}
      </div>
    </main>
  );
}
