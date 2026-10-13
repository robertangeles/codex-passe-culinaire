# Shared navigation design review

29 September 2026. Status: Option A selected in board feedback and confirmed in chat. Design review complete; application implementation has not started.

## Scope and retained decisions

The user supplied the header navigation screenshot and confirmed a full-page review. Review the shared masthead, desktop hierarchy, mobile disclosure, current-page indication, keyboard behaviour and composition within a complete page. The approved About B layout with C palette and portrait placements supplies the page context. Its separate approval remains recorded in `../about-review/PLAN.md`; these previews do not implement it.

Retain the exact reinforced P/C signature, lowercase Fraunces wordmark, charcoal default, light/system theme support, all six existing destinations, editorial width and gutters. Retain CMS-driven navigation, arbitrary safe links and children, publication/access controls, server-rendered links, existing footer and existing theme control. Do not add invented offerings or claims.

## Current design audit

Evidence: `src/components/PublicShell.tsx`, `src/components/PublicShell.module.css`, global tokens, and browser capture `before-desktop.png` in the artifact directory below.

Current overall design assessment: 4/10. The identity is present and the links work, but all destinations have equal weight, the first offer is buried in the middle, and there is no current-page indication. Mobile uses a small dropdown rather than a considered navigation composition. A stronger result would give the brand and first offer deliberate positions, keep company scope understandable, show location in the site and make mobile navigation comfortable.

## Direction decision

| Study | Proposal | Tradeoff |
|---|---|---|
| A: The clear invitation | **Selected by the user.** Single row; first offer leads, a fine rule separates company links, Contact is outlined. | Direct access to everything, but the smallest departure from the existing header. |
| B: The curated house | CulinAIre Kitchen, Our work, About and Contact. Our work opens three editorial text rows: Services, Training, Journal. | Quieter composition, but three destinations require an extra click. Not selected. |
| C: The editorial masthead | Centred house signature above a second navigation row; first offer occupies the centre; Contact remains upper right. | Strongest culinary house identity and direct access to every route, at the cost of a taller desktop masthead. Not selected. |

The selected study includes a generous mobile menu with all six direct destinations, current-page marking, native disclosure operation, Escape dismissal and outside-click dismissal. Navigation remains usable without JavaScript. No modal focus trap, looping motion, sticky header or hover-only menus are proposed. A preview-only light toggle lives at the page foot; production retains its existing theme control.

## Approval reconciliation

Feedback file selects A with no comments, no overall note and no regeneration request. The three zero star values are unsubmitted defaults. The user's chat explicitly confirms Option A. This is one design-selection decision, carried through all passes; it does not select B's Our work grouping or C's second masthead row. No new controls, copy or layout changes were added after selection. About B with C palette remains separately approved.

## Seven-pass review

### 1. Information architecture: 4 → 8/10

Approved A makes the hierarchy explicit: house identity, first offer, wider work and company links, then Contact. All six destinations remain one click away. No new issues found.

```text
Desktop: [P/C + passe culinaire]   [CulinAIre Kitchen | Services Training Journal About] [Contact]
Mobile:  [P/C + passe culinaire]   [Menu / Close]
          open → six direct links, current destination marked
Page:     existing main landmark → existing footer and theme control
```

The three essential signals are house identity, the first offer and the route onward. No navigation labels are renamed.

### 2. Interaction states: 5 → 8/10

The approved preview supplies current-page, hover, keyboard-focus, open/closed and light states. Existing CMS behaviour below remains a contract, not a new design decision. No new issues found.

| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Header links | Existing server-rendered shell; no new skeleton | Existing brand/home remains; empty nav items do not invent destinations | Existing site error behaviour, no new navigation alert | Approved desktop links or native mobile disclosure | Existing safe-label/URL filtering and CMS children remain supported |
| Mobile menu | Native disclosure available before hydration | Do not manufacture menu links | Native open/close still works if enhancement JS fails | Menu changes to Close, all six supplied links visible | Retain valid supplied destinations and nested links |
| Location and focus | Stable link text is visible | No active mark on a route without a matching destination | No false current-page indicator | Current destination marked; keyboard focus visible | Detail routes identify their existing section; exact page and ancestor semantics distinguished |

Escape restores focus to the disclosure trigger; outside click closes it. Navigation remains ordinary links and native disclosure, not an ARIA application menu. Closing after route navigation follows the existing link flow. Route matching and CMS overflow are engineering verification obligations, not reasons to reopen the selected appearance.

