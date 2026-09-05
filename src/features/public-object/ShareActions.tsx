"use client";

import { useState } from "react";
import styles from "./ShareActions.module.css";

export default function ShareActions({ title, path, locale }: { title: string; path: string; locale: "es" | "en" }) {
  const [status, setStatus] = useState<string | null>(null);
  const share = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else await navigator.clipboard.writeText(url);
      setStatus(locale === "es" ? "Enlace copiado" : "Link copied");
    } catch {
      setStatus(null);
    }
  };
  return <div className={styles.actions}><button type="button" onClick={share}>{locale === "es" ? "Compartir" : "Share"}</button><button type="button" onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}${path}`); setStatus(locale === "es" ? "Enlace copiado" : "Link copied"); }}>{locale === "es" ? "Copiar enlace" : "Copy link"}</button>{status ? <span role="status">{status}</span> : null}</div>;
}
