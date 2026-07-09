"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal, fadeUp } from "./motion";
import styles from "./ProPageContent.module.css";
import { useLocale } from "@/contexts/LanguageContext";

type FeatureItem = {
  title: string;
  desc: string;
};

type PackItem = {
  title: string;
  price: string;
  desc: string;
  icon?: string;
};

type FAQItem = {
  q: string;
  a: string;
};

type PlanData = {
  title: string;
  price: string;
  period: string;
  description: string;
  bullets: string[];
  cta: string;
  ctaAnchor: string;
  badge?: string;
};

type ProPageData = {
  hero: {
    eyebrow: string;
    title: string;
    claim: string;
    supportBefore: string;
    supportAfter: string;
    cta: string;
    ctaAnchor: string;
    image: string;
  };
  plans: {
    monthly: PlanData;
    annual: PlanData & { badge?: string };
  };
  features: {
    title: string;
    subtitle: string;
    items: FeatureItem[];
  };
  packs: {
    title: string;
    subtitle: string;
    note: string;
    items: PackItem[];
  };
  compare: {
    title: string;
    free: { label: string; items: string[] };
    pro: { label: string; items: string[] };
  };
  faq: {
    title: string;
    items: FAQItem[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

export default function ProPageContent({ content }: { content: ProPageData }) {
  const { locale } = useLocale();
  const es = locale === "es";
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero} id="pro">
        <div className={styles.inner}>
          <div className={styles.heroLayout}>
            <div className={styles.heroText}>
              <Reveal variants={fadeUp}>
                <h1 className={styles.title}>{content.hero.title}</h1>
              </Reveal>
              <Reveal variants={fadeUp} delay={0.1}>
                <p className={styles.claim}>{content.hero.claim}</p>
              </Reveal>
              <Reveal variants={fadeUp} delay={0.15}>
                <p className={styles.supportText}>{content.hero.supportBefore}</p>
              </Reveal>
              <Reveal variants={fadeUp} delay={0.2}>
                <p className={styles.supportText}>{content.hero.supportAfter}</p>
              </Reveal>
              <Reveal variants={fadeUp} delay={0.3}>
                <a href={content.hero.ctaAnchor} className="cp-btn cp-btn--primary">
                  {content.hero.cta}
                </a>
              </Reveal>
            </div>
            <Reveal variants={fadeUp} delay={0.2}>
              <div className={styles.heroVisual}>
                <Image
                  src={content.hero.image}
                  alt={content.hero.title}
                  width={884}
                  height={1600}
                  priority
                  className={styles.heroImage}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.plansSection} id="plans">
        <div className={styles.inner}>
          <div className={styles.plansGrid}>
            <PlanCard plan={content.plans.monthly} />
            <PlanCard plan={content.plans.annual} featured />
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.inner}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.sectionTitle}>{content.features.title}</h2>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <p className={styles.sectionSubtitle}>{content.features.subtitle}</p>
          </Reveal>
          <div className={styles.featuresGrid}>
            {content.features.items.map((item, idx) => (
              <Reveal key={idx} variants={fadeUp} delay={0.05 * idx}>
                <div className={styles.featureCard}>
                  <h3 className={styles.featureTitle}>{item.title}</h3>
                  <p className={styles.featureDesc}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.packsSection}>
        <div className={styles.inner}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.sectionTitle}>{content.packs.title}</h2>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <p className={styles.sectionSubtitle}>{content.packs.subtitle}</p>
          </Reveal>
          <div className={styles.packsGrid}>
            {content.packs.items.map((item, idx) => (
              <Reveal key={idx} variants={fadeUp} delay={0.05 * idx}>
                <div className={styles.packCard}>
                  {item.icon && (
                    <div className={styles.packIconWrap}>
                      <Image src={item.icon} alt={item.title} width={48} height={48} className={styles.packIcon} />
                    </div>
                  )}
                  <div className={styles.packHeader}>
                    <h3 className={styles.packTitle}>{item.title}</h3>
                    <span className={styles.packPrice}>{item.price}</span>
                  </div>
                  <p className={styles.packDesc}>{item.desc}</p>
                  <a href={content.hero.ctaAnchor} className={`cp-btn cp-btn--ghost ${styles.packCta}`}>
                    {content.hero.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
          <p className={styles.packsNote}>{content.packs.note}</p>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.inner}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.sectionTitle}>{content.faq.title}</h2>
          </Reveal>
          <div className={styles.accordion}>
            {content.faq.items.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <Reveal key={idx} variants={fadeUp} delay={0.05 * idx}>
                  <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
                    <button className={styles.faqBtn} onClick={() => toggleFaq(idx)}>
                      <span className={styles.faqQ}>{faq.q}</span>
                      <span className={styles.faqArrow}>{isOpen ? "−" : "+"}</span>
                    </button>
                    <div className={styles.faqAnswer} style={{ maxHeight: isOpen ? "200px" : "0" }}>
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.finalCtaSection} id={es ? "descarga-app" : "download-app"}>
        <div className={styles.inner}>
          <div className={styles.finalCtaBox}>
            <Reveal variants={fadeUp}>
              <h2 className={styles.finalCtaTitle}>{content.finalCta.title}</h2>
            </Reveal>
            <Reveal variants={fadeUp} delay={0.1}>
              <p className={styles.finalCtaSubtitle}>{content.finalCta.subtitle}</p>
            </Reveal>
            <Reveal variants={fadeUp} delay={0.2}>
              <div className={styles.finalCtaButtons}>
                <a href="#" className="cp-btn cp-btn--primary">
                  {content.finalCta.ctaPrimary}
                </a>
                <a href="#" className="cp-btn cp-btn--ghost">
                  {content.finalCta.ctaSecondary}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}

function PlanCard({ plan, featured }: { plan: PlanData; featured?: boolean }) {
  return (
    <div className={`${styles.planCard} ${featured ? styles.planCardFeatured : ""}`}>
      {featured && plan.badge ? <div className={styles.planBadge}>{plan.badge}</div> : null}
      <div className={styles.planHeader}>
        <h3 className={styles.planTitle}>{plan.title}</h3>
        <div className={styles.planPrice}>
          <span className={styles.planPriceValue}>{plan.price}</span>
          <span className={styles.planPricePeriod}>{plan.period}</span>
        </div>
      </div>
      <p className={styles.planDescription}>{plan.description}</p>
      <ul className={styles.planBullets}>
        {plan.bullets.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <a href={plan.ctaAnchor} className={`cp-btn ${featured ? "cp-btn--primary" : "cp-btn--ghost"} ${styles.planCta}`}>
        {plan.cta}
      </a>
    </div>
  );
}

