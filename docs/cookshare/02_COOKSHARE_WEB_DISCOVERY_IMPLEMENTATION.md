# CookShare — Web Discovery Implementation

**File:** `02_COOKSHARE_WEB_DISCOVERY_IMPLEMENTATION.md`  
**Status:** implementation-authoritative for the CookShare Web surface  
**Repository:** `Paz1CP/CookPilot-Web`  
**Primary runtime:** Next.js App Router on the existing CookPilot Web deployment  
**Depends on:** `01_COOKSHARE_IMPLEMENTATION_FOUNDATION.md`  
**Companion:** `03_COOKSHARE_APP_LINKS_AND_INTEGRATION_IMPLEMENTATION.md`

---

## 0. Scope

This document defines the implementation contract for the **public Web discovery, object pages, SEO/AEO and sharing surface** of CookShare.

It deliberately does **not** redefine the cross-cutting rules already frozen in `01_COOKSHARE_IMPLEMENTATION_FOUNDATION.md`.

All implementation in this file inherits, without restatement:

- the public-object model;
- publication and lifecycle semantics;
- publicability/discoverability/indexability separation;
- canonical URL identity;
- handle semantics;
- Free/Pro boundaries;
- premium-root lineage;
- composite-object gating;
- backend-reuse rules;
- the centralized security baseline in Foundation §32;
- migration rules;
- Web↔App ownership boundaries.

If this document appears to conflict with `01`, `01` wins unless this document is explicitly updating a Web-only implementation detail that `01` delegated here.

## 0.1 Current product direction: public-only Web (2026-09-12)

CookShare Web is now a public, unauthenticated, read-only, indexable and cache-friendly discovery surface. This amendment supersedes the earlier Web-authentication, owner/private, Paddle, RevenueCat Web, entitlement, paywall and premium-redaction sections in this document. The Web uses the pure `home.rpc_resolve_cookshare_public_content` resolver and renders the complete safe culinary projection for every public valid object. Free/Pro and billing remain App-only; the mobile Auth/CookBilling/RevenueCat/Google Play/Huawei paths are preserved.

Gallery is the single general discovery surface. Global types include All, Recipes, Menus, Days, Weeks, Lists, Ingredients and Categories; public CookLists are eligible. Handles remain URL segments for user-owned objects and historical aliases, while a root `/@handle` profile/showcase route is 404. Query/filter Gallery states remain normally `noindex,follow`; clean public object, ingredient, category and valid intersection routes are indexable. No Web route performs actor or entitlement resolution.

### 0.1 The public Web security rules

Do not duplicate the full security checklist here. During implementation and review, treat these Foundation rules as release-blocking:

- `01 §32.1` — protected data is filtered before browser payload generation;
- `01 §32.3` — public caching must respect publication revocation;
- `01 §32.4` — the Web carries no authenticated or payment state.

Every Web data loader, metadata builder, JSON-LD serializer, route handler and client transition must be reviewed against those sections.

### 0.2 External configuration is not a documentation prerequisite

Provider and infrastructure configuration already completed externally is consumed as current environment state. Do not create configuration inventory files or duplicate provider dashboard IDs merely so implementation can read them.

If a remaining external action becomes necessary during implementation — for example Search Console submission, a provider-domain approval, a production browser verification, or an environment value that only exists in a dashboard — the implementation agent should perform it with its existing browser/provider access when the relevant code exists.

### 0.3 Deliverable of this document

After this document is implemented, CookPilot Web must provide:

- the existing ES/EN marketing site, preserved;
- a real-data Gallery preview on the landing;
- a full public Gallery at `/es/gallery` and `/en/gallery`;
- public search and the approved facet system;
- handle-scoped object URLs without a profile/showcase root;
- canonical public pages for recipes, menus, days, weeks, CookLists, ingredients and categories;
- semantic category/intersection and ingredient discovery pages;
- complete public object projections without browser authentication or billing;
- crawlable SEO/AEO output using the same safe public projection humans receive;
- sharing and recipe QR on Web;
- a Web surface ready for the Android bridge defined in document `03`.

---

# 1. Existing CookPilot Web baseline

Implementation starts from the current repository instead of replacing it.

At the time this implementation plan was written, the Web repository already has the following relevant baseline:

- Next.js `16.2.4`;
- React `19.2.4`;
- TypeScript;
- App Router under `src/app`;
- Supabase JS already installed;
- ES and EN route trees under `src/app/es` and `src/app/en`;
- a shared global `Header` and `Footer`;
- `LanguageContext` and localized route helpers;
- centralized static metadata helpers;
- root `Organization` + `WebSite` JSON-LD;
- `robots.ts`;
- `sitemap.ts`;
- a localized marketing landing using `HomePageContent`;
- current marketing pages for How It Works, Guides, Pro, FAQ and comparisons;
- `next/image` and an existing image/media strategy;
- an existing `/pro` marketing surface;
- Vercel as the actual Web runtime.

The current localized static route registry covers marketing routes only. CookShare must **extend**, not discard, this architecture.

### 1.1 Preserve the existing repo organization

Prefer to place CookShare Web code inside the current feature/shared organization, for example conceptually:

```text
src/
  app/
    es/
    en/
  features/
    gallery/
    public-object/
    auth-web/
    web-billing/
  shared/
    config/
    public-data/
    seo/
    ...
```

The exact local module naming is an implementation choice. Do not perform a broad directory rewrite merely to make CookShare fit a new architecture aesthetic.

### 1.2 Shared data layer, not page-local SQL

Public object projection, Gallery query parsing, indexability and canonical URL building must live in reusable server-side modules. The projection is pure public data and never depends on an actor or entitlement.

Do not embed separate raw Supabase queries in every route page.

A route page should mostly:

```text
parse route identity
→ ask shared resolver/data service
→ select the public projection
→ render
→ provide route-specific metadata/actions
```

### 1.3 Extend current route/metadata helpers

The existing `src/shared/config/routes.ts` and metadata helpers are suitable roots for expansion, but static-route helpers alone are insufficient for dynamic CookShare identities.

Add typed builders/resolvers for:

- Gallery;
- official recipe;
- user recipe;
- menu;
- day;
- week;
- list;
- ingredient;
- category/intersection;
- handle;
- semantic filter routes.

Do not scatter hand-built URL strings across components.

### 1.4 Current marketing SEO is a baseline, not the final public-object SEO system

Keep the current metadata, robots and sitemap infrastructure where it still applies.

CookShare adds dynamic metadata and dynamic sitemap content rather than replacing the existing marketing pages with generic defaults.

---

# 2. Web product boundary

CookShare Web is an acquisition and public-distribution surface: public, unauthenticated, read-only, indexable and cache-friendly.

The Web may discover, search, filter, render and share public valid CookPilot objects; generate canonical metadata and structured data; and hand a canonical intent to the existing Android app. It never authenticates a browser, resolves an owner actor, reads entitlement, performs Paddle/RevenueCat Web checkout, renders a paywall or mutates domain state.

The Web must hand off CookPlan, CookImport, CookMode, editing, generation and personalized app actions to CookPilot App. Public object rendering is complete for safe culinary content while excluding private notes, checks, reminders, health data, costs, AI reasoning, scores and planning internals.

## 2.1 No Web product account

There is no /app dashboard, login, logout, callback, confirm route, owner gallery, private Web projection or return-to-auth flow. The App keeps its existing Auth and billing independently.

---

# 3. Existing landing preservation

The existing `/es` and `/en` landing pages remain CookPilot's commercial landing pages.

### 3.1 Preserve the current hero

Do not replace or materially redesign the existing hero as part of CookShare implementation.

The current product story, Pro section, guides and existing marketing routes remain valid.

Its purpose is:

> show desirable real CookPilot content immediately, so the product proves itself through food rather than only through app screenshots and copy.

### 3.3 Use real data

The landing preview uses the same Gallery data contract as the full Gallery.

It must not use a second hardcoded food-image array pretending to be CookPilot inventory.

For the default landing preview, official recipe content from the primary Gallery source is preferred because it is stable, high quality and cache-friendly.


### 3.4 The preview is not another feed product

The landing preview:

- has a smaller item count;
- exposes only a small appetizing subset of the full filter vocabulary;
- links every object to its canonical object page;
- can open full Gallery preserving the active query/filter context;
- uses the same source/ranking semantics as Gallery;
- does not create its own ranking, search index or content corpus.

