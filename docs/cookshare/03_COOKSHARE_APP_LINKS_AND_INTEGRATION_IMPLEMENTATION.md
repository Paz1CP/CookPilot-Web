# CookShare — App Links & Integration Implementation

**File:** `03_COOKSHARE_APP_LINKS_AND_INTEGRATION_IMPLEMENTATION.md`  
**Status:** implementation-authoritative for CookShare Android App Links, deferred installation, native bridge and App↔Web integration  
**Depends on:** `01_COOKSHARE_IMPLEMENTATION_FOUNDATION.md`, `02_COOKSHARE_WEB_DISCOVERY_IMPLEMENTATION.md`  
**Primary repositories:** CookPilot Android/Flutter app + CookPilot Web only where an App-Link/Web handoff artifact is required

---

## 0. Scope

This document closes the CookShare implementation plan by defining the Android integration layer between canonical CookShare URLs, Google Play, Huawei AppGallery Connect, Flutter navigation, authentication, entitlement gating, native domain flows and outbound sharing.

> **Do not implement from this document in isolation. Inspect the current repository and the referenced CookPilot domain documentation first. Existing domain behavior is authoritative unless this implementation plan explicitly overrides it. Reuse existing tables, views, RPCs, Edge Functions, domain services and app flows whenever possible.**

The Foundation owns:

- public-object identity;
- visibility/publication;
- URL contract;
- Free/Pro semantics;
- composite gating;
- premium lineage;
- cross-cutting authorization/security;
- backend reuse constraints.

The Web document owns:

- public rendering;
- Gallery/search;
- public SEO/indexability;
- canonical Web sharing and destination behavior;

This document owns:

- verified Android App Links;
- canonical URL ingestion in Flutter;
- strict route parsing;
- native object handoff;
- Google Play deferred intent transport;
- Huawei App Linking/AppGallery deferred transport;
- pending-intent persistence;
- interaction with existing Auth/Onboarding;
- interaction with existing native billing gates;
- share/publication integration from the app;
- store/flavor separation;
- release verification on real distributed builds.

The product is Android-only for this scope. Google Play and Huawei AppGallery are supported. iOS is not part of this work.

## 0.3 Current Web boundary (2026-09-12)

CookShare Web is public-only: unauthenticated, read-only and free of Paddle, RevenueCat Web, Web entitlement and paywall logic. Direct and deferred links carry only the canonical public URL and an optional action; they never carry or grant native entitlement. Once the app receives a link, existing Supabase Auth, CookBilling, RevenueCat mobile, Google Play/Huawei billing and native Free/Pro gates continue to decide what the app may do. The Web renders the complete safe culinary projection of a public valid object, while private/unpublished objects remain unavailable.

### 0.1 Current repository baseline to preserve

At implementation start, verify the repository again. The currently observed baseline is:

- application ID / namespace: `com.cookpilot.pe`;
- store flavor dimension with `googlePlay` and `huawei`;
- `MainActivity` is exported and uses `singleTask`;
- `MainActivity` extends `FlutterFragmentActivity`;
- existing Supabase auth callback uses the separate custom scheme:
  `com.cookpilot.pe://login-callback`;
- no CookShare HTTPS App Link filter exists yet;
- `go_router` is already the app router;
- `shared_preferences` already exists;
- `share_plus` already exists;
- `receive_sharing_intent` already exists for inbound social import and must not be confused with CookShare outbound sharing;
- Huawei AGConnect build infrastructure already exists in the Huawei flavor;
- Google flavor deliberately removes Huawei runtime components;
- current recipe/menu preview behavior is driven through existing preview providers/coordinators;
- current CookMode entry consumes existing preview/domain state rather than raw external link payloads.

These facts are integration constraints, not a request to preserve accidental implementation debt.

### 0.2 External configuration

Do not create an IDs/SHA/provider-status inventory document.

When this implementation reaches a step that needs:

- Play App Signing SHA-256;
- Huawei signing SHA-256;
- AppGallery App Linking prefix;
- AppGallery trusted URL configuration;
- Play Console Deep Links verification;
- store listing/test-track access;

resolve the concrete values from the current repository/environment/provider dashboards.

The implementation agent has browser/provider access and should complete safe external configuration directly. Ask the human only for a genuinely human-only blocker such as 2FA, account-owner consent or a legal/identity action.

---

## 1. Deep links as the primary CookShare bridge

CookShare uses the public HTTPS object identity as the bridge between Web and app.

The bridge is:

```text
canonical CookShare URL
        ↓
Web when app is absent/unhandled
        ↓
Android verified App Link when app is installed
        ↓
CookShare link coordinator
        ↓
canonical parser
        ↓
object resolver
        ↓
public visibility, then App ownership / entitlement
        ↓
existing native domain flow
```

For deferred installation:

```text
canonical CookShare object
        ↓
explicit Open/Install in App action
        ↓
store-specific transport
        ↓
store install
        ↓
first launch
        ↓
recover canonical CookShare intent
        ↓
same parser + resolver as direct App Link
        ↓
existing native domain flow
```

There is no second deep-link business model for Google and Huawei.

Both stores ultimately recover the same normalized CookShare intent.

### 1.1 Core implementation invariant

> **A deep link expresses intent, never authority.**

A link may request:

- which object to view;
- whether the user intended `cook`.

It never proves:

- that the object is public;
- that the current user owns it;
- that the user is Pro;
- that a premium recipe may be executed;
- that a private object may be revealed;
- that a stored object still exists;
- that a provider wrapper is trustworthy.

Every ingress path converges on the same authorization/domain resolution before native handoff.

---

## 2. Canonical HTTPS URL principle

Canonical CookShare identity is always:

```text
https://cookpilot.pro/...
```

The canonical URL is the URL that:

- appears on public pages;
- is copied;
- is shared through the Android share sheet;
- is sent to WhatsApp;
- is encoded in recipe QR;
- is indexed by search;
- is stored as canonical pending intent when useful;
- is used to reconstruct an object after deferred install.

Never make any of these canonical:

- `intent://...`;
- a Play Store URL;
- a Huawei `*.drcn.agconnect.link` URL;
- a Supabase auth callback URL;
- a custom app scheme;
- an internal GoRouter route;
- an object UUID URL.

Provider/store URLs are transport.

### 2.1 HTTPS only

CookShare App Links accept only HTTPS.

An `http://cookpilot.pro/...` URL may redirect on Web, but the native CookShare parser must not treat HTTP as canonical authority.

Do not add an HTTP CookShare intent filter merely to compensate for bad shared URLs.

### 2.2 Host

CookShare canonical host is exactly:

`cookpilot.pro`

Do not broaden the verified app-link host to:

- `*.cookpilot.pro`;
- `www.cookpilot.pro`;
- `media.cookpilot.pro`;
- `media-write.cookpilot.pro`.

If `www` has Web redirect behavior, that remains Web infrastructure. Public CookShare identity is the apex host.

---

## 3. Supported object routes

The app-link parser supports the public route grammar defined in Foundation §22.

### 3.1 Official recipe

```text
/es/recetas/{slug}
/en/recipes/{slug}
```

### 3.2 User-owned recipe

```text
/es/@{handle}/recetas/{slug}
/en/@{handle}/recipes/{slug}
```

### 3.3 User menu

```text
/es/@{handle}/menus/{slug}
/en/@{handle}/menus/{slug}
```

### 3.4 User day

```text
/es/@{handle}/dias/{slug}
/en/@{handle}/days/{slug}
```

### 3.5 User week

```text
/es/@{handle}/semanas/{slug}
/en/@{handle}/weeks/{slug}
```

### 3.6 User CookList

```text
/es/@{handle}/listas/{slug}
/en/@{handle}/lists/{slug}
```

### 3.7 Ingredient

```text
/es/ingredientes/{slug}
/en/ingredients/{slug}
```

### 3.8 Category / category intersection

```text
/es/categorias/{segment1}
/es/categorias/{segment1}/{segment2}
/es/categorias/{segment1}/{segment2}/{segment3}

/en/categories/{segment1}
/en/categories/{segment1}/{segment2}
/en/categories/{segment1}/{segment2}/{segment3}
```

### 3.9 Handle object context

Handles are accepted only as part of a concrete user-object route such as /es/@{handle}/recetas/{slug} or /en/@{handle}/recipes/{slug}. A root /@{handle} profile/showcase is not a CookShare object link and falls back to Web 404.

### 3.10 Routes deliberately not claimed as CookShare native object links

Do not claim native ownership for:

- `/es`
- `/en`
- `/es/gallery`
- `/en/gallery`
- `/es/pro`
- `/en/pro`
- guides;
- FAQ;
- comparisons;
- privacy/terms;
- auth routes;
- sitemap/robots;
- `/.well-known/*`;
- arbitrary marketing routes.

Those remain Web surfaces.

---

## 4. Supported action vocabulary

Only two actions exist:

```text
view
cook
```

`view` is the default and need not appear in the URL.

The normalized external representation for a special action is:

```text
?action=cook
```

Example:

```text
https://cookpilot.pro/es/recetas/lomo-saltado?action=cook
```

The canonical base object remains:

```text
https://cookpilot.pro/es/recetas/lomo-saltado
```

The action parameter expresses runtime intent; it does not create another object identity.

### 4.1 Parsing action

Rules:

- missing `action` → `view`;
- `action=view` → `view`;
- `action=cook` → `cook`;
- unknown action → safe `view` fallback plus diagnostic event;
- repeated/conflicting action parameters → malformed intent; safe `view` fallback;
- `cook` on an unsupported object type → `view` fallback.

Do not implement arbitrary string dispatch such as:

```text
?action={internalFunctionName}
```

### 4.2 Other query parameters

Unknown benign query parameters do not grant behavior.

They may be ignored after validation so that an otherwise valid CookShare URL still works if a third party appends campaign parameters.

Never read authorization, user identity, entitlement, product price or object ownership from query parameters.

---

## 5. `view` semantics

`view` means:

> Resolve this CookShare identity and open the normal existing native representation that the current actor is allowed to use.

It is non-mutating.

Opening a `view` link must not automatically:

- save a recipe;
- copy another user's object;
- apply a menu/day/week to CookPlan;
- insert items into CookList;
- start CookMode;
- publish anything;
- change a handle;
- purchase anything.

