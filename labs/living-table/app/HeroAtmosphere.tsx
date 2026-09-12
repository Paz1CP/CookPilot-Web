"use client";

import { useLayoutEffect, useRef } from "react";

const NAZCA = "/images/backgrounds/ckp_hero_bg.webp";
const points = Array.from({ length: 620 }, (_, i) => {
  const random = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  return { x: random(i + 1), y: random(i + 743), radius: .45 + random(i + 91) * .65, gain: .25 + random(i + 190) * .75 };
});

export default function HeroAtmosphere({ variant = "hero" }: { variant?: "hero" | "footer" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const atmosphereRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const atmosphere = atmosphereRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const texture = document.createElement("canvas");
    const textureCtx = texture.getContext("2d")!;
    const light = document.createElement("canvas");
    const lightCtx = light.getContext("2d")!;
    const image = new Image();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    let width = innerWidth, height = innerHeight, dpr = 1;
    let frame = 0, lastFrame = 0, lastMove = -10000, speed = 0, energy = 0;
    let loaded = false, disposed = false;
    const pointer = { x: width * .2, y: height * .5 };
    const head = { ...pointer }, tail = { ...pointer };

    const isActive = () => variant === "footer" || scrollY < height * .9;
    const wake = () => {
      if (!frame && !disposed && !document.hidden && isActive()) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      const bounds = atmosphere.getBoundingClientRect();
      width = variant === "footer" ? bounds.width : innerWidth;
      height = variant === "footer" ? bounds.height : innerHeight;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      // Cache the large source at viewport resolution; never filter the 6K image per frame.
      texture.width = light.width = Math.round(width);
      texture.height = light.height = Math.round(height);
      if (loaded) {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
        textureCtx.filter = "sepia(1) saturate(1.6) brightness(.9)";
        textureCtx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
        textureCtx.filter = "none";
      }
      wake();
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || coarse.matches || !isActive()) return;
      const bounds = atmosphere.getBoundingClientRect();
      if (variant === "footer" && (event.clientY < bounds.top || event.clientY > bounds.bottom)) return;
      const x = variant === "footer" ? event.clientX - bounds.left : event.clientX;
      const y = variant === "footer" ? event.clientY - bounds.top : event.clientY;
      const now = performance.now();
      const dt = Math.max(8, now - lastMove);
      speed = Math.min(1, Math.hypot(x - pointer.x, y - pointer.y) / dt / 2);
      if (now - lastMove > 1800) { head.x = tail.x = x; head.y = tail.y = y; }
      pointer.x = x; pointer.y = y;
      lastMove = now;
      wake();
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) { lastMove = -10000; wake(); } };
    const protection = (x: number, y: number) => {
      const ellipse = (cx: number, cy: number, rx: number, ry: number) => Math.exp(-2 * (((x / width - cx) / rx) ** 2 + ((y / height - cy) / ry) ** 2));
      return Math.max(.22, 1 - .72 * ellipse(.5, .28, .45, .19) - .38 * ellipse(.5, .8, .35, .3) - .3 * ellipse(.86, .89, .2, .12));
    };
    function draw(now: number) {
      frame = 0;
      if (disposed || document.hidden || !isActive()) return;
      const dt = Math.min(.05, (now - lastFrame) / 1000 || .016);
      lastFrame = now;
      const staticMode = reduced.matches || coarse.matches;
      const targetEnergy = staticMode ? .075 : Math.exp(-Math.max(0, now - lastMove - 150) / 580);
      energy += (targetEnergy - energy) * (1 - Math.exp(-dt / .09));
      const follow = 1 - Math.exp(-dt / .075), trailFollow = 1 - Math.exp(-dt / .19);
      head.x += (pointer.x - head.x) * follow; head.y += (pointer.y - head.y) * follow;
      tail.x += (head.x - tail.x) * trailFollow; tail.y += (head.y - tail.y) * trailFollow;
      speed *= Math.exp(-dt / .3);
      const radius = Math.min(550, Math.max(280, width * .27));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      if (loaded && energy > .002) {
        // The actual Nazca bitmap and the points share this same light field.
        lightCtx.clearRect(0, 0, width, height);
        lightCtx.globalCompositeOperation = "source-over";
        for (const [p, strength, spread] of [[head, .64, 1], [tail, .19, .85]] as const) {
          const gradient = lightCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * spread);
          gradient.addColorStop(0, `rgba(255,255,255,${energy * strength})`);
          gradient.addColorStop(.3, `rgba(255,255,255,${energy * strength * .74})`);
          gradient.addColorStop(.65, `rgba(255,255,255,${energy * strength * .23})`);
          gradient.addColorStop(1, "rgba(255,255,255,0)");
          lightCtx.fillStyle = gradient; lightCtx.fillRect(0, 0, width, height);
        }
        lightCtx.globalCompositeOperation = "source-in";
        lightCtx.drawImage(texture, 0, 0);
        lightCtx.globalCompositeOperation = "source-over";
        ctx!.drawImage(light, 0, 0);
      }
      for (const point of points) {
        const x = point.x * width, y = point.y * height;
        const field = Math.exp(-3 * (Math.hypot(x - head.x, y - head.y) / radius) ** 2);
        const memory = Math.exp(-4 * (Math.hypot(x - tail.x, y - tail.y) / radius) ** 2);
        const strength = energy * (field + memory * .18) * point.gain * protection(x, y);
        if (strength < .012) continue;
        const green = Math.min(.22, speed * .25) * (1 - field);
        const pink = speed > .7 && point.gain > .88 ? memory * .14 : 0;
        const r = Math.round(233 - 110 * green - 7 * pink), g = Math.round(168 + 20 * green - 98 * pink), b = Math.round(14 - 3 * green + 130 * pink);
        ctx!.fillStyle = `rgba(${r},${g},${b},${Math.min(.52, strength * .55)})`;
        ctx!.beginPath(); ctx!.arc(x, y, point.radius * (1 + strength * .25), 0, Math.PI * 2); ctx!.fill();
      }
      if (!staticMode && (energy > .002 || now - lastMove < 1800)) wake();
    }
    image.onload = () => { if (!disposed) { loaded = true; resize(); } };
    image.src = NAZCA;
    resize();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", wake, { passive: true });
    document.addEventListener("visibilitychange", wake);
    reduced.addEventListener("change", wake);
    return () => {
      disposed = true; cancelAnimationFrame(frame); image.onload = null;
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerout", leave);
      window.removeEventListener("resize", resize); window.removeEventListener("scroll", wake);
      document.removeEventListener("visibilitychange", wake); reduced.removeEventListener("change", wake);
    };
  }, [variant]);

  return <div className={`hero-atmosphere${variant === "footer" ? " footer-atmosphere" : ""}`} ref={atmosphereRef} aria-hidden="true">
    <img className="hero-nazca-idle" src={NAZCA} alt="" />
    <canvas ref={canvasRef} />
  </div>;
}
