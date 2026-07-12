"use client";

import { Reveal, fadeUp } from "@/shared/motion/motion";
import styles from "./ComparativasPageContent.module.css";
import { InfoCircle, Award, Book, DirectboxReceive, ClipboardText, CloseCircle } from "iconsax-reactjs";

const comparisonIcons = [
  Book,
  ClipboardText,
  Award,
  DirectboxReceive,
  InfoCircle,
  CloseCircle,
] as const;

interface CompareBlock {
  title: string;
  desc: string;
  contrast: string;
  slug: string;
}

interface ComparePageData {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    supportText: string;
  };
  section1: {
    title: string;
    contrastLabel: string;
    blocks: CompareBlock[];
  };
}

export default function ComparativasPageContent({ content }: { content: ComparePageData }) {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.inner}>
          <Reveal variants={fadeUp}>
            <span className={styles.eyebrow}>{content.hero.eyebrow}</span>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.1}>
            <h1 className={styles.title}>{content.hero.title}</h1>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.2}>
            <p className={styles.subtitle}>{content.hero.subtitle}</p>
          </Reveal>
          <Reveal variants={fadeUp} delay={0.3}>
            <p className={styles.supportText}>{content.hero.supportText}</p>
          </Reveal>
        </div>
      </section>

      <section className={styles.compareContent}>
        <div className={styles.inner}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.secTitle}>{content.section1.title}</h2>
          </Reveal>

          <div className={styles.grid}>
            {content.section1.blocks.map((block, idx) => {
              const Icon = comparisonIcons[idx] ?? InfoCircle;
              return (
                <Reveal key={block.slug} variants={fadeUp} delay={0.05 * idx}>
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.iconWrap}>
                        <Icon size={22} variant="Bulk" />
                      </div>
                      <h3 className={styles.cardTitle}>{block.title}</h3>
                    </div>

                    <div className={styles.cardBody}>
                      <p className={styles.descText}>{block.desc}</p>
                      <div className={styles.contrastBox}>
                        <span className={styles.contrastLabel}>{content.section1.contrastLabel}</span>
                        <p className={styles.contrastText}>{block.contrast}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
