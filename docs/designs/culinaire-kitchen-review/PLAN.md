# CulinAIre Kitchen: full-page design review

2 October 2026. Target: `/culinaire-kitchen`. Branch/base: main; no remote configured. Status: B implemented and applied locally. User authorised the selected direction and example retention. Source, browser, visual, publication and performance acceptance passed.

## Scope and existing decisions

The user invoked plan-design-review for this page after approving Services, Training and About. Carry forward the established full-page review preference rather than repeat the scope question. Retain the approved French culinary identity, reinforced P/C mark, light Fraunces and Inter, charcoal default and light/system support. Exact tokens, semantic landmarks, server-rendered text, existing CMS publication/access rules and performance budgets remain contracts.

Root DESIGN.md and TODOS.md are absent. AGENTS.md and approved page plans supply the design system. Brain cache was unreachable. Existing AGENTS.md already supplies Codex skill routing; the generic CLAUDE.md onboarding suggestion does not justify another host configuration. No new onboarding decision or cross-project context access was made.

## Current-page audit

Parent visited the actual page with gstack Chromium at 1440px, read its public HTML text, and inspected its screenshot. Route returns 200. The current body contains a generic product heading, one prep-list paragraph and an external-product CTA, separated by oversized blank intervals. It does not describe the operational scope supplied by the user. Subjective first impression: 3/10, not a completed six-pass aggregate score. The existing shared browser console contains stylesheet-preload warnings; no new runtime failure was observed during the read.

A 10 would make the product's role immediately clear, explain the real kitchen workflow and specialist labs, offer inspectable evidence and make the next action obvious. No fabricated savings, customer counts, testimonials or interface screenshots may fill the evidence gap.

Current screenshot and browser studies are saved under:
`/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/culinaire-kitchen-20261002/`.

## Research and claim provenance

