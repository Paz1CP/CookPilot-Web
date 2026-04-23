"use client";

import { Reveal, fadeUp } from "./motion";
import styles from "./Demo.module.css";

export default function Demo() {
  return (
    <section className={styles.demo} id="demo">
      <div className={styles.inner}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.title}>
            Mira <span className="brand-cook">Cook</span>
            <span className="brand-pilot">Pilot</span> en acción
          </h2>
        </Reveal>

        <Reveal variants={fadeUp} delay={0.12}>
          <p className={styles.micro}>
            30 segundos. Plata, tiempo y salud, aterrizados en producto real.
          </p>
        </Reveal>

        <Reveal variants={fadeUp} delay={0.28}>
          <div className={styles.playerWrap}>
            <div className={styles.playerGlow} />
            <div className={styles.player}>
              <img
                src="/images/img_dish_hero_signature.webp"
                alt="CookPilot Demo"
                className={styles.playerPlaceholder}
                style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "12px" }}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
