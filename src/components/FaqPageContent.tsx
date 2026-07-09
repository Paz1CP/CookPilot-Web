"use client";

import { useState } from "react";
import { Reveal, fadeUp } from "./motion";
import styles from "./FaqPageContent.module.css";
import { ArrowDown2, ArrowUp2, InfoCircle, MessageQuestion } from "iconsax-reactjs";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  faqs: FAQItem[];
}

interface FAQPageData {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  sections: FAQSection[];
}

export default function FaqPageContent({ content }: { content: FAQPageData }) {
  const [openFaqKey, setOpenFaqKey] = useState<string | null>(null);

  const toggleFaq = (secIdx: number, faqIdx: number) => {
    const key = `${secIdx}-${faqIdx}`;
    setOpenFaqKey(openFaqKey === key ? null : key);
  };

  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.inner}>
          <Reveal variants={fadeUp}>
            <div className={styles.faqBadge}>
              <MessageQuestion size={16} variant="Bulk" className={styles.faqIcon} />
              <span>{content.hero.eyebrow}</span>
            </div>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <h1 className={styles.title}>{content.hero.title}</h1>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.2}>
            <p className={styles.subtitle}>{content.hero.subtitle}</p>
          </Reveal>
        </div>
      </section>

      {/* FAQ Categories & Items */}
      <section className={styles.faqContent}>
        <div className={styles.inner}>
          <div className={styles.categoriesStack}>
            {content.sections.map((section, secIdx) => (
              <div key={secIdx} className={styles.categoryBlock}>
                <Reveal variants={fadeUp}>
                  <h2 className={styles.categoryTitle}>{section.title}</h2>
                </Reveal>

                <div className={styles.accordionStack}>
                  {section.faqs.map((faq, faqIdx) => {
                    const key = `${secIdx}-${faqIdx}`;
                    const isOpen = openFaqKey === key;
                    return (
                      <Reveal key={faqIdx} variants={fadeUp} delay={0.05 * faqIdx}>
                        <div className={`${styles.item} ${isOpen ? styles.open : ""}`}>
                          <button className={styles.questionBtn} onClick={() => toggleFaq(secIdx, faqIdx)}>
                            <span className={styles.questionText}>{faq.q}</span>
                            <div className={styles.arrowIconWrap}>
                              {isOpen ? <ArrowUp2 size={16} /> : <ArrowDown2 size={16} />}
                            </div>
                          </button>
                          <div className={styles.answerWrap} style={{ maxHeight: isOpen ? "200px" : "0" }}>
                            <p className={styles.answerText}>{faq.a}</p>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
