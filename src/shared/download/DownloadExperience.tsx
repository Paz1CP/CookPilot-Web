"use client";

import Image from "next/image";
import { type ButtonHTMLAttributes, type ReactNode, useEffect, useRef } from "react";
import { CloseCircle } from "iconsax-reactjs";
import { useLocale } from "@/contexts/LanguageContext";
import { siteConfig } from "@/shared/config/site";
import styles from "./DownloadExperience.module.css";

const DOWNLOAD_EVENT = "cookpilot:download";

export function openDownloadExperience() {
  window.dispatchEvent(new Event(DOWNLOAD_EVENT));
}

type DownloadButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
};

export function DownloadButton({ children, onClick, ...props }: DownloadButtonProps) {
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openDownloadExperience();
      }}
    >
      {children}
    </button>
  );
}

export default function DownloadExperience() {
  const { t } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const open = () => {
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
    return () => {
      window.removeEventListener(DOWNLOAD_EVENT, open);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

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
          <Image src="/images/img_app_icon.png" alt="" width={128} height={128} />
        </div>
        <h2 id="download-dialog-title">{t.download_experience.title}</h2>
        <p id="download-dialog-description" className={styles.description}>
          {t.download_experience.description}
        </p>

        <div className={styles.stores}>
          <a href={siteConfig.publicData.stores.googlePlay} target="_blank" rel="noreferrer">
            <Image src="/icons/play-store.png" alt="" width={48} height={48} />
            <span>
              <small>{t.download_experience.available_on}</small>
              <strong>Google Play</strong>
            </span>
          </a>
          <a href={siteConfig.publicData.stores.appGallery} target="_blank" rel="noreferrer">
            <Image src="/icons/huawei-gallery.png" alt="" width={48} height={48} />
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
