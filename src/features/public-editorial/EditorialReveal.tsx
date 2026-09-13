"use client";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/** The next chapter settles into its reading position as it enters the viewport. */
export default function EditorialReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div className={className} initial={false} whileInView={{ y: 0 }}
      viewport={{ once: true, amount: .12 }} style={{ y: reducedMotion ? 0 : 24 }}
      transition={{ duration: reducedMotion ? 0 : .45, ease: [.22, 1, .36, 1] }}>
      {children}
    </motion.div>
  );
}