If the object is public and native preview can operate without permanent identity, the user may view it before completing onboarding.

If viewing a specific native surface genuinely requires identity under existing domain semantics, preserve the pending object, perform the existing identity handoff, then resume it.

---

## 6. `cook` semantics

`cook` means:

> Resolve this object, verify the current actor may execute it, prepare the same domain state that a normal in-app Cook action would prepare, then invoke the existing CookMode entry.

### 6.1 Recipe

Recipe `cook` uses the existing recipe preview/domain load and current cooking entry.

It must not construct CookMode state directly from:

- URL slug;
- query parameters;
- a Web JSON payload;
- share metadata.

### 6.2 Menu

Menu `cook` means **cook the whole menu** according to existing CookMode behavior.

It does not mean:

- cook the first recipe;
- cook only the primary component;
- flatten the menu into an ad-hoc recipe.

### 6.3 Other objects

`cook` is not a generic action for day/week/list/ingredient/category/handle.

For those types, safely degrade to `view`.

### 6.4 Access

If CookMode is unavailable because the resolved recipe/menu contains content the current actor cannot execute:

```text
resolve object
→ show allowed native preview/context
→ existing billing gate
→ canonical entitlement refresh
→ resume same cook intent
```

Do not start partial execution before access is confirmed.

---

## 7. Route parsing

Implement one strict Dart parser for CookShare canonical URLs.

All three ingress sources feed this parser:

1. direct HTTPS App Link;
2. Google Play Install Referrer recovered URL;
3. Huawei App Linking recovered deep link.

Do not implement three route parsers.

### 7.1 Parser output

The parser returns either:

```text
CookShareExternalIntent
```

or a typed invalid/not-supported result.

Suggested typed model:

```dart
enum CookShareObjectType {
  recipe,
  menu,
  day,
  week,
  cookList,
  ingredient,
  category,
  handle,
}

enum CookShareAction {
  view,
  cook,
}

enum CookShareIntentSource {
  directAppLink,
  playInstallReferrer,
  huaweiAppLinking,
}
```

The parser output should contain semantic route identity, not privileged domain data.

### 7.2 Structural validation

Require:

- `https`;
- host exactly `cookpilot.pro`;
- no user-info component;
- no non-default port;
- supported locale `es` or `en`;
- known route vocabulary for that locale;
- expected segment count;
- valid handle/slug segment syntax;
- category intersection count within the canonical maximum.

Reject or safely downgrade malformed structure.

### 7.3 Encoding rules

Normalize once.

Reject ambiguous/path-confusion input such as:

- encoded `/` inside a segment;
- encoded `\`;
- raw backslash path tricks;
- NUL;
- `.` / `..` path traversal semantics;
- invalid UTF-8/percent encoding;
- pathological overlong segments;
- empty required slug;
- malformed `@handle`.

Do not repeatedly decode until a string "looks right."

### 7.4 Locale semantics

Route vocabulary must match locale.

Examples:

```text
/es/recetas/...     valid
/en/recipes/...     valid

/es/recipes/...     unsupported
/en/recetas/...     unsupported
```

Do not silently reinterpret mixed-locale routes as a different route family.

Web alias/redirect logic may canonicalize legacy routes before App Link handoff if such aliases exist.

### 7.5 Fragment

CookShare does not use URL fragments for authority or actions.

Ignore a harmless fragment for object identity or reject it according to the single parser policy, but never dispatch behavior from it.

### 7.6 Parser must be pure

The route parser does not:

- query Supabase;
- check billing;
- navigate;
- mutate pending state.

This allows exhaustive unit tests.

---

## 8. Object identity resolution

Parsing answers **what identity was requested**.

Domain resolution answers **what current CookPilot object that identity represents**.

### 8.1 Resolution contract

After parsing:

```text
semantic external route
+ current actor/session context
→ canonical object resolver
→ current object identity
→ current visibility
→ owner relation
→ current access projection
→ canonical URL / alias status
→ native handoff descriptor
```

Reuse the public-object resolution/domain work from documents 01/02.

Do not create an Android-only slug database.

### 8.2 Slug aliases

If an old slug/handle route resolves to a current canonical object:

- the app may continue directly to that object;
- update the stored pending canonical URL to the current route;
- analytics may record alias resolution;
- do not expose internal redirect machinery to the user.

### 8.3 UUID

A resolver may return internal UUIDs after trusted resolution.

The external URL never needs to contain them.

### 8.4 Private object

Resolution must include current actor.

For a non-owner:

```text
private/unpublished
→ not found
```

For the authenticated owner:

```text
private/unpublished
→ owner may resolve under existing owner semantics
```

Do not use the mere presence of `@handle` as proof of ownership.

### 8.5 Deleted object

Deleted identity is terminal:

```text
notFound
```

Do not route to a similarly named object.

---

## 9. Android App Links

Add verified HTTPS App Links to `MainActivity`.

Keep the existing custom Supabase auth callback filter separate.

### 9.1 Do not replace auth callback

This existing semantic remains separate:

```text
com.cookpilot.pe://login-callback
```

CookShare does not migrate native Auth to `cookpilot.pro` as part of this task.

### 9.2 MainActivity

The current activity already has:

- `android:exported="true"`;
- `android:launchMode="singleTask"`.

Preserve those semantics unless the app architecture changes for another independently justified reason.

`singleTask` is useful because links received while the app is alive arrive through the existing activity/new-intent lifecycle.

### 9.3 Static path scope

Use traditional manifest path-prefix rules for the stable CookShare object families so Android 14 and lower do **not** claim every route on `cookpilot.pro`.

Static App Link scope must cover:

```text
/es/recetas/
/en/recipes/

/es/@
/en/@

/es/ingredientes/
/en/ingredients/

/es/categorias/
/en/categories/
```

The `/{locale}/@` prefix intentionally covers:

- handle;
- user recipes;
- menus;
- days;
- weeks;
- lists.

Do not claim `/es/` or `/en/` wholesale.

### 9.4 Intent-filter shape

Use `android:autoVerify="true"` with:

- `VIEW`;
- `DEFAULT`;
- `BROWSABLE`;
- `https`;
- host `cookpilot.pro`;
- the stable path prefix.

Prefer separate clear filters where needed to avoid Android `<data>` cross-product ambiguity.

Do not mix the CookShare HTTPS scheme and the auth custom scheme into one filter.

### 9.5 Flutter ingress ownership

Use `app_links` explicitly for CookShare direct URI ingestion.

It currently exists only transitively; if CookShare imports it, add it as a **direct dependency** at a compatible current version rather than relying on another package to keep it installed.

When a third-party plugin owns deep-link delivery, disable Flutter's default deep-link handler in the activity:

```xml
<meta-data
    android:name="flutter_deeplinking_enabled"
    android:value="false" />
```

This avoids duplicate raw URL delivery into GoRouter.

Regression-test Supabase native auth callbacks after this change.

The CookShare listener itself ignores non-HTTPS/non-`cookpilot.pro` URIs, so it does not consume `com.cookpilot.pe://login-callback` as a CookShare route.

### 9.6 Do not route external URL directly through GoRouter

The current router has strong auth/onboarding redirects.

Do not hand:

```text
https://cookpilot.pro/es/recetas/...
```

directly to GoRouter and hope route redirects preserve intent.

Instead:

```text
App Link
→ CookShare coordinator
→ parse
→ persist intent
→ resolve
→ prepare existing native state
→ navigate to existing internal route
```

---

## 10. `assetlinks.json` contract

The Web repository must serve:

```text
https://cookpilot.pro/.well-known/assetlinks.json
```


### 10.1 Transport requirements

It must be:

- HTTPS;
- public;
- status `200`;
- content type `application/json`;
- directly served;
- no redirect;
- no auth;
- no locale redirect.

### 10.2 Association

Use relation:

```text
delegate_permission/common.handle_all_urls
```

Target:

```text
namespace: android_app
package_name: com.cookpilot.pe
```

### 10.3 Production fingerprints

Authorize the certificates actually used by distributed production builds.

Resolve them from current provider configuration at implementation time.

Include:

- Google Play App Signing SHA-256;
- Huawei/AppGallery production signing SHA-256 if different.

Do **not** add a debug certificate to production `assetlinks.json`.

If both production store variants use the same package with distinct valid production certificates, authorize both fingerprints for that package.

### 10.4 Do not duplicate fingerprints into docs

The provider/dashboard/environment remains the concrete value source.

This file is the deployed association, not a hand-maintained documentation registry.

### 10.5 Verification

A correct JSON file is not enough.

Release acceptance requires the actual distributed app certificate and Android verification state to match.

---

## 11. Android 15 Dynamic App Links

Support Android 15+ Dynamic App Links through the same `assetlinks.json`.

### 11.1 Purpose

Dynamic rules are used to refine/revoke supported paths without making `assetlinks.json` a second URL architecture.

### 11.2 Static-first compatibility decision

CookPilot supports Android below 15.

Therefore the manifest deliberately keeps safe legacy `pathPrefix` rules for the stable route families.

Do **not** declare only the whole `cookpilot.pro` host in the manifest and rely on Android 15 dynamic exclusions, because Android 14 and lower would risk claiming marketing/auth routes.

This is an intentional compatibility tradeoff:

> stable CookShare families may be opened on old Android; new top-level route families still require an app update if old Android must support them.

### 11.3 Dynamic rules

Within the manifest's allowed scope, define `dynamic_app_link_components` for the same supported CookShare paths and finish with an exclusion rule for anything not explicitly accepted inside the applicable scope.

Keep ordering deliberate: Android evaluates rules in sequence.

### 11.4 Only one dynamic rule object

For a given site/relation/app combination, define one authoritative `dynamic_app_link_components` object.

Do not create duplicate statements with competing dynamic rules.

### 11.5 Failure behavior

Malformed dynamic configuration must not be allowed to break old Android behavior.

Static manifest rules remain the compatibility baseline.

### 11.6 Propagation

Dynamic rule fetch is asynchronous/periodic.

Do not build release correctness around instant server propagation.

---

## 12. Google Play install flow

A normal shared URL stays canonical.

When the app is absent, the user can consume the public Web page.

When the user explicitly chooses an App/Open/Install CTA intended for the Google Play build, preserve the CookShare intent through the Play listing.

