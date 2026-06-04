"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  InfoCircle,
  Lock,
  MessageText,
  ReceiptText,
  ShieldTick,
  Trash,
} from "iconsax-reactjs";
import {
  deleteCookPilotAccount,
  requestAccountDeletionOtp,
  verifyAccountDeletionOtp,
  type AccountDeletionLocale,
} from "@/lib/accountDeletion";
import styles from "./DeleteAccountPage.module.css";

type Step = "email" | "otp" | "confirm" | "success";

const copy = {
  en: {
    languageName: "English",
    otherLanguageName: "Español",
    eyebrow: "Self-serve account deletion",
    title: "Delete account",
    intro:
      "Use this page to request and confirm permanent deletion of your CookPilot account. You do not need to reinstall or open the mobile app.",
    modalIntro:
      "Verify your email, enter the one-time code, and confirm the exact phrase before deletion starts.",
    inlineTitle: "Delete your CookPilot account",
    inlineLead:
      "This visible form remains available on the page even if the modal does not open.",
    permanentTitle: "What gets deleted",
    permanentBody:
      "Deleting your account permanently deletes CookPilot account data, including profile, recipes, shopping lists, menus, CookMode sessions, uploaded files, generated images, AI history, preferences, packs, and usage data.",
    subscriptionsTitle: "Subscriptions",
    subscriptionsBody:
      "Deleting your CookPilot account may not automatically cancel subscriptions managed by Google Play, Apple App Store, or Huawei AppGallery.",
    retentionTitle: "Limited retention",
    retentionBody:
      "Limited technical or transaction-related information may be retained for up to 30 days for security, fraud prevention, legal compliance, dispute resolution, or completion of the deletion process.",
    emailLabel: "CookPilot account email",
    emailPlaceholder: "you@example.com",
    sendCode: "Send verification code",
    resendCode: "Send another code",
    otpLabel: "Verification code",
    otpPlaceholder: "6-digit code",
    verifyCode: "Verify code",
    confirmLabel: "Final confirmation",
    confirmHelp: "Type this phrase exactly:",
    confirmationPhrase: "Delete my account",
    deleteButton: "Delete my account permanently",
    successTitle: "Your CookPilot account has been deleted.",
    successBody:
      "The verified account deletion request completed successfully. Any retained technical or transaction-related records follow the limited retention policy above.",
    genericOtpMessage: "If an account exists for this email, we sent a verification code.",
    invalidEmail: "Enter a valid email address.",
    invalidOtp: "Enter the verification code from your email.",
    wrongOtp: "The code is wrong or expired. Check your email and try again.",
    networkError: "Network error. Please check your connection and try again.",
    deleteFailed: "Account deletion failed. Please try again.",
    userNotFound: "We could not verify an active CookPilot account for this session.",
    cooldown: "Please wait before requesting another code.",
    close: "Close",
    openModal: "Open delete account modal",
    step: "Step",
    emailStep: "Email",
    otpStep: "Code",
    finalStep: "Confirm",
  },
  es: {
    languageName: "Español",
    otherLanguageName: "English",
    eyebrow: "Eliminación de cuenta autoservicio",
    title: "Eliminar cuenta",
    intro:
      "Usa esta página para solicitar y confirmar la eliminación permanente de tu cuenta de CookPilot. No necesitas reinstalar ni abrir la app móvil.",
    modalIntro:
      "Verifica tu correo, ingresa el código de un solo uso y confirma la frase exacta antes de iniciar la eliminación.",
    inlineTitle: "Elimina tu cuenta de CookPilot",
    inlineLead:
      "Este formulario visible permanece disponible en la página incluso si el modal no se abre.",
    permanentTitle: "Qué se elimina",
    permanentBody:
      "Eliminar tu cuenta borra permanentemente los datos de cuenta de CookPilot, incluidos perfil, recetas, listas de compras, menús, sesiones de CookMode, archivos subidos, imágenes generadas, historial de AI, preferencias, packs y datos de uso.",
    subscriptionsTitle: "Suscripciones",
    subscriptionsBody:
      "Eliminar tu cuenta de CookPilot puede no cancelar automáticamente suscripciones administradas por Google Play, Apple App Store o Huawei AppGallery.",
    retentionTitle: "Retención limitada",
    retentionBody:
      "Información técnica o relacionada con transacciones puede conservarse hasta por 30 días por seguridad, prevención de fraude, cumplimiento legal, resolución de disputas o finalización del proceso de eliminación.",
    emailLabel: "Correo de tu cuenta CookPilot",
    emailPlaceholder: "tu@correo.com",
    sendCode: "Enviar código de verificación",
    resendCode: "Enviar otro código",
    otpLabel: "Código de verificación",
    otpPlaceholder: "Código de 6 dígitos",
    verifyCode: "Verificar código",
    confirmLabel: "Confirmación final",
    confirmHelp: "Escribe esta frase exactamente:",
    confirmationPhrase: "Eliminar mi cuenta",
    deleteButton: "Eliminar mi cuenta permanentemente",
    successTitle: "Tu cuenta de CookPilot ha sido eliminada.",
    successBody:
      "La solicitud verificada de eliminación de cuenta se completó correctamente. Cualquier registro técnico o transaccional retenido sigue la política de retención limitada indicada arriba.",
    genericOtpMessage:
      "Si existe una cuenta asociada a este correo, enviamos un código de verificación.",
    invalidEmail: "Ingresa un correo válido.",
    invalidOtp: "Ingresa el código de verificación enviado a tu correo.",
    wrongOtp: "El código es incorrecto o expiró. Revisa tu correo e inténtalo otra vez.",
    networkError: "Error de red. Revisa tu conexión e inténtalo otra vez.",
    deleteFailed: "La eliminación de cuenta falló. Inténtalo nuevamente.",
    userNotFound: "No pudimos verificar una cuenta activa de CookPilot para esta sesión.",
    cooldown: "Espera antes de solicitar otro código.",
    close: "Cerrar",
    openModal: "Abrir modal para eliminar cuenta",
    step: "Paso",
    emailStep: "Correo",
    otpStep: "Código",
    finalStep: "Confirmar",
  },
} satisfies Record<AccountDeletionLocale, Record<string, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapOtpError(message: string, locale: AccountDeletionLocale) {
  const lower = message.toLowerCase();
  if (lower.includes("expired") || lower.includes("invalid") || lower.includes("token")) {
    return copy[locale].wrongOtp;
  }
  return copy[locale].wrongOtp;
}

