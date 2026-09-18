"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  galleryQueryFingerprint,
  galleryUrl,
  emptyGalleryFilters,
  gallerySearchTypes,
  parseGalleryQueryState,
  toGallerySearchParams,
} from "@/lib/cookshare/gallery-query";
import type {
  GalleryCard,
  GalleryFilters,
  GalleryFacetOptions,
  GalleryPage,
  GalleryQueryState,
} from "@/lib/cookshare/types";
import styles from "./GalleryClient.module.css";
import GalleryCardView from "./GalleryCardView";
import GallerySkeleton from "./GallerySkeleton";

type GalleryLabels = {
  all: string;
  recipes: string;
  menus: string;
  days: string;
  weeks: string;
  lists: string;
  ingredients: string;
  categories: string;
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
  any: string;
  clear: string;
  results: string;
  noResults: string;
  requestError: string;
};

function labelsFor(locale: GalleryQueryState["locale"]): GalleryLabels {
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
      search: "Buscar recetas o ingredientes",
      submit: "Buscar",
      more: "Cargar más",
      filters: "Filtros de Gallery",
      advanced: "Más filtros",
      category: "Categoría",
      meal: "Momento",
      component: "Tipo de plato",
      minTime: "Tiempo mínimo",
      maxTime: "Tiempo máximo",
      any: "Cualquiera",
      clear: "Limpiar filtros",
      results: "resultados",
      noResults: "No encontramos objetos con esos filtros.",
      requestError: "No pudimos cargar la Gallery. Inténtalo de nuevo.",
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
      search: "Search recipes or ingredients",
      submit: "Search",
      more: "Load more",
      filters: "Gallery filters",
      advanced: "More filters",
      category: "Category",
      meal: "Meal moment",
      component: "Dish type",
      minTime: "Minimum time",
      maxTime: "Maximum time",
      any: "Any",
      clear: "Clear filters",
      results: "results",
      noResults: "No objects match those filters.",
      requestError: "We could not load the Gallery. Try again.",
    };
}

function apiParams(state: GalleryQueryState) {
  const params = toGallerySearchParams(state, {
    includeCursor: true,
    includeLocale: true,
  });
  return params;
}

type GalleryFixedState = {
  type?: GalleryQueryState["type"];
  filters?: Partial<Pick<GalleryFilters, "categories" | "ingredients_include">>;
};

function distinct(values: string[]) {
  return [...new Set(values)];
}

function applyFixedState(state: GalleryQueryState, fixed?: GalleryFixedState): GalleryQueryState {
  if (!fixed) return state;
  const filters = fixed.filters;
  return {
    ...state,
    type: fixed.type ?? state.type,
    filters: {
      ...state.filters,
      categories: filters?.categories
        ? distinct([...filters.categories, ...state.filters.categories])
        : state.filters.categories,
      ingredients_include: filters?.ingredients_include
        ? distinct([...filters.ingredients_include, ...state.filters.ingredients_include])
        : state.filters.ingredients_include,
    },
  };
}

function stateForRoute(state: GalleryQueryState, fixed?: GalleryFixedState): GalleryQueryState {
  if (!fixed?.filters) return state;
  return {
    ...state,
    filters: {
      ...state.filters,
      categories: state.filters.categories.filter((value) => !fixed.filters?.categories?.includes(value)),
      ingredients_include: state.filters.ingredients_include.filter((value) => !fixed.filters?.ingredients_include?.includes(value)),
    },
  };
}