---

# 4. Global navigation changes

Extend the existing shared Header rather than introducing a CookShare-only navigation shell.

### 4.1 Gallery/Search entry

Add one compact, obvious Gallery/Search entry to the global navigation.

Behavior:

- direct Gallery activation navigates client-side to the localized `/gallery`;
- if the interaction is a search affordance, arrival should focus the Gallery search field;
- when a query is entered before navigation, navigate to `/gallery?q=...` in the active locale;
- use Next client navigation where natural; no forced full reload.

### 4.2 Public navigation state

The Header has no Web authentication or account state. It may expose Gallery, locale and the existing marketing/download actions. Object actions hand off to the app or share the canonical public URL.

### 4.3 Preserve current navigation

Keep existing marketing navigation and download behavior unless spacing requires a compact presentation adjustment.

UI composition is delegated to implementation/design judgment; this document defines behavior, not pixels.

### 4.4 Locale switching on dynamic routes

The existing static `getAlternateLocalizedRoute(pathname)` implementation cannot represent CookShare dynamic identities.

Extend locale switching so dynamic CookShare routes are rebuilt from **resolved object identity**, not from naïve string replacement.

For a real localized alternate, switch to that canonical alternate.

When no true localized alternate body exists, follow §39 rather than manufacturing a translation.

---

# 5. Gallery architecture

Gallery is the public browser for the CookPilot Public Object Graph.

It is one architecture with multiple scopes, not five separate feeds.

### 5.1 Core server contract

Create one typed public Gallery query contract conceptually equivalent to:

```text
PublicGalleryQuery
  locale
  query
  objectType
  facets
  cursor?
```

and one public result contract conceptually equivalent to:

```text
GalleryPage
  items[]
  nextCursor?
  hasMore
  normalizedQueryState
  availableFacets/contextualFacetMetadata
```

Concrete TypeScript names may differ.

### 5.2 Public card projection

Gallery cards use a dedicated **card-safe projection**.

Do not load full recipe bodies, full menu descendants or protected content to render cards.

Card-safe projection may include, when allowed for that object type:

- canonical object identity/URL;
- type;
- title;
- short public description;
- image/fallback image reference;
- time;
- servings/yield;
- public nutrition summary;
- public category/meal/type labels necessary for the card/filter context.

Cards remain lightweight; full public ingredients and steps are loaded only on object pages. Free/Pro labels are not Web semantics.

### 5.3 Server-first initial render

Initial Gallery results must be server-rendered into meaningful HTML.

Do not make `/gallery` an empty shell that only becomes useful after browser JavaScript fetches data.

Interactive filtering/infinite loading can hydrate client behavior after the first meaningful server response.

### 5.4 Incremental loading

Incremental loads may use a GET Route Handler or another existing Next-compatible read path.

The implementation must share the same Gallery query/parser/data service as the initial page.

Do not maintain two filtering implementations, one in page SSR and another in API code.

### 5.5 Query fingerprint

Define a stable query fingerprint from:

```text
locale + q + normalized public facets + object type
```

When the fingerprint changes:

- reset cursor;
- reset local seen IDs;
- reset fallback random seed;
- scroll/focus behavior may update according to normal UI conventions.

---

# 6. Landing Gallery preview

The landing preview is a bounded projection of Global Gallery.

### 6.1 Source

Use the primary recipe stream defined in §10.

Do not begin with UGC purely to make the landing look dynamic.

### 6.2 Content

Prefer a small set of visually strong, eligible recipes from real CookPilot data.

Missing user/public-object image behavior follows Foundation; however, the landing preview may prefer real-image official recipes because its job is visual product proof.

### 6.3 Interaction

Each card opens its canonical object route.

A `View more`/equivalent action opens full Gallery.

If the user activates an available preview filter, preserve it when opening full Gallery.

If the user searches from the preview/global Header, preserve `q`.

### 6.4 SEO

The preview contributes real internal links to canonical public recipes.

Do not emit a separate structured-data universe for the landing preview. The root marketing page may keep its existing Organization/WebSite markup and ordinary page metadata.

---

# 7. `/gallery` full experience

Canonical hubs:

```text
/es/gallery
/en/gallery
```

### 7.1 Default state

Default state means:

- no query;
- object type `all`;
- no user-selected filters;
- global scope.

The result is recipe-heavy.

### 7.2 State from URL

Gallery initializes its query state from validated URL query parameters.

The URL is the navigation/share state for search and filters.

Do not hide meaningful active filters solely in transient React state.

### 7.3 Infinite progression

The human UX may use incremental/infinite scrolling.

For accessibility and crawl robustness, the loading mechanism must have a non-gesture fallback such as a real load-more control and, on indexable collection pages, crawlable continuation semantics as described in §45.

### 7.4 No personalized home feed

Do not personalize default Gallery from CookPilot Home/MESA user memory in this implementation.

Signed-in and signed-out users can receive the same default public feed.


---

# 8. Gallery contexts

Use one Gallery engine with the following public contexts.

## 8.1 Global Gallery

Scope: all globally discoverable public objects supported by the selected type.

Default route: `/gallery`.

## 8.2 Search Gallery

Scope: global public objects matching `q`, optionally narrowed by facets/type.

Ranking begins with relevance.

## 8.3 Filtered Gallery

Scope: global public objects satisfying normalized facets.

No query is required.

## 8.4 Handle object context

A handle appears only as part of a concrete user-object URL. There is no handle root Gallery, profile or owner scope.

## 8.5 Landing Preview

Scope: bounded Global Gallery recipe preview.

No independent backend.

### 8.6 Context must be explicit in data layer

Do not infer identity from a client-provided arbitrary user ID. Resolve concrete public object identity through the public resolver.

---

# 9. Gallery object types

Global Gallery type controls are exactly:

```text
All / Todos
Recipes / Recetas
Menus / Menús
Days / Días
Weeks / Semanas
Lists / Listas
Ingredients / Ingredientes
Categories / Categorías
```

### 9.1 Categories

Categories are discovery/filter/semantic surfaces, not Gallery feed object cards in the primary type selector.

### 9.2 CookLists

Public valid CookLists participate in the main global Gallery and public search. They remain read-only on Web, exclude checked/purchased/private state and are indexable through their canonical object routes.

### 9.3 `All`

`All` is recipe-heavy.

Recipes are the backbone stream. Menus, weeks and days may be inserted as useful variety. Ingredients may appear when context/relevance supports them but should not dominate the default visual feed.

No mathematical equality between object types is required or desired.

---

# 10. Gallery feed sourcing

## 10.1 Primary recipe source

When Gallery needs the default recipe stream and there is no query/facet combination that invalidates the bank as a source, use:

```text
home.cookmatch_recipe_bank
```

as the initial ordered recipe source.

Use its existing prepared fields and ordering semantics, especially:

- `bank_rank`;
- `recipe_id`;
- `component_type`;
- `slot_profile`;
- prepared public time/nutrition fields where they are part of the safe card projection. Cost fields are never a Web visibility signal.

Do not create another “best recipe” score.

DO NOT RESOLVE ELEGIBILITY, JUST RENDER THEM
### 10.3 Search/filter incompatibility

When an active query or facet cannot be satisfied correctly from the bank fields/source alone, query the authoritative recipe/domain sources rather than pretending the bank supports that facet.

Do not use client-side filtering of only the first bank page as if it were a global search.

### 10.4 Other object streams

Menus/days/weeks use existing durable object sources and the CookShare public resolver.

Ingredients use `nutrition.ingredients` through the ingredient public projection.

Do not create Web copies.

---

# 11. Default ranking

## 11.1 Recipes before bank exhaustion

Default recipe order follows existing bank order:

```text
bank_rank ASC
+ stable recipe identity tie-break
```

### 11.2 No social/popularity score

Do not rank default Gallery by:

- likes;
- followers;
- public view count;
- arbitrary “trending” score;
- freshness bonus.

### 11.3 Search mode

When `q` is present, relevance outranks official-vs-user origin.

A public eligible user recipe may outrank an official recipe if it better matches the query.

Tie-break after relevance should prefer useful/complete content and a stable deterministic identity order, not newest-first.

### 11.4 Filter-only mode

