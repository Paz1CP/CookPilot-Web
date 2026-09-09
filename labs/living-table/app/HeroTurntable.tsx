"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const dishes = [
  { file: "lomo_saltado", name: "Lomo saltado", line: "THE START OF SOMETHING GOOD" },
  { file: "ceviche", name: "Ceviche", line: "A LITTLE BRIGHTER. A LITTLE BOLDER." },
  { file: "papa_a_la_huancaina", name: "Papa a la huancaína", line: "GOLDEN, CREAMY. COMPLETELY YOURS." },
  { file: "aji_de_gallina", name: "Ají de gallina", line: "THE KIND OF COMFORT YOU COME BACK TO." },
  { file: "ensalada_de_palta", name: "Ensalada de palta", line: "FRESH HAS A WAY OF WINNING YOU OVER." },
];
const source = (file: string) => `/images/food_images/transparent_bg/${file}.png`;

export default function HeroTurntable() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const travel = useTransform(scrollYProgress, [0, 1], [0, 130]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 });
    if (ref.current) observer.observe(ref.current);
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  useEffect(() => {
    if (!visible || paused || reduced) return;
    const interval = window.setInterval(() => setActive(value => (value + 1) % dishes.length), 5000);
    return () => window.clearInterval(interval);
  }, [visible, paused, reduced]);

  return <section className="hero turntable" id="top" ref={ref} aria-label="Cook what you want. Your way.">
    <div className="turntable-title">
      <p className="turntable-eyebrow">GOOD FOOD. REAL LIFE.</p>
      <h1><span className="title-intro">COOK WHAT YOU <em>WANT.</em></span><span className="title-outro">YOUR <em>WAY.</em></span></h1>
    </div>

    <div className="turntable-caption">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={active} initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: .18 }}>
          <span className="dish-name">{dishes[active].name}</span>
          <span className="dish-story">{dishes[active].line}</span>
        </motion.div>
      </AnimatePresence>
    </div>

    <motion.div className="turntable-platter" style={{ y: reduced ? 0 : travel }}>
      <AnimatePresence initial={false}>
        <motion.div className="dish-sleeve" key={active} data-dish={dishes[active].file}
          initial={{ opacity: 0, scale: .94, y: reduced ? 0 : "9%" }}
          animate={{ opacity: 1, scale: 1, y: "0%" }}
          exit={{ opacity: 0, scale: 1.04, y: reduced ? 0 : "-6%" }}
          transition={{ duration: reduced ? 0 : .48, ease: [.22, .8, .22, 1] }}>
          <img className="dish-disc" src={source(dishes[active].file)} alt={dishes[active].name} draggable={false} fetchPriority="high"
            style={{ animationPlayState: visible && !paused ? "running" : "paused" }} />
        </motion.div>
      </AnimatePresence>
    </motion.div>

    <div className="turntable-preload" aria-hidden="true">{dishes.slice(1).map(dish => <img key={dish.file} src={source(dish.file)} alt="" />)}</div>
    <a className="turntable-down" href="#crave" aria-label="Explore the living table"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v15m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
    <p className="turntable-origin">EST. IN PERU <span>·</span> MADE FOR YOU</p>
  </section>;
}
