"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowDown2, ArrowRight } from "iconsax-reactjs";
import { useLocale } from "@/contexts/LanguageContext";
import { DownloadButton } from "./DownloadExperience";
import styles from "./HomePageContent.module.css";
import FinalDownload from "./FinalDownload";

const PRODUCT_STEPS = [
  { id: "planifica", image: "/images/app/cookplan.png" },
  { id: "ajusta", image: "/images/app/cookfit.png" },
  { id: "compra", image: "/images/app/cooklist.png" },
  { id: "cocina", image: "/images/app/cookhome.png" },
  { id: "importa", image: "/images/app/cookimport.png" },
  { id: "reutiliza", image: "/images/app/cooksearch.png" },
] as const;

const HERO_SLIDES = [
  "/images/app/cookhome.png",
  "/images/app/cooklist.png",
  "/images/app/cookplan_hero.png",
] as const;

const FOOD_IMAGES = [
  "/images/food_images/img_dish_hero_signature.webp",
  "/images/food_images/ensalada_caprese.webp",
  "/images/food_images/tres_leches.webp",
  "/images/food_images/img_dish_fresh_health.webp",
  "/images/food_images/aji_de_polleria.webp",
  "/images/food_images/queque_de_zanahoria_con_manjar.webp",
] as const;
const GUIDES_IMAGES = [
   "/images/food_images/img_dish_hearty_home.webp",
  "/images/food_images/ensalada_clasica_de_polleria.webp",
  "/images/food_images/tres_leches.webp",
  "/images/food_images/img_dish_secondary.webp",
  "/images/food_images/aji_de_polleria.webp",
  "/images/food_images/img_dish_editorial_color.webp",
] as const;
function Hero() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeSlide, setActiveSlide] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const phoneY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, 72],
  );

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <section className={styles.hero} id="hero" ref={sectionRef}>
      <div className={styles.heroBackdrop} aria-hidden="true" />
      <div className={styles.heroGlow} aria-hidden="true" />

      <div className={styles.heroInner}>
        <motion.div
          className={styles.heroCopy}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <h1>{t.hero.title}</h1>
          <p className={styles.heroLead}>{t.hero.subtitle}</p>

          <DownloadButton className={styles.primaryCta}>
            {t.header.descargar}
            <ArrowRight size={22} aria-hidden="true" />
          </DownloadButton>
        </motion.div>

        <div
          className={styles.heroProduct}
          aria-label={t.home_editorial.hero_visual_alt}
        >
          <motion.div className={styles.heroPhone} style={{ y: phoneY }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={HERO_SLIDES[activeSlide]}
                className={styles.heroSlide}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.8,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={HERO_SLIDES[activeSlide]}
                  alt={t.home_editorial.hero_visual_alt}
                  width={620}
                  height={1120}
                  sizes="(max-width: 640px) 74vw, (max-width: 960px) 54vw, 38vw"
                  priority={activeSlide === 0}
                />
              </motion.div>
            </AnimatePresence>

            <motion.div
              className={styles.heroMascot}
              initial={
                reduceMotion ? false : { opacity: 0, scale: 0.88, y: 24 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.7,
                delay: reduceMotion ? 0 : 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              aria-hidden="true"
            >
              <Image
                src="/images/cookpilot/thumbs_up.webp"
                alt=""
                width={760}
                height={760}
                sizes="(max-width: 640px) 34vw, 18vw"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className={styles.heroFade} aria-hidden="true" />
    </section>
  );
}

function Definition() {
  const { locale, t } = useLocale();
  const guidesPath = locale === "es" ? "/es/guias" : "/en/guides";
  const reduceMotion = useReducedMotion();

  return (
    <section className={styles.definition} id="summary">
      <motion.div
        className={styles.definitionInner}
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.42 }}
        transition={{
          duration: reduceMotion ? 0 : 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          className={styles.definitionCopy}
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.42 }}
          transition={{
            duration: reduceMotion ? 0 : 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <h2>{t.summary.title}</h2>
          <p className={styles.definitionLead}>{t.summary.new_body}</p>

          <Link href={guidesPath} className={styles.primaryCta}>
            {t.summary.learn_more}
            <ArrowRight size={22} aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.div
          className={styles.definitionVisual}
          initial={reduceMotion ? false : { opacity: 0, x: 28, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.42 }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            delay: reduceMotion ? 0 : 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Image
            src="/images/cookpilot/ckp_crossed_arms.png"
            alt={t.summary.title}
            width={620}
            height={1040}
            sizes="(max-width: 640px) 84vw, (max-width: 960px) 58vw, 34vw"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

function ProductStory() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion) {
      return;
    }

    const clamped = Math.max(0, Math.min(0.999, value));
    const nextIndex = Math.min(
      PRODUCT_STEPS.length - 1,
      Math.floor(clamped * PRODUCT_STEPS.length),
    );

    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  const activeStep = PRODUCT_STEPS[activeIndex];
  const titleKey = `${activeStep.id}_title` as keyof typeof t.app_showcase;
  const subtitleKey =
    `${activeStep.id}_subtitle` as keyof typeof t.app_showcase;

  return (
    <section className={styles.story} id="features" ref={sectionRef}>
      <div className={styles.storySticky}>
        <div className={styles.storyGlow} aria-hidden="true" />

        <header className={styles.storyHeading}>
          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{
              duration: reduceMotion ? 0 : 0.58,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {t.app_showcase.section_title}
          </motion.h2>
        </header>

        <div className={styles.storyCanvas}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeStep.id}-copy`}
              className={styles.storyCopy}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
              transition={{
                duration: reduceMotion ? 0 : 0.42,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <p className={styles.storyNumber}>
                {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <h3>{t.app_showcase[titleKey]}</h3>
              <p>{t.app_showcase[subtitleKey]}</p>
            </motion.div>
          </AnimatePresence>

          <div className={styles.storyPhoneStage} aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                className={styles.storyPhone}
                initial={
                  reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduceMotion ? undefined : { opacity: 0, y: -28, scale: 0.98 }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.56,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Image
                  src={activeStep.image}
                  alt={t.app_showcase[titleKey]}
                  width={620}
                  height={1120}
                  sizes="(max-width: 640px) 72vw, (max-width: 960px) 46vw, 30vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          className={styles.storyNav}
          role="tablist"
          aria-label={t.app_showcase.section_title}
        >
          {PRODUCT_STEPS.map((step, index) => {
            const labelKey = `${step.id}_label` as keyof typeof t.app_showcase;

            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                className={
                  index === activeIndex ? styles.storyNavActive : undefined
                }
                onClick={() => setActiveIndex(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {t.app_showcase[labelKey]}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProMoment() {
  const { locale, t } = useLocale();
  const reduceMotion = useReducedMotion();
  const proPath = locale === "es" ? "/es/pro" : "/en/pro";

  return (
    <section className={styles.proMoment} id="pro">
      <div className={styles.proGlow} aria-hidden="true" />

      <div className={styles.proInner}>
        <motion.div
          className={styles.proCopy}
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.42 }}
          transition={{
            duration: reduceMotion ? 0 : 0.68,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <h2>{t.pro.title}</h2>
          <p className={styles.proLead}>{t.pro.subtitle}</p>

          <Link href={proPath} className={styles.primaryCta}>
            {t.pro.cta_label}
            <ArrowRight size={22} aria-hidden="true" />
          </Link>
        </motion.div>

        <div className={styles.proStage}>
          <motion.div
            className={styles.proPhonePrimary}
            initial={reduceMotion ? false : { opacity: 0, y: 48, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.34 }}
            transition={{
              duration: reduceMotion ? 0 : 0.8,
              delay: reduceMotion ? 0 : 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Image
              src="/images/app/cookbilling.png"
              alt={t.pro.title}
              width={980}
              height={1260}
              sizes="(max-width: 640px) 68vw, (max-width: 960px) 54vw, 38vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Guides() {
  const { locale, t } = useLocale();
  const guidesPath = locale === "es" ? "/es/guias" : "/en/guides";
  const guides = [
    t.guides.g1,
    t.guides.g2,
    t.guides.g3,
    t.guides.g4,
    t.guides.g5,
    t.guides.g6,
  ];

  return (
    <section className={styles.guides} id="guides">
      <div className={styles.guidesInner}>
        <header className={styles.sectionIntro}>
          <h2>{t.guides.title}</h2>
          <p>{t.guides.subtitle}</p>
        </header>

        <div className={styles.guidesGrid}>
          {guides.map((guide, index) => (
            <Link
              href={guidesPath}
              key={guide}
              className={[
                styles.guideCard,
                index === 0 ? styles.guideCardFeatured : "",
              ].join(" ")}
            >
              <Image
                src={GUIDES_IMAGES[index]}
                alt={guide}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 640px) 100vw, (max-width: 960px) 100vw, 58vw"
                    : "(max-width: 640px) 100vw, (max-width: 960px) 50vw, 34vw"
                }
              />

              <div className={styles.guideShade} aria-hidden="true" />

              <div className={styles.guideMeta}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <ArrowRight size={24} aria-hidden="true" />
              </div>

              <div className={styles.guideCopy}>
                <h3>{guide}</h3>
                {index === 0 ? (
                  <p>{t.home_editorial.guide_feature_support}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function RealFood() {
  const { t } = useLocale();
  const cardClasses = [
    styles.foodCard1,
    styles.foodCard2,
    styles.foodCard3,
    styles.foodCard4,
    styles.foodCard5,
    styles.foodCard6,
  ];

  return (
    <section className={styles.food} id="real-food">
      <div className={styles.foodInner}>
        <header className={styles.sectionIntro}>
          <h2>{t.home_editorial.food_title}</h2>
          <p>{t.home_editorial.food_support}</p>
        </header>

        <div className={styles.foodGrid}>
          {FOOD_IMAGES.map((src, index) => (
            <figure
              key={src}
              className={`${styles.foodCard} ${cardClasses[index]}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 34vw"
                className={styles.foodImage}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const { t } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [
    [t.faq.q1, t.faq.a1],
    [t.faq.q2, t.faq.a2],
    [t.faq.q3, t.faq.a3],
    [t.faq.q4, t.faq.a4],
    [t.faq.q5, t.faq.a5],
  ];

  return (
    <section className={styles.faq} id="short-faq">
      <div className={styles.faqInner}>
        <header className={styles.sectionIntro}>
          <h2>{t.faq.title}</h2>
          <p>{t.faq.subtitle}</p>
        </header>

        <div className={styles.faqList}>
          {items.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            const answerId = `home-faq-${index}`;

            return (
              <div
                className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                key={question}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{question}</span>
                  <ArrowDown2
                    className={isOpen ? styles.faqArrowOpen : undefined}
                    size={24}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={answerId}
                  className={styles.faqAnswer}
                  hidden={!isOpen}
                >
                  <p>{answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function HomePageContent() {
  return (
    <main className={styles.home}>
      <Hero />
      <Definition />
      <ProductStory />
      <ProMoment />
      <Guides />
      <RealFood />
      <FAQ />
      <FinalDownload />
    </main>
  );
}
