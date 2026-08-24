---
name: accessible-frontend
description: >
    Non-negotiable accessibility rules for all frontend development.
    Enforces semantic HTML, color contrast, keyboard operability,
    focus management, mobile-first, zoom adaptability, ARIA correctness,
    and screen reader support. Trigger on: accessibility, a11y, WCAG,
    ARIA, semantic HTML, contrast, mobile-first, responsive, zoom,
    reflow, or any UI creation task.
---

# Accessible Frontend: Non-Negotiable Rules

Apply to ALL components, pages, and interfaces. Code only. No explanations unless asked.

## 1. Semantic HTML

- `<button>` for actions, `<a>` for navigation. Never `<div>`/`<span>` as interactive elements.
- Headings `<h1>`–`<h6>` in logical order, never skip levels.
- Landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`.
- Sectioning: `<section>` (with accessible name) for thematic groups, `<article>` for self-contained content (blog post, card, comment). Nest `<article>` inside `<section>` or vice versa when semantically appropriate.
- Lists: `<ul>`/`<ol>` for lists, `<table>` with `<th scope>` for tabular data.
- `<label>` with `for`/`id` on every input. `<fieldset>`+`<legend>` for groups.
- Never rely on placeholder as the only label. No div/span soup.
- **WCAG:** 1.3.1 (A), 4.1.2 (A)

## 2. Color Contrast

- Normal text: **4.5:1** min. Large text (≥18pt/≥14pt bold): **3:1** min.
- UI components & graphics: **3:1** min.
- Never use color alone to convey info — pair with text, icons, or patterns.
- **WCAG:** 1.4.1 (A), 1.4.3 (AA), 1.4.11 (AA)

## 3. Keyboard

- All interactive elements reachable via `Tab`/`Shift+Tab`.
- Buttons: `Enter`+`Space`. Links: `Enter`. No keyboard traps.
- Logical focus order. Skip-to-content link on every page.
- Custom widgets follow [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) patterns.
- **WCAG:** 2.1.1 (A), 2.1.2 (A), 2.4.1 (A), 2.4.3 (A)

## 4. Focus States

- Never `outline: none` without a visible alternative. Min **3:1** contrast, **2px** width.
- Use `:focus-visible` for keyboard-only focus rings.
- **WCAG:** 2.4.7 (AA), 2.4.11 (AA)

## 5. Focus Management

Focus must never be left in a void. After every state change, focus lands on a meaningful element.

- Modal/dialog opens → first focusable inside. Closes → trigger element.
- Add item → new item's first action. Delete → next item (or previous, or empty state).
- Edit mode → edit input. Save/Cancel → back to edit button.
- Form error on submit → first invalid field.
- SPA route change → page heading (`tabindex="-1"`) after updating `document.title`.
- Dynamic content loads → heading of new content (`tabindex="-1"`).
- Store trigger reference before opening modals so focus returns on close.
- `tabindex="-1"` only on headings for programmatic focus, never on containers.
- **WCAG:** 2.4.3 (A)

## 6. Mobile-First & Responsive

- Base styles for small screens, `min-width` queries to scale up.
- Touch targets: min **44×44 CSS pixels** with adequate spacing.
- Support both orientations. Never lock unless essential.
- No horizontal scroll at **320px** width.
- Complex gestures must have single-pointer alternatives.
- **WCAG:** 1.3.4 (AA), 2.5.1 (A), 2.5.8 (AA)

## 7. Zoom & Reflow

- Functional at **200% zoom**. Single-column reflow at **400%** (320px) — no horizontal scroll.
- Use relative units (`rem`, `em`, `%`), not fixed `px` for fonts/spacing.
- Never `maximum-scale=1` or `user-scalable=no` in viewport meta.
- Text spacing overridable (line-height 1.5×, letter-spacing 0.12×) without breaking layout.
- **WCAG:** 1.4.4 (AA), 1.4.10 (AA), 1.4.12 (AA)

## 8. Alt Text & Media

- Informative images: concise `alt` describing purpose. Decorative: `alt=""`.
- Complex images: short `alt` + longer description via `aria-describedby`/`<figcaption>`.
- Icon-only buttons: `aria-label` or visually hidden text.
- SVGs: `role="img"` + `aria-label` or `<title>`+`<desc>`.
- Video: captions. Audio-only: transcript.
- **WCAG:** 1.1.1 (A), 1.2.1–1.2.5 (A/AA)

## 9. Forms & Errors

- Visible `<label>` on every input. `<fieldset>`+`<legend>` for groups.
- Errors: specific message, not color-only. Use `aria-invalid="true"` + `aria-describedby`.
- Announce errors via `aria-live="assertive"`. Use `autocomplete` on common fields.
- **WCAG:** 3.3.1 (A), 3.3.2 (A), 3.3.3 (AA), 1.3.5 (AA)

## 10. ARIA

**If a native HTML element has the semantics, use it instead.**

- No redundant roles. `aria-expanded`/`aria-selected`/`aria-checked` for widget state.
- `aria-live="polite"` for updates, `"assertive"` for critical alerts.
- `aria-hidden="true"` for decorative content. Never on focusable elements.
- Every ARIA attribute must reflect live state. Stale ARIA is worse than none.
- **WCAG:** 4.1.2 (A), 4.1.3 (AA)

## 11. Motion & Timing

- Honor `prefers-reduced-motion: reduce`. No auto-playing media.
- Nothing flashes >3 times/second. Moving content >5s needs pause/stop.
- Time limits must be extendable.
- **WCAG:** 2.2.1 (A), 2.2.2 (A), 2.3.1 (A)

## Screen Reader Announcements

- `aria-live="polite"`: additions, deletions, edits.
- `aria-live="assertive"`: errors, drag operations.
- Clear live region first, set new text in `requestAnimationFrame`.
- Error messages: `role="alert"` linked via `aria-describedby`.

## Framework Rules

- **vanilla:** HTML + ES module JS. **react:** functional + hooks. **vue:** Vue 3 `<script setup>`.
- **next:** SSR-safe (guard `window`). RTL: logical CSS props, swap arrow keys.
- `tabindex`: `0` = focusable, `-1` = programmatic only, never positive.

## Validation Workflow (Required)

After implementing any accessibility improvements, you MUST perform an end-to-end Lighthouse validation loop. This is not optional; do not wait for the user to ask you to run Lighthouse.

1. **Run Lighthouse Audit:** Execute a Lighthouse accessibility audit against the updated page/component using the `run_command` tool (e.g., using `npx lighthouse <url> --only-categories=accessibility --output=json` or the project's specific testing script).
2. **Analyze Report:** Review the output to identify any accessibility violations caught by Lighthouse.
3. **Iterate and Fix:** Immediately fix the reported issues in the codebase.
4. **Re-run Audit:** Run the Lighthouse audit again to verify your fixes. Repeat steps 2-4 until no further improvements can be made or the accessibility score reaches the highest practical value (ideally 100).
5. **Final Output & Summary:** Once the loop is complete, your final response to the user MUST include:
    - The final Lighthouse accessibility score.
    - A summary of the issues that were initially detected.
    - How each issue was resolved.
    - Any remaining issues that could not be fixed and a technical justification for why.

## Manual Testing (To be done by Developer)

While the agent handles Lighthouse automation, the following manual checks are still strictly required for a complete audit (Lighthouse only catches ~30-40% of issues):

1. Keyboard-only: complete every flow via `Tab`.
2. Screen reader: VoiceOver / NVDA / TalkBack.
3. Contrast: WebAIM checker or DevTools.
4. Zoom 200% + 400%/320px reflow.
5. `prefers-reduced-motion`: animations stop.
