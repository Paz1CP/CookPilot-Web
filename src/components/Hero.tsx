"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

import styles from "./Hero.module.css";

interface FloatingIconDef {
  src: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: number;
  rotation: number;
  delay: number;
  floatDuration: number;
}

interface HeroState {
  headline: string;
  support: React.ReactNode;
  placeholder: string;
  floatingIcons?: FloatingIconDef[];
}

const HERO_STATES: HeroState[] = [
  {
    headline: "Cocina para ahorrar plata",
    support:
      "Menos improvisación. Más criterio. Más control sobre lo que gastas.",
    placeholder: "img_hero_pricing_visual.png",
    floatingIcons: [
      { src: "img_icon_money.webp", top: "-10%", left: "-20%", size: 160, rotation: -12, delay: 0.1, floatDuration: 3.2 },
      { src: "img_icon_money.webp", top: "15%", right: "-22%", size: 128, rotation: 15, delay: 0.25, floatDuration: 2.8 },
      { src: "img_icon_money.webp", bottom: "15%", left: "-20%", size: 112, rotation: -5, delay: 0.35, floatDuration: 3.5 },
      { src: "img_icon_money.webp", bottom: "-8%", right: "-10%", size: 80, rotation: 22, delay: 0.45, floatDuration: 2.9 },
    ],
  },
  {
    headline: "Cocina para ahorrar tiempo",
    support:
      "Menos vueltas. Menos fricción. Decide más rápido qué cocinar hoy.",
    placeholder: "img_hero_time_visual.png",
    floatingIcons: [
      { src: "img_icon_time.webp", top: "0%", right: "-22%", size: 160, rotation: 18, delay: 0.15, floatDuration: 3.1 },
      { src: "img_icon_time.webp", top: "40%", left: "-22%", size: 128, rotation: -14, delay: 0.25, floatDuration: 2.7 },
      { src: "img_icon_time.webp", bottom: "10%", right: "-20%", size: 112, rotation: -20, delay: 0.35, floatDuration: 3.6 },
      { src: "img_icon_time.webp", bottom: "0%", left: "-10%", size: 80, rotation: 10, delay: 0.45, floatDuration: 2.9 },
    ],
  },
  {
    headline: "Cocina para comer mejor",
    support:
      "Mejor nutrición, sin romper tu cultura ni tu vida real.",
    placeholder: "img_hero_health_visual.png",
    floatingIcons: [
      { src: "img_icon_health.webp", top: "-10%", right: "0%", size: 160, rotation: 12, delay: 0.1, floatDuration: 3.0 },
      { src: "img_icon_health.webp", top: "35%", left: "-25%", size: 128, rotation: -18, delay: 0.25, floatDuration: 3.4 },
      { src: "img_icon_health.webp", bottom: "15%", right: "-22%", size: 112, rotation: 25, delay: 0.35, floatDuration: 2.8 },
      { src: "img_icon_health.webp", bottom: "-10%", left: "-12%", size: 80, rotation: -8, delay: 0.45, floatDuration: 3.2 },
    ],
  },
  {
    headline: "Recupera el control de tu cocina",
    support: (
      <>
        Dime qué tienes y <span className="brand-cook">Cook</span>
        <span className="brand-pilot">Pilot</span> te ayuda a resolverlo con claridad.
      </>
    ),
    placeholder: "img_hero_control_visual.png",
    floatingIcons: [
      { src: "img_mascot_brand_pose.png", top: "-10%", left: "-20%", size: 160, rotation: -10, delay: 0.15, floatDuration: 3.3 },
      { src: "img_mascot_friendly.png", top: "25%", right: "-25%", size: 128, rotation: 14, delay: 0.3, floatDuration: 2.9 },
      { src: "img_mascot_helper.png", bottom: "10%", left: "-22%", size: 112, rotation: -6, delay: 0.45, floatDuration: 3.5 },
    ],
  },
];

const INTERVAL = 5200;

export default function Hero() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % HERO_STATES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  const state = HERO_STATES[active];

  const scrollToDemo = () => {
    const el = document.getElementById("demo");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={styles.hero} id="hero">
      {/* Dynamic Background — "Flame" Gradients */}
      <div className={styles.bgContainer}>
        <div className={styles.bgNoise} />
        <motion.div
          className={`${styles.blob} ${styles.blobPrimary}`}
          animate={{
            x: [0, 120, -60, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.15, 0.85, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`${styles.blob} ${styles.blobAccent}`}
          animate={{
            x: [0, -150, 80, 0],
            y: [0, 100, -50, 0],
            scale: [1, 1.25, 0.75, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`${styles.blob} ${styles.blobError}`}
          animate={{
            x: [0, 90, -120, 0],
            y: [0, -60, 140, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`${styles.blob} ${styles.blobLight}`}
          animate={{
            x: [0, -60, 60, 0],
            y: [0, 80, -80, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
        <div className={styles.bgOverlay} />
      </div>

      <div className={styles.inner}>
        {/* Left Column */}
        <div className={styles.left}>


          <div className={styles.headlineWrap}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={`headline-${active}`}
                className={styles.headline}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {state.headline}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className={styles.supportWrap}>
            <AnimatePresence mode="wait">
              <motion.p
                key={`support-${active}`}
                className={styles.support}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.08,
                }}
              >
                {state.support}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.div
            className={styles.ctaWrap}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.7,
            }}
          >
            <button
              className={`cp-btn cp-btn--primary ${styles.ctaBtn}`}
              onClick={scrollToDemo}
            >
              Watch demo 30s
            </button>
          </motion.div>

          {/* State indicator — subtle dots */}
          <motion.div
            className={styles.stateIndicator}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            {HERO_STATES.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Go to state ${i + 1}`}
              />
            ))}
          </motion.div>
        </div>

        {/* Right Column — Visual */}
        <div 
          className={styles.right}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`visual-${active}`}
              className={styles.visualFrame}
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.97 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x > 50) {
                  setActive((prev) => (prev - 1 + HERO_STATES.length) % HERO_STATES.length);
                } else if (info.offset.x < -50) {
                  setActive((prev) => (prev + 1) % HERO_STATES.length);
                }
              }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <img
                src={`/images/${state.placeholder}`}
                alt={state.headline}
                className={styles.heroPlaceholder}
              />

              {/* Bouncing / Floating Icons */}
              {state.floatingIcons?.map((icon, idx) => (
                <motion.div
                  key={`${active}-icon-${idx}`}
                  initial={{ opacity: 0, scale: 0, y: 40, rotate: icon.rotation - 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: icon.rotation }}
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 15,
                    delay: 0.1 + icon.delay,
                  }}
                  style={{
                    position: "absolute",
                    top: icon.top,
                    left: icon.left,
                    right: icon.right,
                    bottom: icon.bottom,
                    zIndex: 10,
                  }}
                >
                  <motion.img
                    src={`/images/${icon.src}`}
                    alt="Floating element"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: icon.floatDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      width: `${icon.size}px`,
                      height: `${icon.size}px`,
                      objectFit: "contain",
                      filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.3))",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
