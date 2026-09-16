import type { AppLocale } from "@/shared/config/routes";

type DisplayQuantity = { quantity: number; unit: string };

const GRAMS_PER_OUNCE = 28.349523125;
const GRAMS_PER_POUND = 453.59237;
const ML_PER_TSP = 4.92892159375;
const ML_PER_TBSP = 14.78676478125;
const ML_PER_FL_OZ = 29.5735295625;
const ML_PER_CUP = 240;

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

export function normalizeCookShareUnit(value: unknown): string {
  const normalized = typeof value === "string"
    ? value.trim().toLowerCase().replace(/[-\s]+/g, "_")
    : "";
  switch (normalized) {
    case "gram":
    case "grams":
    case "gr":
    case "grs":
    case "g":
      return "g";
    case "kilogram":
    case "kilograms":
    case "kilo":
    case "kilos":
    case "kg":
      return "kg";
    case "milliliter":
    case "milliliters":
    case "ml":
      return "ml";
    case "liter":
    case "liters":
    case "lt":
    case "l":
      return "l";
    case "unit":
    case "units":
    case "ud":
    case "und":
    case "u":
    case "un":
    case "unidad":
    case "unidades":
    case "piece":
    case "pieces":
      return "unit";
    case "ounce":
    case "ounces":
    case "oz":
      return "oz";
    case "pound":
    case "pounds":
    case "lb":
    case "lbs":
      return "lb";
    case "teaspoon":
    case "teaspoons":
    case "tsp":
    case "cdta":
    case "cdta.":
    case "cucharadita":
    case "cucharaditas":
      return "tsp";
    case "tablespoon":
    case "tablespoons":
    case "tbsp":
    case "tbs":
    case "cda":
    case "cda.":
    case "cucharada":
    case "cucharadas":
      return "tbsp";
    case "fluid_ounce":
    case "fluid_ounces":
    case "fl_ounce":
    case "fl_ounces":
    case "fl_oz":
    case "floz":
      return "fl_oz";
    case "cup":
    case "cups":
    case "cup_us":
    case "c":
    case "taza":
    case "tazas":
      return "cup";
    default:
      return normalized;
  }
}

function toMetric(quantity: number, unit: string): DisplayQuantity {
  switch (unit) {
    case "g":
      return Math.abs(quantity) >= 1000 ? { quantity: quantity / 1000, unit: "kg" } : { quantity, unit };
    case "kg":
      return { quantity, unit };
    case "oz":
      return toMetric(quantity * GRAMS_PER_OUNCE, "g");
    case "lb":
      return toMetric(quantity * GRAMS_PER_POUND, "g");
    case "ml":
      return Math.abs(quantity) >= 1000 ? { quantity: quantity / 1000, unit: "l" } : { quantity, unit };
    case "l":
      return { quantity, unit };
    case "tsp":
      return toMetric(quantity * ML_PER_TSP, "ml");
    case "tbsp":
      return toMetric(quantity * ML_PER_TBSP, "ml");
    case "fl_oz":
      return toMetric(quantity * ML_PER_FL_OZ, "ml");
    case "cup":
      return toMetric(quantity * ML_PER_CUP, "ml");
    default:
      return { quantity, unit };
  }
}

function formatNumber(value: number, locale: AppLocale): string {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  if (Object.is(rounded, -0)) return "0";
  return new Intl.NumberFormat(locale === "es" ? "es-PE" : "en-US", {
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(rounded);
}

export function formatCookShareQuantity(
  quantity: unknown,
  unit: unknown,
  locale: AppLocale,
): string {
  const numeric = finiteNumber(quantity);
  if (numeric === null || !Number.isFinite(numeric)) return "";
  const normalizedUnit = normalizeCookShareUnit(unit);
  if (!normalizedUnit) return formatNumber(numeric, locale);
  const metric = toMetric(numeric, normalizedUnit);
  const number = formatNumber(metric.quantity, locale);
  if (metric.unit === "unit") {
    if (locale === "es") return `${number} ${Math.abs(metric.quantity) === 1 ? "unidad" : "unidades"}`;
    return `${number} ${Math.abs(metric.quantity) === 1 ? "unit" : "units"}`;
  }
  const labels: Record<string, string> = {
    g: "g",
    kg: "kg",
    ml: "ml",
    l: "l",
  };
  return `${number} ${labels[metric.unit] ?? metric.unit.replace(/_/g, " ")}`.trim();
}
