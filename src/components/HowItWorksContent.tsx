"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal, fadeUp } from "./motion";
import styles from "./HowItWorksContent.module.css";
import { useLocale } from "@/contexts/LanguageContext";

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
    eyebrow: string;
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
  finalCta?: {
    title: string;
    text?: string[];
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

export default function HowItWorksContent({ content }: { content: HowItWorksData }) {
  const { locale } = useLocale();
  const es = locale === "es";

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <Reveal variants={fadeUp}>
            <span className={styles.eyebrow}>{content.hero.eyebrow}</span>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <h1 className={styles.title}>{content.hero.title}</h1>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.2}>
            <p className={styles.subtitle}>{content.hero.subtitle}</p>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.3}>
            <div className={styles.heroCtas}>
              <a href="#download-final" className="cp-btn cp-btn--primary">
                {content.hero.ctaPrimary}
              </a>
              <Link href={es ? "/es/guias" : "/en/guides"} className="cp-btn cp-btn--ghost">
                {content.hero.ctaSecondary}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

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
              <div key={idx} className={styles.stepRow}>
                <div className={styles.stepMeta}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <div className={styles.stepTextCol}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDescription}>{step.description}</p>
                    <div className={styles.stepBullets}>
                      <div className={styles.bulletBlock}>
                        <span className={styles.bulletLabel}>Qué haces</span>
                        <ul className={styles.bulletList}>
                          {step.whatYouDo.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.bulletBlock}>
                        <span className={styles.bulletLabel}>Qué queda listo</span>
                        <ul className={styles.bulletList}>
                          {step.whatGetsReady.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.stepVisual}>
                  <div className={styles.stepImageWrap}>
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={480}
                      height={960}
                      priority={idx < 2}
                      className={styles.stepImage}
                    />
                  </div>
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
            {content.entryMappings.items.map((item, idx) => (
              <div key={idx} className={styles.mappingItem}>
                <span className={styles.mappingFrom}>{item.from}</span>
                <span className={styles.mappingArrow}>→</span>
                <span className={styles.mappingTo}>{item.to}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCtaSection} id="download-final">
        <div className={styles.inner}>
          <div className={styles.finalCtaBox}>
            <Reveal variants={fadeUp}>
              <h2 className={styles.finalCtaTitle}>{content.finalCta.title}</h2>
            </Reveal>
            <div className={styles.finalCtaText}>
              {content.finalCta.text.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Reveal variants={fadeUp} delay={0.2}>
              <div className={styles.finalCtaButtons}>
                <a href="#" className="cp-btn cp-btn--primary">
                  {content.finalCta.ctaPrimary}
                </a>
                <Link href={es ? "/es/guias" : "/en/guides"} className="cp-btn cp-btn--ghost">
                  {content.finalCta.ctaSecondary}
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
