"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LanguageContext";
import { getLocalizedRoute } from "@/shared/config/routes";
import EditorialHero from "@/shared/ui/EditorialHero";
import EditorialClosing from "@/features/public-editorial/EditorialClosing";
import editorial from "@/features/public-editorial/Editorial.module.css";
import styles from "./FaqPageContent.module.css";

interface FAQPageData {
  hero: { eyebrow?: string; title: string; accent?: string; subtitle: string };
  sections: { title: string; faqs: { q: string; a: string }[] }[];
}

export default function FaqPageContent({ content }: { content: FAQPageData }) {
  const [openFaqKey, setOpenFaqKey] = useState<string | null>(null);
  const { locale, t } = useLocale();
  return (
    <main className={editorial.page}>
      <EditorialHero {...content.hero} primaryCta={t.header.descargar}
        secondaryCta={{ label: t.header.guias, href: getLocalizedRoute(locale, "guides") }} />
      <div className={`${editorial.inner} ${styles.layout}`}>
        <nav className={styles.index} aria-label={content.hero.title}>
          {content.sections.map((section, index) => (
            <a key={section.title} href={`#faq-category-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}<span aria-hidden="true">↗</span></a>
          ))}
        </nav>
        <div className={styles.categories}>
          {content.sections.map((section, secIdx) => (
            <section id={`faq-category-${secIdx}`} key={section.title} className={styles.category} aria-labelledby={`category-title-${secIdx}`}>
              <h2 id={`category-title-${secIdx}`}><span>{String(secIdx + 1).padStart(2, "0")}</span>{section.title}</h2>
              {section.faqs.map((faq, faqIdx) => {
                const key = `${secIdx}-${faqIdx}`;
                const isOpen = openFaqKey === key;
                return (
                  <div key={key} className={styles.item} data-open={isOpen || undefined}>
                    <h3>
                      <button type="button" aria-expanded={isOpen} aria-controls={`faq-answer-${key}`}
                        id={`faq-question-${key}`} onClick={() => setOpenFaqKey(isOpen ? null : key)}>
                        {faq.q}<span className={styles.plus} aria-hidden="true">{isOpen ? "−" : "+"}</span>
                      </button>
                    </h3>
                    <div id={`faq-answer-${key}`} hidden={!isOpen} className={styles.answer}
                      role="region" aria-labelledby={`faq-question-${key}`}><p>{faq.a}</p></div>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
      <EditorialClosing />
    </main>
  );
}
