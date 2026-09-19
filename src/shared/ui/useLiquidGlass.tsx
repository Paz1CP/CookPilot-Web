"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";

type Lens = { width: number; height: number; map: string };

function displacementMap(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return "";

  const image = context.createImageData(width, height);
  const radius = height / 2;
  const rim = radius;
  const distance = (x: number, y: number) => {
    const qx = Math.abs(x - width / 2) - (width / 2 - radius);
    const qy = Math.abs(y - height / 2) - (height / 2 - radius);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const depth = Math.max(0, -distance(x + 0.5, y + 0.5));
      const edge = Math.pow(Math.max(0, 1 - depth / rim), 2);
      const dx = distance(x + 1.5, y + 0.5) - distance(x - 0.5, y + 0.5);
      const dy = distance(x + 0.5, y + 1.5) - distance(x + 0.5, y - 0.5);
      const length = Math.hypot(dx, dy) || 1;
      const index = (y * width + x) * 4;

      image.data[index] = Math.round(128 + (dx / length) * edge * 108);
      image.data[index + 1] = Math.round(128 + (dy / length) * edge * 108);
      image.data[index + 2] = 128;
      image.data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

/** Refraction map for the live backdrop of a rounded floating navigation surface. */
export function useLiquidGlass<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);
  const id = `cp-liquid-${useId().replace(/:/g, "")}`;
  const [lens, setLens] = useState<Lens | null>(null);

  useEffect(() => {
    if (!element) return;

    let lastSize = "";
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(1, Math.round(entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width));
      const height = Math.max(1, Math.round(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height));
      const size = `${width}x${height}`;
      if (size === lastSize) return;
      lastSize = size;
      const map = displacementMap(width, height);
      if (map) setLens({ width, height, map });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  const filterValue = lens ? `blur(2px) url(#${id})` : "blur(2px)";
  const style: CSSProperties = {
    backdropFilter: filterValue,
    WebkitBackdropFilter: filterValue,
  };

  const filter = lens && typeof document !== "undefined" ? createPortal(
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute", pointerEvents: "none" }}>
      <defs>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage href={lens.map} x="0" y="0" width={lens.width} height={lens.height} preserveAspectRatio="none" result="lens-map" />
          <feDisplacementMap in="SourceGraphic" in2="lens-map" scale="-72" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>,
    document.body,
  ) : null;

  return { targetRef: ref, style, filter };
}
