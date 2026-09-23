import { NextRequest, NextResponse } from "next/server";
import { getGalleryFacetOptions } from "@/lib/cookshare/gallery";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "es";
  const facetOptions = await getGalleryFacetOptions(locale);

  return NextResponse.json({ facetOptions }, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" },
  });
}
