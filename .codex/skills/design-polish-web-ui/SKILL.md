---
name: design-polish-web-ui
description: Design or polish a high-quality responsive web interface in the CookPilot repository using the current design system, visual references, browser inspection, and the canonical artistic direction. Use for landing-page redesigns, visual hierarchy, layout, typography, imagery, motion, cards, responsive composition, and final UI polish. Do not trigger for backend-only work or routine copy edits.
---

# Authority

Before visual work, read:

`docs/cookpilot_artistic_direction.md`

Expected local location:

`C:\Users\paz1dv\Desktop\dev\CookPilot Web\docs\cookpilot_artistic_direction.md`

Treat that document as the durable visual authority. Do not duplicate or reinterpret it casually. If it is missing, report that fact and inspect the closest canonical design document before proceeding.

Also inspect the current design-system implementation, components, assets, typography, responsive rules, themes, and existing page in a real browser. Do not assume specific token names or a fixed design-system implementation; follow whichever system is current.

# Goal

Produce a cohesive, intentional interface that looks designed rather than assembled.

Preserve product meaning, routing, data behavior, localization, and approved content unless the task explicitly expands scope. Use surgical copy edits only when they materially improve hierarchy or remove repetition.

# Establish a visual thesis

Before coding, decide internally:

- the dominant visual idea;
- the hierarchy and focal point;
- the narrative rhythm across the page;
- how imagery and product UI will lead;
- how the page changes across desktop, tablet, and mobile;
- which moments deserve motion or visual surprise.

Choose one direction and refine it. Do not build two alternatives.

# Work with the existing system

- Reuse the current design system, primitives, type roles, assets, and component conventions.
- Preserve brand foundations unless the user explicitly authorizes a rebrand.
- Extend semantic roles only when a real reusable need exists.
- Do not hardcode arbitrary one-off sizes, radii, spacing, colors, or easing values.
- Use a rational scale and fluid values where appropriate.
- Do not mutate global foundations to fix a single local composition.
- Keep the visual system coherent across light and dark themes.

# Composition

- Give every section or screen one dominant idea.
- Create distinct silhouettes while maintaining a shared visual grammar.
- Use negative space intentionally; do not leave accidental empty oceans.
- Let important imagery, illustration, or product UI carry the composition.
- Avoid defaulting to centered heading plus three equal cards.
- Avoid unnecessary wrappers and nested surfaces.
- Use cards only when containment, comparison, selection, or interaction requires them.
- Do not use borders as the default method of separation.
- Integrate the end of the page with the footer instead of letting the experience simply stop.

# Typography

- Build a clear hierarchy across display, section heading, content heading, lead, body, labels, and metadata.
- Keep important type visibly strong on a large desktop display.
- Use fluid type where it improves continuity between breakpoints.
- Control line length, line height, wrapping, and alignment.
- Avoid tiny labels and timid body copy.
- Avoid arbitrary tracking changes across sections.
- Use weight and scale to guide scanning before adding decorative UI.
- Keep translated copy visually viable; do not optimize only for one language.

# Imagery and assets

- Inspect actual assets before using them.
- Use primary imagery to reveal the product, food, object, state, or experience; do not hide the important subject behind decorative treatment.
- Keep high-quality imagery large enough to matter.
- Avoid repeating the same mockup treatment in every section.
- Do not place already framed phone mockups inside unnecessary device or card frames.
- Use the CookPilot avatar as a deliberate accent, never as a tiny sticker or gap filler.
- If a composition needs a custom asset that does not exist, use a tasteful replaceable placeholder and list the required final asset in the report. Do not add visible helper text such as “asset pending.”

# Cards and surfaces

- Vary the grammar according to purpose:
  - image-led editorial panels;
  - clean information surfaces;
  - free-standing product compositions;
  - carousels or rails;
  - immersive sections;
  - minimal conversion blocks.
- Give image cards composition, cropping, text hierarchy, and interaction.
- Avoid generic icon-plus-title-plus-paragraph grids unless that structure is genuinely the clearest solution.
- Avoid decorative chips, badges, eyebrows, and glows without a job.
- Ensure hover and focus states improve understanding rather than merely adding movement.

# Motion

- Use motion as part of storytelling and attention control.
- Consider scroll-driven sequences, sticky scenes, product-state changes, parallax, masks, transitions, and responsive microinteractions when they strengthen the experience.
- Keep a coherent spatial model.
- Prefer transform and opacity for smoothness.
- Respect reduced-motion preferences.
- Do not add motion to prove technical ability.
- Do not inspect the browser after every tiny element; complete a meaningful composition, then review and refine it.

# Responsive design

Design for the environment rather than shrinking desktop.

- Desktop may use scale, asymmetry, overlap, and cinematic space.
- Tablet must retain hierarchy without awkward intermediate layouts.
- Mobile must recompose the experience, not simply stack every desktop layer.
- Preserve product prominence and readable typography at every breakpoint.
- Avoid horizontal overflow, clipped content, and excessively tall decorative scenes.
- Test long localized strings and both themes.

# Interaction states

Complete the visual system for:

- default;
- hover;
- focus-visible;
- active or selected;
- expanded;
- disabled when applicable;
- loading and empty states when in scope;
- reduced motion;
- dark and light themes.

Do not leave an interaction visually ambiguous.

# Browser workflow

1. Inspect the current page and asset library.
2. Define the visual thesis.
3. Implement one major composition or coherent group of sections.
4. Open the real page in the browser.
5. Review hierarchy, rhythm, asset scale, text wrapping, interaction, and responsive behavior.
6. Correct the section before moving on.
7. After all major blocks are complete, review the entire journey and refine transitions between them.
8. Verify representative desktop, laptop, tablet, and mobile viewports.
9. Verify both themes and supported locales.
10. Run the production build.

Use screenshots and visual comparison where helpful. The browser pass is mandatory, but avoid compulsive micro-checking.

# Quality bar

The work is complete only when:

- the page has an unmistakable focal hierarchy;
- important content is not tiny;
- sections feel intentionally composed;
- imagery and product UI have sufficient presence;
- the design system is followed rather than bypassed;
- responsive layouts feel authored at each breakpoint;
- motion adds value and remains usable;
- conversion elements are clear and confident;
- the result feels specific to CookPilot, not like a generic template;
- there are no functional regressions;
- the production build succeeds.

# Final report

Return a concise report containing:

- visual thesis;
- major compositions changed;
- design-system roles added or corrected;
- motion and responsive behavior;
- assets used;
- placeholders requiring final custom assets;
- copy changes, if any;
- browser viewports checked;
- build result.

Do not include a diary of small CSS edits.
