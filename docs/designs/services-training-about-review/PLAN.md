# Services, Training and About: full-page design review

2 October 2026, Australia/Melbourne. Target: `/services`, `/training`, `/about`. Branch/base: main; no remote configured. Status: initial audit and browser studies prepared; About A explicitly reconfirmed; Services/Training direction feedback pending. No application changes.

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

## Existing application contracts to retain

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

| Page | A | B | Current recommendation |
| --- | --- | --- | --- |
| Services | The working kitchen: close working photograph, clear conversation CTA, useful enquiry prompts and concise founder evidence | The practice folio: more typographic weight, narrower photograph and compact ledger-like structure | A, for its stronger kitchen context and distinct first action |
| Training | At the bench: intimate craft photograph beside heading and enquiry action | The training prospectus: broad craft photograph followed by clearly separated availability/programme | B, for its photographic composition and useful transition into session listings |
| About | The previously approved B: signature mark, alternating upright portrait spaces and supplied biographies | A closer introduction: shorter opening, larger square desktop portrait spaces and reduced repetition | A explicitly selected: “Option A is the winner” |

Each folder contains `a.html`, `b.html`, full desktop/phone screenshots and `board.html`. Services and Training also contain `a-populated.html` and `b-populated.html`, plus a clearly labelled specimen destination. Existing/About-approved artifacts are separate from the new optional proposal.

Services/Training specimen names and descriptions are explicitly marked as examples. Session dates remain unconfirmed and no fees/booking promises are made. Real links to company/product/contact routes are direct; specimen links never pretend to be actual service or event records. All founder names/credentials in the studies come from supplied facts.

Concept imagery reuses approved kitchen-film imagery. No fictional portrait is generated. Both founder photo spaces appear in both About treatments. Prototype notes identify the illustrative photographs and are outside the proposed application body.

## Proposed page structures, awaiting feedback

Services: company identity → kitchen enquiry hero → availability/catalogue → practical enquiry prompts when empty → supplied founder experience → CulinAIre Kitchen continuation.

Training: company identity → culinary craft introduction → availability or upcoming sessions → past/cancelled sessions when present → founders' backgrounds. Empty enquiries do not promise a course launch or waitlist.

About A is explicitly reconfirmed: retain the prior accepted hierarchy and 4:5 portraits. About B is not selected. Normalising only the local asset paths confirms the selected main HTML exactly matches the previously approved About B main HTML (SHA-256 c71e51b75a07d55c188c329e7b781b0212f29aa494f45a676f3e9ab8562c355d).

No application implementation task adopts these new remedies until selection. The detailed seven-pass review and remedy decisions follow the board feedback; this document records the audit and choices, not a completed review of an approved new design.

## About feedback and review reconciliation

The About board saved `preferred: A` and “Option A is the winner.” The zero star values are untouched defaults, not negative ratings. Neither Services nor Training has a `feedback.json` or `feedback-pending.json`; do not infer their choices from this submission.

The exact prior About decisions and all seven recorded passes in `../about-review/PLAN.md` remain valid. Current checks confirm the approved body is unchanged, both portrait spaces remain present, and the preview works across six widths with dark/light scans. Information architecture 9, interaction states 8, journey 9, generic-design risk 8, token alignment 9 and responsive/accessibility specification 9 remain the prior **specification** scores, not claims about an implemented page. Overall specification minimum: 8/10. No new About remedy or unresolved About choice is introduced.

`about/approved.json`, `about/approved-a.html` and the corresponding desktop/phone/light screenshot copies record this explicit reconfirmation. The application remains unchanged. Services and Training review completion awaits their own feedback.

## Prototype verification

`checks.json` at the artifact root records 60 page/state/viewport cases: ten compositions at 320/390/768/1024/1440/1920px. The script checks one h1, overflow, broken images and runtime errors. It also checks mobile-menu link count/Escape, dark/light Axe at 390/1440, and phone photograph proportions. Full-page dark/light screenshots are captured for those two sizes.

