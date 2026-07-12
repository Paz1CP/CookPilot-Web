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
const VERIFICATION_TOKEN_TTL_SECONDS = 10 * 60;
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

interface UsersSchemaClient {
  schema(schema: "users"): {
    from(table: "account_deletion_otp_requests"): {
      select(
        columns: string,
        options?: { count?: "exact"; head?: boolean },
      ): UsersCountQuery;
      insert(values: Record<string, unknown>): Promise<{ error: Error | null }>;
    };
    rpc(
      fn: "delete_account_app_data",
      params: { target_user_id: string },
    ): Promise<{ error: Error | null }>;
  };
}

interface UsersCountQuery {
  eq(column: string, value: unknown): UsersCountQuery;
  gte(column: string, value: string): Promise<{
    count: number | null;
    error: Error | null;
  }>;
}

interface OtpAuthClient {
  auth: {
    verifyOtp(params: {
      email: string;
      token: string;
      type: "email" | "signup";
    }): Promise<{
      data: {
        user: { id: string } | null;
        session: { access_token: string; refresh_token: string } | null;
      };
      error: unknown;
    }>;
  };
}

interface DeletionVerificationPayload {
  userId: string;
  email: string;
  expiresAt: number;
}

function usersSchema(client: unknown) {
  return (client as UsersSchemaClient).schema("users");
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

function getVerificationSecret() {
  return (
    Deno.env.get("ACCOUNT_DELETION_VERIFICATION_SECRET") ??
      Deno.env.get("ACCOUNT_DELETION_RATE_LIMIT_SALT") ??
      getEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

function normalizeLocale(value: unknown): Locale {
  return value === "es" ? "es" : "en";
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeOtpCode(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 6);
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function signaturesMatch(left: string, right: string) {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

async function signVerificationTokenPayload(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getVerificationSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

async function createVerificationToken(userId: string, email: string) {
  const payload: DeletionVerificationPayload = {
    userId,
    email: email.toLowerCase(),
    expiresAt: Math.floor(Date.now() / 1000) + VERIFICATION_TOKEN_TTL_SECONDS,
  };
  const payloadPart = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signaturePart = await signVerificationTokenPayload(payloadPart);
  return `${payloadPart}.${signaturePart}`;
}

async function readVerificationToken(value: unknown) {
  const token = String(value ?? "");
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return null;
  }

  const expectedSignature = await signVerificationTokenPayload(payloadPart);
  if (!signaturesMatch(expectedSignature, signaturePart)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadPart)),
    ) as Partial<DeletionVerificationPayload>;
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.expiresAt !== "number"
    ) {
      return null;
    }
    if (payload.expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload as DeletionVerificationPayload;
  } catch {
    return null;
  }
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
  const email = normalizeEmail(body.email);

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

  const [recentEmail, recentIp] = await Promise.all([
    usersSchema(admin)
      .from("account_deletion_otp_requests")
      .select("id", { count: "exact", head: true })
      .eq("email_hash", emailHash)
      .eq("accepted", true)
      .gte("requested_at", oneMinuteAgo),
    usersSchema(admin)
      .from("account_deletion_otp_requests")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("accepted", true)
      .gte("requested_at", windowStart),
  ]);

  const { count: recentEmailCount, error: recentEmailError } = recentEmail;
  if (recentEmailError) throw recentEmailError;

  const { count: recentIpCount, error: recentIpError } = recentIp;
  if (recentIpError) throw recentIpError;

  if (
    (recentEmailCount ?? 0) > 0 || (recentIpCount ?? 0) >= IP_MAX_REQUESTS
  ) {
    await usersSchema(admin).from("account_deletion_otp_requests").insert({
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

  const { error: insertError } = await usersSchema(admin)
    .from("account_deletion_otp_requests")
    .insert({
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

async function removeStorageObjectsBestEffort(
  admin: StorageAdminClient,
  userId: string,
) {
  try {
    return {
      removedStorageObjects: await removeStorageObjects(admin, userId),
      storageCleanupSkipped: false,
    };
  } catch (error) {
    console.warn("Account deletion storage cleanup skipped", error);
    return {
      removedStorageObjects: 0,
      storageCleanupSkipped: true,
    };
  }
}

async function verifyDeletionOtp(
  authClient: OtpAuthClient,
  email: string,
  otpCode: string,
) {
  let firstError: unknown = null;

  for (const type of ["email", "signup"] as const) {
    const { data, error } = await authClient.auth.verifyOtp({
      email,
      token: otpCode,
      type,
    });

    if (!error && data.user) {
      return data;
    }

    firstError ??= error;
  }

  console.warn("Account deletion OTP verification failed", firstError);
  return null;
}

async function getAuthenticatedUser(req: Request, supabaseUrl: string) {
  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return {
      error: jsonResponse({ message: "Missing authenticated session." }, {
        status: 401,
      }),
    };
  }

  const authClient = createClient(supabaseUrl, getPublishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return {
      error: jsonResponse({
        message: "Invalid or expired authenticated session.",
      }, { status: 401 }),
    };
  }

  return { token, user };
}

async function handleOtpVerification(
  req: Request,
  body: Record<string, unknown>,
) {
  const email = normalizeEmail(body.email);
  const otpCode = normalizeOtpCode(body.otpCode);

  if (!EMAIL_PATTERN.test(email) || otpCode.length !== 6) {
    return jsonResponse({ message: "Valid email and OTP code are required." }, {
      status: 400,
    });
  }

  const supabaseUrl = getEnv("SUPABASE_URL");

  // Make authenticated session check optional (required only if Authorization header is present)
  const authHeader = req.headers.get("Authorization") ?? "";
  let authenticatedUser: { id: string; email?: string } | null = null;

  if (authHeader) {
    const authenticated = await getAuthenticatedUser(req, supabaseUrl);
    if (authenticated.error) {
      return authenticated.error;
    }
    authenticatedUser = authenticated.user;
    if ((authenticatedUser.email ?? "").toLowerCase() !== email) {
      return jsonResponse({
        message: "OTP email does not match the authenticated account.",
      }, { status: 403 });
    }
  }

  const otpAuthClient = createClient(supabaseUrl, getPublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const verificationResult = await verifyDeletionOtp(
    otpAuthClient as unknown as OtpAuthClient,
    email,
    otpCode,
  );

  if (!verificationResult || !verificationResult.user) {
    return jsonResponse({ message: "Invalid or expired verification code." }, {
      status: 401,
    });
  }

  const verifiedUser = verificationResult.user;

  if (authenticatedUser && verifiedUser.id !== authenticatedUser.id) {
    return jsonResponse({
      message: "Verification code belongs to a different account.",
    }, { status: 403 });
  }

  return jsonResponse({
    verificationToken: await createVerificationToken(verifiedUser.id, email),
    expiresInSeconds: VERIFICATION_TOKEN_TTL_SECONDS,
    session: verificationResult.session,
  });
}

async function handleAccountDeletion(
  req: Request,
  body: Record<string, unknown>,
) {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const authenticated = await getAuthenticatedUser(req, supabaseUrl);
  if (authenticated.error) {
    return authenticated.error;
  }

  const user = authenticated.user;
  const verification = await readVerificationToken(body.verificationToken);
  if (!verification) {
    return jsonResponse({ message: "Invalid or expired verification token." }, {
      status: 401,
    });
  }

  if (
    verification.userId !== user.id ||
    verification.email !== (user.email ?? "").toLowerCase()
  ) {
    return jsonResponse({
      message: "Verification token belongs to a different account.",
    }, { status: 403 });
  }

  const admin = createClient(
    supabaseUrl,
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );

  const { removedStorageObjects, storageCleanupSkipped } =
    await removeStorageObjectsBestEffort(
      admin as unknown as StorageAdminClient,
      user.id,
    );

  const { error: rpcError } = await usersSchema(admin)
    .rpc("delete_account_app_data", {
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
    storageCleanupSkipped,
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

    if (action === "verify_otp") {
      return await handleOtpVerification(req, body);
    }

    if (action === "delete_account") {
      return await handleAccountDeletion(req, body);
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
