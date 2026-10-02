# Services, Training and About: full-page design review

2 October 2026, Australia/Melbourne. Target: `/services`, `/training`, `/about`. Branch/base: main; no remote configured. Status: design and local engineering reviews complete. Services A and Training A selected; About A explicitly reconfirmed. No application changes.

## Scope and standing decisions

The user requested plan-design-review for all three pages and asked whether the current result is the best possible. Carry forward the session's full-page review preference, approved French culinary character, exact reinforced P/C monogram, Fraunces/Inter, charcoal default, light/system theme support, truthful content and existing publication/accessibility contracts. Do not repeat brand discovery or request approval of routine review preparation.

The existing AGENTS.md already contains Codex skill routing. The skill-start's generic CLAUDE.md onboarding suggestion does not require creating a second host configuration as part of this design review. Brain cache lookup returned unavailable; local approved records supply the relevant context. Root DESIGN.md is absent; AGENTS.md and approved page plans are the actual design contract.

About B was approved on 28 September but remains unimplemented. Its approval stands. This review's About **A** is that approved B reference, with review controls added. The user has now submitted About feedback: “Option A is the winner.” About **B** was an optional refinement and is not selected. The original approved artifact is untouched.

Approved navigation A is also unimplemented. These studies use the existing application navigation order so a body-design choice does not silently approve an additional global navigation change.

## Current-page audit

Parent inspected all three local pages using gstack Chromium at 1440px and read their server-rendered content and route components. Each route returned 200. The browser initially recorded no console errors; a later shared session contained a stylesheet-preload warning from the existing application, not a prototype JavaScript error.

| Page | Subjective first impression | Concrete issue | User consequence |
| --- | --- | --- | --- |
| Services | 2/10 | Large generic heading, repeated section heading, misaligned content gutters and a short empty message | Little evidence of culinary practice or help beginning a relevant enquiry |
| Training | 2/10 | Same generic structure, with only no-upcoming-dates status and a contact link | Looks inactive; prospective learners cannot connect the page to the people behind it |
| About | 3/10 | Excessive blank opening, generic numbered image placeholders and detached founder facts | Supplied expertise is visually understated; approved portrait composition is absent |

A 10/10 result would pair intentional composition with real evidence: published service scopes, confirmed session details, genuine founder portraits, useful onward paths and verified application behaviour. A beautiful prototype cannot supply those missing facts. Do not fabricate them to fill the page.

Before screenshots: `.local/three-page-review/{services,training,about}-before.png`.

## Research grounding

Reuse the culinary credibility research in `docs/designs/research-20260926/RESEARCH.md`, including the distinction between observed patterns and our application of them. This is desk research, not new chef interviews or measured conversion research.

Refreshed primary sources during this review:

