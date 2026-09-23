"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown2, SearchNormal1, Setting4 } from "iconsax-reactjs";
import {
  emptyGalleryFilters,
  galleryFacetApplicability,
  galleryIncludeIngredientsHash,
  gallerySearchTypes,
  normalizeGalleryQueryState,
  parseGalleryQueryState,
  toGallerySearchParams,
  type GalleryArrayFilterKey,
  type GalleryNumericFilterKey,
} from "@/lib/cookshare/gallery-query";
import type { GalleryCard, GalleryFacetOption, GalleryFacetOptions, GalleryFilters, GalleryPage, GalleryQueryState } from "@/lib/cookshare/types";
import { getGalleryTranslations, type GalleryTranslations } from "@/lib/i18n";
import GalleryCardView from "./GalleryCardView";
import styles from "./GalleryDiscovery.module.css";

type GalleryLabels = GalleryTranslations;

function cardIdentity(item: GalleryCard) { return `${item.objectType}:${item.objectId}`; }
function titleize(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function labelFromMap(map: Record<string, string>, value: string) { return map[value] ?? titleize(value); }
function GallerySelect({
  id,
  value,
  options,
  placeholder,
  onChange,
  onOpen,
}: {
  id: string;
  value: string;
  options: GalleryFacetOption[];
  placeholder: string;
  onChange: (value: string) => void;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const active = options.find((option) => option.value === value);

  function openMenu() {
    setOpen(true);
    onOpen?.();
  }

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  function moveFocus(direction: 1 | -1 | "first" | "last") {
    const optionsElement = rootRef.current?.querySelectorAll<HTMLButtonElement>("[role=option]");
    if (!optionsElement?.length) return;
    const currentIndex = Array.from(optionsElement).findIndex((option) => option.getAttribute("aria-selected") === "true");
    const nextIndex = direction === "first" ? 0 : direction === "last" ? optionsElement.length - 1 : Math.max(0, Math.min(optionsElement.length - 1, currentIndex + direction));
    optionsElement[nextIndex]?.focus();
  }

  return <div className={styles.select} ref={rootRef}>
    <button
      id={id}
      className={styles.selectTrigger}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => { if (open) setOpen(false); else openMenu(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") { event.preventDefault(); if (!open) openMenu(); requestAnimationFrame(() => moveFocus(1)); }
        if (event.key === "ArrowUp") { event.preventDefault(); if (!open) openMenu(); requestAnimationFrame(() => moveFocus(-1)); }
        if (event.key === "Home" && open) { event.preventDefault(); moveFocus("first"); }
        if (event.key === "End" && open) { event.preventDefault(); moveFocus("last"); }
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <span>{active?.label ?? placeholder}</span>
      <ArrowDown2 className={styles.selectChevron} size={18} variant="Linear" aria-hidden="true" />
    </button>
    {open ? <div className={styles.selectMenu} role="listbox" aria-labelledby={id}>
      {options.map((option) => <button
        className={styles.selectOption}
        key={option.value || "empty"}
        type="button"
        role="option"
        aria-selected={option.value === value}
        onClick={() => { onChange(option.value); setOpen(false); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); moveFocus(1); }
          if (event.key === "ArrowUp") { event.preventDefault(); moveFocus(-1); }
          if (event.key === "Home") { event.preventDefault(); moveFocus("first"); }
          if (event.key === "End") { event.preventDefault(); moveFocus("last"); }
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); }
        }}
      >
        <span>{option.label}</span>
        {option.value === value ? <span className={styles.selectCheck} aria-hidden="true">✓</span> : null}
      </button>)}
    </div> : null}
  </div>;
}

function DetailsSummary({ label, hint }: { label: string; hint?: string }) {
  return <summary>
    <span>{label}</span>
    {hint ? <small>{hint}</small> : null}
    <ArrowDown2 className={styles.detailsChevron} size={18} variant="Linear" aria-hidden="true" />
  </summary>;
}

