# CulinAIre Kitchen B implementation

2 October 2026. Selected direction: Behind every service. User authorised implementation and retaining the shared-component example. Applied to the local company site at `/culinaire-kitchen`; no remote deployment.

## Built

Named existing CMS blocks provide the approved hero, daily operation, three labs, shared-component example, optional film, founders and continuation. Other blocks remain editable and retain their order. Valid CMS media replaces the approved illustrative stills while retaining alt text, focal points, captions and credit. No schema, dependencies or global design changes.

The existing 128-second film starts only on request on this product page. It pauses offscreen and in a hidden tab without automatically resuming. Its homepage default remains unchanged. Controls, transcript, failure fallback and no-JavaScript links remain available.

The local updater preserved metadata, refused independent edits/drafts, backed up the original page with mode 0600, and published through the existing hooks. A warmed page reflected the update in 2159ms after one successful invalidation job, without a rebuild. The repeat invocation made no content change. The private backup is deliberately excluded from this evidence folder.

## Verification

- Parent read the full executor diff. `pnpm lint && pnpm typecheck && pnpm test && pnpm build` passed twice; 62 test files and 354 tests. A subsequent CSS spacing-only adjustment also passed a fresh production build.
- Full browser run: 40 existing cases passed; two new product cases initially failed because the assertion did not account for Markdown punctuation escaping. Corrected assertion, then both product cases passed in a targeted rerun. This is 42 passing cases across those runs, not a claim of one uninterrupted green suite.
- Product browser coverage: all eleven supplied feature areas, server HTML, one h1, axe, real CMS media, preserved block order, export freshness, draft/private-preview isolation, manual video transfer and playback, offscreen/tab pause, seek/replay/end, failed-video recovery, and no-JavaScript access. Desktop geometry assertions verify the workflow and founder columns.
- Existing homepage film tests completed the full film on desktop and mobile. Existing home JavaScript budget checks passed.
- Actual local production page: 320, 390, 768 and 1440px, dark/light. All eight combinations passed with zero axe A/AA violations, overflow, broken images, runtime errors or unsolicited MP4 transfers. Parent inspected desktop, phone and light-theme screenshots against B.
- Actual Chromium tab zoom was set to 2 using the browser extension API: 1440px window, 720 CSS-pixel viewport, devicePixelRatio 2, no horizontal overflow. This is browser zoom, not CSS zoom or pinch emulation.
- Independent native source review: PASS, then PASS on the browser-discovered fixes and final spacing adjustment. Complexity review found no new dependency or framework to remove; the existing CMS and player are reused.

The parent visual pass caught and corrected hashed RichText selector assumptions that had collapsed desktop columns, a duplicated lab label and cramped spacing below the operation introduction. The repeat-run check caught the CMS's default `imageSide` field; approved feature definitions now include that default. No verification gate was lowered.

Screenshots are JPEG derivatives of the actual production-browser captures. Machine-readable layout, zoom, publication and performance evidence is adjacent. Raw traces, test credentials and private CMS snapshots remain local.

Performance: all Lighthouse assertions passed across 7 routes / 21 runs. Product median scores: 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO. Product median LCP: 1952ms. Existing budgets unchanged. Implementation commit: `eca853d`.
