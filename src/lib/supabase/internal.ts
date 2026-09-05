import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

let internalClient: SupabaseClient | undefined;

export function createSupabaseInternalClient() {
  if (!supabaseConfig.secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is required for server-internal reads");
  }
  if (!internalClient) {
    internalClient = createClient(supabaseConfig.url, supabaseConfig.secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return internalClient;
}
