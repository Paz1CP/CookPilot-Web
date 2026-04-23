"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal, fadeUp } from "./motion";
import styles from "./Gallery.module.css";

const SCREENSHOTS = [
  { label: "img_app_home.png", size: "hero" },
  { label: "img_app_cookflow_chat.jpg", size: "standard" },
  { label: "img_app_pricing_comparator.jpg", size: "standard" },
  { label: "img_app_recipe_detail.jpg", size: "standard" },
  { label: "img_app_splash_brand.jpg", size: "accent" },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const y3 = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section className={styles.gallery} id="gallery" ref={sectionRef}>
      <div className={styles.header}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.title}>
            Esto no es humo.
            <br />
            Ya tiene forma.
          </h2>
        </Reveal>
        <Reveal variants={fadeUp} delay={0.1}>
          <p className={styles.support}>
            Una experiencia pensada para que cocinar en casa vuelva a sentirse
            claro, útil y hasta disfrutable.
          </p>
        </Reveal>
      </div>

      <div className={styles.grid}>
        {/* Dominant screenshot */}
        <motion.div
          className={styles.dominant}
          style={{ y: y1 }}
        >
          <Reveal variants={fadeUp}>
            <img
              src={`/images/${SCREENSHOTS[0].label}`}
              alt="CookPilot app home"
              className={styles.dominantPlaceholder}
              style={{ objectFit: "cover" }}
            />
          </Reveal>
        </motion.div>

        {/* Supporting screenshots column */}
        <div className={styles.supportingCol}>
          <motion.div style={{ y: y2 }}>
            <Reveal variants={fadeUp} delay={0.1}>
              <img
                src={`/images/${SCREENSHOTS[1].label}`}
                alt="Cookflow chat"
                className={styles.supportingPlaceholder}
                style={{ objectFit: "cover" }}
              />
            </Reveal>
          </motion.div>

          <motion.div style={{ y: y3 }}>
            <Reveal variants={fadeUp} delay={0.2}>
              <img
                src={`/images/${SCREENSHOTS[2].label}`}
                alt="Pricing comparator"
                className={styles.supportingPlaceholder}
                style={{ objectFit: "cover" }}
              />
            </Reveal>
          </motion.div>
        </div>

        {/* Third column */}
        <div className={styles.supportingCol}>
          <motion.div style={{ y: y2 }}>
            <Reveal variants={fadeUp} delay={0.15}>
              <img
                src={`/images/${SCREENSHOTS[3].label}`}
                alt="Recipe detail"
                className={styles.supportingPlaceholder}
                style={{ objectFit: "cover" }}
              />
            </Reveal>
          </motion.div>

          <motion.div style={{ y: y1 }}>
            <Reveal variants={fadeUp} delay={0.25}>
              <img
                src={`/images/${SCREENSHOTS[4].label}`}
                alt="Splash brand"
                className={styles.accentPlaceholder}
                style={{ objectFit: "cover" }}
              />
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
