"use client";

import {
  Reveal,
  StaggerReveal,
  Parallax,
  fadeUp,
  slideFromRight,
  slideFromLeft,
} from "./motion";
import styles from "./Pillars.module.css";

interface Pillar {
  title: string;
  body: string;
  highlight: string;
  iconPlaceholder: string;
  screenshotPlaceholder: string;
  statPlaceholder: string;
  statLabel: string;
}

const PILLARS: Pillar[] = [
  {
    title: "Ahorra plata de verdad",
    body: "Cocinar mejor también es una decisión financiera. CookPilot te ayuda a resolver comidas con más criterio, menos desperdicio y mejor visibilidad de costo.",
    highlight:
      "Tu comida diaria no debería costarte más por falta de claridad.",
    iconPlaceholder: "img_app_icon.png",
    screenshotPlaceholder: "img_app_pricing_comparator.jpg",
    statPlaceholder: "weekly_savings",
    statLabel: "ahorro semanal",
  },
  {
    title: "Ahorra tiempo y carga mental",
    body: "Menos tiempo dudando qué cocinar. Menos vueltas. Menos improvisación a última hora. Más claridad desde el primer paso.",
    highlight: "Decidir mejor también te devuelve tiempo.",
    iconPlaceholder: "time.webp",
    screenshotPlaceholder: "img_app_cookflow_chat.jpg",
    statPlaceholder: "time_saved",
    statLabel: "tiempo ahorrado",
  },
  {
    title: "Come mejor sin romper tu realidad",
    body: "Mejor nutrición no debería significar renunciar a tu cultura ni vivir a punta de culpa. CookPilot parte de comida real, contexto real y cocina real.",
    highlight: "Primero tu cocina. Luego la mejora.",
    iconPlaceholder: "health.webp",
    screenshotPlaceholder: "img_app_recipe_detail.jpg",
    statPlaceholder: "health_signal",
    statLabel: "señal nutricional",
  },
];

export default function Pillars() {
  return (
    <section className={styles.pillars} id="pillars">
      <div className={styles.sectionHeader}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.sectionTitle}>
            Tres razones para cocinar con ventaja
          </h2>
        </Reveal>
        <Reveal variants={fadeUp} delay={0.1}>
          <p className={styles.sectionSupport}>
            <span className="brand-cook">Cook</span>
            <span className="brand-pilot">Pilot</span> existe para ayudarte a ganar
            algo real cada semana.
          </p>
        </Reveal>
      </div>

      <div className={styles.pillarList}>
        {PILLARS.map((pillar, i) => {
          const isReversed = i % 2 === 1;
          return (
            <div
              key={i}
              className={`${styles.pillarBlock} ${isReversed ? styles.reversed : ""}`}
            >
              <StaggerReveal className={styles.textCol}>
                <Reveal variants={fadeUp}>
                  <div className={styles.iconWrap}>
                    <img
                      src={`/images/${pillar.iconPlaceholder}`}
                      alt="Icon"
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "18px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </Reveal>

                <Reveal variants={fadeUp}>
                  <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                </Reveal>

                <Reveal variants={fadeUp}>
                  <p className={styles.pillarBody}>{pillar.body}</p>
                </Reveal>

                <Reveal variants={fadeUp}>
                  <p className={styles.pillarHighlight}>{pillar.highlight}</p>
                </Reveal>

                <Reveal variants={fadeUp}>
                  <div className={styles.statChip}>
                    <span className={styles.statValue}>{pillar.statPlaceholder}</span>
                    <span className={styles.statLabel}>{pillar.statLabel}</span>
                  </div>
                </Reveal>
              </StaggerReveal>

              <Parallax
                speed={isReversed ? -0.08 : 0.08}
                className={styles.visualCol}
              >
                <Reveal variants={isReversed ? slideFromLeft : slideFromRight}>
                  <img
                    src={`/images/${pillar.screenshotPlaceholder}`}
                    alt={pillar.title}
                    className={styles.screenshotPlaceholder}
                    style={{ objectFit: "cover" }}
                  />
                </Reveal>
              </Parallax>
            </div>
          );
        })}
      </div>
    </section>
  );
}