function mapDeleteError(message: string, locale: AccountDeletionLocale) {
  const lower = message.toLowerCase();
  if (lower.includes("not found") || lower.includes("user")) return copy[locale].userNotFound;
  if (lower.includes("network")) return copy[locale].networkError;
  return copy[locale].deleteFailed;
}

interface DeletionFormProps {
  idPrefix: string;
  locale: AccountDeletionLocale;
  step: Step;
  email: string;
  otp: string;
  confirmation: string;
  statusMessage: string;
  errorMessage: string;
  isBusy: boolean;
  cooldownSeconds: number;
  setEmail: (value: string) => void;
  setOtp: (value: string) => void;
  setConfirmation: (value: string) => void;
  onEmailSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onOtpSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function ProgressPills({ locale, step }: { locale: AccountDeletionLocale; step: Step }) {
  const t = copy[locale];
  const steps = [
    { key: "email", label: t.emailStep },
    { key: "otp", label: t.otpStep },
    { key: "confirm", label: t.finalStep },
  ] as const;
  const activeIndex = Math.max(
    0,
    steps.findIndex((item) => item.key === step),
  );

  return (
    <ol className={styles.progress} aria-label={`${t.step} status`}>
      {steps.map((item, index) => (
        <li
          key={item.key}
          className={index <= activeIndex || step === "success" ? styles.progressActive : ""}
        >
          <span>{index + 1}</span>
          {item.label}
        </li>
      ))}
    </ol>
  );
}

function DeletionForm(props: DeletionFormProps) {
  const t = copy[props.locale];
  const canDelete = props.confirmation === t.confirmationPhrase && !props.isBusy;

  if (props.step === "success") {
    return (
      <div className={styles.successPanel} role="status" aria-live="polite">
        <ShieldTick variant="Bulk" size={34} color="var(--cp-state-success)" />
        <h3>{t.successTitle}</h3>
        <p>{t.successBody}</p>
      </div>
    );
  }

  return (
    <div className={styles.formStack}>
      <ProgressPills locale={props.locale} step={props.step} />

      <form className={styles.form} onSubmit={props.onEmailSubmit}>
        <label htmlFor={`${props.idPrefix}-email`}>{t.emailLabel}</label>
        <div className={styles.inputRow}>
          <input
            id={`${props.idPrefix}-email`}
            className="cp-input"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t.emailPlaceholder}
            value={props.email}
            onChange={(event) => props.setEmail(event.target.value)}
            disabled={props.isBusy}
            required
          />
          <button
            className="cp-btn cp-btn--primary"
            type="submit"
            disabled={props.isBusy || props.cooldownSeconds > 0}
          >
            {props.step === "email" ? t.sendCode : t.resendCode}
          </button>
        </div>
        {props.cooldownSeconds > 0 ? (
          <p className={styles.helpText}>
            {t.cooldown} {props.cooldownSeconds}s
          </p>
        ) : null}
      </form>

      {props.step === "otp" || props.step === "confirm" ? (
        <form className={styles.form} onSubmit={props.onOtpSubmit}>
          <label htmlFor={`${props.idPrefix}-otp`}>{t.otpLabel}</label>
          <div className={styles.inputRow}>
            <input
              id={`${props.idPrefix}-otp`}
              className="cp-input"
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder={t.otpPlaceholder}
              value={props.otp}
              onChange={(event) => props.setOtp(event.target.value.replace(/\s/g, ""))}
              disabled={props.isBusy || props.step === "confirm"}
              required
            />
            <button className="cp-btn cp-btn--primary" type="submit" disabled={props.isBusy}>
              {t.verifyCode}
            </button>
          </div>
        </form>
      ) : null}

      {props.step === "confirm" ? (
        <form className={styles.form} onSubmit={props.onDeleteSubmit}>
          <label htmlFor={`${props.idPrefix}-confirmation`}>{t.confirmLabel}</label>
          <p className={styles.confirmPhrase}>
            {t.confirmHelp} <strong>{t.confirmationPhrase}</strong>
          </p>
          <input
            id={`${props.idPrefix}-confirmation`}
            className="cp-input"
            type="text"
            autoComplete="off"
            value={props.confirmation}
            onChange={(event) => props.setConfirmation(event.target.value)}
            disabled={props.isBusy}
            required
          />
          <button
            className={`${styles.deleteButton} cp-btn`}
            type="submit"
            disabled={!canDelete}
            aria-disabled={!canDelete}
          >
            <Trash variant="Bulk" size={20} color="currentColor" />
            {t.deleteButton}
          </button>
        </form>
      ) : null}

      <div className={styles.messageArea} aria-live="polite">
        {props.statusMessage ? <p className={styles.status}>{props.statusMessage}</p> : null}
        {props.errorMessage ? <p className={styles.error}>{props.errorMessage}</p> : null}
      </div>
    </div>
  );
}

