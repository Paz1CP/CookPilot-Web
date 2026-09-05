"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GalleryCard, GalleryPage, GalleryState } from "@/lib/cookshare/types";
import styles from "./GalleryClient.module.css";

export default function GalleryClient({ initial }: { initial: GalleryPage }) {
  const router = useRouter();
  const [items, setItems] = useState<GalleryCard[]>(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<GalleryState>(initial.state);

  const updateState = (next: Partial<GalleryState>) => {
    const updated = { ...state, ...next, cursor: null };
    setState(updated);
    const params = new URLSearchParams();
    if (updated.q) params.set("q", updated.q);
    if (updated.type !== "all") params.set("type", updated.type);
    router.push(`${updated.locale === "en" ? "/en" : "/es"}/gallery${params.toString() ? `?${params}` : ""}`);
  };

  const search = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateState({ q: String(form.get("q") ?? "") });
    setLoading(true);
    try {
      const params = new URLSearchParams({ locale: state.locale, q: String(form.get("q") ?? ""), type: state.type });
      const response = await fetch(`/api/gallery?${params}`, { cache: "no-store" });
      const page = await response.json() as GalleryPage;
      setItems(page.items); setCursor(page.nextCursor); setState(page.state);
    } finally { setLoading(false); }
  };

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ locale: state.locale, type: state.type, cursor });
      if (state.q) params.set("q", state.q);
      const response = await fetch(`/api/gallery?${params}`, { cache: "no-store" });
      const page = await response.json() as GalleryPage;
      setItems((current) => [...current, ...page.items]); setCursor(page.nextCursor);
    } finally { setLoading(false); }
  };

  const labels = state.locale === "es" ? { all: "Todo", recipes: "Recetas", menus: "Menús", days: "Días", weeks: "Semanas", ingredients: "Ingredientes", search: "Buscar recetas", submit: "Buscar", more: "Cargar más" } : { all: "All", recipes: "Recipes", menus: "Menus", days: "Days", weeks: "Weeks", ingredients: "Ingredients", search: "Search recipes", submit: "Search", more: "Load more" };
  return <div className={styles.content}>
    <form className={styles.search} onSubmit={search}><label htmlFor="gallery-q">{labels.search}</label><div><input id="gallery-q" name="q" defaultValue={state.q} placeholder={labels.search} /><button type="submit" disabled={loading}>{labels.submit}</button></div></form>
    <div className={styles.filters} role="group" aria-label="Gallery filters">{(["all", "recipes", "menus", "days", "weeks", "ingredients"] as const).map((type) => <button key={type} type="button" className={state.type === type ? styles.active : ""} onClick={() => updateState({ type })}>{labels[type]}</button>)}</div>
    {items.length ? <div className={styles.grid}>{items.map((item) => <Link key={item.objectId} href={item.href} className={styles.card}>{item.imageUrl ? <Image src={item.imageUrl} alt={item.title} width={640} height={440} sizes="(max-width: 680px) 100vw, (max-width: 1040px) 50vw, 33vw" loading="lazy" /> : <div className={styles.fallback} aria-hidden="true">CookPilot</div>}<div className={styles.body}><h2>{item.title}</h2><div className={styles.meta}>{item.timeMinutes ? <span>{item.timeMinutes} min</span> : null}{item.isFree ? <span>{state.locale === "es" ? "Gratis" : "Free"}</span> : null}</div></div></Link>)}</div> : <p className={styles.empty}>{state.locale === "es" ? "No encontramos objetos con esos filtros." : "No objects match those filters."}</p>}
    {cursor ? <button type="button" className="cp-btn cp-btn--secondary" onClick={loadMore} disabled={loading}>{loading ? "…" : labels.more}</button> : null}
  </div>;
}
