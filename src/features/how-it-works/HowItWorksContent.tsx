"use client";

import Image from "next/image";
import EditorialReveal from "@/features/public-editorial/EditorialReveal";
import editorial from "@/features/public-editorial/Editorial.module.css";
import styles from "./HowItWorksContent.module.css";
import EditorialClosing from "@/features/public-editorial/EditorialClosing";
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
    accent?: string;
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
    <main className={editorial.page}>
      <EditorialHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        accent={content.hero.accent}
        subtitle={content.hero.subtitle}
        primaryCta={content.hero.ctaPrimary}
        secondaryCta={{
          label: content.hero.ctaSecondary,
          href: getLocalizedRoute(locale, "guides"),
        }}
      />

      <section className={styles.introSection}>
        <div className={styles.inner}>
          <EditorialReveal>
            <h2 className={styles.introTitle}>{content.section1.title}</h2>
          </EditorialReveal>
          <EditorialReveal>
            <p className={styles.introSubtitle}>{content.section1.subtitle}</p>
          </EditorialReveal>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className={styles.inner}>
          <nav className={styles.chapterNav} aria-label={content.hero.title}>
            {content.steps.map((step) => <a key={step.number} href={`#chapter-${step.number}`}><span>{step.number}</span>{step.title}</a>)}
          </nav>
          <div className={styles.timeline}>
            {content.steps.map((step) => (
              <article key={step.number} id={`chapter-${step.number}`} className={styles.stepRow}>
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
                <EditorialReveal className={styles.stepVisual}>
                  <Image
                    src={step.image}
                    alt=""
                    width={480}
                    height={960}
                    className={styles.stepImage}
                  />
                </EditorialReveal>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.mappingSection}>
        <div className={styles.inner}>
          <EditorialReveal>
            <h2 className={styles.mappingTitle}>{content.entryMappings.title}</h2>
          </EditorialReveal>
          <EditorialReveal>
            <p className={styles.mappingSubtitle}>{content.entryMappings.subtitle}</p>
          </EditorialReveal>
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
      <EditorialClosing />
    </main>
  );
}
