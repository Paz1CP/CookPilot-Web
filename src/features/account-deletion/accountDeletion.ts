import { supabaseConfig } from "@/lib/supabase/config";
import { getTranslations } from "@/lib/i18n";

const SUPABASE_PUBLISHABLE_KEY = supabaseConfig.publishableKey;
const SUPABASE_URL = supabaseConfig.url;

export type AccountDeletionLocale = "en" | "es";

export interface OtpRequestResult {
  message: string;
  cooldownSeconds?: number;
}

const accountDeletionFunctionUrl = `${SUPABASE_URL}/functions/v1/account-deletion`;

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function requestAccountDeletionOtp(
  email: string,
  locale: AccountDeletionLocale,
): Promise<OtpRequestResult> {
  const response = await fetch(accountDeletionFunctionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ action: "request_otp", email, locale }),
  });

  const payload = await parseJson(response);
  const copy = getTranslations(locale).delete_account;

  if (!response.ok) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : copy.sendCodeFailed;

    const error = new Error(message);
    if (typeof payload.cooldownSeconds === "number") {
      Object.assign(error, { cooldownSeconds: payload.cooldownSeconds });
    }
    throw error;
  }

  return {
    message:
      typeof payload.message === "string"
        ? payload.message
        : copy.genericOtpMessage,
    cooldownSeconds:
      typeof payload.cooldownSeconds === "number" ? payload.cooldownSeconds : undefined,
  };
}

export async function verifyAccountDeletionOtp(email: string, otpCode: string) {
  const response = await fetch(accountDeletionFunctionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ action: "verify_otp", email, otpCode }),
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof payload.message === "string"
        ? payload.message
        : "OTP verification failed. Please try again.",
    );
  }

  const session = payload.session as { access_token: string; refresh_token: string } | null;
  if (!session) {
    throw new Error("No active session was returned for this verification code.");
  }

  return {
    accessToken: session.access_token,
    verificationToken: String(payload.verificationToken || ""),
  };
}

export async function deleteCookPilotAccount(accessToken: string, verificationToken: string) {
  const response = await fetch(accountDeletionFunctionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ action: "delete_account", verificationToken }),
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof payload.message === "string"
        ? payload.message
        : "Account deletion failed. Please try again.",
    );
  }

}
