"use client";

import { useState, useEffect } from "react";
import { Reveal, fadeUp } from "./motion";
import styles from "./Demo.module.css";
import { motion, AnimatePresence } from "motion/react";
import { Play } from "iconsax-reactjs";
import { useLocale } from "@/contexts/LanguageContext";

export default function Demo() {
  const { t } = useLocale();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleTrigger = () => {
      setIsPlaying(true);
    };
    window.addEventListener("cp-trigger-demo", handleTrigger);
    return () => window.removeEventListener("cp-trigger-demo", handleTrigger);
  }, []);

  return (
    <section className={styles.demo} id="demo">
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={styles.focusOverlay}
            onClick={() => setIsPlaying(false)}
          />
        )}
      </AnimatePresence>

      <div className={styles.inner}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.title}>
            {t.demo.section_title_prefix}
            <span className="brand-cook">Cook</span>
            <span className="brand-pilot">Pilot</span>
            {t.demo.section_title_suffix}
          </h2>
        </Reveal>

        <Reveal variants={fadeUp} delay={0.12}>
          <p className={styles.micro}>{t.demo.section_microcopy}</p>
        </Reveal>

        <Reveal
          variants={fadeUp}
          delay={0.28}
          className={`${styles.playerReveal} ${isPlaying ? styles.elevated : ""}`}
        >
          <div className={`${styles.playerWrap} ${isPlaying ? styles.isPlaying : ""}`}>
            <div className={styles.playerGlow} />
            <div className={styles.player}>
              {!isPlaying ? (
                <div className={styles.facade} onClick={() => setIsPlaying(true)}>
                  <img
                    src="https://i.ytimg.com/vi/9AuzJ2GBCGw/maxresdefault.jpg"
                    alt={t.demo.thumbnail_alt}
                    className={styles.thumbnail}
                  />
                  <div className={styles.playBtnWrap}>
                    <button className={styles.playBtn} aria-label={t.demo.play_button_aria}>
                      <Play variant="Linear" size={32} />
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  className={styles.iframe}
                  src="https://www.youtube.com/embed/9AuzJ2GBCGw?autoplay=1&rel=0"
                  title={t.demo.iframe_title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
