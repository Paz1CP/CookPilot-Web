"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchNormal1, Clock, Setting4 } from "iconsax-reactjs";
import { emptyGalleryFacets, parseGalleryState, toGallerySearchParams } from "@/lib/cookshare/gallery-query";
import { inlineMarkdownToText } from "@/lib/cookshare/inline-markdown";
import type { GalleryCard, GalleryPage, GalleryState } from "@/lib/cookshare/types";
import es from "@/locales/gallery.es.json";
import en from "@/locales/gallery.en.json";
import styles from "./GalleryDiscovery.module.css";

const contentTypes = ["all", "recipes", "menus", "days", "weeks", "ingredients", "categories"] as const;
type MultiFacet = "categories" | "meals" | "components" | "ingredients" | "excludedIngredients";

export function DiscoverySkeleton() {
  return <div className={styles.grid} aria-hidden="true">{Array.from({ length: 6 }, (_, index) => (
    <div className={styles.card} key={index}><div className={`${styles.media} ${styles.shimmer}`} /><div className={styles.body}>
      <div className={`${styles.skeletonTitle} ${styles.shimmer}`} /><div className={`${styles.skeletonLine} ${styles.shimmer}`} /><div className={`${styles.skeletonLine} ${styles.shimmer}`} />
    </div></div>
  ))}</div>;
}

