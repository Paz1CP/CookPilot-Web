"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/contexts/LanguageContext";
import { landingAssets, landingLinks } from "../data/landing-assets";

export default function DiscoveryScreen() {
  const copy = useLocale().t.landing.discovery;
  const rail = useRef<HTMLDivElement>(null);
  const cards = useRef<Array<HTMLButtonElement | null>>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const displayedRecipe = copy.recipes[hoveredIndex ?? selectedIndex];

  function selectRecipe(index: number) {
    const nextIndex = Math.max(0, Math.min(copy.recipes.length - 1, index));
    setSelectedIndex(nextIndex);
    setHoveredIndex(null);
    window.requestAnimationFrame(() => {
      const element = rail.current;
      const card = cards.current[nextIndex];
      if (!element || !card) return;
      const left = card.offsetLeft - (element.clientWidth - card.offsetWidth) / 2;
      element.scrollTo({
        left: Math.max(0, left),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
  }

  return (
    <section className="lc-discovery" id="explore" aria-labelledby="lc-explore-title">
      <header className="lc-wrap lc-explore-heading">
        <h2 id="lc-explore-title" data-lc-reveal>{copy.title}<br /><em>{copy.accent}</em></h2>
        <a className="lc-explore-cta" href={landingLinks.gallery}>{copy.cta}</a>
      </header>
      <div
        className="lc-recipe-rail"
        ref={rail}
        tabIndex={0}
        aria-label={copy.railAria}
        onKeyDown={(event) => {
          if (event.target === event.currentTarget && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            selectRecipe(selectedIndex + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
      >
        {copy.recipes.map((recipe, index) => (
          <button
            className="lc-recipe-card"
            key={recipe.title}
            type="button"
            ref={(element) => { cards.current[index] = element; }}
            aria-current={selectedIndex === index ? "true" : undefined}
            onClick={() => selectRecipe(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
          >
            <Image src={landingAssets.discoveryRecipes[index]} alt={recipe.title} width={420} height={520} loading="lazy" />
            <div><span className="lc-meta">{recipe.eyebrow}</span><h3>{recipe.title}</h3></div>
          </button>
        ))}
      </div>
      <div className="lc-wrap lc-discovery-bottom">
        <p className="lc-discovery-description" key={displayedRecipe.title}>{displayedRecipe.description}</p>
        <div className="lc-rail-controls">
          <button type="button" aria-label={copy.previous} disabled={selectedIndex === 0} onClick={() => selectRecipe(selectedIndex - 1)}>←</button>
          <button type="button" aria-label={copy.next} disabled={selectedIndex === copy.recipes.length - 1} onClick={() => selectRecipe(selectedIndex + 1)}>→</button>
        </div>
      </div>
    </section>
  );
}
