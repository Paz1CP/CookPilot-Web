"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Reveal, Parallax, fadeUp, slideFromRight } from "./motion";
import { motion, AnimatePresence } from "motion/react";
import styles from "./Brand.module.css";
import { useLocale } from "@/contexts/LanguageContext";

const MASCOTS = [
  {
    id: "pose",
    src: "/images/img_mascot_brand_pose.png",
    initial: { opacity: 0, scale: 0.8, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { type: "spring" as const, stiffness: 200, damping: 15 },
  },
  {
    id: "friendly",
    src: "/images/img_mascot_friendly.png",
    initial: { opacity: 0, scale: 0.9, rotate: -10, x: -20 },
    animate: { opacity: 1, scale: 1, rotate: 0, x: 0 },
    transition: { type: "spring" as const, stiffness: 180, damping: 12 },
  },
  {
    id: "helper",
    src: "/images/img_mascot_helper.png",
    initial: { opacity: 0, y: -40, rotate: 5 },
    animate: { opacity: 1, y: 0, rotate: 0 },
    transition: { type: "spring" as const, stiffness: 220, damping: 14 },
  },
];

const INTERVAL = 4000; // 4 seconds per mascot

export default function Brand() {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % MASCOTS.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const activeMascot = MASCOTS[activeIndex];

  return (
    <section className={styles.brand} id="brand">
      <div className={styles.inner}>
        <div className={styles.textCol}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.title}>
              {t.brand.section_title_main}
              <span className={styles.titleAccent}>
                {t.brand.section_title_accent}
              </span>
            </h2>
          </Reveal>

          <Reveal variants={fadeUp} delay={0.12}>
            <p className={styles.body}>{t.brand.section_body}</p>
          </Reveal>
        </div>

        <Parallax speed={0.05} className={styles.mascotCol}>
          <div className={styles.mascotWrap}>
            <div className={styles.mascotGlow} />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMascot.id}
                className={styles.mascotPlaceholder}
                initial={activeMascot.initial}
                animate={activeMascot.animate}
                exit={{ 
                  opacity: 0, 
                  filter: "blur(8px)",
                  scale: 0.9,
                  transition: { duration: 0.4 } 
                }}
                transition={activeMascot.transition}
              >
                <Image
                  src={activeMascot.src}
                  alt={t.brand.mascot_alt}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 1024px) 100vw, 360px"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </Parallax>
      </div>
    </section>
  );
}