With filters but no query:

- use the most natural existing domain order when one exists;
- otherwise use a stable deterministic order for the current query fingerprint;
- do not silently turn filter pages into newest-first feeds.

### 11.5 `All` composition

The recipe stream remains majority/backbone.

Non-recipe streams are inserted opportunistically without blocking the feed waiting for type quotas.

Do not produce long default runs dominated by days/weeks/ingredients merely to “balance” object counts.

---

# 12. Exhaustion/fallback feed behavior

When the primary recipe bank is exhausted, continue from:

```text
menu.recipes
```

under the following contract.

### 12.1 Active query/filter

Apply the active search/facet state to the fallback recipe source.

Do not fallback to unrelated random content that violates active filters.

### 12.2 Default state

When there is no search/facet state, fallback recipe order is randomized for the Gallery browsing session.

Prefer a **deterministic random seed + stable hash order** over repeated `ORDER BY random()` calls when practical:

```text
new Gallery query session
→ random seed generated once
→ recipe_id + seed produce stable pseudo-random order
→ cursor pages through that order
```

This gives the required random experience without backend “seen” persistence and avoids repeatedly fetching the same random rows.

### 12.3 Cross-source exclusion

Fallback must exclude/skip recipes already emitted from the bank in the current Gallery traversal.

Client-side seen IDs remain the final duplicate guard.

### 12.4 Exhaustion

When every eligible fallback recipe for the active query has been traversed:

- set `hasMore=false`;
- stop requesting more pages;
- do not loop/reseed silently just to make an “infinite” feed truly infinite.

---

# 13. Local deduplication

Maintain a local `seenRecipeIds`/equivalent set for the current Gallery query session.

### 13.1 Scope

The set applies across:

- bank pages;
- fallback pages;
- mixed `All` composition when the same recipe could appear through more than one source.

### 13.2 Reset

Reset when the normalized Gallery query fingerprint changes.

### 13.3 Persistence

Do not create:

- a database seen-history table;
- a user preference;
- a backend session store;
- an analytics-driven exclusion service.

In-memory client state is sufficient. `sessionStorage` may be used only if useful for ordinary browser navigation restoration; it is not a product requirement.

### 13.4 Duplicate cards across object types

A menu containing a recipe is not a duplicate of the recipe card itself. Deduplication is by public object identity within the same object type, not semantic resemblance.

---

# 14. Search behavior

Public search is cross-object discovery over public projections.

### 14.1 Input

Query parameter:

```text
q
```

Trim whitespace, normalize according to existing search conventions and reject malformed input under Foundation §32.7.

### 14.2 Matching

Reuse existing normalized fields, aliases and current CookSearch/domain search logic wherever applicable.

Support:

- localized official titles;
- user-public titles;
- ingredient names/aliases;
- category/tag terms where they are real metadata;
- handles/public user display names according to Foundation public identity;
- menu/day/week/list titles.

Do not use an LLM to reinterpret every search query.

### 14.3 Diacritics/case

Search should be case-insensitive and use the same accent/normalization semantics already used by the domain where possible.

Do not display normalized strings as the user's content.

### 14.4 `All` search

Searches all supported public object classes.

Results may be grouped or intermixed according to the Gallery presentation, but relevance remains object-aware.

### 14.5 Type-selected search

When a Gallery type is selected, search is restricted to that type.

### 14.6 Lists

Public CookLists participate in global Gallery and public search when their projection is valid. Keep the default All feed recipe-heavy.

### 14.7 Handles

A handle/name match may help navigate to a concrete public object route. It never opens a profile or root handle Gallery.

### 14.8 Search zero state

Empty `q` means default/filter feed, not a query for every object.

### 14.9 Zero results

A zero-result search is a valid `200` Gallery state with:

- clear empty state;
- current filters/query visible;
- ability to clear/narrow differently;
- no AI-generated fake result;
- no indexing of the query URL.

---

# 15. Filter/facet system

This is the approved full facet vocabulary. UI does not need to expose every facet simultaneously. The data/query contract must support them coherently.

The implementation should present quick/high-value controls and a deeper filter surface according to context, without turning the top of Gallery into dozens of permanent chips.

## 15.1 Object type

```text
all
recipes
menus
days
weeks
lists
ingredients
categories
```

Handle context may additionally support lists.

## 15.2 Dynamic recipe taxonomy

Source from current category/taxonomy data.

Support:

- all root categories;
- all child categories;
- multiple category combinations;
- parent/child semantics from the existing taxonomy.

Do not hardcode the currently observed category count. Categories are data.

## 15.3 Meal moment

Use the existing `slot_profile`/domain mapping.

Public human-facing values:

```text
breakfast
morning snack
lunch
afternoon snack
dinner
late night
```

Keep locale labels separate from stored/domain identity.

If a recipe has no reliable meal-moment mapping, it simply does not match a positive meal-moment filter. Do not infer with AI.

## 15.4 Component type

Support current component identities, including:

```text
main_dish
appetizer
dessert
beverage
salad
side_dish
sauce
```

Use actual enum/domain values as source of truth.

## 15.5 Time

Support:

- total time;
- active time;
- passive time;
- quick presets such as ≤15, ≤30, ≤45, ≤60 minutes;
- explicit min/max range where useful.

Missing time is `unknown`, not zero.

## 15.6 Ingredients

Support recipe filters for:

- contains ingredient X;
- excludes ingredient X;
- multiple included ingredients;
- multiple exclusions;
- primary ingredient when current data can derive it deterministically;
- ingredient category/family where current ingredient taxonomy supports it.

Use ingredient canonical identity internally and canonical/localized slug in URL state.

Do not derive “primary ingredient” with a new AI job solely for this filter.

## 15.7 Nutrition quantitative facets

Support available current recipe profile values:

- kcal;
- protein;
- carbohydrates;
- fat;
- fiber;
- nutritional score.

Use ranges and a small number of human shortcuts.

Missing data must not be coerced to zero.

## 15.8 Nutritional badges

Load the **actual available badge vocabulary from the source of truth**.

Do not hardcode an arbitrary subset or a count such as “29 badges” into Web code.

Locale presentation maps badge identity to human labels.

## 15.9 Cost

Costs and prices are outside CookShare Web. Do not expose numeric cost facets or use cost as an entitlement/discovery signal. A canonical semantic category may be used only when it is an ordinary public category from the source domain.

## 15.10 Yield / servings

Support recipe servings/yield ranges when the source value is reliable.

Do not infer serving count from ingredient quantities on Web.

## 15.11 Taste

Use MESA only as enrichment.

Expose normalized human taste facets such as:

```text
sweet
salty
umami
sour
bitter
spicy
```

Inspect current MESA data and define one finite normalization map in shared server/domain code.

Do not expose raw internal MESA labels/scalars as consumer-facing filters.

Taste is **filter-only** in this implementation. It does not create SEO route dimensions.

## 15.12 Texture

Normalize existing MESA texture data into a finite human facet vocabulary.

Rules:

- mapping must be deterministic;
- locale labels are presentation-only;
- raw MESA strings do not become public route slugs;
- texture is filter-only;
- no new MESA analytics/AI pipeline is created for filtering.

## 15.13 Access

There is no Free/Pro access facet on Web. Public discovery filters only object type and real canonical metadata.

## 15.14 Ingredient-specific facets

When `type=ingredients` or the current surface is ingredient-centric, support available ingredient dimensions:

- ingredient category;
- matrix/family classification;
- raw/cooked state where modeled;
- nutritional processing type, including current domain values such as natural/minimally_processed/processed/ultra_processed when present;
- calories/macros/fiber;
- useful micronutrient ranges;
- useful amino-acid ranges.

Do not expose every micronutrient/amino field as a permanent top-level chip. The query layer can support them while UI exposes a curated contextual selection.

## 15.15 Composite-object facets

Menus/days/weeks may support facets derivable from their descendant recipes only when existing data/resolvers make the derivation natural and inexpensive.

Examples:

- nutrition totals already available;
- meal moment/slot membership already present;
- total/aggregate time where existing domain semantics define it;
- categories represented by constituent recipes.

Do not create a new analytics/materialization backend merely so one composite filter becomes possible.

## 15.16 Cuisine/country and other real metadata

Cuisine/country can be used when current recipe metadata contains reliable, real values.