Parent visually inspected all six desktop compositions and representative phone/light views. This caught a tall mobile crop caused by image height attributes; CSS now explicitly sets image height auto, and the phone proportion check guards against recurrence. Final run: all 60 cases passed, zero Axe violations in all scanned dark/light states, no overflow/broken images/runtime errors. Results are recorded in `.local/three-page-review/checks.log` and artifact-root `checks.json`. All three feedback boards returned HTTP 200 and their radios/comment/submit controls and full-preview links were inspected in Chromium.

Generated anonymous raster explorations exist for Services/Training and received automated image-check passes. Parent inspection found invented detail/icon-grid patterns in those explorations, so they are **not** the approved or board reference. The locally authored HTML previews use exact existing identity, truthful content states and real supplied facts. Automated raster passes do not verify these HTML prototypes or the application.

No founder/company screenshot was sent for a fresh external review. No independent external design voice or application engineering pass is claimed. Full application lint/tests/build, preview/publication, performance, keyboard and media-state verification belong to implementation after design selection.

## Not in scope

Application implementation, CMS edits or publishing; service prices/scopes or teaching commitments; generated founder likenesses; homepage/Journal/contact redesign; global navigation implementation; booking/subscription/filter systems; remote deployment.

## Implementation tasks

New Services/Training tasks below are proposals, blocked on their individual design selections. About tasks already authorised by the earlier design are preserved in `../about-review/PLAN.md`; this review does not cancel them.

- [ ] T1, P1: Services presentation and integration after selection. Reuse the published listing contract; handle empty, one, many and no-media states. Likely files: Services index route, a dedicated editorial component/CSS and relevant route tests. Human ~3h / agent ~30min. Acceptance: selected current/populated compositions, correct pagination and safe public content, shared gutters and themes.
- [ ] T2, P1: Training presentation and integration after selection. Likely files: Training index route/component/CSS and relevant tests. Human ~3h / agent ~30min. Acceptance: selected current/populated compositions, dates/timezones/statuses and archives retained; no false booking action; correct pagination.
- [ ] T3, P1: Apply reconfirmed About A, identical in content to previously approved About B. Existing tasks, portrait states, CMS/custom-block preservation and guarded local content-update requirements remain in the About plan. Human ~5h / agent ~45min.
- [ ] T4, P1: Application acceptance after implementation. Parent owns integration/verification and reads full diffs; rerun `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, independent reviewer, real browser testing and relevant performance checks. Human ~2h / agent ~30min. Do not treat prototype evidence as application acceptance.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
| --- | --- | --- | --- | --- | --- |
| Initial page audit | User-named Services/Training/About | Inspect current credibility and composition | 1 | Complete | Services 2/10, Training 2/10, current About 3/10; prior About B unimplemented |
| Prior About design | Earlier explicit B selection | Retain exact accepted direction | 1 prior | Explicitly reconfirmed | User chose new About A; prior B body verified unchanged; optional refinement not selected |
| Browser studies | Current plan-design-review | Make new choices concrete | 1 set | Awaiting feedback | Two directions per page, real empty states and labelled populated examples |
| Anonymous raster checks | Designer tool | Exploratory composition screening | 2 | Passed, limited evidence | Parent rejected generated content details; not final HTML verification |
| Engineering | Future application changes | CMS/query/media correctness | 0 for these changes | Not started | No application changes |

OUTSIDE COVERAGE: Automated checks of anonymous exploratory images only. No outside final-HTML design review or independent application review claimed.

VERDICT: Audit and comparison boards ready. Services/Training choices pending; previously approved About B remains accepted. Detailed review and eng review required before new application acceptance.

**UNRESOLVED DECISIONS:**
- Services direction and visible proposed copy: A or B, with user feedback.
- Training direction and visible proposed copy: A or B, with user feedback.
