# Journal page design review

29 September 2026. Status: browser studies prepared; awaiting design feedback. Application unchanged.

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

## Three proposed directions

| Direction | Intent | Tradeoff |
|---|---|---|
| A: The culinary journal | Charcoal magazine composition, lead photograph and story side by side, two secondary stories then compact ruled entries. | Strong image/text balance and continuity with the site; needs good imagery to reach its best. Recommended. |
| B: The working notebook | Type-led entries with a narrow photographic margin on desktop; clean reading list on mobile. | Strongest when writing is the asset; less visually immediate for a culinary audience. |
| C: The house review | Warm paper-toned reading surface, panoramic opening photograph and editorial story layout. | Most like a printed publication; introduces a deliberate light section within the charcoal site. |

Each study includes an empty state and a populated specimen state, linked by a preview-only toolbar. Each empty state states that no entries are published and offers About/CulinAIre Kitchen as onward paths. Study-specific empty headings and the use of concept photography remain proposals until selection. No promise of publication timing, subscription, invented issue number or fabricated author appears.

The five titles/excerpts are explicitly labelled layout specimens. “Author name · Publication date” marks the metadata placement without inventing identities or dates. Article links lead to a clearly labelled specimen page, not fake article routes. The photographs reuse approved kitchen-film concept assets, not photographs asserted to document the founders or their premises. These prototype assets are not automatically approved for public Journal content.

## Review dimensions and pending findings

1. **Information architecture, 3/10 currently.** Proposed hierarchy: Journal identity → first readable story → secondary entries → archive/pagination. In the real empty state: Journal → truthful status → useful company/product route. Remove the redundant Journal entries heading within this page; retain feed block use elsewhere.
2. **States, 5/10 currently.** Empty/populated studies are visible. Production must additionally handle one entry, fewer than three entries, no image, absent excerpt/date/author, long titles, loading/error behaviour inherited from the server route, and paginated or taxonomy/author listings. Do not fill missing data with specimen copy. No new search, filters, subscription or loading animation is proposed.
3. **Journey, 4/10 currently.** Arrive and recognise the house; scan a story and its subject; read a real entry; move to related writing through existing routes. If empty, understand the status without a dead end. The browser studies show the proposed scan/read rhythm. Real content quality remains essential to credibility.
4. **Generic design risk, 4/10 currently.** Mode: READ within a branded public site. Specific photography, varied editorial proportions, self-hosted type and hairline divisions replace generic feed presentation. No shadow cards, decorative gradients, carousel or animated marketing text. All seven hard-rejection patterns were checked: none introduced in the prototypes. No generic demand for extra motion overrides the existing motion restrictions.
5. **System alignment, 6/10 currently.** Proposed 1312px maximum content width and shared gutters; exact existing fonts/colours/signature. A/B retain charcoal; C's paper surface is an explicit pending choice. Existing header A is carried forward, not newly proposed. Existing footer geometry is retained.
6. **Responsive/accessibility, 7/10 currently.** Desktop grids reduce to single-column reading on mobile, with no disappearing article titles or links. B drops its decorative photographic margin on mobile. Native header controls remain usable; skip link, one h1, semantic articles, descriptive story-title links and visible focus. Preserve reduced-motion behaviour without adding animations. Prototype evidence below; application verification remains required.
7. **Decisions.** Select the Journal direction and reconcile board notes, including the empty state. Then complete approval passes and export only agreed implementation tasks. No full review completion or application acceptance is claimed before selection.

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
- No application lint/build/test pass is claimed. This task creates design artifacts and a plan, not application changes. Full project gates and independent diff review remain required when implementing.

## Browser review

Board: http://127.0.0.1:43947/boards/b-20260929-101918-tgycv2/

Interactive studies: http://127.0.0.1:4189/a.html, http://127.0.0.1:4189/b.html, http://127.0.0.1:4189/c.html.

Use “No entries yet” at the top of each preview to inspect what the page would show today. Use “Sample entries” to inspect the complete future layout. Board links expose both states directly. Read `feedback.json` when the user reports submitting feedback; do not ask them to repeat it.

## Not in scope

Publishing sample entries or drafting an editorial calendar; redesigning article-detail pages; changing approved navigation/About; footer redesign; adding search, mailing lists or subscriptions; application integration or deployment. These are excluded rather than hidden unfinished work.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|---|---|---|---|---|---|
| CEO Review | Existing company approvals | Retain publishing within broader company scope | 0 new | Existing scope retained | No new business offer |
| Outside Review | Designer checks | First-viewport visual sanity | 3 | Pass | Not independent engineering coverage |
| Eng Review | Required for implementation | Preserve shared feeds, metadata and publication rules | 0 for this change | Pending | No source change yet |
| Design Review | User-invoked plan-design-review | Whole Journal index | 1 | Awaiting feedback | Three directions with empty and populated states |
| DX Review | Not applicable | Public editorial surface | 0 | Not applicable | None |

**OUTSIDE COVERAGE:** Designer checks completed; no independent Claude Code/native design review or engineering review claimed.

**VERDICT:** Review studies ready for selection; eng review required for implementation acceptance.

**UNRESOLVED DECISIONS:**
- Choose the Journal direction and incorporate board feedback, including the current empty-state treatment.