Do not infer cuisine from recipe title using an LLM solely to increase filter/SEO surface area.

---

# 16. Filter state and URLs

Gallery filters are navigable/shareable state.

### 16.1 Base shape

Example only:

```text
/es/gallery?q=pollo&type=recipes&category=alta-proteina&meal=lunch&time_max=30
```

The implementation may choose concise final key names, but they must be centralized and typed.

### 16.2 Serialization rules

Canonicalize query state:

- omit defaults;
- omit empty values;
- normalize enum casing;
- use canonical localized slugs rather than database UUIDs;
- stable-sort multi-value filters;
- stable-sort query keys;
- enforce one serialization form for equivalent state.

This prevents URL variants for the same filter state.

### 16.3 Multi-value parameters

Use one consistent encoding, preferably repeated query keys for multi-select values:

```text
category=alta-proteina&category=economicas
```

Do not support multiple equivalent encodings indefinitely.

### 16.4 Protected facet normalization

If the actor is not entitled to a facet such as numeric cost, remove/ignore that facet server-side and return normalized state accordingly.

### 16.5 Indexing

Gallery query/filter URLs are normally:

```text
noindex, follow
```

They remain crawlable enough for crawlers to observe `noindex`; do not use robots.txt as the primary noindex mechanism.

### 16.6 Canonical for filtered Gallery

If the filter state maps exactly to a clean semantic CookShare route, canonical metadata should point to that semantic route.

Otherwise canonical points to the localized base Gallery hub.

Search query URLs never become canonical keyword pages merely because users search them.

### 16.7 Locale switch

Internally retain stable facet identity.

When locale changes:

- rebuild localized category/ingredient slugs;
- keep numeric ranges/enum identities;
- preserve `q` as user input unless the product has a real translated query model;
- do not machine-translate arbitrary search text.

---

# 17. Handle-scoped object URLs

Handles remain routing segments for user-owned public objects and historical aliases. They do not create a profile, showcase, owner gallery or private mode.

Valid forms include /es/@handle/recetas/{slug}, /es/@handle/menus/{slug}, /es/@handle/dias/{slug}, /es/@handle/semanas/{slug}, /es/@handle/listas/{slug} and their English equivalents. A root /@handle request without an object returns the normal 404/unavailable result. Handle search may navigate to concrete public objects only.

# 18. Public object pages

## 18.1 Recipe

Resolve through home.rpc_resolve_cookshare_public_content. For a public valid recipe, render the complete safe culinary projection: title, description, image, time, servings, categories, all ingredients with quantities/units and all ordered steps. No Free/Pro branch, entitlement lookup, premium preview, paywall or browser state exists.

## 18.2 Menus, days, weeks and CookLists

Resolve the public container recursively. Render its public title/context, order, moments, days, components, recipes, ingredients and quantities as available. Exclude checked/purchased state, owner notes, reminders, health data, costs and other private planning metadata. Public CookLists participate in global Gallery and indexability.

## 18.3 Ingredient, category and intersections

Use canonical identity and semantic routes. Valid public results are indexable; invalid or empty intersections return 404. Category projection joins recipe assignments through the recipe id and category id.

## 18.4 Metadata and structured data

HTML, RSC, metadata, JSON-LD and API responses derive from the same public projection. Recipe JSON-LD includes the complete public ingredients and instructions when available. Clean public object routes are indexable; arbitrary Gallery query/filter URLs remain noindex,follow.

# 29. Web authentication

There is no Web authentication. Landing, Gallery, search, semantic pages, public object pages and sharing are available without a session. The Web does not create anonymous Auth users, refresh cookies, expose callback/confirm handlers or preserve authenticated return state. CookPilot App Auth remains unchanged.

# 30. Web billing and entitlement

There is no Paddle or RevenueCat Web runtime, offering fetch, entitlement read, purchase flow, reconciliation, billing cookie or payment environment variable. CookPilot App remains the sole consumer of native CookBilling, RevenueCat, Google Play Billing, Huawei IAP and the canonical Free/Pro entitlement.

# 31. Public continuation

Open/Cook in CookPilot sends only a validated canonical CookShare URL and optional action. The app re-resolves the object and applies its own Auth and Free/Pro rules. Web never carries entitlement or claims that a Web view grants native access.

# 32. Web-to-App handoff

Web sharing and Open/Cook in CookPilot may carry only a validated canonical CookShare URL and optional view/cook action. There is no Web purchase, auth continuation cookie, entitlement refresh or return-to-object-after-payment state. The Android coordinator defined in document 03 owns pending intent, Auth interruption and native Free/Pro continuation after the handoff.

# 33. Public sharing UX contract

Sharing emits canonical identity, not a special campaign object.

### 33.1 Web share priority

Use:

1. Web Share API when supported and contextually appropriate;
2. Copy Link;
3. WhatsApp explicit action/fallback.

### 33.2 Shared text

Keep text short and object-specific.

The canonical URL remains visible/usable without the share text.

### 33.3 Canonical URL

Always resolve the current canonical CookShare URL before sharing.

Do not share:

- internal UUID URL;
- Vercel preview URL;
- Huawei wrapper;
- auth callback URL.

### 33.4 Share from Web

Web shares only an already-public canonical object URL. Publication and unpublication remain App-owned; a private object has no shareable Web URL.

### 33.5 Social metadata

Sharing previews use §35/§38 public-safe metadata.

No generated menu/day/week image-card pipeline is required.

---

# 34. QR

### 34.1 Recipe QR

Generate QR client-side or otherwise without a dedicated QR backend service.

Payload:

```text
canonical public recipe URL
```

### 34.2 No secrets/actions

Do not encode:

- tokens;
- user identity;
- `cook` action;
- provider wrapper.

### 34.3 Other object types

Menu/day/week/list QR uses the same canonical public URL transport and carries no privileged state.

### 34.4 App download QR

Existing/marketing app-download QR may remain a separate marketing use case.

---

# 35. SEO foundations

SEO is generated from real public objects and current public projections.

### 35.1 Server-readable HTML

Indexable pages must provide meaningful content in initial HTML/RSC rendering.

Do not require crawler execution of a complex client fetch before title/main content/links exist.

### 35.2 Dynamic metadata

Use Next `generateMetadata` for dynamic CookShare pages.

Metadata builder receives the same public resolver identity/projection used by the page.

Do not query a broader unrestricted table solely for metadata convenience.

### 35.3 Metadata fields

For indexable public pages, produce truthful localized:

- title;
- meta description;
- canonical;
- robots;
- Open Graph title/description/url;
- Twitter metadata;
- real image when appropriate;
- locale/alternates when real.

No keyword stuffing.

### 35.4 Description fallback

Priority:

1. real public object description;
2. deterministic concise summary from already-public structured fields;
3. localized surface description.

Do not call AI to generate thousands of SEO descriptions during request/build time.

### 35.5 Metadata confidentiality

Metadata is always built from anonymous/crawler-safe public projection.

Metadata is independent of any browser actor because Web has no session or Pro branch. A private/unpublished route returns 404 metadata and no public projection.

### 35.6 Open Graph images

Recipe:

- use the real recipe image when available and publicly accessible;
- existing 1:1 image is sufficient for this product contract;
- do not create multiple aspect-ratio pipelines solely because a search engine recommends them.

Menu/day/week/list/ingredient/category:

- use existing meaningful image when the domain genuinely has one;
- otherwise use the current CookPilot default brand OG image;
- do not generate decorative per-object OG cards as a P0 requirement.

### 35.7 Existing Organization/WebSite JSON-LD

Keep the current root Organization/WebSite graph, updating only if needed to coexist cleanly with page-specific structured data.

Do not duplicate Organization definitions with conflicting IDs on every page.

### 35.8 Trusted JSON-LD serialization

JSON-LD may contain public UGC strings.

Do not insert raw `JSON.stringify(userData)` into `dangerouslySetInnerHTML` without a serializer that escapes script-breaking characters such as `<`/`</script>` and other relevant unsafe separators.

Create one safe JSON-LD serializer/helper and use it everywhere.

This is a Web-specific implementation of Foundation XSS rules.

---

# 36. Recipe structured data

Use `Recipe` JSON-LD only when the page truthfully represents a particular dish and required data is valid.

