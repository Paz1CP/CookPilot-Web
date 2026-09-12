---
name: design-polish-web-ui
description: Design or polish high-quality responsive CookPilot web interfaces using the canonical artistic direction, the current design system, real product behavior, available assets, browser inspection, and production constraints. Use for landing pages, marketing surfaces, product web UI, visual hierarchy, layout, typography, imagery, motion, cards, responsive composition, and final polish. Do not trigger for backend-only work or routine copy edits.
---

# Authority

Before visual work, read:

`docs/cookpilot_artistic_direction.md`

Expected local location:

`C:\Users\paz1dv\Desktop\dev\CookPilot Web\docs\cookpilot_artistic_direction.md`

Treat that document as the durable visual authority.

Also inspect:

- the current design-system implementation;
- reusable primitives and components;
- typography;
- theme behavior;
- responsive conventions;
- localization infrastructure;
- relevant product documentation;
- the real page in a browser;
- the actual asset library.

Do not assume token names, component names, folder structures, breakpoints, or implementation details. Inspect the repository.

Apply the canonical composition, typography, imagery, surface, motion, marketing and anti-slop principles from the artistic direction. This skill defines the execution workflow and non-negotiable implementation guardrails.

---

# Do not re-interview the user about frozen taste

Do not ask the user to restate CookPilot's visual preferences when the canonical artistic direction already answers the question.

When the authority documents cover the decision:

1. make the strongest decision consistent with them;
2. implement it;
3. review it in the browser;
4. refine it.

Ask only when:

- a real product decision is missing;
- two requirements conflict materially;
- required source data is unavailable;
- an irreversible or consequential decision requires approval;
- the user explicitly asks to choose between alternatives.

Do not create unnecessary design-choice loops.

---

# Never freeze temporary page details as canon

Never document the current landing's:

- section order;
- recipe selection;
- active assets;
- current screenshots;
- exact devices;
- temporary copy;
- current animations;
- current card count;
- current layout;

as permanent design rules.

Extract the reusable principle instead.

---

# Goal

Produce a cohesive, intentional interface that looks directed rather than assembled.

Preserve product truth, routing, data behavior, localization, accessibility and approved content unless the task explicitly expands scope.

The existing UI is not a visual constraint.

Preserve behavior and identity, but assume layout, section structure, component composition, spacing, typography scale, card grammar, interaction model and responsive composition may be replaced when a materially better solution exists.

Do not preserve a component merely because it already exists.

Reuse it only if it survives the new visual thesis.

---

# 1. Inspect before designing

Before writing JSX, CSS or equivalent:

1. inspect the page in a real browser;
2. inspect relevant components;
3. inspect the current design system;
4. inspect real assets;
5. inspect product documentation when claims or behavior matter;
6. identify responsive constraints;
7. identify existing localization keys and translation files.

Do not invent assets that already exist.

Do not assume an asset is appropriate because its filename sounds related.

Meaning outranks convenience.

If the available asset does not communicate the intended idea, use or request a better one.

---

# 2. Define the visual thesis internally

Before implementation, decide internally:

- the dominant visual idea;
- the protagonist;
- the narrative role of the page or block;
- the hierarchy;
- the surface strategy;
- the density rhythm;
- the role of food imagery;
- the role of real product UI;
- the role of motion;
- the responsive recomposition.

Choose one direction and refine it.

Do not build multiple complete alternatives unless the user asks.

---

# 3. Design relationships, not component inventories

Do not begin from:

"What components are available?"

Begin from:

"What relationship must the user understand?"

Design around:

- hierarchy;
- transformation;
- comparison;
- continuity;
- selection;
- cause and consequence;
- product proof;
- desire;
- conversion.

Then choose components that support that relationship.

Do not allow existing abstractions to dictate a weaker composition.

---

# 4. Product truth is mandatory

Never invent a feature, entitlement, plan limit, quantity, price, workflow, AI capability or product behavior.

When marketing claims depend on product truth:

1. consult canonical product documentation;
2. use the user-facing benefit;
3. omit internal mechanics unless they materially help;
4. avoid exposing backend vocabulary in marketing copy.

Do not turn grants, credits, resource keys, internal mode names or billing mechanics into hero copy merely because they are documented.

Sell the outcome.

Never fabricate product truth to improve design.

---

# 5. Localization is non-negotiable

Never hardcode user-visible strings directly in the interface.

Always use the repository's current i18n/l10n system and translation files.

If existing code violates this rule within the modified scope, correct it.

When adding or changing copy:

- add translation keys;
- update all required locale files;
- preserve interpolation patterns;
- account for longer translated strings;
- verify wrapping at representative breakpoints.

Do not optimize visual composition for one language only.

---

# 6. Asset strategy

Use this order:

1. inspect existing assets;
2. reuse an asset only if it genuinely communicates the idea;
3. reframe or crop when appropriate;
4. generate or request a new asset if no existing asset fits;
5. use a tasteful replaceable placeholder only when final asset creation is out of scope.

Do not force a nearby asset into the wrong semantic role.

Do not reuse the same recipe, phone, pose, image treatment or icon repeatedly unless continuity is intentional.

The filename is not the design decision.

---

# 7. Product UI strategy

When real CookPilot UI appears:

- use actual product UI when available;
- preserve approved interface structure;
- make it large enough to prove something;
- integrate it compositionally;
- avoid pasted-screenshot feeling;
- do not invent fake UI to fill a layout;
- do not reframe the same mockup identically throughout a page.

UI must have a narrative role.

If it proves nothing, it probably should not be there.

---

# 8. Copy strategy

Prefer:

- human benefits;
- short claims;
- clear hierarchy;
- one idea per marketing surface;
- concrete language.

Avoid:

