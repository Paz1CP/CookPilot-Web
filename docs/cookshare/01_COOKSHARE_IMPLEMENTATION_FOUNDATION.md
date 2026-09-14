# CookShare — Implementation Foundation

**File:** `01_COOKSHARE_IMPLEMENTATION_FOUNDATION.md`  
**Status:** implementation-authoritative for CookShare cross-cutting behavior  
**Scope:** product semantics, public-object contract, identity, access, lifecycle, URL identity, publication, search/sharing semantics, Web↔App responsibility boundaries, backend reuse, security invariants, migration and implementation order  
**Companion documents:** `02_COOKSHARE_WEB_DISCOVERY_IMPLEMENTATION.md`, `03_COOKSHARE_APP_LINKS_AND_INTEGRATION_IMPLEMENTATION.md`

---

## 0. Status of this document

This is the master implementation foundation for CookShare.

It defines the rules that must remain true across the Web implementation, public discovery surfaces, sharing, billing-aware access, and the Web↔Android bridge. The other CookShare implementation documents must build on this contract instead of redefining it.

> **Do not implement from this document in isolation. Inspect the current repository and the referenced CookPilot domain documentation before changing existing behavior. Existing CookPilot domain behavior remains authoritative unless this document explicitly introduces a new CookShare requirement or resolves a conflict required by CookShare. Reuse current tables, views, RPCs, Edge Functions, domain services and app flows whenever possible.**

This document is not a replacement for the canonical documentation of Auth, CookBilling, CookPlan, CookSearch, CookImport, CookList, CookMode, MESA, Analytics, CDN/media, or the general CookPilot product.

The legacy file:

`docs/cookshare/coookshare_canonical_documentation.md`

is **not a source of truth for this implementation**. Ignore it.

The external provider setup has already been handled separately. Provider dashboards remain the source of truth for provider IDs, keys, domains, signing fingerprints and connection state. Do not create an implementation file whose purpose is to duplicate values such as package IDs, SHA-256 fingerprint Resolve concrete values from the current environment, repository and provider configuration when required.

The CookPilot Web production site uses `cookpilot.pro` directly. There is no separate CookPilot Web DEV product environment. Provider Sandbox environments may still be used for payment testing; that does not create a separate Web product environment.

## 0.1 Current product direction: public-only Web (2026-09-12)

This amendment is part of the authority of this document and supersedes any earlier Web-specific authentication, billing or entitlement wording below. CookShare Web is a public, unauthenticated, read-only, indexable and cache-friendly distribution surface. It has no Web Auth, browser session, owner/private mode, Paddle, RevenueCat Web, Web entitlement, paywall or purchase continuation. Public valid objects are projected with their complete safe culinary content; Free/Pro, Auth, CookBilling, RevenueCat mobile, Google Play Billing, Huawei IAP, premium lineage and native gates remain authoritative inside CookPilot App.

The public resolver for Web is `home.rpc_resolve_cookshare_public_content`. The existing `home.rpc_resolve_cookshare_public_object` and actor-aware projections remain App/shared infrastructure and must not be weakened. Publication, identities, handles, aliases, slugs, lifecycle, App Links and deferred links remain shared CookShare contracts. Handles are used only as scoped segments in object URLs; a root `/@handle` showcase/profile is not a Web surface. CookLists are eligible for global Gallery and indexability when public and valid. This amendment does not authorize changes to provider dashboards or mobile billing.

---

## 1. Purpose

CookShare exists to make CookPilot's useful culinary objects distributable, discoverable and resumable outside the installed app without turning the Web into a second CookPilot application.

The implementation must create one coherent public layer in which:

1. a real CookPilot object can have a durable public identity;
2. that identity can be rendered on the Web;
3. public discovery can find it when eligible;
4. search engines and AI crawlers can understand the same public projection a human receives;
5. a user can share the same canonical URL through messaging, social surfaces, QR or direct copy;
6. the URL can hand off into the Android application when possible;
7. an app handoff can preserve the original object and intended action without moving authority to the Web;
8. no public route becomes an access-control bypass for private or premium data;
9. CookPilot's existing domain model remains the source of culinary truth.

CookShare is therefore a **distribution and discovery layer over CookPilot**, not a new culinary domain.

---

## 2. Raison d’Être and acquisition thesis

CookShare must preserve CookPilot's strategic center.

CookPilot does not exist because people lack recipes. It exists because there is a recurring distance between **wanting a specific food** and **making that food work under a person's real conditions and actually reaching the plate**.

The canonical CookPilot strategic sequence is:

> **specific desire → Realization Gap → transformation → materialization → execution → possible reuse**

CookShare enters before and around that sequence. Its acquisition job is to expose a desirable food or useful culinary object at the moment the person has a concrete interest, then reduce the distance between discovery and meaningful CookPilot action.

The public layer is therefore **desire-led**, not planning-led.

The primary acquisition unit is usually a specific food, recipe, ingredient, menu or relevant culinary collection. A public week, day or list can be useful, but CookShare must not reposition CookPilot as a generic calendar or meal-planning site.

The strategic relationship is:

```text
Search / AI Search / WhatsApp / social / direct link / public Gallery
        ↓
specific desirable CookPilot object
        ↓
useful public understanding
        ↓
deeper CookPilot intent
        ↓
App handoff when required
        ↓
existing CookPilot product loop
```

The Web demonstrates CookPilot. The app amplifies it into the full product.

CookShare succeeds when distribution produces **consumer discovery and progression toward the existing CookPilot loop**, not merely pageviews.

---

## 3. What CookShare is

CookShare includes:

- the public Web representation of eligible CookPilot objects;
- the public discovery layer and Gallery;
- public search across supported object classes;
- semantic ingredient and category discovery surfaces;
- shareable canonical URLs;
- publication state for user-owned shareable objects;
- handle segments used in scoped public object URLs;
- SEO/AEO/GEO infrastructure for public objects;
- crawler-readable public projections;
- a pure public projection for unauthenticated discovery;
- Web sharing actions;
- recipe QR sharing;
- canonical HTTPS deep-link intent semantics;
- Web→App and App→Web handoff semantics;
- the minimum new cross-cutting persistence required to support public identity, publication and access safely.

CookShare consumes CookPilot domain objects. It does not redefine what a recipe, menu, day, week, CookList, ingredient or category means.

---

## 4. What CookShare is NOT

CookShare is not:

- a full CookPilot Web App;
- a Web clone of Home;
- a `/app` product;
- a separate user library/dashboard;
- CookPlan Web;
- CookImport Web;
- recipe creation or editing on Web;
- CookList generation/editing as a full Web workflow;
- CookMode Web;
- Web timers or cooking execution;
- Web AI generation or transformation;
- Web MESA personalization;
- Web CookFit;
- Web CookBalance;
- Web CookSignals;
- Web camera/visual review;
- a social network;
- a follower/likes/profile-bio system;
- a separate billing tier;
- a separate Web entitlement;
- a second recipe database;
- a second search corpus;
- a Web-specific backend;
- a new schema family created merely because Web exists;
- a snapshot/archive product;
- a moderation platform;
- a generic blogging/content-marketing CMS;

