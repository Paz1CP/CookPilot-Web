"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "iconsax-reactjs";
import { Reveal, fadeUp } from "./motion";
import styles from "./FeaturedGuides.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function FeaturedGuides() {
  const { t, locale } = useLocale();

  const guides = [
    { label: t.guides.g1, num: "01", icon: "/icons/actions/user.png" },
    { label: t.guides.g2, num: "02", icon: "/icons/actions/planning.png" },
    { label: t.guides.g3, num: "03", icon: "/icons/actions/full_day.png" },
    { label: t.guides.g4, num: "04", icon: "/icons/actions/nutrition.png" },
    { label: t.guides.g5, num: "05", icon: "/icons/actions/cooking.png" },
    { label: t.guides.g6, num: "06", icon: "/icons/actions/simple_menu.png" },
  ];

  const targetPath = locale === "es" ? "/es/guias" : "/en/guides";
  const [featuredGuide, ...secondaryGuides] = guides;

  return (
    <section className={styles.guides} id="guides">
      <div className={styles.inner}>
        <div className={styles.header}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.title}>{t.guides.title}</h2>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <p className={styles.subtitle}>{t.guides.subtitle}</p>
          </Reveal>
        </div>

        <div className={styles.grid}>
          <Reveal variants={fadeUp}>
            <Link href={targetPath} className={styles.featureCard}>
              <div className={styles.featureCopy}>
                <div className={styles.topRow}>
                  <span className={styles.num}>{featuredGuide.num}</span>
                  <div className={styles.arrowWrap}>
                    <ArrowRight size={18} className={styles.arrow} />
                  </div>
                </div>

                <h3 className={styles.featureTitle}>{featuredGuide.label}</h3>
                <p className={styles.featureSupport}>
                  {t.home_editorial.guide_feature_support}
                </p>
              </div>

              <div className={styles.featureVisual} aria-hidden="true">
                <Image
                  src={featuredGuide.icon}
                  alt=""
                  width={240}
                  height={240}
                  className={styles.featureIcon}
                />
              </div>
            </Link>
          </Reveal>

          {secondaryGuides.map((guide, idx) => (
            <Reveal key={guide.num} variants={fadeUp} delay={0.05 * (idx + 1)}>
              <Link href={targetPath} className={styles.card}>
                <div className={styles.topRow}>
                  <span className={styles.num}>{guide.num}</span>
                  <div className={styles.arrowWrap}>
                    <ArrowRight size={18} className={styles.arrow} />
                  </div>
                </div>

                <h3 className={styles.cardLabel}>{guide.label}</h3>

                <span className={styles.iconBadge} aria-hidden="true">
                  <Image src={guide.icon} alt="" width={72} height={72} className={styles.iconImg} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
