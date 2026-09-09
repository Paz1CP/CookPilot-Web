"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  galleryQueryFingerprint,
  galleryUrl,
  parseGalleryState,
  toGallerySearchParams,
} from "@/lib/cookshare/gallery-query";
import { inlineMarkdownToText } from "@/lib/cookshare/inline-markdown";
import type {
  GalleryCard,
  GalleryFacetState,
  GalleryFacetOptions,
  GalleryPage,
  GalleryState,
} from "@/lib/cookshare/types";
import styles from "./GalleryClient.module.css";

type GalleryLabels = {
  all: string;
  recipes: string;
  menus: string;
  days: string;
  weeks: string;
  lists: string;
  ingredients: string;
  categories: string;
  handles: string;
  search: string;
  submit: string;
  more: string;
  filters: string;
  advanced: string;
  category: string;
  meal: string;
  component: string;
  minTime: string;
  maxTime: string;
  access: string;
  any: string;
  free: string;
  pro: string;
  clear: string;
  results: string;
  noResults: string;
  requestError: string;
  private: string;
  handle: string;
};

function labelsFor(locale: GalleryState["locale"]): GalleryLabels {
  return locale === "es"
    ? {
      all: "Todo",
      recipes: "Recetas",
      menus: "Menús",
      days: "Días",
      weeks: "Semanas",
      lists: "Listas",
      ingredients: "Ingredientes",
      categories: "Categorías",
      handles: "Perfiles",
      search: "Buscar recetas, ingredientes o handles",
      submit: "Buscar",
      more: "Cargar más",
      filters: "Filtros de Gallery",
      advanced: "Más filtros",
      category: "Categoría",
      meal: "Momento",
      component: "Tipo de plato",
      minTime: "Tiempo mínimo",
      maxTime: "Tiempo máximo",
      access: "Acceso",
      any: "Cualquiera",
      free: "Gratis",
      pro: "Pro",
      clear: "Limpiar filtros",
      results: "resultados",
      noResults: "No encontramos objetos con esos filtros.",
      requestError: "No pudimos cargar la Gallery. Inténtalo de nuevo.",
      private: "Privado",
      handle: "Perfil",
    }
    : {
      all: "All",
      recipes: "Recipes",
      menus: "Menus",
      days: "Days",
      weeks: "Weeks",
      lists: "Lists",
      ingredients: "Ingredients",
      categories: "Categories",
      handles: "Profiles",
      search: "Search recipes, ingredients, or handles",
      submit: "Search",
      more: "Load more",
      filters: "Gallery filters",
      advanced: "More filters",
      category: "Category",
      meal: "Meal moment",
      component: "Dish type",
      minTime: "Minimum time",
      maxTime: "Maximum time",
      access: "Access",
      any: "Any",
      free: "Free",
      pro: "Pro",
      clear: "Clear filters",
      results: "results",
      noResults: "No objects match those filters.",
      requestError: "We could not load the Gallery. Try again.",
      private: "Private",
      handle: "Profile",
    };
}

function apiParams(state: GalleryState) {
  const params = toGallerySearchParams(state, {
    includeScope: true,
    includeCursor: true,
    includeLocale: true,
  });
  return params;
}

function cardTypeLabel(card: GalleryCard, locale: GalleryState["locale"]) {
  const labels = locale === "es"
    ? { recipe: "Receta", menu: "Menú", day: "Día", week: "Semana", list: "Lista", ingredient: "Ingrediente", category: "Categoría", handle: "Perfil" }
    : { recipe: "Recipe", menu: "Menu", day: "Day", week: "Week", list: "List", ingredient: "Ingredient", category: "Category", handle: "Profile" };
  return labels[card.objectType];
}

function cardImage(card: GalleryCard, index: number, hasCursor: boolean) {
  return card.imageUrl ? (
    <Image
      src={card.imageUrl}
      alt={card.title}
      width={720}
      height={480}
      sizes="(max-width: 680px) 100vw, (max-width: 1040px) 50vw, 33vw"
      priority={index === 0 && !hasCursor}
    />
  ) : (
    <div className={styles.fallback} aria-hidden="true">
      <span>CookPilot</span>
    </div>
  );
}

type GalleryFixedState = {
  type?: GalleryState["type"];
  scope?: GalleryState["scope"];
  handle?: string | null;
  facets?: Partial<Pick<GalleryFacetState, "categories" | "ingredients">>;
};

function distinct(values: string[]) {
  return [...new Set(values)];
}

