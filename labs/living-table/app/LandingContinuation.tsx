"use client";

import { useEffect, useRef, useState } from "react";
import {
  days,
  food,
  cookListDemo,
  links,
} from "./continuation-data";
import "./continuation.css";
import HeroAtmosphere from "./HeroAtmosphere";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="lc-download-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3v11m0 0 4.2-4.2M12 14l-4.2-4.2M5 19.5h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Bookmark({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={filled ? "is-filled" : ""}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.75 4.75A2.25 2.25 0 0 1 9 2.5h6a2.25 2.25 0 0 1 2.25 2.25v16.1l-5.25-3.2-5.25 3.2V4.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Check({ checked }: { checked: boolean }) {
  return (
    <span
      className={`lc-check ${checked ? "is-checked" : ""}`}
      aria-hidden="true"
    >
      {checked ? "✓" : ""}
    </span>
  );
}
function Food({
  src,
  name,
  className = "",
}: {
  src: string;
  name?: string;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={src}
      alt={name || ""}
      width="800"
      height="800"
      loading="lazy"
      decoding="async"
    />
  );
}

const cookingSteps = [
  {
    image: "/images/food_images/lomo_step_01_prep.png",
    title: "Everything ready. Now the heat.",
    body: "Slice the beef, onion, tomato and yellow chili, then chop the cilantro. Keep everything ready before the pan starts talking.",
  },
  {
    image: "/images/food_images/lomo_step_02_fries.png",
    title: "The crunch starts here.",
    body: "Fry the potatoes until golden and crisp. Let them hold their texture so they finish strong on the plate.",
  },
  {
    image: "/images/food_images/lomo_step_03_sear.png",
    title: "Give the beef the fire.",
    body: "Cook the beef in hot batches so it browns fast, stays juicy and builds the flavor base.",
  },
  {
    image: "/images/food_images/lomo_step_04_stir_fry.png",
    title: "Fast, hot, together.",
    body: "Bring the beef back with onion, tomato and chili, then finish with garlic, soy sauce and vinegar while everything stays moving.",
  },
  {
    image: "/images/food_images/lomo_step_05_serve.png",
    title: "All of it, right on time.",
    body: "Finish with cilantro, plate immediately, and serve with rice and fries while the whole dish still feels alive.",
  },
] as const;

const savedRecipes = [
  {
    id: "caprese",
    name: "Ensalada caprese",
    descriptor: "Classic • Fresh • Elegant",
    image: "/images/food_images/ensalada_caprese.webp",
    saveCopy: "Saved for a fresh return.",
  },
  {
    id: "lomo",
    name: "Lomo Saltado",
    descriptor: "Bold • Smoky • Satisfying",
    image: "/images/food_images/img_dish_hero_signature.webp",
    saveCopy: "Reused for the dinner.",
  },
  {
    id: "palta",
    name: "Ensalada de palta",
    descriptor: "Fresh • Bright • Balanced",
    image: "/images/food_images/img_dish_fresh_health.webp",
    saveCopy: "Saved for a brighter side.",
  },
  {
    id: "aji",
    name: "Ají de pollería",
    descriptor: "Creamy • Tangy • Addictive",
    image: "/images/food_images/aji_de_polleria.webp",
    saveCopy: "Saved for the next craving.",
  },
  {
    id: "morada",
    name: "Jugo de maracuyá",
    descriptor: "Cold • Fruity • Refreshing",
    image: "/images/food_images/jugo_de_maracuya.png",
    saveCopy: "Saved for the next table.",
  },
] as const;

