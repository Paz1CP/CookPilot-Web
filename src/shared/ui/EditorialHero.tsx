"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { DownloadButton } from "@/shared/download/DownloadExperience";
import { Reveal, fadeUp } from "@/shared/motion/motion";
import styles from "./EditorialHero.module.css";

type EditorialHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta?: string;
  secondaryCta?: { label: string; href: string };
  children?: ReactNode;
};

export default function EditorialHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  children,
}: EditorialHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.inner}>
        {eyebrow ? (
          <Reveal variants={fadeUp}>
            <span className={styles.eyebrow}>{eyebrow}</span>
          </Reveal>
        ) : null}
        <Reveal variants={fadeUp} delay={0.1}>
          <h1 className={styles.title}>{title}</h1>
        </Reveal>
        <Reveal variants={fadeUp} delay={0.2}>
          <p className={styles.subtitle}>{subtitle}</p>
        </Reveal>
        {primaryCta || secondaryCta ? (
          <Reveal variants={fadeUp} delay={0.3}>
            <div className={styles.heroCtas}>
              {primaryCta ? (
                <DownloadButton className="cp-btn cp-btn--primary">
                  {primaryCta}
                </DownloadButton>
              ) : null}
              {secondaryCta ? (
                <Link href={secondaryCta.href} className="cp-btn cp-btn--ghost">
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </Reveal>
        ) : null}
      </div>
      {children}
    </section>
  );
}