- [Grossi Hospitality](https://www.grossi.com.au/): connects culinary background to a stated scope and a work-with-us path. Application: make the people, area of work and enquiry route legible; do not borrow its heritage, clients, scale or outcomes.
- [École Ducasse professional masterclasses](https://www.ecoleducasse.com/en/professional-masterclasses): identifies its professional audience, describes programme formats and provides an information request. Application: distinguish the learning proposition from actual availability; do not borrow modules, locations or teaching claims.
- Le Cordon Bleu Australia's short-course URL was inaccessible through the web tool; no observations about that page are claimed.

## What already exists: application contracts to retain

- Services: server-rendered published-only query, title/id ordering, 12 entries per page, safe detail URLs, invalid-page handling, metadata and breadcrumbs. Existing service fields include title, oneLiner and whoItIsFor.
- Training: distinct upcoming and past/cancelled collections, sold-out/cancelled/past labels, event timezone formatting and safe title links. Preserve existing pagination and missing-date treatment.
- About: generic public CMS route, all arbitrary/custom blocks, founder facts, portrait media, public access, draft preview and queued after-commit cache invalidation. Do not hardcode biographies into presentation or overwrite independent editorial changes.
- Shared shell: existing navigation, footer, company address/ABN, no footer search, semantic landmarks, skip link, focus and theme behaviour.
- Company scope: training, advisory and publishing; CulinAIre Kitchen remains the first offer, not the entire company.
- No published fictitious services, events, credentials, testimonials, prices or dates. Specimen content belongs only to the private review artifacts.

## Browser studies

Artifact root: `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/services-training-about-20261002/`.

Hub: http://127.0.0.1:4190/

- Services board: http://127.0.0.1:38643/boards/b-20261001-225238-q2nos5/
- Training board: http://127.0.0.1:38643/boards/b-20261001-225241-v6ro0r/
- About board: http://127.0.0.1:38643/boards/b-20261001-225244-j9qudk/

| Page | A | B | Final selection |
| --- | --- | --- | --- |
| Services | The working kitchen: close working photograph, clear conversation CTA, useful enquiry prompts and concise founder evidence | The practice folio: more typographic weight, narrower photograph and compact ledger-like structure | A explicitly selected |
| Training | At the bench: intimate craft photograph beside heading and enquiry action | The training prospectus: broad craft photograph followed by clearly separated availability/programme | A explicitly selected; supersedes the initial B recommendation |
| About | The previously approved B: signature mark, alternating upright portrait spaces and supplied biographies | A closer introduction: shorter opening, larger square desktop portrait spaces and reduced repetition | A explicitly selected: “Option A is the winner” |

Each folder contains `a.html`, `b.html`, full desktop/phone screenshots and `board.html`. Services and Training also contain `a-populated.html` and `b-populated.html`, plus a clearly labelled specimen destination. Existing/About-approved artifacts are separate from the new optional proposal.

Services/Training specimen names and descriptions are explicitly marked as examples. Session dates remain unconfirmed and no fees/booking promises are made. Real links to company/product/contact routes are direct; specimen links never pretend to be actual service or event records. All founder names/credentials in the studies come from supplied facts.

Concept imagery reuses approved kitchen-film imagery. No fictional portrait is generated. Both founder photo spaces appear in both About treatments. Prototype notes identify the illustrative photographs and are outside the proposed application body.

## Approved selections and reconciliation

All three feedback files contain `preferred: A` and “Option A is the winner.” The zero star values are untouched defaults. The board's `publishedAt` is its publication timestamp, not the time the user submitted feedback. Exact evidence is saved beside this plan in `services-feedback.json`, `training-feedback.json` and `about-feedback.json`.

Two new decisions are recorded: Services A and Training A. About A reconfirms the earlier approved About B; it is not counted as a new design decision. Training A supersedes the initial recommendation of B. No new remedy is inferred from a next-step choice, a generic approval, or a score.

### Services A: The working kitchen

Retain the approved split opening: heading and enquiry on the left, close working photograph on the right. Eyebrow “Passe Culinaire · Services”; h1 “Start with the kitchen.”; supporting sentence “Tell us about your kitchen, your team and the work you want to do.” Primary action “Discuss your kitchen” links to `/contact`; secondary “Meet the founders” links to `/about`.

Follow with “A place to begin.” When no services are published, show “Service details are being prepared.” and the approved invitation to describe the kitchen. Your kitchen / Your team / Your priorities are enquiry prompts, not fabricated offerings. Published services replace this empty treatment with editorial catalogue rows using their real titles, summaries and detail links. Follow with supplied founder experience, then the restrained CulinAIre Kitchen continuation. Preserve the company’s wider scope.

### Training A: At the bench

Retain the intimate preparation photograph on the left and introduction on the right at desktop widths. Eyebrow “Passe Culinaire · Training”; h1 “Make room for the craft.”; supporting sentence “A place for culinary learning, grounded in the work of the kitchen.” Primary “Ask about training” links to `/contact`; secondary “Training enquiries” reaches the programme section in the empty state.

The empty programme reads “Tell us what you want to learn.” and “There are no upcoming training dates.” Its enquiry invitation names learning interests and who the training would be for. With published sessions, show actual upcoming rows and any archive, dates, timezone and statuses. Preserve existing detail routes and pagination. Founder backgrounds establish experience without promising either founder will teach a particular session. On phones, place the introduction and action before the photograph.

### About A: the previously approved B

Retain the exact prior accepted hierarchy and 4:5 portrait spaces from `../about-review/PLAN.md`: “From the kitchen, looking forward.” → “Two founders. Complementary experience.” → Alex portrait/biography → Rob portrait/biography → “Experience, put to work.” Normalising only local asset paths confirms that the selected main HTML matches the previous approved About B main HTML (SHA-256 c71e51b75a07d55c188c329e7b781b0212f29aa494f45a676f3e9ab8562c355d).

Use supplied Alex Charasse and Rob Angeles facts only. Keep the clearly labelled portrait spaces until genuine photographs exist. The earlier approved states, content mapping, custom-block preservation and guarded CMS update requirements stand. About B from this new board is not selected.

## Approved mockups

Common absolute root: `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/services-training-about-20261002/`. Approved HTML depends on adjacent `styles.css` and `assets/`; keep the folder together. Each manifest records file hashes, feedback and recording time. The earlier About manifest accurately records the time of that individual reconfirmation; it is not the final cross-page status.

| Page | Approved reference | Direction and constraint |
| --- | --- | --- |
| Services | `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/services-training-about-20261002/services/approved-a.html` | Working kitchen; `approved-a-1440.png` and `approved-a-390.png`, light companions; `approved-a-populated.html` is layout-only specimen |
| Training | `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/services-training-about-20261002/training/approved-a.html` | At the bench; `approved-a-1440.png` and `approved-a-390.png`, light companions; `approved-a-populated.html` is layout-only specimen |
| About | `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/services-training-about-20261002/about/approved-a.html` | Prior approved B; `approved-a-1440.png` and `approved-a-390.png`, light companions; real portrait spaces remain |

## Pass 1: Information architecture, 3/10 → 9/10

Finding: the current index pages repeat generic headings while offering little context for an enquiry. The user's exact A selections resolve the hierarchy and visual remedy. About retains its earlier approved structure. First-screen budget: company identity, the page's purpose, one clear primary action. Existing secondary links support that action. No new issues requiring a choice.

```text
Shared company header
  Services: kitchen enquiry + working photograph
    → published catalogue OR truthful enquiry prompts
    → founder experience → first offer → shared footer
  Training: craft introduction + preparation photograph
    → upcoming sessions OR training enquiry
    → archive if present → founder background → shared footer
  About: company introduction + signature mark
    → complementary founders → Alex → Rob
    → wider company work + first offer → shared footer
Navigation: Services/Training → Contact; all pages → About/product as shown
```

A 10 needs confirmed service and programme content, not another decorative section. This is a content limitation, not permission to invent it.

## Pass 2: Interaction states, 4/10 → 8/10

Finding: the old sparse empty listings undersell the company. Approved empty and populated studies resolve this; preserve the application's existing error, navigation and CMS contracts. The table records those existing/selected outcomes, without adding booking, forms or filters.

| Feature | Loading | Empty | Error | Success | Partial |
| --- | --- | --- | --- | --- | --- |
| Services catalogue | Server-rendered text; no new skeleton | Approved “Service details are being prepared” and enquiry prompts | Existing “This page is unavailable”, Try again and Return home | Real published rows and detail links; 12/page | One row retains natural space; absent summary omitted; no dummy media |
| Training programme | Server-rendered text; no new skeleton | Approved no-upcoming-dates message and enquiry | Same existing public error boundary | Upcoming rows and archive when present, existing pagination | Date to confirm for missing/invalid date; timezone/status text retained; sold out/cancelled not misrepresented as available |
| About founders | Text and reserved 4:5 image space arrive together | Approved labelled portrait spaces | Public error boundary for route failure | Genuine portrait and supplied biography | One portrait may be absent independently; longer biography grows without clipping |
| Editorial photograph | Reserved aspect ratio; text/action already visible | Keep composition readable without image content | No repeated network retry UI or blocked enquiry | Approved concept image crop | Missing image must not expose broken-image icon or collapse readable text |
| Links/menu/theme | Existing server HTML and functional links | No added empty-menu mode | Existing destination error state | Native links, current theme control and menu | Long labels wrap; mobile menu closes with Escape; links remain keyboard reachable |

All image failure, server error and CMS partial-content states must be verified in the actual implementation. Score is capped at 8 because the prototypes do not exercise application failure boundaries or real publication transitions. No new unresolved design choice.

## Pass 3: Journey and emotional arc, 2/10 → 9/10

Finding: visitors previously reached a dead-looking listing before seeing a reason to trust its authors. The selected compositions connect purpose, evidence and action. Expected emotions below are design hypotheses, not measured user-research results.

| Step | Visitor does | Intended feeling | Accepted support |
| --- | --- | --- | --- |
| 1 | Arrives from navigation or search | Oriented within five seconds | Exact identity, clear page heading, culinary image or signature mark |
| 2 | Scans current availability | Respected rather than misled | Truthful empty/programme states, no invented dates or services |
| 3 | Assesses relevant experience | Informed confidence | Named founders, precise supplied backgrounds, real portrait spaces |
| 4 | Explores or enquires | Knows a useful next action | Actual detail links when available; contact and About paths otherwise |
| 5 | Returns after content grows | Familiarity over time | CMS-driven rows, preserved URLs, stable hierarchy and themes |

Five seconds: see the company and purpose. Five minutes: inspect offerings, people and enquiry fit. Five years: preserve identity while real content and portraits replace incomplete states. A 10 requires observed chef/owner use and real evidence beyond a prototype. No new issues requiring a choice.

## Pass 4: Generic-design risk, 3/10 → 8/10

Classifier: PERSUADE for introductions and founder evidence; READ for catalogue/biography sections. The user's chosen editorial brand takes precedence over generic skill defaults for full-bleed heroes, texture, motion or replacement of Inter. No decorative motion is added.

Hard-rejection audit of selected designs: no SaaS card-grid first impression; identity remains visible next to imagery; primary action is explicit; text is not over busy photographs; sections each perform a different job; no carousel; no stacked app-card layout. Three Services enquiry prompts are plain contextual text, with no icon circles or false capability grid. No unresolved hard-rejection hit.

| Litmus | Answer | Evidence |
| --- | --- | --- |
| Brand unmistakable in first screen? | YES | Exact P/C mark, Passe Culinaire identity and Fraunces display |
| One strong visual anchor? | YES | Working kitchen / preparation photograph, or About signature mark |
| Understandable from headings? | YES | Purpose, availability, experience and continuation remain distinct |
| One job per section? | YES | Introduction, catalogue/status, evidence and onward path |
| Cards necessary? | NO | Selected designs use rules and natural rows |
| Motion improves hierarchy here? | NO | No interaction needs it; all content is immediately visible |
| Premium without shadows? | YES | No decorative shadows are part of the approved composition |

Residual limitation: the still-life photographs are illustrative, not documentary evidence of these founders or premises. About lacks genuine portraits. Keep this distinction in accessible image descriptions and avoid captions implying ownership. A 10 requires original photographic evidence; it does not justify reopening the selected composition. No new issues requiring a choice.

## Pass 5: Design-system alignment, 5/10 → 9/10

No root DESIGN.md exists; AGENTS.md and the approved About plan supply the actual explicit design contract. Another brand consultation would repeat already-settled choices. Reuse exact charcoal #141412, bone #F4F1EA, ink #1A1A18, linen #E8E4DA, moss #4A5A3F, clay #B8674B and ash #8A8A82 values through their existing semantic aliases. Preserve Fraunces display, Inter body and JetBrains Mono only where existing captions/data require it; local fonts only. Zero decorative radius, 1px muted rules, visible focus, maximum prose measure 62ch, no gradients or shadows.

Services/Training prototypes define a 1312px maximum container, 64px desktop gutters, 32px intermediate and 24px phone gutters. Split hero gap 80px desktop/40px intermediate, then stacked. Heading hierarchy and spacing follow the saved reference; normal body is at least 16px, display stays below 6rem. About uses the exact previously approved styles. Shared browser focus, selection, visited-link treatment and theme controls remain application responsibilities; do not replace them with prototype review controls.

New page-specific editorial components fit the existing vocabulary and avoid altering shared HeroBlock or collection-list styling everywhere. Score stops at 9 until computed application styles and all theme states match the references. No new issues requiring a choice.

## Pass 6: Responsive and accessibility, 6/10 → 9/10

Finding: desktop-only visual approval would leave cropping and reading order underspecified. The selected responsive studies, existing WCAG contract and verified phone crop resolve the specification. At <=800px stack the hero, let actions wrap, and place Training copy/action before the image. Services keeps copy before image. Keep the phone photograph near 4:3 with explicit height auto. At <=1100px use intermediate gutters/gaps; at desktop keep balanced columns without fixed text heights. About portraits remain 4:5, with both founders using photo-before-biography DOM order; CSS alternates the second founder at desktop only. At 1920px centre the capped reading/layout container.

Use one h1, logical headings, shared header/main/footer landmarks and existing skip link. Catalogue rows use ordinary descriptive links, never whole-row nested links. Preserve visible focus and dark/light contrast, 44px interaction targets, Escape dismissal and focus handling from the shared mobile navigation. Supplied biographies remain selectable HTML. Portrait placeholders must announce whose photograph is pending; real images use meaningful supplied descriptions. Concept photographs must not claim a real founder or workplace. No new motion; reduced-motion users receive the same content. Text must remain readable at browser zoom and when enlarged.

Prototype evidence covers six widths and dark/light automated accessibility scans; actual application keyboard traversal, screen reader reading order, 200% zoom, slow-image rendering, theme persistence and reduced-motion checks remain explicit T4 acceptance work. A 10 needs that implementation evidence. No new design choice is introduced.

## Pass 7: Decision register, unscored

| Finding/choice | Decision evidence | Disposition |
| --- | --- | --- |
| Services composition and visible copy | Services board preferred A and explicit winner comment | Apply exact A; new decision 1 |
| Training composition and visible copy | Training board preferred A and explicit winner comment | Apply exact A; new decision 2 |
| About composition/portrait spaces | About board preferred A; earlier approved B body match | Reconfirmed; zero new decisions |
| Existing brand, accessibility and public-content rules | User approvals and AGENTS.md | Carry unchanged |
| Populated specimens | Labelled review states and existing no-fiction rule | Layout evidence only; never publish specimen records |

No unresolved design decisions. No deferred TODO proposals. Unavailable real portraits and unpublished content have explicit approved treatments. Implementation mechanics and verification are tasks, not new visual decisions. The passes introduce no significant change to the selected studies, so regeneration is unnecessary.

## Prototype verification

`checks.json` at the artifact root records 60 page/state/viewport cases: ten compositions at 320/390/768/1024/1440/1920px. The script checks one h1, overflow, broken images and runtime errors. It also checks mobile-menu link count/Escape, dark/light Axe at 390/1440, and phone photograph proportions. Full-page dark/light screenshots are captured for those two sizes.

Parent visually inspected all six desktop compositions and representative phone/light views. This caught a tall mobile crop caused by image height attributes; CSS now explicitly sets image height auto, and the phone proportion check guards against recurrence. Final run: all 60 cases passed, zero Axe violations in all scanned dark/light states, no overflow/broken images/runtime errors. Results are recorded in `.local/three-page-review/checks.log` and artifact-root `checks.json`. All three feedback boards returned HTTP 200 and their radios/comment/submit controls and full-preview links were inspected in Chromium.

Generated anonymous raster explorations exist for Services/Training and received automated image-check passes. Parent inspection found invented detail/icon-grid patterns in those explorations, so they are **not** the approved or board reference. The locally authored HTML previews use exact existing identity, truthful content states and real supplied facts. Automated raster passes do not verify these HTML prototypes or the application.

No founder/company screenshot was sent for a fresh external review. No independent external design voice or application engineering pass is claimed. Full application lint/tests/build, preview/publication, performance, keyboard and media-state verification belong to implementation after design selection.

## Not in scope

- Application implementation or CMS publishing in this review: these are the next execution phase.
- New service scopes, prices, dates or teaching commitments: require real business content.
- Invented founder portraits, testimonials or awards: cannot supply credibility with fiction.
- Homepage, Journal, contact or global navigation redesign: separate accepted work, not this page-body selection.
- Booking, subscription and filter systems: no approved need in this scope.
- Deployment: local design approval does not deploy the application.

## Implementation tasks

Synthesised from the accepted findings. Parent owns architecture, integration, the full diff read, verification and acceptance. Use one bounded executor task per route, with non-overlapping file ownership; do not delegate plan edits. Confirm installed Next.js documentation before code changes. No new package is needed by this design.

- [ ] **T1 (P1, human ~3h / agent ~30min): Apply Services A.** Source: Passes 1–3, missing kitchen context and useful empty-state enquiry. Files: `src/app/(public)/services/[[...page]]/page.tsx`, `src/components/ServicesEditorial.tsx`, `src/components/ServicesEditorial.module.css`, `tests/services-index.test.tsx`. Preserve published query, title/id order, 12/page, safe URLs, canonical page-one redirect and invalid/out-of-range 404s. Reproduce approved empty/populated compositions using actual CMS data. Verify targeted Services tests and empty/one/many/long-title/absent-summary states.
- [ ] **T2 (P1, human ~3h / agent ~30min): Apply Training A.** Source: Passes 1–3, empty programme lacks craft context and an enquiry invitation. Files: `src/app/(public)/training/[[...page]]/page.tsx`, its `page.module.css` if superseded, `src/components/TrainingEditorial.tsx`, `src/components/TrainingEditorial.module.css`, `tests/training-index.test.tsx`. Retain upcoming/archive selection, pagination, date/timezone fallback and sold-out/cancelled/past labels. Reproduce A and its responsive text-before-image order. Verify targeted Training tests plus missing dates, archive-only, one/many and long titles.
- [ ] **T3 (P1, human ~5h / agent ~45min): Apply reconfirmed About A.** Source: current audit and prior approved About review, unimplemented portrait/biography hierarchy. Files: `src/components/AboutEditorial.tsx`, `src/components/AboutEditorial.module.css`, `src/components/BlockRenderer.tsx`, `src/app/(public)/[slug]/page.tsx`, relevant existing block/public-page tests. Follow `../about-review/PLAN.md` for exact founder mapping, portrait fallbacks, arbitrary-block preservation and guarded local content update. Never blindly reseed or overwrite unrelated CMS work. Verify both/one/no portraits, long biographies, draft/public boundaries and unchanged custom blocks.
- [ ] **T4 (P1, human ~2h / agent ~30min): Verify integrated pages and obtain independent review.** Source: Passes 2, 5 and 6, prototype evidence cannot accept application integration. Files: `tests/e2e/` and this review's evidence folder. After each executor returns, parent reads full diff and reruns `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, then invokes reviewer; fix-first requires re-review. Browser-check all three selected layouts at 390/768/1440px, both themes, keyboard/zoom/reduced-motion, error/image fallbacks, empty/populated/long-content states and meaningful links. Verify CMS freshness within 60 seconds and preview isolation when affected. Run relevant performance checks against existing budgets. Save actual outputs and screenshots. Never count this review as application acceptance.

Task export: `tasks.jsonl` beside this plan and the timestamped `tasks-design-review-*.jsonl` in the project gstack directory. No additional tasks arise from the unchanged brand or decision register. No TODOS.md changes are needed.

## Completion summary

| Dimension | Before | Approved specification | Evidence/limit |
| --- | --- | --- | --- |
| System audit | No DESIGN.md | Existing AGENTS.md and accepted plans | Explicit brand contract retained |
| Initial page impression | Services 2; Training 2; About 3 | Separate from pass score | Current application is still unchanged |
| Pass 1: information architecture | 3 | 9 | Exact A hierarchy and paths |
| Pass 2: states | 4 | 8 | Truthful empty/populated/partial/error specification; app verification pending |
| Pass 3: journey | 2 | 9 | Accepted journey documented; no measured conversion claim |
| Pass 4: generic-design risk | 3 | 8 | Culinary specificity; genuine photography remains a limit |
| Pass 5: design system | 5 | 9 | Exact brand and saved compositions |
| Pass 6: responsive/accessibility | 6 | 9 | 60 prototype cases; implementation manual checks pending |
| Pass 7: decisions | Unscored | 2 new, 1 reconfirmed, 0 deferred | Actual per-page feedback |
| Overall, minimum of six passes | 2 | 8 | Design-complete, not implemented |

Six main browser studies, three selected references, four populated companion studies. Scope exclusions and existing contracts recorded. Zero deferred TODO proposals. About retains its prior independently recorded specification scores (9/8/9/8/9/9); current review does not supersede that exact approved body.

## Engineering review, 2 October 2026

Target and report: this Services/Training/About plan. The user's “Let's go” follows the offered engineering review. All three A selections, the prior About copy/CMS requirements and AGENTS.md remain binding. This review changes the implementation specification only. No application files or CMS records were changed.

### Scope challenge and evidence

Scope accepted as-is. This is a presentation change, not a new content system. Retain three page-specific server components with CSS modules, the existing routes and the About BlockRenderer integration. There are 15 named core source/test files, plus bounded content-update, browser-test and static-image support. No new classes, backend services, endpoint, dependency, schema or migration is needed. Future files have no history and are not treated as existing implementations.

A smaller arrangement could put all page markup into the three routes and one shared stylesheet, but would make About preservation and independent ownership harder. Retain the original page-specific arrangement; this is a routine implementation choice within the approved work, not a feature cut or new approval gate. Sequence implementation to simplify integration and comply with the parent-owned verification requirements. No user-visible scope is removed.

Existing route history includes initial editorial routes, public loading improvements and the C4 identity; no revert of these paths was found. No TODOS.md exists. The installed Next.js 16.3.6 server/client and previous-cache-model guides were read. Existing project primitives already solve the work [Layer 1]; no new architecture/concurrency pattern requires web research. Aside is absent; host web tools remain available if a new external dependency question arises. Brain cache is unavailable; local plans and project-scoped learnings supplied context. AGENTS.md already provides Codex routing, so the generic skill onboarding does not justify an unrelated CLAUDE.md change.

Prior learnings retained: `payload-hooks-before-commit` (9/10, 25 September) and `c4-rsc-css-budget` (10/10, 26 September). Reuse request-bound publication jobs and external stylesheets. Do not turn a page-level design into a client-rendered application or inline all CSS.

### Architecture review

No new unresolved architecture issue. The design already requires preservation of public queries, CMS blocks, editable biographies, preview and guarded copy updates. The following specifies those accepted requirements against actual source, rather than proposing new business behaviour.

1. **Services:** `getRouteModel` and `getServicesListing` remain route-owned. Retain limit 12, title/id sorting, React request memoisation, safe paging and RouteSchema/metadata. Pass typed published data into ServicesEditorial. Preserve the filtering and safe URL behaviour currently in ServiceListBlock without modifying that shared block globally. Display title, oneLiner and whoItIsFor when supplied; the layout sample's shorter row does not authorise dropping CMS audience content.
2. **Training:** retain the two bounded queries, one shared date bound, maximum totalPages, end-date handling and status interpretation. Keep `formatDate`, `isPublishedEvent` and safe link rules intact when moving the event presentation. A lightweight React-node slot from the route into TrainingEditorial can retain EventList and its existing stylesheet in place; no general-purpose listing abstraction is needed. The enquiry and archive blocks remain server-rendered.
3. **About:** add an optional `about` presentation flag to BlockRenderer, passed only for slug `about`; keep `home` behaviour unchanged. Specialise the leading hero and contiguous founder groups through AboutEditorial. Use the same ordered loop as today; never filter/reassemble the entire layout into “hero, founders, everything else”, which would reorder custom blocks. Every unconsumed block goes through the existing exhaustive switch. Fallback h1 and later-hero h2 behaviour remain intact. If editors remove a hero or all founders, retain their edited content instead of inventing replacement biographies.
4. **About content:** existing hero eyebrow/heading/summary, founder name/title/bio/links, prose and product/CTA blocks suffice. Bind visible text to those fields. Keep role and credential emphasis in editable text/rich text rather than parsing names or hardcoding founder-specific branches. Reuse RichText for biography formatting and safe links. A scoped About continuation may restyle the existing product/CTA block data; retain every populated field and real destination.
5. **Portraits:** use `isRenderableMedia` from ResponsiveMedia plus the existing `Media.placeholder` flag. The current seeded portrait is structurally valid media, so validity alone would still show PLACEHOLDER 10. Render the approved named 4:5 space when media is absent, unresolved, invalid or explicitly marked placeholder. Do not suppress a genuine photograph by matching a filename substring. Real media retains focal coordinates, variants, captions/credits and alt text. A failed network image must preserve the frame and readable name/alt; do not claim a server validator can detect an HTTP failure in the browser.
6. **About local update:** adapt the existing contact updater's local-target guard, draft/published comparison, full backup with exclusive creation and final reread. Build an exact old-to-approved content transform; update only the seeded About layout or recognise an already-applied no-op. Any custom layout or unpublished work makes the script refuse, leaving presentation changes safe and current content intact. Keep unknown block fields, IDs, real portraits and unrelated page fields. Never use `pnpm seed` to overwrite the page. Rechecking is not an atomic compare-and-swap: run this local one-off update with editorial writes quiescent, retain the backup and verify afterward. Do not market this mechanism as safe for concurrent production publishing. Deployment/data migration is outside this review.

```text
/services[/page/N]
  params -> validation -> redirect page 1 / 404 invalid
  -> getServicesListing -> listPublicContent (published/access checked)
  -> ServicesEditorial(empty | catalogue) + Pagination + RouteSchema
/training[/page/N]
  params -> validation -> redirect / 404
  -> shared now -> [upcoming query || archive query]
  -> published filter -> date/status/safe-link formatting
  -> TrainingEditorial(programme | enquiry, archive?, pagination?)
/about
  slug -> getPageViewModel -> getRequestDocument
    public -> access-checked published cache
    authenticated preview -> uncached staff draft query
  -> getBlockContent (only requested feeds; bounded)
  -> BlockRenderer(about=true, original editorial order)
    first hero -> About opening
    founder run -> About founders (portrait | labelled space)
    all other blocks -> existing switch, themed only when appropriate
  -> existing metadata / public JSON-LD / preview notice
All required read failures -> existing public error boundary, not an empty catalogue
```

Distribution: components/CSS compile through the current Next.js build and Node deployment. Copy the two approved compressed stills into a tracked public asset directory so the application never depends on a user's home directory or port 4190. Fonts and mark already ship locally. No external font/script host is introduced. No install channel or new service is needed.

### Code quality review

No new unresolved code-quality issue. Reuse `safePublicHref`, `isRenderableMedia`, ResponsiveMedia, RichText, Pagination, RouteSchema, existing public projections and the local-target/content comparison helpers. Do not duplicate the media validator from FounderCardBlock in new code. Proposed About and current FounderCardBlock have related rendering but different placeholder/hierarchy contracts; keep their presentation separate. Services and Training have different date/archive/query contracts, so visual similarity is insufficient reason to invent a generic “EditorialListing” with mode flags. No speculative extraction or savings claim.

The primary regression risks are already covered by approved T1–T4: losing custom About blocks, showing draft records, dropping service audience text, changing training availability rules, and overriding real portraits during the local update. Tests must protect each in the same implementation change. Avoid touching shared global tokens, homepage rendering or the navigation selection. No stale inline architectural diagram was found in the inspected entry points; the flow above is the relevant design record.

### Test review

Detected framework: Vitest 5, Node environment, React server-markup assertions; Playwright with desktop/phone projects and Axe; isolated quality database runner. Existing targeted baseline actually run:

`pnpm exec vitest run tests/services-index.test.tsx tests/training-index.test.tsx tests/block-renderer.test.tsx tests/cms-page.test.tsx tests/responsive-media.test.tsx tests/page-view-model.test.ts tests/request-content.test.ts tests/public-content.test.ts tests/pagination.test.tsx`

Result: **9 files passed, 43 tests passed**, 441ms. This is current-behaviour evidence only. Proposed components and updater are not built and cannot have passed tests yet. No full build, new acceptance suite or performance benchmark was run during this review.

Legend: ★★★ = behaviour with edge/error coverage; ★★ = happy-path behaviour; GAP = future proof already required by the approved plan; →E2E = browser/integration path. Groups below are an audit map, not instrumentation-derived coverage percentages.

```text
CODE PATHS                                    USER FLOWS
Services route                               Visitor opens Services
  ★★★ params/redirect/range                    ★★ server heading + empty enquiry
      tests/services-index.test.tsx                tests/services-index.test.tsx
  ★★ published rows + detail URL               GAP →E2E approved A, contact, detail,
  ★★ paging + metadata                             pagination, phone/light/dark
  GAP mixed draft/malformed/blank/              GAP long title/one/12 entries and
      optional-audience rows in new view            image failure in browser
Training route                               Visitor opens Training
  ★★★ query bounds/status/date partitions      ★★ empty + archive + contact
      tests/training-index.test.tsx                tests/training-index.test.tsx
  ★★★ pagination/redirect/range                 GAP →E2E text before image on phone,
  ★★ missing date / cancelled / past                real detail links and pagination
  GAP invalid timezone/date, sold-out,          GAP archive-only page without a
      no safe slug, draft exclusion in view         false programme claim
CMS About                                    Visitor assesses founders
  ★★★ slug/missing page/preview metadata        ★★ current CMS text in HTML
      tests/cms-page.test.tsx                       tests/cms-page.test.tsx
  ★★★ first/later/no hero and every block       GAP →E2E exact A layout, both portrait
      tests/block-renderer.test.tsx                spaces, real/one/missing/broken photos
  GAP about-specific grouping keeps all        GAP →E2E keyboard/zoom/themes and
      custom blocks in original order              product/contact destinations
  GAP two independent founder runs, zero/one/
      many founders, rich text, safe links
Media                                        Slow or broken photo
  ★★★ variants, dimensions, alt, unsafe        GAP →E2E geometry/alt/name remain
      names, priority; responsive-media.test       readable after failed image request
  GAP About placeholder flag + actual photo
Public reads                                 Staff edits and previews About
  ★★★ published access and private preview     GAP →E2E approved copy commit -> worker
      public-content / request-content tests       -> fresh public HTML within 60 sec
  ★★★ feed batching/failure propagation        GAP →E2E anonymous visitor never sees draft
      page-view-model.test.ts
Local About updater                          Maintainer applies local copy once
  GAP baseline -> backup -> reread -> update    GAP isolated integration proves actual
  GAP already applied -> zero writes               update + no-op + normal job/invalidation
  GAP custom layout/draft/change -> refuse          (no production DB use)
  GAP backup failure -> no write; cleanup
```

The planned proof falls into six groups: Services presentation/row boundaries; Training formatting/status boundaries; About mapping/custom blocks; About portrait states; local updater safety; integrated visual/publication flows. All are necessary proof of already-approved contracts, not a new request for optional test scope. Existing tests must keep their behavioural assertions; update wording assertions only for intentionally changed selected copy.

Use `tests/services-index.test.tsx` and `tests/training-index.test.tsx` for route conditions and HTML; `tests/block-renderer.test.tsx` and `tests/cms-page.test.tsx` for About dispatch/order/preview; add `tests/about-editorial.test.tsx` for portrait and heading contracts and `tests/about-content.test.ts` for the pure content transform and updater guard/no-op cases. A separate `tests/e2e/company-pages.spec.ts` covers all three real page compositions and link journeys using isolated published fixtures. Keep the existing seed-route core suite valid: the approved About copy must be set up explicitly in the new suite, not assumed to appear merely because CSS changed. Restore test fixtures and never publish specimen services/events in the user's database.

No form submission or application mutation exists on these page bodies. Rapid clicks and back navigation use native links; no new debounce, cancellation or multi-tab state machine is required. Slow DB reads use existing server response/error handling. LLM/eval scope is not applicable: no prompt, model call or tool definition changes.

### Performance review

No new unresolved performance issue. Keep all presentation server-rendered with no page-wide `use client`, new runtime package or additional biography query. Services remains one bounded listing read; Training remains two concurrent bounded reads; About reuses one page model and existing needed feeds. Preserve React memoisation between metadata and route rendering and existing public-cache tags. The route's 600-second revalidate is not the freshness guarantee: the existing after-commit invalidation supplies the <=60-second publication contract.

Use external scoped stylesheets. Reserve 4:3 phone stills and 4:5 portraits to prevent layout movement. Do not load all full-resolution film frames for these two static images; serve responsive compressed variants where useful, lazy-load below-fold portraits, and use high priority only for the first visible hero image. Keep the film unchanged. Run existing quality budgets after integration; retaining server components reduces risk but does not prove the <160kB home JavaScript and <=2.6s LCP ceilings. No claimed measurement for the future pages.

### Failure modes and required acceptance

| Path | Realistic failure | User outcome and required proof |
| --- | --- | --- |
| Services | Listing read fails | Public error boundary with retry/home; never falsely claims no services |
| Training | Invalid date/timezone or archive-only later page | Date to confirm / Melbourne fallback; existing archive/pagination remains usable |
| About mapping | Custom block inserted between founders | Block remains in place; no silent discard or reordering; server-markup regression |
| About media | ID unresolved, placeholder flag, invalid metadata, HTTP failure | Named portrait space or reserved frame/readable alt; browser failure check |
| Local updater | Draft/custom layout or change observed before update | Refuse and preserve data; backup failure forbids mutation; isolated guard tests |
| Publication | Job does not run after update | Acceptance fails on stale public HTML; inspect existing job worker, do not lower 60s target |
| Shared CSS/shell | Styles bleed into homepage or another route | Scope styles; existing home/contact/Journal tests and budget checks remain gates |

Zero unhandled silent critical gaps remain in the plan: each risk has a named handler/fallback and required verification. Actual implementation failures remain possible until tested.

### Decision ledger and approval readiness

- E1, page architecture: exact Services A and Training A feedback plus accepted plan T1/T2; retain page-specific server presentation and current route contracts. No feature cut. File organisation resolved as a routine implementation detail under the standing authorisation.
- E2, About content and arbitrary blocks: earlier About B approval, current About A reconfirmation and `../about-review/PLAN.md` content constraints; use existing CMS schema, selective ordered rendering and guarded local content update. No hardcoded biographies or automatic overwrite of custom content.
- E3, verification: AGENTS.md plus approved design T4 require regression checks, all four commands, independent diff review and browser acceptance. This review specifies the necessary assertions; it does not reopen whether they are needed.
- E4, images and performance: accepted brand/media/budget contracts; tracked compressed stills, explicit placeholder flag, standard media validation and scoped external CSS. No new external service or package.

Approval readiness: PASS for E1–E4; actual references are the saved per-page feedback, prior About approval and standing AGENTS.md contracts. No unresolved user-facing tradeoff, cut, guarantee increase or new business policy was introduced. No new TODO proposal. Lake score: N/A, zero new answered coverage-choice questions.

### Implementation sequence and task refinements

Retain design tasks T1–T4; the implementation source references below supplement their file lists and acceptance criteria.

| Step | Modules touched | Depends on |
| --- | --- | --- |
| T1 Services A | Services route, its dedicated presentation/CSS, Services tests, Services still asset | Approved reference |
| T2 Training A | Training route, its presentation/CSS, Training tests, Training still asset | Approved reference; execute after T1 acceptance |
| T3 About A | Generic CMS route, BlockRenderer, About presentation, guarded content-update scripts/tests | T2 acceptance; sequential due shared-renderer regression risk |
| T4 integration acceptance | Browser tests, isolated fixtures, performance and evidence | All three implementations |

Use sequential executor tasks with explicit file ownership, acceptance criteria and test commands. A reviewer remains independent after each return; parent owns the full diff read, integration and acceptance. Although Services/Training could run in separate lanes, sequential work avoids shared verification/build contention for this small three-page update. No new worktree infrastructure is required. Do not let a worker change this plan, AGENTS.md or another worker's files.

T3 adds `scripts/about-content.ts`, `scripts/apply-about-design.ts`, `tests/about-content.test.ts` and `tests/about-editorial.test.tsx` as bounded support for the already-approved update. The parent must inspect current local draft/published content and prove the updater's guard before running it. Content incompatibility blocks that data update only, not the independent Services/Training implementation. Add `public/images/company-pages/` assets for the two approved stills. T4 adds `tests/e2e/company-pages.spec.ts` with isolated fixtures. No global seed rewrite is authorised.

Estimates remain approximately 3h human/30min agent each for T1/T2, 5h/45min for T3, and 2h/30min for integration; verification and review turnaround can extend elapsed time. These are planning estimates, not a time promise.

### Suppressed findings and limits

No speculative source bug is promoted. A guarded read/reread updater has a concurrent-write window; the plan explicitly restricts it to a quiescent local application and refuses observed independent edits. It is not a production migration. Real-media HTTP failure and future component correctness are acceptance work, not observed failures. No test pass is claimed for new code, DB content, full application build or future performance.

### Outside voice and approval-review result

Claude Code was available and the skill's outside-review switch was enabled. The requested read-only command would have supplied a bounded technical plan/source prompt with `--access none` and a five-minute timeout. Automatic approval review rejected the command before it ran: exporting internal engineering plans and source excerpts to a destination not established as trusted was not specifically authorised. No outside process or payload transmission occurred. No bypass or provider substitution was attempted.

The prescribed native fallback requires declared Plan/TaskOutput/TaskStop capabilities; those are not available in this host. A generic agent is not substituted for that unavailable fallback. Outside coverage is therefore unavailable, not a pass. The user has been offered an explicit optional export choice; no answer is inferred. Local engineering review and implementation planning can finish without it, because this skill says missing outside coverage is non-blocking.

### Engineering completion summary

| Item | Result |
| --- | --- |
| Scope challenge | Accepted as-is; routine page-specific file arrangement retained |
| Architecture | 0 new unresolved issues; existing contract mapped to server/CMS/media paths |
| Code quality | 0 new issues; existing primitives reused, no generic-listing framework |
| Tests | Branch/user-flow diagram produced; six future proof groups carried from approved T1–T4; 43 existing tests passed |
| Performance | 0 new issues; current query/cache/asset budgets retained, future measurements required |
| Failure modes | 0 unhandled silent critical gaps in the plan |
| Scope/existing systems | Recorded in design and engineering sections |
| TODO proposals | 0 |
| Execution | Three sequential page tasks, then integrated acceptance; parent owns all review and verification |
| Outside reviewer | Claude Code unavailable after automatic approval rejection; no native fallback available |
| Unresolved implementation decisions | 0; optional external-export answer does not change accepted implementation contracts |
| Lake score | N/A; zero new answered coverage-choice questions |

The existing 43-test run covers the current application. No code, content update, new test suite or benchmark was built in this review. The local engineering plan is ready to implement; independent diff review and actual application acceptance remain required. Test plan: `TEST-PLAN.md`, also exported to the gstack project directory for QA discovery. Task export: `engineering-tasks.jsonl` and the timestamped gstack copy.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
| --- | --- | --- | --- | --- | --- |
| CEO Review | Earlier company/visual review | Company scope | 1 historical | Recorded complete_with_concerns; not rerun | Standing scope retained; no product expansion |
| Design Review | plan-design-review | Three complete page designs | 3 scope checkpoints, 7 total records | CLEAR (FULL), accepted content retained | All A; minimum score 8/10; 2 new selections and About reconfirmed |
| Eng Review | User “Let's go” after engineering next step | Implementation plan, CMS and regressions | 1 for this scope, 3 total | CLEAR (PLAN), local review | 0 new plan issues, 0 unresolved implementation decisions, 0 silent critical gaps; six required proof groups specified |
| Outside Voice | Engineering skill standard step | Independent technical challenge | 1 rejected command, 0 completed | UNAVAILABLE | Host codex; intended provider claude-code; automatic approval review rejected repository export; no native fallback capabilities |
| Current-behaviour tests | Bounded review evidence | Existing route/render/media/publication interfaces | 1 | 43 tests passed in 9 files | Future implementation is not tested by this run |
| Prototype QA | Design review | Approved responsive references | 1 final suite | 60 cases passed | Prototype evidence only |
| DX Review | Not triggered | No developer-facing interface change | 0 | Not applicable | No tooling/API product scope |

OUTSIDE COVERAGE: No independent outside engineering review completed. Automatic approval review rejected the optional plan/source export to Claude Code; no payload was sent. The separate optional export question remains unanswered and is not treated as permission. This does not block the local plan review or remove the implementation's required diff review.

VERDICT: DESIGN + LOCAL ENG CLEARED for implementation planning. Build the three approved page designs, preserve the recorded contracts, then complete actual application checks and independent diff review. No website update or deployment was performed in this review.

NO UNRESOLVED DECISIONS