### 36.1 Google eligibility baseline

The current Google Recipe contract requires at minimum:

- `name`;
- a real `image` representing the completed dish.

Other useful fields are recommended rather than universally required.

### 36.2 Full public/Free-accessible recipe

When a recipe's full content is publicly available, emit available truthful fields such as:

```text
@type: Recipe
name
image
description
recipeYield
nutrition
prepTime / cookTime / totalTime
recipeCategory
recipeCuisine
recipeIngredient
recipeInstructions
```

Only include fields actually supported by current data.

### 36.3 Instructions

Use `HowToStep`/`HowToSection` only when current recipe sections/steps map cleanly.

Preserve existing CookPilot step order and section grouping.

Do not fabricate step names merely to fill schema fields.

### 36.4 Public recipe content

A public valid recipe uses the same complete safe culinary projection for humans, crawlers and JSON-LD. Include all available truthful ingredients and ordered instructions. Free/Pro and premium lineage do not remove fields from Web structured data. Costs, private metadata and CookPilot intelligence remain excluded.

### 36.5 Complete recipe fields

Do not emit a first-five or otherwise redacted recipe schema. Either emit the complete available public recipe fields or omit the Recipe schema when required truthful data is absent.

### 36.6 Missing real image

If the recipe only has a generic CookPilot placeholder/fallback image, do not emit `Recipe` rich-result JSON-LD using that placeholder as the completed-dish image.

The page remains indexable as an ordinary Web page.

When a real compliant dish image later exists, Recipe structured data can become eligible automatically.


### 36.8 Nutrition

Only include per-serving nutrition fields when serving/yield semantics are known and consistent.

Use the current canonical quantity/unit/nutrition domains.

### 36.9 Ratings

Do not emit `aggregateRating` or reviews because CookPilot does not have a canonical public rating system in scope.

### 36.10 Video

Do not emit `VideoObject`; recipe video is not part of this implementation.

### 36.11 Author

Official recipes may identify CookPilot as Organization author when current product/content ownership supports that statement.

For user recipes, do not expose new public provenance solely to fill optional schema author. Omit author unless current public user identity semantics clearly support it.

### 36.12 Validation

Before production acceptance:

- validate representative Free official recipe;
- premium official recipe;
- public personal/imported recipe with real image;
- recipe without real image;

against current Rich Results validation tools.

---

# 37. ItemList / collection structured data

Use `ItemList` only where the page visibly presents a real list/collection.

### 37.1 Recipe host-carousel candidates

Strong candidates:

- category pages;
- category intersections;
- ingredient→recipes pages;
- other indexable semantic recipe collection pages.

### 37.2 Requirements

For recipe collection `ItemList`:

- every ListItem URL is a unique canonical recipe URL;
- positions match the initial visible server-rendered recipe order;
- every referenced item is actually represented on the page;
- do not include private/non-visible items;
- do not include pages that only exist in a client-only hidden next batch.

### 37.3 Gallery

Base mixed `All` Gallery does not need to chase Recipe host-carousel eligibility.

It may emit a generic `ItemList` only if that accurately describes the initial mixed rendered list.

Prefer semantic recipe collection pages for recipe host-carousel markup.

### 37.4 Infinite scroll

JSON-LD for initial response covers the initial visible list.

Do not generate an enormous ItemList containing every item that infinite scroll could eventually load while the HTML only shows the first batch.

### 37.5 Composite objects

Menu/day/week may use generic `ItemList`/`BreadcrumbList` when truthful, but do not over-mark every nested array.

Structured data is a semantic description, not a mirror of the full database graph.

---

# 38. Canonicals

### 38.1 Self-canonical object pages

Current canonical public object route self-canonicalizes.

### 38.2 Aliases

Historical slug/handle aliases permanently redirect to the current canonical route under Foundation identity rules.

Do not serve alias and canonical as two `200` pages.

### 38.3 HTTP/host variants

Canonical is always HTTPS on `cookpilot.pro`.

Do not canonicalize to Vercel hostnames or `www` when the canonical product host is the apex.

### 38.4 Filter/search variants

Follow §16.6.

### 38.5 Tracking parameters

If non-canonical tracking parameters ever appear, metadata canonical remains the clean object URL.

Do not encode provider/payment attribution into canonical identity.

### 38.6 Pagination

Continuation/pagination pages of a semantic collection should not compete as independent canonical keyword pages.

Use the collection root as canonical unless a future SEO requirement deliberately promotes paginated pages.

---

# 39. `hreflang`

### 39.1 True alternates only

Emit ES/EN `hreflang` alternates only when there is a real equivalent content representation.

### 39.2 Official content

Official recipes/categories/ingredients with actual localized content can self-canonicalize per locale and cross-link via `hreflang`.

### 39.3 User content without a real translation

Do not treat a translated Header/Footer around identical user body content as a translated alternate.

The public identity resolver must expose one deterministic canonical locale for a single-language user object. If the current domain lacks a real multilingual user-content model, the alternate locale shell may remain navigable for UI continuity but:

- does not emit a false `hreflang` pair;
- canonicalizes to the object's stable canonical-locale route;
- does not machine-translate the user content.

The canonical locale should be stable as part of the object's public identity, not recalculated from the visitor's current language on every request.

### 39.4 `x-default`

Use `x-default` for truly localized public surface families where the existing site localization architecture benefits from it.

Do not invent `x-default` variants for user objects that have only one canonical content representation.

---

# 40. Sitemap strategy

The current static sitemap must expand to real CookShare objects.

### 40.1 Include

Include only canonical indexable URLs for:

- current marketing pages;
- official recipes;
- eligible public user/imported recipes;
- eligible public menus;
- eligible public days;
- eligible public weeks;
- canonical ingredients;
- canonical categories;
- valid indexable semantic intersections;
- indexable public handles.

### 40.2 Exclude

Exclude:

- private objects;
- unpublished objects;
- deleted objects;
- CookLists;
- `/auth/*`;
- `/api/*`;
- Gallery search/filter URLs;
- alias URLs;
- Vercel/provider URLs;
- owner-private projections.

### 40.3 `lastModified`

Use meaningful object timestamps when available:

- current object/public update timestamp;
- publication update where appropriate;
- taxonomy/ingredient update timestamp.

Do not set every URL to `new Date()` on every sitemap request solely to look fresh.

### 40.4 Publication freshness

The sitemap must not remain stale after a user unpublishes an object.

Next metadata sitemap routes are cacheable by default. Therefore, when the sitemap includes mutable public user state, either:

- opt that dynamic portion out of stale shared caching; or
- implement reliable invalidation from publication mutations.

For current scale, favor correctness and a live/dynamic public-state query over building an invalidation subsystem solely for sitemap.

### 40.5 Size

A single sitemap supports current expected CookShare scale while the total canonical indexable URL count remains comfortably below search-engine limits.

Use the current standard maximum of 50,000 URLs / 50 MB uncompressed as the hard split boundary.

Do not prematurely create dozens of sitemap shards.

When approaching the limit, split by stable object families, e.g. recipes, ingredients, taxonomy, user objects, and expose a sitemap index/robots references using current Next capabilities.

### 40.6 Localized alternates

Add sitemap language alternates only under the same true-alternate rules as §39.

### 40.7 Post-deploy external action

After production pages exist, the implementation agent can submit/refresh the production sitemap in Search Console using browser access.

This is a post-deploy verification action, not a user-authored configuration document.

---

# 41. Indexability eligibility

Indexability is computed from current object state/public projection. Do not necessarily persist an `is_indexable` boolean.

Use the following minimum contract.

## 41.1 Global prerequisites

An indexable object page must:

- be public under Foundation rules;
- resolve to one canonical URL;
- return `200` for anonymous/crawler;
- not be administratively disabled;
- have a non-placeholder title/identity;
- contain useful object-specific public content;
- not be an alias/duplicate/filter-search state.

## 41.2 Official recipes

All existing valid official recipes are indexable, including recipes that are premium inside CookPilot App, through their complete public culinary projection.

Recipe rich-result eligibility is separately stricter because it requires a real dish image.

## 41.3 Public personal/imported recipes

Indexable when the underlying recipe is domain-valid and meaningfully culinary.

Minimum usefulness:

- valid title; and
- at least one substantive preparation/content signal, such as a real description **or** a usable ingredient+instruction structure.

