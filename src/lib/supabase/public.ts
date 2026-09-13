import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicSupabaseConfig } from "./public-config";

let publicClient: SupabaseClient | undefined;

const publicFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    cache: "force-cache",
    next: { ...init?.next, revalidate: 60 },
  });

export function createSupabasePublicClient() {
  if (!publicClient) {
    publicClient = createClient(publicSupabaseConfig.url, publicSupabaseConfig.publishableKey, {
      global: { fetch: publicFetch },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return publicClient;
}
