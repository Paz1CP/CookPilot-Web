"use client";

import Image from "next/image";
import { Reveal, StaggerReveal, fadeUp, scaleIn } from "./motion";
import styles from "./HowItWorks.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function HowItWorks() {
  const { t } = useLocale();

  const STEPS = [
    {
      number: t.how_it_works.step_1_number,
      title: t.how_it_works.step_1_title,
      support: t.how_it_works.step_1_support,
      placeholder: "img_app_cookflow_chat.jpg",
    },
    {
      number: t.how_it_works.step_2_number,
      title: t.how_it_works.step_2_title,
      support: t.how_it_works.step_2_support,
      placeholder: "img_app_menu_candidates.jpg",
    },
    {
      number: t.how_it_works.step_3_number,
      title: t.how_it_works.step_3_title,
      support: t.how_it_works.step_3_support,
      placeholder: "img_app_recipe_detail.png",
    },
  ];

  return (
    <section className={styles.howItWorks} id="how-it-works">
      <div className={styles.header}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.title}>
            {t.how_it_works.section_title_main}
            <br />
            <span className={styles.titleAccent}>
              {t.how_it_works.section_title_accent}
            </span>
          </h2>
        </Reveal>
        <Reveal variants={fadeUp} delay={0.1}>
          <p className={styles.support}>{t.how_it_works.section_support}</p>
        </Reveal>
      </div>

      <StaggerReveal className={styles.stepsGrid} slow>
        {STEPS.map((step, i) => (
          <Reveal key={i} variants={scaleIn} delay={i * 0.12}>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.number}</span>
              <Image
                src={`/images/${step.placeholder}`}
                alt={step.title}
                width={240}
                height={384}
                sizes="(max-width: 1024px) 160px, 240px"
                className={styles.stepPlaceholder}
                style={{ objectFit: "cover" }}
              />
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepSupport}>{step.support}</p>
            </div>
          </Reveal>
        ))}
      </StaggerReveal>
    </section>
  );
}
