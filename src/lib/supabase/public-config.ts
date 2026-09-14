import { CANONICAL_SUPABASE_URL } from "./constants";

const publicEnv = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const publicSupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || CANONICAL_SUPABASE_URL,
  publishableKey: publicEnv(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ),
};