Do not expand CookShare into any of the above during implementation.

---

## 5. Global architecture

The architecture is one domain graph exposed through multiple delivery surfaces.

```text
                    COOKPILOT DOMAIN SOURCES
        recipes / ingredients / categories / saved objects /
        profiles / billing / search / MESA / media / plan state
                              │
                              │
                     minimal CookShare additions
             publication / public identity / aliases / handle /
                    lineage fixes / safe resolvers
                              │
                 ┌────────────┴────────────┐
                 │                         │
          PUBLIC WEB GRAPH          ANDROID APPLICATION
                 │                         │
      Gallery / object pages        existing native domains
      search / SEO / share          + deep-link entry
                 │                         │
                 └──────── canonical HTTPS ┘
```

There is exactly one semantic object behind a public URL. The Web does not maintain a copied culinary representation that can drift from the app.

The canonical host is:

`https://cookpilot.pro`

Public URLs identify CookPilot objects. Provider-specific wrappers may transport a URL in special deferred-install flows, but they never become the canonical identity of the object.

The Web repository remains a separate implementation repository, but not a separate product domain.

---

## 6. Existing systems that remain source of truth

The following existing CookPilot systems remain authoritative for their domains.

| Domain | Source of truth / documentation |
|---|---|
| Product raison d’être | `docs/product/CookPilot_Fundamento_Estrategico_y_Raison_dEtre.md` |
| General product graph | `docs/product/cookpilot_product_canonical.md` |
| Auth + onboarding | `docs/auth/auth_onboarding_documentacion_canonica.md`, `docs/auth/auth_onboarding_documentacion_tecnica.md` |
| Free / Pro boundaries | `docs/cookbilling/CookPilot_free_pro_boundaries.md` |
| Billing semantics | `docs/cookbilling/cookbilling_canonical_documentation.md`, technical billing docs |
| CookPlan semantics | `docs/cookplan/*` canonical and technical docs |
| CookSearch semantics | `docs/cooksearch/*` |
| CookImport semantics | `docs/cookimport/*` |
| CookList semantics | `docs/cooklist/*` |
| CookMode semantics | `docs/cookmode/*` |
| MESA | `docs/MESA/*` |
| Analytics | `docs/cookanalytics/*` |
| Media/CDN | `docs/cookcdn/*` |
| Product environment/release behavior | `docs/product/*` relevant environment/release docs |

Implementation must inspect the current code and current documentation together. Documentation establishes semantics; current code establishes actual integration surfaces and constraints.

CookShare may introduce missing cross-cutting state, but it must not silently replace existing owners of data.

---

## 7. Actor model

CookShare Web has no actor model. Every Web request is unauthenticated, read-only and evaluated only as `public + valid + active` or unavailable. Crawlers and humans receive the same safe public projection, with no cloaking, session, owner mode, entitlement branch or paywall. A visit never creates a Supabase Auth user.

CookPilot App continues to use its existing Auth, onboarding and Free/Pro semantics. Incoming CookShare links are resolved by the app with the current authenticated actor where native behavior requires it; the Web never carries or grants that authority.

---

## 8. Public Object Graph

CookShare exposes a finite set of public identities.

### 8.1 Shareable/publicable object classes

The shareable object classes are:

- official recipe;
- personal recipe copy;
- imported recipe;
- saved menu;
- materialized current menu when sharing requires durability;
- saved day;
- materialized current day when sharing requires durability;
- saved week;
- materialized current week when sharing requires durability;
- CookList;
- ingredient;
- handle segments attached to user-owned object identities.

### 8.2 Discovery surfaces that are public identities

Categories are public semantic discovery surfaces, not user-shareable objects in the same sense as recipes or menus.

Category intersections may also be public semantic discovery surfaces when they satisfy the URL contract.

Ingredients are real public objects and have canonical URLs.

### 8.3 Explicit exclusions

The following are not CookShare public object types:

- CookMode session;
- CookMode runtime;
- Victory session;
- CookBalance event/dashboard;
- CookRecall internal state;
- MESA internal state;
- billing records;
- nutritional personal profile;
- temporary search result;
- ephemeral recommendation card;

### 8.4 Object graph principle

A public container may reference public or unavailable descendants. Publication of the container never changes a descendant's own publication state. The Web graph resolves identity first, then returns the complete safe public projection for each currently public descendant; the App separately computes actor-specific Free/Pro access.

---

## 9. Object durability rules

Only durable objects may have durable public URLs.

For CookShare purposes:

- official recipes are durable;
- persisted personal/imported recipes are durable;
- saved menus/days/weeks are durable;
- saved CookLists are durable;
- ingredient/category identities are durable domain identities;
- current menu/day/week state is not automatically public identity until the existing domain semantics materialize it as a durable object.

### 9.1 Sharing non-durable current state

When the user shares a current menu/day/week that is not yet a durable object:

1. use the existing CookPlan/save/materialization semantics;
2. satisfy the existing access gate required to create the durable object;
3. only then publish/share the durable identity.

Publication must not bypass persistence gates.

A Free user cannot obtain a Pro-only durable saved object merely by pressing Share.

### 9.2 No CookShare snapshots

A public object represents the **current live state of that durable object**.

CookShare does not create a frozen snapshot each time an object is shared.

**If the owner edits the durable object, its public representation changes.**

If a historical snapshot is ever required as a future product, it must be designed explicitly outside this implementation.

---

## 10. Publication model

User-owned shareable objects have exactly:

```text
private
public
```

There is no `unlisted`.

### 10.1 Share is publication

Sharing a private user-owned object immediately makes that object public.

The product does not introduce a second confirmation whose only purpose is to restate that sharing makes the object reachable.

The implementation must ensure that Share cannot produce a link to a supposedly private object that another user cannot resolve.

### 10.2 Public does not mean indexable

Publication only answers whether the object is reachable by the public actor model.

It does not automatically answer:

- whether the object appears in Gallery;
- whether it appears in global public search;
- whether it is included in sitemap;
- whether search engines should index it.

Those are separate decisions.

### 10.3 Publicability threshold

A user-owned object may be public when it is:

- durable;
- valid enough under the object's existing CookPilot domain contract to exist and be used;
- not administratively disabled from public exposure.

Do not create an artificial editorial-quality threshold for the ability to share.

Missing recipe image does not prevent publication. Use the existing CookPilot default image behavior where needed.

### 10.4 Unpublish

Unpublishing:

  - immediately removes public access for Web and other non-owner readers;
- removes the object from Gallery/public search eligibility;
- removes it from sitemap/index eligibility;
- preserves the object's private identity and data for its owner;
- does not create a new URL if the object is published again.

