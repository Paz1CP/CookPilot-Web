"use client";

import { useLocale } from "@/contexts/LanguageContext";
import HeroAtmosphere from "../components/HeroAtmosphere";
import { ArrowUpRight, DownloadIcon } from "../components/LandingIcons";
import { landingLinks } from "../data/landing-assets";

export default function BrandFooter() {
  const copy = useLocale().t.landing.footer;

  return (
    <footer className="lc-footer">
      <HeroAtmosphere variant="footer" />
      <div className="lc-wordmark-stage">
        <div className="lc-wordmark" aria-label={copy.brandAria}>
          <span className="lc-wordmark-cook" aria-hidden="true">{copy.brandCook}</span><span className="lc-wordmark-pilot" aria-hidden="true">{copy.brandPilot}</span>
        </div>
      </div>
      <div className="lc-footer-content lc-wrap">
        <div className="lc-footer-close">
          <p>{copy.tagline}<br /><span>{copy.taglineAccent}</span></p>
          <a className="lc-footer-download" href="#download">{copy.download} <DownloadIcon /></a>
        </div>
        <div className="lc-footer-middle">
          <nav aria-label={copy.navAria}>
            <a href={landingLinks.product}>{copy.product}</a>
            <a href={landingLinks.guides}>{copy.guides}</a>
            <a href={landingLinks.privacy}>{copy.privacy}</a>
            <a href={landingLinks.linkedin}>{copy.linkedin} <ArrowUpRight /></a>
          </nav>
        </div>
        <div className="lc-footer-bottom">
          <span>{copy.origin}</span>
          <span>© {new Date().getFullYear()} {copy.brandAria}</span>
          <a className="lc-footer-top" href="#top">{copy.back} <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  );
}
