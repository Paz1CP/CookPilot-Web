const required = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const supabaseConfig = {
  url: required("NEXT_PUBLIC_SUPABASE_URL"),
  publishableKey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  secretKey: process.env.SUPABASE_SECRET_KEY,
  siteUrl: required("NEXT_PUBLIC_SITE_URL"),
  mediaBaseUrl: required("NEXT_PUBLIC_MEDIA_BASE_URL"),
};

if (supabaseConfig.secretKey && !supabaseConfig.secretKey.startsWith("sb_secret_")) {
  throw new Error("SUPABASE_SECRET_KEY must use the sb_secret_* format");
}

export const revenueCatConfig = {
  publicKey: process.env.NEXT_PUBLIC_REVENUECAT_WEB_PUBLIC_KEY ?? "",
  offeringId: process.env.NEXT_PUBLIC_REVENUECAT_OFFERING ?? "paddle_production",
};

export const authContinuationConfig = {
  secret: process.env.COOKPILOT_AUTH_CONTINUATION_SECRET,
  maxAgeSeconds: 10 * 60,
};