A practical implementation check for structured user recipes may use:

```text
(description is substantive)
OR
(>= 2 real ingredients AND >= 1 real instruction/step)
```

Do not require an image.

A premium-lineage recipe is indexable when it is public and valid; its crawler projection is the same complete safe public projection as the human page.

## 41.4 Menu

Indexable when public/domain-valid and contains at least one resolvable food-bearing recipe/component.

## 41.5 Day

Indexable when public/domain-valid and contains at least one non-empty real meal moment/menu/recipe.

Do not index a completely empty saved day shell.

## 41.6 Week

Indexable when public/domain-valid and meaningfully represents a week, using either:

```text
>= 2 non-empty days
OR
>= 3 food-bearing meal/menu/recipe entries across the week
```

This prevents effectively-empty week pages while remaining permissive.

## 41.7 CookList

Public valid CookLists are indexable through their canonical object routes, subject to the same deterministic usefulness checks as other public containers.

## 41.8 Ingredient

Every real canonical ingredient is indexable. No recipe-usage threshold.

## 41.9 Category

Every real canonical category is indexable. No inventory threshold.

## 41.10 Category/semantic intersection

Indexable when all semantic identities are valid and at least one indexable result currently exists.

No 5/10-result minimum.

## 41.11 Handle

There is no root handle surface to index. Concrete public user-object routes containing a valid handle are indexable; /@handle alone is 404.

## 41.12 Quality/spam restraint

Do not introduce an AI “quality classifier” for initial indexability.

Use domain validity, public state and simple deterministic completeness rules.

If user-generated spam later becomes a real volume problem, design moderation separately from this implementation.

---

# 42. Discoverability eligibility

Global Gallery discovery is stricter than public reachability but should remain deterministic and lightweight.

### 42.1 Global prerequisites

Discoverable object must:

- be public;
- be currently resolvable;
- have a card-safe projection;
- meet the relevant minimum completeness needed to be useful in Gallery;
- not be administratively disabled;
- not be excluded by object-type policy.

### 42.2 Recipes

Official valid recipes are default discoverable.

Public user/imported recipes can be discoverable when they satisfy recipe indexability usefulness and have a usable card projection.

Missing image does not automatically disqualify; use the standard CookPilot fallback card behavior.

### 42.3 Menus/days/weeks

May enter global `All` when they meet their indexability/usefulness rules and can be represented without premium leakage.

### 42.4 CookLists

Public valid CookLists may enter global Gallery and relevant search. The default All feed remains recipe-heavy.

### 42.5 Ingredients

Discoverable in:

- ingredient type tab;
- ingredient-relevant search;
- semantic internal links.

Do not aggressively insert ingredients into the default recipe-heavy `All` feed.

### 42.6 Public but non-discoverable

A user may still share/open a public object that does not meet global Gallery eligibility.

Do not treat Gallery exclusion as unpublication.

### 42.7 No popularity/freshness

Discoverability does not require likes, views, freshness or follower data.

---

# 43. AEO / GEO / AI crawler visibility

CookShare should be easy for answer engines to parse **without creating a separate AI-facing site**.

### 43.1 Same projection

AI/search crawlers receive the same anonymous public projection as a human.

No crawler-only premium fields.

### 43.2 OAI-SearchBot

Do not block OAI-SearchBot from public indexable pages.

The current broad public robots behavior is compatible as long as future robots/CDN/bot controls do not introduce a block.

After production deployment, the agent should verify actual crawler reachability with current published crawler guidance/IP behavior if the hosting/security layer changes.

### 43.3 Answer-ready HTML

Public pages should use ordinary semantic structures that make factual extraction easy:

- descriptive H1;
- concise public description;
- labeled time/servings/nutrition facts;
- ingredient list when public;
- ordered instructions when public;
- clear category/ingredient headings;
- meaningful links.

Do not hide core facts behind hover-only UI.

### 43.4 No prompt-page spam

Do not generate routes such as:

```text
/que-cocino-si-tengo-pollo-y-quiero-30g-proteina...
```

from arbitrary queries/prompts.

Use real recipe, ingredient, category and finite semantic collection identities.

### 43.5 Query fan-out

Search demand can inform future internal-link/semantic-route prioritization, but it must map back to real CookPilot objects/taxonomy.

No generic AI-generated landing-page factory.

### 43.6 No `llms.txt` P0

Do not spend implementation scope on `llms.txt` as a P0 requirement.

Standard crawlability, semantic HTML, canonical URLs and public data quality have priority.

### 43.7 No fake SEO metadata layer

Do not run an LLM to rewrite every recipe title/description into SEO copy.

Use structured domain content.

---

# 44. Semantic HTML / accessibility

CookShare's public content must remain useful without perfect pointer interaction.

### 44.1 Landmarks

Use real semantic regions:

- Header/nav;
- `main`;
- search form;
- result list/grid semantics;
- article/section for public objects;
- footer.

### 44.2 Headings

One meaningful page H1.

Preserve logical heading hierarchy for sections.

Do not render visual text as generic `div` when it is semantically a heading/list.

### 44.3 Recipe semantics

Use actual list/ordered-list semantics for ingredients/instructions when public.

### 44.4 Filter controls

Every filter is keyboard operable and has an accessible name/current state.

A deep filter panel/dialog must trap/restore focus correctly if implemented as a modal/dialog.

### 44.5 Search

Search input has a real label accessible to assistive technology.

Announce meaningful result-count/loading changes without flooding `aria-live`.

### 44.6 Infinite loading fallback

Provide an explicit load-more mechanism reachable by keyboard and screen reader even if IntersectionObserver auto-loading is also used.

### 44.7 Images

Real dish images use concise meaningful alt text based on the dish/object, not SEO keyword lists.

Pure decoration uses empty alt/`aria-hidden`.

### 44.8 Motion

Respect reduced-motion preferences, consistent with the current Web implementation.

### 44.9 Public actions

Share, copy, QR and Open/Cook in CookPilot controls must have accessible names, preserve focus and surface errors without introducing login or paywall dialogs.

---

# 45. Search-engine crawl controls

### 45.1 `robots.ts`

Keep public indexable content crawlable.

The current API and Vercel-internal disallow behavior may remain.

Do not add a broad `Disallow` for filter/query pages when those pages rely on `noindex`; crawlers need to be able to see the noindex directive.

### 45.2 Private content

Private content is prevented by authorization/404 behavior, not robots.

### 45.3 Search/filter crawl trap

Controls that generate unbounded query combinations should not create a crawlable anchor graph of every permutation.

Prefer client state controls for arbitrary facet combinations.

Provide normal crawlable links to clean semantic category/ingredient routes.

### 45.4 Pagination/infinite scroll crawlability

Search engines may not trigger infinite scroll interactions.

For indexable semantic collection pages:

- initial page renders real item links server-side;
- provide a crawlable continuation/load-more URL or equivalent progressive-enhancement anchor;
- continuation URLs may be `noindex, follow` and canonicalize to the collection root;
- sitemap independently enumerates every canonical object URL.

This ensures deep inventory discovery without making pagination pages compete in Search.

### 45.5 Status codes

Indexable pages return real `200`.

Unknown/deleted/private-to-public return real `404`.

Permanent aliases return permanent redirect.

Do not return `200` “not found” pages.

### 45.6 Bot protection

Do not introduce CAPTCHAs/challenges on public indexable routes as a default anti-abuse mechanism.

Rate-limit expensive application endpoints proportionally while keeping legitimate crawler HTML access intact.

---

# 46. Internal linking

Internal links are part of the product graph, not an SEO-only footer dump.

### 46.1 Landing

Gallery preview links to real canonical recipes and Gallery.

### 46.2 Recipe

Link real ingredients/categories and other naturally related semantic surfaces.

### 46.3 Ingredient

Link relevant recipes and relevant category contexts.

### 46.4 Category/intersection

Link:

- parent/root category;
- child categories;
- visible recipes;
- selected valid related intersections;
- relevant ingredient semantic pages.

Do not list every possible combinatorial sibling.

### 46.5 Composite objects

Menu/day/week link visible descendant public recipe/menu identities.

### 46.6 Handle

Link concrete public objects under a handle. Do not link to a root profile/showcase.

### 46.7 Canonical preference

