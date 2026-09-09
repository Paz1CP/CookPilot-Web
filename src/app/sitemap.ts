import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/config";
import { absoluteUrl, siteConfig } from "@/shared/config/site";
import { buildCookSharePath, buildHandlePath, type AppLocale, type CookShareRouteObjectType } from "@/shared/config/routes";
import { getLocalizedAlternates } from "@/shared/config/metadata";

export const revalidate = 3600;

type SitemapCandidate = {
  object_type: CookShareRouteObjectType | "handle";
  object_id: string;
  handle: string | null;
  slug: string;
  title: string;
  rank: number;
};

const candidateTypes = ["recipes", "menus", "days", "weeks", "ingredients", "categories", "handles"] as const;

function staticEntries(): MetadataRoute.Sitemap {
  const lastModified = new Date(siteConfig.lastModified);
  const localizedItems = Object.entries(siteConfig.sitemap).flatMap(([route, config]) =>
    siteConfig.locales.map((locale) => ({
      url: absoluteUrl(siteConfig.localizedRoutes[locale][route as keyof typeof siteConfig.sitemap]),
      lastModified,
      changeFrequency: config.changeFrequency,
      priority: config.priority,
      alternates: { languages: getLocalizedAlternates(route as keyof typeof siteConfig.sitemap) },
    })),
  );
  const utilityItems = Object.values(siteConfig.utilityRoutes).map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.sitemap.changeFrequency,
    priority: route.sitemap.priority,
  }));
  return [...localizedItems, ...utilityItems];
}

function normalizeHandle(value: string | null) {
  const handle = value?.replace(/^@/, "").trim().toLowerCase() ?? "";
  return /^[a-z0-9][a-z0-9._-]{2,29}$/.test(handle) ? handle : null;
}

async function publicCandidates() {
  const client = createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const rows: SitemapCandidate[] = [];
  for (const type of candidateTypes) {
    let cursor: SitemapCandidate | null = null;
    for (let page = 0; page < 500; page += 1) {
      const result = await client.schema("home").rpc("rpc_cookshare_gallery_candidates", {
        p_locale: "es",
        p_type: type,
        p_limit: 100,
        p_after_rank: cursor?.rank ?? null,
        p_after_title: cursor?.title?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ?? null,
        p_after_id: cursor?.object_id ?? null,
        p_after_object_type: cursor?.object_type ?? null,
      });
      if (result.error || !Array.isArray(result.data)) break;
      const batch = result.data as SitemapCandidate[];
      rows.push(...batch);
      if (batch.length < 100) break;
      cursor = batch.at(-1) ?? null;
      if (!cursor) break;
    }
  }
  return rows;
}

function objectPriority(type: CookShareRouteObjectType) {
  if (type === "recipe") return 0.8;
  if (type === "menu" || type === "week") return 0.7;
  return 0.5;
}

async function dynamicEntries(): Promise<MetadataRoute.Sitemap> {
  const entries = [...staticEntries()];
  const seen = new Set<string>();
  for (const candidate of await publicCandidates()) {
    const key = `${candidate.object_type}:${candidate.object_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (candidate.object_type === "handle") {
      const handle = normalizeHandle(candidate.handle);
      if (!handle) continue;
      const paths = Object.fromEntries(siteConfig.locales.map((locale: AppLocale) => [locale, buildHandlePath(locale, handle)])) as Record<AppLocale, string>;
      entries.push(...siteConfig.locales.map((locale) => ({
        url: absoluteUrl(paths[locale]),
        lastModified: new Date(siteConfig.lastModified),
        changeFrequency: "weekly" as const,
        priority: 0.4,
        alternates: { languages: { es: absoluteUrl(paths.es), en: absoluteUrl(paths.en) } },
      })));
      continue;
    }
    const objectType = candidate.object_type as CookShareRouteObjectType;
    const paths = Object.fromEntries(siteConfig.locales.map((locale: AppLocale) => [locale, buildCookSharePath({
      locale,
      objectType,
      handle: candidate.handle,
      slug: candidate.slug,
    })])) as Record<AppLocale, string>;
    entries.push(...siteConfig.locales.map((locale) => ({
      url: absoluteUrl(paths[locale]),
      lastModified: new Date(siteConfig.lastModified),
      changeFrequency: objectType === "ingredient" || objectType === "category" ? "monthly" as const : "weekly" as const,
      priority: objectPriority(objectType),
      alternates: { languages: { es: absoluteUrl(paths.es), en: absoluteUrl(paths.en) } },
    })));
  }
  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return dynamicEntries();
}
