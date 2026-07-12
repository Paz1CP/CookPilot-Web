"use client";

import { useMemo, useState } from "react";
import {
  DocumentText,
  Global,
  InfoCircle,
  Lock,
  MessageText,
  ReceiptText,
  ShieldTick,
  Trash,
} from "iconsax-reactjs";
import { useLocale, type Locale } from "@/contexts/LanguageContext";
import styles from "./PrivacyAndTermsPage.module.css";

type Documents = Record<Locale, string>;

type TextBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    };

interface Subsection {
  id: string;
  title: string;
  blocks: TextBlock[];
}

interface PolicySection {
  id: string;
  title: string;
  blocks: TextBlock[];
  subsections: Subsection[];
}

interface ParsedPolicy {
  title: string;
  updatedAt: string;
  intro: TextBlock[];
  sections: PolicySection[];
}

interface PrivacyAndTermsPageProps {
  documents: Documents;
}

const ui = {
  es: {
    titleA: "Privacidad y términos",
    titleB: "sin letra chica visual",
    intro:
      "Todo el copy legal de CookPilot, organizado para que puedas revisar datos, AI, pagos, derechos y eliminación de cuenta sin enfrentarte a una pared de texto.",
    updatedLabel: "Última actualización",
    contactLabel: "Contacto",
    contactValue: "support@cookpilot.pro",
    tabs: {
      full: "Documento completo",
      account: "Eliminar cuenta",
    },
    highlights: [
      {
        icon: ShieldTick,
        title: "Datos personales",
        body: "Qué recopilamos, por qué lo usamos y cómo protegemos tu cuenta.",
      },
      {
        icon: Lock,
        title: "AI y proveedores",
        body: "Cómo se procesan recetas, imágenes, audio y contexto culinario.",
      },
      {
        icon: ReceiptText,
        title: "Planes y pagos",
        body: "Suscripciones, packs, límites, cancelaciones y reembolsos.",
      },
      {
        icon: Trash,
        title: "Eliminación",
        body: "Qué ocurre cuando solicitas borrar tu cuenta y tus datos.",
      },
    ],
    tocTitle: "En esta página",
    fullIntro: "Documento completo",
    accountIntro:
      "Vista rápida de las secciones específicas sobre eliminación de cuenta, datos asociados y suscripciones activas.",
    sectionLabel: "Sección",
    noAccountSections:
      "No encontramos secciones específicas de eliminación de cuenta en este documento.",
    deletionCtaTitle: "Eliminar cuenta",
    deletionCtaBody:
      "Puedes eliminar tu cuenta directamente desde la página pública de eliminación con verificación por correo.",
    deletionCtaAction: "Ir a eliminar cuenta",
  },
  en: {
    titleA: "Privacy and terms",
    titleB: "without the wall of text",
    intro:
      "CookPilot's full legal copy, structured so you can review data, AI, payments, rights, and account deletion without digging through a flat document.",
    updatedLabel: "Last updated",
    contactLabel: "Contact",
    contactValue: "support@cookpilot.pro",
    tabs: {
      full: "Full document",
      account: "Delete account",
    },
    highlights: [
      {
        icon: ShieldTick,
        title: "Personal data",
        body: "What we collect, why we use it, and how we protect your account.",
      },
      {
        icon: Lock,
        title: "AI and providers",
        body: "How recipes, images, audio, and cooking context may be processed.",
      },
      {
        icon: ReceiptText,
        title: "Plans and payments",
        body: "Subscriptions, packs, limits, cancellations, and refunds.",
      },
      {
        icon: Trash,
        title: "Deletion",
        body: "What happens when you ask CookPilot to delete your account and data.",
      },
    ],
    tocTitle: "On this page",
    fullIntro: "Full document",
    accountIntro:
      "Focused view of the sections about account deletion, associated data, and active subscriptions.",
    sectionLabel: "Section",
    noAccountSections:
      "We could not find account deletion sections in this document.",
    deletionCtaTitle: "Delete account",
    deletionCtaBody:
      "You can delete your account directly from the public deletion page with email verification.",
    deletionCtaAction: "Go to delete account",
  },
} satisfies Record<Locale, unknown>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripMarkdown(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function createSection(title: string, index: number): PolicySection {
  return {
    id: `${index}-${slugify(stripMarkdown(title))}`,
    title: stripMarkdown(title),
    blocks: [],
    subsections: [],
  };
}

function createSubsection(title: string, section: PolicySection): Subsection {
  return {
    id: `${section.id}-${slugify(stripMarkdown(title))}`,
    title: stripMarkdown(title),
    blocks: [],
  };
}

function flushParagraph(target: TextBlock[], paragraph: string[]) {
  if (!paragraph.length) return;
  target.push({
    type: "paragraph",
    text: paragraph.join(" ").replace(/\s+/g, " ").trim(),
  });
  paragraph.length = 0;
}

function parsePolicy(markdown: string): ParsedPolicy {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const title = stripMarkdown(lines.find((line) => line.startsWith("# "))?.slice(2) ?? "CookPilot");
  const updatedLine =
    lines.find((line) => line.includes("Última actualización") || line.includes("Last updated")) ?? "";
  const updatedAt = stripMarkdown(updatedLine.replace(/^.*?:\s*/, ""));

  const intro: TextBlock[] = [];
  const sections: PolicySection[] = [];
  let currentSection: PolicySection | null = null;
  let currentSubsection: Subsection | null = null;
  const paragraph: string[] = [];
  let currentList: string[] | null = null;

  const currentBlocks = () => {
    if (currentSubsection) return currentSubsection.blocks;
    if (currentSection) return currentSection.blocks;
    return intro;
  };

  const flushList = () => {
    if (!currentList?.length) {
      currentList = null;
      return;
    }
    currentBlocks().push({ type: "list", items: currentList });
    currentList = null;
  };

  const flushAll = () => {
    flushParagraph(currentBlocks(), paragraph);
    flushList();
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line || line === "---") {
      flushAll();
      return;
    }

    if (line.startsWith("# ") || line === updatedLine) return;

    if (line.startsWith("## ")) {
      flushAll();
      currentSection = createSection(line.slice(3), sections.length + 1);
      sections.push(currentSection);
      currentSubsection = null;
      return;
    }

    if (line.startsWith("### ")) {
      flushAll();
      if (!currentSection) {
        currentSection = createSection("General", sections.length + 1);
        sections.push(currentSection);
      }
      currentSubsection = createSubsection(line.slice(4), currentSection);
      currentSection.subsections.push(currentSubsection);
      return;
    }

    if (line.startsWith("* ")) {
      flushParagraph(currentBlocks(), paragraph);
      currentList = currentList ?? [];
      currentList.push(line.slice(2).trim());
      return;
    }

    flushList();
    paragraph.push(line);
  });

  flushAll();

  return {
    title,
    updatedAt,
    intro,
    sections,
  };
}