### 10.5 Delete

Permanent deletion ends the object identity.

A deleted public object returns a proper `404`.

Do not redirect a deleted object to Home or Gallery.

---

## 11. Visibility inheritance and overrides

CookPilot Settings provides a global publication default for user-owned shareable objects, expressed to the user in a simple form such as making recipes/menus public by default.

The model is:

- global default;
- optional per-object override.

### 11.1 Inherited state

An object without a per-object override inherits the current global default.

Changing the global default may therefore affect existing objects that are still inheriting it.

### 11.2 Explicit override

An explicit object override remains stable when the global default changes.

### 11.3 Share interaction

Explicitly sharing a private/inherited-private object makes it public in a durable way. Implementation may represent that as an explicit object override or another equivalent minimal state, but the result must remain public until the user later unpublishes it.

### 11.4 No private existence leakage

For Web, a private user object must not expose a signal that the object exists. A direct guessed private URL resolves as not found. The authenticated owner may manage publication and private data only through the existing CookPilot App surfaces.

---

## 12. Publicability vs discoverability vs indexability

These are three independent predicates.

```text
publicable   = may this durable object be publicly reachable?
discoverable = may CookShare proactively surface it in Gallery/public discovery?
indexable    = should search engines be invited to index this canonical page?
```

### 12.1 Publicable

Defined by Section 10.

### 12.2 Discoverable

Global discovery uses a quality/usefulness threshold.

A public object does **not** automatically enter global Gallery.

Discoverability should favor:

- usable/complete enough content;
- valid public projections;
- reliable media/metadata when available;
- content that can be understood without leaking protected descendants.

Official high-quality content leads the default showcase.

Explicit search relevance may rank eligible public user content above official content.

Public CookLists are eligible for the default global Gallery when their public projection is valid; the default All feed remains recipe-heavy.

### 12.3 Indexable

Indexability is governed by semantic usefulness, canonical identity and crawl safety.

Canonical expectations:

- official recipes: indexable;
- eligible public personal/imported recipes: indexable;
- eligible public menus: indexable;
- eligible public weeks: indexable;
- eligible public days: indexable;
- public CookLists: indexable when public and valid;
- concrete user-object routes containing a handle: indexable when public and valid;
- a root handle route without an object: 404 and not indexable;
- ingredients: all canonical ingredient pages are indexable;
- categories: all canonical category pages are indexable;
- useful semantic intersections may be indexable under the URL rules;
- transient Gallery searches/filters are normally `noindex`.

There is no user-facing manual `noindex` switch.

There is no requirement for a diagnostic UI explaining why a page is not indexed.

### 12.4 Relationship

A page is either a public valid active object (eligible for rendering/indexing under its route rules) or unavailable. Arbitrary Gallery query/filter variants remain noindex,follow. Private, unpublished, deleted, invalid and alias-only routes do not receive a public projection.

---

## 13. Authentication and entitlement boundary

CookShare Web has no Auth, billing or entitlement surface. It calls the pure public resolver without auth.uid() and does not create sessions, payment state or return continuations. Supabase Auth, CookBilling, RevenueCat mobile, Google Play Billing, Huawei IAP, the canonical entitlement and all native Free/Pro gates remain unchanged for CookPilot App.

---

## 14. Free / Pro application boundary

Free/Pro applies only inside CookPilot App. It must never decide Web visibility, indexability or projection. A public valid recipe exposes its complete safe culinary content on Web, regardless of the app's current tier. Web does not expose pricing/costs, AI reasoning, scores, MESA internals, personalization, health data, planning metadata or private notes.

---

## 15. Public composite projection

A public menu, day, week or CookList is projected recursively with complete public structure and culinary descendants. Each descendant is checked for public publication/lifecycle only; no actor or entitlement is consulted. The projection excludes private checked/purchased state, owner notes, reminders, health data and other non-culinary internals. CookLists are eligible for global Gallery and indexability when public and valid.

---

## 16. Premium recipe lineage and copies (App-only commercial semantics)

Premium lineage remains authoritative for CookPilot App access and must be preserved exactly. It never redacts a public CookShare Web projection: a public valid copy or root recipe renders complete safe culinary content on Web while the app continues to apply its existing native Free/Pro rules.

This rule intentionally differs from treating a heavily edited copy as commercially independent.

### 16.1 Root lineage

A copy derived from an official recipe must preserve the root official `source_recipe_id`.

Copy-of-copy preserves the same root source.

Do not create a lineage chain whose commercial result depends on the immediate parent only.

### 16.2 Dynamic premium state in CookPilot App

While the official root exists:

```text
root official recipe is premium
→ descendant copies are premium-gated

root official recipe becomes Free
→ descendant copies become Free-accessible

root official recipe was Free and becomes premium
→ descendant copies become premium-gated
```

This applies to pre-existing copies as well as new copies.

### 16.3 Degree of editing

Heavy editing does not sever the commercial lineage.

The copy may be a distinct user object for ownership and content, but its access state follows the root source while that source exists.

### 16.4 Root deletion

If the official root is permanently deleted:

```text
source_recipe_id = null
→ copy becomes commercially independent / Free under this lineage rule
```

Do not retain hidden historical DRM tombstones solely to preserve a deleted premium relationship.

A new official recipe with the same title/name later is a different identity and must not automatically become the source of old copies.

### 16.5 Publication

A premium-derived copy may remain public. Publishing it does not change its native app lineage or entitlement behavior; the Web public projection remains complete for safe culinary fields.

### 16.6 Known current-domain conflict

The current implementation contains behavior that forces non-official recipes toward Free semantics. That behavior conflicts with premium lineage for copies derived from official premium recipes.

During implementation, inspect the current trigger/domain path (including the known `menu.trg_recipes_force_free_for_non_official` behavior) and modify the **minimum existing rule necessary** so premium lineage works without inventing a parallel billing model.

---

## 17. Ownership and provenance semantics

Ownership and commercial provenance are separate.

### 17.1 Ownership

A user-created/imported/copied object belongs to its current user owner under existing CookPilot semantics.

### 17.2 Copy independence

A copy is independently editable and survives deletion of another user's copy or the original user-owned parent.

If its official root lineage is removed according to Section 16, the copy remains as the user's object.

### 17.3 Public UI

Do not add public provenance badges such as:

- "based on CookPilot";
- "based on @user";
- lineage trees;
- ownership badges whose only purpose is attribution.

Internal provenance may remain necessary for access and lifecycle.

### 17.4 No social profile expansion

Public ownership does not imply:

- followers;
- likes as social currency;
- profile bio;
- pinned posts;
- public counts.

---

## 18. Public object lifecycle

The canonical lifecycle is:

```text
private durable object
        │
        ├─ publish/share
        ↓
public durable object
        │
        ├─ edit → same public identity, updated live representation
        ├─ unpublish → private, same internal identity
        ├─ republish → same canonical identity where slug remains valid
        └─ delete → terminal 404
```

