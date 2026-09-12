// Read-only public recipe snapshot, verified 2026-09-11. Quantities are for four
// servings, not the illustrative ingredient amounts used by THE FILM.
// Sources: https://cookpilot.pro/en/recipes/{lomo-saltado,ensalada-de-palta}
export const food = {
  lomo: "/images/food/cutouts/lomo_saltado.png",
  salad: "/images/food/cutouts/ensalada_de_palta.png",
  juice: "/images/food/jugo_maracuya.png",
  menuLomo: "/images/food/lomo_saltado.webp",
  menuSalad: "/images/food/ensalada_palta.webp",
  menuSalsa: "/images/food/aji_de_polleria.webp",
  menuJuice: "/images/food/jugo_maracuya.png",
  aji: "/images/food/cutouts/aji_de_gallina.png",
  papa: "/images/food/cutouts/papa_huancaina.png",
  oats: "/images/food/avena_con_leche.png",
  prep: "/images/cook-film/lomo_prep_panorama.png",
};

export type RecipeId = "lomo" | "salad";
export type Ingredient = {
  id: string;
  name: string;
  category: "Produce" | "Protein" | "Pantry";
  unit: "g" | "ml";
  lomo: number;
  salad: number;
};
export const ingredients: Ingredient[] = [
  {
    id: "tomato",
    name: "Tomato",
    category: "Produce",
    unit: "g",
    lomo: 250,
    salad: 220,
  },
  {
    id: "onion",
    name: "Red onion",
    category: "Produce",
    unit: "g",
    lomo: 250,
    salad: 60,
  },
  {
    id: "potato",
    name: "White potato",
    category: "Produce",
    unit: "g",
    lomo: 700,
    salad: 0,
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "Produce",
    unit: "g",
    lomo: 0,
    salad: 360,
  },
  {
    id: "chili",
    name: "Yellow chili",
    category: "Produce",
    unit: "g",
    lomo: 35,
    salad: 0,
  },
  {
    id: "cilantro",
    name: "Cilantro",
    category: "Produce",
    unit: "g",
    lomo: 8,
    salad: 6,
  },
  {
    id: "beef",
    name: "Beef steak",
    category: "Protein",
    unit: "g",
    lomo: 600,
    salad: 0,
  },
  {
    id: "rice",
    name: "Cooked white rice",
    category: "Pantry",
    unit: "g",
    lomo: 600,
    salad: 0,
  },
  {
    id: "vegetable-oil",
    name: "Vegetable oil",
    category: "Pantry",
    unit: "ml",
    lomo: 500,
    salad: 0,
  },
  {
    id: "olive-oil",
    name: "Virgin olive oil",
    category: "Pantry",
    unit: "ml",
    lomo: 0,
    salad: 15,
  },
  {
    id: "soy",
    name: "Soy sauce",
    category: "Pantry",
    unit: "ml",
    lomo: 50,
    salad: 0,
  },
  {
    id: "vinegar",
    name: "Red wine vinegar",
    category: "Pantry",
    unit: "ml",
    lomo: 35,
    salad: 0,
  },
  {
    id: "lemon",
    name: "Lemon juice",
    category: "Pantry",
    unit: "ml",
    lomo: 0,
    salad: 30,
  },
  {
    id: "garlic",
    name: "Ground garlic",
    category: "Pantry",
    unit: "g",
    lomo: 10,
    salad: 0,
  },
  {
    id: "salt",
    name: "Table salt",
    category: "Pantry",
    unit: "g",
    lomo: 4,
    salad: 3,
  },
  {
    id: "pepper",
    name: "Black pepper",
    category: "Pantry",
    unit: "g",
    lomo: 2,
    salad: 0.5,
  },
  {
    id: "cumin",
    name: "Ground cumin",
    category: "Pantry",
    unit: "g",
    lomo: 1.5,
    salad: 0,
  },
];

export function ingredientAmount(
  item: Ingredient,
  portions: Record<RecipeId, number>,
  includeSalad: boolean,
) {
  const lomo = (item.lomo * portions.lomo) / 4;
  const salad = includeSalad ? (item.salad * portions.salad) / 4 : 0;
  return { lomo, salad, total: lomo + salad };
}
export function formatAmount(amount: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(
    amount,
  );
}

export const days = [
  { short: "Wed", name: "Wednesday", date: 15, dinner: "aji" },
  { short: "Thu", name: "Thursday", date: 16, dinner: "papa" },
  { short: "Fri", name: "Friday", date: 17, dinner: "aji" },
  { short: "Sat", name: "Saturday", date: 18, dinner: "papa" },
  { short: "Sun", name: "Sunday", date: 19, dinner: "aji" },
  { short: "Mon", name: "Monday", date: 20, dinner: "papa" },
  { short: "Tue", name: "Tuesday", date: 21, dinner: "aji" },
] as const;

