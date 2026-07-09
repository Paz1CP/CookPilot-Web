"use client";

import Image from "next/image";
import styles from "./Summary.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function Summary() {
  const { t } = useLocale();

  return (
    <section className={styles.summary} id="summary">
      <div className={styles.inner}>
        <div className={styles.row}>
          <div className={styles.textCol}>
            <h2 className={styles.title}>{t.summary.title}</h2>
            <p className={styles.body}>{t.summary.new_body}</p>
            <p className={styles.note}>{t.summary.new_note}</p>
          </div>

          <div className={styles.imageCol}>
            <Image
              src="/images/cookpilot/ckp_crossed_arms.png"
              alt={t.summary.title}
              width={480}
              height={960}
              priority={false}
              className={styles.visual}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