Flow:

```text
canonical object URL
→ explicit Google Play install/open CTA
→ Play listing for com.cookpilot.pe
   + Install Referrer payload
→ install
→ first launch
→ native Google bridge reads referrer
→ Dart receives canonical URL
→ same CookShare parser
→ pending intent
→ exact continuation
```

### 12.1 Store URL is not shared identity

The Play Store URL may include a `referrer=` parameter.

It must never replace the canonical object URL in:

- share sheet;
- copy;
- QR;
- SEO.

### 12.2 Referrer payload format

Use a compact versioned payload whose central value is the canonical CookShare URL.

Recommended logical payload before outer URL encoding:

```text
v=1&url=https%3A%2F%2Fcookpilot.pro%2Fes%2Frecetas%2Flomo-saltado%3Faction%3Dcook
```

Then percent-encode that entire payload as the Play Store `referrer` value.

This provides:

- versioning;
- one canonical parser;
- no duplicated slug grammar in Kotlin.

### 12.3 No secrets

The referrer payload contains no:

- access token;
- refresh token;
- entitlement token;
- user ID as authority;
- checkout secret;
- API key.

It is attacker-editable transport.

---

## 13. Play Install Referrer

Use the official Google Play Install Referrer library in the `googlePlay` flavor only.

Current official dependency line:

```kotlin
googlePlayImplementation(
    "com.android.installreferrer:installreferrer:2.2"
)
```

Resolve the current supported version again before implementation if the dependency ecosystem changes.

### 13.1 Native responsibility

Native Google bridge responsibilities:

1. connect asynchronously to Play;
2. retrieve `installReferrer`;
3. retrieve provider timestamps when available;
4. close the connection;
5. expose raw canonical-intent candidate + timestamps to Dart;
6. never decide object access.

### 13.2 First execution

Google documents referrer data as stable for 90 days unless the app is reinstalled and recommends reading it once during first execution after install.

Implement a local processed marker.

Do not query Install Referrer on every app resume.

### 13.3 Response handling

Handle at minimum:

- `OK`;
- feature not supported;
- service unavailable;
- temporary disconnection.

A temporary Play Store service issue must not block normal app startup indefinitely.

Use a bounded retry strategy appropriate for first launch.

### 13.4 Connection cleanup

Always end the Install Referrer connection after the retrieval attempt completes.

### 13.5 Provider timestamps

Use the referrer click timestamp as the best `originatedAt` for pending-intent expiration when credible/available.

Do not use it as authorization.

### 13.6 Flavor boundary

The Huawei build must not compile or initialize Play Install Referrer merely for architectural symmetry.

---

## 14. Huawei App Linking

The Huawei flavor uses AppGallery Connect App Linking for the deferred-install transport.

The canonical public link remains `cookpilot.pro`.

### 14.1 Existing AGConnect infrastructure

Reuse the existing Huawei flavor AGConnect setup.

Do not move Huawei dependencies into the Google flavor.

Add the App Linking SDK only to Huawei.

Current Huawei documentation uses:

```text
com.huawei.agconnect:agconnect-applinking:1.9.6.300
```

Recheck the compatible current SDK version while implementing.

### 14.2 External AppGallery Connect setup

The implementation agent should verify/configure through AppGallery Connect as needed:

- App Linking enabled;
- production URL prefix requested;
- trusted URL formats include the intended `cookpilot.pro` deep links;
- correct production app/signature configuration;
- deferred flow works from AppGallery.

Do not turn these values into a separate `.md` inventory.

### 14.3 Receiving provider links

Use the Huawei App Linking SDK's current receive flow:

```text
AGConnectAppLinking
→ getAppLinking(Activity)
→ resolved deepLink
→ native bridge
→ Dart canonical parser
```

The recovered `deepLink` is not trusted merely because Huawei returned it.

### 14.4 Runtime and cold-start

Handle provider wrapper links on:

- cold launch;
- relevant new intent while `MainActivity` is alive.

The current activity is `singleTask`; ensure the store bridge receives new intents and does not only inspect the first launch intent.

### 14.5 Clipboard behavior

Current Huawei documentation states that disabling the App Linking SDK's clipboard-reading behavior makes deferred deep linking unavailable.

Because deferred AppGallery continuation is an explicit CookShare requirement, configure the Huawei flavor according to the current SDK requirement, including Huawei's documented metadata when necessary:

```xml
<meta-data
    android:name="com.huawei.agconnect.applinking.READ_CLIPBOARD_PERMISSION"
    android:value="Available" />
```

This metadata belongs to the Huawei variant only.

CookPilot code must not independently read, copy, log or persist arbitrary clipboard contents for deferred linking.

If Huawei changes this requirement before implementation/release, follow the current provider contract rather than preserving obsolete metadata.

---

## 15. AppGallery deferred flow

The E2E Huawei flow is:

```text
canonical CookShare Web object
→ user explicitly chooses AppGallery/Open in app path
→ Huawei App Linking wrapper carries encoded canonical URL
→ app absent
→ AppGallery
→ install Huawei flavor
→ first launch
→ AGConnect App Linking recovers deep link
→ validate exact canonical cookpilot.pro route
→ persist normalized intent
→ auth/access/domain resolution
→ exact native destination
```

### 15.1 Wrapper format

Huawei's provider URL may contain parameters such as:

```text
https://{prefix}.drcn.agconnect.link/
  ?deeplink={encoded canonical URL}
  &android_package_name=com.cookpilot.pe
  ...
```

Use provider-supported parameters generated/configured according to current documentation.

Do not expose provider internals as CookShare business semantics.

### 15.2 Trusted deep-link formats

AppGallery Connect trusted URL configuration must constrain provider deep links to CookPilot's intended HTTPS domain/routes.

The app still validates again.

### 15.3 Fallback

If the provider cannot recover a valid deferred CookShare URL:

- continue normal app startup;
- do not guess from campaign name;
- do not navigate to a random featured recipe.

### 15.4 Real-device acceptance

Deferred AppGallery behavior must be tested from an actual AppGallery distribution/test path with the app absent before declaring complete.

---

## 16. Canonical URL vs provider wrapper

The relationship is:

```text
canonical URL = identity
provider wrapper = transport
```

### 16.1 Canonical URL

Example:

```text
https://cookpilot.pro/es/recetas/lomo-saltado?action=cook
```

### 16.2 Huawei wrapper

May embed the canonical URL.

It is never:

- stored as object canonical identity;
- shown as the public recipe URL;
- encoded into recipe QR;
- emitted by generic Share.

### 16.3 Google Play listing URL

Same rule.

It may transport Install Referrer data after an explicit install action.

### 16.4 Normal installed-app behavior

When installed, direct canonical App Links are the preferred route.

Provider wrappers exist to solve store/deferred mechanics, not to replace normal CookShare links.

---

## 17. Deferred deep-link state machine

Implement one typed pending-intent state machine in Dart.

Conceptual states:

```text
received
  ↓
parsed
  ↓
pending
  ↓
resolving
  ├─ needsAuth
  ├─ needsEntitlement
  ├─ ready
  ├─ invalid
  ├─ expired
  ├─ notFound
  ├─ unpublished
  └─ unsupported
        ↓
handedOff
  ↓
consumed
```

### 17.1 `received`

A raw candidate arrived from:

- direct App Link;
- Play Install Referrer;
- Huawei App Linking.

### 17.2 `parsed`

The URL passed canonical route parsing.

No domain authority has been granted yet.

### 17.3 `pending`

The normalized intent is persisted before a flow capable of interruption starts.

### 17.4 `resolving`

Current object/actor/access state is being obtained.

### 17.5 `needsAuth`

Permanent identity is required for the intended continuation.

Keep the pending intent.

### 17.6 `needsEntitlement`

The object may be previewable, but the requested action requires Pro/current access.

Keep the pending intent.

### 17.7 `ready`

The current actor is authorized for the exact handoff.

### 17.8 `handedOff`

The existing domain flow has accepted the resolved object/action.

### 17.9 `consumed`

Clear persisted pending state when ownership of the operation has successfully passed to the domain flow.

### 17.10 Terminal states

Clear or terminally mark:

- invalid;
- expired;
- not found;
- unpublished for current actor;
- permanently unsupported.

Do not loop forever on a dead public URL.

---

## 18. Pending intent persistence

Use a small, versioned local durable model.

`shared_preferences` is already available and is sufficient because the pending payload contains no secret.

### 18.1 Suggested model

```dart
class CookSharePendingIntent {
  final int schemaVersion;            // 1
  final String canonicalUrl;
  final CookShareObjectType objectType;
  final CookShareAction action;
  final CookShareIntentSource source;
  final DateTime originatedAt;
  final DateTime receivedAt;
  final String? resolvedObjectId;     // only after trusted resolution, optional
}
```

The exact Dart structure may be adapted to current project conventions.

### 18.2 Do not persist

Never persist in pending intent:

- Supabase JWT/access/refresh token;
- RevenueCat API key;
- entitlement assertion;
- Paddle data;
- card/payment data;
- auth callback URL;
- password;
- Web checkout secret;
- arbitrary external return URL.

### 18.3 Canonical identity

Once an alias resolves to the current canonical route, update the stored canonical URL.

### 18.4 Survive process death

Pending state must survive:

- app background;
- process death;
- full app close;
- restart during login;
- restart during purchase.

### 18.5 Clear on success
IMPORTANT:
Do not leave an already-executed `cook` intent in storage where it can unexpectedly re-run on the next launch.

---

## 19. Last-explicit-link-wins

CookShare supports exactly one pending user intent at a time.

A newer explicit link replaces an older pending link.

### 19.1 Explicit events

Count as explicit:

- user taps a new direct canonical App Link;
- provider deferred link recovered from the store click/install that launched this install;
- user explicitly retries the current `cook` action from the object.

### 19.2 Precedence

For first launch:

```text
direct URL that launched this Activity
> valid deferred provider intent
> previously persisted pending intent
> normal startup
```

For a warm app:

```text
new direct App Link
> current pending intent
```

### 19.3 Store recovery must not overwrite newer direct link

Deferred recovery is asynchronous.

If the user opens a new direct link while Install Referrer/App Linking recovery is still completing, the late provider callback must not overwrite the newer explicit intent.

