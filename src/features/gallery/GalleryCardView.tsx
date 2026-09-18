import Image from "next/image";
import Link from "next/link";
import { Clock } from "iconsax-reactjs";
import type { AppLocale } from "@/shared/config/routes";
import type { GalleryCard } from "@/lib/cookshare/types";
import { inlineMarkdownToText } from "@/lib/cookshare/inline-markdown";
import es from "@/locales/gallery.es.json";
import en from "@/locales/gallery.en.json";
import styles from "./GalleryDiscovery.module.css";

function withGalleryReturnPath(href: string, returnPath?: string) {
  if (!returnPath) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}gallery_return=${encodeURIComponent(returnPath)}`;
}

export default function GalleryCardView({
  card,
  locale,
  returnPath,
}: {
  card: GalleryCard;
  locale: AppLocale;
  returnPath?: string;
}) {
  const labels = locale === "es" ? es : en;
  const href = withGalleryReturnPath(card.href, returnPath);

  return (
    <Link href={href} prefetch className={styles.card} aria-label={`${labels.types[card.objectType]}: ${card.title}`}>
      <div className={styles.media}>
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            width={720}
            height={720}
            sizes="(max-width: 700px) 90vw, (max-width: 1200px) 38vw, 28vw"
          />
        ) : <span className={styles.fallback}>{labels.brand}</span>}
      </div>
      <div className={styles.body}>
        {card.objectType !== "recipe" ? <span className={styles.type}>{labels.types[card.objectType]}</span> : null}
        <h2>{card.title}</h2>
        {card.description ? <p>{inlineMarkdownToText(card.description)}</p> : null}
        {card.timeMinutes !== null ? (
          <span className={styles.timeChip}>
            <Clock size={18} aria-hidden="true" />
            {card.timeMinutes} {labels.minutes}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
