"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal, fadeUp } from "./motion";
import styles from "./Waitlist.module.css";
import { ArrowRight } from "iconsax-reactjs";
import { useLocale } from "@/contexts/LanguageContext";

export default function Waitlist({ id = "waitlist" }: { id?: string }) {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubmitted(true);
    }
  };

  return (
    <section className={styles.waitlist} id={id}>
      <div className={styles.card}>
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                style={{ width: "100%" }}
              >
                <div className={styles.avatarGroup}>
                  <img src="/images/img_dish_hero_signature.webp" alt={t.waitlist.avatar_alt} className={styles.avatar} />
                  <img src="/images/img_dish_fresh_health.webp" alt={t.waitlist.avatar_alt} className={styles.avatar} />
                  <img src="/images/img_dish_hearty_home.webp" alt={t.waitlist.avatar_alt} className={styles.avatar} />
                  <div className={styles.avatarCount}>{t.waitlist.user_count}</div>
                </div>

                <h2 className={styles.title}>{t.waitlist.section_title}</h2>
                <p className={styles.description}>{t.waitlist.section_description}</p>

                <form className={styles.formWrap} onSubmit={handleSubmit}>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder={t.waitlist.email_placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className={styles.submitBtn}>
                    {t.waitlist.submit_button} <ArrowRight size="18" variant="Outline" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className={styles.successContainer}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className={styles.successTitle}>{t.waitlist.success_title}</h2>
                <p className={styles.description}>
                  {t.waitlist.success_description_line_1}
                  <br />
                  {t.waitlist.success_description_line_2}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.mascotCol}>
          <Reveal variants={fadeUp} delay={0.2}>
            <img
              src="/images/img_icon_waitlist.png"
              alt={t.waitlist.icon_alt}
              className={styles.mascotPlaceholder}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
