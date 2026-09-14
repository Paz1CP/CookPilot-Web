"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, SearchNormal1, Setting4 } from "iconsax-reactjs";
import { emptyGalleryFilters, gallerySearchTypes, parseGalleryQueryState, toGallerySearchParams } from "@/lib/cookshare/gallery-query";
import { inlineMarkdownToText } from "@/lib/cookshare/inline-markdown";
import type { GalleryCard, GalleryFilters, GalleryPage, GalleryQueryState } from "@/lib/cookshare/types";
import es from "@/locales/gallery.es.json";
import en from "@/locales/gallery.en.json";
import styles from "./GalleryDiscovery.module.css";

type PrimaryArrayFilter = "categories" | "meal_moments" | "component_types" | "ingredients_include" | "ingredients_exclude";

export function DiscoverySkeleton({ count = 6 }: { count?: number }) {
  return <div className={styles.grid} aria-hidden="true">{Array.from({ length: count }, (_, index) => (
    <div className={styles.card} key={index}><div className={`${styles.media} ${styles.shimmer}`} /><div className={styles.body}>
      <div className={`${styles.skeletonTitle} ${styles.shimmer}`} /><div className={`${styles.skeletonLine} ${styles.shimmer}`} /><div className={`${styles.skeletonLine} ${styles.shimmer}`} />
    </div></div>
  ))}</div>;
}