function OptionPills({
  options,
  selected,
  onToggle,
}: {
  options: GalleryFacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return <div className={styles.options}>
    {options.map((option) => <button
      className={styles.option}
      key={option.value}
      type="button"
      aria-pressed={selected.includes(option.value)}
      onClick={() => onToggle(option.value)}
    >{option.label}</button>)}
  </div>;
}

function RangeFields({
  minKey,
  maxKey,
  minValue,
  maxValue,
  minLabel,
  maxLabel,
  placeholder,
  onCommit,
}: {
  minKey: GalleryNumericFilterKey;
  maxKey: GalleryNumericFilterKey;
  minValue: number | null;
  maxValue: number | null;
  minLabel: string;
  maxLabel: string;
  placeholder: string;
  onCommit: (patch: Partial<GalleryFilters>) => void;
}) {
  const [draftMin, setDraftMin] = useState(minValue === null ? "" : String(minValue));
  const [draftMax, setDraftMax] = useState(maxValue === null ? "" : String(maxValue));

  useEffect(() => {
    // The draft is intentionally reset after a committed URL request returns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftMin(minValue === null ? "" : String(minValue));
    setDraftMax(maxValue === null ? "" : String(maxValue));
  }, [maxValue, minValue]);

  function commit(key: GalleryNumericFilterKey, raw: string) {
    const trimmed = raw.trim();
    const value = trimmed === "" ? null : Number(trimmed);
    if (value !== null && (!Number.isFinite(value) || value < 0)) return;
    onCommit({ [key]: value } as Partial<GalleryFilters>);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") event.currentTarget.blur();
  }

  return <div className={styles.range}>
    <label><span>{minLabel}</span><input type="number" min="0" step="any" inputMode="decimal" value={draftMin} placeholder={placeholder} onChange={(event) => setDraftMin(event.target.value)} onBlur={() => commit(minKey, draftMin)} onKeyDown={onKeyDown} /></label>
    <label><span>{maxLabel}</span><input type="number" min="0" step="any" inputMode="decimal" value={draftMax} placeholder={placeholder} onChange={(event) => setDraftMax(event.target.value)} onBlur={() => commit(maxKey, draftMax)} onKeyDown={onKeyDown} /></label>
  </div>;
}

function IngredientPicker({
  labels,
  options,
  selected,
  onAdd,
  onRemove,
}: {
  labels: GalleryLabels;
  options: GalleryFacetOption[];
  selected: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const choices = options
    .filter((option) => !selected.includes(option.value))
    .filter((option) => !normalizedQuery || `${option.label} ${option.value}`.toLocaleLowerCase().includes(normalizedQuery))
    .slice(0, 8);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  return <div className={styles.ingredientPicker} ref={rootRef}>
    <div className={styles.ingredientInputWrap}>
      <SearchNormal1 size={18} aria-hidden="true" />
      <input
        type="search"
        value={query}
        placeholder={labels.ingredientSearch}
        aria-label={labels.ingredientSearch}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && choices[0]) { event.preventDefault(); onAdd(choices[0].value); setQuery(""); setOpen(false); }
          if (event.key === "Escape") setOpen(false);
        }}
      />
    </div>
    {open && choices.length ? <div className={styles.ingredientMenu} role="listbox" aria-label={labels.ingredientSearchHint}>
      {choices.map((option) => <button key={option.value} type="button" role="option" aria-selected="false" onClick={() => { onAdd(option.value); setQuery(""); setOpen(false); }}>{option.label}</button>)}
    </div> : null}
    {selected.length ? <div className={styles.selectedIngredients}>
      {selected.map((value) => <button key={value} type="button" className={styles.selectedIngredient} onClick={() => onRemove(value)} aria-label={`${labels.removeIngredient}: ${value}`}>
        {options.find((option) => option.value === value)?.label ?? titleize(value)} <span aria-hidden="true">×</span>
      </button>)}
    </div> : null}
  </div>;
}

export function DiscoverySkeleton({ count = 6 }: { count?: number }) {
  return <div className={styles.grid} aria-hidden="true">{Array.from({ length: count }, (_, index) => (
    <div className={styles.card} key={index}><div className={`${styles.media} ${styles.shimmer}`} /><div className={styles.body}>
      <div className={`${styles.skeletonTitle} ${styles.shimmer}`} /><div className={`${styles.skeletonLine} ${styles.shimmer}`} /><div className={`${styles.skeletonLine} ${styles.shimmer}`} />
    </div></div>
  ))}</div>;
}

