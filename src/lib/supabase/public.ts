import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicSupabaseConfig } from "./public-config";

type PublicCacheMode = "force-cache" | "no-store";
const publicClients = new Map<PublicCacheMode, SupabaseClient>();

function publicFetch(cacheMode: PublicCacheMode): typeof fetch {
  return (input, init) => fetch(input, {
    ...init,
    cache: cacheMode,
    next: { ...init?.next, ...(cacheMode === "no-store" ? { revalidate: 0 } : { revalidate: 60 }) },
  });
}

export function createSupabasePublicClient(options: { cache?: PublicCacheMode } = {}) {
  const cacheMode = options.cache ?? "force-cache";
  const existing = publicClients.get(cacheMode);
  if (existing) return existing;

  const client = createClient(publicSupabaseConfig.url, publicSupabaseConfig.publishableKey, {
    global: { fetch: publicFetch(cacheMode) },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  publicClients.set(cacheMode, client);
  return client;
}