export default function GalleryDiscovery({ initial }: { initial: GalleryPage }) {
  const locale = initial.state.locale;
  const labels = locale === "es" ? es : en;
  const params = useSearchParams();
  const state = parseGalleryState(locale, params);
  const requestParams = toGallerySearchParams(state, { includeLocale: true, includeCursor: true }).toString();
  const [page, setPage] = useState(initial);
  const [settledRequest, setSettledRequest] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [failedRequest, setFailedRequest] = useState("");
  const [retry, setRetry] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const requestKey = `${requestParams}:${retry}`;
  const loading = settledRequest !== requestKey;
  const error = failedRequest === requestKey;

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;
    void fetch(`/api/gallery?${requestParams}`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(response => { if (!response.ok) throw new Error("gallery_request"); return response.json() as Promise<GalleryPage>; })
      .then(setPage)
      .catch(() => { if (!controller.signal.aborted) setFailedRequest(requestKey); })
      .finally(() => { if (!controller.signal.aborted) { setSettledRequest(requestKey); setLoadingMore(false); } });
    return () => controller.abort();
  }, [requestParams, requestKey]);

  function update(next: GalleryState) {
    const nextParams = toGallerySearchParams({ ...next, cursor: null });
    const suffix = nextParams.toString();
    window.history.pushState(null, "", `/${locale}/gallery${suffix ? `?${suffix}` : ""}`);
  }
  function facet(patch: Partial<GalleryState["facets"]>) { update({ ...state, facets: { ...state.facets, ...patch } }); }
  function toggle(key: MultiFacet, value: string) {
    const values = state.facets[key];
    facet({ [key]: values.includes(value) ? values.filter(item => item !== value) : [...values, value].slice(0, 8) });
  }
  function clear() { update({ ...state, q: "", type: "all", facets: emptyGalleryFacets() }); }
  async function more() {
    if (!page.nextCursor || loadingMore) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setLoadingMore(true);
    setFailedRequest("");
    try {
      const next = toGallerySearchParams({ ...state, cursor: page.nextCursor }, { includeLocale: true, includeCursor: true });
      const response = await fetch(`/api/gallery?${next}`, { signal: controller.signal });
      if (!response.ok) throw new Error("gallery_request");
      const result = await response.json() as GalleryPage;
      setPage(current => {
        const seen = new Set(current.items.map(item => item.href));
        return { ...result, items: [...current.items, ...result.items.filter(item => !seen.has(item.href))] };
      });
    } catch { if (!controller.signal.aborted) setFailedRequest(requestKey); }
    finally { if (!controller.signal.aborted) setLoadingMore(false); }
  }

  const chips: { key: string; text: string; remove: () => void }[] = [];
  if (state.q) chips.push({ key: "q", text: state.q, remove: () => update({ ...state, q: "" }) });
  if (state.type !== "all") chips.push({ key: "type", text: labels[state.type], remove: () => update({ ...state, type: "all" }) });
  for (const key of ["categories", "meals", "components", "ingredients", "excludedIngredients"] as const) {
    for (const value of state.facets[key]) {
      const options = key === "categories" || key === "meals" || key === "components" ? page.facetOptions[key] : [];
      const name = options.find(option => option.value === value)?.label ?? value.replaceAll("_", " ");
      chips.push({ key: `${key}:${value}`, text: key === "excludedIngredients" ? `${labels.without} ${name}` : name, remove: () => facet({ [key]: state.facets[key].filter(item => item !== value) }) });
    }
  }
  for (const key of ["minTime", "maxTime"] as const) {
    if (state.facets[key] !== null) chips.push({ key, text: `${labels[key]} ${state.facets[key]} ${labels.minutes}`, remove: () => facet({ [key]: null }) });
  }
  const items = page.items;

  function card(item: GalleryCard) {
    return <Link href={item.href} className={styles.card} key={item.href}>
      <div className={styles.media}>{item.imageUrl ? <Image src={item.imageUrl} alt={item.title} width={720} height={720} sizes="(max-width: 700px) 90vw, (max-width: 1200px) 38vw, 28vw" /> : <span className={styles.fallback}>{labels.brand}</span>}</div>
      <div className={styles.body}>
        {item.objectType !== "recipe" ? <span className={styles.type}>{labels.types[item.objectType]}</span> : null}
        <h2>{item.title}</h2>
        {item.description ? <p>{inlineMarkdownToText(item.description)}</p> : null}
        {item.timeMinutes ? <span className={styles.timeChip}><Clock size={18} aria-hidden="true" />{item.timeMinutes} {labels.minutes}</span> : null}
      </div>
    </Link>;
  }

  return <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="gallery-title">
      <div className={styles.atmosphere} aria-hidden="true" />
      <h1 id="gallery-title">{labels.title} <span>{labels.titleAccent}</span></h1>
      <form className={styles.search} role="search" onSubmit={event => { event.preventDefault(); update({ ...state, q: String(new FormData(event.currentTarget).get("q") ?? "") }); }}>
        <SearchNormal1 className={styles.searchIcon} size={28} variant="Outline" aria-hidden="true" />
        <input type="search" name="q" key={state.q} aria-label={labels.search} placeholder={labels.search} defaultValue={state.q} autoComplete="off" />
        <button className="cp-btn cp-btn--primary" type="submit">{labels.submit}<span aria-hidden="true">↗</span></button>
      </form>
    </section>
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label={labels.filters}>
        <h2><Setting4 size={22} aria-hidden="true" />{labels.filters}</h2>
        <div className={styles.group}><label htmlFor="gallery-type">{labels.explore}</label><select id="gallery-type" value={state.type} onChange={event => update({ ...state, type: event.target.value as GalleryState["type"] })}>{contentTypes.map(type => <option key={type} value={type}>{labels[type]}</option>)}</select></div>
        {([['meals', 'meal'], ['components', 'component']] as const).map(([key, label]) => <fieldset className={styles.group} key={key}><legend>{labels[label]}</legend><div className={styles.options}>{page.facetOptions[key].map(option => <button type="button" key={option.value} aria-pressed={state.facets[key].includes(option.value)} onClick={() => toggle(key, option.value)}>{option.label}</button>)}</div></fieldset>)}
        <div className={styles.group}>
          <label htmlFor="gallery-category">{labels.category}</label>
          <select id="gallery-category" value="" onChange={event => { if (event.target.value) toggle("categories", event.target.value); }}>
            <option value="">{labels.any}</option>{page.facetOptions.categories.map(option => <option key={option.value} value={option.value} disabled={state.facets.categories.includes(option.value)}>{option.label}</option>)}
          </select>
        </div>
        <fieldset className={styles.group}><legend>{labels.time}</legend><div className={styles.timeRange}>{(["minTime", "maxTime"] as const).map(key => <label key={key}>{labels[key]}<select value={state.facets[key] ?? ""} onChange={event => facet({ [key]: event.target.value ? Number(event.target.value) : null })}><option value="">{labels.any}</option>{page.facetOptions.times.map(time => <option key={time} value={time}>{time} {labels.minutes}</option>)}</select></label>)}</div></fieldset>
      </aside>
      <section className={styles.results} aria-label={labels.results} aria-busy={loading || loadingMore}>
        {chips.length > 0 ? <div className={styles.activeFilters} aria-label={labels.active}>{chips.map(chip => <button className={styles.activeChip} key={chip.key} onClick={chip.remove} aria-label={`${labels.remove}: ${chip.text}`}>{chip.text}<span aria-hidden="true">×</span></button>)}<button className={styles.clear} onClick={clear}>{labels.clear}</button></div> : null}
        <p className={styles.count} role="status">{loading ? <><span className={`${styles.countSkeleton} ${styles.shimmer}`} aria-hidden="true" /><span className={styles.srOnly}>{labels.loading}</span></> : `${items.length} ${labels.results}`}</p>
        {error ? <div className={styles.empty} role="alert"><p>{labels.error}</p><button className="cp-btn cp-btn--secondary" onClick={() => setRetry(value => value + 1)}>{labels.retry}</button></div> : loading ? <DiscoverySkeleton /> : items.length ? <div className={styles.grid}>{items.map(card)}</div> : <div className={styles.empty}><SearchNormal1 size={40} aria-hidden="true" /><h2>{labels.noResults}</h2><p>{labels.emptyHint}</p><button className="cp-btn cp-btn--secondary" onClick={clear}>{labels.clear}</button></div>}
        {loadingMore ? <DiscoverySkeleton /> : null}
        {!loading && !error && page.nextCursor ? <div className={styles.more}><button className="cp-btn cp-btn--secondary" disabled={loadingMore} onClick={() => void more()}>{labels.more}<span aria-hidden="true">↓</span></button></div> : null}
      </section>
    </div>
  </main>;
}