### 18.1 Downgrade

Loss of Pro does not automatically unpublish a user object.

Publication and tier are independent dimensions.

The App actor-specific projection changes immediately according to effective entitlement; the public Web projection remains independent of that tier.

### 18.2 Administrative public kill switch

A minimal object-level administrative mechanism may prevent an object from being publicly served when required.

Do not create a user suspension/blocking subsystem as part of CookShare.

### 18.3 No hidden archived public state

There is no CookShare archive or soft-publication snapshot system.

---

## 19. Stable public identity

Public identity must be stable across title edits, Web refactors and delivery channels.

### 19.1 Identity components

A public object has:

- immutable internal object identity;
- canonical locale-aware route;
- stable/current slug;
- optional historical slug aliases;
- owner handle segment when the object is user-owned;
- object type.

Internal UUID may be used by resolvers, but must not be exposed in canonical public URLs.

### 19.2 Title is not identity

Titles are not unique.

Changing a title does not create a new object.

### 19.3 No URL identity from provider wrappers

A Huawei/AppGallery deferred link wrapper is transport, not public identity.


The public identity remains a `cookpilot.pro` canonical URL.

---

## 20. Slugs, aliases and redirects

### 20.1 Slug generation

User-editable titles may generate slugs, but users do not directly edit slug strings.

Official recipes may use their existing canonical naming/slug source.

### 20.2 Rename

When a public object's current slug changes:

- canonical URL moves to the new slug;
- the old slug resolves through a permanent redirect to the same object while that identity remains valid;
- the alias cannot be reused by a different object while it still resolves to the original identity.

### 20.3 Collision

Slug collisions are resolved deterministically and durably.

Do not rely on title uniqueness.

Do not expose UUID as the collision suffix unless there is no reasonable alternative; prefer stable human-readable disambiguation generated by the resolver.

### 20.4 Delete

A deleted object's old full routes must not silently resolve to another object.

Historical aliases of a deleted identity become dead/reserved as necessary to prevent identity hijacking.

### 20.5 No arbitrary redirects

Slug/alias resolution only redirects within the known CookShare canonical route space.

Never store or honor arbitrary external return URLs as slug aliases.

---

## 21. Handles

User public identity uses `@handle`.

### 21.1 Creation

Create a handle automatically from existing profile name/username data when:

- the candidate is valid;
- it is not reserved;
- it is unique.

If no acceptable handle can be generated, ask the user at the first action that actually requires a public handle, such as first Share of a user-owned object.

Do not block ordinary private app use because a handle is absent.

### 21.2 Editing

Handle is editable.

After the first manual handle change, enforce a one-month cooldown before another manual change.

### 21.3 Reserved handles

Reserve CookPilot/system/brand/routing-sensitive handles.

The implementation must maintain a small explicit reservation mechanism; do not create a general moderation taxonomy.

### 21.4 Public handle use

A handle is a routing and collision segment for user-owned public object URLs:

/es/@handle/recetas/{slug}
/es/@handle/menus/{slug}
/es/@handle/dias/{slug}
/es/@handle/semanas/{slug}
/es/@handle/listas/{slug}

The Web does not expose a profile, showcase or root handle Gallery. A request for /@handle without an object route returns the normal unavailable result.

### 21.5 Search

Public search may match a handle only to help a user navigate to a concrete public object. It must not create a profile surface or expose private account data.

### 21.6 Empty handle

A handle with no public object route has no public root representation. Object routes remain governed by publication, lifecycle and alias checks.

### 21.7 Handle changes and historical object routes

While the original account exists, historical full object URLs must continue to resolve to that same object through safe aliasing/redirect behavior after a handle change.

After account deletion, an old handle may eventually be reused by another account.

However, previously issued **full object routes** under that historical handle must be deleted and must never silently map to the new account's object.

If a later owner of the handle creates an object whose natural slug would collide with a historical reserved full route.

---

## 22. URL contract

Locale is the first path segment.

### 22.1 Gallery

```text
/es/gallery
/en/gallery
```

`gallery` stays `gallery` in both locales.

Gallery is a discovery hub. It is not the parent of object URLs.

### 22.2 Official recipes

```text
/es/recetas/lomo-saltado
/en/recipes/lomo-saltado
```

Official recipes have no handle segment.

### 22.3 User recipes

```text
/es/@paz/recetas/mi-lomo
/en/@paz/recipes/my-lomo
```

Use the locale vocabulary appropriate to the route contract; do not invent an object-language field to decide URL ownership.

### 22.4 User menus

```text
/es/@paz/menus/...
/en/@paz/menus/...
```

### 22.5 User days

```text
/es/@paz/dias/...
/en/@paz/days/...
```

### 22.6 User weeks

```text
/es/@paz/semanas/...
/en/@paz/weeks/...
```

### 22.7 User lists

```text
/es/@paz/listas/mercado-semana
/en/@paz/lists/weekly-groceries
```

Do not introduce `/planes`.

### 22.8 Ingredients

```text
/es/ingredientes/aji-amarillo
/en/ingredients/yellow-chili
```

Ingredient canonical identity maps to `nutrition.ingredients`.

Search aliases such as `search_slug` may redirect or resolve to the canonical ingredient; they are not separate canonical URLs.

### 22.9 Categories

```text
/es/categorias/alta-proteina
/en/categories/high-protein
```

### 22.10 Category intersections

Examples:

```text
/es/categorias/alta-proteina/economicas
/es/categorias/alta-proteina/economicas/rapidas
```

Canonical semantic segments are sorted using a deterministic canonical order; for same-dimension category combinations, use canonical alphabetical slug order.

Maximum semantic URL complexity:

```text
3 semantic dimensions / segments
```

Do not generate unlimited combinatorial URLs.

### 22.11 No `/app`

There is no authenticated Web product root such as `/app`.

### 22.12 UUID

UUIDs must not appear in canonical public URLs.

### 22.13 Query/filter URLs

Transient Gallery filters/search state may use query parameters and remain navigable/shareable.

They do not replace clean semantic canonical pages and are normally `noindex`.

---

## 23. Localization contract

CookShare launches with Spanish and English public routing.

### 23.1 Locale-first routing

All public semantic routes are locale-first.

### 23.2 Official recipe localization

Official recipes use the explicit localized fields that already exist in the CookPilot domain.

Do not invent `language_code` ownership semantics if the current recipe model does not use them that way.

### 23.3 User content

User-owned content must follow the actual current domain representation of title/content/localization.

Do not machine-create a second translated user object merely to manufacture an SEO URL.

### 23.4 Canonicals and alternates

A localized page may declare a corresponding locale alternate only when a real equivalent representation exists.

Detailed `canonical`, `hreflang` and sitemap implementation belongs to document 02.

### 23.5 Route translation

