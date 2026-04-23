"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Reveal, fadeUp } from "./motion";
import styles from "./FinalCTA.module.css";

export default function FinalCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubmitted(true);
    }
  };

  const scrollToDemo = () => {
    const el = document.getElementById("demo");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={styles.finalCta} id="final-cta">
      <div className={styles.inner}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.title}>
            Comer mejor, gastar menos y tener más control no debería ser un
            lujo.
          </h2>
        </Reveal>

        <Reveal variants={fadeUp} delay={0.12}>
          {!submitted ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="email"
                className={`cp-input ${styles.input}`}
                placeholder="Tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className={`cp-btn cp-btn--primary ${styles.submitBtn}`}
              >
                Join waitlist
              </button>
            </form>
          ) : (
            <motion.div
              className={styles.successMsg}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className={styles.successIcon}>✓</span>
              <p>¡Listo! Te avisaremos cuando CookPilot abra.</p>
            </motion.div>
          )}
        </Reveal>

        <Reveal variants={fadeUp} delay={0.2}>
          <p className={styles.supportText}>
            Si quieres entrar primero cuando CookPilot abra, déjame tu correo.
          </p>
        </Reveal>

        <Reveal variants={fadeUp} delay={0.28}>
          <button className={styles.demoLink} onClick={scrollToDemo}>
            Watch demo
          </button>
        </Reveal>
      </div>
    </section>
  );
}
