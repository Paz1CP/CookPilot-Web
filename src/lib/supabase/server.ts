import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseConfig } from "./config";

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseConfig.url,
    supabaseConfig.publishableKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies. proxy.ts refreshes them.
          }
        },
      },
    },
  );
}

export async function getRequestUser(existingClient?: SupabaseClient) {
  const client = existingClient ?? await createSupabaseServerClient();
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some(({ name }) =>
    name.startsWith("sb-") || name.includes("auth-token"),
  );
  if (!hasAuthCookie) return { client, user: null, error: null };
  const { data, error } = await client.auth.getUser();
  return { client, user: data.user, error };
}
