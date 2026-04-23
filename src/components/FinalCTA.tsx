"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Reveal, fadeUp } from "./motion";
import styles from "./FinalCTA.module.css";
import { useLocale } from "@/contexts/LanguageContext";

const CAROUSEL_IMAGES = [
  "/images/img_dish_hero_signature.webp",
  "/images/img_dish_secondary.webp",
  "/images/img_dish_fresh_health.webp",
  "/images/img_dish_editorial_color.webp",
  "/images/img_dish_hearty_home.webp",
];
const SCROLL_IMAGES = [...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES];

export default function FinalCTA() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubmitted(true);
    }
  };

  return (
    <section className={styles.finalCta} id="final-cta">
      <div className={styles.bgCarousel}>
        <div className={styles.carouselTrack}>
          {SCROLL_IMAGES.map((src, i) => (
            <img key={i} src={src} alt="Dish" className={styles.bgImage} />
          ))}
        </div>
      </div>
      <div className={styles.overlay} />

      <div className={styles.inner}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.title}>{t.final_cta.section_title}</h2>
        </Reveal>

        <Reveal variants={fadeUp} delay={0.12}>
          {!submitted ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="email"
                className={`cp-input ${styles.input}`}
                placeholder={t.final_cta.email_placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className={`cp-btn cp-btn--primary ${styles.submitBtn}`}
              >
                {t.final_cta.submit_button}
              </button>
            </form>
          ) : (
            <motion.div
              className={styles.successMsg}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className={styles.successIcon}
                aria-label={t.final_cta.success_icon_aria}
              >
                ✓
              </span>
              <p>{t.final_cta.success_message}</p>
            </motion.div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
