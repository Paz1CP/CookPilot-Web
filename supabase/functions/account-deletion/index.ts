import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/account-deletion-cors.ts";

const GENERIC_MESSAGES = {
  en: "If an account exists for this email, we sent a verification code.",
  es:
    "Si existe una cuenta asociada a este correo, enviamos un código de verificación.",
} as const;

const EMAIL_COOLDOWN_SECONDS = 60;
const IP_WINDOW_MINUTES = 15;
const IP_MAX_REQUESTS = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Locale = keyof typeof GENERIC_MESSAGES;

interface StorageObjectRow {
  bucket_id: unknown;
  name: unknown;
}

interface StorageAdminClient {
  schema(schema: "storage"): {
    from(table: "objects"): {
      select(columns: string): {
        or(filter: string): Promise<{
          data: StorageObjectRow[] | null;
          error: Error | null;
        }>;
      };
    };
  };
  storage: {
    from(bucket: string): {
      remove(names: string[]): Promise<{ error: Error | null }>;
    };
  };
}

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function getPublishableKey() {
  return (
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY") ??
      getEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

function normalizeLocale(value: unknown): Locale {
  return value === "es" ? "es" : "en";
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-real-ip") ??
      forwarded ??
      "unknown"
  );
}

async function handleOtpRequest(req: Request, body: Record<string, unknown>) {
  const locale = normalizeLocale(body.locale);
  const message = GENERIC_MESSAGES[locale];
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse(
      {
        message: locale === "es"
          ? "Ingresa un correo válido."
          : "Enter a valid email address.",
      },
      { status: 400 },
    );
  }

  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const salt = Deno.env.get("ACCOUNT_DELETION_RATE_LIMIT_SALT") ?? "";
  const emailHash = await sha256(`${salt}:email:${email}`);
  const ipHash = await sha256(`${salt}:ip:${getClientIp(req)}`);
  const userAgent = req.headers.get("user-agent")?.slice(0, 240) ?? null;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const oneMinuteAgo = new Date(Date.now() - EMAIL_COOLDOWN_SECONDS * 1000)
    .toISOString();
  const windowStart = new Date(Date.now() - IP_WINDOW_MINUTES * 60 * 1000)
    .toISOString();

  const { count: recentEmailCount, error: recentEmailError } = await admin
    .from("account_deletion_otp_requests")
    .select("id", { count: "exact", head: true })
    .eq("email_hash", emailHash)
    .gte("requested_at", oneMinuteAgo);

  if (recentEmailError) throw recentEmailError;

  const { count: recentIpCount, error: recentIpError } = await admin
    .from("account_deletion_otp_requests")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("requested_at", windowStart);

  if (recentIpError) throw recentIpError;

  if (
    (recentEmailCount ?? 0) > 0 || (recentIpCount ?? 0) >= IP_MAX_REQUESTS
  ) {
    await admin.from("account_deletion_otp_requests").insert({
      email_hash: emailHash,
      ip_hash: ipHash,
      user_agent: userAgent,
      accepted: false,
    });

    return jsonResponse(
      {
        message,
        cooldownSeconds: EMAIL_COOLDOWN_SECONDS,
      },
      { status: 429 },
    );
  }

  const { error: insertError } = await admin.from(
    "account_deletion_otp_requests",
  ).insert({
    email_hash: emailHash,
    ip_hash: ipHash,
    user_agent: userAgent,
    accepted: true,
  });

  if (insertError) throw insertError;

  const authClient = createClient(supabaseUrl, getPublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: otpError } = await authClient.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (otpError) {
    console.warn("Account deletion OTP request did not send", {
      code: otpError.code,
      status: otpError.status,
    });
  }

  return jsonResponse({ message, cooldownSeconds: EMAIL_COOLDOWN_SECONDS });
}

async function removeStorageObjects(admin: StorageAdminClient, userId: string) {
  const { data, error } = await admin
    .schema("storage")
    .from("objects")
    .select("bucket_id,name")
    .or(`owner.eq.${userId},owner_id.eq.${userId}`);

  if (error) throw error;
  if (!data?.length) return 0;

  const objectsByBucket = new Map<string, string[]>();

  for (const object of data) {
    const bucket = String(object.bucket_id ?? "");
    const name = String(object.name ?? "");
    if (!bucket || !name) continue;

    const names = objectsByBucket.get(bucket) ?? [];
    names.push(name);
    objectsByBucket.set(bucket, names);
  }

  let removedCount = 0;

  for (const [bucket, names] of objectsByBucket) {
    for (let index = 0; index < names.length; index += 100) {
      const chunk = names.slice(index, index + 100);
      const { error: removeError } = await admin.storage.from(bucket).remove(
        chunk,
      );
      if (removeError) throw removeError;
      removedCount += chunk.length;
    }
  }

  return removedCount;
}

async function handleAccountDeletion(req: Request) {
  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return jsonResponse({ message: "Missing authenticated session." }, {
      status: 401,
    });
  }

  const supabaseUrl = getEnv("SUPABASE_URL");
  const authClient = createClient(supabaseUrl, getPublishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return jsonResponse({
      message: "Invalid or expired authenticated session.",
    }, { status: 401 });
  }

  const admin = createClient(
    supabaseUrl,
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );

  const removedStorageObjects = await removeStorageObjects(
    admin as unknown as StorageAdminClient,
    user.id,
  );

  const { error: rpcError } = await admin.rpc("delete_account_app_data", {
    target_user_id: user.id,
  });

  if (rpcError) {
    console.error("delete_account_app_data failed", rpcError);
    return jsonResponse({
      message: "Account deletion failed before auth deletion.",
    }, { status: 500 });
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(
    user.id,
  );

  if (deleteUserError) {
    console.error("deleteUser failed", deleteUserError);
    return jsonResponse({
      message: "Account data was removed, but auth deletion failed.",
    }, { status: 500 });
  }

  return jsonResponse({
    message: "Your CookPilot account has been deleted.",
    removedStorageObjects,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action === "request_otp") {
      return await handleOtpRequest(req, body);
    }

    if (action === "delete_account") {
      return await handleAccountDeletion(req);
    }

    return jsonResponse({ message: "Unknown account deletion action." }, {
      status: 400,
    });
  } catch (error) {
    console.error("account-deletion failed", error);
    return jsonResponse({
      message: "Account deletion request failed. Please try again.",
    }, { status: 500 });
  }
});