function cardIdentity(item: GalleryCard) { return `${item.objectType}:${item.objectId}`; }
function titleize(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export default function GalleryDiscovery({ initial }: { initial: GalleryPage }) {
  const locale = initial.state.locale;
  const labels = locale === "es" ? es : en;
  const params = useSearchParams();
  const state = parseGalleryQueryState(locale, params);
  const requestParams = toGallerySearchParams(state, { includeLocale: true, includeCursor: true }).toString();
  const initialRequest = toGallerySearchParams(initial.state, { includeLocale: true, includeCursor: true }).toString();
  const [page, setPage] = useState(initial);
  const [settledRequest, setSettledRequest] = useState(`${initialRequest}:0`);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [failedRequest, setFailedRequest] = useState("");
  const [retry, setRetry] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const requestKey = `${requestParams}:${retry}`;
  const loading = settledRequest !== requestKey;
  const error = failedRequest === requestKey;

  useEffect(() => {
    if (settledRequest === requestKey) return;
    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;
    setLoadMoreError(false);
    void fetch(`/api/gallery?${requestParams}`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then((response) => { if (!response.ok) throw new Error("gallery_request"); return response.json() as Promise<GalleryPage>; })
      .then(setPage)
      .catch(() => { if (!controller.signal.aborted) setFailedRequest(requestKey); })
      .finally(() => { if (!controller.signal.aborted) { setSettledRequest(requestKey); setLoadingMore(false); } });
    return () => controller.abort();
  }, [requestKey, requestParams, settledRequest]);

  function update(next: GalleryQueryState) {
    const suffix = toGallerySearchParams({ ...next, cursor: null }).toString();
    window.history.pushState(null, "", `/${locale}/gallery${suffix ? `?${suffix}` : ""}`);
  }
  function filters(patch: Partial<GalleryFilters>) { update({ ...state, filters: { ...state.filters, ...patch } }); }
  function toggle(key: PrimaryArrayFilter, value: string) {
    const values = state.filters[key] as string[];
    filters({ [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] } as Partial<GalleryFilters>);
  }
  function clear() { update({ ...state, q: "", type: "all", filters: emptyGalleryFilters() }); }
  const more = useCallback(async () => {
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
        return { ...result, items: [...current.items, ...result.items.filter((item) => !seen.has(cardIdentity(item)))] };
      });
    } catch { if (!controller.signal.aborted) setLoadMoreError(true); }
    finally { if (!controller.signal.aborted) setLoadingMore(false); }
  }, [loadingMore, page.nextCursor, requestKey, state]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel || loading || loadingMore || error || loadMoreError || !page.nextCursor) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void more();
    }, { rootMargin: "520px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, loadMoreError, loading, loadingMore, more, page.nextCursor]);

  const optionName = (key: PrimaryArrayFilter, value: string) => {
    if (key === "categories") return page.facetOptions.categories.find((option) => option.value === value)?.label ?? titleize(value);
    if (key === "meal_moments") return labels.mealOptions[value as keyof typeof labels.mealOptions] ?? titleize(value);
    if (key === "component_types") return labels.componentOptions[value as keyof typeof labels.componentOptions] ?? titleize(value);
    return value;
  };
  const chips: { key: string; text: string; remove: () => void }[] = [];
  if (state.q) chips.push({ key: "q", text: state.q, remove: () => update({ ...state, q: "" }) });
  if (state.type !== "all") chips.push({ key: "type", text: labels[state.type], remove: () => update({ ...state, type: "all" }) });
  for (const key of ["categories", "meal_moments", "component_types", "ingredients_include", "ingredients_exclude"] as const) {
    for (const value of state.filters[key]) {
      const name = optionName(key, value);
      chips.push({ key: `${key}:${value}`, text: key === "ingredients_exclude" ? `${labels.without} ${name}` : key === "ingredients_include" ? `${labels.with} ${name}` : name, remove: () => toggle(key, value) });
    }
  }
  for (const [key, label] of [["time_min_minutes", labels.minTime], ["time_max_minutes", labels.maxTime]] as const) {
    const value = state.filters[key];
    if (value !== null) chips.push({ key, text: `${label} ${value} ${labels.minutes}`, remove: () => filters({ [key]: null } as Partial<GalleryFilters>) });
  }
  for (const key of ["cultural_profiles", "badges", "excluded_meal_moments", "excluded_component_types", "menu_function_roles", "service_modes", "cultural_intents", "taste_profiles", "component_profiles", "ingredient_categories", "matrix_families", "ingredient_states", "processing_types"] as const) {
    for (const value of state.filters[key]) chips.push({ key: `${key}:${value}`, text: titleize(value), remove: () => filters({ [key]: state.filters[key].filter((item) => item !== value) } as Partial<GalleryFilters>) });
  }

  function card(item: GalleryCard) {
    return <Link href={item.href} className={styles.card} key={cardIdentity(item)}>
      <div className={styles.media}>{item.imageUrl ? <Image src={item.imageUrl} alt={item.title} width={720} height={720} sizes="(max-width: 700px) 90vw, (max-width: 1200px) 38vw, 28vw" /> : <span className={styles.fallback}>{labels.brand}</span>}</div>
      <div className={styles.body}>
        {item.objectType !== "recipe" ? <span className={styles.type}>{labels.types[item.objectType]}</span> : null}
        <h2>{item.title}</h2>
        {item.description ? <p>{inlineMarkdownToText(item.description)}</p> : null}
        {item.timeMinutes !== null ? <span className={styles.timeChip}><Clock size={18} aria-hidden="true" />{item.timeMinutes} {labels.minutes}</span> : null}
      </div>
    </Link>;
  }

  return <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="gallery-title">
      <div className={styles.atmosphere} aria-hidden="true" />
      <h1 id="gallery-title">{labels.title} <span>{labels.titleAccent}</span></h1>
      <form className={styles.search} role="search" onSubmit={(event) => { event.preventDefault(); update({ ...state, q: String(new FormData(event.currentTarget).get("q") ?? "") }); }}>
        <SearchNormal1 className={styles.searchIcon} size={28} variant="Outline" aria-hidden="true" />
        <input type="search" name="q" key={state.q} aria-label={labels.search} placeholder={labels.search} defaultValue={state.q} autoComplete="off" />
        <button className="cp-btn cp-btn--primary" type="submit">{labels.submit}<span aria-hidden="true">↗</span></button>
      </form>
    </section>
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label={labels.filters}>
        <h2><Setting4 size={22} aria-hidden="true" />{labels.filters}</h2>
        <div className={styles.group}><label htmlFor="gallery-type">{labels.explore}</label><select id="gallery-type" value={state.type} onChange={(event) => update({ ...state, type: event.target.value as GalleryQueryState["type"] })}>{gallerySearchTypes.map((type) => <option key={type} value={type}>{labels[type]}</option>)}</select></div>
        {([['meal_moments', 'meal'], ['component_types', 'component']] as const).map(([key, label]) => <fieldset className={styles.group} key={key}><legend>{labels[label]}</legend><div className={styles.options}>{(key === "meal_moments" ? page.facetOptions.mealMoments : page.facetOptions.componentTypes).map((option) => <button type="button" key={option.value} aria-pressed={state.filters[key].includes(option.value as never)} onClick={() => toggle(key, option.value)}>{option.label}</button>)}</div></fieldset>)}
        <div className={styles.group}>
          <label htmlFor="gallery-category">{labels.category}</label>
          <select id="gallery-category" value="" onChange={(event) => { if (event.target.value) toggle("categories", event.target.value); }}>
            <option value="">{labels.any}</option>{page.facetOptions.categories.map((option) => <option key={option.value} value={option.value} disabled={state.filters.categories.includes(option.value)}>{option.label}</option>)}
          </select>
        </div>
        <fieldset className={styles.group}><legend>{labels.time}</legend><div className={styles.timeRange}>{([['time_min_minutes', 'minTime'], ['time_max_minutes', 'maxTime']] as const).map(([key, label]) => <label key={key}>{labels[label]}<input type="number" min="0" max="1440" step="1" inputMode="numeric" value={state.filters[key] ?? ""} placeholder={labels.any} onChange={(event) => filters({ [key]: event.target.value === "" ? null : Math.max(0, Number(event.target.value)) } as Partial<GalleryFilters>)} /></label>)}</div></fieldset>
      </aside>
      <section className={styles.results} aria-label={labels.results} aria-busy={loading || loadingMore}>
        {chips.length > 0 ? <div className={styles.activeFilters} aria-label={labels.active}>{chips.map((chip) => <button className={styles.activeChip} key={chip.key} onClick={chip.remove} aria-label={`${labels.remove}: ${chip.text}`}>{chip.text}<span aria-hidden="true">×</span></button>)}<button className={styles.clear} onClick={clear}>{labels.clear}</button></div> : null}
        <p className={styles.count} role="status">{loading ? <><span className={`${styles.countSkeleton} ${styles.shimmer}`} aria-hidden="true" /><span className={styles.srOnly}>{labels.loading}</span></> : `${page.items.length} ${labels.results}`}</p>
        {error ? <div className={styles.empty} role="alert"><p>{labels.error}</p><button className="cp-btn cp-btn--secondary" onClick={() => setRetry((value) => value + 1)}>{labels.retry}</button></div> : loading ? <DiscoverySkeleton /> : page.items.length ? <div className={styles.grid}>{page.items.map(card)}</div> : <div className={styles.empty}><SearchNormal1 size={40} aria-hidden="true" /><h2>{labels.noResults}</h2><p>{labels.emptyHint}</p><button className="cp-btn cp-btn--secondary" onClick={clear}>{labels.clear}</button></div>}
        {loadingMore ? <DiscoverySkeleton count={9} /> : null}
        {loadMoreError ? <div className={styles.loadMoreError} role="alert"><p>{labels.error}</p><button className="cp-btn cp-btn--secondary" onClick={() => { setLoadMoreError(false); void more(); }}>{labels.retry}</button></div> : null}
        {!loading && !error && !loadMoreError && page.nextCursor ? <div ref={loadMoreSentinelRef} className={styles.loadMoreSentinel} aria-hidden="true" /> : null}
      </section>
    </div>
  </main>;
}