Use an in-memory generation/sequence token or timestamped coordinator transaction to prevent stale completion from winning.

### 19.4 No privilege effect

Replacing pending intent never changes:

- auth;
- ownership;
- entitlement.

---

## 20. Expiration

Pending CookShare intent expires after:

```text
7 days
```

### 20.1 Start time

Prefer:

- Play referrer click timestamp;
- Huawei/provider original click timestamp if reliably exposed.

Otherwise use the earliest trusted local recovery/receipt time.

### 20.2 Expired behavior

```text
expired
→ clear pending
→ continue normal app startup or remain on current screen
```

Do not automatically send the user to Home if they are already somewhere meaningful.

### 20.3 Clock anomalies

Handle impossible future timestamps defensively.

Do not allow a forged provider timestamp to produce infinite persistence.

---

## 21. First-open resolution

First launch after install must not default to Home before deferred recovery has had a bounded chance to resolve.

### 21.1 Bootstrap sequence

Recommended coordinator sequence:

```text
app initializes
→ CookShare coordinator starts
→ collect direct initial URI if any
→ inspect persisted pending
→ query store-specific deferred source when applicable
→ choose winning intent
→ parse/persist
→ allow auth/domain readiness
→ resolve object
→ hand off
```

### 21.2 Do not freeze splash indefinitely

Provider APIs may be unavailable.

Use a bounded resolution window and allow normal app startup while keeping a pending async recovery path if the provider can still complete safely.

### 21.3 Race with existing Splash/Auth

Integrate with the current existing app bootstrap.

Do not create a second splash/navigation root just for CookShare.

### 21.4 Already processed store referrer

If store deferred source has already been processed for this install:

- skip provider query;
- use current direct/persisted state.

---

## 22. Auth interaction

The pending intent is not an auth redirect URL.

Auth and CookShare coordinate through typed state.

### 22.1 Public preview before permanent auth

When existing app behavior allows it, a public `view` should reach the object's native preview without forcing the user through full onboarding.

Do not require permanent account solely because the object originated outside the app.

### 22.2 Action requires permanent identity

If the requested operation requires ownership/persistence/paid account identity:

```text
pending intent persists
→ invoke existing forced-login/auth flow
→ auth succeeds
→ refresh actor
→ re-resolve original object
→ resume
```

Do not encode the whole external URL into an arbitrary login `returnTo` query parameter.

### 22.3 Auth cancellation

If user cancels/closes login:

- do not execute protected action;
- preserve object context when practical;
- do not repeatedly force login on every frame/resume.

A later explicit retry may continue from the same pending object.

### 22.4 Supabase callback regression

CookShare changes to deep-link ingestion must preserve:

```text
com.cookpilot.pe://login-callback
```

Run native Google/email auth regression tests on both flavors.

---

## 23. Onboarding interaction

Onboarding is not allowed to destroy an explicit CookShare object intent.

### 23.1 Authenticated but onboarding incomplete

If a user is authenticated but their normal app entry target is onboarding:

- the linked public object may still be shown;
- retain the fact that onboarding remains incomplete;
- return to normal onboarding expectations after the linked interaction when appropriate.

### 23.2 Existing router redirects

The current GoRouter redirects may otherwise push unknown/non-whitelisted navigation to Home or onboarding.

Add the narrowest explicit CookShare handoff state needed so router guards recognize an active, validated link continuation.

Follow existing handoff/coordinator patterns rather than disabling onboarding guards globally.

### 23.3 No new onboarding fork

Do not create:

- "CookShare onboarding";
- a special registration wizard;
- link-specific health setup.

### 23.4 `cook`

If actual cooking requires an app/account state that cannot proceed before required existing setup, preserve pending `cook` and resume after that legitimate prerequisite.

The default public preview still should not be discarded.

---

## 24. Free/Pro gate interaction

Use Foundation §14–16 and current CookBilling canon.

### 24.1 Premium recipe `view`

A Free actor may open the native allowed preview.

The native surface must preserve the same effective access contract:

- allowed metadata/nutrition;
- first five ingredients for official blocked recipe;
- no protected steps/remaining ingredients/price.

Do not loosen native access because the entry came from a public URL.

### 24.2 Premium `cook`

For Free:

```text
view context available
→ cook attempted/requested
→ existing billing gate
→ no CookMode yet
```

### 24.3 Pro

If effective Pro is already active, do not display another purchase flow.

### 24.4 Revocation

If entitlement disappears while a pending protected action exists:

- re-resolve;
- gate again;
- never trust the access state captured when the link was first received.

---

## 25. Paywall continuation

Do not build a CookShare-specific native paywall.

Use the existing CookBilling gate coordinator/paywall entry intent.

### 25.1 Before paywall

Persist:

- object identity;
- `cook` intent;
- current continuation state.

### 25.2 Purchase result

SDK/UI purchase success is not sufficient authority.

Wait for the existing canonical CookPilot billing state/effective entitlement to become Pro.

Then:

```text
refresh entitlement
→ re-resolve object
→ verify it still exists / remains accessible
→ resume exact cook handoff
```

### 25.3 Native entitlement

The app re-reads its existing canonical entitlement after Auth or a native purchase interruption. A Web view never grants or transports entitlement, so no Web-purchase special case exists.

### 25.4 Cancellation

A cancelled paywall must not create an auto-reopen loop.

Keep the object open/previewable.

Preserve the semantic original intent if useful for a later explicit retry, but mark the action as requiring a new user gesture in the current session.

Do not auto-launch paywall again merely because the app resumes.

### 25.5 App restart during purchase/auth

Persisted object intent survives.

After restart, do not assume purchase succeeded; re-read effective entitlement.

---

## 26. Object-specific native destinations

CookShare does not invent generic native "public object" screens.

It resolves each object into the existing native domain surface.

Target matrix:

| Public object | Native destination |
|---|---|
| recipe | existing recipe/menu preview machinery |
| menu | existing menu preview machinery |
| day | existing CookPlan/saved-day domain surface |
| week | existing CookPlan/saved-week domain surface |
| CookList | existing CookList/list surface |
| ingredient | existing ingredient/nutrition detail surface |
| category | existing CookSearch category surface |
| own handle in an object URL | existing native object surface |
| bare/other-user handle | canonical Web object route when present; bare root is Web 404 |

If a listed domain surface turns out not to exist as a meaningful routable/read-only native destination, that is a real implementation gap. Do not invent a large new subsystem silently.

---

## 27. Recipe behavior

### 27.1 `view`

Resolve canonical recipe identity.

Then prepare the same preview state used by in-app recipe discovery.

The current code already seeds `cookMenuPreviewProvider` from CookSearch with:

- recipe ID;
- localized title;
- image;
- current plan tier;
- source context;

and navigates to the existing menu/recipe preview route.

Reuse or factor that behavior into a shared recipe-preview launcher usable by:

- CookSearch;
- CookShare.

Do not duplicate the seed/load logic.

### 27.2 Full resolution

Do not trust title/image embedded in the link.

Load current recipe/domain data from canonical sources.

### 27.3 `cook`

```text
resolve recipe
→ prepare current preview/domain state
→ verify access
→ invoke current Cook action
→ existing CookMode loading/entry
```

Do not route directly to a CookMode step from the URL.

### 27.4 User copy

A user-copy link uses the same native recipe surface after current publication/ownership/premium-lineage resolution.

Owner gets normal editable-capable domain semantics where current app exposes them.

Another user does not inherit owner-only editing.

---

## 28. Menu behavior

### 28.1 `view`

Resolve the durable menu and use the existing menu preview domain.

Do not create a special CookShare menu screen.

### 28.2 `cook`

Use the full resolved menu.

The handoff must preserve all recipe components/quantities/current domain representation needed by the existing CookMode pipeline.

### 28.3 Premium descendants

The current actor's effective access applies before execution.

A public menu is not permission to run protected recipe components.

### 28.4 No auto-save/apply

Opening another user's public menu does not automatically:

- save it;
- insert it into CookPlan;
- modify current day.

Those happen only through existing explicit actions.

---

## 29. Day behavior

A public/saved day is a durable object, not an instruction to overwrite today's plan.

### 29.1 `view`

Open the existing read/detail/application context for that saved day.

### 29.2 No automatic application

Do not apply the day to the user's current calendar merely because the link opened.

### 29.3 Real dates

If the public day object includes its original real date under the Foundation/Web contract, native preview may show it.

Opening does not reinterpret that date as "today."

### 29.4 Missing native detail

If current CookPlan only supports applying a saved day but has no meaningful read-only destination, implement the smallest domain-consistent entry required or surface the gap before inventing a separate CookShare day product.

---

## 30. Week behavior

Same principles as Day.

### 30.1 `view`

Open existing saved-week/CookPlan domain representation.

### 30.2 No auto-apply

Never mutate the current plan on URL visit.

### 30.3 Dates

Preserve the durable week's real semantics.

Do not shift dates simply to make it fit the recipient's current week.

### 30.4 Access

Protected recipe descendants remain governed by the recipient's entitlement.

---

## 31. CookList behavior

### 31.1 `view`

Resolve the durable public CookList and open the existing list-domain surface/read context.

### 31.2 Public state

Do not transfer another user's:

- checked/purchased flags;
- private notes;
- owner-only ephemeral state.

### 31.3 No automatic merge

Opening a public list must not silently merge it into the recipient's own active shopping state.

Explicit existing copy/use actions may do so if supported.

### 31.4 Historical entitlement

Use Foundation's CookList exception.

Do not introduce line-level historical DRM merely because the list came through a link.

---

## 32. Ingredient behavior

Ingredient canonical identity maps to the existing ingredient/nutrition domain.

### 32.1 `view`

Resolve canonical ingredient slug/alias to current ingredient identity.

Open the current ingredient detail/sheet/native surface.

### 32.2 Existing UI shell

If ingredient detail today is a sheet rather than a top-level route, open that existing detail against the appropriate existing shell instead of inventing a separate ingredient application architecture.

### 32.3 Gap condition

If there is genuinely no existing user-meaningful ingredient detail surface, stop this subpart and surface the gap. The public URL decision does not authorize inventing a large new ingredient feature.

### 32.4 Pricing

Do not reveal Pro-only price data because the link is public.

