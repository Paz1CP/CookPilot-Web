"use client";

import { useState } from "react";
import { ArrowDown2, ArrowUp2 } from "iconsax-reactjs";
import { Reveal, fadeUp } from "./motion";
import styles from "./ShortFAQ.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function ShortFAQ() {
  const { t } = useLocale();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className={styles.faq} id="short-faq">
      <div className={styles.inner}>
        <div className={styles.header}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.title}>{t.faq.title}</h2>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <p className={styles.subtitle}>{t.faq.subtitle}</p>
          </Reveal>
        </div>

        <div className={styles.accordion}>
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Reveal key={idx} variants={fadeUp} delay={0.05 * idx}>
                <div className={`${styles.item} ${isOpen ? styles.open : ""}`}>
                  <button className={styles.questionBtn} onClick={() => toggle(idx)}>
                    <span className={styles.questionText}>{faq.q}</span>
                    <div className={styles.arrowIconWrap}>
                      {isOpen ? (
                        <ArrowUp2 size={16} className={styles.arrow} />
                      ) : (
                        <ArrowDown2 size={16} className={styles.arrow} />
                      )}
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
    </section>
  );
}