Route vocabulary may differ by locale, while object identity remains the same.

---

## 24. Public search model

Public search is an object search, not a second CookSearch product.

### 24.1 Searchable public classes

Global public search may resolve:

- recipes;
- menus;
- days;
- weeks;
- lists;
- ingredients;
- handles/users by public handle/name.

Categories remain semantic discovery/filter surfaces and may appear as navigational suggestions.

### 24.2 Gallery type controls

Global Gallery visual type controls are:

```text
Todos / All
Recetas / Recipes
Menús / Menus
Días / Days
Semanas / Weeks
Ingredientes / Ingredients
```

CookLists are not a default global visual-feed type.

### 24.3 Ranking principles

Ranking prioritizes:

1. query relevance;
2. usefulness/completeness;
3. valid public/discovery eligibility.

A public user recipe may rank above an official recipe when it is more relevant.

Do not add a default ranking boost for:

- likes;
- follower count;
- freshness;
- arbitrary social popularity.

Do not create manual editorial pinning in the initial implementation.

### 24.4 Default Gallery source

Default recipe discovery begins from the existing `home.cookmatch_recipe_bank`.

When that bank is exhausted in the current browse session:

- continue from existing `menu.recipes`;
- apply active search/filters;
- when no search/filter exists, use randomized continuation;
- locally deduplicate IDs already shown in the current Gallery browsing session.

Do not persist a backend "seen" history solely for CookShare Gallery.

### 24.5 No personalization MVP

Anonymous and authenticated users may receive the same default public Gallery.

Do not rebuild Home/MESA personalization for Web.

### 24.6 Private search boundary

Public global search never leaks private objects. Private search and publication management remain inside the existing authenticated CookPilot App; CookShare Web has no owner/private search context.

---

## 25. Sharing semantics

Sharing always uses canonical public identity.

### 25.1 Primary URL

The shared URL is a canonical `https://cookpilot.pro/...` URL.

Do not append tracking garbage that changes object identity.

Acquisition attribution, when required, must use a mechanism that does not break canonicality.

### 25.2 Private share

Share on a private shareable object publishes it immediately according to Section 10.

### 25.3 Channels

App:

- native share sheet is the primary sharing mechanism.

Web:

- Web Share API when supported;
- Copy Link;
- explicit WhatsApp fallback/action where useful.

### 25.4 Share text

Share copy is short and contextual.

Do not build a dedicated WhatsApp content engine.

### 25.5 Images

Recipe sharing may use the existing 1:1 recipe image.

Do not create generated OG artwork systems for menu/day/week as a prerequisite.

### 25.6 QR

Recipe QR is supported.

App-download QR is supported where required by marketing surfaces.

No menu/day/week/action-specific QR formats are part of this implementation.

Recipe QR encodes the canonical recipe URL, not a secret, provider wrapper or action token.

---

## 26. Deep-link intent semantics

This document defines semantics only. Android/Huawei mechanics belong to document 03.

> **A deep link expresses intent, never authority.**

### 26.1 Intent vocabulary

Supported intent vocabulary:

```text
view   (implicit/default)
cook
```

Do not introduce a generic arbitrary action router.

### 26.2 View

Default canonical link means "open/view this object".

### 26.3 Cook

`cook` means request the existing CookPilot cooking handoff for the resolved object.

For a menu, `cook` refers to the whole menu under existing CookMode semantics.

### 26.4 Authorization

The app must:

```text
parse
→ normalize
→ resolve object identity
→ authenticate when required
→ authorize actor/object/action
→ enforce entitlement
→ hand off to existing domain flow
```

The URL never overrides visibility, ownership or entitlement.

### 26.5 Supported public link destinations

Canonical object URLs should be eligible for app handoff where there is a meaningful native destination, including:

- recipes;
- menus;
- days;
- weeks;
- lists;
- ingredients;
- categories;
- handles.

Handle native destination is the existing Settings/profile context rather than a new social profile feature.

### 26.6 Unsupported app version

If an older app cannot understand an object type/action:

- retain Web as safe fallback;
- unsupported `cook` falls back to object preview/view;
- never approximate an unknown privileged action.

### 26.7 Deferred continuation

The original canonical object identity and allowed intent may survive:

- app missing;
- store install;
- first open;
- auth;
- onboarding;
- paywall.

The concrete pending-intent state machine belongs to document 03.

---

## 27. Web-to-App responsibility boundary

CookShare Web owns:

- public object resolution;
- public rendering;
- public search/discovery;
- semantic filters;
- SEO/AEO markup;
- sharing;
- a safe handoff intent toward the native app;
- safe invocation of the canonical app intent.

The Web does **not** own:

- editing recipe/domain objects;
- executing CookPlan;
- generating CookList;
- running CookMode;
- performing CookFit;
- personalized MESA recommendations;
- AI culinary transformations.

When the next meaningful action belongs to the app, Web hands off rather than recreating the feature.

---

## 28. App-to-Web responsibility boundary

The app owns the full CookPilot product flows and creates/shares canonical CookShare URLs for publicable objects.

When the app invokes Share:

1. ensure the object is durable;
2. ensure publication semantics are satisfied;
3. resolve canonical URL;
4. share the canonical URL through the selected channel.

The app does not need to render a separate CookShare snapshot.

If the app cannot execute an incoming intent due to app-version support, it may fall back to the canonical Web URL.

CookShare ends once native identity/access resolution has handed the object into the existing domain flow.

---

## 29. Data/backend reuse rule

CookShare must reuse the current backend.

This is a hard architectural rule.

Do not create a new:

- `cookshare` schema merely for isolation;
- recipe mirror table;
- Web recipe table;
- Web ingredient table;
- Web search index that duplicates the domain corpus without necessity;
- Web user table;
- Web billing ledger;
- Web entitlement system;
- generic Web RPC family that wraps existing RPCs one-for-one.

### 29.1 Preferred order

When implementation needs data:

1. use an existing domain source directly when safe;
2. use an existing view/resolver/RPC/domain service when appropriate;
3. extend an existing resolver/view/RPC when the new public projection is a natural responsibility;
4. create a minimal new cross-cutting construct only when the contract cannot be represented safely otherwise.

### 29.2 No UI-driven backend proliferation

Do not create backend structures solely because a specific Web component wants a convenient payload.

Compose an application-level query/projection first.

---

## 30. Required domain changes

CookShare does require some new cross-cutting state. The implementation must provide it using the smallest coherent extension of the current model.

### 30.1 Publication state

Required:

- global user publication default;
- per-object override or equivalent explicit publication state;
- public resolution that respects owner/global inheritance.

The exact storage location must follow current ownership models rather than forcing one universal table if object domains already have appropriate homes.

### 30.2 Public stable identity

Required:

- canonical slug;
- safe historical slug aliasing;
- type-aware identity resolution;
- no public UUID requirement.

Prefer extending object-owned identity or a minimal shared public-identity registry only if multiple domains make direct storage impractical.