### 3. Journey: 5 → 8/10

| Step | Visitor does | Intended feeling | Approved support |
|---|---|---|---|
| Arrives | Recognises the house | Confidence and familiarity | Existing P/C and lowercase Fraunces signature |
| Scans | Finds the first offer | Clarity | CulinAIre Kitchen leads the row |
| Explores | Opens a destination | Orientation | Direct labelled links and current-page treatment |
| Uses a phone | Opens Menu and chooses a link | Control | Spacious six-link menu, visible Close and keyboard support |
| Returns | Finds the same navigation again | Familiarity | Shared shell across public pages |

Five seconds: recognise house and offer. Five minutes: move between product and company information. Long-term: retain the signature and plain destination names. No new issues found.

### 4. Generic design risk: 6 → 8/10

Mode: marketing-site wayfinding, supporting the page's persuasive content. Existing project choices take precedence over generic recommendations for extra motion, textures or replacement fonts. The selected design uses exact Fraunces/Inter tokens, the real P/C mark, fine separators and restrained Contact treatment.

Hard rejection checks: no SaaS card grid; no image masking weak branding; clear onward links; no text on busy imagery; no repeated mood sections introduced; no carousel; no stacked application cards. All seven are clear within the header scope.

Litmus: brand/product recognisable YES; strong identity anchor YES; destinations scannable YES; each area has one job YES; cards necessary NO (none added); motion useful NO (none added); premium without shadows YES. No new issues found.

### 5. Design system: 8 → 9/10

Retain approved charcoal/bone, muted green menu, self-hosted Fraunces/Inter, square corners, fine rules, visible focus and the existing light/system controls. Max width 1312px; 64px desktop, 32px intermediate and 24px mobile gutters, with the shown 16px narrow-header exception. Desktop header 116px; mobile 94px. No token or logo changes. No new issues found.

### 6. Responsive and accessibility: 7 → 8/10

The approved study changes to the full menu at 980px and below; 981–1200px uses compact desktop spacing. Mobile links are at least 54px high. Native summary exposes expanded state, navigation landmarks have labels, the brand links home, decorative SVG is hidden from assistive technology, and current location is distinguishable without colour alone. Mobile remains a nonmodal disclosure with natural tab order. No animation is required. The measured preview checks below cover narrow, tablet and wide layouts. Production still requires CMS-content, zoom, screen-reader and theme verification. No unresolved visual tradeoff found.

### 7. Decisions

One decision resolved: A is selected. Zero deferred design decisions and no additional TODO proposals. Preserving CMS flexibility, existing shell behaviour and brand contracts is mandatory. No new issue requires another taste question. Application/engineering acceptance remains outstanding work, not an unresolved design choice.

## Verification evidence

Artifact directory: `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/navigation-20260928/`.

- Real browser checks: 21 variant/width combinations at 320, 390, 768, 980, 1024, 1440 and 1920px. No horizontal overflow or page errors.
- Axe WCAG A/AA scans: no violations for each study at 390 and 1440px, each open mobile menu at 390px, and each light desktop preview.
- Mobile: six visible destinations, link heights at least 54px, Escape closes disclosure. Native menu also opens with JavaScript disabled.
- B desktop: all three Our work links visible, Escape and outside click close the panel.
- Parent visually inspected desktop studies, open mobile and desktop menus, light C and current application baseline.
- `checks.json` and `extra-checks.json` contain actual results. Automated accessibility results are not a complete WCAG conformance audit.
- `exploration.png` is a generated design exploration, not an approved image or source of public copy. Actual HTML uses the existing exact monogram and approved page text.
- Header-only designer quality checks are recorded in `designer-checks.json`. C passed. A/B returned self-contradictory spelling flags (the alleged correction was identical) and B falsely reported a missing monogram; parent checked the source and rendered pixels and retained the correct brand. No founder biography or business identifiers were supplied to those checks.
- No lint, typecheck, unit test or application build claimed: this task changed only design artifacts and this review plan. Full application gates and independent diff review remain required after implementation.

## Browser review

Comparison board: http://127.0.0.1:43947/boards/b-20260928-103933-bknub3/

Interactive previews: http://127.0.0.1:4188/a.html, http://127.0.0.1:4188/b.html, http://127.0.0.1:4188/c.html.

