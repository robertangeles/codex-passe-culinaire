# Journal implementation

1 October 2026. User authorised applying the approved design to the website.

## Integration decisions

- Apply the editorial view only to the first `/journal` page. Leave author/category/tag views, later listing pages and reusable feed blocks intact.
- Keep the existing published-content query, newest-first ordering, 12-post page size, cache invalidation, metadata and route schema.
- Server-render the hero, four following entries and remaining older entries. Pass rendered children, not post/user objects, into the small client masonry wrapper. Without JavaScript, normal grid/stacked content and links remain available.
- Use a component-scoped ResizeObserver to measure only the four follower cards. Preserve source order; disconnect on unmount; clear desktop layout on mobile. No animation or new dependencies.
- Reuse the ResponsiveMedia validity check for missing-media layout decisions instead of maintaining a second filename/dimension validator.
- Use the selected concept photograph only for the empty Journal composition. Real posts use their own images. No mockup entries are published in the website database.
- Test populated content through the existing isolated quality database, with temporary API-created entries cleaned up in the browser test. Test newest/four/older ordering, pagination, missing media and JavaScript-disabled access.

## Verification

- Parent reran `pnpm lint && pnpm typecheck && pnpm test && pnpm build`: passed. Vitest: 58 files, 318 tests. Next production build completed.
- Independent read-only review (`journal_review`): PASS, no required correctness, security, publication, accessibility or regression fixes. Its requested verification follow-up covers populated themes, zoom and keyboard order.
- Local production server restarted on port 3000 with the applied build. Empty-state checks at 320, 390, 768, 1024, 1440 and 1920px in both dark/light themes passed: one main/h1, no overflow or runtime errors. Axe at 390/1440 in both themes: zero violations.
- Parent inspected the full populated desktop composition and empty desktop/mobile screenshots. Empty evidence: `.local/journal-implementation/empty-checks.json` and `empty-{390,1440}-{dark,light}.png`.
- Full `pnpm test:e2e`: 36 passed, including home JavaScript budget, publication/export flows, contact, themes, kitchen-film playback and Journal desktop/mobile.
- Extended populated checks run the same isolated quality setup with only `journal.spec.ts`: six widths, dark/light/system, long title, missing image, CSS 200% zoom, tab order, pagination and JavaScript-disabled access. Initial run: 2 passed, zero Axe violations.
- Final visual review caught a resize-only gap issue despite the article collision check passing: enhanced padding was applied after heights were measured. The wrapper now applies its layout state before measuring, and the browser test checks whole list-item bounds including padding. After this correction, parent reran lint, typecheck, all 318 tests and build successfully; the extended Journal browser run passed 2/2 again. Independent re-review: PASS. Parent inspected the corrected desktop spacing screenshot.

## Scope

Built: approved first-page Journal layout, supplied empty-state visual, progressive masonry and browser coverage. No published fixtures were added to the website database. The populated tests use isolated temporary content.

Not part of this implementation: deployment, approved navigation A, approved About B, article-detail redesign or editorial publishing. These remain separate work.

## Acceptance

Applied and verified on 1 October 2026 at `http://localhost:3000/journal`. The production-mode local server uses the final build; no remote deployment was performed. The current database has no published Journal entries, so it shows the approved empty state. The newest-plus-four layout activates from real published content.

Final evidence is under `.local/journal-implementation/`: `tests-final.log`, `build-final.log`, `e2e.log` (36 passed), `journal-extended-final.log` (2 passed), and empty-state screenshots/checks. Populated screenshots, including both themes and enlarged content, are under `.local/playwright-results/journal-Journal-keeps-the--5afce--and-older-pages-accessible-desktop/`. The focused follow-up uses a local copy of `scripts/run-quality.mjs` with only the final Playwright invocation limited to `journal.spec.ts`; database/environment safeguards are retained.

Limit: zoom coverage uses CSS 200% enlargement, not a manual browser-chrome zoom setting. Screen-reader software was not manually tested; semantic structure, keyboard order, server HTML and Axe were checked.
