"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useEffect, useState } from "react";
import { Sun1, Moon, SearchNormal1 } from "iconsax-reactjs";
import styles from "./Header.module.css";
import { useLocale } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";
import { DownloadButton } from "@/shared/download/DownloadExperience";
import { getLocalizedRoute } from "@/shared/config/routes";
import { useLiquidGlass } from "@/shared/ui/useLiquidGlass";

function getProScrollTop() {
  const section = document.getElementById("go-pro");
  const panel = section?.querySelector<HTMLElement>(".lc-pro-panel") ?? section;
  if (!panel) return null;

  const rect = panel.getBoundingClientRect();
  return rect.top + window.scrollY + (rect.height - window.innerHeight) / 2;
}

export default function Header() {
  const { t, locale, toggleLocale } = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const liquidGlass = useLiquidGlass<HTMLElement>();
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.getAttribute("data-theme") || "light";
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
    setScrolled(latest > 40);
  });

  const homePath = locale === "es" ? "/es" : "/en";

  useEffect(() => {
    if (pathname !== homePath || window.location.hash !== "#go-pro") return;

    let frameId = 0;
    const alignWithProSection = () => {
      const top = getProScrollTop();
      if (top === null) {
        frameId = window.requestAnimationFrame(alignWithProSection);
        return;
      }

      window.scrollTo({ top, behavior: "auto" });
    };

    const timeoutId = window.setTimeout(alignWithProSection, 80);
    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
    };
  }, [homePath, pathname]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const menuItems = [
    { label: t.header.como_funciona, href: getLocalizedRoute(locale, "howItWorks") },
    { label: t.header.guias, href: getLocalizedRoute(locale, "guides") },
    { label: t.header.pro, href: `${locale === "es" ? "/es" : "/en"}#go-pro`, isLandingAnchor: true },
    { label: t.header.faq, href: getLocalizedRoute(locale, "faq") },
  ];

  const handleProClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== homePath) return;

    event.preventDefault();
    const top = getProScrollTop();
    if (top !== null) window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `${homePath}#go-pro`);
  };

  return (
    <>
    {liquidGlass.filter}
    <motion.header
      ref={liquidGlass.ref}
      className={`cp-appbar-glass ${scrolled ? "cp-appbar-glass--scrolled" : ""} ${styles.header}`}
      style={liquidGlass.style}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <div className={styles.inner}>
        <Link href={locale === "es" ? "/es" : "/en"} className={styles.logo}>
          <Image
            src="/images/cookpilot/cookpilot_logo.png"
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
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
              aria-current={!item.isLandingAnchor && pathname === item.href ? "page" : undefined}
              onClick={item.isLandingAnchor ? handleProClick : undefined}
            >
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
              src={locale === "es" ? "/icons/locale/usa-flag.png" : "/icons/locale/peru-flag.png"}
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
            href={getLocalizedRoute(locale, "gallery")}
            prefetch
            className={`${styles.iconBtn} ${styles.searchBtn}`}
            aria-label={t.header.open_gallery}
            title={t.header.open_gallery}
          >
            <SearchNormal1 variant="Linear" size={20} color="currentColor" aria-hidden="true" />
            <span className={styles.searchLabel}>{t.header.search_recipes}</span>
          </Link>

          <DownloadButton className={styles.downloadBtn}>
            {t.header.descargar}
          </DownloadButton>
        </div>
      </div>
    </motion.header>
    </>
  );
}
