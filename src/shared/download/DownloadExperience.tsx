"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { type ButtonHTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";
import { CloseCircle } from "iconsax-reactjs";
import { useLocale } from "@/contexts/LanguageContext";
import { buildCookShareInstallLinks } from "./cookshare-install-links";
import styles from "./DownloadExperience.module.css";
import editorialStyles from "./DownloadEditorial.module.css";
import { isEditorialRoute } from "@/shared/config/editorial-routes";

const DOWNLOAD_EVENT = "cookpilot:download";

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

export function DownloadButton({ children, onClick, cookSharePath, ...props }: DownloadButtonProps) {
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openDownloadExperience(cookSharePath);
      }}
    >
      {children}
    </button>
  );
}

export default function DownloadExperience() {
  const { t } = useLocale();
  const pathname = usePathname();
  const editorial = isEditorialRoute(pathname);
  const appearance = editorial ? editorialStyles : styles;
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
    return () => {
      window.removeEventListener(DOWNLOAD_EVENT, open);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const installLinks = buildCookShareInstallLinks(canonicalPath);

  return (
    <dialog
      ref={dialogRef}
      className={appearance.dialog}
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
      <div className={appearance.panel}>
        <button
          type="button"
          className={appearance.close}
          onClick={() => dialogRef.current?.close()}
          aria-label={t.download_experience.close}
        >
          <CloseCircle size={28} aria-hidden="true" />
        </button>

        <div className={appearance.brand} aria-hidden="true">
          <Image src={editorial ? "/images/cookpilot/thumbs_up.webp" : "/images/cookpilot/cookpilot_logo.png"} alt="" width={editorial ? 480 : 128} height={editorial ? 480 : 128} />
        </div>
        <h2 id="download-dialog-title">{t.download_experience.title}</h2>
        <p id="download-dialog-description" className={appearance.description}>
          {t.download_experience.description}
        </p>

        <div className={appearance.stores}>
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
