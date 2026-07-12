import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, type AppLocale } from "@/shared/config/routes";

function getLocale(pathname: string, savedLocale?: string): AppLocale {
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/es")) return "es";
  return savedLocale === "en" ? "en" : defaultLocale;
}

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-cp-pathname", request.nextUrl.pathname);
  requestHeaders.set(
    "x-cp-locale",
    getLocale(request.nextUrl.pathname, request.cookies.get("cp-locale")?.value),
  );

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|icons/|.*\\..*).*)"],
};

