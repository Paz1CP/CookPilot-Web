"use client";

import { Reveal, Parallax, fadeUp, slideFromRight } from "./motion";
import styles from "./Brand.module.css";

export default function Brand() {
  return (
    <section className={styles.brand} id="brand">
      <div className={styles.inner}>
        <div className={styles.textCol}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.title}>
              CookPilot existe para devolverle control a tu cocina.
            </h2>
          </Reveal>

          <Reveal variants={fadeUp} delay={0.12}>
            <p className={styles.body}>
              Ahorrar plata. Ahorrar tiempo. Comer mejor. Menos errores, menos
              fricción y más claridad en algo tan básico como alimentarte bien.
            </p>
          </Reveal>

          <Reveal variants={fadeUp} delay={0.24}>
            <div className={styles.iconRow}>
              <img
                src="/images/img_icon_control.png"
                alt="Control"
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  objectFit: "cover",
                }}
              />
              <img
                src="/images/img_app_icon.png"
                alt="Wallet"
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  objectFit: "cover",
                }}
              />
            </div>
          </Reveal>
        </div>

        <Parallax speed={0.1} className={styles.mascotCol}>
          <Reveal variants={slideFromRight}>
            <div className={styles.mascotWrap}>
              <img
                src="/images/img_mascot_brand_pose.png"
                alt="CookPilot Mascot"
                className={styles.mascotPlaceholder}
                style={{ objectFit: "contain" }}
              />
              <div className={styles.mascotGlow} />
            </div>
          </Reveal>
        </Parallax>
      </div>
    </section>
  );
}
