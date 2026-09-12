"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "@/contexts/LanguageContext";
import { landingAssets } from "../data/landing-assets";

type Plan = "free" | "pro";
type BenefitCopy = { firstLine: string; secondLine: string; highlight: string; subtitle: string };

export default function ProComparisonScreen() {
  const copy = useLocale().t.landing.pro;
  const [plan, setPlan] = useState<Plan>("pro");

  return (
    <section className="lc-pro lc-wrap" id="go-pro" aria-labelledby="lc-pro-title">
      <div className="lc-pro-panel" data-plan={plan}>
        <header className="lc-pro-header" data-lc-reveal>
          <h2 id="lc-pro-title">{copy.title}<br /><em>{copy.accent}</em></h2>
          <div className="lc-pro-controls">
            <div className="lc-pro-price" aria-label={copy.priceAria}>
              <span className="lc-pro-price-intro">{copy.priceIntro}</span>
              <span className="lc-pro-price-currency">{copy.currency}</span>
              <span className="lc-pro-price-amount">{copy.amount}</span>
            </div>
            <div className="lc-pro-switch" role="group" aria-label={copy.compareAria}>
              <button type="button" className={plan === "free" ? "is-active" : ""} aria-pressed={plan === "free"} onClick={() => setPlan("free")}>{copy.free}</button>
              <button type="button" className={plan === "pro" ? "is-active" : ""} aria-pressed={plan === "pro"} onClick={() => setPlan("pro")}>{copy.pro}</button>
            </div>
          </div>
        </header>
        <div className="lc-pro-cards">
          {copy.benefits.map((benefit, index) => {
            const active = (plan === "free" && "free" in benefit && benefit.free ? benefit.free : benefit.pro) as BenefitCopy;
            const hasFree = "free" in benefit && Boolean(benefit.free);
            const isDimmed = plan === "free" && !hasFree;
            const isReduced = plan === "free" && hasFree;
            return (
              <article className={`lc-pro-card is-${benefit.id}${isDimmed ? " is-dimmed" : ""}${isReduced ? " is-reduced" : ""}`} key={benefit.id}>
                <div className="lc-pro-card-copy" key={`${plan}-${benefit.id}`}>
                  <h3 className="lc-pro-claim">
                    <span className={active.highlight === "first" ? "lc-pro-highlight" : ""}>{active.firstLine}</span>
                    <span className={active.highlight === "second" ? "lc-pro-highlight" : ""}>{active.secondLine}</span>
                  </h3>
                  <p>{active.subtitle}</p>
                </div>
                <Image className="lc-pro-icon" src={landingAssets.proBenefits[index]} alt="" width={640} height={640} loading="lazy" decoding="async" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
