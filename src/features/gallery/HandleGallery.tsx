import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { AppLocale } from "@/shared/config/routes";
import { getHandleGallery } from "@/lib/cookshare/gallery";
import { getRequestUser } from "@/lib/supabase/server";
import styles from "./HandleGallery.module.css";

export default async function HandleGallery({ handle, locale }: { handle: string; locale: AppLocale }) {
  const { user } = await getRequestUser();
  const result = await getHandleGallery(handle, locale, user?.id ?? null);
  if (!result.ownerId) notFound();
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <p className="cp-eyebrow">CookShare</p>
        <h1>@{handle.replace(/^@/, "")}</h1>
        <p className={styles.lead}>{locale === "es" ? "Recetas y colecciones compartidas desde CookPilot." : "Recipes and collections shared from CookPilot."}</p>
        {result.cards.length ? <div className={styles.grid}>{result.cards.map((card) => <Link href={card.href} key={`${card.objectType}-${card.objectId}`} className={styles.card}>{card.imageUrl ? <Image src={card.imageUrl} alt="" width={480} height={320} sizes="(max-width: 680px) 100vw, 33vw" /> : <div className={styles.fallback} aria-hidden="true">CookPilot</div>}<div className={styles.cardBody}><span className={styles.type}>{card.objectType}</span><h2>{card.title}</h2>{card.isPrivate ? <span className={styles.private}>{locale === "es" ? "Privado" : "Private"}</span> : null}</div></Link>)}</div> : <p className={styles.empty}>{locale === "es" ? "Todavía no hay objetos compartidos aquí." : "There are no shared objects here yet."}</p>}
      </div>
    </main>
  );
}
