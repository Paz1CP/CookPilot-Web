"use client";

import { Reveal, fadeUp } from "./motion";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Reveal variants={fadeUp}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <div className={styles.logo}>
              <img
                src="/images/img_app_icon.png"
                alt="CookPilot Icon"
                className={styles.logoImage}
              />
              <span className={styles.logoText}>
                <span className="brand-cook">Cook</span>
                <span className="brand-pilot">Pilot</span>
              </span>
            </div>
          </div>

          <div className={styles.center}>
            <span className={styles.madeIn}>Hecho en Perú 🇵🇪</span>
          </div>

          <div className={styles.right}>
            <a
              href="https://cookpilot.pro"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              cookpilot.pro
            </a>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