---

## 33. Category behavior

Resolve canonical category slug to the existing category identity.

Then reuse the current CookSearch category surface.

The current router already supports a CookSearch discover-category route and category arguments.

### 33.1 Intersections

For a one-category route:

- open the existing category experience.

For a valid multi-category semantic intersection:

- use the existing CookSearch/filter model if it can naturally express the intersection;
- otherwise open the closest existing CookSearch result context with those resolved filters.

Do not create a second category engine.

### 33.2 Invalid combination

If the semantic intersection no longer exists or is invalid:

- safe not-found/fallback;
- no arbitrary first-category substitution without user-visible semantics.

---

## 34. Handle behavior

Handle is not a new native social profile.

### 34.1 Handle in an object URL

The handle remains identity context for a concrete object URL. It never routes to a Web or native profile.

### 34.2 Another user's handle

Do not open **your own** Settings as though it represented another user.

If the current app already has a legitimate native public-user/handle discovery surface, use it.

Otherwise, use the concrete canonical Web object URL. A bare handle root is unavailable.

This preserves the product decision of not inventing a native social profile.

### 34.3 Public object links under another handle

A direct recipe/menu/etc. URL under another handle still opens that object's normal native surface after resolution.

The handle segment is identity context, not a reason to route to Web.

---

## 35. Owner behavior

The owner does not enter a special "public preview owner mode."

After identity resolution:

```text
owner
→ existing native object/domain surface
```

Current owner-only actions remain available according to the existing app.

Private owner object links may resolve for that owner after authentication even though the same URL is not publicly resolvable for others.

Do not change publication state merely because the owner opened the link.

---

## 36. Other-user behavior

For a public user-owned object:

```text
other user
→ normal existing preview
→ current explicit copy/use/apply semantics if available
```

Do not:

- impersonate ownership;
- expose edit/delete;
- auto-copy on open;
- add a social-follow model;
- invent provenance UI solely for CookShare.

Premium access still follows current entitlement/lineage.

---

## 37. Unsupported-old-app fallback

Links outlive app releases.

### 37.1 Unknown object family

If the installed app version cannot understand a newer route family:

```text
→ canonical Web URL
```

### 37.2 Unknown action

If it can view the object but cannot implement `cook`:

```text
→ native view/preview
```

### 37.3 Do not approximate

Never map:

```text
unknown action
→ "closest" mutating action
```

### 37.4 Versioned pending schema

When local pending schema version is newer than code can parse:

- do not crash;
- fall back to canonical URL if recoverable;
- otherwise clear safely.

### 37.5 Web fallback launcher

Use the canonical HTTPS URL.

Do not send the user to Home as the generic fallback.

---

## 38. Invalid, deleted and unpublished object behavior

### 38.1 Invalid route

Malformed canonical candidate:

- no privileged navigation;
- optional non-sensitive diagnostic event;
- remain in current app state or Web fallback only if safe canonical URL exists.

### 38.2 Deleted

Resolved deletion:

```text
→ native not-found state or canonical Web 404
→ clear terminal pending intent
```

### 38.3 Unpublished/private non-owner

Treat as not found.

Do not reveal:

- title;
- owner;
- "this is private";
- existence.

### 38.4 Owner private

May resolve after current owner is verified.

### 38.5 Object becomes unavailable while waiting

After login/paywall, resolve again.

Do not execute stale content because it was valid before interruption.

---

## 39. Native Back behavior

Deep-link entry must feel like normal Android navigation.

### 39.1 Cold external launch

Do not synthesize a fake stack such as:

```text
Home → Gallery → category → recipe
```

when the user entered directly at Recipe.

Open the resolved destination as the meaningful root of the external-entry flow.

Back should naturally leave/return to the caller according to Android task behavior when there is no meaningful prior CookPilot screen.

### 39.2 Warm app

If CookPilot was already open:

- preserve the prior in-app stack when possible;
- push/replace the resolved destination without duplicating the same route repeatedly;
- Back returns to previous in-app context.

### 39.3 Auth/paywall transient screens

After successful login/purchase continuation, remove or replace transient gates so Back does not immediately reopen them.

### 39.4 Cancellation

Cancellation uses normal Back semantics and leaves protected action unexecuted.

### 39.5 No Home reset

Avoid `context.go(Home)` as a generic deep-link cleanup strategy.

---

## 40. Share sheet integration

Outbound sharing from the app uses the canonical URL resolved from CookShare identity.

Reuse `share_plus`, already present in the app.

### 40.1 Flow

```text
user taps Share
→ ensure durability/publication if required
→ ask canonical URL resolver
→ receive canonical URL
→ localized short share text
→ native share sheet
```

### 40.2 Do not construct slug locally

Do not derive:

```text
title → slug → guessed URL
```

inside the UI.

The canonical public identity resolver owns the URL.

### 40.3 No provider wrapper

Generic Share emits the canonical URL, not Huawei/Play transport.

### 40.4 Existing inbound sharing

Do not alter `receive_sharing_intent` semantics used by CookImport.

Inbound social content and outbound CookShare are separate flows.

---

## 41. WhatsApp share

WhatsApp does not get a dedicated backend.

Primary behavior:

- native share sheet exposes WhatsApp when installed.

If product UI includes an explicit WhatsApp shortcut:

- send the same localized short text + canonical URL;
- use normal platform URL/app launching;
- fall back to native share if WhatsApp is unavailable.

Do not:

- generate special WhatsApp object IDs;
- create WhatsApp-only links;
- create server-side message generation;
- add secret/campaign data to the URL.

---

## 42. Copy Link

Copy Link copies the canonical URL.

Flow:

```text
publication/durability resolved
→ canonical URL
→ clipboard
→ lightweight existing confirmation/toast
```

Do not copy:

- a Play URL;
- Huawei wrapper;
- internal GoRouter path;
- UUID.

---

## 43. Recipe QR

QR exists only for:

- canonical recipe URL;
- app-download marketing QR where already required outside object sharing.

### 43.1 Recipe payload

Exactly the canonical public recipe URL.

No:

- token;
- action payload;
- user session;
- provider wrapper.

### 43.2 Generation

Generate client-side/on-device.

Use an existing suitable QR dependency.

### 43.3 Scan result

A scanned recipe URL goes through the same Web/App Link behavior as any other canonical URL.

---

## 44. Publication from Share

Foundation publication semantics apply.

### 44.1 Durable private object

Share:

```text
private durable object
→ existing CookShare publication mutation
→ public
→ canonical URL
→ share
```

### 44.2 Current non-durable menu/day/week

Share:

```text
current object
→ existing CookPlan durability/save/materialization semantics
→ enforce existing tier gate
→ durable object
→ publish
→ canonical URL
→ share
```

Share cannot bypass Pro-only durability.

### 44.3 Failure

If materialization/publication fails:

- do not emit a broken URL;
- do not pretend sharing succeeded.

### 44.4 Copy Link / QR

Any action that produces a public link to a private object follows the same publication meaning.

---

## 45. Existing domain flow handoff

This is the architectural end of CookShare responsibility.

CookShare owns:

```text
external identity
→ parse
→ pending continuation
→ resolve current actor/object/access
→ prepare existing native domain input
→ handoff
```

Then it stops.

### 45.1 Do not reimplement domain logic

Examples:

Recipe:
- use existing preview loading/coordinator.

Menu:
- use existing menu preview.

Cook:
- use existing CookMode entry.

Category:
- use existing CookSearch category route.

Billing:
- use existing CookBilling coordinator.

Auth:
- use existing Auth flow.

### 45.2 Shared launch helpers

If existing launch logic is trapped inside a UI widget/coordinator, factor the minimal reusable helper.

Preferred:

```text
existing in-app action ─┐
                       ├→ shared domain launcher
CookShare link ─────────┘
```

Not:

```text
existing in-app action → old path
CookShare link → copy-pasted second path
```

### 45.3 External route never seeds privileged domain payload

The link supplies identity/intent only.

The domain layer supplies the current object data.

---

## 46. Entitlement synchronization

CookShare uses the same effective Pro state as the rest of the app.

### 46.1 No direct RevenueCat grant

The native link coordinator does not ask a URL whether the user is Pro.

It consumes existing billing providers/coordinator.

### 46.2 Same native identity

The app keeps its existing canonical CookPilot identity for Auth and RevenueCat mobile. A Web URL contains no purchaser or entitlement identity.

### 46.3 Refresh points

Re-check effective entitlement:

- before protected `cook`;
- after native purchase;
- after auth completes;
- after app resumes with a pending intent when relevant;
- after process restart with a pending protected intent.

### 46.4 Avoid duplicate purchase

If effective Pro is already active, skip purchase initiation.

### 46.5 Provider independence

Whether entitlement came from:

- Google Play;
- Huawei billing;
- any supported native provider;

does not alter CookShare object semantics.


---

## 48. DEV / PROD configuration

There is no separate CookPilot Web DEV product.

Native CookPilot may retain its existing DEV/PROD environment conventions.

CookShare integration must not invent a Web DEV just to test App Links.

### 48.1 Production domain

Production verified domain:

```text
cookpilot.pro
```

### 48.2 Production asset links

Production `assetlinks.json` includes only certificates that legitimately sign distributed production CookPilot variants.

No debug cert.

### 48.3 Local App Link testing

Use:

- `adb` dispatch tests;
- Android App Links developer verification;
- current release/internal-track builds where certificate verification matters.

If a non-production domain already exists under current infrastructure, it may be used according to existing environment rules.

Do not create one solely because CookShare "should have DEV."

### 48.4 Flavor separation

Google flavor:

- canonical HTTPS App Links;
- Play Install Referrer;
- no Huawei App Linking runtime.

Huawei flavor:

- canonical HTTPS App Links;
- AGConnect App Linking;
- no Play Install Referrer dependency.

### 48.5 Same package

Both currently use:

```text
com.cookpilot.pe
```

Do not invent flavor package suffixes for CookShare.

### 48.6 Provider wrappers

Huawei prefix may differ according to provider environment.

It never changes canonical identity.

### 48.7 Firebase Dynamic Links

Do not add Firebase Dynamic Links.

Firebase Dynamic Links was shut down in 2025 and is not part of this architecture.

---

## 49. Testing matrix

