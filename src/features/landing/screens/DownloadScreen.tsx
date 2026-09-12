"use client";

import Image from "next/image";
import { useLocale } from "@/contexts/LanguageContext";
import { DownloadIcon } from "../components/LandingIcons";
import { landingLinks } from "../data/landing-assets";

export default function DownloadScreen() {
  const copy = useLocale().t.landing.download;

  return (
    <section className="lc-download" id="download" aria-labelledby="lc-download-title">
      <div className="lc-wrap lc-download-inner">
        <div className="lc-download-copy" data-lc-reveal>
          <h2 id="lc-download-title">{copy.title}<br /><em>{copy.accent}</em></h2>
          <p>{copy.description}</p>
        </div>
        <div className="lc-download-avatar" data-lc-reveal>
          <Image src="/images/cookpilot/thumbs_up.webp" alt={copy.avatarAlt} width={1280} height={1280} loading="lazy" decoding="async" />
        </div>
        <div className="lc-stores" data-lc-reveal>
          <a href={landingLinks.googlePlay} target="_blank" rel="noopener noreferrer">
            <Image src="/icons/stores/google-play.png" width={34} height={34} alt="" />
            <span><small>{copy.playOverline}</small>{copy.play}</span><DownloadIcon />
          </a>
          <a href={landingLinks.appGallery} target="_blank" rel="noopener noreferrer">
            <Image src="/icons/stores/app-gallery.png" width={34} height={34} alt="" />
            <span><small>{copy.huaweiOverline}</small>{copy.huawei}</span><DownloadIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
