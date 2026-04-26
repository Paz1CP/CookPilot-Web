"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal, fadeUp } from "./motion";
import styles from "./FinalCTA.module.css";
import waitlistStyles from "./Waitlist.module.css";
import { ArrowRight } from "iconsax-reactjs";
import { useLocale } from "@/contexts/LanguageContext";
import { joinWaitlist } from "@/lib/joinWaitlist";

type SubmitState = "idle" | "loading" | "success" | "alreadyJoined" | "error";

const CAROUSEL_IMAGES = [
  "/images/img_dish_hero_signature.webp",
  "/images/img_dish_secondary.webp",
  "/images/img_dish_fresh_health.webp",
  "/images/img_dish_editorial_color.webp",
  "/images/img_dish_hearty_home.webp",
];
const SCROLL_IMAGES = [...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES];

export default function FinalCTA() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");

    const result = await joinWaitlist(email);
    setState(result.status);

    if (result.status === "success") setEmail("");
  };

  const submitted = state === "success" || state === "alreadyJoined";

  return (
    <section className={styles.finalCta} id="final-cta">
      <div className={styles.bgCarousel}>
        <div className={styles.carouselTrack}>
          {SCROLL_IMAGES.map((src, i) => (
            <Image key={i} src={src} alt="" width={1024} height={1024} className={styles.bgImage} />
          ))}
        </div>
      </div>
      <div className={styles.overlay} />

      <div className={styles.inner}>
        <Reveal variants={fadeUp}>
          <h2 className={styles.title}>{t.final_cta.section_title}</h2>
        </Reveal>

        <Reveal variants={fadeUp} delay={0.12}>
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form
                  className={waitlistStyles.formWrap}
                  style={{ margin: "0 auto 20px", width: "100%" }}
                  onSubmit={handleSubmit}
                >
                  <input
                    type="email"
                    className={waitlistStyles.input}
                    placeholder={t.final_cta.email_placeholder}
                    aria-label={t.final_cta.email_label}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={state === "loading"}
                  />
                  <button
                    type="submit"
                    className={waitlistStyles.submitBtn}
                    disabled={state === "loading"}
                  >
                    {state === "loading"
                      ? t.final_cta.loading
                      : <>{t.final_cta.submit_button} <ArrowRight size="18" variant="Outline" /></>}
                  </button>
                </form>

                {state === "error" && (
                  <p className={styles.errorMsg}>{t.final_cta.error}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className={styles.successMsg}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={styles.successIcon} aria-label={t.final_cta.success_icon_aria}>
                  ✓
                </span>
                <p>
                  {state === "alreadyJoined"
                    ? t.final_cta.already_joined
                    : t.final_cta.success_message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