// Official public cover images and destination identities, not lookalike assets.
const media = "https://media.cookpilot.pro/recipes/images/oficial_images/";
export const discoveries = [
  {
    name: "Ceviche",
    category: "Fresh from Peru",
    slug: "ceviche-pescado-peruano-acurio",
    image: media + "ceviche_pescado_peruano_acurio.webp",
  },
  {
    name: "Estofado de pollo",
    category: "A taste of home",
    slug: "estofado-de-pollo",
    image: media + "estofado_de_pollo.webp",
  },
  {
    name: "Ensalada de palta",
    category: "Something fresh",
    slug: "ensalada-de-palta",
    image: media + "ensalada_de_palta.webp",
  },
  {
    name: "Pollo a la brasa",
    category: "Made to share",
    slug: "pollo-a-la-brasa",
    image: media + "pollo_a_la_brasa.webp",
  },
  {
    name: "Choclo con queso",
    category: "Beautifully simple",
    slug: "choclo-con-queso",
    image: media + "choclo_con_queso.webp",
  },
  {
    name: "Picarones",
    category: "Save room for sweet",
    slug: "picarones",
    image: media + "picarones.webp",
  },
  {
    name: "Chicha morada",
    category: "Pour something good",
    slug: "chicha-morada",
    image: media + "chicha_morada.webp",
  },
  {
    name: "Queso helado",
    category: "From Arequipa, with love",
    slug: "queso-helado",
    image: media + "queso_helado.webp",
  },
];

export const links = {
  play: "https://play.google.com/store/apps/details?id=com.cookpilot.pe",
  huawei: "https://appgallery.cloud.huawei.com/ag/n/app/C118044413",
  pro: "https://cookpilot.pro/en/pro",
};

