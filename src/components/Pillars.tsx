"use client";

import {
  Reveal,
  StaggerReveal,
  Parallax,
  fadeUp,
  slideFromRight,
  slideFromLeft,
} from "./motion";
import { motion } from "motion/react";
import styles from "./Pillars.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function Pillars() {
  const { t } = useLocale();

  const PILLARS = [
    {
      title: t.pillars.pillar_1_title,
      body: t.pillars.pillar_1_body,
      screenshotPlaceholder: "img_app_pricing_comparator.png",
    },
    {
      title: t.pillars.pillar_2_title,
      body: t.pillars.pillar_2_body,
      screenshotPlaceholder: "img_hero_time_visual.png",
    },
    {
      title: t.pillars.pillar_3_title,
      body: t.pillars.pillar_3_body,
      screenshotPlaceholder: "img_hero_health_visual.png",
    },
  ];

  return (
    <section className={styles.pillars} id="pillars">
      <div className={styles.sectionHeader}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.sectionTitle}>
            {t.pillars.section_title_main}
            <span className={styles.titleAccent}>
              {t.pillars.section_title_accent}
            </span>
          </h2>
        </Reveal>
        <Reveal variants={fadeUp} delay={0.1}>
          <p className={styles.sectionSupport}>
            <span className="brand-cook">Cook</span>
            <span className="brand-pilot">Pilot</span>
            {t.pillars.section_support_suffix}
          </p>
        </Reveal>
      </div>

      <div className={styles.pillarList}>
        {PILLARS.map((pillar, i) => {
          const isReversed = i % 2 === 1;
          const glowClass = styles[`glow${i + 1}`];

          return (
            <div
              key={i}
              className={`${styles.pillarBlock} ${isReversed ? styles.reversed : ""}`}
            >
              <div className={`${styles.glowBubble} ${glowClass}`} />

              <StaggerReveal className={styles.textCol}>
                <Reveal variants={fadeUp}>
                  <h3 className={styles.pillarTitle}>
                    <span className={styles.numberPrefix}>{i + 1})</span>
                    {pillar.title}
                  </h3>
                </Reveal>
                <Reveal variants={fadeUp}>
                  <p className={styles.pillarBody}>{pillar.body}</p>
                </Reveal>
              </StaggerReveal>

              <div className={styles.visualCol}>
                {i === 0 && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 40 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      style={{ position: "absolute", top: "12%", left: "calc(50% + 140px)", zIndex: 1 }}
                    >
                      <motion.div className={styles.neoCard} animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                        +S/ 20
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: -40 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                      style={{ position: "absolute", top: "35%", left: "calc(50% - 280px)", zIndex: 1 }}
                    >
                      <motion.div className={styles.neoCard} animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                        +S/ 35
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 40 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
                      style={{ position: "absolute", bottom: "25%", left: "calc(50% + 160px)", zIndex: 1 }}
                    >
                      <motion.div className={styles.neoCard} animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                        +S/ 12
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: -40, y: 40 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.8 }}
                      style={{ position: "absolute", bottom: "10%", left: "calc(50% - 230px)", zIndex: 10 }}
                    >
                      <motion.div className={`${styles.neoCard} ${styles.neoCardFront}`} animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}>
                        +S/ 16
                      </motion.div>
                    </motion.div>
                  </>
                )}

                {i === 1 && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 40 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      style={{ position: "absolute", top: "12%", left: "calc(50% + 140px)", zIndex: 1 }}
                    >
                      <motion.div className={`${styles.neoCard} ${styles.neoCardBlue}`} animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                        +15 min
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: -40 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                      style={{ position: "absolute", top: "35%", left: "calc(50% - 280px)", zIndex: 1 }}
                    >
                      <motion.div className={`${styles.neoCard} ${styles.neoCardBlue}`} animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                        +30 min
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 40 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
                      style={{ position: "absolute", bottom: "25%", left: "calc(50% + 160px)", zIndex: 1 }}
                    >
                      <motion.div className={`${styles.neoCard} ${styles.neoCardBlue}`} animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                        +10 min
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: -40, y: 40 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.8 }}
                      style={{ position: "absolute", bottom: "10%", left: "calc(50% - 230px)", zIndex: 10 }}
                    >
                      <motion.div className={`${styles.neoCard} ${styles.neoCardFront} ${styles.neoCardBlue}`} animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}>
                        +45 min
                      </motion.div>
                    </motion.div>
                  </>
                )}

                {i === 2 && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 40, rotate: -20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      style={{ position: "absolute", top: "12%", left: "calc(50% + 140px)", zIndex: 1 }}
                    >
                      <motion.img src="/images/health/smart_fats.webp" className={styles.healthIcon} animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: -40, rotate: 20 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                      style={{ position: "absolute", top: "35%", left: "calc(50% - 280px)", zIndex: 1 }}
                    >
                      <motion.img src="/images/health/active_fiber.webp" className={styles.healthIcon} animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 40, rotate: -15 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
                      style={{ position: "absolute", bottom: "25%", left: "calc(50% + 160px)", zIndex: 1 }}
                    >
                      <motion.img src="/images/health/prolonged_satiety.webp" className={styles.healthIcon} animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: -40, y: 40, rotate: 25 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.8 }}
                      style={{ position: "absolute", bottom: "10%", left: "calc(50% - 230px)", zIndex: 10 }}
                    >
                      <motion.img src="/images/health/light_heart.webp" className={styles.healthIcon} animate={{ y: [0, -8, 0], rotate: [0, 12, -12, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
                    </motion.div>
                  </>
                )}

                <Reveal variants={isReversed ? slideFromLeft : slideFromRight}>
                  <motion.img
                    src={`/images/${pillar.screenshotPlaceholder}`}
                    alt={pillar.title}
                    className={styles.screenshotPlaceholder}
                    style={{ objectFit: "cover", position: "relative", zIndex: 5, transformStyle: "preserve-3d" }}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    whileHover={{
                      scale: 1.05,
                      rotateX: 10,
                      rotateY: isReversed ? -10 : 10,
                      transition: { type: "spring", stiffness: 300, damping: 20 },
                    }}
                  />
                </Reveal>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
