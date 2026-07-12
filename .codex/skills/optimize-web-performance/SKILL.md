---
name: optimize-web-performance
description: Optimize real web performance and Core Web Vitals after a frontend build or redesign. Use for page speed, Lighthouse, LCP, INP, CLS, JavaScript cost, loading, rendering, font, animation, and runtime responsiveness work. Do not trigger for ordinary UI styling or bulk asset-format conversion.
---

# Goal

Improve user-perceived speed and responsiveness without degrading the approved design, content, accessibility, routing, or product behavior.

Treat performance as an engineering task, not a score-chasing exercise. Preserve visual quality and motion unless a specific implementation is proven to be wasteful.

# Baseline first

1. Read the repository instructions, build configuration, framework conventions, and relevant route code.
2. Run the production build before changing anything.
3. Measure representative public routes in a real browser using the best available tools:
   - Lighthouse for a broad lab audit.
   - Chrome Performance and live metrics for traces.
   - Existing RUM or field data when available.
4. Record the initial LCP, CLS, and available interaction diagnostics.
5. Distinguish lab data from field data. Never claim a field Core Web Vitals result from Lighthouse alone.

Use these field targets at the 75th percentile:

- LCP: 2.5 seconds or less.
- INP: 200 milliseconds or less.
- CLS: 0.1 or less.

Use TBT and long-task traces only as lab diagnostics for responsiveness; do not present them as INP.

# Prioritize by user impact

Fix the largest proven bottlenecks first. Prefer a small number of high-impact changes over many cosmetic micro-optimizations.

## LCP

- Identify the actual LCP element for each representative route and breakpoint.
- Ensure the LCP resource is discoverable from initial HTML whenever possible.
- Do not lazy-load the LCP asset.
- Prioritize it only when it is genuinely above the fold.
- Avoid making critical content wait for client-side JavaScript.
- Reduce server, render, and resource-discovery delay before tuning compression details.
- Keep hero imagery visually intact unless the task explicitly permits art-direction changes.

## INP and main-thread work

- Find long tasks, expensive event handlers, hydration cost, repeated layout reads, and unnecessary re-renders.
- Break up or defer noncritical work.
- Prefer passive listeners where appropriate.
- Avoid unthrottled scroll and resize handlers.
- Use browser-native or CSS-driven behavior when it is simpler and cheaper.
- Keep interactive feedback immediate even when background work continues.
- Do not add memoization blindly; follow the framework and repository conventions.

## CLS and visual stability

- Reserve stable space for images, mockups, media, embeds, dynamic copy, and async UI.
- Set intrinsic dimensions or aspect ratios.
- Prevent font swaps from producing disruptive movement.
- Avoid inserting content above already-rendered content.
- Animate transforms and opacity instead of layout properties when possible.
- Check both theme and locale variants because translated text can change layout.

# Framework and bundle discipline

- Preserve server rendering and static rendering where the framework supports them.
- Keep client-only boundaries as narrow as practical.
- Load heavy interactive code only on routes or sections that use it.
- Remove duplicate imports, dead code, unused libraries, and accidental client bundles when evidence supports the change.
- Do not replace maintainable framework features with fragile custom code for marginal gains.
- Inspect third-party scripts and embeds; defer or remove only when product requirements allow it.

# Images, fonts, and media

- Serve assets at appropriate rendered dimensions and provide responsive sizing hints.
- Correct eager versus lazy loading and priority mistakes.
- Prevent oversized downloads when the framework can select an appropriate source.
- Do not bulk-convert, rename, or re-encode the project image library to WebP, AVIF, or another format unless the user explicitly asks.
- Do not create a separate asset-migration project.
- Load only critical font resources early.
- Use stable fallbacks and a sensible font-display strategy.
- Avoid preloading resources without evidence that they are critical.

# Motion performance

- Preserve approved cinematic motion.
- Prefer transform, opacity, compositor-friendly effects, and efficient scroll timelines.
- Avoid large continuously repainted regions, excessive blur, and permanent `will-change`.
- Reduce work outside the viewport.
- Respect `prefers-reduced-motion`.
- Test animation smoothness on a constrained mobile viewport, not only a powerful desktop.

# Verification

1. Run the production build after changes.
2. Re-measure the same routes, viewports, and conditions used for the baseline.
3. Inspect traces for regressions, not only headline scores.
4. Verify:
   - first load;
   - route navigation;
   - theme and locale switching;
   - modals, accordions, selectors, and carousels;
   - scroll-driven scenes;
   - mobile and desktop layouts.
5. Keep changes only when they produce a measurable or clearly reasoned improvement.

# Done

Return a concise report containing:

- baseline and final measurements;
- whether results are lab or field;
- the main bottlenecks found;
- the high-impact changes made;
- any tradeoffs;
- remaining issues that require real-user data or infrastructure access;
- build result.

Do not report a perfect score as the objective. Report whether the page became materially faster, more responsive, and more stable.
