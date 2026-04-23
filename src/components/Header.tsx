"use client";

import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState, useEffect } from "react";
import { Sun1, Moon } from "iconsax-reactjs";
import styles from "./Header.module.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("es");

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

  const toggleLang = () => {
    setLang((prev) => (prev === "es" ? "en" : "es"));
  };

  const scrollToDemo = () => {
    const el = document.getElementById("demo");
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
        <div className={styles.logo}>
          <img
            src="/images/img_app_icon.png"
            alt="CookPilot Icon"
            className={styles.logoImage}
          />
          <span className={styles.logoText}>
            <span className={styles.brandCookHeader}>Cook</span>
            <span className="brand-pilot">Pilot</span>
          </span>
        </div>

        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={toggleLang} aria-label="Change language">
            {lang === "es" ? "🇵🇪" : "🇺🇸"}
          </button>
          
          <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? (
              <Sun1 variant="Bulk" size={22} color="var(--cp-primary)" />
            ) : (
              <Moon variant="Bulk" size={22} color="var(--cp-primary)" />
            )}
          </button>

          <button className={styles.demoLink} onClick={scrollToDemo}>
            <img 
              src="/images/img_icon_demo.png" 
              alt="" 
              style={{ width: "24px", height: "24px", objectFit: "contain" }}
            />
            Watch demo
          </button>
        </div>
      </div>
    </motion.header>
  );
}
