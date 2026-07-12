"use client";

import Image from "next/image";
import { Reveal, fadeUp } from "@/shared/motion/motion";
import styles from "./HowItWorksContent.module.css";
import FinalDownload from "@/shared/download/FinalDownload";
import EditorialHero from "@/shared/ui/EditorialHero";
import { useLocale } from "@/contexts/LanguageContext";
import { getLocalizedRoute } from "@/shared/config/routes";

type Step = {
  number: string;
  title: string;
  description: string;
  whatYouDo: string[];
  whatGetsReady: string[];
  image: string;
};

type EntryMapping = {
  from: string;
  to: string;
};

type HowItWorksData = {
  hero: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  section1: {
    title: string;
    subtitle: string;
  };
  steps: Step[];
  entryMappings: {
    title: string;
    subtitle: string;
    items: EntryMapping[];
  };
  labels: {
    whatYouDo: string;
    whatGetsReady: string;
  };
};

export default function HowItWorksContent({ content }: { content: HowItWorksData }) {
  const { locale } = useLocale();

  return (
    <main className={styles.main}>
      <EditorialHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        subtitle={content.hero.subtitle}
        primaryCta={content.hero.ctaPrimary}
        secondaryCta={{
          label: content.hero.ctaSecondary,
          href: getLocalizedRoute(locale, "guides"),
        }}
      />

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.introTitle}>{content.section1.title}</h2>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <p className={styles.introSubtitle}>{content.section1.subtitle}</p>
          </Reveal>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className={styles.inner}>
          <div className={styles.timeline}>
            {content.steps.map((step, idx) => (
              <div key={step.number} className={styles.stepRow}>
                <div className={styles.stepMeta}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <div className={styles.stepTextCol}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDescription}>{step.description}</p>
                    <div className={styles.stepBullets}>
                      <div className={styles.bulletBlock}>
                        <span className={styles.bulletLabel}>{content.labels.whatYouDo}</span>
                        <ul className={styles.bulletList}>
                          {step.whatYouDo.map((item) => (
                            <li key={`${step.number}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.bulletBlock}>
                        <span className={styles.bulletLabel}>{content.labels.whatGetsReady}</span>
                        <ul className={styles.bulletList}>
                          {step.whatGetsReady.map((item) => (
                            <li key={`${step.number}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.stepVisual} aria-hidden="true">
                  <Image
                    src={step.image}
                    alt=""
                    width={480}
                    height={960}
                    priority={idx < 2}
                    className={styles.stepImage}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.mappingSection}>
        <div className={styles.inner}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.mappingTitle}>{content.entryMappings.title}</h2>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <p className={styles.mappingSubtitle}>{content.entryMappings.subtitle}</p>
          </Reveal>
          <div className={styles.mappingGrid}>
            {content.entryMappings.items.map((item) => (
              <div key={`${item.from}-${item.to}`} className={styles.mappingItem}>
                <span className={styles.mappingFrom}>{item.from}</span>
                <span className={styles.mappingArrow} aria-hidden="true">→</span>
                <span className={styles.mappingTo}>{item.to}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FinalDownload />
    </main>
  );
}
