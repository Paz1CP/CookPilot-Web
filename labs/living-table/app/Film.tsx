"use client";

import { useEffect, useRef, useState } from "react";

const FILM = "/images/CookFilm/";
const FOOD = "/images/food_images/transparent_bg/";
const LOMO = `${FOOD}lomo_saltado.png`;
const EMPTY = `${FILM}lomo_plate_empty.webp`;

const heroDishes = [
  { file: "lomo_saltado", name: "Lomo saltado", line: "THE START OF SOMETHING GOOD" },
  { file: "ceviche", name: "Ceviche", line: "A LITTLE BRIGHTER. A LITTLE BOLDER." },
  { file: "papa_a_la_huancaina", name: "Papa a la huancaína", line: "GOLDEN, CREAMY. COMPLETELY YOURS." },
  { file: "aji_de_gallina", name: "Ají de gallina", line: "THE KIND OF COMFORT YOU COME BACK TO." },
  { file: "ensalada_de_palta", name: "Ensalada de palta", line: "FRESH HAS A WAY OF WINNING YOU OVER." },
];

const tickets = [
  { label: "FOR TWO", x: -35, y: -26, r: -8 },
  { label: "MORE PROTEIN", x: 37, y: -31, r: 7 },
  { label: "LESS RICE", x: -40, y: 18, r: 5 },
  { label: "30 MIN MAX", x: 39, y: 24, r: -6 },
  { label: "KEEP THE FRIES", x: -8, y: 37, r: 3, gold: true },
];

const ingredients = [
  { file: "beef_cubes.png", name: "Beef", x: -27, y: -39, r: 10 },
  { file: "potato_sticks.png", name: "Potatoes", x: 28, y: -39, r: -7 },
  { file: "red_onion_wedges.png", name: "Red onion", x: -45, y: -5, r: 6 },
  { file: "tomato_wedges.png", name: "Tomatoes", x: 45, y: -2, r: -10 },
  { file: "yellow_pepper_strips.png", name: "Yellow pepper", x: -30, y: 38, r: -5 },
  { file: "cilantro_chopped.png", name: "Cilantro", x: 31, y: 39, r: 8 },
];

const listItems = [
  ["Beef", "300 g"], ["Red onion", "2"], ["Tomatoes", "2"],
  ["Yellow pepper", "1"], ["Potatoes", "300 g"], ["Rice", "150 g"],
];

const steps = ["Adjust", "Shop", "Cook", "Plan", "Serve"];
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => { const n = clamp(value); return n * n * (3 - 2 * n); };
const phase = (value: number, start: number, end: number) => smooth((value - start) / (end - start));
const scene = (value: number, enterStart: number, enterEnd: number, exitStart: number, exitEnd: number) =>
  phase(value, enterStart, enterEnd) * (1 - phase(value, exitStart, exitEnd));

function FilmHeadline({ className, children }: { className: string; children: React.ReactNode }) {
  return <h2 className={`film-headline ${className}`}>{children}</h2>;
}

function KitchenTicket({ label, gold }: { label: string; gold?: boolean }) {
  return (
    <div className={`kitchen-ticket${gold ? " ticket-gold" : ""}`}>
      <span className="ticket-rule" /><small>KITCHEN NOTE</small><strong>{label}</strong>
      <span className="ticket-dots">••••••••••••••••</span>
    </div>
  );
}

function CookList() {
  return (
    <div className="cooklist-surface" aria-label="CookList for Lomo Saltado">
      <div className="list-top"><span className="mini-brand">Cook<span>Pilot</span></span><span className="list-mode">BY RECIPE</span></div>
      <div className="list-recipe">
        <img src={LOMO} alt="" />
        <div><small>YOUR RECIPE</small><strong>Lomo Saltado</strong></div><span>2 PEOPLE</span>
      </div>
      <div className="list-rows">
        {listItems.map(([name, amount], index) => (
          <div className="list-row" key={name} data-list-row>
            <span className="list-check">✓</span><strong>{name}</strong><em>{amount}</em><small>0{index + 1}</small>
          </div>
        ))}
      </div>
      <div className="list-ready"><span>6 / 6</span><strong>READY TO SHOP</strong></div>
    </div>
  );
}

