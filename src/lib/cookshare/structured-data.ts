import { absoluteUrl, siteConfig } from "@/shared/config/site";
import { publicDescription, publicTitle } from "./resolver";
import type { AppLocale } from "@/shared/config/routes";
import type { CookShareResolvedObject, RecipeProjection } from "./types";
import { inlineMarkdownToText } from "./inline-markdown";

function safeImage(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, siteConfig.publicUrl);
    return url.hostname === "media.cookpilot.pro" && url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function breadcrumbName(object: CookShareResolvedObject, locale: AppLocale) {
  if (object.object_type === "ingredient" || object.object_type === "category") return publicTitle(object, locale);
  return object.title ?? "CookPilot";
}

function objectLinks(object: CookShareResolvedObject) {
  const values = Array.isArray(object.components) ? object.components : Array.isArray(object.recipes) ? object.recipes : [];
  return values.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const item = value as Record<string, unknown>;
    const identity = item.identity as { canonical_path?: string } | undefined;
    return identity?.canonical_path ? [absoluteUrl(identity.canonical_path)] : [];
  });
}

export function buildCookShareStructuredData(object: CookShareResolvedObject, locale: AppLocale) {
  const canonical = absoluteUrl(object.identity.canonical_path);
  const title = publicTitle(object, locale);
  const description = inlineMarkdownToText(publicDescription(object));
  const image = safeImage(object.cover_photo_url ?? object.image_url);
  const graph: Record<string, unknown>[] = [{
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumbs`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "CookPilot", item: absoluteUrl(locale === "en" ? "/en" : "/es") },
      { "@type": "ListItem", position: 2, name: breadcrumbName(object, locale), item: canonical },
    ],
  }];

  const recipe = object.object_type === "recipe" ? object as unknown as RecipeProjection : null;
  const fullRecipe = Boolean(recipe && !recipe.is_preview);
  if (recipe && fullRecipe) {
    const recipeData: Record<string, unknown> = {
      "@type": "Recipe",
      "@id": canonical,
      name: title,
      url: canonical,
      inLanguage: locale,
      description: description ?? undefined,
      image: image ? [image] : undefined,
      recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
      prepTime: recipe.time?.active_minutes ? `PT${recipe.time.active_minutes}M` : undefined,
      totalTime: recipe.time?.total_minutes ? `PT${recipe.time.total_minutes}M` : undefined,
      recipeIngredient: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map((item) => [item.display_quantity ?? item.quantity, item.display_unit ?? item.unit, item.ingredient_name].filter(Boolean).join(" "))
        : undefined,
      recipeInstructions: Array.isArray(recipe.steps)
        ? recipe.steps.map((step) => ({ "@type": "HowToStep", position: step.step_number, text: inlineMarkdownToText(step.instruction) }))
        : undefined,
    };
    if (recipe.nutrition) {
      recipeData.nutrition = {
        "@type": "NutritionInformation",
        calories: recipe.nutrition.kcal ? `${recipe.nutrition.kcal} kcal` : undefined,
        proteinContent: recipe.nutrition.protein_g ? `${recipe.nutrition.protein_g} g` : undefined,
        carbohydrateContent: recipe.nutrition.carbs_g ? `${recipe.nutrition.carbs_g} g` : undefined,
        fatContent: recipe.nutrition.fat_g ? `${recipe.nutrition.fat_g} g` : undefined,
      };
    }
    graph.push(recipeData);
  } else {
    graph.push({
      "@type": "WebPage",
      "@id": canonical,
      url: canonical,
      name: title,
      description: description ?? undefined,
      inLanguage: locale,
      isPartOf: { "@id": `${siteConfig.publicUrl}/#website` },
      primaryImageOfPage: image ? { "@type": "ImageObject", contentUrl: image } : undefined,
    });
  }

  const links = objectLinks(object);
  if (links.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${canonical}#items`,
      name: locale === "es" ? "Contenido relacionado" : "Related content",
      itemListElement: links.slice(0, 50).map((url, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