When a clean semantic route exists, internal linking should prefer it over an equivalent `/gallery?...` filter URL.

### 46.8 Descendants

Link visible public descendants to their canonical routes. App Free/Pro behavior begins only after a native handoff.

---

# 47. Error / 404 states

### 47.1 Real 404 cases

Use localized `notFound()`/equivalent for:

- unknown object;
- deleted object;
- private or unpublished object;
- root handle without a concrete object;
- invalid semantic segment;
- empty derived intersection that has no canonical identity;
- unsafe alias resolution.

### 47.2 Canonical category/ingredient empty state

A real canonical category or ingredient does **not** become 404 merely because its current recipe result list is empty.

Those identities remain valid under product decision.

### 47.3 Search zero results

Gallery search/filter zero-result state is `200 noindex`, not 404.

### 47.4 Temporary backend failure

Do not convert Supabase/provider outages into object 404s.

Return appropriate error/retry/5xx behavior so search engines do not interpret infrastructure failure as deletion.

### 47.5 Public resolver failure

If the public resolver cannot be trusted, return an appropriate retry/5xx response. Never fall back to an actor, billing or partially redacted projection.

### 47.6 Deleted public object UX

404 page may provide localized navigation back to Home/Gallery.

Do not redirect automatically.

---

# 48. Performance constraints

Performance serves acquisition but must not compromise access correctness.

### 48.1 Server-first, client-light

Do not make every public page a giant client component.

Use Server Components/data loaders for:

- public object resolution;
- initial Gallery results;
- metadata;
- JSON-LD;
- semantic collection pages.

Hydrate only interactions that require browser state.

### 48.2 Card data

Gallery/card queries fetch only fields needed for cards/filter continuation.

Never fetch full steps/ingredients for every visible recipe card.

### 48.3 Batched composite resolution

Resolve menu/day/week descendants in batches to avoid N+1 database calls.

### 48.4 Images

Use current Next/image + CookPilot CDN/media behavior.

Provide responsive `sizes`, lazy-load below-fold images and prioritize only actual LCP/critical images.

Do not mark a whole Gallery page's images `priority`.

### 48.5 Public caching tiers

Use a simple correctness-first policy:

**Marketing/static taxonomy shell / stable official content**  
May use normal safe shared caching/revalidation.

**Mutable user-owned public object, handle, UGC-containing public feed**  
Prefer live/dynamic data until there is a reliable publication invalidation path. Unpublish must not leave stale public payloads.

**Public mutable UGC and publication state**
Use short revalidation or reliable invalidation so unpublish and edits become visible quickly.

Do not build a complex cache-invalidation subsystem solely for launch.

### 48.6 Gallery pagination

Use cursor/keyset-style continuation where the source has stable ordering.

For bank recipes, cursor may encode `bank_rank + stable recipe identity`.

For seeded fallback, cursor encodes seed/order position in an opaque validated form.

For relevance search, use existing stable search pagination contract where available; add deterministic tie-breaks.

### 48.7 Batch size

Use a bounded server page size suitable for image-heavy browsing. Keep it configurable in one place.

Do not let clients request arbitrary thousands of records per page.

### 48.8 Facet metadata

Cache stable facet vocabularies such as category identity/labels when safe, but do not hardcode counts.

### 48.9 Metadata requests

Avoid independently fetching the same object multiple times for page + metadata if Next/request memoization or shared resolver calls can reuse the result safely.

### 48.10 Random fallback

Prefer seeded deterministic ordering over expensive per-page global random sorting when feasible.

---

# 49. Analytics

Not neccesary

### 49.1 Required semantic moments

Instrument the existing analytics equivalent of:

| Moment | Minimum useful context |
|---|---|
| Gallery viewed | locale, context, object type |
| Search submitted | locale, selected type, sanitized query characteristics |
| Facet applied/removed | facet identity, context |
| Gallery object opened | source context, object type |
| Public object viewed | object type, acquisition context |
| Share action | channel, object type |
| Native handoff initiated from object | object type, action context |
| Public object rendered | object type, locale, source context |
| Open-in-app initiated | object type/action; completion belongs to document 03 when measurable |

### 49.2 Search privacy

Do not blindly send arbitrary raw user search strings if current analytics policy treats them as potential personal data.

Follow existing CookPilot search analytics conventions.

### 49.3 No sensitive payloads

Foundation analytics-security rule applies.

Do not send recipe bodies, private notes, auth tokens or provider secrets.
---

# 50. Testing

Testing validates the public projection, routing and invisible payload/SEO behavior.

## 50.1 Query and Gallery

Cover localized route builders, slug/handle parsing, category canonical order, semantic depth, query normalization, keyset cursors, repeated multi-value parameters, deduplication, bank exhaustion/fallback and zero-result states. Exercise All, Recipes, Menus, Days, Weeks, Lists, Ingredients and Categories with public data.

## 50.2 Public object and privacy

Inspect rendered HTML/RSC/API payloads for representative recipes, menus, days, weeks, lists, ingredients, categories and intersections. Public valid recipes must contain all safe ingredients and ordered steps regardless of App tier. Private, unpublished, deleted or invalid routes must return 404 with no data or UUID leakage. Composite projections must exclude checked/purchased state, notes, health data, costs and planning internals.

## 50.3 SEO and sharing

Verify status, canonical, real hreflang, robots, OG, JSON-LD parity, dynamic sitemap membership, alias redirects and noindex on arbitrary query/filter URLs. Verify Share, Copy, WhatsApp, QR and Open/Cook in CookPilot carry only canonical cookpilot.pro URLs or validated app intents.

## 50.4 Security and performance

Test hostile slugs/handles/encodings, external hosts, open redirects, malformed deep-link actions, XSS serialization, cache after unpublish and absence of secrets or Web Auth/payment payloads. Measure Gallery batches, heavy recipes/composites, category collections, N+1 behavior, duplicate requests, RSC size and image loading.

## 50.5 App regression boundary

After backend changes, run the existing Flutter Auth, onboarding, CookBilling, RevenueCat mobile, Google/Huawei billing, Free/Pro preview, CookMode, publication/share and App Link/deferred tests. Web tests never replace native billing tests.

---

# 51. Web acceptance criteria

The Web implementation is complete only when:

- [ ] ES/EN landing and Hero remain intact in purpose and behavior.
- [ ] Gallery preview and /es/gallery /en/gallery render real SSR data.
- [ ] Global types include All, Recipes, Menus, Days, Weeks, Lists, Ingredients and Categories.
- [ ] All remains recipe-heavy; public valid CookLists are eligible.
- [ ] Bank source, fallback, keyset pagination and session dedupe work without a new feed corpus.
- [ ] Search/facets are typed, bounded and public-only.
- [ ] Concrete handle object routes work; root /@handle showcase is 404.
- [ ] Recipe pages render complete safe ingredients and ordered steps for every public valid recipe.
- [ ] Menus/days/weeks/lists render public structure and culinary descendants without Web Free/Pro gating.
- [ ] Private/unpublished/deleted objects return 404 and never enter Gallery/sitemap.
- [ ] Alias routes redirect permanently to canonical routes.
- [ ] No Web Auth, Supabase SSR session refresh, callback/confirm routes, owner mode, Paddle, RevenueCat Web, entitlement, paywall or purchase continuation remains.
- [ ] Native Auth/CookBilling/RevenueCat/Play/Huawei/Free-Pro/App Links remain untouched.
- [ ] Images use the Cloudflare media host.
- [ ] Metadata, JSON-LD, canonical, hreflang, robots and sitemap match the same public projection.
- [ ] Recipe JSON-LD contains complete available public ingredients/instructions when eligible.
- [ ] Lists are indexable when public/valid; Gallery query/filter variants are noindex,follow.
- [ ] Share/Copy/WhatsApp/QR use canonical URLs only.
- [ ] Public responses are safe to cache with prompt publication revalidation.
- [ ] TypeScript, lint and Next build pass; relevant App regression checks pass.

# 52. Explicit Web non-goals

Do not implement the following in this Web work:

