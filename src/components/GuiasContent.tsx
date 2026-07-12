"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ArrowRight } from "iconsax-reactjs";

import { useLocale } from "@/contexts/LanguageContext";
import { DownloadButton } from "./DownloadExperience";
import styles from "./GuiasContent.module.css";
import EditorialHero from "./EditorialHero";

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

type GuideLabels = {
  whatYouDo: string;
  whenToUse: string;
  whatGetsReady: string;
  tip: string;
  openGuide: string;
};

type GuiasData = {
  hero: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    supportText?: string;
  };
  guides: Guide[];
  labels?: GuideLabels;
  finalCta?: {
    title: string;
    text: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

type GuideCardProps = {
  guide: Guide;
  index: number;
  selected: boolean;
  openLabel: string;
  onSelect: (id: string) => void;
};

type ReaderProps = {
  guide: Guide;
  labels: GuideLabels;
};

const DEFAULT_LABELS: Record<"es" | "en", GuideLabels> = {
  es: {
    whatYouDo: "Qué haces",
    whenToUse: "Cuándo usarlo",
    whatGetsReady: "Qué queda listo",
    tip: "Consejo CookPilot",
    openGuide: "Abrir guía",
  },
  en: {
    whatYouDo: "What you do",
    whenToUse: "When to use it",
    whatGetsReady: "What gets prepared",
    tip: "CookPilot tip",
    openGuide: "Open guide",
  },
};

export default function GuiasContent({
  content,
}: {
  content: GuiasData;
}) {
  const { locale, t } = useLocale();
  const es = locale === "es";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const guideId = searchParams.get("guide");

  const labels = useMemo(
    () => content.labels ?? DEFAULT_LABELS[es ? "es" : "en"],
    [content.labels, es],
  );

  const initialGuideId = useMemo(() => {
    const exists = content.guides.some((guide) => guide.id === guideId);

    if (guideId && exists) {
      return guideId;
    }

    return content.guides[0]?.id ?? null;
  }, [content.guides, guideId]);

  const [activeId, setActiveId] = useState<string | null>(
    initialGuideId,
  );

  useEffect(() => {
    if (!guideId) {
      return;
    }

    const exists = content.guides.some(
      (guide) => guide.id === guideId,
    );

    if (exists) {
      setActiveId(guideId);
    }
  }, [content.guides, guideId]);

  const activeGuide = useMemo(
    () =>
      content.guides.find((guide) => guide.id === activeId) ??
      content.guides[0] ??
      null,
    [activeId, content.guides],
  );

  const handleGuideSelect = (id: string) => {
    setActiveId(id);

    const params = new URLSearchParams(searchParams.toString());
    params.set("guide", id);

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });

    window.requestAnimationFrame(() => {
      document
        .getElementById("guide-reader")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  const secondaryPath = es
    ? "/es/como-funciona"
    : "/en/how-it-works";

  return (
    <main className={styles.main}>
      <EditorialHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        subtitle={[content.hero.subtitle, content.hero.supportText].filter(Boolean).join(" ")}
        primaryCta={t.header.descargar}
        secondaryCta={{ label: t.header.como_funciona, href: secondaryPath }}
      />

      <section className={styles.mapSection}>
        <div className={styles.inner}>
          <div className={styles.mapHeading}>
            {content.hero.eyebrow ? (
              <p className={styles.mapEyebrow}>
                {content.hero.eyebrow}
              </p>
            ) : null}

          </div>

          <div className={styles.guidesGrid}>
            {content.guides.map((guide, index) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                index={index}
                selected={guide.id === activeGuide?.id}
                openLabel={labels.openGuide}
                onSelect={handleGuideSelect}
              />
            ))}
          </div>
        </div>
      </section>

      {activeGuide && (
        <section
          className={styles.readerSection}
          id="guide-reader"
        >
          <div className={styles.inner}>
            <Reader guide={activeGuide} labels={labels} />
          </div>
        </section>
      )}

      {content.finalCta && (
        <section className={styles.finalCtaSection}>
          <div className={styles.inner}>
            <div className={styles.finalCtaBox}>
              <div className={styles.finalCtaCopy}>
                <h2 className={styles.finalCtaTitle}>
                  {content.finalCta.title}
                </h2>

                <p className={styles.finalCtaText}>
                  {content.finalCta.text}
                </p>
              </div>

              <div className={styles.finalCtaButtons}>
                <DownloadButton className={styles.primaryButton}>
                  {content.finalCta.ctaPrimary}
                  <ArrowRight size={20} aria-hidden="true" />
                </DownloadButton>

                <Link
                  href={secondaryPath}
                  className={styles.secondaryButton}
                >
                  {content.finalCta.ctaSecondary}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function GuideCard({
  guide,
  index,
  selected,
  openLabel,
  onSelect,
}: GuideCardProps) {
  const variantClass =
    index === 0
      ? styles.guideCardFeatured
      : index <= 2
        ? styles.guideCardWide
        : index <= 5
          ? styles.guideCardStandard
          : styles.guideCardCompact;

  return (
    <button
      type="button"
      className={[
        styles.guideCard,
        variantClass,
        selected ? styles.guideCardSelected : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={selected}
      aria-controls="guide-reader"
      aria-label={`${openLabel}: ${guide.title}`}
      onClick={() => onSelect(guide.id)}
    >
      <div className={styles.cardTopRow}>
        <span className={styles.cardNum}>
          {guide.number}
        </span>

        <span className={styles.cardArrow} aria-hidden="true">
          <ArrowRight size={20} />
        </span>
      </div>

      <div className={styles.cardCopy}>
        <h2 className={styles.cardTitle}>
          {guide.title}
        </h2>

        <p className={styles.cardDesc}>
          {guide.description}
        </p>
      </div>

      <div className={styles.cardVisual} aria-hidden="true">
        <Image
          src={guide.icon}
          alt=""
          width={280}
          height={280}
          className={styles.cardIcon}
          sizes={
            index === 0
              ? "(max-width: 720px) 44vw, 280px"
              : "(max-width: 720px) 30vw, 180px"
          }
        />
      </div>
    </button>
  );
}

function Reader({ guide, labels }: ReaderProps) {
  return (
    <article className={styles.reader} aria-live="polite">
      <header className={styles.readerHeader}>
        <div className={styles.readerHeaderCopy}>
          <span className={styles.readerNum}>
            {guide.number}
          </span>

          <h2 className={styles.readerTitle}>
            {guide.title}
          </h2>

          <p className={styles.readerSummary}>
            {guide.summary}
          </p>
        </div>

        <div className={styles.readerVisual} aria-hidden="true">
          <div className={styles.readerVisualGlow} />

          <Image
            src={guide.icon}
            alt=""
            width={360}
            height={360}
            className={styles.readerIcon}
            sizes="(max-width: 720px) 56vw, 320px"
          />
        </div>
      </header>

      <div className={styles.readerBody}>
        <section className={styles.readerActions}>
          <div className={styles.readerSectionHeading}>
           
            <h3 className={styles.readerBlockTitle}>
              {labels.whatYouDo}
            </h3>
          </div>

          <div className={styles.readerMiniGrid}>
            {guide.whatYouDo.map((item, index) => (
              <div
                key={`${guide.id}-action-${index}`}
                className={styles.miniCard}
              >
                <span className={styles.miniCardNum}>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className={styles.miniCardText}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.readerSplit}>
          <section className={styles.contextPanel}>
            <div className={styles.readerSectionHeading}>
             

              <h3 className={styles.readerBlockTitle}>
                {labels.whenToUse}
              </h3>
            </div>

            <p className={styles.readerBlockText}>
              {guide.whenToUse}
            </p>
          </section>

          <section className={styles.resultsPanel}>
            <div className={styles.readerSectionHeading}>
             

              <h3 className={styles.readerBlockTitle}>
                {labels.whatGetsReady}
              </h3>
            </div>

            <div className={styles.readerChecks}>
              {guide.whatGetsReady.map((item, index) => (
                <div
                  key={`${guide.id}-result-${index}`}
                  className={styles.checkItem}
                >
                  <span
                    className={styles.checkDot}
                    aria-hidden="true"
                  />

                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.tipPanel}>
          <div className={styles.tipCopy}>  <Image
            src="/images/cookpilot/cookpilot_transparent.png"
            alt=""
            width={64}
            height={64}
            className={styles.tipAvatar}
            aria-hidden="true"
          />

            <span className={styles.tipLabel}>
              {labels.tip}
            </span>

            <p className={styles.tipText}>
              {guide.tip}
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
