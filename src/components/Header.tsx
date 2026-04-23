"use client";

import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState, useEffect } from "react";
import { Sun1, Moon } from "iconsax-reactjs";
import styles from "./Header.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function Header() {
  const { t, locale, toggleLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [theme, setTheme] = useState("dark");

  useMotionValueEvent(scrollY, "change", (latest) => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
    setScrolled(latest > 40);
  });

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const scrollToDemo = () => {
    const el = document.getElementById("demo");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("cp-trigger-demo"));
  };

  const scrollToHero = () => {
    const el = document.getElementById("hero");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <div className={styles.inner}>
        <div className={styles.logo} onClick={scrollToHero} style={{ cursor: "pointer" }}>
          <img
            src="/images/img_app_icon.png"
            alt={t.header.logo_alt}
            className={styles.logoImage}
          />
          <span className={styles.logoText}>
            <span className="brand-cook">Cook</span>
            <span className="brand-pilot">Pilot</span>
          </span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={toggleLocale}
            aria-label={t.header.toggle_language}
            title={t.header.toggle_language}
          >
            {locale === "es" ? "🇵🇪" : "🇺🇸"}
          </button>

          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label={t.header.toggle_theme}
          >
            {theme === "dark" ? (
              <Sun1 variant="Bulk" size={22} color="var(--cp-primary)" />
            ) : (
              <Moon variant="Bulk" size={22} color="var(--cp-dark)" />
            )}
          </button>

          <button className={styles.demoLink} onClick={scrollToDemo}>
            <img
              src="/images/img_icon_demo.png"
              alt=""
              style={{ width: "24px", height: "24px", objectFit: "contain" }}
            />
            {t.header.watch_demo}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
