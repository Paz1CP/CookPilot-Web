"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      supabaseConfig.url,
      supabaseConfig.publishableKey,
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
