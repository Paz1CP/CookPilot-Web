"use client";

import { Reveal, fadeUp } from "./motion";
import styles from "./ComoFuncionaContent.module.css";
import { InfoCircle, Calendar, Setting, Bag2, Book, Refresh } from "iconsax-reactjs";

interface SectionContent {
  title: string;
  text: string[];
  blocks?: { title: string; desc: string }[];
}

interface ComoFuncionaData {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    supportText: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  section1: SectionContent;
  section2: SectionContent;
  section3: SectionContent;
  section4: SectionContent;
  section5: SectionContent;
  section6: SectionContent;
  section7: SectionContent;
  section8: {
    title: string;
    text?: string[];
    ctaPrimary: string;
    ctaSecondary: string;
  };
}

const SECTION_ICONS = [
  InfoCircle,
  Calendar,
  Setting,
  Bag2,
  Book,
  Refresh,
];

export default function ComoFuncionaContent({ content }: { content: ComoFuncionaData }) {
  const sections = [
    { ...content.section2, icon: Setting },
    { ...content.section3, icon: Calendar },
    { ...content.section4, icon: Bag2 },
    { ...content.section5, icon: InfoCircle },
    { ...content.section6, icon: Book },
    { ...content.section7, icon: Refresh },
  ];

  return (
    <main className={styles.main}>
      {/* Hero Section */}
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
          <Reveal variants={fadeUp} delay={0.4}>
            <div className={styles.heroCtas}>
              <a href="#download-final" className="cp-btn cp-btn--primary">
                {content.hero.ctaPrimary}
              </a>
              <a href="#flow" className="cp-btn cp-btn--ghost">
                {content.hero.ctaSecondary}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Visión General */}
      <section className={styles.section1}>
        <div className={styles.inner}>
          <div className={styles.overviewBox}>
            <Reveal variants={fadeUp}>
              <h2 className={styles.secTitle}>{content.section1.title}</h2>
            </Reveal>
            <div className={styles.overviewText}>
              {content.section1.text.map((p, i) => (
                <Reveal key={i} variants={fadeUp} delay={0.1 * i}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Sections */}
      <section className={styles.gridSection} id="flow">
        <div className={styles.inner}>
          <div className={styles.verticalFlow}>
            {sections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div key={idx} className={styles.flowCard}>
                  <div className={styles.flowHeader}>
                    <div className={styles.iconWrap}>
                      <Icon size={24} variant="Bulk" />
                    </div>
                    <Reveal variants={fadeUp}>
                      <h3 className={styles.flowTitle}>{sec.title}</h3>
                    </Reveal>
                  </div>
                  
                  <div className={styles.flowContent}>
                    <div className={styles.flowText}>
                      {sec.text.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                    
                    {sec.blocks && (
                      <div className={styles.blocksGrid}>
                        {sec.blocks.map((block, bIdx) => (
                          <div key={bIdx} className={styles.subBlock}>
                            <h4 className={styles.subBlockTitle}>{block.title}</h4>
                            <p className={styles.subBlockDesc}>{block.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.finalCTA} id="download-final">
        <div className={styles.inner}>
          <div className={styles.ctaBox}>
            <Reveal variants={fadeUp}>
              <h2 className={styles.ctaTitle}>{content.section8.title}</h2>
            </Reveal>
            {content.section8.text && content.section8.text.length > 0 && (
              <div className={styles.ctaText}>
                {content.section8.text.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            <Reveal variants={fadeUp} delay={0.2}>
              <div className={styles.ctaButtons}>
                <a href="#" className="cp-btn cp-btn--primary">
                  {content.section8.ctaPrimary}
                </a>
                <a href="#" className="cp-btn cp-btn--ghost">
                  {content.section8.ctaSecondary}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