Testing is not complete when "a recipe opens once."

Run the following matrix.

### 49.1 Parser unit tests

For every supported locale/type:

- valid canonical URL;
- valid `view`;
- valid `cook` where supported;
- unknown action;
- repeated action;
- extra benign query;
- wrong host;
- subdomain;
- HTTP;
- explicit non-default port;
- user-info URL;
- unsupported locale;
- mixed locale vocabulary;
- missing slug;
- invalid handle;
- too many category dimensions;
- encoded slash;
- encoded backslash;
- dot segments;
- double encoding;
- invalid percent encoding;
- extremely long slug/query.

Expected result must be typed/deterministic.

### 49.2 Resolver tests

- current canonical slug;
- historical slug alias;
- historical handle route;
- deleted object;
- public object;
- private non-owner;
- private owner;
- premium recipe Free;
- premium recipe Pro;
- premium-derived user copy;
- root premium state changes.

### 49.3 Direct App Links — Google build

Test release-like Play-signed installation:

- cold app;
- warm app;
- background app;
- recipe `view`;
- recipe `cook`;
- menu `view`;
- menu `cook`;
- day;
- week;
- list;
- ingredient;
- category;
- handle;
- Spanish;
- English.

### 49.4 Direct App Links — Huawei build

Repeat supported route matrix on actual Huawei/AppGallery distribution target.

Verify canonical `cookpilot.pro` behavior, not only provider wrapper behavior.

### 49.5 Marketing route isolation

With app installed, verify these remain Web:

- `/es`;
- `/en`;
- `/es/gallery`;
- `/en/gallery`;
- `/es/pro`;
- `/en/pro`;
- auth callback routes;
- privacy/terms;
- sitemap/robots;
- `/.well-known/*`.

### 49.6 Auth states

Test incoming public object for:

- no Supabase session;
- temporary/anonymous app session;
- permanent authenticated Free;
- permanent authenticated Pro;
- authenticated onboarding-incomplete.

Then test an action requiring permanent identity.

### 49.7 Auth interruption

- receive link;
- enter login;
- kill process;
- reopen;
- complete login;
- original object/action resumes.

Also:

- cancel login;
- no loop;
- object context remains safe.

### 49.8 Onboarding

- account requires onboarding;
- link points to public recipe;
- preview still reachable;
- router does not discard pending object into generic Home/onboarding;
- onboarding status remains incomplete until normal product flow handles it.

### 49.9 Premium

Free + premium recipe `view`:
- allowed preview only.

Free + premium recipe `cook`:
- existing paywall;
- cancel;
- no CookMode;
- no paywall resume loop.

Free + premium recipe `cook` + successful purchase:
- canonical entitlement activates;
- original recipe is re-resolved;
- exact `cook` continues.

Already Pro:
- no duplicate paywall.

Entitlement revoked while pending:
- gate again.

### 49.10 Composite menu

- public menu contains Free + premium recipes;
- Free `view`;
- no protected descendant leakage;
- Free `cook`;
- proper gate;
- Pro `cook` whole menu.

### 49.11 Google Play deferred E2E

App absent:

```text
public Web object
→ explicit Play install action
→ Play listing with referrer
→ install
→ first open
→ exact object
```

Cases:

- `view`;
- `cook`;
- no referrer;
- malformed referrer;
- forged external URL in referrer;
- service unavailable then retry;
- feature unsupported;
- provider timestamp older than 7 days;
- reinstall;
- referrer already processed;
- app killed during first resolution.

### 49.12 Huawei deferred E2E

App absent:

```text
public Web object
→ AppGallery transport
→ install
→ first open
→ AGConnect recovery
→ exact canonical object/action
```

Cases:

- valid canonical deep link;
- malformed encoded deep link;
- external untrusted host;
- no recovered link;
- first launch then restart;
- clipboard/referrer provider behavior;
- provider wrapper while app already installed;
- 7-day expiry.

### 49.13 Last-link-wins races

- persisted old recipe A;
- deferred store recipe B;
- direct link recipe C arrives while provider lookup is pending.

Expected:

```text
C wins
```

Also test rapid direct A→B taps.

### 49.14 Pending lifecycle

- persist;
- process death;
- restart;
- auth interruption;
- paywall interruption;
- expiry;
- terminal deletion;
- success consumption;
- stale callback cannot restore consumed pending.

### 49.15 Object changes during interruption

Receive link, then before resume:

- object deleted;
- object unpublished;
- owner changed if domain allows;
- slug renamed;
- premium state changed.

Always re-resolve current truth.

### 49.16 Owner/non-owner

For each user-owned type:

- owner public;
- owner private;
- other user public;
- other user private.

### 49.17 Back stack

Cold link:
- open destination;
- Back behaves like external task entry.

Warm link:
- previous native state preserved;
- Back returns to previous context.

Auth/paywall success:
- Back does not reopen gate.

### 49.18 Share

- private durable recipe → publish → share;
- public recipe → share;
- non-durable menu/day/week → existing save gate → publish → share;
- materialization denied → no link emitted;
- canonical URL correct after slug rename;
- no UUID;
- no provider wrapper.

### 49.19 Copy/WhatsApp/QR

- Copy Link exact canonical;
- explicit WhatsApp uses same canonical;
- native share includes same canonical;
- recipe QR decodes to same canonical;
- QR scan follows normal app-link flow.

### 49.20 Regression

At minimum:

- Google sign-in;
- email auth callback if supported;
- CookImport inbound `SEND`;
- existing media share/import flow;
- AppGallery IAP;
- Google Play Billing;
- current CookMode entry from normal in-app UI;
- current store update checker;
- existing MainActivity MethodChannels/EventChannels.

CookShare must not break unrelated intent handling.

---

## 50. Release verification

Release verification uses actual production-like distributed builds, not only emulator debug builds.

### 50.1 Web association

Verify:

```text
https://cookpilot.pro/.well-known/assetlinks.json
```

Requirements:

- `200`;
- `application/json`;
- no redirect;
- production package;
- correct current production fingerprints;
- valid dynamic rules.

### 50.2 Android package verification

On a test device with the release/distributed build:

```bash
adb shell pm verify-app-links --re-verify com.cookpilot.pe
adb shell pm get-app-links com.cookpilot.pe
```

Expected supported host is verified.

### 50.3 Dispatch/parser test

Example with a real existing slug:

```bash
adb shell am start \
  -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "https://cookpilot.pro/es/recetas/<real-slug>" \
  com.cookpilot.pe
```

This verifies app dispatch/parser.

Also test by opening/clicking the URL **without forcing the package** to verify real App Link resolution behavior.

### 50.4 Play Console

Use the current Google Play Console Deep Links/App Links tooling to verify:

- host;
- App Signing fingerprint;
- intended route families;
- no unintended marketing-route capture.

The implementation agent should do this directly in the portal.

### 50.5 Android 15

On Android 15+ with Google services:

- confirm static association;
- confirm dynamic rule behavior;
- test included paths;
- test excluded/non-CookShare paths.

Do not assume dynamic configuration propagates instantly.

### 50.6 Google deferred

Use an Internal/Closed/appropriate Play distribution signed through Play App Signing.

Uninstall app before the E2E.

Tap the actual Web/store path, install, then first-open.

### 50.7 Huawei AppGallery Connect

Using browser/provider access:

- verify App Linking service configuration;
- verify URL prefix;
- verify trusted `cookpilot.pro` URL formats;
- verify production app/signature;
- use App Linking debug tools as appropriate.

### 50.8 Huawei deferred

Uninstall the Huawei build.

Start from real CookShare Web/AppGallery transport, install through AppGallery test/release distribution, first-open, confirm exact object/action.

### 50.9 Security-specific release checks

Do not reproduce Foundation §32 here; execute the App-Link subset:

- wrong host never becomes CookShare;
- malformed URL never navigates privileged action;
- private object never resolves for non-owner;
- `cook` never bypasses entitlement;
- pending contains no secrets;
- old/forged referrer is not trusted;
- Huawei wrapper's `deeplink` is revalidated;
- auth callback still works;
- no raw hostile URL logged.

### 50.10 External configuration during release

If a provider dashboard still needs a safe technical setting, the implementation agent should configure it directly.

Do not turn release into a checklist of values the human must manually copy between portals.

---

## 51. Integration acceptance criteria

CookShare App Links & Integration is complete only when all criteria below are true.

### Canonical link

- [ ] Canonical object identity remains `https://cookpilot.pro/...`.
- [ ] Generic Share/Copy/QR never emits a provider wrapper.
- [ ] Only supported CookShare object families are claimed by Android.
- [ ] Marketing/auth/system routes remain Web routes.

### Parser

- [ ] One parser handles direct, Play deferred and Huawei deferred candidates.
- [ ] Host/scheme/locale/type/segments are validated.
- [ ] Action vocabulary is only `view`/`cook`.
- [ ] Malformed/unknown action fails safe.
- [ ] Encoding/path-confusion tests pass.
- [ ] No URL parameter grants identity/entitlement/ownership.

### App Links

- [ ] `MainActivity` receives verified CookShare App Links.
- [ ] Existing custom Supabase auth callback remains functional.
- [ ] Flutter deep-link delivery has one deliberate owner; duplicate raw navigation is eliminated.
- [ ] App Links do not route raw external paths directly through GoRouter before validation.
- [ ] `assetlinks.json` is 200 JSON over HTTPS with no redirects.
- [ ] Production Play App Signing cert is authorized.
- [ ] Production Huawei cert is authorized if distinct.
- [ ] Debug cert is absent from production association.
- [ ] Android's actual package verification reports the host verified.

### Android 15

- [ ] Dynamic rules exist once and are valid.
- [ ] Dynamic rules remain within static scope.
- [ ] Android 14 and lower still support intended stable paths without capturing the entire site.
- [ ] Non-CookShare paths are not unexpectedly opened by the app.

### Google Play deferred

- [ ] Install Referrer is Google-flavor-only.
- [ ] Referrer payload is versioned and contains canonical CookShare intent only.
- [ ] Retrieval is asynchronous, bounded and closed correctly.
- [ ] Retrieval is processed once per install.
- [ ] Valid deferred link resumes exact object/action after install.
- [ ] Invalid/no referrer falls back to normal startup.
- [ ] Referrer is never authority.