- pseudo-inspirational slop;
- redundant microcopy;
- internal nomenclature;
- feature dumping;
- chips containing explanations;
- technical counters inside marketing cards;
- long explanations of obvious states.

For a benefit card, usually prefer:

- one claim;
- one emphasized phrase;
- one short support line;
- one meaningful visual object.

Do not fill available space just because it exists.

---

# 9. Motion must have semantics

For every meaningful animation, define:

`object → cause → destination`

Also determine:

- what state changes;
- why the movement exists;
- what the user understands after it;
- whether continuity matters.

Good reasons for motion:

- progression;
- selection;
- transformation;
- continuity;
- consequence;
- recontextualization;
- state change.

Bad reason:

- "it looks cool."

If an animation cannot be explained, remove it or simplify it.

Prefer transform and opacity where possible.

Respect reduced motion.

Do not repeat the same animation mechanic across every block.

---

# 10. Surface pass is mandatory

Before considering a composition complete, inspect the surfaces.

Check for:

- too many consecutive identical backgrounds;
- excessive pure black;
- accidental empty oceans;
- repeated card grammar;
- weak containment;
- background monotony;
- sections that feel unfinished.

When depth is missing, first consider:

- a larger surface;
- a different field of color;
- photography;
- a monumental container;
- typography as mass;
- a stronger layout relationship.

Do not default to adding glows.

Prefer robust surface solutions over fragile collections of absolutely positioned lights.

---

# 11. Narrative pass is mandatory

For pages with multiple blocks, verify the journey as a whole.

Ask:

- Why does this block exist here?
- What does it teach or sell?
- What does the previous block hand into it?
- What does it prepare next?
- Is this a progression or merely a feature list?
- Does the user feel movement from desire to understanding to action?

Do not allow major blocks to behave like unrelated demos.

---

# 12. Repetition pass is mandatory

Review the whole experience for accidental repetition.

Check:

- same recipe;
- same phone;
- same mockup angle;
- same human pose;
- same card layout;
- same glow;
- same carousel;
- same reveal;
- same title composition;
- same background;
- same copy rhythm.

Repetition is acceptable when it communicates continuity.

Repetition caused by convenience weakens the brand.

---

# 13. Responsive design is authored, not stacked

Design for the environment.

Desktop may use:

- scale;
- asymmetry;
- overlap;
- cinematic space;
- strong negative space.

Tablet must retain hierarchy without awkward intermediate states.

Mobile must recompose the experience.

Do not simply stack every desktop layer vertically.

Preserve:

- protagonist;
- readable typography;
- product prominence;
- semantic relationships;
- usable motion;
- clear actions.

Verify no horizontal overflow or accidental clipping.

---

# 14. Interaction states

When applicable, complete:

- default;
- hover;
- focus-visible;
- active;
- selected;
- expanded;
- disabled;
- loading;
- empty;
- reduced-motion;
- dark/light theme states.

Interaction feedback should improve understanding.

Do not add motion purely to decorate hover.

---

# 15. Browser workflow

Use this workflow:

1. inspect the current page and assets;
2. inspect authority documents;
3. define the visual thesis;
4. implement one meaningful composition or coherent group;
5. review it in the browser;
6. correct hierarchy, surface, scale, wrapping and interaction;
7. continue to the next meaningful group;
8. perform a full-page narrative pass;
9. perform a repetition pass;
10. perform a responsive pass;
11. perform a surface pass;
12. verify supported themes and locales;
13. run the production build.

Use screenshots and visual comparison when helpful.

The browser pass is mandatory.

Do not inspect after every tiny CSS change. Review at meaningful milestones.

---

# 16. Engineering guardrails

Follow the current repository architecture.

Do not:

- mutate global foundations to solve a local problem;
- introduce arbitrary design tokens without reusable need;
- create duplicate utilities when a current primitive exists;
- add fragile absolute positioning when layout can solve the problem;
- hardcode strings;
- hardcode temporary page-specific values into shared foundations;
- break routing, data behavior or accessibility for visual effect.

Prefer semantic, reusable abstractions when the pattern is genuinely reusable.

Do not over-abstract a one-off composition prematurely.

---

# 17. Quality bar

The work is complete only when:

- the page has unmistakable hierarchy;
- every major block has one dominant idea;
- important content is not tiny;
- imagery and UI have sufficient presence;
- surfaces create rhythm;
- empty space feels deliberate;
- product claims are true;
- marketing sells benefits rather than implementation details;
- repetition is intentional;
- motion communicates something;
- responsive layouts feel authored;
- localization is complete;
- interaction states are clear;
- the result feels specific to CookPilot;
- there are no functional regressions;
- the production build succeeds.

A technically correct page that feels generic is not complete.

A visually exciting page that misrepresents product behavior is not complete.

---

# 18. Final decision checklist

Before finalizing, ask:

1. What is the protagonist?
2. What is the one dominant idea?
3. Does this look designed or assembled?
4. Does the surface strategy create rhythm?
5. Is the empty space intentional?
6. Is the food or product UI actually helping?
7. Is the copy selling a benefit?
8. Does any decoration exist without a job?
9. Does every animation have cause and destination?
10. Is repetition intentional?
11. Would this survive different content?
12. Would this survive mobile?
13. Are all visible strings localized?
14. Are all product claims canonical?
15. Does this belong to CookPilot?

If several answers are weak, continue refining.

---

# Final report

Return a concise report containing:

- visual thesis;
- major compositions changed;
- design-system roles added or corrected;
- motion behavior;
- responsive behavior;
- assets used;
- new assets required or created;
- product-documentation claims consulted, if relevant;
- copy changes;
- localization changes;
- browser viewports checked;
- theme/locale checks;
- production build result.

Do not include a diary of small CSS edits.