### 30.3 Handle

Required:

- unique profile handle;
- reserved handle enforcement;
- last manual-change timestamp/cooldown information;
- resolution support for historical routes as required by Section 21.

Extend the existing user profile domain.

### 30.4 Premium lineage

Required:

- reliable root official source identity for recipe copies;
- copy-of-copy root propagation;
- root deletion nulling behavior;
- entitlement projection based on current root premium state.

Modify existing recipe-copy behavior rather than creating a separate DRM subsystem.

### 30.5 Public/discovery/index eligibility

Eligibility may be computed from existing fields and lightweight resolver logic.

Do not persist three booleans for every object unless a real implementation reason requires it.

### 30.6 Administrative public disable

A minimal object-level ability to suppress public serving is permitted.

Do not expand this into account suspension/moderation workflows.

### 30.7 Slug reservation/history

The implementation must retain enough historical identity information to prevent unsafe route reuse.

Use the minimum storage model that satisfies Sections 20 and 21.

---

## 31. Explicit non-requirement for new backend architecture

The following are specifically **not** required:

- event sourcing;
- a public-object microservice;
- a new search cluster;
- a second Supabase project for Web;
- a Web-specific auth service;
- a Web-specific billing database;
- a separate entitlement cache database;
- a social graph;
- a publication queue;
- a content moderation queue;
- a CMS;
- a user-content translation pipeline;
- a snapshot/versioning service;
- a "seen objects" persistence service for Gallery;
- an experiment/A-B framework;
- a recommendation engine for anonymous Gallery;
- a new analytics warehouse.

If implementation discovers a genuine major domain gap that appears to require a new subsystem, schema family or broad data migration beyond the changes listed in Section 30, **stop that subpart and surface the gap before inventing the architecture**.

---

## 32. Security/access invariants

This is the security baseline for the public Web and the shared App bridge.

### 32.1 Public projection boundary

Only public, valid and active objects are resolved for Web. Filtering occurs in the server-side resolver before HTML, RSC, JSON, metadata, JSON-LD, API responses or client caches are produced. A private, unpublished, deleted, invalid or alias-only route returns the same unavailable result and reveals no existence signal.

The public projection includes complete safe culinary content and excludes owner IDs, internal UUIDs, costs, AI reasoning, scores, MESA state, personalization, health data, planning metadata, private notes and checked/purchased state. React text remains escaped; executable URL schemes and unsafe external hosts are rejected.

### 32.2 Canonical routing and revocation

Validate locale, object type, handle, slug, semantic segments, query values and deep-link payloads for type, length, encoding, traversal and canonical format. UUIDs never appear in public URLs. Historical aliases redirect only to their current canonical object. Publication revocation is authoritative even when an old URL or cache entry remains.

### 32.3 Cache and headers

Public responses are safe to cache because their representation is identical for every Web visitor. Use short revalidation or reliable invalidation for mutable public UGC and unpublish operations. Do not cache private or authenticated App responses through the Web. Apply HTTPS, CSP/security headers, nosniff, referrer and permissions policies without provider-specific payment frames.

### 32.4 App authentication and billing remain native

CookPilot App continues to enforce Auth, ownership, CookBilling, RevenueCat mobile, Google Play Billing, Huawei IAP, canonical entitlement, premium lineage and Free/Pro gates. The Web does not receive session cookies, auth callbacks, payment state or entitlement assertions. A Web-to-App intent carries only a validated canonical URL and optional view/cook action; the App re-resolves and authorizes it.

### 32.5 Secrets and providers

Supabase secret keys, database credentials, signing secrets, webhook credentials and mobile/provider secrets remain server-side. No Web bundle or canonical URL contains them. Paddle and RevenueCat dashboards/configuration remain untouched; their mobile/app consumers are preserved.

### 32.6 Abuse and observability

Apply proportional rate limits to public search/resolution and existing App mutations without blocking legitimate crawlers. Never log passwords, JWTs, refresh tokens, API keys, payment data or private culinary bodies. Keep the lockfile and review security advisories.

### 32.7 Required negative tests

Test private/unpublished/deleted routes, invalid aliases, manipulated UUID/slug/handle, open redirects, malformed deep links, external hosts, unknown actions, cache after unpublish, protected data in HTML/RSC/JSON, and Web-to-App intents that attempt to carry entitlement. Native Auth/Billing/Free-Pro negative tests remain in the App test suite.

---

## 34. Failure/fallback behavior

Failure behavior must preserve safety and the canonical object context.

| Condition | Required result |
|---|---|
| unknown, invalid, deleted or unpublished public route | 404/no existence signal |
| private object route | 404/no public projection |
| stale slug/handle alias | permanent redirect only to the current canonical object |
| public composite contains unavailable descendant | keep public container; omit unavailable descendant safely |
| malformed or unsupported deep link | safe Web/app fallback with view semantics only |
| unsupported native object type/action | canonical Web fallback; app remains authoritative |
| public enrichment unavailable | render the core public object without failing the page |

Public pages should degrade gracefully when non-essential enrichment such as sensory metadata or price is unavailable.

Do not turn provider failure into a reason to expose protected content.

---

## 35. Migration/backfill requirements

CookShare implementation must make current CookPilot data compatible with the public graph without rewriting domain history.

### 35.1 Existing user-owned objects

Existing user-owned recipes/menus/days/weeks/lists default to **private** at initial migration unless there is an already-existing explicit public intent that can be proven from current state.

Do not retroactively publish user content merely because a global default is introduced.

### 35.2 Official recipes

Existing official recipes receive canonical public identity and public availability according to existing Free/Pro recipe semantics.

### 35.3 Ingredients/categories

Backfill canonical slugs for current ingredients/categories from stable domain identity and current localized naming.

Alias existing search slugs to canonical ingredient identity rather than creating duplicate pages.

### 35.4 Handles

Attempt deterministic handle creation for existing profiles from suitable current profile fields.

For collisions/invalid/reserved candidates:

- do not invent opaque UUID handles;
- leave handle unresolved until the first action that requires one.

### 35.5 User-object slugs

Generate stable slugs from current object titles using deterministic collision handling.

No historical alias records are required for title values that existed **before** CookShare public identity, unless current data already proves a previously issued public URL.

From CookShare launch onward, alias history is required.

### 35.6 Premium lineage

Backfill root official source identity for existing recipe copies wherever current provenance can be resolved reliably.

Do not guess lineage from title similarity.

If provenance cannot be proven, preserve the current personal object without attaching an invented official source.

### 35.7 Existing durable saved objects

Do not delete or reshape saved menu/day/week objects solely for CookShare.

Add only the minimum public identity/publication metadata needed.

### 35.8 Search/discovery backfill

Do not create a bulk duplicate search corpus if existing CookSearch/Home sources can feed public resolvers.

---

## 36. Compatibility with existing CookPilot docs

