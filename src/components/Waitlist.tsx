"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Reveal, fadeUp } from "./motion";
import styles from "./Waitlist.module.css";

export default function Waitlist({ id = "waitlist" }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubmitted(true);
    }
  };

  return (
    <section className={styles.waitlist} id={id}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <Reveal variants={fadeUp}>
            <h2 className={styles.title}>¿Quieres entrar primero?</h2>
          </Reveal>

          <Reveal variants={fadeUp} delay={0.1}>
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
                <p>¡Listo! Te avisaremos cuando <span className="brand-cook">Cook</span><span className="brand-pilot">Pilot</span> abra su primera mesa.</p>
              </motion.div>
            )}
          </Reveal>

          <Reveal variants={fadeUp} delay={0.2}>
            <p className={styles.description}>
              Déjame tu correo y te aviso cuando <span className="brand-cook">Cook</span><span className="brand-pilot">Pilot</span> abra su primera mesa.
            </p>
          </Reveal>
        </div>

        <div className={styles.mascotCol}>
          <Reveal variants={fadeUp} delay={0.3}>
            <img
              src="/images/img_icon_waitlist.png"
              alt="Join CookPilot Waitlist"
              className={styles.mascotPlaceholder}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
