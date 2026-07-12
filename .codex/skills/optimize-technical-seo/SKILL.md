---
name: optimize-technical-seo
description: Implement or audit complete technical SEO for a public website, including crawlability, indexability, metadata, canonical URLs, hreflang, sitemaps, robots rules, structured data, social previews, localized routes, and server-rendered search content. Do not trigger for ad copy, keyword campaigns, or ordinary visual redesign.
---

# Goal

Make every intended public page discoverable, indexable, correctly localized, and accurately represented to search engines and social platforms without inventing claims or changing product meaning.

Follow the current framework's canonical metadata and routing APIs. Do not create a parallel SEO system when the project already has one.

# Establish the page inventory

1. Read repository instructions, route definitions, locale mappings, and deployment configuration.
2. Identify:
   - indexable public routes;
   - localized equivalents;
   - redirect-only routes;
   - legal and account utility pages;
   - intentionally non-indexable pages;
   - dynamic or future content routes.
3. Build one source of truth for route pairs and public metadata when practical.
4. Do not expose unfinished, private, duplicate, or environment-specific URLs in the sitemap.

# Crawlability and rendering

- Ensure meaningful page content and metadata are present in rendered HTML.
- Keep navigation links crawlable with real `href` values.
- Avoid relying on click handlers alone for internal navigation.
- Verify status codes, redirects, trailing-slash behavior, and URL consistency.
- Use permanent redirects only for genuinely permanent URL moves.
- Avoid redirect chains and loops.
- Do not block assets required to understand or render the page.
- Confirm production robots behavior does not accidentally inherit staging restrictions.

# Titles, descriptions, and headings

For each indexable route:

- Provide a unique, accurate title.
- Provide a useful page-specific meta description.
- Maintain one clear primary page heading.
- Keep title, heading, visible copy, and user intent aligned.
- Avoid keyword stuffing, boilerplate duplication, and exaggerated claims.
- Localize meaningfully; do not publish literal or awkward translations.
- Let search engines choose snippets when appropriate; do not treat exact snippet text as guaranteed.

# Canonical URLs

- Use absolute production URLs.
- Give each unique indexable page a self-referencing canonical.
- Canonicalize true duplicates only.
- Keep canonical signals consistent across HTML, sitemap, redirects, and internal links.
- Do not canonicalize one language version to another.
- Do not point canonicals to redirecting, blocked, or non-200 URLs.

# Localized pages and hreflang

When localized equivalents exist:

- Set the correct document language.
- Emit reciprocal `hreflang` annotations for every supported language pair.
- Include a self-reference in each hreflang set.
- Use stable language or language-region codes that match the actual content.
- Keep each localized page's canonical self-referencing.
- Add `x-default` only when there is a genuine language-neutral selector or fallback URL.
- Validate that locale switching lands on the equivalent page, not merely the localized home.
- Keep sitemap alternates and HTML alternates consistent if both are used.

# Sitemap and robots

- Generate the sitemap from the actual public route source of truth when possible.
- Include canonical, indexable URLs only.
- Use accurate production origins.
- Keep `lastmod` truthful; do not update it on every build without a content change.
- Reference the sitemap from `robots.txt`.
- Use robots rules for crawl management, not as a substitute for `noindex`.
- Use `noindex` only on pages that must remain accessible but absent from search.
- Never place sensitive information behind robots rules and treat it as protected.

# Structured data

- Add JSON-LD only when the visible page content supports it.
- Prefer the most specific Google-supported type that truthfully represents the page.
- Keep structured data identifiers, URLs, names, images, prices, availability, and organization data consistent with visible content.
- Do not add fake ratings, reviews, awards, testimonials, or business details.
- Do not add recipe markup to a general landing page merely because food images appear.
- Do not add FAQ markup merely because an accordion exists; use a type only when it is supported, eligible, and useful.
- Avoid duplicate or conflicting graphs.
- Use stable `@id` values when connecting entities across pages.

# Social previews and sharing

- Provide Open Graph metadata for public pages.
- Provide a suitable social image with correct absolute URL and dimensions.
- Keep title and description aligned with the page.
- Add platform-specific metadata only when it adds real value.
- Verify locale-specific preview text where supported.
- Do not reuse an irrelevant generic image for every route if better route-specific media exists.

# Content and internal architecture checks

- Ensure important pages are linked from crawlable navigation or contextual links.
- Use descriptive link text.
- Avoid orphan pages.
- Keep breadcrumbs visible and structured only when the information architecture warrants them.
- Ensure image alt text describes meaningful content and decorative images remain decorative.
- Preserve clean, stable URLs.
- Do not create thin pages solely to target search phrases.

# Validation

1. Run the production build.
2. Inspect rendered HTML for representative routes in every locale.
3. Verify:
   - title;
   - description;
   - canonical;
   - hreflang;
   - language attribute;
   - robots directives;
   - Open Graph;
   - JSON-LD.
4. Fetch and inspect:
   - `robots.txt`;
   - sitemap output;
   - redirect behavior;
   - 404 behavior.
5. Check that all sitemap URLs return the intended status and canonical.
6. Use available structured-data and rich-result validators when practical.
7. Report unsupported assumptions instead of guessing production hostnames or business facts.

# Done

Return a concise report containing:

- route inventory and indexability decisions;
- metadata system implemented or corrected;
- canonical and hreflang behavior;
- sitemap and robots behavior;
- structured data added or intentionally omitted;
- social preview coverage;
- unresolved items requiring production-domain or Search Console access;
- build result.