### 36.1 Authority rule

When this document is silent, use the existing relevant CookPilot canonical document.

When this document introduces a CookShare-only public/distribution requirement, apply it without rewriting unrelated domain semantics.

### 36.2 Free/Pro

`docs/cookbilling/CookPilot_free_pro_boundaries.md` remains the source of truth for feature access.

This document adds the public/projection and premium-lineage implications required by CookShare. The explicit durable-public-CookList rule in Section 15.4 governs the CookShare public projection and must not be reinterpreted as retroactive line-level DRM.

### 36.3 Auth

Existing app Auth/Onboarding remains authoritative.

CookShare adds browser authentication as an access/continuation surface; it does not redesign app onboarding.

### 36.4 CookPlan

CookPlan remains owner of menu/day/week planning semantics and durability/save gates.

CookShare may materialize through those existing semantics before sharing.

### 36.5 CookSearch

CookSearch remains the app's personal library/discovery feature.

CookShare public search is an acquisition/distribution projection over public domain objects, not a replacement for CookSearch.

### 36.6 CookImport

CookImport remains the system that converts external content into CookPilot recipe objects.

CookShare may publish an imported durable recipe; it does not implement importing on Web.

### 36.7 CookList

CookList remains the list product.

CookShare only defines public/shareable identity and projection.

### 36.8 CookMode

CookMode remains native execution.

CookShare `cook` deep-link intent is only a handoff request to that existing domain.

### 36.9 MESA

MESA may enrich discovery/filter metadata when existing data is available.

Do not expose raw MESA internal representations as public product language or explode them into public URL dimensions.

### 36.10 Legacy CookShare

Ignore the legacy CookShare canonical documentation entirely for product/implementation decisions.

---

## 37. Implementation order

Implement in this dependency order.

### Phase 0 — repository/domain inventory

Before writing code:

- inspect current Web repo;
- inspect current app/domain docs listed in Section 6;
- locate existing object sources, save/materialization paths, billing access resolvers, auth identity, media helpers and search sources;
- identify the smallest insertion points.

Do not perform a blind repo-wide rewrite.

### Phase 1 — public identity/domain prerequisites

Implement the minimum cross-cutting domain changes from Section 30:

- handle;
- publication/default/override;
- stable slug/alias identity;
- premium root lineage;
- required safe object resolvers.

Resolve the known non-official-copy premium conflict.

### Phase 2 — canonical public object resolution

Create one clear application-level resolution contract capable of:

```text
locale
+ route type
+ handle when relevant
+ slug/semantic segments
→ object identity
→ public + valid + active visibility
→ complete safe public projection
→ canonical route metadata
```

Do not build Web pages before this contract is trustworthy.

### Phase 3 — public Web pages

Implement the public object page families and anonymous projections.

Detailed page/rendering requirements belong to document 02.

### Phase 4 — Gallery/public search/discovery

Implement public discovery over the same resolvers.

No separate corpus architecture unless current sources prove inadequate.

### Phase 5 — SEO/indexability

Implement canonical/index eligibility, structured data, sitemaps, semantic category/ingredient surfaces and crawl behavior from document 02.

### Phase 6 — public Web delivery

Ship the unauthenticated public resolver, complete safe projections, Gallery, semantic routes, SEO and cache behavior. There is no owner-private Web state.

### Phase 7 — sharing and native handoff

Share canonical URLs and optional view/cook intent toward the existing app. Web never performs billing or entitlement continuation.

### Phase 8 — sharing

Add canonical share resolution, native/Web sharing behavior and recipe QR.

### Phase 9 — Android verified links

Implement canonical Android App Links and intent routing according to document 03.

### Phase 10 — deferred installation

Implement Google Play Install Referrer and Huawei deferred semantics according to document 03.

### Phase 11 — E2E hardening

Run positive and negative matrices across:

- anonymous;
- Free;
- Pro;
- owner;
- non-owner;
- premium lineage;
- composite projection;
- auth continuation;
- payment continuation;
- app installed/not installed/old version.

### Phase 12 — analytics

Instrument the events defined by existing analytics conventions after behavior is stable.

### Phase 13 — production verification

Complete live provider/link/search verification using the actual dashboards/browser.

Any remaining external configuration can be completed by the implementation agent using its provider/browser access. Do not block implementation on creating configuration inventory documents.

---

## 38. Acceptance criteria

CookShare foundation is correctly implemented only when all of the following are true.

### Domain/public identity

- [ ] Every supported public object resolves from a canonical URL without public UUIDs.
- [ ] User-owned shareable objects support private/public state.
- [ ] Share on private creates a publicly resolvable object using existing durability gates.
- [ ] Unpublish removes public access immediately.
- [ ] Delete returns 404 and does not redirect to Home.
- [ ] Title change does not change object identity.
- [ ] Slug change preserves safe historical resolution.
- [ ] Historical full object routes cannot be hijacked after handle reuse.
- [ ] Existing user content is not accidentally mass-published during migration.

### Handles

- [ ] Handles are unique and reserved-name safe.
- [ ] Auto-generation uses current profile data when possible.
- [ ] Missing handle is requested only when actually needed.
- [ ] Manual-change cooldown is enforced.
- [ ] Handles resolve only concrete public object routes; root handle showcase is 404.
- [ ] Private/unpublished object routes never expose a public projection.

### Access

- [ ] Anonymous/crawler receive identical public culinary information.
- [ ] Public recipes expose complete safe ingredients and ordered steps regardless of App tier.
- [ ] Costs, private metadata and CookPilot intelligence never enter Web payloads.
- [ ] Public menu/day/week/list projections preserve public structure without private state.
- [ ] Private guessed routes expose no existence signal.
- [ ] Web never creates a session or reads entitlement.
- [ ] App Auth/Billing/Free-Pro behavior remains unchanged.

### Premium lineage

- [ ] Official-root identity survives copy-of-copy.
- [ ] Root premium→Free frees descendants.
- [ ] Root Free→premium gates descendants.
- [ ] Heavy editing does not sever root lineage.
- [ ] Permanent root deletion nulls lineage and removes historical DRM behavior.
- [ ] New same-name official object does not capture old descendants.

### Search/discovery

- [ ] Public global search never returns private user objects.
- [ ] Explicit relevance can rank eligible UGC above official content.
- [ ] Default Gallery is recipe-heavy and uses existing CookPilot sources.
- [ ] Gallery continuation deduplicates current-session results without a new backend history.
- [ ] Public CookLists can participate in global Gallery and indexability.
- [ ] Ingredients/categories use canonical semantic identities.

### Sharing/deep-link semantics

- [ ] Shared URLs remain canonical `cookpilot.pro` URLs.
- [ ] Recipe QR contains only the canonical URL.
- [ ] Deep-link intent vocabulary is limited to view/cook.
- [ ] Intent never bypasses App ownership/visibility/entitlement; Web carries no authority.
- [ ] Unsupported native behavior falls back safely rather than approximating authority.

