"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/contexts/LanguageContext";
import { landingAssets } from "../data/landing-assets";

export default function GuidedCookingScreen() {
  const copy = useLocale().t.landing.guided;
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveStep((current) => (current + 1) % copy.steps.length), 4000);
    return () => window.clearInterval(timer);
  }, [copy.steps.length]);

  return (
    <section className="lc-guided" id="stay-with-the-food" aria-labelledby="lc-cook-title">
      <div className="lc-wrap lc-guided-grid">
        <div className="lc-guided-copy" data-lc-reveal>
          <h2 id="lc-cook-title">{copy.title}<br /><em>{copy.accent}</em></h2>
          <p>{copy.descriptionBefore}<strong>{copy.timing}</strong>{copy.betweenTimingAndGuidance}<strong>{copy.guidance}</strong>{copy.betweenGuidanceAndNext}<strong>{copy.nextMove}</strong>{copy.descriptionMiddle}<strong>{copy.prep}</strong>{copy.descriptionAfter}</p>
          <div className="lc-guided-phone">
            <Image src="/images/app/cookmode_iphone.png" alt={copy.phoneAlt} width={2832} height={5619} loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="lc-guided-stage" data-lc-reveal>
          <button className="lc-guided-image-button" type="button" onClick={() => setActiveStep((current) => (current + 1) % copy.steps.length)} aria-label={copy.nextAria}>
            <span className="lc-guided-image-frame">
              {landingAssets.cookingSteps.map((image, index) => (
                <Image className={index === activeStep ? "is-active" : ""} key={image} src={image} alt="" width={941} height={1672} aria-hidden="true" loading={index === 0 ? "eager" : "lazy"} />
              ))}
            </span>
          </button>
          <div className="lc-guided-step" aria-live="polite">
            <div className="lc-guided-step-meta"><span>{String(activeStep + 1).padStart(2, "0")} / 05</span><span>{copy.continue}</span></div>
            <h3>{copy.steps[activeStep].title}</h3>
            <p>{copy.steps[activeStep].body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
