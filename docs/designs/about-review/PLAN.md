# About page: approved house folio

Date: 28 September 2026. Target: `/about`. Branch/base: main, no remote configured.
Status: design review complete. Revised B is the selected visual reference. Application implementation and engineering acceptance remain the next phase; no website content or application code changed during this review.

## Outcome and approval record

The About page must help chefs and restaurant owners understand who Alex Charasse and Rob Angeles are, inspect their relevant experience, and continue to CulinAIre Kitchen or contact the company. The company remains broader than its first product: training, advisory and publishing are part of its scope.

| Decision | Evidence | Accepted treatment |
| --- | --- | --- |
| Review scope | User: “full page review” | All seven design passes |
| Portrait composition | User: “Then add them how can we see the big picture if the picture is incomplete” | Show both founder photo spaces in the design, with their actual size and placement |
| Layout and palette | Board: “Option B with the Color pallette of Option C” | B's alternating portrait/biography layout, C's charcoal and muted green-grey surfaces |
| Final visual choice | Board preferred B, comment “This is the winner”; user: “feedback given Option B” | Accept the revised B composition, visible wording and portrait spaces as the implementation reference |

The star values were unselected zero defaults, not zero-star assessments. The final selection resolves the earlier request to confirm the combination; do not ask the user to choose it again. Portrait placement and the final composition are two new design decisions; palette/layout refinement and final confirmation are one continuing composition decision. Existing brand, content-truthfulness, CMS and accessibility requirements remain accepted contracts.

## What already exists

- Approved charcoal default, reinforced P/C mark, Fraunces display and Inter body, self-hosted fonts, manual dark/light/system control and square editorial styling. AGENTS.md and existing accepted design records provide the design specification; root DESIGN.md is absent, but this does not justify restarting brand consultation.
- The public CMS route, BlockRenderer, HeroBlock, FounderCardBlock, public projections, preview handling, metadata and JSON-LD. Render all existing/custom blocks; never discard content to force the mockup.
- Current PublicShell, including the confirmed company/ABN/postal footer and no footer Search link. Prototype shell markup is representative; retain the actual application shell and theme control. The selected colour treatment applies to the About body, not a global footer redesign.
- Prior culinary credibility research at `docs/designs/research-20260926/RESEARCH.md`. This review reuses its findings about named expertise, inspectable biographies and clear company/product relationships. No new market interviews or external-site research claimed.
- Supplied facts: Alex is CEO, Maître Pâtissier and Maître Chocolatier, founder of Almost French Patisserie in Richmond and Almost French Epicure on Little Collins Street, Melbourne. Rob is CTO, a chef trained in pastry and hot kitchen, and a Data Architect. The company is based in Melbourne.

The existing page was visually inspected at desktop and phone widths: generic About heading, detached introductory sentence, two PLACEHOLDER 10 images, short biographies and no next step within its content. Initial impression: **3/10**. The approved company identity is already suitable; the About body needs the redesign.

## Approved mockups

Artifact directory: `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/about-20260928/`.

| Surface | Absolute reference | Treatment |
| --- | --- | --- |
| Responsive HTML | `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/about-20260928/approved-b.html` | B layout with C colours, both photo spaces |
| Desktop | `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/about-20260928/approved-b-1440.png` | Alternating rows with upright portraits |
| Phone | `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/about-20260928/approved-b-390.png` | Portrait before each founder's biography |

`approved.json` records the user feedback and SHA-256 hashes. Original B and earlier feedback remain archived. Browser preview: http://127.0.0.1:4187/b.html . Board: http://127.0.0.1:43947/boards/b-20260928-100545-6hmi4o/ .

## Pass 1: Information architecture

**3/10 → 9/10.** The approved composition replaces disconnected blocks with this hierarchy:

```
Existing public header
  About Passe Culinaire
  From the kitchen, looking forward. + company introduction + P/C mark
  Two founders. Complementary experience.
    Alex: portrait | name, role, credentials, supplied biography
    Rob: name, role, credentials, supplied biography | portrait
  Experience, put to work.
    First offer + broader company scope
    Explore CulinAIre Kitchen / Start a conversation
Existing public footer
```