The board includes responsive preview links, the open Our work state and the mobile menu screenshot. Feedback belongs in the board's Submit flow. Read `feedback.json` before interpreting a later “feedback provided” message. Do not regenerate over feedback without archiving it.

## Not in scope

Application implementation, deployment, unrelated homepage changes, new logo work, footer redesign, founder photo creation, or changes to the approved About content. The tasks below implement the selected treatment when application work begins; prototypes are not the CMS-connected application.

## What already exists

Reuse `PublicShell.tsx`, `PublicShell.module.css`, `BrandMonogram`, `ThemeControl`, `getPublicShell`, `safePublicHref`, the Header global and the exact tokens in `src/styles/globals.css` and AGENTS.md. Existing tests in `tests/public-shell.test.tsx` verify safe CMS links and server HTML; `tests/e2e/core.spec.ts` includes keyboard navigation and theme coverage. Preserve those behaviours and expand meaningful coverage rather than replacing it with prototype-only assertions.

## Approved mockups

Artifact root: `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/navigation-20260928/`.

- `approved-a.html`: frozen responsive reference for the shared header, including light preview and mobile behaviour.
- `approved-a-1440.png`: approved desktop in full-page context.
- `approved-a-390.png` and `approved-a-mobile-open.png`: closed/open mobile references.
- `approved.json`: hashes and exact approval scope; `feedback-final.json`: submitted choice.

The About page shown is context, with its own existing approval. Copy only the header treatment during the navigation task.

## Implementation Tasks

- [ ] **T1 (P1, human: ~3h / Codex: ~25min)** — Shared navigation — Implement the approved A header and disclosure behaviour.
  - Surfaced by: passes 1, 2 and 5; equal-weight navigation and missing current-page state.
  - Files: `src/components/PublicShell.tsx`, `src/components/PublicShell.module.css`, a bounded navigation client component only if needed, `tests/public-shell.test.tsx` and focused navigation tests.
  - Acceptance: match A; retain all CMS links and children, URL safety, server-rendered links, footer and themes; distinguish first offer and Contact by safe route; native menu works without JS; mark exact/ancestor routes correctly; Escape restores focus; avoid overflow with longer CMS labels.
  - Verify: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; parent reads full diff and reruns all gates, then independent reviewer. Read installed Next guides before choosing route-state mechanics. Do not hardcode the six preview links into the application.
- [ ] **T2 (P1, human: ~2h / Codex: ~20min)** — Browser acceptance — Verify the implemented shared header across pages and states.
  - Surfaced by: pass 6; fixed-content prototypes cannot prove production CMS behaviour.
  - Files: `tests/e2e/core.spec.ts` or one dedicated navigation spec, plus review evidence in `docs/designs/navigation-review/`.
  - Acceptance: desktop/mobile at 320–1920px, 200% zoom, all themes, current and nested routes, long labels/children, keyboard/no-JS operation, visible focus, menu close and route navigation; capture and inspect real application screenshots. Confirm the full page and footer stay aligned.
  - Verify: `pnpm test:e2e` plus full application gates above; no accessibility violations or visual collisions; respect existing JavaScript and performance budgets. Parent acceptance and independent diff review required.

## Completion summary

Initial impression 4/10. Rated passes: architecture 4→8, states 5→8, journey 5→8, generic-design risk 6→8, system 8→9, responsive/accessibility 7→8. Overall (minimum rated pass) 4→8/10. Three directions explored; A approved. One design decision recorded; zero deferred. No new TODO proposals. Approved fixes are specified, not implemented. The design plan is complete; engineering and application verification are next.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|---|---|---|---|---|---|
| CEO Review | Existing approvals | Retain company and first-offer priority | 0 new | Scope retained | No business scope change |
| Outside Review | Designer header checks | Visual sanity check | 3 | Completed, manually adjudicated | A/B checker spelling/mark flags contradicted source and pixels; C passed |
| Eng Review | Required before implementation acceptance | CMS and route-state integration | 0 for this change | Pending | Existing reviews do not cover this implementation |
| Design Review | plan-design-review and submitted A selection | Full shared-header design | 1 | Complete | Seven passes; 8/10 minimum; one selection, zero unresolved |
| DX Review | Not applicable | Public navigation | 0 | Not applicable | None |

**OUTSIDE COVERAGE:** Header-only designer checks are recorded; no independent Claude Code/native design voice or engineering review is claimed.

**VERDICT:** Design plan complete for A. Application unchanged; eng review required before implementation acceptance.

NO UNRESOLVED DECISIONS
