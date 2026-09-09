import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase/config";
import { clearContinuationCookie, readContinuation } from "@/lib/auth/continuation";

const supportedTypes = new Set(["signup", "email", "recovery", "invite"]);

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
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") ?? "email";
  const result = tokenHash && supportedTypes.has(type)
    ? await client.auth.verifyOtp({ token_hash: tokenHash, type: type as "signup" | "email" | "recovery" | "invite" })
    : { error: new Error("invalid_confirmation") };
  if (result.error) {
    const failedDestination = new URL(destination, request.url);
    failedDestination.searchParams.set("auth_error", "confirm");
    response.headers.set("Location", failedDestination.toString());
  } else {
    clearContinuationCookie(response);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
