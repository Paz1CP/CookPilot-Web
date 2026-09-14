"use client";

import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";

function validGalleryReturn(value: string | null, locale: "es" | "en", fallback: string) {
  if (!value) return fallback;
  try {
    const candidate = new URL(value, window.location.origin);
    const expectedPath = `/${locale}/gallery`;
    if (candidate.origin !== window.location.origin || candidate.pathname !== expectedPath) return fallback;
    return `${candidate.pathname}${candidate.search}`;
  } catch {
    return fallback;
  }
}

export default function GalleryReturnLink({
  href,
  label,
  locale,
}: {
  href: string;
  label: string;
  locale: "es" | "en";
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const returnHref = validGalleryReturn(new URLSearchParams(window.location.search).get("gallery_return"), locale, href);
    linkRef.current?.setAttribute("href", returnHref);
  }, [href, locale]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const returnHref = validGalleryReturn(new URLSearchParams(window.location.search).get("gallery_return"), locale, href);
    if (returnHref === href) return;
    event.preventDefault();
    window.location.assign(returnHref);
  }

  return <Link ref={linkRef} href={href} onClick={handleClick}>{label}</Link>;
}
