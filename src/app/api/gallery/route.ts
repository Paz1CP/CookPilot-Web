import { NextResponse, type NextRequest } from "next/server";
import { getGalleryPage, parseGalleryState } from "@/lib/cookshare/gallery";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const state = parseGalleryState(locale, searchParams);
  const page = await getGalleryPage(state);
  const publicPage = {
    items: page.items,
    nextCursor: page.nextCursor,
    state: page.state,
    hasMore: page.hasMore,
    facetOptions: page.facetOptions,
  };
  const hasAuthCookie = request.cookies.getAll().some(({ name }) =>
    name.startsWith("sb-") || name.includes("auth-token"),
  );
  const canShareCache = !hasAuthCookie && state.scope === "global";
  return NextResponse.json(publicPage, {
    headers: canShareCache
      ? { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
      : { "Cache-Control": "private, no-store, max-age=0, must-revalidate", Vary: "Cookie" },
  });
}
