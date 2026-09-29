# Journal page design review

29 September 2026. Status: A selected with the requested newest-post hero and four-post masonry revision. Preview updated; application unchanged.

## Scope and existing approvals

The user explicitly requested a plan-design-review of `/journal`. Review the whole index composition, including its real empty state, eventual populated layout, responsive behaviour and connection to the company. Carry forward approved navigation A, exact P/C monogram, lowercase Fraunces identity, charcoal default and existing footer. About B remains approved separately. This review does not reopen either choice.

The current page returns HTTP 200 and contains only Journal, “Notes from our work in kitchens.”, Journal entries, and “There are no journal entries to read yet.” No entries are currently published. The empty state must remain truthful; no sample content may enter the CMS or public site.

## Audit

Initial design assessment: 3/10. The generic quiet hero consumes much of the page before a repeated heading and bare empty sentence. Hero, feed and footer use different alignment rules. The page offers little editorial character or useful onward direction when empty. The identity exists in the shared header, but the main composition does little to support it.

Evidence: `.local/journal-review/before-desktop.png`; current route and listing source; actual browser content inspected at `http://127.0.0.1:3000/journal`.

Existing components/contracts to reuse:

- `JournalListing.tsx`, `JournalFeedBlock.tsx` and CSS, `EditorialSection`, `ResponsiveMedia`, `RichText`, `Pagination`.
- `getJournalListing`: published content access, newest-first sorting by publishedAt then id, 12 entries per page, taxonomy and author routes, path-based pagination and missing-page handling.
- Route metadata, breadcrumbs, author schema, noIndex rules and public-author privacy.
- Existing dates, excerpts and optional media. Missing images must not cause broken frames; missing metadata must be omitted, never invented.
- `PublicShell`, header A's separately approved plan, existing footer and ThemeControl. Preview shell is illustrative; application data remains CMS-driven.

## Direction decision

| Direction | Intent | Tradeoff |
|---|---|---|
| A: The culinary journal | **Selected and revised.** Charcoal magazine composition, newest post in the lead photograph/story hero, next four posts in a two-column masonry layout. | Strong image/text balance and continuity with the site; needs good imagery to reach its best. User-selected. |
| B: The working notebook | Type-led entries with a narrow photographic margin on desktop; clean reading list on mobile. | Strongest when writing is the asset; less visually immediate for a culinary audience. |
| C: The house review | Warm paper-toned reading surface, panoramic opening photograph and editorial story layout. | Most like a printed publication; introduces a deliberate light section within the charcoal site. |

Each study includes an empty state and a populated specimen state, linked by a preview-only toolbar. Each empty state states that no entries are published and offers About/CulinAIre Kitchen as onward paths. A’s empty-state composition is retained with the selected direction. Real articles must use their own supplied media; prototype photographs never become default images for unrelated articles. No promise of publication timing, subscription, invented issue number or fabricated author appears.

The five titles/excerpts are explicitly labelled layout specimens. “Author name · Publication date” marks the metadata placement without inventing identities or dates. Article links lead to a clearly labelled specimen page, not fake article routes. The photographs reuse approved kitchen-film concept assets, not photographs asserted to document the founders or their premises. These prototype assets must never substitute for missing article media; the selected empty-state visual is separate from real article content.

## Submitted feedback and revision

The board selects A and states: “I like option A but instead of 2 post for the masonry grid layout, let's do 4 and the most latest will be the one in the hero like how it is laid out here”. Star values are untouched zero defaults, not negative ratings.

Accepted outcome: newest published entry in the existing hero composition; the next four distinct entries below, in two masonry columns on desktop and one chronological column on mobile. Four means total secondary posts, not four columns. No duplication of the hero among the four. The existing newest-first publishedAt/id ordering supplies this automatically; no featured-post CMS field or manual curation is introduced.

The revised specimen moves its two compact entries into the four-post layout, adds relevant concept image placements and leaves the hero geometry intact. Five unique posts are shown. With fewer published posts, render only those available. With more than five, preserve access to older entries and the existing pagination; never truncate published results merely to match the specimen. Round-one HTML, screenshot, board, checks and feedback are archived with the `round-1-` prefix.

## Seven-pass review

### 1. Information architecture: 3 → 8/10

```text
Approved header A
Journal + existing description
Newest published entry: image / title, excerpt, metadata, link
Next four published entries: two-column masonry
Older entries and existing pagination when present
Existing footer
```