- `/app`;
- CookPilot Home Web clone;
- recipe creation/editing;
- CookImport Web;
- CookPlan Web;
- Web menu/day/week editing;
- Web CookList editing/checking/generation;
- CookMode Web;
- Web timers;
- Web CookFit;
- Web CookBalance;
- Web CookSignals;
- Web MESA personalization;
- Web AI recipe generation/transformation;
- Web camera/visual features;
- anonymous personalized feed;
- follower/social graph;
- public likes/reactions/comments;
- user bios;
- creator profile/showcase pages;
- moderation/reporting platform;
- user suspension state;
- editorial CMS;
- generic research/blog engine;
- arbitrary programmatic-SEO prompt pages;
- AI-generated SEO-description pipeline;
- multiple recipe image aspect-ratio generation pipeline;
- recipe video pipeline;
- generated social/OG cards for every composite object;
- public popularity/freshness ranking;
- formal experimentation/A-B infrastructure;
- Web-specific Pro tier;
- Web packs storefront;
- iOS work;
- Android App Link/deferred-install mechanics — those belong to `03`;
- new backend/domain copies merely for Web convenience.

---

# Annex A — Recommended Web route tree

Keep the existing explicit ES/EN marketing route structure and add shared public-object routes:

    src/app/
      es/
        page.tsx
        gallery/page.tsx
        recetas/[slug]/page.tsx
        listas/[slug]/page.tsx
        ingredientes/[...segments]/page.tsx
        categorias/[...segments]/page.tsx
        [handle]/recetas/[slug]/page.tsx
        [handle]/menus/[slug]/page.tsx
        [handle]/dias/[slug]/page.tsx
        [handle]/semanas/[slug]/page.tsx
        [handle]/listas/[slug]/page.tsx
      en/
        page.tsx
        gallery/page.tsx
        recipes/[slug]/page.tsx
        lists/[slug]/page.tsx
        ingredients/[...segments]/page.tsx
        categories/[...segments]/page.tsx
        [handle]/recipes/[slug]/page.tsx
        [handle]/menus/[slug]/page.tsx
        [handle]/days/[slug]/page.tsx
        [handle]/weeks/[slug]/page.tsx
        [handle]/lists/[slug]/page.tsx

There is no root handle page and no Web auth route. Static route segments take precedence over [handle]; route builders generate canonical links and the shared resolver validates every dynamic identity.

# Annex B — Public Gallery query schema

The concrete TypeScript interface may differ, but the normalized model must remain public-only:

    GalleryState
      locale
      q?
      type: all | recipes | menus | days | weeks | lists | ingredients | categories
      categories[]
      mealMoments[]
      componentTypes[]
      time ranges
      ingredient identities
      nutrition ranges
      servings ranges
      taste[]
      texture[]
      cuisine[]
      cursor?

Rules:

- empty arrays are omitted from the URL;
- unknown facet identity is rejected/normalized out;
- multi-values are canonical-sorted;
- URLs use public slugs/enums, never private DB IDs;
- no access, cost, entitlement or actor fields exist;
- response echoes normalized state so the client can correct malformed/noncanonical URLs when useful;
- arbitrary query/filter states remain noindex,follow.

# Annex C — Card projection contracts

These are minimum safe conceptual fields, not exact database DTOs.

## Recipe card

```text
kind=recipe
canonicalUrl
title
shortDescription?
image/publicFallback
public time?
servings?
public nutrition summary?
component type?
selected public category labels?
```

## Menu card

```text
kind=menu
canonicalUrl
title
public visual/fallback
component count/public summary
public time?
public nutrition summary?
```

## Day card

```text
kind=day
canonicalUrl
title/date label when real
filled public meal-moment summary
public nutrition summary?
```

## Week card

```text
kind=week
canonicalUrl
title/date range when real
non-empty day/menu summary
public nutrition summary?
```

## Ingredient card

```text
kind=ingredient
canonicalUrl
name
category?
public nutrition headline?
public recipe-use summary?
```

No card DTO may contain data merely because the detail page *might* need it later.

---

# Annex D — Page metadata policy matrix

| Page | Index? | Canonical | hreflang | Structured data |
|---|---|---|---|---|
| `/es`, `/en` landing | yes | self | ES/EN | existing Organization/WebSite |
| Base `/gallery` | yes | self | ES/EN | generic collection if truthful; not required |
| Gallery `?q` / arbitrary facets | noindex | semantic route if exact, else base Gallery | none required | not a priority |
| Official recipe | yes | self | true localized alternate | Recipe when eligible |
| Public user recipe eligible | yes | self canonical locale | only real translated alternate | Recipe when eligible |
| Public user recipe non-indexable | noindex | self | none | no rich-result push |
| Private owner recipe | noindex | internal current URL | none | no object-content JSON-LD |
| Menu eligible | yes | self | true alternate only | WebPage/ItemList if truthful |
| Day eligible | yes | self | true alternate only | WebPage/Breadcrumb optional |
| Week eligible | yes | self | true alternate only | WebPage/ItemList optional |
| CookList | yes when public/valid | self | true alternate only when real | WebPage/ItemList when truthful |
| Ingredient | yes | self | true localized alternate | WebPage + recipe ItemList when visible |
| Category | yes | self | true localized alternate | collection/recipe ItemList |
| Valid category intersection | yes | canonical sorted route | true alternate | collection/recipe ItemList |
| Invalid/empty derived intersection | 404 | n/a | n/a | none |
| Concrete user-object URL with handle | yes when public/valid | self | only real alternate | object schema when truthful |
| Root `/@handle` | 404 | n/a | n/a | none |

---

# Annex E — Indexability examples

These examples are normative illustrations of §41.

### E.1 Official premium recipe

Underlying recipe is valid, real image exists, and the public Web projection is complete.

Result:

```text
public: yes
indexable: yes
Recipe rich data: yes, with complete public ingredients/instructions and no private/app intelligence
Gallery discoverable: yes
```

### E.2 User recipe with title + 4 ingredients + 2 steps, no image

Result:

```text
public: if owner published
indexable: yes
Recipe rich data: no until real dish image exists
Gallery discoverable: yes with fallback card if other rules pass
```

### E.3 User recipe with only title

Result:

```text
public/shareable: yes if domain-valid and owner published
indexable: no
Global Gallery discoverable: no
Handle: only concrete public object routes use the handle segment
```

### E.4 Real canonical category with zero current recipes

Result:

```text
indexable: yes
page: honest category empty state
```

### E.5 Derived intersection with zero results

Result:

```text
canonical semantic identity: not materialized
response: 404
indexable: no
```

### E.6 Public week with one breakfast only

Result:

```text
public/shareable: yes if valid/published
indexable: no under week usefulness threshold
Global Gallery discoverable: no
Handle/public direct URL: still valid
```

### E.7 Public week with two non-empty days

Result:

```text
indexable: yes
Global Gallery discoverable: eligible if cardable
```

---

# Annex F — Implementation dependency map inside the Web repo

Use this sequence within the larger Foundation implementation order.

```text
1. Extend typed route builders / locale-aware dynamic identity
2. Implement shared public-object server resolvers/projections
3. Implement indexability/discoverability helpers
4. Implement Gallery query parser + server data service
5. Implement card DTOs
6. Implement public Recipe page
7. Implement Ingredient + Category pages
8. Implement Menu/Day/Week/List pages
9. Implement base Gallery + search/facets
10. Implement landing Gallery preview
11. Implement concrete handle object routes (no root profile)
12. Implement dynamic metadata + JSON-LD helpers
13. Expand sitemap / robots behavior
14. Implement Web sharing / recipe QR and native handoff
15. Instrument analytics using current analytics canon
16. Run security/payload/SEO/accessibility/performance E2E
17. Complete Search Console/Rich Results/OAI crawler production verification with browser access
18. Hand off to document 03 for Android/deferred integration
```

If a prerequisite from `01` such as public identity/visibility/lineage is not yet implemented, do not fake it in Web local state; implement the Foundation prerequisite first.

---

# Annex G — Web release gate

Do not call CookShare Web complete until a production browser pass proves:

```text
Public discovery works
+ public object URLs are stable
+ public culinary payloads are complete and safe
+ sitemap/structured data are valid
+ crawlers can read the same public projection
+ no Web Auth/payment/entitlement code remains
+ native App Auth/Billing/Free-Pro are intact
+ existing marketing site remains intact
```

The implementation agent may perform remaining provider/search-console/browser configuration directly during this release gate. Do not replace real provider state with a checklist file.
