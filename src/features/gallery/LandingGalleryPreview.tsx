import Image from "next/image";
import Link from "next/link";
import { getGalleryPage } from "@/lib/cookshare/gallery";
import styles from "./LandingGalleryPreview.module.css";

export default async function LandingGalleryPreview({ locale }: { locale: "es" | "en" }) {
  const page = await getGalleryPage({ locale, q: "", type: "recipes", cursor: null }, 6);
  return <section className={styles.section} aria-labelledby="landing-gallery-title"><div className={styles.shell}><div className={styles.heading}><div><p className="cp-eyebrow">CookShare</p><h2 id="landing-gallery-title">{locale === "es" ? "Cocina con comida real" : "Cook with real food"}</h2><p>{locale === "es" ? "Explora recetas que ya viven dentro de CookPilot." : "Explore recipes that already live inside CookPilot."}</p></div><Link href={locale === "es" ? "/es/gallery" : "/en/gallery"} className="cp-btn cp-btn--secondary">{locale === "es" ? "Ver galería" : "View gallery"}</Link></div>{page.items.length ? <div className={styles.grid}>{page.items.map((item) => <Link href={item.href} key={item.objectId} className={styles.card}>{item.imageUrl ? <Image src={item.imageUrl} alt={item.title} width={480} height={320} sizes="(max-width: 680px) 100vw, 33vw" /> : <div className={styles.fallback}>CookPilot</div>}<div><h3>{item.title}</h3>{item.timeMinutes ? <span>{item.timeMinutes} min</span> : null}</div></Link>)}</div> : <p>{locale === "es" ? "La galería estará disponible muy pronto." : "The gallery will be available soon."}</p>}</div></section>;
}
