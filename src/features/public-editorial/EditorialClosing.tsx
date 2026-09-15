"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useLocale } from "@/contexts/LanguageContext";
import { DownloadButton } from "@/shared/download/DownloadExperience";
import styles from "./Editorial.module.css";

const DOWNLOAD_ASSETS = [
  "/images/cookpilot/thumbs_up.webp",
  "/icons/actions/recipe_edit.webp",
  "/icons/actions/month_planner.webp",
  "/icons/billing/import_more.webp",
  "/icons/actions/buying_1.webp",
  "/icons/actions/lookup_prices.webp",
  "/icons/billing/cookmode_live.webp",
] as const;

export default function EditorialClosing() {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const states = [
    { asset: DOWNLOAD_ASSETS[0], description: t.download.subtitle, title: undefined, alt: t.download.base_alt },
    ...t.download.slides.map((slide, index) => ({
      asset: DOWNLOAD_ASSETS[index + 1],
      description: slide.description,
      title: slide.title,
      alt: slide.title,
    })),
  ];

  useEffect(() => {
    if (reduceMotion || states.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % states.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [reduceMotion, states.length]);

  return (
    <section id="download-final" className={styles.closing}>
      <div className={styles.closingPanel}>
        <div className={styles.closingCopy}>
          <h2>{t.download.title}</h2>
          <div className={styles.descriptionStage} aria-live="polite" aria-atomic="true">
            {states.map((state, index) => (
              <p
                key={`${state.asset}-description`}
                className={`${styles.descriptionState} ${index === activeIndex ? styles.isActive : ""}`}
                aria-hidden={index !== activeIndex}
              >
                {state.description}
              </p>
            ))}
          </div>
          <DownloadButton className="cp-btn cp-btn--primary">{t.download.cta}</DownloadButton>
        </div>
        <div className={styles.closingArt} aria-live="polite" aria-atomic="true">
          {states.map((state, index) => (
            <figure
              key={state.asset}
              className={`${styles.artState} ${index === activeIndex ? styles.isActive : ""}`}
              aria-hidden={index !== activeIndex}
            >
              <Image
                src={state.asset}
                alt={state.alt}
                width={1280}
                height={1280}
                sizes="(max-width: 760px) 100vw, 42vw"
                className={styles.artImage}
                priority={index === 0}
              />
              {state.title ? <figcaption>{state.title}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
