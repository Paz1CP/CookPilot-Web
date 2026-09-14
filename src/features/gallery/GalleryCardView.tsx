import Image from "next/image";
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
    <Image
      src={card.imageUrl}
      alt={card.title}
      width={720}
      height={480}
      sizes="(max-width: 680px) 100vw, (max-width: 1040px) 50vw, 33vw"
      priority={index === 0 && !hasCursor}
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
    <Link href={card.href} className={styles.card}>
      <div className={styles.media}>{cardImage(card, index, hasCursor)}</div>
      <div className={styles.body}>
        <span className={styles.type}>{cardTypeLabel(card, locale)}</span>
        <h2>{card.title}</h2>
        {card.description ? <p>{inlineMarkdownToText(card.description)}</p> : null}
        <div className={styles.meta}>
          {card.timeMinutes !== null ? <span>{card.timeMinutes} min</span> : null}
        </div>
      </div>
    </Link>
  );
}