export default function GalleryDiscovery({ initial }: { initial: GalleryPage }) {
  const locale = initial.state.locale;
  const labels = getGalleryTranslations(locale);
  const params = useSearchParams();
  const state = parseGalleryQueryState(locale, params);
  const requestParams = toGallerySearchParams(state, { includeLocale: true, includeCursor: true }).toString();
  const canonicalParams = toGallerySearchParams(state).toString();
  const initialRequest = toGallerySearchParams(initial.state, { includeLocale: true, includeCursor: true }).toString();
  const [page, setPage] = useState(initial);
  const facetOptionsLoadedRef = useRef(false);
  const facetOptionsRequestRef = useRef<Promise<void> | null>(null);
  const [settledRequest, setSettledRequest] = useState(`${initialRequest}:0`);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreErrorRequest, setLoadMoreErrorRequest] = useState("");
  const [failedRequest, setFailedRequest] = useState("");
  const [retry, setRetry] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<() => Promise<void>>(async () => undefined);
  const advancedFiltersRef = useRef<HTMLDetailsElement | null>(null);
  const includeIngredientsRef = useRef<HTMLDetailsElement | null>(null);
  const requestKey = `${requestParams}:${retry}`;
  const loading = settledRequest !== requestKey;
  const error = failedRequest === requestKey;
  const loadMoreError = loadMoreErrorRequest === requestKey;
  const isRecipeContext = state.type === "all" || state.type === "recipes";
  const isIngredientContext = state.type === "ingredients";
  const activeApplicability = galleryFacetApplicability[state.type];

  const ensureFacetOptions = useCallback(() => {
    if (facetOptionsLoadedRef.current || facetOptionsRequestRef.current) return;
    const request = fetch(`/api/gallery/facets?locale=${locale}`, { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("gallery_facets_request");
        return response.json() as Promise<{ facetOptions: GalleryFacetOptions }>;
      })
      .then(({ facetOptions }) => {
        facetOptionsLoadedRef.current = true;
        setPage((current) => ({ ...current, facetOptions }));
      })
      .catch(() => undefined)
      .finally(() => { facetOptionsRequestRef.current = null; });
    facetOptionsRequestRef.current = request;
  }, [locale]);

  useEffect(() => {
    if (window.location.search.replace(/^\?/, "") !== canonicalParams) {
      const hash = window.location.hash === galleryIncludeIngredientsHash ? window.location.hash : "";
      window.history.replaceState(null, "", `/${locale}/gallery${canonicalParams ? `?${canonicalParams}` : ""}${hash}`);
    }
  }, [canonicalParams, locale]);

  useEffect(() => {
    if (window.location.hash !== galleryIncludeIngredientsHash || !isRecipeContext) return;
    advancedFiltersRef.current?.setAttribute("open", "");
    includeIngredientsRef.current?.setAttribute("open", "");
    window.scrollTo({ top: 0, behavior: "auto" });
    const frameId = window.requestAnimationFrame(() => {
      const target = includeIngredientsRef.current?.querySelector<HTMLInputElement>("input[type='search']")
        ?? includeIngredientsRef.current?.querySelector<HTMLElement>("summary");
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [isRecipeContext, state.type]);

  useEffect(() => {
    if (isIngredientContext) ensureFacetOptions();
  }, [ensureFacetOptions, isIngredientContext]);

  useEffect(() => {
    if (settledRequest === requestKey) return;
    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;
    void fetch(`/api/gallery?${requestParams}`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then((response) => { if (!response.ok) throw new Error("gallery_request"); return response.json() as Promise<GalleryPage>; })
      .then((result) => setPage((current) => ({ ...result, facetOptions: current.facetOptions })))
      .catch(() => { if (!controller.signal.aborted) setFailedRequest(requestKey); })
      .finally(() => { if (!controller.signal.aborted) { setSettledRequest(requestKey); setLoadingMore(false); } });
    return () => controller.abort();
  }, [requestKey, requestParams, settledRequest]);

  function update(next: GalleryQueryState) {
    const normalized = normalizeGalleryQueryState({ ...next, cursor: null });
    const suffix = toGallerySearchParams(normalized).toString();
    window.history.pushState(null, "", `/${locale}/gallery${suffix ? `?${suffix}` : ""}`);
  }
  function filters(patch: Partial<GalleryFilters>) { update({ ...state, filters: { ...state.filters, ...patch }, cursor: null }); }
  function toggle(key: GalleryArrayFilterKey, value: string) {
    const values = state.filters[key] as string[];
    filters({ [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] } as Partial<GalleryFilters>);
  }
  function clear() { update({ ...state, q: "", type: "all", filters: emptyGalleryFilters(), cursor: null }); }
  function removeArrayValue(key: GalleryArrayFilterKey, value: string) { filters({ [key]: (state.filters[key] as string[]).filter((item) => item !== value) } as Partial<GalleryFilters>); }

  useEffect(() => {
    loadMoreRef.current = async () => {
      if (!page.nextCursor || loadingMore) return;
      const controller = new AbortController();
      requestRef.current = controller;
      setLoadingMore(true);
      try {
        const next = toGallerySearchParams({ ...state, cursor: page.nextCursor }, { includeLocale: true, includeCursor: true });
        const response = await fetch(`/api/gallery?${next}`, { signal: controller.signal, headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("gallery_request");
        const result = await response.json() as GalleryPage;
        setPage((current) => {
          const seen = new Set(current.items.map(cardIdentity));
          const items = [...current.items, ...result.items.filter((item) => !seen.has(cardIdentity(item)))];
          return {
            ...result,
            items,
            facetOptions: current.facetOptions,
            totalCount: result.totalCount ?? (result.hasMore ? null : items.length),
          };
        });
      } catch { if (!controller.signal.aborted) setLoadMoreErrorRequest(requestKey); }
      finally { if (!controller.signal.aborted) setLoadingMore(false); }
    };
  }, [loadingMore, page.nextCursor, requestKey, state]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel || loading || loadingMore || error || loadMoreError || !page.nextCursor) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadMoreRef.current();
    }, { rootMargin: "520px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, loadMoreError, loading, loadingMore, page.nextCursor]);

  const optionName = (key: GalleryArrayFilterKey, value: string) => {
    if (key === "categories") return page.facetOptions.categories.find((option) => option.value === value)?.label ?? titleize(value);
    if (key === "meal_moments" || key === "excluded_meal_moments") return labels.mealOptions[value as keyof typeof labels.mealOptions] ?? titleize(value);
    if (key === "component_types" || key === "excluded_component_types" || key === "component_profiles") return labels.componentOptions[value as keyof typeof labels.componentOptions] ?? titleize(value);
    if (key === "ingredients_include" || key === "ingredients_exclude") return page.facetOptions.ingredients.find((option) => option.value === value)?.label ?? titleize(value);
    if (key === "cultural_profiles") return labelFromMap(labels.culturalOptions, value);
    if (key === "menu_function_roles") return labelFromMap(labels.menuRoleOptions, value);
    if (key === "service_modes") return labelFromMap(labels.serviceOptions, value);
    if (key === "taste_profiles") return labelFromMap(labels.tasteOptions, value);
    if (key === "texture_profiles") return labelFromMap(labels.textureOptions, value);
    if (key === "ingredient_categories") return page.facetOptions.ingredientCategories.find((option) => option.value === value)?.label ?? titleize(value);
    if (key === "matrix_families") return page.facetOptions.matrixFamilies.find((option) => option.value === value)?.label ?? titleize(value);
    if (key === "ingredient_states") return page.facetOptions.ingredientStates.find((option) => option.value === value)?.label ?? titleize(value);
    if (key === "processing_types") return page.facetOptions.processingTypes.find((option) => option.value === value)?.label ?? titleize(value);
    if (key === "badges") return page.facetOptions.badges.find((option) => option.value === value)?.label ?? labelFromMap(labels.badgeOptions, value);
    return titleize(value);
  };
  const numericLabels: Partial<Record<GalleryNumericFilterKey, string>> = {
    time_min_minutes: labels.minTime, time_max_minutes: labels.maxTime,
    kcal_min: `${labels.calories} · ${labels.minimum}`, kcal_max: `${labels.calories} · ${labels.maximum}`,
    protein_min: `${labels.protein} · ${labels.minimum}`, protein_max: `${labels.protein} · ${labels.maximum}`,
    carbs_min: `${labels.carbs} · ${labels.minimum}`, carbs_max: `${labels.carbs} · ${labels.maximum}`,
    fat_min: `${labels.fat} · ${labels.minimum}`, fat_max: `${labels.fat} · ${labels.maximum}`,
    fiber_min: `${labels.fiber} · ${labels.minimum}`, fiber_max: `${labels.fiber} · ${labels.maximum}`,
    nutritional_score_min: `${labels.nutritionalScore} · ${labels.minimum}`, nutritional_score_max: `${labels.nutritionalScore} · ${labels.maximum}`,
    servings_min: `${labels.servings} · ${labels.minimum}`, servings_max: `${labels.servings} · ${labels.maximum}`,
    ingredient_kcal_min: `${labels.calories} · ${labels.minimum}`, ingredient_kcal_max: `${labels.calories} · ${labels.maximum}`,
    ingredient_protein_min: `${labels.protein} · ${labels.minimum}`, ingredient_protein_max: `${labels.protein} · ${labels.maximum}`,
    ingredient_carbs_min: `${labels.carbs} · ${labels.minimum}`, ingredient_carbs_max: `${labels.carbs} · ${labels.maximum}`,
    ingredient_fat_min: `${labels.fat} · ${labels.minimum}`, ingredient_fat_max: `${labels.fat} · ${labels.maximum}`,
    ingredient_fiber_min: `${labels.fiber} · ${labels.minimum}`, ingredient_fiber_max: `${labels.fiber} · ${labels.maximum}`,
  };
  const chips: { key: string; text: string; remove: () => void }[] = [];
  if (state.q) chips.push({ key: "q", text: state.q, remove: () => update({ ...state, q: "" }) });
  if (state.type !== "all") chips.push({ key: "type", text: labels[state.type], remove: () => update({ ...state, type: "all" }) });
  for (const key of activeApplicability.arrays) {
    for (const value of state.filters[key] as string[]) {
      const name = optionName(key, value);
      chips.push({ key: `${key}:${value}`, text: key === "ingredients_exclude" ? `${labels.without} ${name}` : key === "ingredients_include" ? `${labels.with} ${name}` : name, remove: () => removeArrayValue(key, value) });
    }
  }
  for (const key of activeApplicability.numerics) {
    const value = state.filters[key] as number | null;
    if (value !== null) chips.push({ key, text: `${numericLabels[key] ?? titleize(key)}: ${value}${key.includes("time") ? ` ${labels.minutes}` : ""}`, remove: () => filters({ [key]: null } as Partial<GalleryFilters>) });
  }

  function card(item: GalleryCard) {
    const galleryReturnPath = `/${locale}/gallery${canonicalParams ? `?${canonicalParams}` : ""}`;
    return <GalleryCardView card={item} locale={locale} returnPath={galleryReturnPath} />;
  }

  const typeOptions = gallerySearchTypes.map((type) => ({ value: type, label: labels[type] }));
  const categoryOptions = [{ value: "", label: labels.any }, ...page.facetOptions.categories.filter((option) => !state.filters.categories.includes(option.value))];

  return <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="gallery-title">
      <div className={styles.atmosphere} aria-hidden="true" />

      <h1 id="gallery-title">{labels.title} <span>{labels.titleAccent}</span></h1>
      <form className={styles.search} role="search" onSubmit={(event) => { event.preventDefault(); update({ ...state, q: String(new FormData(event.currentTarget).get("q") ?? "") }); }}>
        <SearchNormal1 className={styles.searchIcon} size={28} variant="Outline" aria-hidden="true" />
        <input type="search" name="q" key={state.q} aria-label={labels.search} placeholder={labels.search} defaultValue={state.q} autoComplete="off" />
        <button className="cp-btn cp-btn--primary" type="submit">{labels.submit}</button>
      </form>
    </section>
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label={labels.filters}>
        <h2><Setting4 size={22} aria-hidden="true" />{labels.filters}</h2>
        <div className={styles.group}>
          <label htmlFor="gallery-type">{labels.explore}</label>
          <GallerySelect id="gallery-type" value={state.type} options={typeOptions} placeholder={labels.all} onChange={(value) => update({ ...state, type: value as GalleryQueryState["type"] })} />
        </div>

        {isRecipeContext ? <>
          <fieldset className={styles.group}><legend>{labels.meal}</legend><OptionPills options={page.facetOptions.mealMoments} selected={state.filters.meal_moments} onToggle={(value) => toggle("meal_moments", value)} /></fieldset>
          <fieldset className={styles.group}><legend>{labels.component}</legend><OptionPills options={page.facetOptions.componentTypes} selected={state.filters.component_types} onToggle={(value) => toggle("component_types", value)} /></fieldset>
          <div className={styles.group}>
            <label htmlFor="gallery-category">{labels.category}</label>
            <GallerySelect id="gallery-category" value="" options={categoryOptions} placeholder={labels.any} onOpen={ensureFacetOptions} onChange={(value) => { if (value) toggle("categories", value); }} />
          </div>
          <fieldset className={styles.group}><legend>{labels.time}</legend><RangeFields minKey="time_min_minutes" maxKey="time_max_minutes" minValue={state.filters.time_min_minutes} maxValue={state.filters.time_max_minutes} minLabel={labels.minTime} maxLabel={labels.maxTime} placeholder={labels.any} onCommit={filters} /></fieldset>

          <details className={styles.advanced} ref={advancedFiltersRef} onToggle={(event) => { if (event.currentTarget.open) ensureFacetOptions(); }}>
            <DetailsSummary label={labels.moreFilters} hint={labels.advancedHint} />
            <div className={styles.advancedBody}>
              <details className={styles.subgroup} ref={includeIngredientsRef}><DetailsSummary label={labels.includeIngredients} /><IngredientPicker labels={labels} options={page.facetOptions.ingredients} selected={state.filters.ingredients_include} onAdd={(value) => toggle("ingredients_include", value)} onRemove={(value) => removeArrayValue("ingredients_include", value)} /></details>
              <details className={styles.subgroup}><DetailsSummary label={labels.excludeIngredients} /><IngredientPicker labels={labels} options={page.facetOptions.ingredients} selected={state.filters.ingredients_exclude} onAdd={(value) => toggle("ingredients_exclude", value)} onRemove={(value) => removeArrayValue("ingredients_exclude", value)} /></details>
              <details className={styles.subgroup}><DetailsSummary label={labels.culture} /><OptionPills options={page.facetOptions.culturalProfiles} selected={state.filters.cultural_profiles} onToggle={(value) => toggle("cultural_profiles", value)} /></details>
              <details className={styles.subgroup}><DetailsSummary label={`${labels.role} · ${labels.service} · ${labels.taste}`} />
                <div className={styles.subgroupContent}>
                  <span className={styles.subLabel}>{labels.role}</span><OptionPills options={page.facetOptions.menuFunctionRoles} selected={state.filters.menu_function_roles} onToggle={(value) => toggle("menu_function_roles", value)} />
                  <span className={styles.subLabel}>{labels.service}</span><OptionPills options={page.facetOptions.serviceModes} selected={state.filters.service_modes} onToggle={(value) => toggle("service_modes", value)} />
                  <span className={styles.subLabel}>{labels.taste}</span><OptionPills options={page.facetOptions.tasteProfiles} selected={state.filters.taste_profiles} onToggle={(value) => toggle("taste_profiles", value)} />
                </div>
              </details>
              <details className={styles.subgroup}><DetailsSummary label={labels.texture} /><OptionPills options={page.facetOptions.textures} selected={state.filters.texture_profiles} onToggle={(value) => toggle("texture_profiles", value)} /></details>
              <details className={styles.subgroup}><DetailsSummary label={labels.nutrition} />
                <div className={styles.subgroupContent}>
                  <RangeFields minKey="kcal_min" maxKey="kcal_max" minValue={state.filters.kcal_min} maxValue={state.filters.kcal_max} minLabel={labels.calories} maxLabel={labels.maximum} placeholder={labels.any} onCommit={filters} />
                  <RangeFields minKey="protein_min" maxKey="protein_max" minValue={state.filters.protein_min} maxValue={state.filters.protein_max} minLabel={`${labels.protein} · ${labels.minimum}`} maxLabel={`${labels.protein} · ${labels.maximum}`} placeholder={labels.any} onCommit={filters} />
                  <RangeFields minKey="carbs_min" maxKey="carbs_max" minValue={state.filters.carbs_min} maxValue={state.filters.carbs_max} minLabel={`${labels.carbs} · ${labels.minimum}`} maxLabel={`${labels.carbs} · ${labels.maximum}`} placeholder={labels.any} onCommit={filters} />
                  <RangeFields minKey="fat_min" maxKey="fat_max" minValue={state.filters.fat_min} maxValue={state.filters.fat_max} minLabel={`${labels.fat} · ${labels.minimum}`} maxLabel={`${labels.fat} · ${labels.maximum}`} placeholder={labels.any} onCommit={filters} />
                  <RangeFields minKey="fiber_min" maxKey="fiber_max" minValue={state.filters.fiber_min} maxValue={state.filters.fiber_max} minLabel={`${labels.fiber} · ${labels.minimum}`} maxLabel={`${labels.fiber} · ${labels.maximum}`} placeholder={labels.any} onCommit={filters} />
                  <RangeFields minKey="nutritional_score_min" maxKey="nutritional_score_max" minValue={state.filters.nutritional_score_min} maxValue={state.filters.nutritional_score_max} minLabel={`${labels.nutritionalScore} · ${labels.minimum}`} maxLabel={`${labels.nutritionalScore} · ${labels.maximum}`} placeholder={labels.any} onCommit={filters} />
                  <span className={styles.subLabel}>{labels.badges}</span><OptionPills options={page.facetOptions.badges} selected={state.filters.badges} onToggle={(value) => toggle("badges", value)} />
                </div>
              </details>
              <details className={styles.subgroup}><DetailsSummary label={labels.servings} /><RangeFields minKey="servings_min" maxKey="servings_max" minValue={state.filters.servings_min} maxValue={state.filters.servings_max} minLabel={labels.minimum} maxLabel={labels.maximum} placeholder={labels.any} onCommit={filters} /></details>
            </div>
          </details>
        </> : null}

        {isIngredientContext ? <details className={styles.advanced} open>
          <DetailsSummary label={labels.ingredientDomain} hint={labels.advancedHint} />
          <div className={styles.advancedBody}>
            <details className={styles.subgroup} open><DetailsSummary label={labels.classification} /><span className={styles.subLabel}>{labels.category}</span><OptionPills options={page.facetOptions.ingredientCategories} selected={state.filters.ingredient_categories} onToggle={(value) => toggle("ingredient_categories", value)} /><span className={styles.subLabel}>{labels.matrixFamily}</span><OptionPills options={page.facetOptions.matrixFamilies} selected={state.filters.matrix_families} onToggle={(value) => toggle("matrix_families", value)} /></details>
            <details className={styles.subgroup}><DetailsSummary label={`${labels.state} · ${labels.processing}`} /><div className={styles.subgroupContent}><span className={styles.subLabel}>{labels.state}</span><OptionPills options={page.facetOptions.ingredientStates} selected={state.filters.ingredient_states} onToggle={(value) => toggle("ingredient_states", value)} /><span className={styles.subLabel}>{labels.processing}</span><OptionPills options={page.facetOptions.processingTypes} selected={state.filters.processing_types} onToggle={(value) => toggle("processing_types", value)} /></div></details>
            <details className={styles.subgroup}><DetailsSummary label={labels.nutrition} /><div className={styles.subgroupContent}>
              <RangeFields minKey="ingredient_kcal_min" maxKey="ingredient_kcal_max" minValue={state.filters.ingredient_kcal_min} maxValue={state.filters.ingredient_kcal_max} minLabel={labels.calories} maxLabel={labels.maximum} placeholder={labels.any} onCommit={filters} />
              <RangeFields minKey="ingredient_protein_min" maxKey="ingredient_protein_max" minValue={state.filters.ingredient_protein_min} maxValue={state.filters.ingredient_protein_max} minLabel={`${labels.protein} · ${labels.minimum}`} maxLabel={`${labels.protein} · ${labels.maximum}`} placeholder={labels.any} onCommit={filters} />
              <RangeFields minKey="ingredient_carbs_min" maxKey="ingredient_carbs_max" minValue={state.filters.ingredient_carbs_min} maxValue={state.filters.ingredient_carbs_max} minLabel={`${labels.carbs} · ${labels.minimum}`} maxLabel={`${labels.carbs} · ${labels.maximum}`} placeholder={labels.any} onCommit={filters} />
              <RangeFields minKey="ingredient_fat_min" maxKey="ingredient_fat_max" minValue={state.filters.ingredient_fat_min} maxValue={state.filters.ingredient_fat_max} minLabel={`${labels.fat} · ${labels.minimum}`} maxLabel={`${labels.fat} · ${labels.maximum}`} placeholder={labels.any} onCommit={filters} />
              <RangeFields minKey="ingredient_fiber_min" maxKey="ingredient_fiber_max" minValue={state.filters.ingredient_fiber_min} maxValue={state.filters.ingredient_fiber_max} minLabel={`${labels.fiber} · ${labels.minimum}`} maxLabel={`${labels.fiber} · ${labels.maximum}`} placeholder={labels.any} onCommit={filters} />
            </div></details>
          </div>
        </details> : null}

        {!isRecipeContext && !isIngredientContext ? <p className={styles.contextHint}>{labels.contextSearchOnly}</p> : null}
      </aside>
      <section className={styles.results} aria-label={labels.results} aria-busy={loading || loadingMore}>
        {chips.length > 0 ? <div className={styles.activeFilters} aria-label={labels.active}>{chips.map((chip) => <button className={styles.activeChip} key={chip.key} type="button" onClick={chip.remove} aria-label={`${labels.remove}: ${chip.text}`}>{chip.text}<span aria-hidden="true">×</span></button>)}<button className={styles.clear} type="button" onClick={clear}>{labels.clear}</button></div> : null}
        <p className={styles.count} role="status">{loading ? <><span className={`${styles.countSkeleton} ${styles.shimmer}`} aria-hidden="true" /><span className={styles.srOnly}>{labels.loading}</span></> : page.totalCount !== null ? `${page.totalCount} ${labels.results}` : `${labels.moreThan} ${page.items.length} ${labels.results}`}</p>
        {error ? <div className={styles.empty} role="alert"><p>{labels.error}</p><button className="cp-btn cp-btn--secondary" type="button" onClick={() => setRetry((value) => value + 1)}>{labels.retry}</button></div> : loading ? <DiscoverySkeleton /> : page.items.length ? <div className={styles.grid}>{page.items.map(card)}</div> : <div className={styles.empty}><SearchNormal1 size={40} aria-hidden="true" /><h2>{labels.noResults}</h2><p>{labels.emptyHint}</p><button className="cp-btn cp-btn--secondary" type="button" onClick={clear}>{labels.clear}</button></div>}
        {loadingMore ? <DiscoverySkeleton count={9} /> : null}
        {loadMoreError ? <div className={styles.loadMoreError} role="alert"><p>{labels.error}</p><button className="cp-btn cp-btn--secondary" type="button" onClick={() => { setLoadMoreErrorRequest(""); void loadMoreRef.current(); }}>{labels.retry}</button></div> : null}
        {!loading && !error && !loadMoreError && page.nextCursor ? <div ref={loadMoreSentinelRef} className={styles.loadMoreSentinel} aria-hidden="true" /> : null}
      </section>
    </div>
  </main>;
}
