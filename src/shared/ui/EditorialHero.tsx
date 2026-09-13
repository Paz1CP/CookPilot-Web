"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { DownloadButton } from "@/shared/download/DownloadExperience";
import styles from "./EditorialHero.module.css";

type EditorialHeroProps = {
  eyebrow?: string;
  title: string;
  accent?: string;
  subtitle: string;
  primaryCta?: string;
  secondaryCta?: { label: string; href: string };
  children?: ReactNode;
};

export default function EditorialHero({
  eyebrow, title, accent, subtitle, primaryCta, secondaryCta, children,
}: EditorialHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}{accent && <span className={styles.accent}>{accent}</span>}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        {(primaryCta || secondaryCta) && (
          <div className={styles.heroCtas}>
            {primaryCta && <DownloadButton className="cp-btn cp-btn--primary">{primaryCta}</DownloadButton>}
            {secondaryCta && <Link href={secondaryCta.href} className="cp-btn cp-btn--ghost">{secondaryCta.label}<span aria-hidden="true">↗</span></Link>}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
