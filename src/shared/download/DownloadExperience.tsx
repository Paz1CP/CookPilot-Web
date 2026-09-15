"use client";

import Image from "next/image";
import { type ButtonHTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";
import { CloseCircle } from "iconsax-reactjs";
import { useLocale } from "@/contexts/LanguageContext";
import { buildCookShareInstallLinks, canonicalCookShareUrl } from "./cookshare-install-links";
import styles from "./DownloadExperience.module.css";

const DOWNLOAD_EVENT = "cookpilot:download";
const APP_HANDOFF_STORAGE_KEY = "cookpilot:pending-app-handoff";
const APP_HANDOFF_MAX_AGE_MS = 10_000;

type DownloadEventDetail = { canonicalPath?: string };

export function openDownloadExperience(canonicalPath?: string) {
  window.dispatchEvent(
    new CustomEvent<DownloadEventDetail>(DOWNLOAD_EVENT, {
      detail: canonicalPath ? { canonicalPath } : undefined,
    }),
  );
}

type DownloadButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
  cookSharePath?: string;
};

function isAndroidBrowser() {
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

function buildCookPilotIntentUrl(canonicalUrl: string) {
  const url = new URL(canonicalUrl);
  const target = `${url.host}${url.pathname}${url.search}`;
  const fallback = encodeURIComponent(url.toString());

  return `intent://${target}#Intent;scheme=https;package=com.cookpilot.pe;S.browser_fallback_url=${fallback};end`;
}

function tryOpenCookPilot(cookSharePath: string) {
  const canonicalUrl = canonicalCookShareUrl(cookSharePath);
  if (!canonicalUrl || !isAndroidBrowser()) return false;

  try {
    sessionStorage.setItem(
      APP_HANDOFF_STORAGE_KEY,
      JSON.stringify({
        path: new URL(canonicalUrl).pathname,
        startedAt: Date.now(),
      }),
    );
  } catch {
    return false;
  }

  let wasHidden = false;
  const clearMarker = () => {
    try {
      sessionStorage.removeItem(APP_HANDOFF_STORAGE_KEY);
    } catch {
      // Storage may become unavailable while the browser changes context.
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.clearTimeout(cleanupTimer);
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      wasHidden = true;
    } else if (wasHidden) {
      clearMarker();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  const cleanupTimer = window.setTimeout(clearMarker, APP_HANDOFF_MAX_AGE_MS);

  // Keep the canonical HTTPS URL as the app payload while explicitly asking
  // Android to resolve CookPilot. Chrome follows browser_fallback_url when the
  // package is not installed, so the page can consume the marker above and
  // open the download dialog.
  window.location.assign(buildCookPilotIntentUrl(canonicalUrl));
  return true;
}

export function DownloadButton({ children, onClick, cookSharePath, ...props }: DownloadButtonProps) {
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (cookSharePath && tryOpenCookPilot(cookSharePath)) return;
        openDownloadExperience(cookSharePath);
      }}
    >
      {children}
    </button>
  );
}

export default function DownloadExperience() {
  const { t } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [canonicalPath, setCanonicalPath] = useState<string>();

  useEffect(() => {
    const open = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail as DownloadEventDetail | undefined : undefined;
      setCanonicalPath(detail?.canonicalPath);
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) dialog.showModal();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dialogRef.current?.open) {
        event.preventDefault();
        dialogRef.current.close();
      }
    };

    window.addEventListener(DOWNLOAD_EVENT, open);
    window.addEventListener("keydown", closeOnEscape);

    try {
      const raw = sessionStorage.getItem(APP_HANDOFF_STORAGE_KEY);
      if (raw) {
        const pending = JSON.parse(raw) as { path?: unknown; startedAt?: unknown };
        const path = typeof pending.path === "string" ? pending.path : undefined;
        const startedAt = typeof pending.startedAt === "number" ? pending.startedAt : 0;
        const isFresh = startedAt > 0 && Date.now() - startedAt <= APP_HANDOFF_MAX_AGE_MS;
        const isCurrentPage = path === window.location.pathname;
        if (path && isFresh && isCurrentPage && canonicalCookShareUrl(path)) {
          sessionStorage.removeItem(APP_HANDOFF_STORAGE_KEY);
          setCanonicalPath(path);
          const dialog = dialogRef.current;
          if (dialog && !dialog.open) dialog.showModal();
        } else if (!isFresh) {
          sessionStorage.removeItem(APP_HANDOFF_STORAGE_KEY);
        }
      }
    } catch {
      // Storage may be unavailable in a restricted browser context.
    }

    return () => {
      window.removeEventListener(DOWNLOAD_EVENT, open);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const installLinks = buildCookShareInstallLinks(canonicalPath);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="download-dialog-title"
      aria-describedby="download-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className={styles.panel}>
        <button
          type="button"
          className={styles.close}
          onClick={() => dialogRef.current?.close()}
          aria-label={t.download_experience.close}
        >
          <CloseCircle size={28} aria-hidden="true" />
        </button>

        <div className={styles.brand} aria-hidden="true">
          <Image src="/images/cookpilot/cookpilot_logo.png" alt="" width={128} height={128} />
        </div>
        <h2 id="download-dialog-title">{t.download_experience.title}</h2>
        <p id="download-dialog-description" className={styles.description}>
          {t.download_experience.description}
        </p>

        <div className={styles.stores}>
          <a href={installLinks.googlePlay} target="_blank" rel="noreferrer">
            <Image src="/icons/stores/google-play.png" alt="" width={48} height={48} />
            <span>
              <small>{t.download_experience.available_on}</small>
              <strong>Google Play</strong>
            </span>
          </a>
          <a href={installLinks.appGallery} target="_blank" rel="noreferrer">
            <Image src="/icons/stores/app-gallery.png" alt="" width={48} height={48} />
            <span>
              <small>{t.download_experience.available_on}</small>
              <strong>AppGallery</strong>
            </span>
          </a>
        </div>

      
      </div>
    </dialog>
  );
}
