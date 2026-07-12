"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowDown2, ArrowRight } from "iconsax-reactjs";
import { Reveal, fadeUp } from "./motion";
import styles from "./ProPageContent.module.css";
import { useLocale } from "@/contexts/LanguageContext";
import FinalDownload from "./FinalDownload";
import EditorialHero from "./EditorialHero";

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
    title: string;
    claim: string;
    cta: string;
    plansCta: string;
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
  faq: {
    title: string;
    items: FAQItem[];
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
      <EditorialHero
        title={content.hero.title}
        subtitle={content.hero.claim}
        primaryCta={content.hero.cta}
        secondaryCta={{ label: content.hero.plansCta, href: "#plans" }}
      >
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
      </EditorialHero>

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
                  <div className={styles.featureMeta} aria-hidden="true">
                    <span className={styles.featureNum}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.featureArrow}>
                      <ArrowRight size={18} />
                    </span>
                  </div>
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
          <p className={styles.packsNote}>{content.packs.note}</p>
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
                  <a href={content.plans.monthly.ctaAnchor} className={`cp-btn cp-btn--ghost ${styles.packCta}`}>
                    {content.plans.monthly.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <header className={styles.faqIntro}>
            <h2 className={styles.faqTitle}>{content.faq.title}</h2>
            <p className={styles.faqSubtitle}>{es ? "Respuestas claras sobre Pro, sus planes y sus packs." : "Clear answers about Pro, its plans, and its packs."}</p>
          </header>

          <div className={styles.faqList}>
            {content.faq.items.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              const answerId = `pro-faq-${idx}`;

              return (
                <Reveal key={idx} variants={fadeUp} delay={0.05 * idx}>
                  <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
                    <button
                      className={styles.faqBtn}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => toggleFaq(idx)}
                    >
                      <span className={styles.faqQ}>{faq.q}</span>
                      <ArrowDown2
                        className={`${styles.faqArrow} ${isOpen ? styles.faqArrowOpen : ""}`}
                        size={24}
                        aria-hidden="true"
                      />
                    </button>

                    <div
                      id={answerId}
                      className={styles.faqAnswer}
                      hidden={!isOpen}
                    >
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <FinalDownload />
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
