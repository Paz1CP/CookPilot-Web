"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./AppShowcase.module.css";
import { useLocale } from "@/contexts/LanguageContext";

type SegmentId = "planifica" | "ajusta" | "compra" | "cocina" | "importa" | "reutiliza";

const SEGMENTS: { id: SegmentId; image: string }[] = [
  { id: "planifica", image: "/images/app/cookplan.png" },
  { id: "ajusta", image: "/images/app/cookfit.png" },
  { id: "compra", image: "/images/app/cooklist.png" },
  { id: "cocina", image: "/images/app/cookhome.png" },
  { id: "importa", image: "/images/app/cookimport.png" },
  { id: "reutiliza", image: "/images/app/cooksearch.png" },
];

export default function AppShowcase() {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const handleClick = (index: number) => {
    if (index === activeIndex) return;
    setVisible(false);
    setTimeout(() => {
      setActiveIndex(index);
      setVisible(true);
    }, 180);
  };

  const active = SEGMENTS[activeIndex];
  const titleKey = `${active.id}_title` as keyof typeof t.app_showcase;
  const subtitleKey = `${active.id}_subtitle` as keyof typeof t.app_showcase;

  return (
    <section className={styles.showcase} id="features">
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.app_showcase.section_title}</h2>
          <p className={styles.subtitle}>{t.app_showcase.section_subtitle}</p>
        </div>

        <div className={styles.previewCard}>
          <div
            className={`${styles.textCol} ${styles.contentWrapper}`}
            style={{ opacity: visible ? 1 : 0 }}
          >
            <h3 className={styles.activeTitle}>{t.app_showcase[titleKey]}</h3>
            <p className={styles.activeSubtitle}>{t.app_showcase[subtitleKey]}</p>
          </div>

          <div className={styles.imageCol}>
            <div className={styles.imageWrap}>
              <Image
                src={active.image}
                alt={t.app_showcase[titleKey]}
                width={480}
                height={960}
                priority={activeIndex === 0}
                className={styles.mockup}
              />
            </div>
          </div>
        </div>

        <div className={styles.selector}>
          <div className={styles.segmentList}>
            {SEGMENTS.map((seg, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.segmentBtn} ${
                  idx === activeIndex ? styles.segmentBtnActive : ""
                }`}
                onClick={() => handleClick(idx)}
              >
                {t.app_showcase[`${seg.id}_label`]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
