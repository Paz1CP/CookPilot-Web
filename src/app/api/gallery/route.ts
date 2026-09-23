import { NextResponse, type NextRequest } from "next/server";
import { getGalleryPage, parseGalleryQueryState } from "@/lib/cookshare/gallery";

export const preferredRegion = "gru1";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const state = parseGalleryQueryState(locale, searchParams);
  const page = await getGalleryPage(state);
  const publicPage = {
    items: page.items,
    totalCount: page.totalCount,
    nextCursor: page.nextCursor,
    state: page.state,
    hasMore: page.hasMore,
    facetOptions: page.facetOptions,
  };
  return NextResponse.json(publicPage, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" },
  });
}
