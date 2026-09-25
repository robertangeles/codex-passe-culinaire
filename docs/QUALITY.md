# Quality checks

Use Node 22 LTS, pnpm and the migrated local PostgreSQL setup described in `.env.example`. Run `pnpm exec playwright install chromium` once after installing dependencies.

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` is the integration gate. `pnpm test:e2e` runs the browser suite. `pnpm test:performance` runs Lighthouse CI. The quality commands validate that `TEST_DATABASE_URI` identifies the separate local `passe_culinaire_test` database before resetting it, migrate and seed it twice, generate temporary admin passwords in process memory, then build into `.next-quality`. They never reset the application database. Do not run these commands concurrently because they share the isolated test database and port 3100.

Browser checks use `http://localhost:3100`, which permits production Secure preview cookies in the local Playwright cookie store. Lighthouse uses `https://localhost:3443` through the deployment Caddy handlers so it measures TLS, HTTP/2 and compression. Install Caddy or set `CADDY_BIN` to its binary. Local certificates are isolated under `.local/quality-caddy`; no CA is installed into the system trust store. Only the isolated Lighthouse browser ignores certificate errors for this local certificate. Email, external storage, automatic jobs and IndexNow are disabled. Publication tests explicitly run the authenticated job endpoint. Reports remain local under `.local/playwright-report`, `.local/playwright-results` and `.local/lighthouse-report`; no report is uploaded to an external service. Browser failure traces can contain test content and session state, so do not publish them without review.

## Browser coverage

Desktop Chromium uses a 1440 × 1000 viewport; mobile uses the Playwright Pixel 7 profile. Reduced motion is enabled. Core checks cover the five agreed routes, server HTML, semantic headings and landmarks, overflow, axe WCAG A/AA rules, keyboard access, theme persistence, console failures and unexpected third-party scripts/fonts. Content checks cover the isolated editorial workflow and dependent outputs. Automated axe checks supplement the manual browser inspection; they are not a complete accessibility certification.

The home JavaScript check measures scripts actually loaded by a fresh browser plus executable inline scripts. It uses Node's default gzip compression, counts each script URL once, excludes JSON-LD, and requires fewer than 120,000 bytes. Its JSON attachment lists each resource. A failed assertion remains a failure until the requirement or implementation changes through an explicit decision.

## Mobile performance profile

Lighthouse CI runs three fresh navigations per core route with mobile emulation at 412 × 823, device scale 1.75, simulated 4G at 150 ms RTT and 1,638.4 kbit/s throughput, and 4× CPU slowdown. The median of the three runs must score at least 95 in each category (Performance, Accessibility, Best Practices, SEO), and median LCP must stay below 2,000 ms. Use the pinned tools from the lockfile. Run without competing build/test workloads for acceptance measurements.

The fixture content is the truthful seeded launch site with its clearly labelled placeholder media. Initial services, events and journal samples remain drafts. Re-run the same checks with final production photographs and representative published content before launch; performance on unspecified future assets is not inferred from placeholders. Local certificate and loopback measurements do not constitute verification of live DNS, a publicly trusted TLS certificate, a VPS or external email delivery.

## Current verification status

Phase 6's integration gate passed with 296 tests in 53 files. Phase 6 acceptance remains pending the browser and performance budgets. The initial home JavaScript measurement was 146,621 bytes with Turbopack and 147,725 bytes with Webpack, including inline code. The tested Next.js/Payload implementations exceed the 120 kB budget, and the architecture/budget decision remains pending; neither the limit nor the acceptance status has been changed.

The latest browser run passed all 20 functional checks across desktop and mobile. The two home JavaScript assertions failed at 158,225 bytes (desktop) and 158,194 bytes (mobile) after CSS inlining, which puts CSS data in the server-component inline payload. The budget remains unchanged. The shared test-database guard now rejects connection-string query parameters/fragments before destructive preparation, including libpq host/port/database overrides. It compares decoded database names to reject encoded aliases of the application database.

After font and loading fixes, the Caddy HTTPS/HTTP2 run scored 97–99 Performance and 100 Accessibility, Best Practices and SEO on all five routes. Median LCP was 2,478 ms (home), 2,481 ms (about), 2,345 ms (CulinAIre Kitchen), 2,326 ms (journal) and 1,951 ms (contact). These results **do not pass** the overall performance gate: home JavaScript and four route LCP medians exceed the approved limits. Actual results are in `.local/phase6-lighthouse-summary.json` and `.local/phase6-e2e.log`.

Manual browser inspection covered mobile light and desktop dark layouts with the preserved Fraunces wordmark and no new console errors. Further acceptance remains pending the unresolved performance requirements; no exception is assumed.