// Deliberate demo snapshot for the CookList section. Keep this data separate
// from the illustrative recipe controls above: the UI must render these exact
// names, units, costs, and source contributions.
export const cookListDemo = {
  totalEstimatedPen: 12.52,
  totalUniqueIngredients: 26,
  priceNote: "*References prices for Peru",
  initialCategory: "Verduras",
  recipes: [
    {
      name: "Lomo Saltado",
      servings: 1,
      image: food.lomo,
      estimatedCost: "S/ 9.07",
    },
    {
      name: "Ensalada de palta",
      servings: 1,
      image: food.salad,
      estimatedCost: "S/ 1.70",
    },
    {
      name: "Refresco de Maracuyá",
      servings: 1,
      image: food.juice,
      estimatedCost: "S/ 0.78",
    },
    {
      name: "Ají de Pollería",
      servings: 1,
      image: food.menuSalsa,
      estimatedCost: "S/ 0.97",
    },
  ],
  categories: [
    { name: "Verduras", count: 7, subtotal: 1.8 },
    { name: "Carnes", count: 1, subtotal: 5.89 },
    { name: "Cereales", count: 1, subtotal: 0.23 },
    { name: "Tubérculos", count: 1, subtotal: 0.53 },
    { name: "Frutas", count: 3, subtotal: 1.36 },
    { name: "Grasas", count: 2, subtotal: 1.43 },
    { name: "Lácteos", count: 1, subtotal: 0.15 },
    { name: "Bebidas", count: 2, subtotal: 0.42 },
    { name: "Azucarados", count: 1, subtotal: 0.06 },
    { name: "Misceláneos", count: 7, subtotal: 0.65 },
  ],
  items: {
    Verduras: [
      {
        name: "Ají Amarillo",
        quantity: "38.8 g",
        referencePrice: "S/ 1.44 · por 100 g",
        estimatedCost: "S/ 0.56",
        sources: ["Ají de Pollería 30 g", "Lomo Saltado 8.8 g"],
      },
      {
        name: "Ajo",
        quantity: "0.8 g",
        referencePrice: "S/ 1.75 · por 100 g",
        estimatedCost: "S/ 0.01",
        sources: ["Ají de Pollería"],
      },
      {
        name: "Cebolla Morada",
        quantity: "77.5 g",
        referencePrice: "S/ 0.37 · por 100 g",
        estimatedCost: "S/ 0.29",
        sources: ["Ensalada de palta 15 g", "Lomo Saltado 62.5 g"],
      },
      {
        name: "Culantro",
        quantity: "3.5 g",
        referencePrice: "S/ 3.32 · por 100 g",
        estimatedCost: "S/ 0.12",
        sources: ["Ensalada de palta 1.5 g", "Lomo Saltado 2 g"],
      },
      {
        name: "Huacatay",
        quantity: "1.5 g",
        referencePrice: "S/ 5.98 · por 100 g",
        estimatedCost: "S/ 0.09",
        sources: ["Ají de Pollería"],
      },
      {
        name: "Orégano Seco",
        quantity: "0.2 g",
        referencePrice: "S/ 27.29 · por 100 g",
        estimatedCost: "S/ 0.05",
        sources: ["Ají de Pollería"],
      },
      {
        name: "Tomate",
        quantity: "117.5 g",
        referencePrice: "S/ 0.58 · por 100 g",
        estimatedCost: "S/ 0.69",
        sources: ["Ensalada de palta 55 g", "Lomo Saltado 62.5 g"],
      },
    ],
    Carnes: [
      {
        name: "Bistec de Res",
        quantity: "150 g",
        referencePrice: "S/ 3.93 · por 100 g",
        estimatedCost: "S/ 5.89",
        sources: ["Lomo Saltado"],
      },
    ],
    Cereales: [
      {
        name: "Arroz Blanco Cocido",
        quantity: "150 g",
        referencePrice: "S/ 0.15 · por 100 g",
        estimatedCost: "S/ 0.23",
        sources: ["Lomo Saltado"],
      },
    ],
    Tubérculos: [
      {
        name: "Papa Blanca",
        quantity: "175 g",
        referencePrice: "S/ 0.30 · por 100 g",
        estimatedCost: "S/ 0.53",
        sources: ["Lomo Saltado"],
      },
    ],
    Frutas: [
      {
        name: "Palta",
        quantity: "90 g",
        referencePrice: "S/ 1.44 · por unidad",
        estimatedCost: "S/ 0.72",
        sources: ["Ensalada de palta"],
      },
      {
        name: "Maracuyá",
        quantity: "80 g",
        referencePrice: "S/ 0.90 · por unidad",
        estimatedCost: "S/ 0.43",
        sources: ["Refresco de Maracuyá"],
      },
      {
        name: "Jugo de Limón",
        quantity: "7.5 ml",
        referencePrice: "S/ 2.75 · por 100 ml",
        estimatedCost: "S/ 0.21",
        sources: ["Ensalada de palta"],
      },
    ],
    Grasas: [
      {
        name: "Aceite Vegetal",
        quantity: "130.6 ml",
        referencePrice: "S/ 0.86 · por 100 ml",
        estimatedCost: "S/ 1.12",
        sources: ["Ají de Pollería 5.6 ml", "Lomo Saltado 125 ml"],
      },
      {
        name: "Aceite de Oliva Virgen",
        quantity: "3.8 ml",
        referencePrice: "S/ 8.25 · por 100 ml",
        estimatedCost: "S/ 0.31",
        sources: ["Ensalada de palta"],
      },
    ],
    Lácteos: [
      {
        name: "Leche Evaporada Entera",
        quantity: "15 ml",
        referencePrice: "S/ 1.03 · por 100 ml",
        estimatedCost: "S/ 0.15",
        sources: ["Ají de Pollería"],
      },
    ],
    Bebidas: [
      {
        name: "Agua",
        quantity: "337.5 ml",
        referencePrice: "S/ 0.10 · por 100 ml",
        estimatedCost: "S/ 0.35",
        sources: ["Ají de Pollería 112.5 ml", "Refresco de Maracuyá 225 ml"],
      },
      {
        name: "Hielo",
        quantity: "30 g",
        referencePrice: "S/ 0.21 · por 100 g",
        estimatedCost: "S/ 0.06",
        sources: ["Refresco de Maracuyá"],
      },
    ],
    Azucarados: [
      {
        name: "Azúcar Blanca",
        quantity: "13.8 g",
        referencePrice: "S/ 0.47 · por 100 g",
        estimatedCost: "S/ 0.06",
        sources: ["Refresco de Maracuyá"],
      },
    ],
    Misceláneos: [
      {
        name: "Ajo Molido",
        quantity: "2.5 g",
        referencePrice: "S/ 4.29 · por 100 g",
        estimatedCost: "S/ 0.11",
        sources: ["Lomo Saltado"],
      },
      {
        name: "Comino Molido",
        quantity: "0.4 g",
        referencePrice: "S/ 16.40 · por 100 g",
        estimatedCost: "S/ 0.06",
        sources: ["Lomo Saltado"],
      },
      {
        name: "Mostaza",
        quantity: "1.5 g",
        referencePrice: "S/ 2.80 · por 100 g",
        estimatedCost: "S/ 0.04",
        sources: ["Ají de Pollería"],
      },
      {
        name: "Pimienta Negra Molida",
        quantity: "0.7 g",
        referencePrice: "S/ 24.69 · por 100 g",
        estimatedCost: "S/ 0.17",
        sources: [
          "Ají de Pollería 0.08 g",
          "Ensalada de palta 0.13 g",
          "Lomo Saltado 0.5 g",
        ],
      },
      {
        name: "Sal de Mesa",
        quantity: "2.5 g",
        referencePrice: "S/ 0.26 · por 100 g",
        estimatedCost: "S/ 0.01",
        sources: [
          "Ají de Pollería 0.75 g",
          "Ensalada de palta 0.75 g",
          "Lomo Saltado 1 g",
        ],
      },
      {
        name: "Salsa de Soya",
        quantity: "12.5 ml",
        referencePrice: "S/ 1.76 · por 100 ml",
        estimatedCost: "S/ 0.22",
        sources: ["Lomo Saltado"],
      },
      {
        name: "Vinagre Tinto",
        quantity: "8.8 ml",
        referencePrice: "S/ 0.44 · por 100 ml",
        estimatedCost: "S/ 0.04",
        sources: ["Lomo Saltado"],
      },
    ],
  },
} as const;