The three essential pieces are company identity, founder evidence and next step. The founder section label is h2, founder names h3; the closing section is h2. Exactly one h1. The mark is decorative in this context, not another announced heading. The header provides early product/contact access; the closing links make the next step explicit after the biographies. No extra menu, carousel or promotional grid is needed. No unresolved issue.

## Pass 2: Interaction state coverage

**5/10 → 8/10.** The selected portrait spaces are part of the design, not fabricated people. Keep their geometry when a real photo is supplied. The empty-photo treatment is the clearly labelled, calm photo space shown in the winning reference; no developer-numbered PLACEHOLDER 10 image. The general text-led fallback previously permitted by the project is superseded for this selected About composition by the user's request to see both portrait spaces. Do not extend this change to other pages.

| Feature | Loading | Empty | Error | Success | Partial |
| --- | --- | --- | --- | --- | --- |
| Founder portraits | Reserve the 4:5 frame; biography stays readable | Labelled portrait space, founder identified | Preserve geometry and readable alternate text; no fake replacement photo | Real supplied media with meaningful alt and intentional crop | One real portrait and one labelled space; neither biography disappears |
| Page/CMS content | Existing server-rendered response and navigation behaviour | Retain route title fallback; no fabricated missing biography | Existing calm route error/not-found handling | Approved text remains editable in CMS | Custom blocks remain visible and in editorial order |
| Product/contact links | Normal link navigation | No invented destination or disabled decorative control | Destination handles its own failure | Existing `/culinaire-kitchen` or `/contact` route | No app state machine added |
| Theme/navigation | Existing public-shell behaviour | Existing default theme | Existing storage fallback | Manual dark/light/system preference retained | System follows OS preference under existing contract |

No form, asynchronous biography fetch, loading animation or success toast belongs on this page. Real-photo/broken-photo acceptance must be verified in application QA; the prototype uses placeholders. This limits the score to 8 rather than claiming finished application state coverage. No new design choice unresolved.

## Pass 3: User journey and emotional arc

**4/10 → 9/10.** The approved journey is recorded below; feelings are design intentions, not measured research outcomes.

| Step | Visitor does | Intended response | Accepted design support |
| --- | --- | --- | --- |
| Arrives | Scans company introduction | Understands this is a Melbourne culinary company | Existing brand, plain introduction and precise heading |
| Inspects Alex | Reads pastry/chocolate credentials and venue experience | Can assess relevant culinary background | Name and facts beside a dedicated portrait space |
| Inspects Rob | Reads kitchen training and data role | Understands the complementary expertise | Matching biography hierarchy and equal portrait size |
| Connects experience to work | Reads company/first-offer relationship | Understands where to continue | CulinAIre Kitchen named as first offer, broader scope retained |
| Chooses next step | Opens product or contact | Has a clear, unforced action | Two direct, descriptive links |

Five seconds: recognise company and people. Five minutes: inspect each biography and visit product/contact. Over time: replace placeholders with genuine photos and update factual biographies through CMS, without changing the page's structure. No invented founder quotations, life story, awards, dates or commercial claims. No unresolved issue.

## Pass 4: Generic-design risk

**3/10 → 8/10.** Classifier: a company credibility page that persuades through readable evidence. The approved design uses a composed introduction, alternating photographic/biographical rows and one product continuation. It contains no generic feature cards, decorative icons, rounded panels, gradients, testimonial fabrication, carousel or busy text-over-image treatment. Founder names and actual experience do the work.

| Litmus | Result and evidence |
| --- | --- |
| Brand identifiable in first screen | Yes: exact mark/wordmark plus About Passe Culinaire |
| Strong visual anchor | Yes: opening typography and signature mark; portraits anchor subsequent rows |
| Scannable headings | Yes: company opening → founders → experience put to work |
| One job per section | Yes: identify, substantiate, continue |
| Cards necessary | No: no cards proposed |
| Motion improves this page | No additional motion needed; existing reduced-motion contract retained |
| Premium without shadows | Yes: the reference has none |