const discoveryRecipes = [
  {
    eyebrow: "Coastal classic",
    title: "Tacu Tacu con Mariscos",
    description:
      "Golden tacu tacu with a creamy center, topped with a silky ají seafood sauce and plenty of cevichería energy.",
    image:
      "https://media.cookpilot.pro/recipes/images/oficial_images/tacu_tacu_con_mariscos.webp",
  },
  {
    eyebrow: "Tropical chill",
    title: "Cheesecake de maracuyá",
    description:
      "Cold, creamy passion fruit cheesecake on a compact cookie crust, finished with a bright, glossy tropical topping.",
    image:
      "https://media.cookpilot.pro/recipes/images/oficial_images/cheesecake_de_maracuya.webp",
  },
  {
    eyebrow: "Street fire",
    title: "Anticuchos De Corazón",
    description:
      "Juicy beef-heart skewers, charred at the edges with ají panca and vinegar, served with grilled potato and corn.",
    image:
      "https://media.cookpilot.pro/recipes/images/oficial_images/anticuchos_de_corazon.webp",
  },
  {
    eyebrow: "Molten indulgence",
    title: "Volcán De Chocolate",
    description:
      "Tender chocolate cake with a dark molten center that spills open at the first cut — rich, warm and unapologetically chocolate.",
    image:
      "https://media.cookpilot.pro/recipes/images/oficial_images/volcan_de_chocolate.webp",
  },
  {
    eyebrow: "Amazonian feast",
    title: "Avispa juane",
    description:
      "Aromatic rice, pork and hen wrapped in bijao leaves — a festive Alto Mayo parcel made to open hungry.",
    image:
      "https://media.cookpilot.pro/recipes/images/oficial_images/avispa_juane.webp",
  },
  {
    eyebrow: "Golden sour",
    title: "Aguaymanto Sour",
    description:
      "Pisco and aguaymanto shaken bright with lemon, finished beneath a smooth crown of egg-white foam.",
    image:
      "https://media.cookpilot.pro/recipes/images/oficial_images/aguaymanto_sour.webp",
  },
  {
    eyebrow: "Criollo classic",
    title: "Ají de Gallina",
    description:
      "Silky ají amarillo chicken over yellow potatoes, finished with egg, black olives and white rice — pure Peruvian comfort.",
    image:
      "https://media.cookpilot.pro/recipes/images/oficial_images/aji_de_gallina.webp",
  },
  {
    eyebrow: "Golden scoop",
    title: "Helado de Lúcuma",
    description:
      "Silky lucuma ice cream with unmistakable notes of ripe fruit, caramel and natural vanilla in every golden spoonful.",
    image:
      "https://media.cookpilot.pro/recipes/images/oficial_images/helado_de_lucuma.webp",
  },
] as const;

type ProPlan = "free" | "pro";

type ProBenefitContent = {
  firstLine: string;
  secondLine: string;
  highlight: "first" | "second";
  subtitle: string;
};
type ProBenefit = {
  id: string;
  icon: string;
  pro: ProBenefitContent;
  free?: ProBenefitContent;
};

const proBenefits: readonly ProBenefit[] = [
  {
    id: "catalogue",
    icon: "/icons/actions/recipe_library.webp",
    pro: {
      firstLine: "1,000+ RECIPES.",
      secondLine: "ALL YOURS.",
      highlight: "first",
      subtitle: "Explore the full catalogue and cook far beyond the basics.",
    },
    free: {
      firstLine: "30 RECIPES.",
      secondLine: "READY TO COOK.",
      highlight: "first",
      subtitle: "A curated starting point from the CookPilot catalogue.",
    },
  },
  {
    id: "planning",
    icon: "/icons/actions/month_planner.webp",
    pro: {
      firstLine: "PLAN THE",
      secondLine: "WHOLE MONTH.",
      highlight: "second",
      subtitle: "Shape more of your month, not just the current week.",
    },
    free: {
      firstLine: "PLAN",
      secondLine: "THIS WEEK.",
      highlight: "second",
      subtitle: "Keep the current week organized and easy to adjust.",
    },
  },
  {
    id: "import",
    icon: "/icons/billing/import_more.webp",
    pro: {
      firstLine: "BRING RECIPES",
      secondLine: "FROM ANYWHERE.",
      highlight: "second",
      subtitle: "Turn links, photos, videos and PDFs into usable recipes.",
    },
  },
  {
    id: "prices",
    icon: "/icons/actions/buying_1.webp",
    pro: {
      firstLine: "KNOW WHAT",
      secondLine: "DINNER COSTS.",
      highlight: "second",
      subtitle: "See prices, compare totals and make smarter food decisions.",
    },
  },
  {
    id: "personal",
    icon: "/icons/actions/recipe_edit.webp",
    pro: {
      firstLine: "MAKE RECIPES",
      secondLine: "YOURS.",
      highlight: "second",
      subtitle: "Copy, edit and keep your own version of a dish.",
    },
  },
  {
    id: "live",
    icon: "/icons/billing/cookmode_live.webp",
    pro: {
      firstLine: "COOK WITH",
      secondLine: "LIVE HELP.",
      highlight: "second",
      subtitle: "Get help while cooking, right when you need it.",
    },
  },
] as const;

