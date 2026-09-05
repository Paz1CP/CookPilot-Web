const publicEnv = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const publicSupabaseConfig = {
  url: publicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  publishableKey: publicEnv(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ),
};

export const publicRevenueCatConfig = {
  publicKey: process.env.NEXT_PUBLIC_REVENUECAT_WEB_PUBLIC_KEY ?? "",
  offeringId: process.env.NEXT_PUBLIC_REVENUECAT_OFFERING ?? "paddle_production",
};
