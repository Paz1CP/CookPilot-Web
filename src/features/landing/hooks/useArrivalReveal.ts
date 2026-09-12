"use client";

import { useEffect, type RefObject } from "react";

export function useArrivalReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!root.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lc-arrived");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    root.current.querySelectorAll("[data-lc-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [root]);
}
