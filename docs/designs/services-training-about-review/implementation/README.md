# Implementation evidence, 2 October 2026

Actual local application: Services A, Training A and About A (the reconfirmed earlier About B). The server is at http://127.0.0.1:3000.

- `responsive-checks.json`: 18 cases, covering 390/768/1440 pixels, dark/light, all three routes. All pass. Screenshots use reduced motion.
- `*-390-*.jpg` and `*-1440-*.jpg`: actual page screenshots, compressed for this record. Desktop images are reduced to 900 pixels wide. Parent viewed desktop/phone for every page and all desktop light views. Original PNGs are in `.local/three-page-review/implementation/`.
- `*-populated-*.jpg`: isolated published catalogue fixtures, including long titles, optional fields, status labels and pagination. They are not published in the user's database.
- `about-media-fixture-*.jpg`: isolated non-placeholder image fixture, caption/credit and an intervening custom block. This is a media-rendering test, not a founder photograph. The actual About page retains named portrait spaces.

Full implementation gates passed: `pnpm lint`, `pnpm typecheck`, `pnpm test` (60 files / 341 tests), and `pnpm build`. Each page has an independent PASS review.

Browser coverage: the initial full suite passed all 36 existing tests, including home JavaScript budget, keyboard/themes, contact, Journal, preview/publication and the finite kitchen film. The four new company-page tests initially exposed fixture SEO/ESM and Markdown-escaping assumptions. These were corrected; both catalogue tests passed in the company-page rerun, and both About tests passed in the final targeted rerun. All 40 unique browser cases now pass. No product behavior or check was weakened. Commands support targeted reruns through `pnpm test:e2e company-pages.spec.ts --grep 'About keeps'`.

About's guarded local update saved a mode-0600 backup, committed approved copy, and refreshed the warmed public route in 2.238 seconds via six successful publication jobs. The CMS adds an `imageSide: left` default; the approved transform now includes it explicitly, and repeating the updater returns a no-op. No independent draft or custom biography was overwritten.

Performance: `pnpm test:performance` passed all assertions across seven routes and 21 Lighthouse runs. Median results on the configured mobile throttled-4G profile:

| Route | Performance | Accessibility | Best practices | SEO | LCP |
| --- | --- | --- | --- | --- | --- |
| Home | 99 | 100 | 100 | 100 | 2.105s |
| Services | 98 | 100 | 100 | 100 | 2.369s |
| Training | 99 | 100 | 100 | 100 | 1.952s |
| About | 99 | 100 | 100 | 100 | 2.251s |
| CulinAIre Kitchen | 99 | 100 | 100 | 100 | 2.252s |
| Journal | 98 | 100 | 100 | 100 | 2.290s |
| Contact | 99 | 100 | 100 | 100 | 2.253s |

The first performance run exposed stale test content retained by Next's build cache. The quality runner now clears only `.next-quality/cache` after validating the isolated database target, and applies approved About content before performance builds. The final reports contain no stale portrait fixture. Budgets remain unchanged. `performance.json` records the final medians.

The first visible real About portrait now receives image priority; subsequent or later portraits remain lazy. This correction passed all four implementation gates (341 tests), an independent PASS review, and the final four desktop/mobile About and home-JavaScript browser checks. The home JavaScript remains below its approved 160,000-byte gzip ceiling. Commit: `fd70c94`.

Acceptance is complete for local implementation. No remote deployment was performed. Actual founder photographs remain to be supplied; named portrait spaces are intentional.