### Security

- [ ] Protected content is filtered before browser payload generation.
- [ ] Public responses are cache-safe and publication revocation is respected.
- [ ] No Web auth, billing or entitlement state reaches HTML/RSC/client bundles.
- [ ] Provider secrets are server-only.
- [ ] Invalid/duplicate/out-of-order webhook cases are safe.
- [ ] Malformed route/deep-link inputs fail safely.
- [ ] Negative tests from Section 32.23 pass.

### Architecture

- [ ] Existing CookPilot domain sources remain authoritative.
- [ ] No Web-specific recipe/user/billing duplicate model is introduced.
- [ ] New persistence is limited to publication/identity/handle state required by Section 30.
- [ ] No `/app` Web product appears.
- [ ] No CookImport/CookPlan/CookMode/AI Web implementation is introduced.
- [ ] Legacy CookShare documentation did not drive implementation.

---

## 39. Explicit non-goals

Do not implement any of these during the CookShare work covered by the three implementation documents unless a later explicit product decision changes scope:

- user-generated recipe editing on Web;
- importing external recipes on Web;
- planning on Web;
- generating shopping lists on Web;
- cooking timers/execution on Web;
- AI transformations on Web;
- full personalized Home/MESA Web;
- CookFit Web;
- CookBalance Web;
- CookSignals Web;
- Web camera features;
- public comments;
- public followers;
- public social likes/counts;
- creator monetization;
- user bio/profile social system;
- content report workflow;
- account suspension state;
- editorial CMS;
- research blog;
- generic programmatic SEO page factory;
- `llms.txt` as P0;
- multiple recipe image aspect-ratio pipelines;
- recipe video platform;
- generated menu/day/week social-card system;
- CookList line-level historical DRM;
- user-controlled `noindex`;
- Web-specific Pro tier;
- packs on Web in this MVP;
- iOS deep linking;
- push-notification work;
- formal experimentation/A-B infrastructure;
- anonymous personalized feed;
- public popularity ranking;
- manual editorial pinning;
- CookShare snapshots/version history;
- a CookShare Manager screen.

---

# Annex A — Normative decision index

This annex is an index, not a restatement of the rules.

| ID | Decision | Authoritative section |
|---|---|---:|
| CS-FND-001 | CookShare is distribution/discovery, not a Web clone | §3–4 |
| CS-FND-002 | Desire-led acquisition | §2 |
| CS-FND-003 | Shared public object graph | §5, §8 |
| CS-FND-004 | Durable objects only | §9 |
| CS-FND-005 | Private/Public only | §10 |
| CS-FND-006 | Share publishes | §10.1 |
| CS-FND-007 | Global default + object override | §11 |
| CS-FND-008 | Publicability/discoverability/indexability are separate | §12 |
| CS-FND-009 | Same CookPilot identity Web/App | §13 |
| CS-FND-010 | Canonical Pro entitlement remains App-only | §13–14 |
| CS-FND-011 | Web visibility depends only on public + valid + active | §14 |
| CS-FND-012 | Public composites exclude private/sensitive descendants | §15 |
| CS-FND-013 | Premium copy lineage follows current official root | §16 |
| CS-FND-014 | Deleted official root frees descendants | §16.4 |
| CS-FND-015 | Ownership ≠ provenance display | §17 |
| CS-FND-016 | Live object, not share snapshot | §9.2, §18 |
| CS-FND-017 | UUID never canonical public identity | §19, §22 |
| CS-FND-018 | Slug aliases preserve identity | §20 |
| CS-FND-019 | Handle with cooldown/reservations | §21 |
| CS-FND-020 | Locale-first canonical routes | §22–23 |
| CS-FND-021 | Public search can rank UGC by relevance | §24 |
| CS-FND-022 | Canonical sharing URL | §25 |
| CS-FND-023 | Deep-link intent is view/cook only | §26 |
| CS-FND-024 | Intent never grants authority | §26, §32.14 |
| CS-FND-025 | Web hands off full-product work to app | §27 |
| CS-FND-026 | App shares same canonical identity | §28 |
| CS-FND-027 | Reuse backend; no Web duplicate domain | §29–31 |
| CS-FND-028 | Security baseline centralized here | §32 |
| CS-FND-029 | Existing analytics pipeline reused | §33 |
| CS-FND-030 | Existing user content migrates private by default | §35 |
| CS-FND-031 | Legacy CookShare ignored | §0, §36.10 |
| CS-FND-032 | Implementation order is dependency-driven | §37 |

---

# Annex B — Cross-cutting E2E scenario matrix

Detailed page/UI cases belong to document 02. Detailed Android/deferred mechanics belong to document 03. This matrix validates the current public-only Web and the preserved native App semantics.

| Scenario | Surface | Expected result |
|---|---|---|
| Open public Free recipe | Web visitor | Complete safe ingredients and ordered steps |
| Open public recipe premium in App | Web visitor | Same complete public culinary projection; no Web tier branch |
| Open private/unpublished/deleted object | Web visitor | 404/no existence signal |
| Public menu/day/week/list with descendants | Web visitor | Full public structure and available culinary descendants; no private state |
| Handle object URL | Web visitor | Concrete object resolves; root /@handle is 404 |
| Slug/handle alias | Web visitor | Permanent redirect to current canonical route |
| Public CookList | Web visitor | Eligible in Gallery/search/indexability when valid |
| Gallery continuation/search | Web visitor | Bounded keyset batches, deduped and public |
| Web-to-App view/cook | App | App re-resolves canonical URL and applies native Auth/Free-Pro rules |
| Unknown or malformed deep link | App/Web | Safe fallback without authority or open redirect |
| Unpublish after cached URL | Web visitor | Public resolver stops serving the object after revalidation |
| App Auth/Billing regression | App | Existing Auth, CookBilling, RevenueCat mobile, Play/Huawei and native gates unchanged |

---

# Annex C — Implementation stop conditions

Stop the affected subpart and surface the issue instead of improvising when any of these occur:

1. the implementation would require replacing an existing canonical CookPilot domain rather than extending it;
2. a new schema family/microservice appears necessary beyond the minimal cross-cutting state in Section 30;
3. current CookBilling behavior contradicts the intended canonical Pro entitlement in a way not covered by the known copy-lineage change;
4. current object ownership/durability semantics make a requested public identity ambiguous;
5. current localized data cannot support a promised canonical route without inventing translations or language ownership;
6. a public projection cannot be produced without exposing protected descendant data;
7. a provider requirement would force a different canonical public domain or user identity;
8. a migration cannot distinguish user-owned objects safely enough to default them private;
9. a change would alter existing mobile product behavior outside CookShare scope.

Do not stop for ordinary implementation choices such as naming a helper, selecting a local module boundary, or choosing an equivalent library. Those are implementation responsibilities.
