"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicSupabaseConfig } from "./public-config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      publicSupabaseConfig.url,
      publicSupabaseConfig.publishableKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      },
    );
  }
  return browserClient;
}

export const supabaseBrowser = createSupabaseBrowserClient();
