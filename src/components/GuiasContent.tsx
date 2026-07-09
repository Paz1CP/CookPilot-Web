"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Reveal, fadeUp } from "./motion";
import styles from "./GuiasContent.module.css";
import { useLocale } from "@/contexts/LanguageContext";

type Guide = {
  id: string;
  number: string;
  title: string;
  description: string;
  chips: string[];
  icon: string;
  summary: string;
  whatYouDo: string[];
  whenToUse: string;
  whatGetsReady: string[];
  tip: string;
};

type GuiasData = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    supportText: string;
  };
  guides: Guide[];
  finalCta?: {
    title: string;
    text: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

export default function GuiasContent({ content }: { content: GuiasData }) {
  const { locale } = useLocale();
  const es = locale === "es";
  const searchParams = useSearchParams();
  const guideId = searchParams.get("guide");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (guideId) {
      setActiveId(guideId);
      const el = document.getElementById("guide-reader");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [guideId]);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.inner}>
          <Reveal variants={fadeUp} delay={0.1}>
            <h1 className={styles.title}>{content.hero.title}</h1>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.2}>
            <p className={styles.subtitle}>{content.hero.subtitle}</p>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.3}>
            <p className={styles.supportText}>{content.hero.supportText}</p>
          </Reveal>
        </div>
      </section>

      <section className={styles.mapSection}>
        <div className={styles.inner}>
          <div className={styles.guidesGrid}>
            {content.guides.map((guide, idx) => (
              <GuideCard key={guide.id} guide={guide} index={idx} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.readerSection} id="guide-reader">
        <div className={styles.inner}>
          <Reader />
        </div>
      </section>
    </main>
  );
}

function GuideCard({ guide, index }: { guide: Guide; index: number }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 80 + index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <button
      type="button"
      className={`${styles.guideCard} ${active ? styles.guideCardActive : ""}`}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("active-guide-change", { detail: guide }));
        const el = document.getElementById("guide-reader");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
    >
      <div className={styles.cardIconWrap}>
        <Image src={guide.icon} alt={guide.title} width={64} height={64} className={styles.cardIcon} />
      </div>
      <span className={styles.cardNum}>{guide.number}</span>
      <h3 className={styles.cardTitle}>{guide.title}</h3>
      <p className={styles.cardDesc}>{guide.description}</p>
      <div className={styles.cardChips}>
        {guide.chips.map((chip) => (
          <span key={chip} className={styles.chip}>
            {chip}
          </span>
        ))}
      </div>
    </button>
  );
}

function Reader() {
  const [guide, setGuide] = useState<Guide | null>(null);

  useEffect(() => {
    const found = activeId ? content.guides.find((g) => g.id === activeId) || null : null;
    setGuide(found);
  }, [activeId, content.guides]);

  if (!guide) {
    return null;
  }

  return (
    <div className={styles.reader}>
      <div className={styles.readerHeader}>
        <div className={styles.readerIconWrap}>
          <Image src={guide.icon} alt={guide.title} width={96} height={96} className={styles.readerIcon} />
        </div>
        <div className={styles.readerHeaderText}>
          <span className={styles.readerNum}>{guide.number}</span>
          <h2 className={styles.readerTitle}>{guide.title}</h2>
          <p className={styles.readerSummary}>{guide.summary}</p>
        </div>
      </div>

      <div className={styles.readerBody}>
        <div className={styles.readerBlock}>
          <h3 className={styles.readerBlockTitle}>Qué haces</h3>
          <div className={styles.readerMiniGrid}>
            {guide.whatYouDo.map((item, idx) => (
              <div key={idx} className={styles.miniCard}>
                <span className={styles.miniCardNum}>{String(idx + 1).padStart(2, "0")}</span>
                <p className={styles.miniCardText}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.readerBlock}>
          <h3 className={styles.readerBlockTitle}>Cuándo usarlo</h3>
          <p className={styles.readerBlockText}>{guide.whenToUse}</p>
        </div>

        <div className={styles.readerBlock}>
          <h3 className={styles.readerBlockTitle}>Qué queda listo</h3>
          <div className={styles.readerChecks}>
            {guide.whatGetsReady.map((item, idx) => (
              <div key={idx} className={styles.checkItem}>
                <span className={styles.checkDot} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.readerBlock}>
          <h3 className={styles.readerBlockTitle}>Consejo CookPilot</h3>
          <p className={styles.readerBlockText}>{guide.tip}</p>
        </div>
      </div>
    </div>
  );
}
