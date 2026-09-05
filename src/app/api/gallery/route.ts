import { NextResponse, type NextRequest } from "next/server";
import { getGalleryPage, parseGalleryState } from "@/lib/cookshare/gallery";

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const locale = searchParams.locale === "en" ? "en" : "es";
  const state = parseGalleryState(locale, searchParams);
  const page = await getGalleryPage(state);
  return NextResponse.json(page, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