Each article occurs once. Empty state uses the selected A photograph/text composition, truthful status and company/product paths. Other feed-block instances retain their existing content hierarchy. No further design issue found.

### 2. States: 5 → 8/10

| State | Visitor sees |
|---|---|
| Populated | Newest hero, up to four following stories, then remaining results/pagination if needed |
| One entry | Hero only; no empty Further reading section |
| Two to four entries | Hero plus available followers; no filler cards |
| No published entries | Selected truthful empty state and onward links |
| Missing media | Text-led entry; no broken image, empty image slot or unrelated sample photo |
| Missing excerpt/date/author | Existing valid content only; omit absent metadata |
| Long text | Wrapping heading/excerpt, no fixed-height clipping |
| Loading/error | Existing server-route loading/error contract; no fake posts or new skeleton introduced |
| No JavaScript | Server-rendered links and readable two-column grid, one column on mobile |

Masonry must retain DOM reading order, stable image dimensions and visible focus; it must not make text client-only. The prototype uses a small ResizeObserver enhancement, with a normal grid fallback. Engineering may choose an equivalent implementation that preserves these outcomes. No unresolved design tradeoff found.

### 3. Journey: 4 → 8/10

| Step | Reader does | Intended feeling | Design support |
|---|---|---|---|
| Arrives | Recognises house and Journal | Familiarity | Approved header and existing introductory sentence |
| Scans | Finds the newest writing | Clarity | A single automatic lead entry |
| Explores | Compares four further entries | Interest | Photography, category, title, excerpt and real metadata |
| Reads | Follows a title | Confidence | Real published entry route and descriptive link |
| Finds no entries | Understands status and continues | Orientation | Honest empty message and company/product links |

Five seconds: identify the Journal and lead. Five minutes: read and browse. Long-term: credible writing and consistent navigation, without manufactured dates or credentials. No further issue found.

### 4. Generic design risk: 4 → 8/10

Mode READ. The chosen asymmetrical lead, culinary imagery and four-entry masonry support editorial browsing. No shadow-card grid, busy text overlay, irrelevant carousel, repeated marketing statement, weak-brand imagery, un-actionable headline or stacked application cards introduced. Litmus: brand unmistakable YES; visual anchor YES; title scan useful YES; each section has one job YES; decorative cards necessary NO; motion improves this reading task NO; works without shadows YES. No additional decoration or animation is proposed.

### 5. System alignment: 6 → 9/10

A retains charcoal, bone text, Fraunces/Inter, square images and hairline rules. Main content follows the approved shell's 1312px maximum width and responsive gutters. Header A, About B and the footer remain separate accepted contracts. The paper surface from C is not selected. No new tokens required. No further issue found.

### 6. Responsive/accessibility: 7 → 8/10

Two columns above 740px, single-column reading at 740px and below. The masonry enhancement sizes spans from natural article height, allowing images and type to determine the rhythm; no dense reordering or duplicated content. Links stay in source order. The enhancement is unnecessary for accessing content. Revised tests cover six widths with and without JS, verifying one hero/four followers, no overlaps or horizontal overflow. Axe scans at 390/1440 are clean. Final application verification must cover real content, zoom, theme, keyboard navigation and pagination. No unresolved visual choice found.

### 7. Decisions

A selected; four secondary posts requested; newest post expressly confirmed as the hero source. Two new decisions (direction and four-post revision), with automatic latest-first ordering confirmed from the existing contract. No deferred design decisions or new TODO proposals. Specimen content remains private design material. Application implementation and engineering verification are outstanding tasks, not implied completed work.

## Verification and evidence

Artifacts: `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/journal-20260929/`.

- `a.html`, `b.html`, `c.html`: responsive populated specimens.
- `a-empty.html`, `b-empty.html`, `c-empty.html`: truthful empty-state designs.
- `sample.html`: labelled specimen destination, not a proposed article-detail redesign.
- `exploration.png`: generated composition study, not authoritative source copy or approved brand artwork.
- `checks.json`: real-browser checks across 36 combinations (three directions, two states, six widths: 320/390/768/1024/1440/1920). Includes h1 count, overflow, images and runtime errors.
- Axe checks cover each state at 390/1440 and each populated direction in the light palette. Actual results are recorded, not inferred from a successful screenshot.
- Preview-state switching and sample-link destinations are tested. The reused mobile menu has six visible links and working Escape dismissal.
- Designer checks cover first viewports only; all three returned pass. They do not constitute a complete accessibility or independent engineering review.
- Parent inspected all three full desktop compositions, empty states and mobile first views; corrected image sizing and a narrow-footer style collision before finalising.
- Revised A: `checks-a-revised.json` records 12 combinations (six widths with/without JavaScript), exactly one hero and four secondary entries, no overlaps/overflow/runtime errors, and zero Axe findings at 390/1440. Revised desktop and mobile screenshots were inspected.
- No application lint/build/test pass is claimed. This task creates design artifacts and a plan, not application changes. Full project gates and independent diff review remain required when implementing.

