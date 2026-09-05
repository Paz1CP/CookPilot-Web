import Image from "next/image";
import type { AppLocale } from "@/shared/config/routes";
import { publicDescription, publicTitle } from "@/lib/cookshare/resolver";
import type { CookShareResolvedObject, RecipeProjection } from "@/lib/cookshare/types";
import CookPaywall from "@/features/web-billing/CookPaywall";
import AuthDialog from "@/features/auth-web/AuthDialog";
import ShareActions from "./ShareActions";
import styles from "./PublicObjectRenderer.module.css";

function mediaUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.hostname === "media.cookpilot.pro" ? url.toString() : null;
  } catch {
    return null;
  }
}

function RecipeDetails({ recipe, locale }: { recipe: RecipeProjection; locale: AppLocale }) {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  return (
    <div className={styles.recipeDetails}>
      <section><h2>{locale === "es" ? "Ingredientes" : "Ingredients"}</h2><ul>{ingredients.map((item, index) => <li key={item.rci_id ?? index}>{item.display_quantity ?? item.quantity ?? ""} {item.display_unit ?? item.unit ?? ""} {item.ingredient_name ?? ""}</li>)}</ul></section>
      {steps.length ? <section><h2>{locale === "es" ? "Preparación" : "Preparation"}</h2><ol>{steps.map((step, index) => <li key={`${step.step_number ?? index}`}>{step.instruction}</li>)}</ol></section> : null}
    </div>
  );
}

export default function PublicObjectRenderer({ object, locale, actorId }: { object: CookShareResolvedObject; locale: AppLocale; actorId?: string | null }) {
  const title = publicTitle(object, locale);
  const description = publicDescription(object);
  const image = mediaUrl(object.cover_photo_url ?? object.image_url);
  const recipe = object.object_type === "recipe" ? object as unknown as RecipeProjection : null;
  const isProtectedPreview = Boolean(recipe?.is_preview && !object.entitlement.is_owner && object.entitlement.tier !== "pro");
  const components = Array.isArray(object.components) ? object.components as CookShareResolvedObject[] : [];
  const listLabel = locale === "es" ? "Contenido" : "Content";

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.eyebrow}>{object.object_type}</div>
        <div className={styles.heroGrid}>
          <div className={styles.copy}>
            <h1>{title}</h1>
            {description ? <p className={styles.description}>{description}</p> : null}
            {recipe?.time ? <div className={styles.meta}><span>{recipe.time.total_minutes ?? 0} min</span><span>{recipe.servings ?? 1} {locale === "es" ? "porciones" : "servings"}</span></div> : null}
            <ShareActions title={title} path={object.identity.canonical_path} locale={locale} />
          </div>
          {image ? <Image src={image} alt={title} width={960} height={720} priority sizes="(max-width: 800px) 100vw, 50vw" className={styles.image} /> : <div className={styles.imageFallback} aria-hidden="true"><span>CookPilot</span></div>}
        </div>

        {recipe ? <RecipeDetails recipe={recipe} locale={locale} /> : null}
        {components.length ? <section className={styles.components}><h2>{listLabel}</h2><div className={styles.componentGrid}>{components.map((component, index) => <article key={component.object_id ?? index} className={styles.componentCard}><h3>{component.title ?? component.name ?? `${listLabel} ${index + 1}`}</h3>{typeof component.description === "string" ? <p>{component.description}</p> : null}{Boolean(component.is_preview) ? <span className={styles.locked}>{locale === "es" ? "Contenido Pro" : "Pro content"}</span> : null}</article>)}</div></section> : null}

        {isProtectedPreview ? <div className={styles.lockedPanel}>
          <p>{locale === "es" ? "Esta receta está disponible en vista previa. Desbloquea los pasos y la lista completa cuando quieras cocinarla." : "This recipe is available as a preview. Unlock the steps and complete list when you are ready to cook."}</p>
          {object.entitlement.tier === "anonymous" || !actorId ? <AuthDialog locale={locale} label={locale === "es" ? "Iniciar sesión para continuar" : "Sign in to continue"} continuation={{ locale, objectType: object.object_type, handle: object.identity.handle, slug: object.identity.slug, action: "unlock" }} /> : <CookPaywall locale={locale} context={title} appUserId={actorId} />}
        </div> : null}

        {object.object_type === "category" && Array.isArray(object.recipes) ? <section className={styles.components}><h2>{locale === "es" ? "Recetas de esta categoría" : "Recipes in this category"}</h2><div className={styles.componentGrid}>{(object.recipes as CookShareResolvedObject[]).map((item, index) => <article key={item.object_id ?? index} className={styles.componentCard}><h3>{item.title ?? "CookPilot recipe"}</h3>{typeof item.description === "string" ? <p>{item.description}</p> : null}</article>)}</div></section> : null}
      </div>
    </main>
  );
}