function renderLinkedText(text: string, keyPrefix: string) {
  const chunks = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  return chunks.map((chunk, index) => {
    const linkMatch = chunk.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!linkMatch) return <span key={`${keyPrefix}-text-${index}`}>{chunk}</span>;

    return (
      <a key={`${keyPrefix}-link-${index}`} href={linkMatch[2]}>
        {linkMatch[1]}
      </a>
    );
  });
}

function renderInline(text: string, keyPrefix: string) {
  const chunks = text.split(/(\*\*[^*]+\*\*)/g);

  return chunks.map((chunk, index) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-strong-${index}`}>
          {renderLinkedText(chunk.slice(2, -2), `${keyPrefix}-strong-${index}`)}
        </strong>
      );
    }

    return renderLinkedText(chunk, `${keyPrefix}-plain-${index}`);
  });
}

function PolicyBlocks({ blocks }: { blocks: TextBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={`list-${index}`} className={styles.list}>
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`}>{renderInline(item, `item-${index}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`paragraph-${index}`} className={styles.paragraph}>
            {renderInline(block.text, `paragraph-${index}`)}
          </p>
        );
      })}
    </>
  );
}

function PolicySectionCard({
  section,
  label,
}: {
  section: PolicySection;
  label: string;
}) {
  return (
    <article className={styles.policyCard} id={section.id}>
      <div className={styles.cardHeader}>
        <span className={styles.sectionKicker}>{label}</span>
        <h2>{section.title}</h2>
      </div>

      <PolicyBlocks blocks={section.blocks} />

      {section.subsections.map((subsection) => (
        <section key={subsection.id} className={styles.subsection} id={subsection.id}>
          <h3>{subsection.title}</h3>
          <PolicyBlocks blocks={subsection.blocks} />
        </section>
      ))}
    </article>
  );
}

function isDeletionSection(section: PolicySection) {
  const title = section.title.toLowerCase();
  return (
    title.includes("eliminación") ||
    title.includes("eliminar cuenta") ||
    title.includes("delete account") ||
    title.includes("account and data deletion")
  );
}

export default function PrivacyAndTermsPage({ documents }: PrivacyAndTermsPageProps) {
  const { locale } = useLocale();
  const copy = ui[locale];
  const [activeTab, setActiveTab] = useState<"full" | "account">("full");

  const policy = useMemo(() => parsePolicy(documents[locale]), [documents, locale]);
  const deletionSections = useMemo(
    () => policy.sections.filter((section) => isDeletionSection(section)),
    [policy.sections],
  );
  const visibleSections = activeTab === "account" ? deletionSections : policy.sections;

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className={styles.page}>
      <div className={styles.heroShell}>
        <div className={styles.heroCopy}>
         
          <h1>
            {copy.titleA}
            <span>{copy.titleB}</span>
          </h1>
          <p>{copy.intro}</p>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span>{copy.updatedLabel}</span>
              <strong>{policy.updatedAt}</strong>
            </div>
            <a className={styles.metaItem} href={`mailto:${copy.contactValue}`}>
              <span>{copy.contactLabel}</span>
              <strong>{copy.contactValue}</strong>
            </a>
          </div>
        </div>

        <div className={styles.heroPanel} aria-label={policy.title}>
          <div className={styles.panelTop}>
            <InfoCircle variant="Bulk" size={28} color="var(--cp-primary)" />
            <span>{policy.title}</span>
          </div>
          <PolicyBlocks blocks={policy.intro} />
        </div>
      </div>

      <div className={styles.highlights}>
        {copy.highlights.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <Icon variant="Bulk" size={24} color="var(--cp-primary)" />
              </div>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          );
        })}
      </div>

      <div className={styles.tabsWrap}>
        <div className={styles.tabs} role="tablist" aria-label={copy.tocTitle}>
          <button
            type="button"
            className={activeTab === "full" ? styles.activeTab : ""}
            onClick={() => setActiveTab("full")}
            role="tab"
            aria-selected={activeTab === "full"}
          >
            <Global variant="Bulk" size={18} color="currentColor" />
            {copy.tabs.full}
          </button>
          <button
            type="button"
            className={activeTab === "account" ? styles.activeTab : ""}
            onClick={() => setActiveTab("account")}
            role="tab"
            aria-selected={activeTab === "account"}
          >
            <Trash variant="Bulk" size={18} color="currentColor" />
            {copy.tabs.account}
          </button>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <aside className={styles.toc} aria-label={copy.tocTitle}>
          <div className={styles.tocInner}>
            <h2>{copy.tocTitle}</h2>
            <p>{activeTab === "account" ? copy.accountIntro : copy.fullIntro}</p>
            <nav>
              {visibleSections.map((section) => (
                <button key={section.id} type="button" onClick={() => jumpTo(section.id)}>
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className={styles.policyStack}>
          {visibleSections.length ? (
            visibleSections.map((section, index) => (
              <PolicySectionCard
                key={section.id}
                section={section}
                label={`${copy.sectionLabel} ${index + 1}`}
              />
            ))
          ) : (
            <div className={styles.emptyState}>{copy.noAccountSections}</div>
          )}

          <section className={styles.deletionCta}>
            <div>
              <MessageText variant="Bulk" size={28} color="var(--cp-primary)" />
              <h2>{copy.deletionCtaTitle}</h2>
              <p>{copy.deletionCtaBody}</p>
            </div>
            <a className="cp-btn cp-btn--primary" href="/delete-account">
              {copy.deletionCtaAction}
            </a>
          </section>
        </div>
      </div>
    </section>
  );
}
