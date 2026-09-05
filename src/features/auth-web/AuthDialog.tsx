"use client";

import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { ContinuationAction } from "@/lib/auth/continuation";
import type { AppLocale } from "@/shared/config/routes";
import type { CookShareObjectType } from "@/lib/cookshare/types";
import styles from "./AuthDialog.module.css";

export interface AuthContinuationInput {
  locale: AppLocale;
  objectType: CookShareObjectType;
  handle?: string | null;
  slug: string;
  action?: ContinuationAction;
}

interface AuthDialogProps {
  continuation?: AuthContinuationInput;
  label: string;
  locale?: AppLocale;
}

async function preserveContinuation(continuation?: AuthContinuationInput) {
  if (!continuation) return true;
  const response = await fetch("/api/auth/continuation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(continuation),
  });
  return response.ok;
}

export default function AuthDialog({ continuation, label, locale = "es" }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      if (!(await preserveContinuation(continuation))) throw new Error("continuation");
      const { error } = await supabaseBrowser.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setMessage(locale === "es" ? "Revisa tu correo para continuar." : "Check your email to continue.");
    } catch {
      setMessage(locale === "es" ? "No pudimos iniciar el acceso. Inténtalo de nuevo." : "We could not start sign-in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    setMessage(null);
    try {
      if (!(await preserveContinuation(continuation))) throw new Error("continuation");
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setMessage(locale === "es" ? "No pudimos iniciar el acceso. Inténtalo de nuevo." : "We could not start sign-in. Try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>{label}</button>
      {open ? (
        <div className={styles.backdrop} role="presentation" onMouseDown={() => setOpen(false)}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
            <p className="cp-eyebrow">CookPilot</p>
            <h2 id="auth-title">{locale === "es" ? "Continúa con tu cocina" : "Keep cooking with CookPilot"}</h2>
            <p className={styles.copy}>{locale === "es" ? "Accede para conservar tu receta y retomar cualquier acción en CookPilot." : "Sign in to keep your recipe and resume any CookPilot action."}</p>
            <button type="button" className={styles.google} onClick={signInWithGoogle} disabled={busy}>{locale === "es" ? "Continuar con Google" : "Continue with Google"}</button>
            <div className={styles.divider}><span>{locale === "es" ? "o con correo" : "or with email"}</span></div>
            <form onSubmit={submitEmail} className={styles.form}>
              <label htmlFor="auth-email">{locale === "es" ? "Correo electrónico" : "Email address"}</label>
              <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" />
              <button type="submit" className="cp-btn cp-btn--primary" disabled={busy}>{busy ? (locale === "es" ? "Enviando…" : "Sending…") : (locale === "es" ? "Enviar enlace" : "Send link")}</button>
            </form>
            {message ? <p className={styles.message} role="status">{message}</p> : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