function CookMode() {
  return (
    <div className="cookmode-space" aria-label="CookMode for Lomo Saltado">
      <div className="cookmode-halo" />
      <div className="mode-top mode-layer" data-depth="back">
        <div><small>LOMO SALTADO</small><strong>Mise en place</strong></div><span className="mode-time">35 <small>MIN</small></span>
      </div>
      <div className="mode-steps mode-layer" data-depth="front">
        <span className="done">✓</span><span className="active">1</span><span>2</span><span>3</span><span>4</span>
      </div>
      <div className="mode-instruction mode-layer" data-depth="mid">
        <span className="instruction-index">01</span>
        <p>Cut the beef into thick strips. Keep the onion, tomato and yellow pepper ready.</p>
        <img src={LOMO} alt="Lomo Saltado cooking reference" />
      </div>
      <div className="mode-progress mode-layer" data-depth="front"><i /><span>MISE EN PLACE</span></div>
      <div className="mode-phone" aria-hidden="true"><img src={`${FILM}lomo_cookmode.jpg`} alt="" /></div>
    </div>
  );
}

function CookPlan() {
  return (
    <div className="plan-surface" aria-label="Lomo Saltado inside a weekly CookPlan">
      <div className="plan-top"><span className="mini-brand">Cook<span>Pilot</span></span><small>YOUR WEEK</small></div>
      <div className="plan-days">
        {["WED 15", "THU 16", "FRI 17", "SAT 18", "SUN 19"].map((day) => (
          <span className={day.startsWith("SAT") ? "selected" : ""} key={day}>{day.split(" ")[0]}<strong>{day.split(" ")[1]}</strong></span>
        ))}
      </div>
      <div className="plan-moment"><span>☀</span><strong>LUNCH</strong><small>SATURDAY · 18</small></div>
      <div className="plan-meal">
        <div className="plan-photo"><img src={LOMO} alt="Lomo Saltado planned for Saturday lunch" /></div>
        <div className="plan-meal-copy"><small>MAIN · 35 MIN</small><strong>Lomo Saltado</strong><span>WITH PALTA SALAD + MARACUYÁ</span></div>
        <button type="button" tabIndex={-1}>COOK <span>↗</span></button>
      </div>
      <div className="plan-foot"><span>1 MEAL</span><i /><span>RIGHT ON TIME</span></div>
    </div>
  );
}