function applyFixedState(state: GalleryState, fixed?: GalleryFixedState): GalleryState {
  if (!fixed) return state;
  const facets = fixed.facets;
  return {
    ...state,
    type: fixed.type ?? state.type,
    scope: fixed.scope ?? state.scope,
    handle: fixed.handle ?? state.handle,
    facets: {
      ...state.facets,
      categories: facets?.categories
        ? distinct([...facets.categories, ...state.facets.categories])
        : state.facets.categories,
      ingredients: facets?.ingredients
        ? distinct([...facets.ingredients, ...state.facets.ingredients])
        : state.facets.ingredients,
    },
  };
}

function stateForRoute(state: GalleryState, fixed?: GalleryFixedState): GalleryState {
  if (!fixed?.facets) return state;
  return {
    ...state,
    facets: {
      ...state.facets,
      categories: state.facets.categories.filter((value) => !fixed.facets?.categories?.includes(value)),
      ingredients: state.facets.ingredients.filter((value) => !fixed.facets?.ingredients?.includes(value)),
    },
  };
}

export default function GalleryClient({
  initial,
  basePath,
  fixedState,
}: {
  initial: GalleryPage;
  basePath?: string;
  fixedState?: GalleryFixedState;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const labels = labelsFor(initial.state.locale);
  const [items, setItems] = useState<GalleryCard[]>(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [state, setState] = useState<GalleryState>(initial.state);
  const [query, setQuery] = useState(initial.state.q);
  const [facetOptions, setFacetOptions] = useState<GalleryFacetOptions>(initial.facetOptions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const path = basePath ?? (state.locale === "en" ? "/en/gallery" : "/es/gallery");

  const fetchPage = useCallback(async (nextState: GalleryState, append: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gallery?${apiParams(nextState).toString()}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("gallery_request");
      const page = await response.json() as GalleryPage;
      setFacetOptions(page.facetOptions);
      setItems((current) => {
        if (!append) return page.items;
        const seen = new Set(current.map((item) => `${item.objectType}:${item.href}`));
        return [...current, ...page.items.filter((item) => !seen.has(`${item.objectType}:${item.href}`))];
      });
      setCursor(page.nextCursor);
      setState(page.state);
      setQuery(page.state.q);
    } finally {
      setLoading(false);
    }
  }, []);

  const routeState = useMemo(() => {
    const parsed = parseGalleryState(initial.state.locale, searchParams);
    const scoped = initial.state.scope === "handle"
      ? { ...parsed, scope: "handle" as const, handle: initial.state.handle }
      : parsed;
    return applyFixedState(scoped, fixedState);
  }, [fixedState, initial.state.handle, initial.state.locale, initial.state.scope, searchParams]);

  const routeFingerprint = galleryQueryFingerprint(routeState);
  const stateFingerprint = galleryQueryFingerprint(state);

  useEffect(() => {
    if (routeFingerprint === stateFingerprint) return;
    const request = window.setTimeout(() => {
      void fetchPage({ ...routeState, cursor: null }, false)
        .catch(() => setError(labels.requestError));
    }, 0);
    return () => window.clearTimeout(request);
  }, [fetchPage, labels.requestError, routeFingerprint, routeState, stateFingerprint]);

  const applyState = async (nextState: GalleryState, append = false) => {
    const resetState = applyFixedState(append ? nextState : { ...nextState, cursor: null }, fixedState);
    if (!append) {
      router.push(galleryUrl(path, stateForRoute(resetState, fixedState)), { scroll: false });
      return;
    }
    setState(resetState);
    try {
      await fetchPage(resetState, append);
    } catch {
      setError(labels.requestError);
    }
  };

  const updateFacets = (patch: Partial<GalleryState["facets"]>) => {
    void applyState({
      ...state,
      cursor: null,
      facets: { ...state.facets, ...patch },
    });
  };

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void applyState({ ...state, cursor: null, q: String(form.get("q") ?? "") });
  };

  const clearFilters = () => {
    void applyState({
      ...state,
      cursor: null,
      q: "",
      type: "all",
      facets: {
        categories: [],
        meals: [],
        components: [],
        ingredients: [],
        excludedIngredients: [],
        minTime: null,
        maxTime: null,
        access: "all",
      },
    });
  };

  const loadMore = () => {
    if (!cursor || loading) return;
    void applyState({ ...state, cursor }, true);
  };

  const selectType = (type: GalleryState["type"]) => {
    void applyState({ ...state, type, cursor: null });
  };

  const nextHref = cursor
    ? `${path}?${toGallerySearchParams(
      stateForRoute({ ...state, cursor }, fixedState),
      { includeScope: true, includeCursor: true },
    ).toString()}`
    : null;

  return (
    <div className={styles.content}>
      <form className={styles.search} onSubmit={search} role="search">
        <label htmlFor="gallery-q">{labels.search}</label>
        <div className={styles.searchRow}>
          <input
            id="gallery-q"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            autoComplete="off"
          />
          <button type="submit" className="cp-btn cp-btn--primary" disabled={loading}>
            {labels.submit}
          </button>
        </div>
      </form>

      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label={labels.filters}>
          {(["all", "recipes", "menus", "days", "weeks", "lists", "ingredients", "categories", "handles"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={state.type === type ? styles.active : ""}
              onClick={() => selectType(type)}
              aria-pressed={state.type === type}
            >
              {labels[type]}
            </button>
          ))}
        </div>
        <button type="button" className={styles.clear} onClick={clearFilters}>
          {labels.clear}
        </button>
      </div>

      <div className={styles.chips} aria-label={labels.filters}>
        <span className={styles.chipLabel}>{labels.access}</span>
        {(["all", "free", "pro"] as const).map((access) => (
          <button
            type="button"
            key={access}
            className={state.facets.access === access ? styles.chipActive : styles.chip}
            onClick={() => updateFacets({ access })}
            aria-pressed={state.facets.access === access}
          >
            {access === "all" ? labels.any : access === "free" ? labels.free : labels.pro}
          </button>
        ))}
        <span className={styles.chipLabel}>{labels.maxTime}</span>
        {facetOptions.times.map((time) => (
          <button
            type="button"
            key={time}
            className={state.facets.maxTime === time ? styles.chipActive : styles.chip}
            onClick={() => updateFacets({ maxTime: state.facets.maxTime === time ? null : time })}
            aria-pressed={state.facets.maxTime === time}
          >
            ≤ {time} min
          </button>
        ))}
        {facetOptions.categories.slice(0, 6).map((category) => (
          <button
            type="button"
            key={category.value}
            className={state.facets.categories.includes(category.value) ? styles.chipActive : styles.chip}
            onClick={() => updateFacets({
              categories: state.facets.categories.includes(category.value)
                ? state.facets.categories.filter((value) => value !== category.value)
                : [...state.facets.categories, category.value],
            })}
            aria-pressed={state.facets.categories.includes(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <details className={styles.advanced}>
        <summary>{labels.advanced}</summary>
        <div className={styles.advancedGrid}>
          <label>
            {labels.meal}
            <select
              value={state.facets.meals[0] ?? ""}
              onChange={(event) => updateFacets({ meals: event.target.value ? [event.target.value] : [] })}
            >
              <option value="">{labels.any}</option>
              {facetOptions.meals.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            {labels.component}
            <select
              value={state.facets.components[0] ?? ""}
              onChange={(event) => updateFacets({ components: event.target.value ? [event.target.value] : [] })}
            >
              <option value="">{labels.any}</option>
              {facetOptions.components.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            {labels.category}
            <select
              value={state.facets.categories[0] ?? ""}
              onChange={(event) => updateFacets({ categories: event.target.value ? [event.target.value] : [] })}
            >
              <option value="">{labels.any}</option>
              {facetOptions.categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            {labels.minTime}
            <select
              value={state.facets.minTime ?? ""}
              onChange={(event) => updateFacets({ minTime: event.target.value ? Number(event.target.value) : null })}
            >
              <option value="">{labels.any}</option>
              {facetOptions.times.map((time) => <option key={time} value={time}>{time} min</option>)}
            </select>
          </label>
        </div>
      </details>

      <p className={styles.resultCount} aria-live="polite">
        {items.length} {labels.results}
      </p>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      {items.length ? (
        <div className={styles.grid}>
          {items.map((item, index) => (
            <Link key={`${item.objectType}-${item.href}`} href={item.href} className={styles.card}>
              <div className={styles.media}>{cardImage(item, index, Boolean(state.cursor))}</div>
              <div className={styles.body}>
                <span className={styles.type}>{cardTypeLabel(item, state.locale)}</span>
                <h2>{item.title}</h2>
                {item.description ? <p>{inlineMarkdownToText(item.description)}</p> : null}
                <div className={styles.meta}>
                  {item.timeMinutes ? <span>{item.timeMinutes} min</span> : null}
                  {item.isFree ? <span>{state.locale === "es" ? "Gratis" : "Free"}</span> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>{labels.noResults}</p>
          {state.q || state.type !== "all" ? <button type="button" className="cp-btn cp-btn--secondary" onClick={clearFilters}>{labels.clear}</button> : null}
        </div>
      )}

      {cursor ? (
        <div className={styles.loadMore}>
          <button type="button" className="cp-btn cp-btn--secondary" onClick={loadMore} disabled={loading}>
            {loading ? "…" : labels.more}
          </button>
          {nextHref ? (
            <noscript>
              <Link className={styles.fallbackLink} href={nextHref}>{labels.more}</Link>
            </noscript>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
