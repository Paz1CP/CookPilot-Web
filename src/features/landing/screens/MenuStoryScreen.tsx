"use client";

import Image from "next/image";
import { useLocale } from "@/contexts/LanguageContext";
import { landingAssets } from "../data/landing-assets";

export default function MenuStoryScreen() {
  const copy = useLocale().t.landing.menu;

  return (
    <section className="lc-own lc-wrap" id="make-it-yours" aria-labelledby="lc-own-title">
      <header className="lc-menu-intro" data-lc-reveal>
        <div>
          <span className="lc-menu-eyebrow">{copy.eyebrow}</span>
          <h2 id="lc-own-title">{copy.title}<br /><em>{copy.accent}</em></h2>
        </div>
        <p>{copy.description}</p>
      </header>
      <div className="lc-menu-rail-wrap">
        <div className="lc-menu-rail" aria-label={copy.railAria}>
          {copy.items.map((item, index) => (
            <article className={`lc-menu-card ${index === 0 ? "is-featured" : ""}`} key={item.name}>
              <div className="lc-menu-card-image">
                <Image src={landingAssets.menu[index]} alt={item.name} width={960} height={640} loading={index < 2 ? "eager" : "lazy"} />
              </div>
              <div className="lc-menu-card-copy">
                <h3>{item.name}</h3>
                <p><strong>{item.lead}</strong><span>{item.copy}</span></p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <footer className="lc-menu-footer">
        <span className="lc-menu-rule" />
        <strong>{copy.footer}</strong>
        <span className="lc-menu-rule" />
        <small>{copy.meta}</small>
      </footer>
    </section>
  );
}
