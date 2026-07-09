"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { Sun1, Moon } from "iconsax-reactjs";
import styles from "./Header.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function Header() {
  const { t, locale, toggleLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.getAttribute("data-theme") || "light";
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
    setScrolled(latest > 40);
  });

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const menuItems = locale === "es"
    ? [
        { label: t.header.como_funciona, href: "/es/como-funciona" },
        { label: t.header.guias, href: "/es/guias" },
        { label: t.header.pro, href: "/es/pro" },
        { label: t.header.faq, href: "/es/faq" },
      ]
    : [
        { label: t.header.como_funciona, href: "/en/how-it-works" },
        { label: t.header.guias, href: "/en/guides" },
        { label: t.header.pro, href: "/en/pro" },
        { label: t.header.faq, href: "/en/faq" },
      ];

  return (
    <motion.header
      className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <div className={styles.inner}>
        <Link href={locale === "es" ? "/es" : "/en"} className={styles.logo}>
          <Image
            src="/images/img_app_icon.png"
            alt={t.header.logo_alt}
            width={36}
            height={36}
            className={styles.logoImage}
            priority
          />
          <span className={styles.logoText}>
            <span className="brand-cook">Cook</span>
            <span className="brand-pilot">Pilot</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={toggleLocale}
            aria-label={t.header.toggle_language}
            title={t.header.toggle_language}
          >
            <Image
              src={locale === "es" ? "/icons/usa-icon.png" : "/icons/peru-icon.png"}
              alt=""
              width={24}
              height={24}
              className={styles.flagIcon}
              priority
            />
          </button>

          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label={t.header.toggle_theme}
          >
            {theme === "dark" ? (
              <Sun1 variant="Bold" size={24} color="var(--cp-primary)" />
            ) : (
              <Moon variant="Bold" size={24} color="var(--cp-dark)" />
            )}
          </button>

          <Link
            href="#download-final"
            className="cp-btn cp-btn--primary"
          >
            {t.header.descargar}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
