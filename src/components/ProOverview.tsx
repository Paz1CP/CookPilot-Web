"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./ProOverview.module.css";
import { useLocale } from "@/contexts/LanguageContext";

export default function ProOverview() {
  const { t } = useLocale();

  return (
    <section className={styles.pro} id="pro">
      <div className={styles.inner}>
        <div className={styles.layout}>
          <div className={styles.textCol}>
            <h2 className={styles.title}>Cook<span className={styles.brandPilot}>Pilot</span> Pro</h2>
            <p className={styles.subtitle}>{t.pro.subtitle}</p>
            <p className={styles.supportLine}>{t.pro.support_line}</p>
            <Link href="/es/pro" className="cp-btn cp-btn--primary">{t.pro.cta_label}</Link>
          </div>
          <div className={styles.visualCol}>
            <Image
              src="/images/app/cookbilling.png"
              alt="CookPilot Pro"
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
