"use client";

import { Reveal, StaggerReveal, fadeUp, scaleIn } from "./motion";
import styles from "./HowItWorks.module.css";

interface Step {
  number: string;
  title: string;
  support: string;
  placeholder: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Dime qué tienes",
    support: "Empieza desde tu cocina real, no desde un recetario ideal.",
    placeholder: "img_app_cookflow_chat.jpg",
  },
  {
    number: "02",
    title: "CKP te arma opciones viables",
    support: "No una receta al azar. Una decisión con criterio.",
    placeholder: "img_app_menu_candidates.jpg",
  },
  {
    number: "03",
    title: "Tú eliges con claridad",
    support: "Menos duda. Más control. Mejor ejecución.",
    placeholder: "img_app_recipe_detail.jpg",
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.howItWorks} id="how-it-works">
      <div className={styles.header}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.title}>
            CookPilot no vende recetas.
            <br />
            <span className={styles.titleAccent}>Resuelve decisiones.</span>
          </h2>
        </Reveal>
        <Reveal variants={fadeUp} delay={0.1}>
          <p className={styles.support}>
            Le dices tu contexto. CookPilot hace la magia. Tú cocinas con
            claridad.
          </p>
        </Reveal>
      </div>

      <StaggerReveal className={styles.stepsGrid} slow>
        {STEPS.map((step, i) => (
          <Reveal key={i} variants={scaleIn} delay={i * 0.12}>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.number}</span>
              <img
                src={`/images/${step.placeholder}`}
                alt={step.title}
                className={styles.stepPlaceholder}
                style={{ objectFit: "cover" }}
              />
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepSupport}>{step.support}</p>
            </div>
          </Reveal>
        ))}

        {/* Connector line (desktop only) */}
        <div className={styles.connector} aria-hidden="true">
          <div className={styles.connectorLine} />
        </div>
      </StaggerReveal>
    </section>
  );
}
