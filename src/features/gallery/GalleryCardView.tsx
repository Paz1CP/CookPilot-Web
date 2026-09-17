/* eslint-disable @next/next/no-img-element -- public recipe media keeps its intrinsic source ratio */
import Link from "next/link";
import type { AppLocale } from "@/shared/config/routes";
import type { GalleryCard } from "@/lib/cookshare/types";
import { inlineMarkdownToText } from "@/lib/cookshare/inline-markdown";
import styles from "./GalleryClient.module.css";

function cardTypeLabel(card: GalleryCard, locale: AppLocale) {
  const labels = locale === "es"
    ? { recipe: "Receta", menu: "Menú", day: "Día", week: "Semana", list: "Lista", ingredient: "Ingrediente", category: "Categoría" }
    : { recipe: "Recipe", menu: "Menu", day: "Day", week: "Week", list: "List", ingredient: "Ingredient", category: "Category" };
  return labels[card.objectType];
}

function cardImage(card: GalleryCard, index: number, hasCursor: boolean) {
  return card.imageUrl ? (
    <img
      src={card.imageUrl}
      alt={card.title}
      loading={index === 0 && !hasCursor ? "eager" : "lazy"}
      fetchPriority={index === 0 && !hasCursor ? "high" : undefined}
      decoding="async"
    />
  ) : (
    <div className={styles.fallback} aria-hidden="true">
      <span>CookPilot</span>
    </div>
  );
}

export default function GalleryCardView({
  card,
  locale,
  index = 0,
  hasCursor = false,
}: {
  card: GalleryCard;
  locale: AppLocale;
  index?: number;
  hasCursor?: boolean;
}) {
  return (
    <Link href={card.href} className={styles.card} aria-label={`${cardTypeLabel(card, locale)}: ${card.title}`}>
      <div className={styles.media}>{cardImage(card, index, hasCursor)}</div>
      <div className={styles.body}>
        <h2>{card.title}</h2>
        {card.description ? <p>{inlineMarkdownToText(card.description)}</p> : null}
        <div className={styles.meta}>
          {card.timeMinutes !== null ? <span>{card.timeMinutes} min</span> : null}
        </div>
      </div>
    </Link>
  );
}
