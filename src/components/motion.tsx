"use client";

import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "motion/react";
import {
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";

/* ────────────────────────────────────────────
   Shared animation variants
   ──────────────────────────────────────────── */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.15,
    },
  },
};

/* ────────────────────────────────────────────
   Scroll-reveal wrapper
   ──────────────────────────────────────────── */

interface RevealProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "section" | "article" | "span" | "p" | "h1" | "h2" | "h3";
}

export function Reveal({
  children,
  variants = fadeUp,
  className,
  style,
  delay = 0,
  once = true,
  amount = 0.2,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });

  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
      style={{ ...style, willChange: "transform, opacity" }}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Component>
  );
}

/* ────────────────────────────────────────────
   Stagger reveal container
   ──────────────────────────────────────────── */

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
  amount?: number;
  slow?: boolean;
}

export function StaggerReveal({
  children,
  className,
  style,
  once = true,
  amount = 0.15,
  slow = false,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      variants={slow ? staggerContainerSlow : staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Parallax wrapper
   ──────────────────────────────────────────── */

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

export function Parallax({
  children,
  speed = 0.15,
  className,
  style,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100]);

  return (
    <motion.div ref={ref} style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  );
}

