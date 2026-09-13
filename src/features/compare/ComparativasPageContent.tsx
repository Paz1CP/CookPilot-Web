"use client";

import Image from "next/image";
import { useLocale } from "@/contexts/LanguageContext";
import { getLocalizedRoute } from "@/shared/config/routes";
import EditorialHero from "@/shared/ui/EditorialHero";
import EditorialClosing from "@/features/public-editorial/EditorialClosing";
import EditorialReveal from "@/features/public-editorial/EditorialReveal";
import editorial from "@/features/public-editorial/Editorial.module.css";
import styles from "./ComparativasPageContent.module.css";

const illustrations = [
  "/icons/actions/recipe_library.webp", "/icons/actions/planning.png",
  "/icons/actions/nutrition.png", "/icons/actions/buying.png",
  "/icons/actions/reuse.png", "/icons/actions/simple_menu.png",
];

interface ComparePageData {
  hero: { eyebrow?: string; title: string; accent?: string; subtitle: string; supportText: string };
  section1: { title: string; contrastLabel: string; blocks: { title: string; desc: string; contrast: string; slug: string }[] };
}

export default function ComparativasPageContent({ content }: { content: ComparePageData }) {
  const { locale, t } = useLocale();
  return (
    <main className={editorial.page}>
      <EditorialHero {...content.hero} primaryCta={t.header.descargar}
        secondaryCta={{ label: t.header.como_funciona, href: getLocalizedRoute(locale, "howItWorks") }} />
      <div className={editorial.inner}>
        <section className={styles.statement}>
          <div className={styles.statementPhoto} aria-hidden="true">
            <Image src="/images/food/lomo_stir_fry.png" alt="" fill sizes="50vw" />
          </div>
          <p>{content.hero.supportText}</p>
        </section>
        <section className={styles.comparisons} aria-labelledby="comparison-title">
          <div className={styles.selector}>
            <h2 id="comparison-title">{content.section1.title}</h2>
            <nav aria-labelledby="comparison-title">
              {content.section1.blocks.map((block, index) => (
                <a key={block.slug} href={`#compare-${block.slug}`}><span>{String(index + 1).padStart(2, "0")}</span>{block.title}<span aria-hidden="true">↗</span></a>
              ))}
            </nav>
          </div>
          <div className={styles.rows}>
            {content.section1.blocks.map((block, index) => (
              <article id={`compare-${block.slug}`} key={block.slug} className={styles.row}>
                <header><span>{String(index + 1).padStart(2, "0")}</span><h3>{block.title}</h3></header>
                <div className={styles.argument}>
                  <p className={styles.before}>{block.desc}</p>
                  <EditorialReveal className={styles.after}>
                    <div><h4>{content.section1.contrastLabel}</h4><p>{block.contrast}</p></div>
                    <Image src={illustrations[index]} alt="" width={280} height={280} sizes="220px" />
                  </EditorialReveal>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <EditorialClosing />
    </main>
  );
}
