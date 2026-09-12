"use client";

import Image from "next/image";
import { useLocale } from "@/contexts/LanguageContext";

export default function WeeklyPlanScreen() {
  const copy = useLocale().t.landing.plan;

  return (
    <section className="lc-plan" id="your-week" aria-labelledby="lc-plan-title">
      <div className="lc-plan-editorial">
        <header className="lc-plan-heading" data-lc-reveal>
          <h2 id="lc-plan-title">{copy.title}<br /><em>{copy.accent}</em></h2>
        </header>
        <div className="lc-plan-showcase" data-lc-reveal>
          <Image src="/images/app/cookplan_showcase.png" alt={copy.showcaseAlt} width={1122} height={1402} loading="lazy" decoding="async" />
        </div>
        <div className="lc-plan-copy" data-lc-reveal>
          <p>{copy.descriptionBefore}<span>{copy.descriptionOne}</span>{copy.descriptionMiddle}<span>{copy.descriptionTwo}</span>{copy.descriptionAfter}<span>{copy.descriptionThree}</span>{copy.descriptionEnd}</p>
        </div>
      </div>
    </section>
  );
}
