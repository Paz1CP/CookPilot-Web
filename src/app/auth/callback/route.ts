import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase/config";
import { clearContinuationCookie, readContinuation } from "@/lib/auth/continuation";

export async function GET(request: NextRequest) {
  const continuation = readContinuation(request);
  const destination = continuation?.canonicalPath ?? "/es";
  const response = NextResponse.redirect(new URL(destination, request.url));
  const client = createServerClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const code = request.nextUrl.searchParams.get("code");
  if (code) await client.auth.exchangeCodeForSession(code);
  clearContinuationCookie(response);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
