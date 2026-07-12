---
name: audit-web-accessibility
description: Audit and improve web accessibility to WCAG 2.2 AA for public pages and interactive UI. Use for keyboard navigation, focus, semantics, screen-reader names, contrast, reflow, dialogs, accordions, carousels, motion, theme controls, forms, and accessible responsive behavior. Do not trigger for purely visual styling unless accessibility is part of the request.
---

# Goal

Make the experience perceivable, operable, understandable, and robust while preserving the approved visual direction.

Target WCAG 2.2 Level AA. Prefer native HTML semantics over ARIA. Add ARIA only when native elements cannot express the required behavior.

# Inspect before changing

1. Read repository instructions and identify shared layout, navigation, modal, accordion, carousel, form, locale, theme, and motion components.
2. Test representative routes with:
   - keyboard only;
   - browser accessibility tree;
   - available automated tooling such as axe or Lighthouse;
   - zoom and narrow viewport;
   - reduced-motion preference.
3. Treat automated findings as signals, not proof of conformance.

# Structure and semantics

- Use correct landmarks: header, nav, main, footer, and complementary regions when appropriate.
- Provide a reliable way to skip repeated navigation.
- Maintain a logical heading hierarchy that reflects page structure.
- Use lists, tables, buttons, links, labels, and form controls according to their real meaning.
- Keep DOM order aligned with reading and focus order even when CSS creates an editorial layout.
- Set the correct page language and update it when locale changes.
- Give each page a meaningful title.

# Names, labels, and text alternatives

- Give every interactive control an accessible name that matches or includes the visible label.
- Use real labels for form controls.
- Describe informative images according to their purpose in context.
- Mark purely decorative images and visual flourishes so assistive technology ignores them.
- Do not repeat nearby visible text in verbose alt text.
- Ensure icon-only controls have concise names.
- Keep link text meaningful without relying on vague phrases alone.

# Keyboard and focus

- Make every interaction available by keyboard without requiring pointer gestures.
- Preserve a logical focus order.
- Provide a visible focus indicator with sufficient contrast.
- Never remove focus styling without an equally visible replacement.
- Prevent sticky headers, modals, or overlays from obscuring focused elements.
- Return focus to the invoking control when a temporary surface closes.
- Avoid positive `tabindex`.
- Do not trap focus except inside an active modal or equivalent blocking surface.

# Dialogs and overlays

For modal dialogs:

- use native dialog behavior when appropriate or implement equivalent semantics;
- expose a dialog name;
- move focus inside on open;
- keep focus contained while open;
- close with Escape unless closing would cause data loss;
- make the background inert;
- restore focus on close;
- provide an obvious close control;
- keep the dialog usable on small screens and at high zoom.

# Accordions, tabs, segmented controls, and carousels

- Use buttons for disclosure controls.
- Keep `aria-expanded` and `aria-controls` accurate.
- For tab-like interfaces, implement a complete tab pattern or use simpler buttons when tab semantics are not justified.
- Ensure the selected state is available beyond color.
- Make carousel controls keyboard accessible and clearly named.
- Provide pause or stop controls for automatic movement.
- Do not force users to chase moving content.
- Announce meaningful state changes without flooding live regions.

# Color, type, and reflow

- Meet minimum text contrast:
  - 4.5:1 for normal text;
  - 3:1 for large text.
- Meet 3:1 contrast for essential UI component boundaries, states, and focus indicators.
- Do not communicate meaning through color alone.
- Preserve content and functionality at 200% zoom.
- Support reflow at a narrow viewport without horizontal scrolling except for genuinely two-dimensional content.
- Allow user text-spacing overrides without clipping or loss.
- Avoid tiny interactive text and controls.
- Meet the WCAG 2.2 minimum target size of 24 CSS pixels where applicable; prefer larger comfortable targets when the design permits.

# Motion, animation, and media

- Respect `prefers-reduced-motion` across scroll-driven scenes, parallax, transforms, animated backgrounds, and carousels.
- Reduced motion must remove or simplify nonessential movement, not merely shorten it.
- Avoid flashing content.
- Provide controls for motion or auto-updating content that lasts or repeats long enough to distract.
- Keep essential state changes understandable without animation.
- Do not autoplay audible media.

# Forms and errors

- Associate instructions and errors with their controls programmatically.
- Identify required fields without relying on color.
- Preserve user input after validation errors.
- Move or announce focus appropriately when submission fails.
- Use correct autocomplete tokens for common personal-information fields.
- Make error text specific and actionable.
- Do not disable paste or password-manager behavior without a critical reason.

# Responsive and theme coverage

Test accessibility in:

- desktop, tablet, and mobile compositions;
- dark and light themes;
- every supported locale;
- open and closed component states;
- long translated strings;
- reduced-motion mode;
- 200% zoom and narrow reflow.

Do not assume an accessible desktop implementation remains accessible after responsive reordering.

# Verification

1. Run automated checks on representative routes.
2. Complete a keyboard-only pass.
3. Inspect the accessibility tree for names, roles, states, and order.
4. Test focus behavior for every overlay and disclosure.
5. Verify contrast in all themes and states.
6. Verify zoom, reflow, and reduced motion.
7. Run the production build.

# Done

Return a concise report containing:

- WCAG 2.2 AA issues fixed;
- remaining issues, grouped by severity;
- keyboard and focus results;
- component patterns corrected;
- contrast and reflow results;
- automated-tool results with their limitations;
- build result.

Do not claim full legal compliance from an automated scan alone.
