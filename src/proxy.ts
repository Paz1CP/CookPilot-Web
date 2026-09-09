import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { defaultLocale, type AppLocale } from "@/shared/config/routes";
import { supabaseConfig } from "@/lib/supabase/config";

function getLocale(pathname: string, savedLocale?: string): AppLocale {
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/es")) return "es";
  return savedLocale === "en" ? "en" : defaultLocale;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.hostname === "www.cookpilot.pro") {
    const canonical = request.nextUrl.clone();
    canonical.hostname = "cookpilot.pro";
    return NextResponse.redirect(canonical, 308);
  }
  const requestHeaders = new Headers(request.headers);
  const hasAuthCookie = request.cookies.getAll().some(({ name }) =>
    name.startsWith("sb-") || name.includes("auth-token"),
  );
  requestHeaders.set("x-cp-pathname", request.nextUrl.pathname);
  requestHeaders.set(
    "x-cp-locale",
    getLocale(request.nextUrl.pathname, request.cookies.get("cp-locale")?.value),
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
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
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  if (hasAuthCookie) {
    await supabase.auth.getUser().catch(() => undefined);
  }

  const authPath = request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.startsWith("/api/auth/");
  if (authPath || hasAuthCookie) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    response.headers.set("Vary", "Cookie");
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|icons/|.*\\..*).*)"],
};
