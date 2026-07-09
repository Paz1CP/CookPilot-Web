"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./Hero.module.css";
import { useLocale } from "@/contexts/LanguageContext";

const HeroBackground = () => (
  <div className={styles.bgContainer}>
    <div className={styles.bgNoise} />
    <motion.div
      className={`${styles.blob} ${styles.blobPrimary}`}
      animate={{ x: [0, 120, -60, 0], y: [0, -80, 40, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className={`${styles.blob} ${styles.blobAccent}`}
      animate={{ x: [0, -150, 80, 0], y: [0, 100, -50, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className={`${styles.blob} ${styles.blobError}`}
      animate={{ x: [0, 90, -120, 0], y: [0, -60, 140, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className={`${styles.blob} ${styles.blobLight}`}
      animate={{ x: [0, -60, 60, 0], y: [0, 80, -80, 0] }}
      transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
    />
    <div className={styles.bgOverlay} />
  </div>
);

const APP_SLIDES = [
  "/images/app/cookhome.png",
  "/images/app/cooklist.png",
  "/images/app/cookplan.png",
];

export default function Hero() {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % APP_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.hero} id="hero">
      <HeroBackground />

      <div className={styles.inner}>
        {/* Columna izquierda */}
        <div className={styles.left}>
        
          <div className={styles.headlineWrap}>
            <motion.h1
              className={styles.headline}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {t.hero.title}
            </motion.h1>
          </div>

          <div className={styles.supportWrap}>
            <motion.p
              className={styles.support}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >
              {t.hero.subtitle}
            </motion.p>
          </div>

         

          <motion.div
            className={styles.ctaWrap}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <a
              href="#"
              className="cp-btn cp-btn--ghost"
            >
              <Image
                src="/icons/play-store.png"
                alt="Google Play"
                width={36}
                height={36}
                priority={false}
              />
              {t.hero.download_google_play}
            </a>
            <a
              href="#"
              className="cp-btn cp-btn--ghost"
            >
              <Image
                src="/icons/huawei-gallery.png"
                alt="Huawei"
                width={36}
                height={36}
                priority={false}
              />
              {t.hero.download_appgallery}
            </a>
          </motion.div>
        </div>

        {/* Columna derecha — Visual */}
        <div className={styles.right}>
          <motion.div
            className={styles.visualFrame}
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.slideWrap}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  className={styles.slide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                >
                  <Image
                    src={APP_SLIDES[index]}
                    alt={`CookPilot showcase ${index + 1}`}
                    width={884}
                    height={1600}
                    priority={index === 0}
                    style={{ width: "100%", height: "auto" }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={styles.heroPlaceholder}
                  />
                </motion.div>
              </AnimatePresence>
              <Image
                src="/images/cookpilot/thumbs_up.webp"
                alt="Thumbs up"
                width={360}
                height={360}
                priority={false}
                className={styles.thumbsBadge}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