- [CulinAIre Kitchen](https://www.culinaire.kitchen/): retrieved public page in Chromium on 2 October. Describes prep, inventory, ordering/receiving, menu/costing, waste, recipes, pastry, cocktails and team communication. Its timing, adoption and performance claims were not copied. Public marketing is evidence of positioning, not independent functional verification. The user's own prior specification supplies forecasting, rostering, production and sales-upload scope. No signed-in product account was accessed.
- [meez](https://www.getmeez.com/): public page connects kitchen problems to a product tour, workflow explanations and founder background. Application here: give chefs something concrete to inspect and make the relationship between tasks legible. No metrics or customer claims borrowed.
- [Apicbase inventory](https://get.apicbase.com/restaurant-inventory-management-software/): connects inventory, purchasing and recipe cost through a workflow. Application here: explain the connections instead of publishing a flat wall of feature names. No claimed savings or automation borrowed.

This is desk research and design inference, not new chef interviews or conversion evidence. The public product site uses “Pastry Lab”; studies retain the user's “Patisserie Lab” wording. Final wording remains part of content review.

## Browser comparison

- Board: http://127.0.0.1:38643/boards/b-20261002-085427-umw5ej/
- Interactive A: http://127.0.0.1:4191/a.html
- Interactive B: http://127.0.0.1:4191/b.html
- Hub: http://127.0.0.1:4191/

A, **The whole kitchen**: broad typographic opening, existing kitchen film near the top, compact linked-operation narrative and photographic lab section. Initial recommendation only; not selected.

B, **Behind every service**: close working photograph beside the introduction, editorial kitchen-day rows, a lab feature and a later optional film. More emphasis on reading the operation before watching.

Both are complete page studies, with the existing company header/footer, real product/contact links, practical shared-component example and supplied founder facts. Both cover Waste Management, Rostering, Inventory, Purchasing, Receiving, Mise en Place, Production, Sales, Recipe Lab, Patisserie Lab and Cocktail Lab. Forecasting, stock transfers, menu/costing and team messaging are also visible. No pricing or fictitious product screenshot is added.

The practical example reuses the previously verified shared pâte sucrée concept. It is proposed for this product page only; it does not reinstate the sections the user removed from the homepage. Existing film/photos are labelled illustrative in the review context. The generated anonymous raster `exploration.png` received an automated composition-check pass but is not an approved design or source copy. The actual chooser uses authored HTML screenshots with the existing identity.

## Prototype evidence

`checks.json`: all 12 combinations of A/B, 390/768/1440px and dark/light passed: one h1, no overflow, no broken loaded images, zero axe WCAG2/2.1/2.2 A/AA violations, and no video transfer before explicit play. Lazy images were brought into the verification scope before the final check; unrequested images were not labelled broken.

`interactions.json`: four A/B × phone/desktop cases verified film start, pause, correct landscape/portrait source, no loop, theme switching and valid local anchors. Mobile menu Escape was exercised. Parent viewed both desktop full-page compositions, both phone openings and both light-theme desktop openings. These checks verify prototypes, not the application integration.

The proposed product-page film is initially paused and starts on explicit play, with native controls, offscreen/hidden-tab pause and a readable error path. The homepage's existing finite-film behaviour is untouched. Content does not depend on animation; reduced motion suppresses the short heading entrance.

## Existing implementation to reuse later

Generic public CMS route, BlockRenderer and existing media/film/link primitives. Preserve arbitrary block order, draft isolation, publication freshness, metadata and safe public links. Keep future content changes guarded against independent editorial changes. Do not reseed the application to apply a design.

## Selected direction and decision evidence

The feedback file identifies B and says “Option B is the winner.” The zero star values are untouched defaults, not negative ratings. `publishedAt` is the board publication timestamp, not the time of feedback. Exact submitted JSON is in `feedback.json` beside this plan.

B supersedes the initial recommendation of A. Its hierarchy is retained: close pastry-bench photograph and “Behind every service.” introduction; kitchen-day editorial rows; the three labs; proposed shared-component example; optional film; supplied founder facts; product/contact continuation. No further confirmation of this unambiguous visual choice is needed.

The user's established feature scope and terminology remain authoritative. Retain “Patisserie Lab”, as explicitly supplied by the user and used in the approved film. Do not invent current availability, savings or automation guarantees. Content wording still remains editable during implementation.

## Pass 1: Information architecture, 2/10 → 9/10

B resolves the empty, prep-only page with a product introduction and a scannable account of the operational scope. The first-screen budget is company identity, product purpose and product-site action, supported by one kitchen photograph. Section anchors support scanning; they are ordinary links, not a carousel or tabbed prerequisite.

```text
Company header
  CulinAIre Kitchen / Behind every service / product-site CTA
  Daily operation
    Plan: forecast, roster, messaging
    Stock: purchase, receive, inventory, transfers
    Prepare: mise en place, production, menu and costing
    Review: waste and sales
  Three labs: recipe, patisserie, cocktail
  Shared-component example [retained by follow-up authorisation]
  Existing kitchen film, explicitly played
  Supplied founder experience → About
  Product website / Contact → shared footer
```

Keep page text readable without JavaScript. The product CTA goes to the existing external product site; contact remains a company route. Scope stays on this one company product-introduction page. The example treatment was resolved by the follow-up implementation authorisation.

## Pass 2: Interaction state coverage, 5/10 → 8/10

The existing accessibility/media contracts and the selected prototype establish the following states. These specify required implementation behaviour, not a claim that the application has been built.

| Element | Loading | Empty | Error | Success | Partial |
| --- | --- | --- | --- | --- | --- |
| Page | Server-rendered text; no invented skeleton | Preserve meaningful headings and supplied content; no fabricated feature records | Existing page-error/404 recovery | B in normal document flow | Custom CMS blocks retain position; missing optional copy is omitted |
| Still photography | Reserved dimensions, first visible image prioritised | Truthful alternative/frame; no fake screenshot | Fixed frame and readable alternative | Correct crop and contrast in both themes | Later images lazy; content remains understandable without them |
| Film | Visible poster and a loading status after explicit play | Descriptive text remains; omit unavailable player | Calm message and direct film link | Native or existing accessible play/pause, seek and replay; finite playback | Offscreen/hidden-tab pause; no automatic restart; reduced-motion/data-saving starts paused |
| JavaScript unavailable | All product text and links present | N/A | N/A | Film direct link via noscript and textual equivalent, reusing existing story content | No inert visible play button; render controls only when enhanced |
| Theme/nav | Existing application shell | N/A | Existing behaviour | Manual/system preference, focus and keyboard menu | Existing mobile navigation rather than new navigation implementation |
| External product link | Ordinary navigation | N/A | No fake embedded success state | Clearly labelled product destination, same tab | Contact remains an alternative; no login/trial promise invented |

The silent film needs a text equivalent using the existing story descriptions. Keep it accessible without reinstating the homepage's deleted chapter navigation or visible “Read the full kitchen story” control. The prototype demonstrates the chosen layout and basic playback; production must retain the existing accessibility and failure contracts. All original page/film functionality remains independently testable.

## Pass 3: User journey and emotional arc, 2/10 → 8/10

These are design intentions, not measured visitor emotions.

| Step | Visitor does | Intended response | Selected support |
| --- | --- | --- | --- |
| Arrives | Recognises company and product | This understands kitchen work | Approved identity, kitchen photo, concrete opening |
| Scans | Follows planning through sales | This covers more than a prep list | Four linked operational groups with all supplied areas |
| Explores | Reads the specialist labs | There is room for my discipline | Recipe, patisserie and cocktail descriptions |
| Inspects | Optionally watches the kitchen film | I can see the workflow | Existing 128-second film, explicit play, no forced viewing |
| Assesses | Reads founder background | I understand who is behind it | Supplied culinary/technical facts and About link |
| Acts | Visits product or contacts company | I know where to go next | Clear external product CTA and contact alternative |

At five seconds, product and kitchen context are clear; over several minutes, operations and evidence can be inspected; long-term credibility depends on accurate product content and actual experience, not decorative promises. The shared-component example was explicitly raised because it was removed from the homepage; the user’s subsequent “Let’s go” accepts the recommendation to retain it on this product page. No new customer claims or compulsory viewing flow is introduced.

## Pass 4: Intentional design / AI-slop risk, 3/10 → 9/10

Classifier: PERSUADE, with a READ-like operations section. B is a kitchen-focused product introduction, not an app dashboard. Approved Fraunces/Inter, charcoal/bone/moss and inset editorial composition take precedence over generic skill defaults recommending another typeface or full-bleed imagery.

Hard-rejection audit: no SaaS card grid as first impression; brand and product present; clear action; no copy over busy photography; each section has a different job; no carousel; no counterfeit app interface. The labs form a single image with ruled descriptions rather than three icon cards. No decorative shadows or gradients. The short, already-visible heading entrance is suppressed for reduced motion.

| Litmus | Finding |
| --- | --- |
| Brand/product unmistakable | YES: P/C company header and explicit CulinAIre Kitchen label |
| One visual anchor | YES: close pastry preparation photograph |
| Headline scan understandable | YES: introduction, operation, three labs, film, people and next action |
| One job per section | YES; example retention resolved by follow-up authorisation |
| Cards necessary | NO; B correctly uses editorial rows instead |
| Motion useful | Restrained optional entrance; film is deliberate content, not looping decoration |
| Premium without shadows | YES; none are required |

The photographs are existing illustrative film assets, not customer evidence or software screenshots. No new illustration generation or fake product screen is needed.

## Pass 5: Design-system alignment, 7/10 → 9/10

Use AGENTS.md as the design contract: exact brand colours, self-hosted Fraunces/Inter, 62ch prose measure, 1.55 body and 1.05 display leading, zero radius, fine ash rules and the approved spacing scale. Prototype dimensions are visual guidance; implementation resolves spacing to the existing tokens rather than creating an unrelated system. Headings follow existing responsive clamps.

Keep company header/footer, exact monogram, current navigation order and production theme selector. Components/styles must be scoped to this route; no global restyling. Dark text aliases and light-theme moss links must meet the existing contrast requirements. The missing root DESIGN.md does not create a new design-system task: approved project tokens already exist and must not be rediscovered.

Independent review found a prototype-only theme-label mismatch. It now keeps the stable label “Light palette” and uses `aria-pressed` for selection. A re-review passed. This is an accessibility correction to the preview, not approval for replacing the production selector.

## Pass 6: Responsive and accessibility, 6/10 → 8/10

Desktop: split introduction/photo, editorial operation rows, paired lab image/copy and paired film introduction/player. At 800px and below: introduction and actions first, anchors wrap in two columns, image follows, operations become sequential readable sections, lab image precedes lab descriptions, film text precedes the player. At phone widths the film chooses the existing portrait asset on explicit play. Use stable image/video dimensions.

Retain skip link, one h1, semantic headings, labelled navigation/controls, meaningful alternatives, visible focus and usable touch targets. Film keyboard controls, play/pause state, failure, noscript and text equivalent are acceptance requirements. Content never depends on hover, motion or a horizontal carousel.

Evidence: the previous 12 viewport/theme cases and four interaction cases pass. Additional B checks pass at 320px and a 720px reflow viewport (equivalent layout width to 200% browser zoom from 1440 CSS pixels), with body text present without JavaScript and keyboard focus beginning at Skip to content. A CSS `zoom:2` stress test exposed overflow in the prototype's copied shared header/footer; this is not a product-body defect or a verified browser-zoom pass. Application acceptance must exercise the actual shared shell at real browser zoom. Do not silently redesign it as part of this route.

Prototype axe results are evidence of the checked states, not WCAG certification. Existing mobile Lighthouse targets and approved JavaScript/LCP ceilings remain unchanged; implementation must be measured.

## Pass 7: Decision register

| Decision | State | Evidence / consequence |
| --- | --- | --- |
| B composition and later optional film | Accepted | Explicit board selection: “Option B is the winner” |
| Feature scope and Patisserie Lab terminology | Existing user instruction retained | Eleven named areas plus forecast, transfers, menu/costing and messaging |
| Brand, accessibility and media behaviour | Standing contracts retained | AGENTS.md and existing film/site behaviour; product-page film explicitly played |
| Shared-component example on product page | Accepted | User’s “Let’s go” follows the recommendation to keep it here |

No additional tradeoff, package, global redesign or deferred TODO is proposed. A selected composition does not certify every feature's release availability or every public marketing claim.

## Independent design review

Native reviewer initially raised two issues. Parent supplied previously omitted claim evidence: the established approved seed copy and the public product site's explicit cross-usage/one-preparation description. The reviewer withdrew the unsupported-invention finding; no signed-in verification is falsely claimed. The preview theme accessible label was corrected and rechecked. Final independent verdict: PASS, with the example-retention preference subsequently resolved by the user.

The optional external Claude export was rejected by automatic approval review in the preceding workflow. No new export was attempted or provider substituted; external coverage remains unavailable. Native completion is recorded separately and is not presented as cross-model agreement.

## Selected visual reference

`/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/culinaire-kitchen-20261002/selected-b.html` preserves exactly what was selected. Current `b.html` adds only the preview theme accessibility correction. Adjacent `base.css`, `styles.css` and `assets/` are required. `selected.json` records the submitted feedback and SHA-256. The existing board URL remains valid. The example is retained by the follow-up authorisation.

## Implementation tasks

Only accepted design work is listed. Local engineering review settled the rendering/content mapping; delegated implementation and parent acceptance are in progress.

- [x] **T1 (P1, human ~4h / agent ~40min): Apply selected B presentation to this product page.** Source: Passes 1, 3 and 4. Candidate files: generic public page route, BlockRenderer, new route-specific editorial component/styles, compressed approved assets, guarded product-page content transform/updater. Preserve arbitrary CMS blocks, editable approved copy, public/draft boundaries and existing shell. The practical example remains, following the user’s acceptance of that recommendation. No schema change assumed.
- [x] **T2 (P1, human ~2h / agent ~25min): Integrate the existing film with explicit play.** Source: Passes 2 and 6. Candidate files: existing film/player or a minimal reuse path, route-specific presentation and meaningful media tests. Retain no transfer until play, no loop, offscreen/tab pause, reduced-motion/data-saving state, keyboard controls, failure/noscript and text equivalent. Do not change homepage playback behaviour.
- [x] **T3 (P1, human ~2h / agent ~30min): Verify the product page and regressions.** Source: Passes 2, 5 and 6. Candidate files: route/content/render tests, browser coverage, evidence here. Parent reads each executor diff, runs lint/typecheck/test/build, then obtains independent review. Browser-check actual desktop/phone/themes, real zoom, no-JS/error/media states, publication freshness, preview isolation and the existing performance budgets. No skipped check counts as acceptance.

## Completion summary

| Dimension | Before | Selected B specification |
| --- | --- | --- |
| Step 0 first impression (separate) | 3/10 | Not rescored as an aggregate |
| Information architecture | 2/10 | 9/10 |
| Interaction states | 5/10 | 8/10 |
| Journey | 2/10 | 8/10 |
| Intentional design | 3/10 | 9/10 |
| Design system | 7/10 | 9/10 |
| Responsive/accessibility | 6/10 | 8/10 |
| Overall, minimum of six passes | 2/10 | 8/10; content choice now resolved |

One new visual decision and one example-retention decision accepted; standing scope/brand contracts retained; no content question pending. Scores assess design specification, not application completion. No remote deployment occurred. Local content application is recorded in the implementation acceptance below.

## Not in scope

Changing homepage/global navigation/footer; changing the separate product application; generating a new film; publishing prices, testimonials or performance promises; deployment. No production source or CMS records were edited in this review stage.

## Local engineering review and authorised execution

The user's “Let's go” follows the recommendation to keep the product-page example. Retain it and implement B. This resolves the remaining content preference; no further approval is required for the local implementation. No deployment is authorised by this step.

Parent traced the generic CMS route, BlockRenderer, existing About content updater, existing film player, RichText and ResponsiveMedia. Installed Next.js server/client boundary and image guides were read. Simplest viable approach: route-scoped presentation of existing named CMS blocks, plus a small opt-out from the existing film player's automatic start. No schema, migration, new dependency or seed rewrite.

Architecture: keep `getPageViewModel`, metadata and publication caching unchanged. Pass a product-page flag only for the `culinaire-kitchen` slug. Recognise exact block names for approved hero and feature sections; render all other blocks normally and in their original order. Store headings, summaries, operation/lab/example/founder copy in existing hero/feature/RichText fields. Use fixed compressed approved illustrative stills as defaults while respecting supplied valid CMS media. Build only anchors whose target section remains present.

Film: reuse KitchenFilm and KitchenFilmPlayer. Introduce explicit `autoStart=false` on this product route only; default remains true for home. Guard both visibility-triggered transfer and automatic play/resume in manual mode. User play/seek may attach the source. Keep pause/replay/seek/fullscreen, transcript, noscript and failures. Hide the shared film intro when the product feature supplies its own heading. Existing home output/behaviour remains default.

Data update: local-only guarded updater checks published/latest match, accepts only exact original seed or exact approved no-op, writes a private 0600 backup before mutation and rechecks snapshot afterward. It updates only this page through existing Payload hooks; custom blocks/drafts cause refusal, never replacement. Existing runtime renderer still preserves arbitrary blocks after the update. Parent applies the update only after full checks and independent review; jobs and warmed public HTML prove freshness within 60 seconds. Confirm repeat invocation is a no-op. No production concurrency guarantee is claimed for this local updater.

Risk/verification map: custom block/order → unit tests; misleading image or unsafe link → existing media/link validation plus regression tests; shared player regression → existing homepage film browser tests; unwanted transfer/resume → new product browser assertions; mutable CMS/draft/private response → isolated browser fixtures; changed SEO → preserve existing metadata contract; cache leak between fixture runs → existing quality cache reset; slow hero → explicit first-image priority and final Lighthouse measurement.

Execution: one bounded executor owns this product route, its content helper/updater, media reuse adjustment and unit tests. Parent owns plan, independent CMS inspection, browser integration coverage and acceptance. On executor return, parent reads the full diff, runs lint/typecheck/test/build, then requests independent review. A fix-first result requires fixes and re-review. No task is delegated with overlapping file ownership.

Local engineering verdict: clear to implement the existing approved scope. No new unresolved design or architecture tradeoff. Independent diff review and actual browser/performance gates remain required.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
| --- | --- | --- | --- | --- | --- |
| Design Review | User plan-design-review | Full product page | 1 current scope | CLEAR | B selected; six scores minimum 8/10; example retained |
| Prototype QA | Review preparation | Responsive/interaction behaviour | 12 layout + 4 interaction + narrow/reflow checks | PASS with recorded zoom limitation | Actual application zoom remains required |
| Native independent design review | Skill design challenge | Completeness and hierarchy | Initial + re-review | PASS | Theme preview label fixed; supplied evidence resolves claim concern |
| External design voice | Skill optional external phase | Additional independent challenge | 0 new export attempts | UNAVAILABLE | Prior automatic approval rejection retained; no bypass |
| Eng Review | Required before implementation | CMS/rendering/media contracts | 1 local review | CLEAR (PLAN) | Route-scoped existing blocks/player reuse; independent diff review remains required |

OUTSIDE COVERAGE: Native design review completed. External Claude review unavailable; no new export attempted after the preceding automatic approval rejection.

VERDICT (design stage): B and the retained example were authorised. Implementation acceptance follows below.

NO UNRESOLVED DECISIONS

## Implementation acceptance

The authorised B layout is applied at http://localhost:3000/culinaire-kitchen. All eleven user-supplied areas are included, along with forecasting, messaging, stock transfers and menu/costing. Company identity and its training/advisory/publishing scope remain separate. The shared-component example is retained on this product page.

Parent read the executor diff and ran the full required gate twice: lint, typecheck, 62 test files / 354 tests, and build all passed. The final spacing-only adjustment passed an additional production build. Native independent source review returned PASS and rechecked the browser-discovered fixes and final spacing delta with PASS. No schema or dependency was added.

The full browser run passed 40 existing cases, including complete homepage film playback on both viewport projects. Two new product cases initially failed on a Markdown-escaped text assertion; after correction both passed in a targeted rerun. The final product checks include CMS/order/media edits, publication/export freshness, draft isolation/private preview, manual transfer/playback, offscreen/tab pause, seek/end/replay, network failure and no-JavaScript access. Added geometry assertions verify the actual desktop workflow and founder columns.

The actual application passed eight dark/light × 320/390/768/1440 combinations with one h1, no overflow, broken images, runtime errors, unsolicited MP4 requests or axe A/AA violations. Parent visually inspected the desktop and phone compositions and light-theme layout. A Chromium extension set actual browser zoom to 200%; the 1440px window produced a 720 CSS-pixel viewport and devicePixelRatio 2 with no overflow. This closes the earlier prototype zoom limitation.

The guarded local update saved a private backup and published through existing hooks. A warmed public page reflected the update in 2159ms after one successful job, without rebuilding. The updater initially did not recognise the CMS default imageSide on repeat invocation; explicit default fields fixed this, and a repeat invocation was verified as a no-op. No metadata was overwritten.

Detailed evidence and actual-site screenshot derivatives: [implementation/README.md](implementation/README.md). No public deployment was performed.

Final performance gate: `pnpm test:performance` passed all assertions for seven routes and 21 runs. Product medians: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1952ms. Existing category, LCP and home JavaScript ceilings were unchanged. Implementation commit: `eca853d`. All T1–T3 acceptance items complete; no unresolved decision or skipped required check.

VERDICT: PASS. Selected B is implemented, verified and applied locally. Deployment was not requested or performed.
