"use client";

import Image from "next/image";
import { useState } from "react";
import { absoluteUrl } from "@/shared/config/site";
import { DownloadButton } from "@/shared/download/DownloadExperience";
import styles from "./ShareActions.module.css";

type Locale = "es" | "en";

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

export default function ShareActions({
  title,
  path,
  locale,
}: {
  title: string;
  path: string;
  locale: Locale;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const url = absoluteUrl(path);
  const labels = locale === "es"
    ? {
      share: "Compartir",
      copy: "Copiar enlace",
      whatsapp: "WhatsApp",
      qr: "Mostrar QR",
      close: "Cerrar",
      open: "Abrir en CookPilot",
      copied: "Enlace copiado",
      shared: "Listo para compartir",
      failed: "No pudimos completar la acción.",
      qrFailed: "No pudimos generar el QR.",
      qrHint: "Escanea para abrir esta página en CookPilot.",
    }
    : {
      share: "Share",
      copy: "Copy link",
      whatsapp: "WhatsApp",
      qr: "Show QR",
      close: "Close",
      open: "Open in CookPilot",
      copied: "Link copied",
      shared: "Ready to share",
      failed: "We could not complete that action.",
      qrFailed: "We could not generate the QR code.",
      qrHint: "Scan to open this page in CookPilot.",
    };

  const share = async () => {
    setBusy(true);
    setStatus(null);
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setStatus(labels.shared);
      } else {
        await copyText(url);
        setStatus(labels.copied);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus(null);
      } else {
        setStatus(labels.failed);
      }
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await copyText(url);
      setStatus(labels.copied);
    } catch {
      setStatus(labels.failed);
    } finally {
      setBusy(false);
    }
  };

  const showQr = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const { default: QRCode } = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#080000", light: "#FEFEF5" },
      });
      setQrDataUrl(dataUrl);
      setQrOpen(true);
    } catch {
      setStatus(labels.qrFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={styles.actions} aria-label={locale === "es" ? "Acciones de compartir" : "Sharing actions"}>
        <button type="button" className="cp-btn cp-btn--primary" onClick={share} disabled={busy}>
          {labels.share}
        </button>
        <button type="button" className="cp-btn cp-btn--ghost" onClick={copy} disabled={busy}>
          {labels.copy}
        </button>
        <a
          className={styles.actionLink}
          href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          {labels.whatsapp}
        </a>
        <button type="button" className={styles.actionLink} onClick={showQr} disabled={busy}>
          {labels.qr}
        </button>
        <DownloadButton className={styles.actionLink} cookSharePath={path}>
          {labels.open}
        </DownloadButton>
        {status ? <span className={styles.status} role="status">{status}</span> : null}
      </div>
      {qrOpen && qrDataUrl ? (
        <div className={styles.backdrop} role="presentation" onMouseDown={() => setQrOpen(false)}>
          <section
            className={styles.qrDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookshare-qr-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className={styles.close} onClick={() => setQrOpen(false)} aria-label={labels.close}>×</button>
            <p className="cp-eyebrow">CookShare</p>
            <h2 id="cookshare-qr-title">{labels.qr}</h2>
            <Image src={qrDataUrl} alt={labels.qrHint} width={280} height={280} unoptimized className={styles.qr} />
            <p>{labels.qrHint}</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
