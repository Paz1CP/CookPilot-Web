import { NextResponse, type NextRequest } from "next/server";
import { getLocaleFromAcceptLanguage, type AppLocale } from "@/shared/config/routes";

function getLocale(pathname: string, savedLocale: string | undefined, acceptLanguage: string | null): AppLocale {
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/es")) return "es";
  if (savedLocale === "en" || savedLocale === "es") return savedLocale;
  return getLocaleFromAcceptLanguage(acceptLanguage);
}

function isCookShareObjectPath(pathname: string) {
  return /^\/(?:es|en)(?:\/@[^/]+)?\/(?:recetas|recipes|menus|dias|days|semanas|weeks|listas|lists|ingredientes|ingredients|categorias|categories)(?:\/|$)/.test(pathname);
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.hostname === "www.cookpilot.pro") {
    const canonical = request.nextUrl.clone();
    canonical.hostname = "cookpilot.pro";
    return NextResponse.redirect(canonical, 308);
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-cp-pathname", request.nextUrl.pathname);
  requestHeaders.set(
    "x-cp-locale",
    getLocale(request.nextUrl.pathname, request.cookies.get("cp-locale")?.value, request.headers.get("accept-language")),
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  if (isCookShareObjectPath(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "no-store");
  } else if (!request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
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
