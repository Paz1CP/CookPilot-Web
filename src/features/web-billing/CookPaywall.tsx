"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Purchases, type Offering, type Package } from "@revenuecat/purchases-js";
import { publicRevenueCatConfig } from "@/lib/supabase/public-config";
import styles from "./CookPaywall.module.css";

interface CookPaywallProps {
  locale: "es" | "en";
  context: string;
  appUserId?: string | null;
  onUnlocked?: () => void;
}

function formatPackage(packageInfo: Package, locale: "es" | "en") {
  const product = packageInfo.webBillingProduct;
  const period = product.period?.unit === "month" ? (locale === "es" ? "mes" : "month") : product.period?.unit === "year" ? (locale === "es" ? "año" : "year") : "";
  return period ? `${product.price.formattedPrice} / ${period}` : product.price.formattedPrice;
}

export default function CookPaywall({ locale, context, appUserId, onUnlocked }: CookPaywallProps) {
  const router = useRouter();
  const [offering, setOffering] = useState<Offering | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadOffering = async () => {
    if (!publicRevenueCatConfig.publicKey || !appUserId) {
      setMessage(locale === "es" ? "Inicia sesión para ver los planes." : "Sign in to see the plans.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const purchases = Purchases.isConfigured()
        ? Purchases.getSharedInstance()
        : Purchases.configure({ apiKey: publicRevenueCatConfig.publicKey, appUserId });
      const offerings = await purchases.getOfferings({ offeringIdentifier: publicRevenueCatConfig.offeringId });
      const selected = offerings.all[publicRevenueCatConfig.offeringId] ?? offerings.current;
      setOffering(selected ?? null);
      if (selected) purchases.trackCustomPaywallImpression({ offering: selected });
      if (!selected) setMessage(locale === "es" ? "No hay planes disponibles ahora." : "No plans are available right now.");
    } catch {
      setMessage(locale === "es" ? "No pudimos cargar los planes." : "We could not load the plans.");
    } finally {
      setLoading(false);
    }
  };

  const purchase = async (packageInfo: Package) => {
    setPurchasing(packageInfo.identifier);
    setMessage(null);
    try {
      const purchases = Purchases.getSharedInstance();
      await purchases.purchase({ rcPackage: packageInfo, selectedLocale: locale, skipSuccessPage: false });
      const entitlementResponse = await fetch("/api/entitlement", { cache: "no-store" });
      const entitlement = await entitlementResponse.json() as { tier?: string };
      if (entitlement.tier === "pro") {
        setMessage(locale === "es" ? "Pro está activo. Actualizando tu receta…" : "Pro is active. Updating your recipe…");
        onUnlocked?.();
        router.refresh();
      } else {
        setMessage(locale === "es" ? "Estamos confirmando tu acceso. Vuelve a intentarlo en unos segundos." : "We are confirming your access. Try again in a few seconds.");
      }
    } catch {
      setMessage(locale === "es" ? "La compra no se completó." : "The purchase was not completed.");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <aside className={styles.card} aria-label={locale === "es" ? "Desbloquear Pro" : "Unlock Pro"}>
      <span className="cp-eyebrow">CookPilot Pro</span>
      <h3>{locale === "es" ? "Cocina la receta completa" : "Cook the complete recipe"}</h3>
      <p>{locale === "es" ? `Desbloquea ${context} con ingredientes y pasos completos, manteniendo todo en tu cuenta CookPilot.` : `Unlock ${context} with complete ingredients and steps, connected to your CookPilot account.`}</p>
      {!offering ? (
        <button type="button" className="cp-btn cp-btn--primary" onClick={loadOffering} disabled={loading}>
          {loading ? (locale === "es" ? "Cargando…" : "Loading…") : (locale === "es" ? "Ver planes" : "See plans")}
        </button>
      ) : (
        <div className={styles.packages}>
          {offering.availablePackages.map((packageInfo) => (
            <button key={packageInfo.identifier} type="button" className={styles.package} onClick={() => purchase(packageInfo)} disabled={Boolean(purchasing)}>
              <span>{packageInfo.packageType.includes("annual") ? (locale === "es" ? "Anual" : "Annual") : packageInfo.packageType.includes("monthly") ? (locale === "es" ? "Mensual" : "Monthly") : packageInfo.identifier}</span>
              <strong>{purchasing === packageInfo.identifier ? "…" : formatPackage(packageInfo, locale)}</strong>
            </button>
          ))}
        </div>
      )}
      {message ? <small className={styles.message} role="status">{message}</small> : null}
    </aside>
  );
}
