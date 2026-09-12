"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/contexts/LanguageContext";
import { Bookmark } from "../components/LandingIcons";
import { landingAssets } from "../data/landing-assets";

export default function SavedRecipesScreen() {
  const copy = useLocale().t.landing.saved;
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  return (
    <>
      <section className="lc-keep lc-memory" id="keep-it" aria-labelledby="lc-keep-title">
        <div className="lc-wrap">
          <header className="lc-memory-heading" data-lc-reveal>
            <h2 id="lc-keep-title">{copy.title}<br /><em>{copy.accent}</em></h2>
            <p>{copy.description}</p>
          </header>
          <div className="lc-memory-gallery" data-lc-reveal>
            {copy.recipes.map((recipe, index) => {
              const isSaved = savedIds.includes(recipe.id);
              return (
                <article className={`lc-memory-card ${index === 0 ? "lc-memory-card--hero" : ""} ${isSaved ? "is-saved" : ""}`} key={recipe.id}>
                  <span className="lc-memory-card-image">
                    <Image src={landingAssets.savedRecipes[index]} alt={recipe.name} width={1200} height={1200} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
                    <button
                      className="lc-memory-card-save"
                      type="button"
                      aria-label={`${isSaved ? copy.remove : copy.save} ${recipe.name}`}
                      aria-pressed={isSaved}
                      onClick={() => {
                        setSavedIds((current) => isSaved ? current.filter((id) => id !== recipe.id) : [...current, recipe.id]);
                        setNotice(isSaved ? copy.removed : recipe.saveCopy);
                      }}
                    ><Bookmark filled={isSaved} /></button>
                  </span>
                  <span className="lc-memory-card-copy"><strong>{recipe.name}</strong><span>{recipe.descriptor}</span></span>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <div className={`lc-save-toast ${notice ? "is-visible" : ""}`} role="status" aria-live="polite" aria-atomic="true">
        <span className="lc-save-toast-check" aria-hidden="true">✓</span><span>{notice || copy.fallback}</span>
      </div>
    </>
  );
}