export default function DeleteAccountPage() {
  const [locale, setLocale] = useState<AccountDeletionLocale>("en");
  const [modalOpen, setModalOpen] = useState(true);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const t = copy[locale];

  const disclosureCards = useMemo(
    () => [
      { title: t.permanentTitle, body: t.permanentBody, icon: Trash },
      { title: t.subscriptionsTitle, body: t.subscriptionsBody, icon: ReceiptText },
      { title: t.retentionTitle, body: t.retentionBody, icon: Lock },
    ],
    [t.permanentBody, t.permanentTitle, t.retentionBody, t.retentionTitle, t.subscriptionsBody, t.subscriptionsTitle],
  );

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const switchLocale = () => {
    setLocale((current) => (current === "en" ? "es" : "en"));
    setConfirmation("");
    setStatusMessage("");
    setErrorMessage("");
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setEmail(normalizedEmail);
    setStatusMessage("");
    setErrorMessage("");

    if (!emailPattern.test(normalizedEmail)) {
      setErrorMessage(t.invalidEmail);
      return;
    }

    setIsBusy(true);
    try {
      const result = await requestAccountDeletionOtp(normalizedEmail, locale);
      setStatusMessage(result.message || t.genericOtpMessage);
      setCooldownSeconds(result.cooldownSeconds ?? 60);
      setStep((current) => (current === "email" ? "otp" : current));
    } catch (error) {
      const maybeCooldown = (error as { cooldownSeconds?: number }).cooldownSeconds;
      if (maybeCooldown) setCooldownSeconds(maybeCooldown);
      setErrorMessage(error instanceof Error ? error.message : t.networkError);
    } finally {
      setIsBusy(false);
    }
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    if (!otp.trim()) {
      setErrorMessage(t.invalidOtp);
      return;
    }

    setIsBusy(true);
    try {
      const session = await verifyAccountDeletionOtp(email.trim().toLowerCase(), otp.trim());
      setAccessToken(session.access_token);
      setStep("confirm");
      setStatusMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? mapOtpError(error.message, locale) : t.wrongOtp);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    if (confirmation !== t.confirmationPhrase || !accessToken) return;

    setIsBusy(true);
    try {
      await deleteCookPilotAccount(accessToken);
      setStep("success");
      setModalOpen(false);
      setStatusMessage("");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? mapDeleteError(error.message, locale) : t.deleteFailed);
    } finally {
      setIsBusy(false);
    }
  };

  const formProps = {
    locale,
    step,
    email,
    otp,
    confirmation,
    statusMessage,
    errorMessage,
    isBusy,
    cooldownSeconds,
    setEmail,
    setOtp,
    setConfirmation,
    onEmailSubmit: handleEmailSubmit,
    onOtpSubmit: handleOtpSubmit,
    onDeleteSubmit: handleDeleteSubmit,
  };

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <div className={styles.eyebrow}>
              <ShieldTick variant="Bulk" size={18} color="var(--cp-primary)" />
              {t.eyebrow}
            </div>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
          </div>

          <div className={styles.heroActions}>
            <button className={styles.languageToggle} type="button" onClick={switchLocale}>
              {t.otherLanguageName}
            </button>
            <button className="cp-btn cp-btn--ghost" type="button" onClick={() => setModalOpen(true)}>
              <MessageText variant="Bulk" size={20} color="currentColor" />
              {t.openModal}
            </button>
          </div>
        </div>

        <div className={styles.disclosures}>
          {disclosureCards.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className={styles.disclosureCard}>
                <div className={styles.cardIcon}>
                  <Icon variant="Bulk" size={24} color="var(--cp-primary)" />
                </div>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>

        <section className={styles.inlineFallback} aria-labelledby="delete-account-inline-title">
          <div className={styles.inlineHeader}>
            <InfoCircle variant="Bulk" size={26} color="var(--cp-primary)" />
            <div>
              <h2 id="delete-account-inline-title">{t.inlineTitle}</h2>
              <p>{t.inlineLead}</p>
            </div>
          </div>
          <DeletionForm idPrefix="inline" {...formProps} />
        </section>
      </div>

      {modalOpen ? (
        <div className={styles.overlay} role="presentation">
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-modal-title"
            aria-describedby="delete-account-modal-description"
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.eyebrow}>
                  <Trash variant="Bulk" size={18} color="var(--cp-primary)" />
                  {t.eyebrow}
                </div>
                <h2 id="delete-account-modal-title">{t.title}</h2>
                <p id="delete-account-modal-description">{t.modalIntro}</p>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.languageToggle} type="button" onClick={switchLocale}>
                  {t.otherLanguageName}
                </button>
                <button className={styles.closeButton} type="button" onClick={() => setModalOpen(false)}>
                  <span aria-hidden="true">x</span>
                  <span className={styles.srOnly}>{t.close}</span>
                </button>
              </div>
            </div>

            <DeletionForm idPrefix="modal" {...formProps} />
          </section>
        </div>
      ) : null}
    </section>
  );
}