export default function Film() {
  const root = useRef<HTMLDivElement>(null);
  const sharedPlate = useRef<HTMLDivElement>(null);
  const sharedImage = useRef<HTMLImageElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [heroDish, setHeroDish] = useState(0);
  const heroDishRef = useRef(0);
  const hasEnteredFilm = useRef(false);

  useEffect(() => {
    heroDishRef.current = heroDish;
    if (!hasEnteredFilm.current && sharedImage.current) {
      sharedImage.current.src = `${FOOD}${heroDishes[heroDish].file}.png`;
      sharedImage.current.alt = heroDishes[heroDish].name;
    }
  }, [heroDish]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!hasEnteredFilm.current && window.scrollY < 8) setHeroDish((value) => (value + 1) % heroDishes.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const preload = [EMPTY, LOMO, `${FILM}lomo_table_final.png`, `${FILM}lomo_cookmode.jpg`, `${FILM}lomo_cookplan.png`, ...ingredients.map((item) => `${FILM}${item.file}`)];
    preload.forEach((src) => { const image = new Image(); image.src = src; });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let currentAsset = "";

    const setAsset = (src: string, alt: string) => {
      if (currentAsset === src || !sharedImage.current) return;
      currentAsset = src; sharedImage.current.src = src; sharedImage.current.alt = alt;
    };

    const render = () => {
      frame = 0;
      const host = root.current;
      const plate = sharedPlate.current;
      const filmStage = stage.current;
      if (!host || !plate || !filmStage) return;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const localY = -host.getBoundingClientRect().top;
      const filmRange = Math.max(vh, host.offsetHeight - vh * 1.72);
      const progress = clamp((localY - vh * 0.72) / filmRange);
      const handoff = phase(localY / vh, 0.42, 1.02);
      const filmEntered = localY > 8;
      hasEnteredFilm.current = filmEntered;
      if (filmEntered && heroDishRef.current !== 0) setHeroDish(0);
      host.style.setProperty("--hero-exit", String(phase(localY / vh, 0.04, 0.92)));
      host.style.setProperty("--film-p", progress.toFixed(5));
      filmStage.style.visibility = localY > vh * 0.5 ? "visible" : "hidden";

      const heroSize = Math.min(vw * 0.76, vh * 1.1);
      const centerSize = Math.min(vw * (vw < 700 ? 0.88 : 0.46), vh * (vw < 700 ? 0.53 : 0.66));
      const returnSize = Math.min(vw * (vw < 700 ? 1.18 : 0.68), vh * 0.96);
      const heroTop = vh * (vw < 700 ? 0.49 : 0.51);
      let size = heroSize + (centerSize - heroSize) * handoff;
      let centerX = vw * 0.5;
      let centerY = heroTop + heroSize * 0.5 + (vh * 0.5 - (heroTop + heroSize * 0.5)) * handoff;
      let plateOpacity = 1;
      const handoffDip = 1 - Math.pow(Math.abs(handoff * 2 - 1), 0.72);
      plateOpacity = 1 - handoffDip * 0.97;

      if (handoff < 0.53) setAsset(LOMO, "Lomo Saltado"); else setAsset(EMPTY, "An empty plate ready for Lomo Saltado");
      if (handoff > 0.98) {
        plateOpacity = 1 - phase(progress, 0.225, 0.285);
        size = centerSize * (1 - phase(progress, 0.22, 0.29) * 0.54);
      }

      const returnIn = phase(progress, 0.625, 0.675);
      const returnOut = phase(progress, 0.755, 0.80);
      if (progress > 0.60) setAsset(LOMO, "Lomo Saltado");
      if (returnIn > 0 && returnOut < 1) {
        size = centerSize * 0.3 + (returnSize - centerSize * 0.3) * returnIn;
        centerX = vw * (vw < 700 ? 0.5 : 0.56); centerY = vh * 0.54;
        plateOpacity = returnIn * (1 - returnOut);
      }
      if (progress >= 0.80) plateOpacity = 0;
      if (reduced) plateOpacity = progress < 0.28 || (progress > 0.63 && progress < 0.79) ? 1 : 0;
      plate.style.width = `${size}px`; plate.style.height = `${size}px`;
      plate.style.left = `${centerX - size / 2}px`; plate.style.top = `${centerY - size / 2}px`;
      plate.style.opacity = String(clamp(plateOpacity));
      plate.style.transform = `rotate(${handoff * 5 - returnIn * 2}deg) scale(${1 + Math.sin(progress * Math.PI) * 0.012})`;
      plate.dataset.film = filmEntered ? "true" : "false";

      const layerOpacity = (selector: string, opacity: number) => {
        const element = host.querySelector<HTMLElement>(selector);
        if (element) { element.style.opacity = String(clamp(opacity)); element.style.pointerEvents = opacity > 0.5 ? "auto" : "none"; }
      };
      const openingOpacity = scene(progress, -0.01, 0.035, 0.11, 0.15);
      const vacuumOpacity = scene(progress, 0.095, 0.13, 0.25, 0.292);
      const listOpacity = scene(progress, 0.27, 0.305, 0.415, 0.455);
      const modeOpacity = scene(progress, 0.425, 0.462, 0.625, 0.67);
      const returnOpacity = scene(progress, 0.635, 0.675, 0.735, 0.78);
      const planOpacity = scene(progress, 0.745, 0.775, 0.86, 0.91);
      const finalOpacity = phase(progress, 0.875, 0.935);
      layerOpacity(".opening-scene", openingOpacity); layerOpacity(".vacuum-scene", vacuumOpacity);
      layerOpacity(".cooklist-scene", listOpacity); layerOpacity(".cookmode-scene", modeOpacity);
      layerOpacity(".return-scene", returnOpacity); layerOpacity(".plan-scene", planOpacity); layerOpacity(".final-scene", finalOpacity);

      const openingReveal = phase(progress, -0.005, 0.085);
      host.style.setProperty("--opening-clip", `${(1 - openingReveal) * 104}%`);
      host.style.setProperty("--opening-glow", String(Math.sin(openingReveal * Math.PI)));
      const vacuumOpacityNow = vacuumOpacity;
      host.style.setProperty("--spark", String(scene(progress, 0.205, 0.25, 0.268, 0.29)));
      host.querySelectorAll<HTMLElement>("[data-vacuum]").forEach((element, index) => {
        const isTicket = index < tickets.length;
        const item = isTicket ? tickets[index] : ingredients[index - tickets.length];
        const offset = ((index % 4) - 1.5) * 0.012;
        const t = phase(progress, 0.13 + offset, 0.265 + offset);
        const x = (item.x / 100) * vw * (1 - t); const y = (item.y / 100) * vh * (1 - t);
        element.style.transform = `translate3d(${x}px, ${y}px, ${(1 - t) * ((index % 3) - 1) * 55}px) scale(${1 - t * 0.87}) rotate(${item.r * (1 - t)}deg)`;
        element.style.opacity = String(vacuumOpacityNow * (1 - phase(t, 0.72, 1)));
        element.style.filter = `blur(${Math.max(0, t - 0.72) * 15}px)`;
      });

      const listT = phase(progress, 0.275, 0.43);
      const listSurface = host.querySelector<HTMLElement>(".cooklist-surface");
      if (listSurface) listSurface.style.transform = `perspective(1500px) rotateY(${-8 + listT * 5}deg) rotateX(${4 - listT * 2}deg) translate3d(0, ${(1 - listT) * 65}px, 0) scale(${0.93 + listT * 0.07})`;
      host.querySelectorAll<HTMLElement>("[data-list-row]").forEach((row, index) => row.style.setProperty("--checked", String(phase(progress, 0.325 + index * 0.009, 0.365 + index * 0.009))));
      const line = phase(progress, 0.405, 0.462) * (1 - phase(progress, 0.49, 0.53));
      host.style.setProperty("--match-line", String(line));

      const modeT = phase(progress, 0.44, 0.625);
      host.querySelectorAll<HTMLElement>(".mode-layer").forEach((element) => {
        const depth = element.dataset.depth === "front" ? 130 : element.dataset.depth === "mid" ? 55 : -90;
        const settled = phase(modeT, 0.72, 1);
        element.style.transform = `translateZ(${depth * (1 - settled)}px) translateY(${(1 - modeT) * (depth > 0 ? 25 : -18)}px)`;
      });
      const modePhone = host.querySelector<HTMLElement>(".mode-phone");
      if (modePhone) modePhone.style.opacity = String(phase(progress, 0.595, 0.637));
      const activeStep = progress < 0.535 ? 1 : 2;
      host.querySelectorAll<HTMLElement>(".mode-steps span").forEach((element, index) => element.classList.toggle("active", index === activeStep));

      const planT = phase(progress, 0.75, 0.875);
      const plan = host.querySelector<HTMLElement>(".plan-surface");
      if (plan) plan.style.transform = `perspective(1700px) rotateX(${7 - planT * 4}deg) rotateY(${vw < 700 ? 0 : -7 + planT * 3}deg) translateY(${(1 - planT) * 45}px) scale(${0.92 + planT * 0.08})`;
      const final = host.querySelector<HTMLElement>(".final-photo");
      if (final) final.style.transform = `scale(${1.11 - finalOpacity * 0.11}) translateX(${(1 - finalOpacity) * 2.5}%)`;
      host.style.setProperty("--final-clip", `${(1 - finalOpacity) * 100}%`);
      const active = progress < 0.27 ? 0 : progress < 0.44 ? 1 : progress < 0.72 ? 2 : progress < 0.88 ? 3 : 4;
      host.querySelectorAll<HTMLElement>(".film-rail li").forEach((item, index) => item.classList.toggle("active", index === active));
      host.querySelector<HTMLElement>(".film-rail")?.style.setProperty("opacity", String(phase(progress, 0.015, 0.07) * (1 - phase(progress, 0.95, 0.99))));
    };

    const requestRender = () => { if (!frame) frame = requestAnimationFrame(render); };
    render(); window.addEventListener("scroll", requestRender, { passive: true }); window.addEventListener("resize", requestRender);
    return () => { window.removeEventListener("scroll", requestRender); window.removeEventListener("resize", requestRender); cancelAnimationFrame(frame); };
  }, []);

  const dish = heroDishes[heroDish];
  return (
    <div className="film-experience" id="film" ref={root}>
      <section className="film-hero" id="top" aria-label="Cook what you want. Your way.">
        <div className="hero-title"><p>GOOD FOOD. REAL LIFE.</p><h1><span>COOK WHAT YOU <em>WANT.</em></span><strong>YOUR <em>WAY.</em></strong></h1></div>
        <div className="hero-caption" key={heroDish}><span>{dish.name}</span><small>{dish.line}</small></div>
        <a className="hero-down" href="#film-stage" aria-label="Watch the CookPilot film"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v15m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
        <p className="hero-origin">EST. IN PERU <span>·</span> MADE FOR YOU</p>
      </section>

      <div className="shared-plate" ref={sharedPlate}><img ref={sharedImage} src={LOMO} alt="Lomo Saltado" draggable={false} fetchPriority="high" /></div>

      <div className="film-stage" id="film-stage" ref={stage}>
        <section className="opening-scene film-scene"><FilmHeadline className="opening-headline"><span>LET&apos;S MAKE IT</span><em>REAL.</em></FilmHeadline></section>
        <section className="vacuum-scene film-scene" aria-label="Real requests and ingredients converge into one meal">
          {tickets.map((ticket) => <div className="vacuum-object ticket-object" data-vacuum key={ticket.label}><KitchenTicket label={ticket.label} gold={ticket.gold} /></div>)}
          {ingredients.map((ingredient) => <div className="vacuum-object ingredient-object" data-vacuum key={ingredient.file}><img src={`${FILM}${ingredient.file}`} alt={ingredient.name} /></div>)}
          <div className="convergence-spark" aria-hidden="true"><i /><i /></div>
        </section>
        <section className="cooklist-scene film-scene"><FilmHeadline className="list-headline"><span>EVERYTHING YOU</span><em>NEED.</em></FilmHeadline><CookList /><div className="match-line" aria-hidden="true" /></section>
        <section className="cookmode-scene film-scene"><FilmHeadline className="mode-headline"><span>WHEN IT&apos;S TIME<br />TO COOK,</span><em>JUST COOK.</em></FilmHeadline><CookMode /></section>
        <section className="return-scene film-scene" aria-hidden="true"><span className="return-note">THE PART THAT MATTERS.</span></section>
        <section className="plan-scene film-scene"><FilmHeadline className="plan-headline"><span>RIGHT WHERE IT</span><em>BELONGS.</em></FilmHeadline><CookPlan /></section>
        <section className="final-scene film-scene" id="serve"><img className="final-photo" src={`${FILM}lomo_table_final.png`} alt="Lomo Saltado served on a real table" fetchPriority="high" /><div className="final-shade" /><FilmHeadline className="final-headline"><span>YOU WANTED IT.</span><em>NOW IT&apos;S REAL.</em></FilmHeadline></section>
        <ol className="film-rail" aria-label="Film progress">{steps.map((step) => <li key={step}><i /><span>{step}</span></li>)}</ol>
      </div>
      <div className="film-end" aria-hidden="true"><span>THE FILM · COOKPILOT</span></div>
    </div>
  );
}
