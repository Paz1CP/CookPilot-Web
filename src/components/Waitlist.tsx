"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal, fadeUp } from "./motion";
import styles from "./Waitlist.module.css";
import { ArrowRight } from "iconsax-reactjs";
import { useLocale } from "@/contexts/LanguageContext";
import { joinWaitlist } from "@/lib/joinWaitlist";

type SubmitState = "idle" | "loading" | "success" | "alreadyJoined" | "error";

export default function Waitlist({ id = "waitlist" }: { id?: string }) {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  // Auto-reset after success/alreadyJoined so the user can re-enter
  useEffect(() => {
    if (state === "success" || state === "alreadyJoined") {
      const timer = setTimeout(() => {
        setState("idle");
        setEmail("");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");

    const result = await joinWaitlist(email);
    setState(result.status);
  };

  const submitted = state === "success" || state === "alreadyJoined";

  return (
    <section className={styles.waitlist} id={id}>
      <div className={`${styles.card} ${submitted ? styles.submitted : ""}`}>
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
                  <Image src="/images/img_dish_hero_signature.webp" alt={t.waitlist.avatar_alt} width={48} height={48} className={styles.avatar} />
                  <Image src="/images/img_dish_fresh_health.webp" alt={t.waitlist.avatar_alt} width={48} height={48} className={styles.avatar} />
                  <Image src="/images/img_dish_hearty_home.webp" alt={t.waitlist.avatar_alt} width={48} height={48} className={styles.avatar} />
                  <div className={styles.avatarCount}>{t.waitlist.user_count}</div>
                </div>

                <h2 className={styles.title}>{t.waitlist.section_title}</h2>
                <p className={styles.description}>{t.waitlist.section_description}</p>

                <form className={styles.formWrap} onSubmit={handleSubmit}>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder={t.waitlist.email_placeholder}
                    aria-label={t.waitlist.email_label}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={state === "loading"}
                  />
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={state === "loading"}
                  >
                    {state === "loading"
                      ? t.waitlist.loading
                      : <>{t.waitlist.submit_button} <ArrowRight size="18" variant="Outline" /></>}
                  </button>
                </form>

                {/* Inline error — doesn't replace layout */}
                {state === "error" && (
                  <p className={styles.errorMsg}>{t.waitlist.error}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className={styles.successContainer}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h2 className={styles.successTitle}>{t.waitlist.success_title}</h2>
                <p className={styles.description}>
                  {state === "alreadyJoined"
                    ? t.waitlist.already_joined
                    : t.waitlist.success_description_line_1}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.mascotCol}>
          <Reveal variants={fadeUp} delay={0.2}>
            <motion.div
              className={styles.mascotPlaceholder}
              animate={
                submitted
                  ? { y: [0, -20, 0], scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }
                  : { y: 0, scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Image
                src="/images/img_icon_waitlist.png"
                alt={t.waitlist.icon_alt}
                width={280}
                height={340}
                style={{ objectFit: "contain", width: "100%", height: "auto" }}
              />
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