export default function GalleryClient({
  initial,
  basePath,
  fixedState,
  deferInitialLoad = false,
}: {
  initial: GalleryPage;
  basePath?: string;
  fixedState?: GalleryFixedState;
  deferInitialLoad?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const labels = labelsFor(initial.state.locale);
  const [items, setItems] = useState<GalleryCard[]>(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [state, setState] = useState<GalleryQueryState>(initial.state);
  const [query, setQuery] = useState(initial.state.q);
  const [facetOptions, setFacetOptions] = useState<GalleryFacetOptions>(initial.facetOptions);
  const [loading, setLoading] = useState(deferInitialLoad);
  const [error, setError] = useState<string | null>(null);
  const initialLoadStarted = useRef(false);

  const path = basePath ?? (state.locale === "en" ? "/en/gallery" : "/es/gallery");

  const fetchPage = useCallback(async (nextState: GalleryQueryState, append: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gallery?${apiParams(nextState).toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("gallery_request");
      const page = await response.json() as GalleryPage;
      setFacetOptions(page.facetOptions);
      setItems((current) => {
        if (!append) return page.items;
        const seen = new Set(current.map((item) => `${item.objectType}:${item.objectId}`));
        return [...current, ...page.items.filter((item) => !seen.has(`${item.objectType}:${item.objectId}`))];
      });
      setCursor(page.nextCursor);
      setState(page.state);
      setQuery(page.state.q);
    } finally {
      setLoading(false);
    }
  }, []);

  const routeState = useMemo(() => {
    const parsed = parseGalleryQueryState(initial.state.locale, searchParams);
    return applyFixedState(parsed, fixedState);
  }, [fixedState, initial.state.locale, searchParams]);

  const routeFingerprint = galleryQueryFingerprint(routeState);
  const stateFingerprint = galleryQueryFingerprint(state);

  useEffect(() => {
    if (deferInitialLoad && !initialLoadStarted.current) {
      initialLoadStarted.current = true;
      void fetchPage({ ...routeState, cursor: routeState.cursor }, false)
        .catch(() => setError(labels.requestError));
      return;
    }
    if (routeFingerprint === stateFingerprint) return;
    const request = window.setTimeout(() => {
      void fetchPage({ ...routeState, cursor: null }, false)
        .catch(() => setError(labels.requestError));
    }, 0);
    return () => window.clearTimeout(request);
  }, [deferInitialLoad, fetchPage, labels.requestError, routeFingerprint, routeState, stateFingerprint]);

  const applyState = async (nextState: GalleryQueryState, append = false) => {
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

  const updateFilters = (patch: Partial<GalleryFilters>) => {
    void applyState({
      ...state,
      cursor: null,
      filters: { ...state.filters, ...patch },
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
      filters: emptyGalleryFilters(),
    });
  };

  const loadMore = () => {
    if (!cursor || loading) return;
    void applyState({ ...state, cursor }, true);
  };

  const selectType = (type: GalleryQueryState["type"]) => {
    void applyState({ ...state, type, cursor: null });
  };

  const nextHref = cursor
    ? `${path}?${toGallerySearchParams(
      stateForRoute({ ...state, cursor }, fixedState),
      { includeCursor: true },
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
          {gallerySearchTypes.map((type) => (
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
        <span className={styles.chipLabel}>{labels.maxTime}</span>
        {facetOptions.timeMinutes.map((time) => (
          <button
            type="button"
            key={time}
            className={state.filters.time_max_minutes === time ? styles.chipActive : styles.chip}
            onClick={() => updateFilters({ time_max_minutes: state.filters.time_max_minutes === time ? null : time })}
            aria-pressed={state.filters.time_max_minutes === time}
          >
            ≤ {time} min
          </button>
        ))}
        {facetOptions.categories.slice(0, 6).map((category) => (
          <button
            type="button"
            key={category.value}
            className={state.filters.categories.includes(category.value) ? styles.chipActive : styles.chip}
            onClick={() => updateFilters({
              categories: state.filters.categories.includes(category.value)
                ? state.filters.categories.filter((value) => value !== category.value)
                : [...state.filters.categories, category.value],
            })}
            aria-pressed={state.filters.categories.includes(category.value)}
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
              value={state.filters.meal_moments[0] ?? ""}
              onChange={(event) => updateFilters({ meal_moments: event.target.value ? [event.target.value as GalleryFilters["meal_moments"][number]] : [] })}
            >
              <option value="">{labels.any}</option>
              {facetOptions.mealMoments.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            {labels.component}
            <select
              value={state.filters.component_types[0] ?? ""}
              onChange={(event) => updateFilters({ component_types: event.target.value ? [event.target.value as GalleryFilters["component_types"][number]] : [] })}
            >
              <option value="">{labels.any}</option>
              {facetOptions.componentTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            {labels.category}
            <select
              value={state.filters.categories[0] ?? ""}
              onChange={(event) => updateFilters({ categories: event.target.value ? [event.target.value] : [] })}
            >
              <option value="">{labels.any}</option>
              {facetOptions.categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            {labels.minTime}
            <select
              value={state.filters.time_min_minutes ?? ""}
              onChange={(event) => updateFilters({ time_min_minutes: event.target.value ? Number(event.target.value) : null })}
            >
              <option value="">{labels.any}</option>
              {facetOptions.timeMinutes.map((time) => <option key={time} value={time}>{time} min</option>)}
            </select>
          </label>
        </div>
      </details>

      <p className={styles.resultCount} aria-live="polite">
        {loading ? (
          <span className={styles.resultLoading} aria-hidden="true" />
        ) : (
          `${items.length} ${labels.results}`
        )}
      </p>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      {items.length ? (
        <>
          <div className={styles.grid}>
            {items.map((item) => (
              <GalleryCardView
                key={`${item.objectType}-${item.objectId}`}
                card={item}
                locale={state.locale}
              />
            ))}
          </div>
          {loading ? <GallerySkeleton count={6} /> : null}
        </>
      ) : loading ? (
        <GallerySkeleton count={12} />
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
