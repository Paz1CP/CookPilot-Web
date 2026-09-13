"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/contexts/LanguageContext";
import { getLocalizedRoute } from "@/shared/config/routes";
import EditorialHero from "@/shared/ui/EditorialHero";
import EditorialClosing from "@/features/public-editorial/EditorialClosing";
import editorial from "@/features/public-editorial/Editorial.module.css";
import styles from "./GuiasContent.module.css";

type Guide = {
  id: string; number: string; title: string; description: string; icon: string;
  summary: string; whatYouDo: string[]; whenToUse: string; whatGetsReady: string[]; tip: string;
};
type GuideLabels = {
  whatYouDo: string; whenToUse: string; whatGetsReady: string; tip: string;
  openGuide: string; library: string; backToLibrary: string;
};
type GuiasData = {
  hero: { eyebrow?: string; title: string; accent?: string; subtitle: string; supportText?: string };
  guides: Guide[];
  labels: GuideLabels;
};

export default function GuiasContent({ content }: { content: GuiasData }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState(content.guides[0]?.id);
  const guideId = searchParams.get("guide");
  const activeGuide = content.guides.find((guide) => guide.id === guideId)
    ?? content.guides.find((guide) => guide.id === selectedId) ?? content.guides[0];

  const handleGuideSelect = (id: string) => {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("guide", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.requestAnimationFrame(() => {
      const reader = document.getElementById("guide-reader");
      reader?.focus({ preventScroll: true });
      reader?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
    });
  };

  return (
    <main className={editorial.page}>
      <EditorialHero eyebrow={content.hero.eyebrow} title={content.hero.title} accent={content.hero.accent}
        subtitle={content.hero.subtitle} primaryCta={t.header.descargar}
        secondaryCta={{ label: t.header.como_funciona, href: getLocalizedRoute(locale, "howItWorks") }} />

      <section id="guide-library" className={styles.library} aria-label={content.labels.library}>
        <div className={editorial.inner}>
          <div className={styles.libraryHeading}><span>{content.labels.library}</span><span>{String(content.guides.length).padStart(2, "0")}</span></div>
          <p className={styles.libraryIntro}>{content.hero.supportText}</p>
          <div className={styles.guidesGrid}>
            {content.guides.map((guide, index) => (
              <button key={guide.id} type="button"
                className={styles.guideCard} data-featured={index === 0 || undefined}
                aria-pressed={activeGuide?.id === guide.id} aria-controls="guide-reader"
                aria-label={`${content.labels.openGuide}: ${guide.title}`}
                onClick={() => handleGuideSelect(guide.id)}>
                <span className={styles.cardNumber}>{guide.number}</span>
                <span className={styles.cardArrow} aria-hidden="true">↗</span>
                <div className={styles.cardCopy}>
                  <h2>{guide.title}</h2><p>{guide.description}</p>
                </div>
                <Image src={guide.icon} alt="" width={480} height={480} className={styles.cardIcon}
                  sizes={index === 0 ? "(max-width: 760px) 80vw, 480px" : "(max-width: 760px) 40vw, 260px"} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeGuide && (
        <section id="guide-reader" tabIndex={-1} className={styles.readerSection} aria-labelledby="guide-reader-title">
          <div className={`${editorial.inner} ${styles.readerLayout}`}>
            <aside className={styles.readerIndex}>
              <a href="#guide-library" className={styles.backLink}><span aria-hidden="true">↑</span>{content.labels.backToLibrary}</a>
              <nav aria-label={content.labels.library}>
                {content.guides.map((guide) => (
                  <button key={guide.id} type="button" aria-current={activeGuide.id === guide.id ? "true" : undefined}
                    onClick={() => handleGuideSelect(guide.id)}>
                    <span>{guide.number}</span>{guide.title}
                  </button>
                ))}
              </nav>
            </aside>
            <article className={styles.reader}>
              <header className={styles.readerHeader}>
                <div>
                  <span className={styles.readerNumber}>{activeGuide.number} / {String(content.guides.length).padStart(2, "0")}</span>
                  <h2 id="guide-reader-title">{activeGuide.title}</h2>
                  <p>{activeGuide.summary}</p>
                </div>
                <Image src={activeGuide.icon} alt="" width={360} height={360} sizes="(max-width: 760px) 50vw, 300px" />
              </header>
              <section className={styles.actions}>
                <h3>{content.labels.whatYouDo}</h3>
                <ol>
                  {activeGuide.whatYouDo.map((item, index) => (
                    <li key={item}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
                  ))}
                </ol>
              </section>
              <div className={styles.readerDetails}>
                <section><h3>{content.labels.whenToUse}</h3><p>{activeGuide.whenToUse}</p></section>
                <section><h3>{content.labels.whatGetsReady}</h3><ul>{activeGuide.whatGetsReady.map(item => <li key={item}>{item}</li>)}</ul></section>
              </div>
              <aside className={styles.tip}>
                <Image src="/images/cookpilot/cookpilot_transparent.png" alt="" width={112} height={112} />
                <div><h3>{content.labels.tip}</h3><p>{activeGuide.tip}</p></div>
              </aside>
            </article>
          </div>
        </section>
      )}
      <EditorialClosing />
    </main>
  );
}