The flat charcoal field, Inter body and restrained/no motion are explicit project/user choices, not violations to overturn under a generic landing-page recipe. Placeholder frames cannot provide the human credibility of real photographs, so the design score is capped at 8. Supplying photographs later is content work, not permission to invent them. No unresolved remedy.

## Pass 5: Design-system alignment

**5/10 → 9/10.** Preserve exact brand tokens. Main/founder surfaces use `--surface`, text `--foreground`, continuation `--surface-muted`. In dark mode those resolve to #141412, #F4F1EA and #23251f. The selected portrait surface is #2c3028, held in a scoped semantic variable; light/system-light maps it to the existing linen surface with ink text. Do not override the existing theme selector or hardcode the whole route dark.

Desktop container: max 1312px, 64px outer gutters; 32px by 1100px and 24px by 800px as shown in the selected study. Hero grid: flexible text plus 220px mark column, 80px gap; mark 170×188px. Display heading clamp 48–72px, Fraunces 300; biography 16px Inter, line-height 1.7 and max 51ch. Names 42px Fraunces; credentials 22px; mobile names 38px and credentials 21px. Keep rules at ash 30% and radius zero.

Founder rows: .75fr/1.25fr with 80px gap, vertically aligned centre; reverse columns for the second row. Portrait maximum width 380px, aspect ratio 4:5, reserve height. Collapse gaps to 40px by 1100px. Use the existing responsive-media pipeline and focal metadata for supplied photos. Footer and header remain the actual shared components. No new global font, package, brand token replacement or shadow system. No unresolved issue.

## Pass 6: Responsive behaviour and accessibility

**6/10 → 9/10.** At <=800px, use one column, hide the duplicate decorative hero mark and keep both portrait spaces. Each founder is read in the same order: portrait, name, role, credentials, biography. Desktop visual alternation must not scramble this DOM order. Founder text is never hidden on phone. Portrait frames span the available width at 4:5. Hero is 50px, names 38px, body 16px; allow wrapping at 320px rather than clipping. Product action becomes full-width and contact remains a >=44px link.

Retain the real public mobile menu, skip link, focus styles, theme preference and semantic landmarks. No motion is needed to reveal content; reduced-motion/no-JavaScript visitors see the same text. Portrait placeholders are noninteractive figures, not broken-image controls; real portraits need meaningful alt. The known biographies remain server-rendered. All route text must remain selectable and keyboard navigation follows reading order.

Prototype checks passed at 320/390/768/1440/1920px: one h1, zero horizontal overflow, no browser errors. Desktop and phone Axe WCAG A/AA checks passed, and both selected screenshots were visually inspected. Production acceptance must additionally cover actual shell/theme behaviour, 200% reflow, genuine/absent/broken media, preview and page performance under existing budgets. These checks are mandatory implementation work, not deferred optional TODOs. No unresolved design issue.

## Pass 7: Decision register

Two design decisions resolved: the portrait spaces and the final B-layout/C-palette composition (including its visible text). Full-page scope is not counted as a remedy. Reuse the accepted brand, truthful content, CMS editing, shared shell and accessibility decisions rather than requesting them again. There are no unresolved design choices or proposed deferred TODOs.

The selection approves a design reference. It does not claim that application code has been built, tested or deployed. Engineering review and implementation acceptance remain distinct gates. Original images/feedback are retained; there is no reason to regenerate the approved dark mockup after this review because the accepted visual direction did not change.

## Content and engineering constraints

Approved copy is in `approved-b.html`. Treat headlines, introduction, founder roles/credentials/biographies and closing copy as editable public content. Preserve all arbitrary CMS blocks, metadata, draft preview, public access controls and normal publication hooks. Reuse the generic public route and block-rendering pattern unless engineering identifies a concrete reason to isolate a route. Do not duplicate backend content logic or hardcode biography facts into a view.

Apply approved local content with a backup, source/draft check and recheck immediately before updating. Abort a data update if independent editorial work exists. The normal queued after-commit invalidation must refresh public outputs; a CSS redesign must not bypass that behaviour. Seed remains factual and does not overwrite existing globals or published pages.