## Browser review

Board: http://127.0.0.1:43947/boards/b-20260929-101918-tgycv2/

Interactive studies: http://127.0.0.1:4189/a.html, http://127.0.0.1:4189/b.html, http://127.0.0.1:4189/c.html.

Use “No entries yet” at the top of each preview to inspect what the page would show today. Use “Sample entries” to inspect the complete future layout. Board links expose both states directly. Read `feedback.json` when the user reports submitting feedback; do not ask them to repeat it.

## Not in scope

Publishing sample entries or drafting an editorial calendar; redesigning article-detail pages; changing approved navigation/About; footer redesign; adding search, mailing lists or subscriptions; application integration or deployment. These are excluded rather than hidden unfinished work.

## Approved references

Root: `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/journal-20260929/`.

`approved-a.html`, `approved-a-empty.html`, `approved-a-1440.png`, `approved-a-390.png`, `approved.json` and `feedback-final.json` preserve the selected treatment and requested revision. `direction.json` records the explicit interpretation. The same browser board now shows revised A; B and C remain alternatives for context, not selected directions.

## Implementation Tasks

- [ ] **T1 (P1, human: ~4h / Codex: ~30min)** — Journal index — Implement the selected editorial layout and newest-plus-four distribution.
  - Surfaced by: passes 1/2 and the submitted four-post revision.
  - Files: `src/components/JournalListing.tsx`, a dedicated Journal editorial component/CSS if needed, `tests/journal-index.test.tsx`; bounded masonry enhancement only if needed.
  - Acceptance: one newest hero; next four unique entries; older results accessible; keep 12-entry listing contract, publication filtering, metadata, safe public author data, noIndex and cache rules. Handle 0/1/partial/no-media states without specimen content. Scope the redesign to the Journal index; do not silently redesign shared taxonomy/author feeds or other JournalFeedBlock instances.
  - Verify: meaningful 0/1/5/12-entry, ordering, no-duplicate and missing-media tests; `pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Read installed Next guidance first. Parent reviews full diff and reruns gates; independent reviewer follows.
- [ ] **T2 (P1, human: ~2h / Codex: ~20min)** — Journal browser acceptance — Verify real content, responsive masonry and fallback behaviour.
  - Surfaced by: pass 6 and variable-height four-post layout.
  - Files: one Journal Playwright spec under `tests/e2e/`, review evidence under `docs/designs/journal-review/`.
  - Acceptance: 320–1920px, zoom, light/dark/system, long titles, absent images/metadata, JS disabled, keyboard order, real entry links and older-page access. Inspect screenshots and reject collisions or unreadable crops. Preserve performance budgets and existing shared-shell behaviour.
  - Verify: `pnpm test:e2e`, accessibility scans and the full project gates. Parent verification and independent diff review remain required.

## Completion summary

Initial impression 3/10. Six rated passes: 3→8, 5→8, 4→8, 4→8, 6→9, 7→8. Overall minimum 3→8/10. A selected and revised from explicit feedback. Two new decisions, zero deferred, no new TODO proposals. Review is design-complete; application work has not begun.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|---|---|---|---|---|---|
| CEO Review | Existing approvals | Preserve publishing scope | 0 new | Existing scope retained | No business change |
| Outside Review | Initial designer checks | First-viewport visual sanity | 3 | Passed initial studies | Revised masonry inspected locally; no external recheck claimed |
| Eng Review | Required for implementation | Data distribution and masonry behaviour | 0 for this change | Pending | Application not changed |
| Design Review | plan-design-review and board feedback | Full index and revision | 1 | Complete | A, newest hero, four following posts; minimum 8/10 |
| DX Review | Not applicable | Public editorial page | 0 | Not applicable | None |

**OUTSIDE COVERAGE:** Initial designer checks completed; no independent Claude Code/native design voice or engineering review claimed. Revised A has local visual and accessibility evidence.

**VERDICT:** Design plan complete for revised A; eng review required for application acceptance.

NO UNRESOLVED DECISIONS