### Huawei deferred

- [ ] App Linking SDK is Huawei-flavor-only.
- [ ] AGConnect receives provider deep links on cold/new intent.
- [ ] Recovered deep link is revalidated by the canonical Dart parser.
- [ ] AppGallery Connect URL prefix/trusted formats/signature are correctly configured.
- [ ] Current deferred-link SDK requirements, including clipboard metadata when required, are satisfied only in Huawei variant.
- [ ] No arbitrary clipboard data is read/logged by CookPilot code.
- [ ] Real AppGallery absent→install→first-open test passes.

### Pending state

- [ ] Pending intent survives process death.
- [ ] Payload contains no sensitive token/secret.
- [ ] 7-day expiry is enforced.
- [ ] Last explicit link wins.
- [ ] Late provider callback cannot overwrite a newer direct link.
- [ ] Auth/paywall interruptions preserve the exact intent.
- [ ] Success consumes pending state.
- [ ] Terminal invalid/deleted/unpublished state cannot loop.

### Auth/onboarding

- [ ] Public linked object can reach allowed preview without onboarding destroying intent.
- [ ] Actions requiring permanent identity use existing auth.
- [ ] Login completion re-resolves current object.
- [ ] Existing router redirects do not dump valid pending intent into generic Home.
- [ ] Supabase custom-scheme callback regression tests pass.

### Billing

- [ ] Free premium `view` remains allowed preview only.
- [ ] Free premium `cook` gates before CookMode.
- [ ] Existing CookBilling paywall is reused.
- [ ] Purchase UI callback alone never grants continuation.
- [ ] Effective canonical entitlement is rechecked.
- [ ] Web never grants Pro; native entitlement is re-read after handoff.
- [ ] Cancel does not produce a paywall loop.
- [ ] Already-Pro user is not asked to subscribe again.

### Native destinations

- [ ] Recipe view reuses current preview machinery.
- [ ] Recipe cook reuses current CookMode handoff.
- [ ] Menu cook executes whole-menu semantics.
- [ ] Day/week opening does not auto-apply.
- [ ] CookList opening does not auto-merge state.
- [ ] Ingredient uses existing detail domain.
- [ ] Category uses existing CookSearch domain.
- [ ] Own handle routes to existing Settings/profile context.
- [ ] Another-user handle does not impersonate Settings; Web fallback is used if no native public-user surface exists.
- [ ] Owner gets normal domain surface, not a CookShare-specific owner mode.

### Navigation

- [ ] Cold external link has sane Back behavior.
- [ ] Warm external link preserves previous app context.
- [ ] Transient auth/paywall screens do not remain as broken back-stack traps.
- [ ] Generic Home reset is not used as the normal handoff/fallback.

### Sharing

- [ ] Share on private object publishes through Foundation semantics.
- [ ] Non-durable share uses existing save/materialization gates.
- [ ] Canonical URL comes from resolver, not local slug guessing.
- [ ] `share_plus` is reused.
- [ ] WhatsApp needs no backend.
- [ ] Recipe QR is providerless and contains canonical URL only.

### Architecture

- [ ] No new backend exists solely for deep links.
- [ ] Google/Huawei transports converge on one Dart semantic model.
- [ ] Store SDKs do not leak across flavors.
- [ ] Existing domain flows own final behavior.
- [ ] No Firebase Dynamic Links dependency exists.
- [ ] No iOS work was introduced.
- [ ] Unforeseen major domain gaps were surfaced rather than silently architected around.

---

## 52. Explicit non-goals

Do not implement in this document's scope:

- iOS Universal Links;
- iOS App Store deferred linking;
- Firebase Dynamic Links;
- custom-scheme CookShare links;
- generic arbitrary deep-link actions;
- Web feature parity;
- `/app`;
- CookImport Web;
- CookPlan Web;
- CookMode Web;
- CookList generation Web;
- AI Web;
- personalized Web feed;
- native social profiles;
- followers;
- public likes architecture;
- public reporting system;
- blocked-user/suspension system;
- new push-notification routing;
- QR backend/provider;
- menu/day/week QR;
- action-specific QR;
- WhatsApp backend;
- URL shortener service;
- CookShare snapshot service;
- server-side pending-intent storage;
- user-account binding of pre-auth pending intent on the server;
- entitlement encoded into a link;
- auth token encoded into a link;
- provider wrapper as canonical identity;
- debug signing certificate in production `assetlinks.json`;
- broad `cookpilot.pro` marketing-route capture merely to make Dynamic App Links easier;
- app-opening logic based on title text;
- route fallbacks that mutate user data;
- new native screens when an existing domain surface already solves the destination.

If implementation discovers that a required destination genuinely needs a considerable new domain/schema/subsystem not anticipated by the three CookShare plans, stop that subpart, document the concrete gap and ask before inventing it.

---

# Annex A — External route grammar and normalized intent

This annex makes parsing deterministic.

## A.1 Grammar

```text
cookshare-url =
  "https://cookpilot.pro"
  locale-path
  [ "?" query ]

locale-path =
    "/es" es-object
  | "/en" en-object

es-object =
    "/recetas/" slug
  | "/ingredientes/" slug
  | "/categorias/" category-segments
  | "/@" handle
  | "/@" handle "/recetas/" slug
  | "/@" handle "/menus/" slug
  | "/@" handle "/dias/" slug
  | "/@" handle "/semanas/" slug
  | "/@" handle "/listas/" slug

en-object =
    "/recipes/" slug
  | "/ingredients/" slug
  | "/categories/" category-segments
  | "/@" handle
  | "/@" handle "/recipes/" slug
  | "/@" handle "/menus/" slug
  | "/@" handle "/days/" slug
  | "/@" handle "/weeks/" slug
  | "/@" handle "/lists/" slug

category-segments =
  slug
  [ "/" slug ]
  [ "/" slug ]
```

## A.2 Action query

```text
action = "view" | "cook"
```

Action omitted → `view`.

Other query values are not part of semantic identity.

## A.3 Normalized intent example

External:

```text
https://cookpilot.pro/es/@paz/recetas/lomo-casa?action=cook
```

Normalized:

```text
locale      = es
objectType  = recipe
ownerHandle = paz
slug        = lomo-casa
action      = cook
```

No access claim is present.

## A.4 Normalized category example

```text
https://cookpilot.pro/es/categorias/alta-proteina/economicas
```

Normalized:

```text
locale = es
objectType = category
segments = [alta-proteina, economicas]
action = view
```

The domain resolver then applies canonical ordering/alias semantics from Foundation/Web.

---

# Annex B — Native ingress and source-set architecture

## B.1 One Dart coordinator

Recommended logical modules:

```text
lib/features/cookshare/
├── domain/
│   ├── cookshare_external_intent.dart
│   ├── cookshare_pending_intent.dart
│   ├── cookshare_link_parser.dart
│   └── cookshare_link_resolution.dart
├── data/
│   ├── cookshare_pending_intent_store.dart
│   ├── cookshare_store_link_bridge.dart
│   └── cookshare_public_object_gateway.dart
├── providers/
│   └── cookshare_link_providers.dart
└── presentation/
    └── cookshare_link_coordinator.dart
```

Names may adapt to repository conventions. The architectural split matters more than exact filenames.

## B.2 Direct ingress

Dart:

```text
app_links
→ initial link
→ link stream
→ CookShare parser
```

Add `app_links` as a direct dependency if used directly.

## B.3 Native store bridge

Use a dedicated platform channel namespace, for example:

```text
com.cookpilot.pe/cookshare_links
```

and, if needed for provider runtime events:

```text
com.cookpilot.pe/cookshare_links/events
```

Methods/events should carry only transport data, for example:

```text
getInitialDeferredLink()
storeLinkEvent
```

Return shape may contain:

```text
source
urlCandidate
providerClickTimestamp
receivedTimestamp
```

No entitlement/user authority.

## B.4 Google source set

Recommended:

```text
android/app/src/googlePlay/kotlin/.../CookShareStoreLinkBridge.kt
```

Responsibilities:

- Play Install Referrer only;
- no Huawei references.

Dependency only on `googlePlayImplementation`.

## B.5 Huawei source set

Recommended:

```text
android/app/src/huawei/kotlin/.../CookShareStoreLinkBridge.kt
```

Responsibilities:

- AGConnect App Linking receive/deferred;
- provider new-intent handling;
- no Play Install Referrer.

Dependency only on `huaweiImplementation`.

## B.6 Common MainActivity integration

`MainActivity`:

- registers the bridge;
- forwards lifecycle/new intent as required;
- does not parse CookShare business routes in Kotlin;
- leaves canonical interpretation to Dart.

This fits the app's existing MethodChannel/EventChannel integration style.

## B.7 Avoid reflection

Do not load store-specific SDKs through reflection to avoid source-set work.

Build variants already exist; use them.

---

# Annex C — Pending state transition rules

| Current state | Event | Next state | Side effect |
|---|---|---|---|
| none | valid direct link | pending | persist; direct wins |
| none | valid deferred | pending | persist |
| pending A | newer direct B | pending B | replace A |
| pending A | stale async provider completion B | pending A | ignore B if B predates current generation |
| pending | object resolving | resolving | no mutation |
| resolving | public/access OK + view | ready | prepare native destination |
| resolving | action needs auth | needsAuth | invoke existing auth |
| needsAuth | auth success | resolving | refresh actor/object |
| needsAuth | auth cancelled | pending/view context | no auto-loop |
| resolving | action needs Pro | needsEntitlement | show allowed context + existing paywall on explicit intent |
| needsEntitlement | entitlement active | resolving | re-read object/access |
| needsEntitlement | paywall cancelled | pending blocked-until-retry | no auto-paywall loop |
| ready | domain launcher accepts handoff | handedOff | navigate |
| handedOff | domain flow owns action | consumed | clear persistence |
| any pending | >7 days | expired | clear |
| resolving | deleted | notFound | terminal clear |
| resolving | private non-owner | notFound | terminal clear |
| parsing | malformed | invalid | terminal/no privileged navigation |
| resolving | unsupported app version | Web fallback | clear after successful fallback |

### C.1 Auto-resume rule

Only resume automatically after an interruption the user explicitly entered for this intent:

- successful login;
- successful entitlement activation;
- app restart with valid pending intent.