Prior learning applied: `payload-hooks-before-commit` (9/10, observed) requires publication tasks to retain the current request and invalidate only after committed state is visible. `c4-rsc-css-budget` (10/10, observed) supports retaining external stylesheets and existing script budgets. The approved contact layout remains unchanged.

## Not in scope

- Homepage/contact or global shell redesign: this request concerns About.
- New founder photographs generated from imagination, claims, clients or testimonials: genuine evidence only.
- New courses, services or product capabilities: keep company scope truthful without publishing fictitious offerings.
- New CMS schema, dependencies or external scripts: existing blocks and media are expected to suffice; engineering must substantiate any exception.
- Remote deployment: local implementation and QA come first.

## Implementation tasks

Parent owns architecture, plan, integration and acceptance. Assign bounded, disjoint executor work only after reviewing the implementation approach. Keep dependencies sequential and preserve unrelated work.

- [ ] **T1 (P1, human ~3h / agent ~25min): About presentation.** Implement the approved hero, alternating founder rows and continuation using existing public content. Likely files: new `src/components/AboutEditorial.tsx` and `AboutEditorial.module.css`. Finding: passes 1, 3–6, disconnected current layout and placeholder images. Verify exact desktop/phone reference, all portrait states, themes and semantic order.
- [ ] **T2 (P1, human ~2h / agent ~20min): CMS integration and copy.** Integrate About-specific presentation through `src/components/BlockRenderer.tsx` and `src/app/(public)/[slug]/page.tsx`; prepare a guarded local update script. Keep generic rendering and custom blocks intact. Finding: pass 2 and content constraints. Verify source HTML, one h1, arbitrary blocks, metadata/preview and safe copy-update/no-op behaviour.
- [ ] **T3 (P1, human ~2h / agent ~25min): Acceptance.** Extend relevant route/block tests only for meaningful CMS/rendering/state regressions, run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, independent diff review, real desktop/phone visual and keyboard checks, isolated publication/preview checks and relevant performance checks. Files: necessary tests and review evidence only. Fix-first review requires re-review. Finding: pass 6, prototype evidence is not application verification.

No new deferred TODO proposal. No dependency installation anticipated. Photos can be supplied later through the existing CMS; the selected labelled spaces specify today's complete layout.

## Review summary

| Dimension | Before | Approved specification |
| --- | --- | --- |
| Initial impression | 3 | Recorded separately |
| Information architecture | 3 | 9 |
| Interaction states | 5 | 8 |
| User journey | 4 | 9 |
| Generic-design risk | 3 | 8 |
| Design-system alignment | 5 | 9 |
| Responsive/accessibility | 6 | 9 |
| Overall, minimum of six passes | 3 | 8 |

All seven passes completed; two decisions resolved, none deferred. The 8/10 rates the design specification. Genuine photographs and implementation verification are necessary to assess the final page beyond that. The gstack exploratory raster was rejected because it invented biographical claims; it is not an approved artifact. Earlier external image checks on the text-only A/B are not review coverage for the final portrait remix. No external design voice was run; local prototype inspection/accessibility checks informed this review.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
| --- | --- | --- | --- | --- | --- |
| About design | plan-design-review | Full page, founder credibility and company/product path | 1 | Design complete | Revised B selected; 3/10 → 8/10 specification; two decisions resolved |
| External image checks | Prior text-only raster checks | Visual screening | 2 complete, 1 blocked | Historical partial coverage | A/B passed before portrait revision; C external check blocked; no final-remix external pass claimed |
| Outside design voices | Optional | Independent design challenge | 0 | Not run | Local inspection only for selected portrait remix |
| About engineering | Implementation phase | CMS/media integration and correctness | 0 | Required before acceptance | No application diff yet; old whole-site engineering log does not clear this change |

OUTSIDE COVERAGE: Earlier automatic approval review blocked one screenshot check because it might transmit founder/business information to an external AI service. The action was not retried or routed around. Final portrait/remix verification stayed local; no external completeness review claimed.

VERDICT: Design specification complete. Engineering review and implementation verification are required before application acceptance. No deployment performed.

NO UNRESOLVED DECISIONS