type SavedRecipeId = (typeof savedRecipes)[number]["id"];
type SaveNotice = {
  recipeId: SavedRecipeId;
  message: string;
} | null;

export default function LandingContinuation() {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const discoveryCards = useRef<Array<HTMLButtonElement | null>>([]);
  const sourceDay = 3;
  type CookListCategory = (typeof cookListDemo.categories)[number]["name"];
  type CookListTab = "Todos" | CookListCategory;
  const [category, setCategory] = useState<CookListTab>("Todos");
  const [checked, setChecked] = useState<string[]>([]);
  const [focusedIngredient, setFocusedIngredient] = useState("Tomate");
  const [activeCookingStep, setActiveCookingStep] = useState(0);
  const [savedRecipeIds, setSavedRecipeIds] = useState<SavedRecipeId[]>([]);
  const [saveNotice, setSaveNotice] = useState<SaveNotice>(null);
  const [proPlan, setProPlan] = useState<ProPlan>("pro");
  const [selectedDiscoveryIndex, setSelectedDiscoveryIndex] = useState(0);
  const [hoveredDiscoveryIndex, setHoveredDiscoveryIndex] = useState<number | null>(null);

  useEffect(() => {
    // Progressive enhancement: content is visible if observers are unavailable.
    if (!root.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lc-arrived");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    root.current
      .querySelectorAll("[data-lc-reveal]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!saveNotice) return;
    const timeout = window.setTimeout(() => setSaveNotice(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [saveNotice]);

  const toggleSavedRecipe = (recipe: (typeof savedRecipes)[number]) => {
    const isSaved = savedRecipeIds.includes(recipe.id);
    setSavedRecipeIds((current) =>
      isSaved
        ? current.filter((recipeId) => recipeId !== recipe.id)
        : [...current, recipe.id],
    );
    setSaveNotice({
      recipeId: recipe.id,
      message: isSaved ? "Removed from saved." : recipe.saveCopy,
    });
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveCookingStep((current) => (current + 1) % cookingSteps.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  function selectDiscovery(index: number) {
    const nextIndex = Math.max(0, Math.min(discoveryRecipes.length - 1, index));
    setSelectedDiscoveryIndex(nextIndex);
    setHoveredDiscoveryIndex(null);
    window.requestAnimationFrame(() => {
      const el = rail.current;
      const card = discoveryCards.current[nextIndex];
      if (!el || !card) return;
      const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
      el.scrollTo({
        left: Math.max(0, left),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  }

  function advanceRail(direction: number) {
    selectDiscovery(selectedDiscoveryIndex + direction);
  }
  const displayedDiscovery =
    discoveryRecipes[hoveredDiscoveryIndex ?? selectedDiscoveryIndex];
  const listItems =
    category === "Todos"
      ? Object.values(cookListDemo.items).flat()
      : cookListDemo.items[category];
  const listTabs = [
    { name: "Todos" as const, count: cookListDemo.totalUniqueIngredients },
    ...cookListDemo.categories,
  ];
  const selectedItem =
    Object.values(cookListDemo.items)
      .flat()
      .find((item) => item.name === focusedIngredient) ?? listItems[0];
  return (
    <div className="lc" ref={root}>
      <section
        className="lc-own lc-wrap"
        id="make-it-yours"
        aria-labelledby="lc-own-title"
      >
        <header className="lc-menu-intro" data-lc-reveal>
          <div>
            <span className="lc-menu-eyebrow">SO, MAKE THEM YOURS</span>
            <h2 id="lc-own-title">
              ONE RECIPE.
              <br />
              <em>TO A WHOLE MEAL.</em>
            </h2>
          </div>
          <p>
            One recipe doesn’t have to stand alone. Add a side, a drink, another
            dish — whatever makes it feel complete. CookPilot keeps it together
            as one menu, ready to plan, shop and cook.
          </p>
        </header>
        <div className="lc-menu-rail-wrap">
          <div
            className="lc-menu-rail"
            aria-label="Build a menu with four recipes"
          >
            {[
              {
                name: "Lomo Saltado",
                image: food.menuLomo,
                lead: "Start with the dish you wanted.",
                copy: "The craving that brought you here.",
              },
              {
                name: "Ensalada de palta",
                image: food.menuSalad,
                lead: "Add something fresh.",
                copy: "A side can belong to the same meal without becoming another decision.",
              },
              {
                name: "Jugo de maracuyá",
                image: food.menuJuice,
                lead: "Bring the drink with it.",
                copy: "Everything on the table can live in the same menu.",
              },
              {
                name: "Salsa de ají",
                image: food.menuSalsa,
                lead: "Round it out your way.",
                copy: "A meal is more than its main dish.",
              },
            ].map((item, index) => (
              <article
                className={`lc-menu-card ${index === 0 ? "is-featured" : ""}`}
                key={item.name}
              >
                <div className="lc-menu-card-image">
                  <img
                    src={item.image}
                    alt={item.name}
                    width="960"
                    height="640"
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                </div>
                <div className="lc-menu-card-copy">
                  <h3>{item.name}</h3>
                  <p>
                    <strong>{item.lead}</strong>
                    <span>{item.copy}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <footer className="lc-menu-footer">
          <span className="lc-menu-rule" />
          <strong>ONE MENU. EVERYTHING THAT BELONGS TOGETHER.</strong>
          <span className="lc-menu-rule" />
          <small>
            4 recipes&nbsp; · &nbsp;1 menú&nbsp; · &nbsp;Economic and Easy
          </small>
        </footer>
      </section>

      <section
        className="lc-plan"
        id="your-week"
        aria-labelledby="lc-plan-title"
      >
        <div className="lc-plan-editorial">
          <header className="lc-plan-heading" data-lc-reveal>
            <h2 id="lc-plan-title">
              FROM ONE MENU TO
              <br />
              <em>YOUR WEEK.</em>
            </h2>
          </header>
          <div className="lc-plan-showcase" data-lc-reveal>
            <img
              src="/images/app/cookplan_showcase.png"
              alt="CookPilot CookPlan connecting meals across a week"
              width="1122"
              height="1402"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="lc-plan-copy" data-lc-reveal>
            <p>
              Start with <span>one complete menu</span>, then carry that same
              logic across <span>your week</span>. CookPilot keeps dishes,
              sides, drinks, timing and ingredients connected, so planning
              multiple days feels clear, cohesive and <span>ready to cook</span>
              .
            </p>
          </div>
        </div>
      </section>

      <section
        className="lc-shopping lc-wrap"
        id="your-list"
        aria-labelledby="lc-list-title"
      >
        <div className="lc-list-surface" data-lc-reveal>
          <header>
            <span className="lc-small-brand">
              Cook<span>Pilot</span>
            </span>
            <strong className="lc-list-total">
              S/ {cookListDemo.totalEstimatedPen.toFixed(2)}
            </strong>
          </header>
          <div
            className="lc-categories"
            role="tablist"
            aria-label="CookList categories"
          >
            {listTabs.map((item) => (
              <button
                key={item.name}
                role="tab"
                aria-selected={category === item.name}
                onClick={() => {
                  setCategory(item.name);
                  setFocusedIngredient(
                    item.name === "Todos"
                      ? "Tomate"
                      : cookListDemo.items[item.name][0].name,
                  );
                }}
              >
                {item.name} <span>{item.count}</span>
              </button>
            ))}
          </div>
          <div
            className="lc-ingredient-rows"
            role="tabpanel"
            aria-label={`${category} ingredients`}
          >
            {listItems.map((item) => (
              <button
                className={`lc-ingredient ${checked.includes(item.name) ? "is-done" : ""}`}
                key={item.name}
                role="checkbox"
                aria-checked={checked.includes(item.name)}
                onMouseEnter={() => setFocusedIngredient(item.name)}
                onFocus={() => setFocusedIngredient(item.name)}
                onClick={() =>
                  setChecked((old) =>
                    old.includes(item.name)
                      ? old.filter((name) => name !== item.name)
                      : [...old, item.name],
                  )
                }
              >
                <Check checked={checked.includes(item.name)} />
                <span className="lc-ingredient-copy">
                  <strong>{item.name}</strong>
                  <small>{item.referencePrice}</small>
                </span>
                <span className="lc-ingredient-amount">
                  <strong>{item.quantity}</strong>
                  <small>{item.estimatedCost}</small>
                </span>
              </button>
            ))}
          </div>
          <footer>
            <span>{cookListDemo.priceNote}</span>
          </footer>
        </div>
        <div className="lc-shopping-story" data-lc-reveal>
          <h2 id="lc-list-title">
            YOUR WEEK.
            <br />
            <em>ONE LIST.</em>
          </h2>
          <p className="lc-list-lead">
            <strong>
              Every meal you planned becomes one clear shopping list.
            </strong>{" "}
            CookPilot combines <span>shared ingredients</span>, keeps{" "}
            <span>quantities</span> visible, and shows exactly what{" "}
            <span>each recipe</span> adds to the total.
          </p>
          <div className="lc-list-sources">
            {cookListDemo.recipes.map((recipe) => (
              <div
                className={
                  selectedItem.sources.some((source) =>
                    source.startsWith(recipe.name),
                  )
                    ? "is-source"
                    : ""
                }
                key={recipe.name}
              >
                <Food src={recipe.image} name={recipe.name} />
                <strong>{recipe.name}</strong>
                <span>
                  {recipe.servings} serving · <b>{recipe.estimatedCost}</b>
                </span>
              </div>
            ))}
          </div>
          <div className="lc-origin" aria-live="polite">
            <span className="lc-meta">WHERE IT COMES FROM</span>
            <strong>
              {selectedItem.name} <span>{selectedItem.quantity}</span>
            </strong>
            <p>{selectedItem.sources.join(" + ")}</p>
          </div>
        </div>
      </section>

      <section
        className="lc-guided"
        id="stay-with-the-food"
        aria-labelledby="lc-cook-title"
      >
        <div className="lc-wrap lc-guided-grid">
          <div className="lc-guided-copy" data-lc-reveal>
            <h2 id="lc-cook-title">
              LESS IN YOUR HEAD.
              <br />
              <em>MORE ON YOUR PLATE.</em>
            </h2>
            <p>
              Follow each step with <strong>timing</strong>,{" "}
              <strong>guidance</strong> and the <strong>next move</strong>{" "}
              already in view. From <strong>prep to plating</strong>, CookPilot
              keeps the flow clear, fast and easy to follow — so your attention
              stays on the food, not on what comes next.
            </p>
            <div className="lc-guided-phone">
              <img
                src="/images/app/cookmode_iphone.png"
                alt="CookPilot guiding a recipe step by step on an iPhone"
                width="2832"
                height="5619"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="lc-guided-stage" data-lc-reveal>
            <button
              className="lc-guided-image-button"
              type="button"
              onClick={() =>
                setActiveCookingStep(
                  (current) => (current + 1) % cookingSteps.length,
                )
              }
              aria-label="Show the next cooking step"
            >
              <span className="lc-guided-image-frame">
                {cookingSteps.map((step, index) => (
                  <img
                    className={index === activeCookingStep ? "is-active" : ""}
                    key={step.image}
                    src={step.image}
                    alt=""
                    width="941"
                    height="1672"
                    aria-hidden="true"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ))}
              </span>
            </button>
            <div className="lc-guided-step" aria-live="polite">
              <div className="lc-guided-step-meta">
                <span>
                  {String(activeCookingStep + 1).padStart(2, "0")} / 05
                </span>
                <span>Click to continue</span>
              </div>
              <h3>{cookingSteps[activeCookingStep].title}</h3>
              <p>{cookingSteps[activeCookingStep].body}</p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="lc-keep lc-memory"
        id="keep-it"
        aria-labelledby="lc-keep-title"
      >
        <div className="lc-wrap">
          <header className="lc-memory-heading" data-lc-reveal>
            <h2 id="lc-keep-title">
              GOOD FOOD DESERVES
              <br />
              <em>A SECOND TIME.</em>
            </h2>
            <p>
              Save the dishes you want to come back to — and bring them into
              tonight’s meal, tomorrow’s plan, or next week’s table.
            </p>
          </header>

          <div className="lc-memory-gallery" data-lc-reveal>
            {savedRecipes.map((recipe, index) => {
              const isHero = index === 0;
              const isSaved = savedRecipeIds.includes(recipe.id);
              return (
                <article
                  className={`lc-memory-card ${
                    isHero ? "lc-memory-card--hero" : ""
                  } ${isSaved ? "is-saved" : ""}`}
                  key={recipe.id}
                >
                  <span className="lc-memory-card-image">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      width="1200"
                      height="1200"
                      loading={isHero ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <button
                      className="lc-memory-card-save"
                      type="button"
                      aria-label={`${isSaved ? "Remove" : "Save"} ${recipe.name}`}
                      aria-pressed={isSaved}
                      onClick={() => toggleSavedRecipe(recipe)}
                    >
                      <Bookmark filled={isSaved} />
                    </button>
                  </span>
                  <span className="lc-memory-card-copy">
                    <strong>{recipe.name}</strong>
                    <span>{recipe.descriptor}</span>
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div
        className={`lc-save-toast ${saveNotice ? "is-visible" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="lc-save-toast-check" aria-hidden="true">
          ✓
        </span>
        <span>{saveNotice?.message || "Saved."}</span>
      </div>

      <section
        className="lc-download"
        id="download"
        aria-labelledby="lc-download-title"
      >
        <div className="lc-wrap lc-download-inner">
          <div className="lc-download-copy" data-lc-reveal>
            <h2 id="lc-download-title">
              COOK WHAT YOU WANT.
              <br />
              <em>YOUR WAY.</em>
            </h2>
            <p>
              From cravings to a complete meal, CookPilot helps you plan, shop,
              and cook with more clarity.
            </p>
          </div>
          <div className="lc-download-avatar" data-lc-reveal>
            <img
              src="/images/cookpilot/thumbs_up.webp"
              alt="CookPilot giving a thumbs up"
              width="1280"
              height="1280"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="lc-stores" data-lc-reveal>
            <a href={links.play}>
              <img src="/icons/play-store.png" width="34" height="34" alt="" />
              <span>
                <small>GET IT ON</small>Google Play
              </span>
              <DownloadIcon />
            </a>
            <a href={links.huawei}>
              <img
                src="/icons/huawei-gallery.png"
                width="34"
                height="34"
                alt=""
              />
              <span>
                <small>EXPLORE IT ON</small>AppGallery
              </span>
              <DownloadIcon />
            </a>
          </div>
        </div>
      </section>

      <section
        className="lc-discovery"
        id="explore"
        aria-labelledby="lc-explore-title"
      >
        <header className="lc-wrap lc-explore-heading">
          <h2 id="lc-explore-title" data-lc-reveal>
            WHAT DO YOU
            <br />
            <em>WANT NEXT?</em>
          </h2>
          <a className="lc-explore-cta" href="https://cookpilot.pro/en/gallery">
            Explore all recipes
          </a>
        </header>
        <div
          className="lc-recipe-rail"
          ref={rail}
          tabIndex={0}
          aria-label="Explore eight CookPilot recipes"
          onKeyDown={(e) => {
            if (
              e.target === e.currentTarget &&
              ["ArrowLeft", "ArrowRight"].includes(e.key)
            ) {
              e.preventDefault();
              advanceRail(e.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          {discoveryRecipes.map((recipe, index) => (
            <button
              className="lc-recipe-card"
              key={recipe.title}
              type="button"
              ref={(element) => {
                discoveryCards.current[index] = element;
              }}
              aria-current={selectedDiscoveryIndex === index ? "true" : undefined}
              onClick={() => selectDiscovery(index)}
              onMouseEnter={() => setHoveredDiscoveryIndex(index)}
              onMouseLeave={() => setHoveredDiscoveryIndex(null)}
              onFocus={() => setHoveredDiscoveryIndex(index)}
              onBlur={() => setHoveredDiscoveryIndex(null)}
            >
              <img
                src={recipe.image}
                alt={recipe.title}
                width="420"
                height="520"
                loading="lazy"
              />
              <div>
                <span className="lc-meta">{recipe.eyebrow}</span>
                <h3>{recipe.title}</h3>
              </div>
            </button>
          ))}
        </div>
        <div className="lc-wrap lc-discovery-bottom">
          <p className="lc-discovery-description" key={displayedDiscovery.title}>
            {displayedDiscovery.description}
          </p>
          <div className="lc-rail-controls">
            <button
              type="button"
              aria-label="Previous recipe"
              disabled={selectedDiscoveryIndex === 0}
              onClick={() => advanceRail(-1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next recipe"
              disabled={selectedDiscoveryIndex === discoveryRecipes.length - 1}
              onClick={() => advanceRail(1)}
            >
              →
            </button>
          </div>
        </div>
      </section>

      <section
        className="lc-pro lc-wrap"
        id="go-pro"
        aria-labelledby="lc-pro-title"
      >
        <div className="lc-pro-panel" data-plan={proPlan}>
          <header className="lc-pro-header" data-lc-reveal>
            <h2 id="lc-pro-title">
              GO FURTHER
              <br />
              <em>WITH PRO.</em>
            </h2>
            <div className="lc-pro-controls">
              {/* Localized English pricing will use $7.5 when locales are added. */}
              <div className="lc-pro-price" aria-label="a solo S/ 25">
                <span className="lc-pro-price-intro">a solo</span>
                <span className="lc-pro-price-currency">S/</span>
                <span className="lc-pro-price-amount">25</span>
              </div>
            <div className="lc-pro-switch" role="group" aria-label="Compare plans">
              <button
                type="button"
                className={proPlan === "free" ? "is-active" : ""}
                aria-pressed={proPlan === "free"}
                onClick={() => setProPlan("free")}
              >
                FREE
              </button>
              <button
                type="button"
                className={proPlan === "pro" ? "is-active" : ""}
                aria-pressed={proPlan === "pro"}
                onClick={() => setProPlan("pro")}
              >
                PRO
              </button>
            </div>
            </div>
          </header>
          <div className="lc-pro-cards">
            {proBenefits.map((benefit) => {
              const activeBenefit =
                proPlan === "free" && benefit.free ? benefit.free : benefit.pro;
              const isDimmed = proPlan === "free" && !benefit.free;
              const isReduced = proPlan === "free" && Boolean(benefit.free);

              return (
                <article
                  className={`lc-pro-card is-${benefit.id}${isDimmed ? " is-dimmed" : ""}${isReduced ? " is-reduced" : ""}`}
                  key={benefit.id}
                >
                  <div className="lc-pro-card-copy" key={`${proPlan}-${benefit.id}`}>
                    <h3 className="lc-pro-claim">
                      <span
                        className={
                          activeBenefit.highlight === "first"
                            ? "lc-pro-highlight"
                            : ""
                        }
                      >
                        {activeBenefit.firstLine}
                      </span>
                      <span
                        className={
                          activeBenefit.highlight === "second"
                            ? "lc-pro-highlight"
                            : ""
                        }
                      >
                        {activeBenefit.secondLine}
                      </span>
                    </h3>
                    <p>{activeBenefit.subtitle}</p>
                  </div>
                  <img
                    className="lc-pro-icon"
                    src={benefit.icon}
                    alt=""
                    width="640"
                    height="640"
                    loading="lazy"
                    decoding="async"
                  />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer
        className="lc-footer"
      >
        <HeroAtmosphere variant="footer" />
        <div className="lc-wordmark-stage">
          <div className="lc-wordmark" aria-label="CookPilot">
            <span className="lc-wordmark-cook" aria-hidden="true">Cook</span><span className="lc-wordmark-pilot" aria-hidden="true">Pilot</span>
          </div>
        </div>
        <div className="lc-footer-content lc-wrap">
        <div className="lc-footer-close">
          <p>From craving to plate.<br /><span>Your way.</span></p>
          <a className="lc-footer-download" href="#download">Download CookPilot <DownloadIcon /></a>
        </div>
        <div className="lc-footer-middle">
          <nav aria-label="Footer navigation">
            <a href="https://cookpilot.pro/en/how-it-works">Product</a>
            <a href="https://cookpilot.pro/en/guides">Guides</a>
            <a href="https://cookpilot.pro/privacy-and-terms">
              Privacy & Terms
            </a>
            <a href="https://www.linkedin.com/company/cookpilot/">
              LinkedIn <Arrow />
            </a>
          </nav>
        </div>
        <div className="lc-footer-bottom">
          <span>EST. IN PERU · MADE FOR YOU</span>
          <span>© {new Date().getFullYear()} CookPilot</span>
          <a className="lc-footer-top" href="#top">Back to top <span aria-hidden="true">↑</span></a>
        </div>
        </div>
      </footer>
    </div>
  );
}