Do not repeatedly trigger disruptive UI after explicit cancellation.

### C.2 Idempotency

Calling "resume pending intent" multiple times must not:

- duplicate navigation;
- start CookMode twice;
- open two paywalls;
- republish an object;
- execute stale intent after consumption.

Use coordinator-level execution identity/generation guards.

---

# Annex D — E2E scenario matrix

| Scenario | Expected result |
|---|---|
| Anonymous taps Free official recipe with Google build installed | Verified App Link → allowed native recipe preview |
| Anonymous taps premium official recipe | Verified App Link → Free preview only |
| Free taps premium recipe `?action=cook` | Preview/context → existing paywall → no cooking before Pro |
| Free buys Pro from native paywall | Effective entitlement refresh → same recipe → existing CookMode entry |
| User already has native Pro | Existing Auth/billing state → no duplicate subscription → exact action |
| Pro taps menu `cook` | Whole resolved menu → existing CookMode path |
| User taps public day | Read existing day object; do not auto-apply |
| User taps public week | Read existing week object; do not auto-apply |
| User taps another person's CookList | Public list context; no owner's checked state; no automatic merge |
| User taps ingredient | Existing ingredient detail |
| User taps category intersection | Existing CookSearch/filter domain with resolved categories |
| User taps own handle | Settings/profile context |
| User taps another user's bare handle with no native social surface | Canonical Web handle |
| Owner taps own private recipe link | Authenticated owner resolution → normal native object surface |
| Non-owner taps same private route | Not found/no existence leakage |
| Recipe renamed after share | Alias resolves → current recipe → pending canonical updates |
| Handle renamed after share | Historical full route resolves safely to original object |
| Object deleted while user is logging in | Re-resolution returns terminal not-found |
| Object unpublished during native interruption | Re-resolution denies; no stale access |
| App absent on Google | Web → Play CTA with referrer → install → first open exact object |
| Google referrer forged to evil.example | Parser rejects host; normal startup |
| Play Store temporarily unavailable | Bounded retry; app still usable |
| App absent on Huawei | Web/AppGallery transport → install → AGConnect recover → same canonical parser |
| Huawei wrapper contains external `deeplink` | Reject; provider isn't authority |
| Deferred link older than 7 days | Clear; normal startup |
| App killed during auth | Pending survives → auth completion/restart resumes |
| App killed during purchase | Pending survives → entitlement rechecked; no assumed purchase |
| User cancels paywall | Stay on preview; no automatic reopen loop |
| Old app understands recipe but not `cook` | Open recipe preview |
| Old app does not understand object type | Canonical Web fallback |
| Old deferred A exists; user taps direct B | B replaces A |
| Provider callback for A arrives after B | A ignored |
| App warm on CookList, user taps recipe link | Recipe pushes meaningful destination; Back returns to CookList |
| App cold from external recipe | No fabricated Home/Gallery stack; Back exits/returns naturally |
| Share private recipe | Publish → canonical URL → native share |
| Share current unsaved week | Existing materialization/tier gate → publish → canonical share |
| Materialization denied | No public URL emitted |
| Copy Link recipe | Exact canonical URL |
| Recipe QR scanned with app installed | Same verified App Link flow |
| Recipe QR scanned without app | Public Web recipe |
| Marketing `/es/pro` clicked with app installed | Remains Web |
| `/.well-known/assetlinks.json` opened | Served as JSON; never handled by app |
| Supabase custom auth callback | Existing native auth works; CookShare parser ignores it |
| Android 15 dynamic exclusion | Excluded route remains Web |
| Android 14 stable recipe path | Static pathPrefix opens app |
| Android 14 marketing path | Not claimed by app |

---

# Annex E — Release checklist

## E.1 Code

- [ ] `app_links` direct dependency if directly imported.
- [ ] Flutter default deep-link handler disabled when plugin owns ingress.
- [ ] Supabase auth callback preserved.
- [ ] canonical parser implemented/tested.
- [ ] pending store implemented/tested.
- [ ] coordinator idempotency/last-link-wins implemented.
- [ ] Google source-set bridge implemented.
- [ ] Huawei source-set bridge implemented.
- [ ] store SDK dependencies isolated by flavor.
- [ ] native launch helpers reuse existing domain flows.
- [ ] share path uses canonical resolver.
- [ ] no Firebase Dynamic Links.

## E.2 Web association

- [ ] `assetlinks.json` deployed.
- [ ] no redirect.
- [ ] correct content type.
- [ ] Play production fingerprint.
- [ ] Huawei production fingerprint when distinct.
- [ ] no debug fingerprint.
- [ ] dynamic rules valid and unique.

## E.3 Google

- [ ] Play Console App Links verification green.
- [ ] internal/closed Play build used for Play App Signing test.
- [ ] direct App Link verified.
- [ ] Install Referrer valid E2E.
- [ ] invalid referrer fail-safe.
- [ ] first-run marker/idempotency verified.

## E.4 Huawei

- [ ] App Linking enabled.
- [ ] URL prefix exists.
- [ ] trusted URLs correct.
- [ ] production signature correct.
- [ ] SDK configuration current.
- [ ] deferred clipboard/provider requirement correctly configured.
- [ ] direct canonical link tested.
- [ ] AppGallery absent→install→first-open test passes.

## E.5 Product continuity

- [ ] auth regression green.
- [ ] onboarding link continuation green.
- [ ] native billing regression green.
- [ ] Web handoff never changes native entitlement; native billing state remains authoritative.
- [ ] premium `cook` continuation green.
- [ ] owner/non-owner matrix green.
- [ ] Back behavior green.
- [ ] sharing/publication green.

---

# Annex F — Stop conditions and current platform references

## F.1 Stop conditions

Stop the affected subpart and surface the concrete gap if:

1. a supported public object has no existing/native domain representation and solving it would require a significant new feature;
2. GoRouter/Auth would need a broad rewrite rather than a narrow CookShare continuation hook;
3. current CookBilling cannot expose effective entitlement without creating a second authority path;
4. a provider demands a canonical link identity outside `cookpilot.pro`;
5. Huawei deferred behavior under the current SDK cannot satisfy the requirement without a new privacy/product decision beyond the provider's documented SDK behavior;
6. Google/Huawei production signing configuration cannot be reconciled with one legitimate `assetlinks.json`;
7. a new backend/service appears necessary only to carry deferred link state;
8. implementation would require exposing protected object data in the URL/referrer;
9. a store-specific dependency cannot be isolated from the opposite flavor without a broader build-system change.

Do **not** stop for ordinary implementation choices such as:

- local class names;
- helper placement;
- exact Riverpod provider naming;
- choosing a maintained equivalent QR package;
- factoring a reusable preview launcher.

Those are implementation work.

## F.2 Current official platform references

Use these during implementation and re-check them if provider SDK behavior has changed.

### Android App Links / Dynamic App Links

Android — Configure website associations and dynamic rules:

https://developer.android.com/training/app-links/configure-assetlinks

Android — Add intent filters for App Links:

https://developer.android.com/training/app-links/add-applinks

Android — App Links FAQ:

https://developer.android.com/training/app-links/faq

Current important constraints:

- `assetlinks.json` is served at `/.well-known/assetlinks.json`;
- HTTPS, no redirect, `application/json`;
- Play App Signing certificate may differ from local upload key;
- Android 15+ can read `dynamic_app_link_components`;
- dynamic rules cannot expand the manifest's static scope;
- Android 14 and lower need compatible static route declarations.

### Flutter App Links

Flutter — Set up app links for Android:

https://docs.flutter.dev/cookbook/navigation/set-up-app-links

Current important constraint:

- when a third-party plugin such as `app_links` handles deep links, disable Flutter's default deep-link handler to avoid conflicting delivery.

### Google Play Install Referrer

Android — Play Install Referrer Library:

https://developer.android.com/google/play/installreferrer/library

Current documented library dependency:

```text
com.android.installreferrer:installreferrer:2.2
```

Google currently documents:

- asynchronous connection;
- `installReferrer`;
- click/install timestamps;
- data available for 90 days unless reinstalled;
- recommended one retrieval on first execution;
- close connection afterward.

### Huawei App Linking

Huawei — Integrating App Linking SDK:

https://developer.huawei.com/consumer/en/doc/appgallery-connect-guides/agc-applinking-android-integrationsdk-0000001371557869

Huawei — Receiving a Cross-Platform Link:

https://developer.huawei.com/consumer/en/doc/appgallery-connect-guides/agc-applinking-receivelinks-android-0000001054796199

Huawei — Requesting URL Prefix:

https://developer.huawei.com/consumer/en/doc/appgallery-connect-guides/agc-applinking-urlprefix-0000001060148052

Huawei — Manually Creating a Cross-Platform Link:

https://developer.huawei.com/consumer/en/doc/appgallery-connect-guides/agc-applinking-createlinks-defined-0000001055514692

Current important constraints:

- App Linking URL prefix is provider transport;
- deep links must be trusted/configured;
- package/signature configuration must match;
- current Android SDK documentation uses AGConnect App Linking and `getAppLinking`;
- current SDK documentation states deferred deep linking becomes unavailable when its clipboard-reading behavior is disabled.

### Explicitly obsolete architecture

Firebase Dynamic Links is not used.

Do not revive it as a convenience layer.

---

# Final implementation boundary

The complete CookShare chain is now:

```text
PUBLIC OBJECT GRAPH
      │
      ├── Web public discovery/rendering  ← document 02
      │
      └── canonical HTTPS identity
                    │
            verified App Link
                    │
        ┌───────────┴───────────┐
        │                       │
 direct installed app      app not installed
        │                       │
        │             ┌─────────┴─────────┐
        │             │                   │
        │          Google Play         AppGallery
        │          referrer            App Linking
        │             │                   │
        └─────────────┴──────────┬────────┘
                                 │
                     CookShare intent coordinator
                                 │
                        parse + pending state
                                 │
                       current object resolve
                                 │
               auth / ownership / entitlement
                                 │
                        existing native flow
                                 │
                    CookShare responsibility ends
```

No parallel CookPilot is created.

No deep-link authority is created.

No provider becomes the object identity.

The canonical CookPilot domain remains the product; CookShare makes that domain portable between discovery, Web, installation and native action.
