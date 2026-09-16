"use client";

import Image from "next/image";
import type { CookShareResolvedObject } from "@/lib/cookshare/types";
import { DownloadButton } from "@/shared/download/DownloadExperience";
import siteEn from "@/locales/en.json";
import siteEs from "@/locales/es.json";
import styles from "./CookSharePreviewInsights.module.css";

type InsightKey = "cost" | "time" | "nutrition";

const insights: { key: InsightKey; image: string }[] = [
  { key: "cost", image: "/icons/actions/buying_1.webp" },
  { key: "time", image: "/icons/actions/time.webp", },
  { key: "nutrition", image: "/icons/actions/nutrition.png" },
];

export default function CookSharePreviewInsights({
  objectType,
  path,
  locale,
}: {
  objectType: CookShareResolvedObject["object_type"];
  path: string;
  locale: "es" | "en";
}) {
  const copy = (locale === "es" ? siteEs : siteEn).cookshare_preview_insights;
  const visible = objectType === "recipe" ? insights.filter((insight) => insight.key !== "time") : insights;

  return (
    <div className={objectType === "recipe" ? styles.recipeChips : styles.grid} aria-label={copy.group_label}>
      {visible.map(({ key, image }) => {
        const item = copy[key];
        return (
          <DownloadButton
            key={key}
            className={objectType === "recipe" ? styles.chip : styles.card}
            data-insight={key}
            cookSharePath={path}
            downloadContext={{ title: item.modal_title, description: item.modal_description }}
            aria-label={`${item.label}. ${copy.open_hint}`}
          >
            {objectType !== "recipe" ? (
              <Image
                src={image}
                alt=""
                width={256}
                height={256}
                sizes="(max-width: 800px) 132px, 244px"
                quality={100}
                unoptimized
                className={styles.icon}
              />
            ) : null}
            <span className={styles.cardCopy}>
              <strong>{item.label}</strong>
              <span className={styles.blurred} aria-hidden="true">{objectType === "recipe" ? item.recipe_preview : item.card_preview}</span>
            </span>
          </DownloadButton>
        );
      })}
    </div>
  );
}
