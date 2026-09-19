"use client";

import { FormEvent, useEffect, useState } from "react";
import { InfoCircle, Lock, ReceiptText, ShieldTick, Trash } from "iconsax-reactjs";
import { useLocale } from "@/contexts/LanguageContext";
import { type Translations } from "@/lib/i18n";
import {
  deleteCookPilotAccount,
  requestAccountDeletionOtp,
  verifyAccountDeletionOtp,
  type AccountDeletionLocale,
} from "@/features/account-deletion/accountDeletion";
import styles from "./DeleteAccountPage.module.css";

type Step = "email" | "otp" | "confirm" | "success";
type DeletionCopy = Translations["delete_account"];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapOtpError(message: string, copy: DeletionCopy) {
  const lower = message.toLowerCase();
  if (lower.includes("expired") || lower.includes("invalid") || lower.includes("token")) {
    return copy.wrongOtp;
  }
  return copy.wrongOtp;
}

function mapDeleteError(message: string, copy: DeletionCopy) {
  const lower = message.toLowerCase();
  if (lower.includes("not found") || lower.includes("user")) return copy.userNotFound;
  if (lower.includes("network")) return copy.networkError;
  return copy.deleteFailed;
}

interface ProgressPillsProps {
  copy: DeletionCopy;
  step: Step;
}

function ProgressPills({ copy, step }: ProgressPillsProps) {
  const steps = [
    { key: "email", label: copy.emailStep },
    { key: "otp", label: copy.otpStep },
    { key: "confirm", label: copy.finalStep },
  ] as const;
  const activeIndex = Math.max(
    0,
    steps.findIndex((item) => item.key === step),
  );

  return (
    <ol className={styles.progress} aria-label={`${copy.step} status`}>
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

interface DeletionFormProps {
  copy: DeletionCopy;
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

function DeletionForm(props: DeletionFormProps) {
  const t = props.copy;
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
      <ProgressPills copy={props.copy} step={props.step} />

      <form className={styles.form} onSubmit={props.onEmailSubmit}>
        <label htmlFor="delete-account-email">{t.emailLabel}</label>
        <div className={styles.inputRow}>
          <input
            id="delete-account-email"
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
          <label htmlFor="delete-account-otp">{t.otpLabel}</label>
          <div className={styles.inputRow}>
            <input
              id="delete-account-otp"
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
          <label htmlFor="delete-account-confirmation">{t.confirmLabel}</label>
          <p className={styles.confirmPhrase}>
            {t.confirmHelp} <strong>{t.confirmationPhrase}</strong>
          </p>
          <input
            id="delete-account-confirmation"
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
  const { locale, t: appTranslations } = useLocale();
  const deletionLocale: AccountDeletionLocale = locale;
  const t = appTranslations.delete_account;
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const disclosureCards = [
    { title: t.permanentTitle, body: t.permanentBody, icon: Trash },
    { title: t.subscriptionsTitle, body: t.subscriptionsBody, icon: ReceiptText },
    { title: t.retentionTitle, body: t.retentionBody, icon: Lock },
  ];

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
      const result = await requestAccountDeletionOtp(normalizedEmail, deletionLocale);
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
      const { accessToken: token, verificationToken: vToken } = await verifyAccountDeletionOtp(
        email.trim().toLowerCase(),
        otp.trim(),
      );
      setAccessToken(token);
      setVerificationToken(vToken);
      setStep("confirm");
    } catch (error) {
      setErrorMessage(error instanceof Error ? mapOtpError(error.message, t) : t.wrongOtp);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    if (confirmation !== t.confirmationPhrase || !accessToken || !verificationToken) return;

    setIsBusy(true);
    try {
      await deleteCookPilotAccount(accessToken, verificationToken);
      setStep("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? mapDeleteError(error.message, t) : t.deleteFailed);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <div className={styles.heroText}>
          
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
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

        <section className={styles.accountPanel} aria-labelledby="delete-account-title">
          <div className={styles.inlineHeader}>
            <InfoCircle variant="Bulk" size={26} color="var(--cp-primary)" />
            <div>
              <h2 id="delete-account-title">{t.formTitle}</h2>
              <p>{t.formLead}</p>
            </div>
          </div>
          <DeletionForm
            copy={t}
            step={step}
            email={email}
            otp={otp}
            confirmation={confirmation}
            statusMessage={statusMessage}
            errorMessage={errorMessage}
            isBusy={isBusy}
            cooldownSeconds={cooldownSeconds}
            setEmail={setEmail}
            setOtp={setOtp}
            setConfirmation={setConfirmation}
            onEmailSubmit={handleEmailSubmit}
            onOtpSubmit={handleOtpSubmit}
            onDeleteSubmit={handleDeleteSubmit}
          />
        </section>
      </div>
    </section>
  );
}
