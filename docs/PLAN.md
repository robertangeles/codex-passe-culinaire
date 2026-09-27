# Passe Culinaire build plan

Status: implementation scope approved with defaults; visual acceptance reopened on 26 September 2026 following the user’s rejection of the current presentation. Office-hours design and sketch approved; CEO and engineering plan reviews complete. Phases 1–7 are accepted for local implementation, with explicitly approved Phase 6 performance exceptions. Live deployment and production content inputs remain outstanding. The ten-link LLM index remains a production content gate. See the latest checkpoint below.

## 1. Approved defaults and remaining production inputs

The user approved these defaults. Admin/contact addresses and credentials remain production inputs to supply privately:

1. Use `https://passeculinaire.com` as the canonical production origin.
2. Target a plain Node VPS running Ubuntu 24.04, Postgres 16 on the same box, Caddy, and systemd. No Docker, snap, or automatic deployment. Vercel is the alternative if requested.
3. Store media on local disk initially, with an environment switch for S3-compatible storage.
4. Use clearly identified placeholders until founder photographs, logo, and brand marks are supplied. Do not invent biography, endorsements, addresses, or product claims.
5. Omit the newsletter in v1.
6. Use SMTP by default for contact delivery, retaining the Resend configuration switch. Confirm the recipient and sender address when available; secrets belong in local environment configuration, never chat or source control.
7. Confirm Rob and Alex's admin email addresses when available. Seed credentials must come from private environment configuration, with no shared or committed default password. Build and automated checks must not require real founder credentials.
8. Use the two approved signature details: the lowercase Fraunces wordmark and Southern Hemisphere seasonal hero selection. Omit the live time/weather readout. This avoids a weather dependency while retaining the editorial identity.

Unknown business facts stay `[TO CONFIRM]`. Missing production credentials or assets need not block local implementation with documented development fixtures, but live email, storage, authentication and deployment acceptance require the relevant configuration.

## 2. Establish ownership and implementation rules

1. After approval, update the existing root `AGENTS.md` as the first edited implementation file. Preserve orchestration and installed-tool guidance; add install, dev, lint, typecheck, test, build and seed commands; folder layout; every design token; copy constraints; and all Section 9 never rules. Inspect the existing uppercase `AGENTS.MD` and avoid divergent instructions.
2. Keep architecture, this plan, `AGENTS.md`, `.codex`, integration review, verification and acceptance on the parent thread.
3. The repository currently has no `.codex/agents/` directory despite the brief referring to it. Inspect the existing configuration after approval, then configure the required roles using supported configuration only.
4. Use builder (Sol) for foundation implementation in Phases 1 and 2. If the parent is Sol, implement those phases on the parent instead. Use executor (Luna) for bounded, fully specified tasks in Phases 3 to 7. Each spawn gets one task, an explicit file list, acceptance criteria, and verification commands. Do not overlap file ownership.
5. After every implementation subagent returns, the parent reads the full diff, runs `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, then spawns reviewer on the diff. A fix-first verdict requires fixes, fresh checks and a new review before acceptance.
6. Keep commits small and imperative. Explain every added package in its commit message. Preserve pre-existing user work and tooling; do not sweep it into application commits.
7. Use the project's Ponytail implementation and complexity-review guidance, plus the review and browser QA skills where applicable. Their use does not replace the required parent checks and reviewer gate.
8. Verify supported package versions and compatibility before installing. Inspect installed documentation and types for APIs and configuration; use official documentation when needed. Do not guess package versions, flags or APIs.

## 3. Agree architecture and resolve brief ambiguities

1. Use one Next.js 16 App Router application with strict TypeScript, embedded Payload CMS 3, its Postgres adapter, committed Drizzle-backed migrations, Tailwind CSS 4, pnpm, and a supported Node release at least 22. Pin verified dependencies and commit the lockfile. Disable database push mode.
2. Separate public and Payload route groups. Keep collection/global/block configuration under `src/payload`, public components under `src/components`, shared content/SEO/rendering utilities under `src/lib`, styles under `src/styles`, migrations under `src/migrations`, self-hosted fonts under `src/fonts`, seeds under `scripts`, tests under `tests`, and operational instructions under `docs`. Adapt only where Payload's verified integration requires it.
3. Use server-side Payload access for public rendering with explicit publication and access checks. Share visibility predicates between HTML, search, metadata, sitemap, feeds, Markdown and LLM exports. Keep authenticated draft preview outside shared public caches.
4. Treat draft/publication state separately from event attendance status. Add drafts/versions to events so the two seeded events can be drafts while their event status remains `upcoming`. Retain published past and cancelled event pages.
5. Apply the shared SEO group to pages, posts, services and events. Resolve title and description fallbacks before validating publication requirements. Missing effective title/description prevents publication; posts also require an excerpt. Drafts may be incomplete. Enforce the specified 60/160 character limits and show counters and warnings in the editor.
6. Give authors a public slug and an explicit safe profile projection. Never expose authentication fields or private user data through author pages, search or machine-readable exports. Add taxonomy/author visibility controls needed for consistent sitemap policy.
7. Treat `noIndex` as discoverability policy, not access control. Exclude those documents from sitemaps, feeds and both LLM exports; emit the configured robots metadata on their routes. `excludeFromSitemap` affects only sitemap inclusion. Private content must remain access-controlled independently.
8. Use six child sitemaps: pages, posts, taxonomies, authors, services and training. This incorporates Phase 4's additions to the four originally listed.
9. Proposed five core smoke routes: `/`, `/about`, `/culinaire-kitchen`, `/journal`, `/contact`. Also test services, training, representative detail routes, taxonomies, authors, search, preview and machine endpoints as targeted functional coverage.
10. The contact form needs a reply address although the listed fields omit one. Proposed addition: required email, alongside name, venue, role, need and message. Keep phone absent. Persist submissions privately, report actual delivery state, validate server-side and add proportionate abuse protection.
11. The illustrative curl check uses HTTPS on localhost. Use HTTP for the default local dev server, or configured local TLS, and assert actual article text from a published test fixture. The three seed posts remain drafts.
12. Local JSON-LD checks verify supported shapes and relationships; they cannot guarantee eligibility for Google's rich results. Validate supported types against official schema requirements without claiming every schema type produces a rich result.
13. Scope public cache headers to anonymous published responses. Admin, authentication, preview, submissions and personalised responses must never use shared public caching. Verify the required `public, s-maxage=600, stale-while-revalidate=86400` behaviour in production mode against Next.js cache handling.
14. Keep draft test content and performance fixtures separate from the production seed. Do not publish invented workshops, booking details, testimonials or journal articles just to populate pages.

## 4. Phase 1: Scaffold and design foundation

1. Update `AGENTS.md` first as described above, then establish verified commands and dependencies. Set up lint, strict typechecking, Vitest and a production build so the first phase can pass the mandatory gate.
2. Integrate Next.js, Payload, Postgres, committed initial migrations, Tailwind and sharp. Establish environment validation and a development/test database workflow without Docker.
3. Load licensed, locally stored Fraunces variable (optical-size and weight axes), Inter variable and JetBrains Mono through `next/font/local`; retain their licence files. No runtime font host requests.
4. Record and implement the exact supplied font, colour, fluid type, spacing, measure, line-height, radius and rule tokens. Use bone/ink light mode and charcoal/linen dark mode. Check usable foreground/background pairs; do not use ash or clay for small text where contrast fails.
5. Establish semantic layout, a skip link, focus states, a 12-column editorial grid and reduced-motion handling. Render `passe culinaire` on the home route and load the Payload admin against Postgres.
6. Acceptance: a fresh migrated database works, admin loads, home includes its content in server HTML, local fonts load, and all four checks pass. Capture command output and report built/skipped/assumed items before Phase 2.

## 5. Phase 2: Content model, permissions, media and seed

1. Implement all specified fields for pages, posts, media, categories, tags, services, events, testimonials, users, redirects, forms and form-submissions. Include drafts, versions, slug validation and uniqueness, publication timestamps, calculated reading time, relationships and publication validation as applicable.
2. Implement site-settings, header and footer globals, including organisation data, social links, analytics default off, robots additions, default sitemap settings, nested navigation, legal text and ABN placeholder.
3. Define all 15 page block schemas: Hero, Prose, Feature, Gallery, Pull quote, Founder card, Product spotlight, Journal feed, FAQ, Service list, Upcoming events, Testimonial, Plain statement, CTA and Spacer. Include the selected seasonal hero configuration if approved.
4. Configure Lexical for the requested rich text features: inline images, pull quotes, code and controlled embeds. Store structured embed data and render it safely; do not accept arbitrary executable HTML. Keep the toolbar limited.
5. Implement admin/editor permissions. Editors cannot alter site settings or delete referenced media. Restrict user administration and submission data appropriately. Enforce public draft exclusion and test direct API access as well as page rendering. Implement reference checks across content, blocks and globals, including draft references.
6. Implement local uploads and the configurable S3 adapter. Require alt text and support caption, credit and focal point. Verify Payload/sharp capabilities and generate both AVIF and WebP at 480, 960, 1440 and 2400 pixels, with a documented policy for small sources, orientations and unsupported files. Persist usable variant metadata.
7. Add contact persistence and configurable SMTP/Resend delivery, safe redirect handling, and shared publish/unpublish/delete hooks. Define the revalidation contract here; complete generated outputs in Phase 4.
8. Commit migrations for every schema change. Provide a repeatable seed that creates settings/navigation/footer; two configurable admin users; home/about/product/contact pages; three draft services; two draft events at 60/90 days; three draft posts; twelve clearly labelled placeholder images; and no testimonials. Use only supplied founder facts and restrained Australian English.
9. Acceptance: migrate and seed a fresh database, rerun the seed without duplicates, verify permissions and public visibility, inspect generated image variants and all required models, and pass the four-check gate. Show output and phase report.

## 6. Phase 3: Public website and content rendering

1. Build the responsive header/footer, nested navigation, manual theme preference with system fallback, wordmark and editorial layout. Restrict client JavaScript to actual interactions.
2. Implement each block as a bounded component task. Use full-bleed or quiet heroes, measured prose, asymmetry, unfiltered placeholders, calm empty states, accessible galleries and no testimonial carousel. Ensure one page h1 and logical section headings.
3. Build home, CMS page routes, journal index/detail, category/tag/author routes, service index/detail, and training index/detail. Order upcoming training first and past events beneath a rule. Handle pagination, empty states, 404s and draft exclusion consistently.
4. Implement Postgres full-text search over published pages/posts using supported queries and committed indexes/migrations. Validate query input and return server-rendered results.
5. Render the contact form and its validation, persistence and email states. Add the proposed reply email field if approved. Do not claim a message was emailed when delivery failed.
6. Implement ISR invalidation for dependent pages and listings, including changes to slugs, relationships and publication state. Secure `/api/revalidate`. Wire authenticated draft mode and preview so it bypasses public caches; finish the editor panel in Phase 5.
7. Acceptance: fetch every public route class and inspect its text without executing JavaScript. Test drafts/404s, navigation, contact, search, theme and responsive layouts. Confirm a published edit reaches the public page within 60 seconds without rebuilding. Pass all four checks and show the phase report.

## 7. Phase 4: Machine readability and discovery

1. Build typed, tested JSON-LD utilities with stable entity IDs and safe server-side serialisation. Cover Organization/ProfessionalService, WebSite/SearchAction, Service/Audience, Event/Place/VirtualLocation/Offer, Course, Review, Person, BlogPosting, BreadcrumbList, FAQPage and SoftwareApplication. Emit route-appropriate graphs and merge validated overrides without executable markup.
2. Use confirmed facts only. Omit unknown social profiles, ratings, software pricing and booking information rather than fabricating them. Keep incomplete seeded events in draft.
3. Generate canonical metadata, robots directives, Open Graph and Twitter cards. Implement title/description fallbacks and OG fallback order: explicit image, hero, generated image, site default. Generate post OG images with local Fraunces on bone.
4. Serve a sitemap index and six children with correct content types, XML escaping, updatedAt-based lastmod, configured priority/changefreq, and post hero/inline image entries with alt text as image titles. Test draft, noIndex and explicit sitemap exclusions.
5. Serve full-content RSS 2.0 and JSON Feed 1.1, clean post Markdown mirrors, the curated ten-page `/llms.txt` index, and concatenated published page/post Markdown at `/llms-full.txt`. Define the curated index in editable configuration and respect publication/noIndex policy.
6. Generate robots.txt with every named crawler in the brief, `/admin`, `/api` and `/search` disallows, sitemap location and site-setting additions. Apply route robots metadata separately where required.
7. Invalidate affected discovery outputs on publish/update/unpublish/delete using the shared hooks. Send environment-gated IndexNow notifications, serve its verification key correctly, and keep notification failures from losing a saved publication.
8. Acceptance: all machine endpoints return 200 and correct content types; schemas, XML/JSON/Markdown, visibility rules, canonical URLs and cache behaviour pass checks. Verify no authentication data or draft content leaks. Pass all four commands and show the phase report.

## 8. Phase 5: Editorial workflow and admin polish

1. White-label Payload with the wordmark, bone/ink palette, Fraunces headings and kitchen-first language. Label posts `Journal` and events `Training`.
2. Add an SEO tab with effective title/description preview, counters, validation and warnings. Ensure required alt/excerpt/SEO fields give clear, calm feedback.
3. Complete side-by-side live preview for pages/posts and test authenticated preview isolation. Add one-click page duplication with safe slug and draft handling.
4. Implement scheduled publishing through Payload's supported jobs system and an authenticated cron/worker execution path. Specify timezone behaviour, retry handling and permissions. Verify scheduling actually runs without an open admin browser.
5. Acceptance: each seeded admin can sign in, create and preview a block page, publish, duplicate and schedule content. Editors remain restricted. Published changes appear within 60 seconds. Pass all four checks and show the phase report.

## 9. Phase 6: Quality, accessibility and performance

1. Complete meaningful Vitest coverage for JSON-LD builders, feeds, LLM/Markdown generators, slug logic, sitemap filtering/date formatting and shared visibility policy. Retain tests added alongside earlier behaviour.
2. Add Playwright smoke tests for the five agreed core routes plus targeted publication, preview, contact, service/training, taxonomy/author, search and machine-endpoint checks. Use an isolated migrated and seeded test database.
3. Run axe and manual keyboard checks for WCAG 2.2 AA, including contrast, focus, landmarks, navigation, forms, themes and reduced motion. Test mobile and desktop layouts through the project's browser QA workflow.
4. Configure Lighthouse CI for mobile Performance, Accessibility, Best Practices and SEO scores of at least 95. Measure LCP below 2.0 seconds under a documented throttled 4G profile and home-route JavaScript below 120 kB gzipped. Use representative media and content, record measurement conditions, and fix failures without weakening budgets.
5. Check browser errors, image loading/sizing, third-party network requests, cache isolation and production-mode responses. No analytics or third-party client scripts/fonts without an explicit flag defaulting off.
6. Acceptance: all required checks, browser tests, accessibility checks and measured performance gates pass. Report actual results and any environmental limitation without claiming unrun checks succeeded.

## 10. Phase 7: Deployment documentation and CI

1. Complete `.env.example` with a one-line purpose for every variable, including database, origin, Payload secret, storage, email, seed credentials, preview/revalidation, jobs, IndexNow and optional analytics. Include no working secrets.
2. Write exact Ubuntu 24.04 steps in `docs/DEPLOY.md`: Node via nvm, verified pnpm setup, Postgres 16 roles/database, migrations, initial seed, build/start, systemd with a resolved Node path, Caddy automatic TLS, domain setup, persistent media and job scheduling.
3. Document nightly dated `pg_dump` backups, media backups, retention configuration and a restore drill. Explain updating the application and handling migration rollback/recovery. Include the optional S3 switch and Cloudflare's AI bot-block setting if Cloudflare is later introduced.
4. Add `/api/health` with bounded database checks, useful HTTP status codes and no secret disclosure.
5. Add GitHub Actions for lint, typecheck, test and build on every PR, plus the required browser/performance jobs with suitable fixtures. No auto deploy in v1. The CI application workflow uses no Docker.
6. Acceptance: exercise deployment commands in an available suitable environment, validate CI configuration, run the health checks and complete the final four-command gate. Clearly distinguish rehearsed instructions from actions requiring a real VPS/domain or external credentials. Deployment itself requires the target environment and authorisation.

## 11. Phase handoff and final acceptance

1. At each phase end, show the actual output of `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, list what was built and skipped, and state decisions made on the user's behalf. Do not move past a failed gate. Further approval is needed only for unresolved decisions or changed scope, not routine work already approved.
2. Record review findings and resolve fix-first verdicts before accepting subagent work. Never disable lint rules, introduce `any`, relax budgets, or remove coverage just to obtain a pass.
3. Final checks cover server-rendered article paragraphs and all public route classes; schema validation; the six named discovery endpoints and their child outputs; correct content types; measured Lighthouse/JS/LCP budgets; and both admins publishing within 60 seconds without rebuilding.
4. Deliver the site, committed migrations and seed, tests and actual verification evidence, environment reference, deployment/backup instructions, and a concise list of any remaining user-supplied assets or production configuration.

## 12. Approval and review record

The user approved this plan and its defaults with: "Approve with defaults". This includes the Section 3 resolutions for contact reply email, event drafts and five core smoke routes. Do not request that approval again.

The user subsequently invoked office-hours within the CEO review, authorised current and future public searches in this session, and selected this home page priority: "Chefs and owners understanding you and exploring CulinAIre Kitchen". Carry that priority into the existing home blocks and product journey without cutting the approved platform scope.

The office-hours design is in docs/designs/passe-culinaire-headquarters.md. Independent review of the design passed after two rounds. The user approved the design and sketch with "Approve"; use their company-to-product journey. At the design-review checkpoint, no application code or dependencies existed. The required check chain then stopped because package.json was absent. Phase 1 implementation has since started under the user's approval; its acceptance checks remain pending.

## 13. CEO review: scope, evidence and decision ledger

Review depth: implementation-ready planning. Review posture: HOLD SCOPE, carrying forward the full platform and focused launch journey approved in office-hours. This is an application of the existing scope approvals, not an assertion that the user answered a new mode questionnaire. No new approach decision is required and no feature cuts or additions are proposed.

| ID and owner | Contract and evidence | Current | Proposed | Status | Exact approval and scope |
|---|---|---|---|---|---|
| D1 / user | Original brief and build plan | Full seven-phase website, fixed stack and all required outputs | No scope change | Approved | “Approve with defaults” approves the plan and Section 3 resolutions. |
| D2 / user | Home page audience question | Chefs and owners understand the company and explore CulinAIre Kitchen | Carry into home hierarchy | Approved | User explicitly selected “Chefs and owners understanding you and exploring CulinAIre Kitchen”. |
| D3 / user | Reviewed office-hours document and sketch | Full platform, company-to-product journey, truthful empty states and documented error recovery | Use approved design | Approved | Latest “Approve” accepts the linked design and sketch. |
| D4 / user | Public research request | General public research permitted | Reuse permission | Approved | “Yes approve and approve for future public search”. |
| D5 / parent | Original mandatory verification rules | Parent owns plans, integration and acceptance; implementation tasks and reviews follow the specified roles | No change | Approved | Original brief and AGENTS.md, retained by D1. |

What already exists: project skills, tooling configuration, root agent instructions, the approved plan, reviewed design, rough wireframe and review evidence. No application, package manifest, database schema, migrations or remote currently exists. Reuse the tooling and approved design. Framework-provided CMS/auth/editor/jobs capabilities must be assessed before writing replacements.

System audit: main is an unborn branch; no origin, commits, stash, architecture document or prior feature implementation. There is no existing application TODO debt to attribute. The required check chain stops with ERR_PNPM_NO_PKG_MANIFEST. This is not a passing implementation verification. The installed CEO skill is monolithic; its referenced sections/review-sections.md file is absent, but the complete Sections 1–11 embedded in SKILL.md were read.

Complexity check: the brief necessarily spans more than 15 files and two new services. The minimum architecture that retains its approved requirements is one application, one Postgres database, one persistent media store, and the existing CMS jobs runner. Do not add a second CMS, Redis, separate search service, custom editor framework or a client-side content API layer. No approved deliverable is deferred.

Premise challenge: the immediate business job is to make the company and its first product understandable, while the platform enables later publishing. Building the CMS alone is a proxy for that outcome. Validate the quiet launch as carefully as the populated site. Customer demand and conversion remain unknown; no review conclusion changes that.

Dream state:
  CURRENT                       THIS PLAN                        12-MONTH IDEAL
  tooling + approved brief ---> credible company/product site --> founders publish useful evidence
                                editable publishing platform      + real training and advisory
                                                                  without rebuilding the site

The 12-month state requires real content and business activity, not more speculative software.

Temporal interrogation (sequence, not an elapsed-time promise):
- Foundation: verify compatible pinned versions, non-Docker Postgres access, documented API options and repeatable commands before building schemas.
- Core logic: separate draft state from event status; agree visibility, reserved routes, media variants and public file delivery within existing requirements.
- Integration: prove publishing invalidates HTML and discovery outputs together, preview stays private, and contact persistence survives email failure.
- Polish: measure the public route independently of admin bundles; exercise genuine empty states, restore procedures and both founders' publishing flows.

Effort: human-team XL / Codex+gstack L for this whole greenfield plan; these are relative sizes. No defensible delivery date exists before the foundation check.

## 14. CEO Section 1: Architecture review

Current scope: HOLD SCOPE under D1–D5. Retain the approved full platform and company-to-product journey. The parent owns integration and acceptance.

Finding A1: one publication/access policy must govern all public outputs. A server query is not intrinsically permission-safe: [Payload documents](https://payloadcms.com/docs/local-api/access-control) that Local API operations bypass access controls by default. Public reads must explicitly respect access and published state, and return safe public fields. Authenticated preview must use a separate, uncached path. Disposition: make the already-approved access contract explicit; verify anonymous HTML, REST and any enabled GraphQL surfaces in Phase 2.

Finding A2: crawler exclusions and delivery URLs must agree. Keep the required /api robots disallow, but expose public media through crawler-allowed public URLs and use those URLs consistently in HTML and metadata. Keep upload metadata and mutation APIs protected. The Markdown mirror also needs verified routing that does not collide with the journal HTML route. Use supported framework routing/configuration after inspecting installed types; no guessed upload option or partial dynamic segment syntax is approved here. Reserve built-in page slugs, machine-file names and the Markdown suffix. Phase 3 must exercise these routes against a production server.

Finding A3: the single VPS is a deliberate availability boundary. App, database and local media share a failure domain. The approved backup/restore and health checks are essential. No availability SLA or automatic failover is promised.

Compatibility evidence: [Payload's current installation guide](https://payloadcms.com/docs/getting-started/installation) includes Next.js 16.2.6+ among supported ranges. That is evidence the chosen major versions can fit; it is not a pinned dependency decision. Phase 1 must choose actual mutually compatible Payload 3.x/Next 16 versions from package metadata, install them, and inspect their documentation and types. The guide is live and does not substitute for the selected version's peer dependencies.

```text
Anonymous reader / crawler
    -> Caddy TLS
        -> Next public routes -> safe Payload queries -> Postgres
            |                         |
            |                         +-> publication + access filters
            +-> HTML / metadata / discovery serializers
            +-> public image URLs -> persistent local media OR selected S3 adapter

Founder/editor -> authenticated Payload admin -> permissions -> Postgres
    |                  |                          |
    +-> private preview+                          +-> committed publish
                                                     -> invalidate dependent outputs
                                                     -> IndexNow notification

Contact POST -> validate + abuse checks -> private submission -> email adapter
                                                             -> failure visible in admin

Cron/systemd -> authenticated Payload jobs -> due publication + same hooks
Backup timer -> Postgres dump + media snapshot -> tested restore
```

Public reads: missing slug -> 404; valid collection with zero published records -> calm empty state; invalid query -> validation response; failed required DB read -> the approved 503/no-store policy. Admin writes: missing permission -> reject; incomplete draft -> save if allowed; incomplete publish -> field errors; database failure -> no success claim. A failed email or IndexNow call must not erase a committed record.

At 10x traffic, caching and bounded DB connections protect the public path; at 100x, cache misses, upload encoding and full-content exports are the first candidates to measure. Do not add capacity infrastructure pre-emptively. No p99 claim is justified before measurement.

Rollback: preserve the prior build and environment, take backups before migration, and prove the prior build is compatible before switching back. A schema-incompatible rollback needs the documented restore path and explicit awareness of intervening writes; it is not an automatic destructive down-migration.

## 15. CEO Section 2: Error and rescue map

Finding E1: several failure paths are named in the plan but need observable outcomes. The following registry specifies those outcomes within the approved validation, access, publishing and operations requirements. Error categories below are domain categories, not claims about uninstalled exception class names. The implementer must map the chosen packages' actual typed errors and preserve unexpected errors with context.

| ID / codepath | Trigger/category | Rescue and public/editor outcome | Proof and operator evidence |
|---|---|---|---|
| R1 Public content read | Missing record, denied access, DB unavailable | Distinguish 404 from a real empty list; failed required read returns the approved 503/no-store response. No application stale-query fallback. | Route fixture and outage test; log request ID, operation and safe document identifier. |
| R2 Content write / duplicate | Invalid fields, reserved/duplicate slug, write conflict | Save valid drafts; refuse invalid publication; preserve entered form data and show field-specific errors. Duplicate creates a new draft with a unique slug. | Validation and competing-write tests; no success before commit. |
| R3 Preview / revalidation | Expired auth, forged token, wrong origin or path | Reject without leaking draft data; permit only validated internal destinations; private responses are uncached. | Anonymous/tampered/expired requests; redact secrets from logs. |
| R4 Contact persistence | Invalid form, repeated request, DB failure | Reject invalid input; preserve an understandable form state; report receipt only after durable save. Retry must not silently create duplicate submissions. | Valid/invalid/double-submit and failed-save cases, request ID without message-body logging. |
| R5 Contact email | Provider timeout/rejection after save | Preserve the enquiry, mark notification failure, tell the visitor it was saved without claiming delivery. Admin locates the submission and uses the approved manual reply workflow. | Provider-failure fixture and admin read; status/time/sanitised error retained. |
| R6 Upload and variants | Unsupported/corrupt input, encoder failure, disk/bucket failure | Reject unsafe input; never expose a partially generated set as ready; surface a useful upload error and clean up this attempt's orphan files. | Both formats at all four required widths, corrupt source and failed storage tests; media/job ID. |
| R7 Media deletion | Media referenced by published/draft content or concurrently attached | Deny the editor's deletion; reference checks must cover globals, relationships and nested blocks at the protected write boundary. | Existing and competing reference/delete tests; actor and media ID. |
| R8 Publication propagation | Failed invalidation, out-of-order render/job | Preserve the committed version; retain actionable failure evidence and retry invalidation through the existing job system where needed. Do not treat an old snapshot as the latest publication. | Publish/update/unpublish/delete + controlled ordering tests; document/version, affected routes and job ID. |
| R9 Scheduled publishing | Worker absent, invalid time, duplicate/late execution | Validate time; repeated execution must not duplicate side effects or republish a later-unpublished document. Expose failed/late jobs to the operator. | Fixed-clock tests, duplicate invocation and worker restart; scheduled/run timestamps. |
| R10 Export / structured data | Invalid override, unsupported rich-text node, bad encoding | Reject invalid override at publication; use the shared content serializer with explicit handling for every allowed node. Fail generation visibly rather than silently dropping required content. | JSON-LD, XML, JSON and Markdown parse/content tests; output type and safe source ID. |
| R11 IndexNow | Missing configured key, network timeout or rejection | Key absent means documented disabled integration; with a key, record failure and retry without undoing publication. Do not claim an accepted ping without provider success. | Stubbed successful and failed provider; job/URL/status, no secret logging. |
| R12 Operations | Migration, health probe or backup/restore failure | Stop a failed deployment; health reflects bounded DB failure without secrets; failed backup is visible and never labelled successful. Restore is a rehearsed operator procedure. | Fresh DB migration, failed migration, timeout health, and restoration rehearsal; run ID/exit status. |

Rescue status: planned for all 12 rows; none implemented or verified yet. There is no silent-failure policy gap left in this map. Implementation proof remains mandatory at the owning phase gates.

```text
request/work item
   -> validate -> failure -> precise rejection, no success side effect
   -> perform DB mutation -> failure -> no receipt/publication claim
   -> commit -> external notification fails -> saved record + visible recovery
   -> render/serialize -> failure -> error response/log, never fabricated content
```

Required errors must preserve the original typed cause. Catching everything and returning an empty array, a successful form receipt or an invented fallback entity does not satisfy this plan.

## 16. CEO Section 3: Security and trust boundaries

Finding S1 (likelihood medium, impact high): an anonymous Local API read or user response could expose drafts, email addresses or auth fields. Apply A1 and explicit public author projections to HTML, search and every export. Collection API access must match; hiding admin controls is not access control.

Finding S2 (likelihood medium, impact high): preview/revalidation/jobs endpoints and role updates are privileged operations. Authenticate and authorise on the server, validate internal preview destinations, disallow editor role escalation, and separate private response caching. Rotate secrets via configuration; never log them.

Finding S3 (likelihood medium, impact high): uploads, rich text, embeds, form input and structured-data overrides are untrusted data. Bound input sizes; parameterise search; permit only supported upload types and check actual file content; constrain paths; render allowed rich-text/embed structures; escape JSON-LD against script termination. Remote upload fetching is not a v1 requirement: disable it unless its safe-fetch behaviour and need are verified. External embed scripts remain behind the required default-off client third-party flag. An override must still validate and preserve the required entity relationships.

Finding S4 (likelihood medium, impact medium): public contact writes can be abused, and submission data is personal information. Keep recipients/provider configuration server-owned; validate lengths and select values, rate-limit proportionately, prevent header injection, and restrict submission reads to authorised staff. Log IDs and status rather than raw messages or credentials. A policy for retention and final privacy copy needs owner review before public launch; no legal-compliance claim is made by this technical review.

All four findings refine boundaries already present in the approved plan. No new identity provider, payment surface, AI inference service or external tracking service is introduced. Package security and lockfile review occur against actual selected dependencies in Phase 1; an empty repo cannot be declared secure.

## 17. CEO Section 4: Data flows, ordering and interaction states

Finding D6: publication and media-reference guarantees depend on ordering, not just individual hook success. Retain the required within-60-second visibility contract and protected deletion behaviour. Verify transaction support and hook timing in the selected Payload adapter before coding the mechanism. The plan does not claim that afterChange necessarily means after commit.

```text
AUTHOR -> field validation -> document/slug/SEO -> transaction commit
                                             -> shared publication propagation
missing/invalid -> field error                 -> public HTML + exports invalidated
draft save -----------------------------------> private version only
commit error ---------------------------------> no publish success

UPLOAD -> content/size/alt checks -> eight AVIF/WebP variants -> ready media
nil/corrupt -> reject             -> partial encoding/storage -> cleanup + error
ready media -> attach/reference validation -> document relation
referenced media -> editor delete ----------> denied at protected write boundary

CONTACT -> validate + request identity -> private save -> email
empty/invalid -> field errors          |                -> sent OR visible failed state
DB unavailable -> no receipt          +-> repeated request returns original receipt

SEARCH -> validate bounded query -> indexed public pages/posts -> server HTML
missing query -> search prompt; zero matches -> clear empty state; DB error -> error

DISCOVERY -> shared published projection -> HTML/Markdown/JSON/XML serializers
noIndex -> omit from specified discovery outputs
excludeFromSitemap -> omit from sitemap only
invalid source -> publishing error; serialisation failure -> logged generation failure

SCHEDULE -> validated instant + content revision -> job runner -> publish contract
invalid time -> reject; duplicate/stale job -> no duplicate or outdated publication
```

Publication state machine:
```text
draft --valid publish--> published --valid edit/publish--> published (new revision)
  |                         |
  +--schedule intent--+     +--unpublish--> draft
                      |
               due job + still-current intent -> published
               cancelled/replaced intent ------> no publication
invalid fields block publication; revision restores return through validation
event upcoming/sold-out/past/cancelled is independent of draft/publication state
```

Contact state machine: validated -> saved(notification pending) -> sent OR notification failed -> manually handled. Save failure is not saved. A duplicate browser submission reuses the same request identity; the database enforces uniqueness. Notification retry and a custom resend interface are not required by the approved manual recovery workflow.

Media state machine: uploading -> generating -> ready OR failed/cleaned. Only ready media is attachable. An editor cannot transition referenced media to deleted.

Ordering schedules that must be proved:
```text
Operation P (publish)       Operation R (read/regenerate)        Shared state
P1 write new revision                                      old published revision
P2 queue propagation       R1 must not publish uncommitted data
P3 commit                                                   new published revision
P4 make job runnable       R2 read latest committed revision -> new output

Opposite completion order:
old regeneration begins    new publication commits          new revision authoritative
old regeneration returns   invalidation job follows         old result must not win cache
fresh reader ---------------------------------------------> latest permitted snapshot
```

Use committed-state propagation and a revision-aware invalidation mechanism supported by the installed stack. A job may be queued within the existing transaction only if it cannot execute before commit; carry the relevant request transaction through nested writes. If the framework cannot prove that mechanism, investigate within Phase 2 before accepting the hook implementation. Both completion orders need controlled tests. The 600-second cache lifetime alone does not meet a 60-second publication requirement.

```text
Operation A (attach media)  Operation B (editor delete)       Invariant
A checks media exists      B checks references              checks alone are insufficient
A commits reference        B attempts delete               B must fail
B commits deletion         A attempts reference             A must fail
```

Require DB constraints/transaction locking or the supported adapter's equivalent to protect the attach/delete boundary, including references in blocks, globals and draft versions. A non-atomic scan followed by deletion is insufficient. Test both interleavings in Phase 2.

| Interaction edge case | Planned handling / proof |
|---|---|
| Double contact click or retry after a lost response | Server request identity + unique persisted receipt; exercise duplicate request. |
| Navigation during contact submission | No browser-only acknowledgement; the receipt is based on committed state. |
| Empty/large/changing listings | Explicit empty state, bounded pagination and stable ordering; no hidden client-only content. |
| Theme storage unavailable | System preference still works; optional storage failure does not break rendering. |
| Preview expired or browser Back restores it | Authenticate each preview request; no shared-cache draft response. |
| Publish then unpublish before a queued task runs | Re-read current publication state; do not resurrect a captured published snapshot. |
| Slug changed while old URL is cached | Invalidate old and new routes plus dependent listings; apply approved redirect logic safely. |
| Scheduled publication across Melbourne DST | Persist an unambiguous instant and display the IANA timezone; validate ambiguous input rather than guessing. |
| Missing related media, author or optional testimonial | Safe fallback/validation appropriate to the field; never expose private user fields or invented quotes. |
| Worker restart, duplicate execution or backlog | Idempotent current-state work, visible failed/late jobs and bounded processing; prove restart handling. |

Ten interaction cases are mapped; all have planned handling. They are not yet test results.

## 18. CEO Section 5: Code quality and requirement consistency

Finding Q1: HTML, Lexical rendering, Markdown mirrors, feeds and LLM exports could diverge if each walks content independently. Use a shared typed content projection and an exhaustive node/block traversal, with output-specific serializers. Reuse Payload's editor/rendering primitives where they meet the contract. Keep publication eligibility separate from sitemap-only exclusions. Do not create a generic plugin framework or service-class hierarchy.

Finding Q2: llms.txt requires ten important pages, but the initial public route inventory does not establish ten editorially meaningful eligible pages. Home, About, product, Contact, Services, Training and Journal provide seven; two public founder author pages can provide nine. Draft services/events/posts and empty taxonomy filler must not be counted to manufacture completeness. Retain the ten-page requirement as a production content gate: before launch, select ten real eligible destinations. The seed and development export must never invent or reveal content to fill the quota. This is a recorded launch-content dependency, not approval to change “ten” to “up to ten”. The owner can later supply additional published content or explicitly amend that requirement.

The fixed stack and existing library capabilities should determine filenames and APIs after installation. Keep public data helpers, serializers, block components, configuration and adapters separate only where they have distinct responsibilities. Ban any and lint-rule bypasses as specified. Complexity and dead-code checks require actual code; there are no functions to score yet.

## 19. CEO Section 6: Test review

Finding T1: the existing test categories are correct, but they must exercise caller paths rather than merely checking isolated predicates. The coverage below makes the approved outcomes observable; no budget or acceptance criterion is weakened.

```text
PUBLIC OUTPUTS
  visibility + slugs + SEO + content projection -> Vitest unit
  queries + roles + references + transactions  -> Postgres integration
  actual HTML / feeds / exports / image URLs  -> production HTTP integration
  five core routes + publish/preview/contact  -> Playwright
  mobile rendering + motion + focus + forms   -> axe + manual browser QA
  real home media / hydrated JS / cache       -> Lighthouse + transfer measurement

EDITORIAL MUTATIONS
  drafts + publish + unpublish + old slug + delete
       -> integration with separate anonymous reader
       -> controlled invalidation/worker ordering
       -> public route and discovery-output assertions

OPERATIONS
  fresh migration + repeat seed + failed migration
       -> isolated local Postgres
  scheduled job + restart + failed email + IndexNow
       -> fake clock + injected adapter failures
  backup + restore + health
       -> deployment rehearsal against a disposable environment
```

| Requirement / owning phase | Observable assertion | Wrong result rejected / edge |
|---|---|---|
| Published public content, Phase 2–4 | Anonymous caller gets only eligible records and safe public fields. | A predicate passes while a Local API call overrides access; draft relation data leaks. |
| noIndex and sitemap exclusions, Phase 4 | noIndex is absent from sitemap, feeds and both LLM exports; sitemap-only exclusion stays out of sitemap only. | A single exclusion flag silently removes indexable feed content. |
| Required media variants, Phase 2 | Each ready upload has AVIF and WebP at 480, 960, 1440 and 2400 pixels. | “At least one format” or four total files passes incorrectly; small/corrupt source or partial storage. |
| Required sitemap metadata, Phase 4 | lastmod is a correctly formatted timestamp derived from updatedAt; image entries contain the intended alt text. | Current time substituted on each request, bad XML escaping, draft inline images. |
| Ten curated links, Phase 4/launch | Ten genuine eligible destinations at production acceptance; each resolves to intended published content. | Fabricated links, draft links or empty taxonomy padding to reach a count. |
| Required full content, Phase 3–4 | HTTP HTML and text/Markdown/XML/JSON contain the actual permitted body, including supported rich-text nodes. | Client-only body, a summary replacing full content, or dropped pull quotes/embeds. |
| Publish within 60 seconds, Phase 3/5 | A separate anonymous reader sees the committed change and corresponding export changes without rebuilding within the required interval. | Stale-while-revalidate waits for 600 seconds; pre-commit or old-job snapshot wins. |
| Media protection, Phase 2 | Editor deletion is denied for every supported reference location and under both attach/delete orders. | Sequential scan passes but a competing attach creates a broken reference. |
| Contact, Phase 2–3 | Receipt follows a durable save; duplicate request is not a second enquiry; failed mail is visible to admin and correctly described to visitor. | Provider outage loses the enquiry or reports delivery success. |
| Admin workflow, Phase 5 | Both seeded admins independently create, preview, duplicate, schedule and publish; editor restrictions hold via API. | Testing only one account or hiding forbidden controls without access enforcement. |
| Design/accessibility/performance, Phase 6 | All required scores and transfer/LCP limits pass with representative media; keyboard and reduced-motion flows remain usable. | Empty scaffold scores used as proof of the final home page, or admin bundle counted as home JS. |
| Deployment/restore, Phase 7 | Fresh install/migration/seed succeeds; failed migration stops rollout; restored DB and media render the same fixture. | Backup file exists but cannot restore, or missing media after rollback. |

No tests exist yet. The Friday-release confidence test is the full two-admin publish/preview flow through a production server. The adversarial cases are a draft leak via another output and the media attach/delete race. The operational failure exercise is a DB outage followed by recovery plus an email outage with the enquiry retained.

Use fixed clocks for season, relative seed dates, scheduled publication and Melbourne DST. Use stable fixtures and stub outbound mail/IndexNow rather than live provider calls in ordinary tests. Test actual providers only with explicit configured credentials. The test pyramid is many pure serializer/validation tests, focused DB/HTTP integration tests, and a small smoke/E2E suite with targeted edge cases. A restore drill and representative large export/upload checks supply operational coverage without inventing a new ongoing load-test platform.

## 20. CEO Section 7: Performance review

Finding P1: eight renditions per image and full-content exports are the likely resource-heavy paths on the shared VPS. Limit concurrent encoding, bound source input, paginate DB reads and stream or stage large outputs where supported. Generate a coherent ready rendition set; do not silently omit a required size for a small image. Phase 2 must document the small-source policy while preserving all eight required outputs, and verify focal point, orientation and alpha handling.

Finding P2: the 120 kB gzipped home JS budget and LCP target need early evidence, before every block exists. Measure the Phase 1 production shell and again with representative Phase 3 images/content. Keep Payload admin/editor modules outside the public route dependency graph. Prefer server components; theme, navigation and form interactions earn their own small client boundaries. Serve appropriately sized images rather than a 2400-pixel asset to every device.

The three likely slow paths are upload decode/AVIF encoding, full LLM/feed regeneration, and cache-miss pages with several relationship-rich blocks. No p99 latency is measured yet. Phase 2/3 must measure them on the target-class environment, including queue delay for the 60-second publication target.

Batch author/media/category relationships, bound list pagination and DB pool size, index actual slug/publication/time/taxonomy/search predicates in committed migrations, and avoid one database connection per block. Full exports are complete, not arbitrarily truncated: use bounded memory and paged reads rather than a user-visible content cap. Do not fetch weather; it was not one of the two approved signature details.

## 21. CEO Section 8: Observability and recovery

Finding O1: publication jobs need visible freshness and failure evidence. Retain document/revision ID, scheduled/run time, affected output and completion/error status in the supported job/log facilities. The operator must be able to see a stopped worker or late publication and rerun recoverable propagation. Do not expose these controls publicly.

Finding O2: backups and uploads need evidence of completion, not just a started timer/process. Record the backup path, completion time and exit status, and media processing completion/error state. systemd service/timer failure state and logs must make failures inspectable; deployment documentation must name the checks and recovery commands. A backup is accepted only after the restore rehearsal.

Day-one operational view: the existing Payload jobs list, private submission notification state, bounded /api/health, and systemd logs/status. No new dashboard service or vendor is required. Log safe identifiers and error causes, not raw form messages, auth tokens or connection strings. A request/job correlation ID follows publication into invalidation and notification.

Operational checks: DB health and HTTP errors; time since last successful worker/backup run; failed jobs; notification failures; media generation failures; and publication-to-visible delay. The runbook must distinguish empty content from a failed query and a received enquiry from a failed email notification. Alert destination and final backup retention are deployment configuration, not silently assumed external services.

## 22. CEO Section 9: Deployment and rollback

Finding L1: a code rollback does not reverse a database migration safely. Use the committed migration history, verify backup restoration, and document whether each migration permits the previous app version. Destructive down-migrations and overwriting newer production data are never automatic rollback steps.

Finding L2: “no Docker” applies to CI as well as deployment. GitHub Actions must run Postgres natively, or use a configured isolated test database; a service-container example would violate the brief. The Phase 1 local DB prerequisite must also have a native path. Do not invent a managed DB dependency just for tests.

```text
verified source + lockfile
       -> isolated DB migrate + seed + four-command checks
       -> build tested release
       -> production backup and migration preflight
       -> stop rollout if migration fails
       -> start new app + scheduled worker under systemd
       -> health + key public routes + assets + discovery endpoints
       -> both admin publication smoke checks
       -> record deployed release and backup references
```

The build must not need production credentials or connect to production. Use an isolated build/test DB if the selected static generation setup needs data. Before switching a real deployment, verify the installed Node/pnpm paths used by systemd, environment-file permissions, persistent media ownership, Caddy routing/TLS and job scheduling.

```text
new release unhealthy
       -> stop rollout / preserve logs
       -> previous app compatible with current DB?
            yes -> switch to previous tested build -> health + smoke
            no  -> maintenance + owner-authorised recovery
                   -> restore verified matching DB/media backup
                   -> restore app -> validate state
```

Single-VPS deploys may have a maintenance interval. Neither zero downtime nor a numerical recovery time is promised. Measure the restore duration during Phase 7, record it in DEPLOY.md and report the age of data restored.

First five minutes: DB health, home/product/contact/journal, media content types, six discovery endpoints and worker process status. First hour: one controlled publish, job execution, email delivery or its visible recovery state, and error logs. These are operational acceptance checks, not an auto-deploy pipeline.

## 23. CEO Section 10: Long-term trajectory

Finding F1: an environment switch between disk and S3 does not move existing media. The approved storage switch needs an operational copy/verification procedure before changing a live installation. Preserve file identity and public URLs where possible; do not leave old uploads unavailable. Include that procedure with the Phase 7 storage documentation.

The one-year maintenance path is the chosen framework's normal collections, migrations, blocks and jobs, with shared publication/rendering rules and small adapters at the genuinely variable boundaries. Avoid custom authentication, a new editor engine or a search service beside Postgres. Keep font licences, backup/restore instructions and the reason for each dependency with the repo.

Reversibility: 3/5. Page composition and copy are easy to revise; content schema, editor representation, storage migration and established URLs carry migration cost. No additional debt item is deferred by this review. Known production inputs remain owned by the founders, and compatibility/operational evidence belongs to implementation phase gates.

## 24. CEO Section 11: Design and UX

Finding U1: the supplied colours cannot all be used as small text in both themes. Calculated contrast from the exact supplied sRGB values:
- ink on bone 15.45:1; moss on bone 6.59:1.
- clay on bone 3.66:1; ash on bone 3.08:1.
- linen on charcoal 14.53:1; moss on charcoal 2.48:1; ash on charcoal 5.30:1.

Keep the exact brand tokens, and use them only in roles that pass the required contrast. In particular, small light-theme captions cannot use plain ash, and dark-theme text/focus cannot use plain moss. Underline links and use readable semantic foreground aliases derived from the approved palette. This implements the plan's existing contrast instruction rather than changing the palette.

```text
Home: company + kitchen context
  -> product introduction -> /culinaire-kitchen -> clearly labelled product website
  -> founder context ------> /about ------------> /contact
  -> published offerings --> services/training -> detail + real next step
  -> published writing ----> journal -----------> article/author/topic

No published entries -> calm, truthful state + applicable contact/product path
Required read fails --> visible error, no invented “empty” result
Contact validates ---> saving ---> saved; notification outcome handled honestly
```

| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Public pages/listings | Server HTML; reserve media space | Approved calm content states | Genuine read failure, not empty result | Full readable content | Optional media/relations get honest fallback |
| Product journey | Text available before image | Only confirmed company/product facts | Broken destination or missing content caught by checks | Clear internal explanation and external destination | Placeholder artwork labelled in development |
| Contact | Submit state without losing input | Required fields explained | Field errors or failed persistence | Receipt after saved enquiry | Saved but notification failed |
| Preview/admin | Authenticated pending state | Draft editor can be incomplete | Auth and validation errors | Preview and publish reflect intended revision | Failed propagation is visible, not a false complete state |
| Theme/navigation | No content dependence on JS | System theme default | Storage failure leaves usable UI | Accessible manual toggle/menu | Keyboard access remains available |
| Training | Bounded server list | No public dates; past records retained | Read/booking-link errors | Real status/date/venue | Missing optional price or booking data is not invented |

The approved sketch expresses hierarchy, not finished visual quality. Production must use the real design tokens, local fonts, meaningful photography when supplied, responsive asymmetry, semantic headings, visible focus, a skip link, adequate touch targets, reduced motion and usable narrow screens. Avoid card grids with shadows, hype copy, looping motion and empty placeholder carousels.

The emotional path is recognition (“these people know kitchen work”), understanding (“this is their company and first product”), then a clear next step. Product-specific proof still requires the verified material identified in office-hours. No new public claim is authorised by the review.

A detailed plan-design-review can refine the UI before implementation; live design QA remains part of Phase 6. No pixel-level audit of the future site is claimed here.

## 25. Failure modes and coverage registry

“Planned” means specified for implementation, not tested. Every row maps to the error registry and required phase checks.

| Codepath | Failure mode | Rescue | Test | User outcome | Logged |
|---|---|---|---|---|---|
| R1 Public read | DB failure mistaken for empty content | Planned | Planned HTTP outage case | Visible error | Planned safe request context |
| R2 Content write | Invalid publish/duplicate slug | Planned | Planned validation/conflict case | Field error, preserved input | Planned actor/document |
| R3 Preview/privileged endpoints | Unauthorised draft or mutation | Planned | Planned auth/cache cases | Rejection | Planned redacted auth event |
| R4 Contact save | Lost or duplicate enquiry | Planned | Planned DB/duplicate cases | Honest receipt/error | Planned request/record ID |
| R5 Email | Saved enquiry not notified | Planned | Planned provider failure | Saved state; admin manual recovery | Planned notification status |
| R6 Upload | Partial variants or failed storage | Planned | Planned rendition/failure cases | Upload error until ready | Planned media/job ID |
| R7 Media delete | Attach/delete race | Planned | Planned both-order tests | Referenced media protected | Planned actor/media ID |
| R8 Publish propagation | Old snapshot or missed invalidation | Planned | Planned revision/order/60-second cases | Current published result or visible operational failure | Planned revision/routes |
| R9 Scheduled job | Duplicate/stale/late publication | Planned | Planned clock/restart cases | Intended current publication only | Planned schedule/run status |
| R10 Discovery serializer | Invalid or silently incomplete output | Planned | Planned content/type/escaping cases | Correct full output or visible generation failure | Planned source/output ID |
| R11 IndexNow | Provider outage | Planned | Planned configured failure case | Publication retained | Planned provider status |
| R12 Operations | Failed migration/backup/restore | Planned | Planned isolated rehearsal | Stop rollout or recover deliberately | Planned run/exit status |

Twelve failure modes mapped; zero silent or wholly unhandled policy gaps in the reviewed plan. None is an implemented pass. Runtime safety and the exact framework mechanisms remain subject to the owning phase's verification gate.

Not in scope, by the original brief: newsletter, Docker/snap, automatic production deployment, invented testimonials or biographies, and third-party client scripts/fonts/analytics enabled by default. No newly approved feature is deferred or cut. Additional platform services and alternative architectures are not proposed. No TODOS.md entry is added for hypothetical future work.

## 26. Outside-review outcome

The installed configuration enables the standard outside review, and the Claude Code command resolved during preflight. The invocation was rejected by automatic approval review before process creation because the user had not specifically authorised sending this business/architecture payload to that external destination. Public-search consent does not authorise that export. No outside review completed and no cross-model agreement is claimed.

The skill's bounded native fallback requires a declared Plan subagent type plus TaskOutput and TaskStop. Those exact capabilities are unavailable in this host. Per the skill, no general-purpose substitute was launched. The completed native Sections 1–11 remain valid; missing outside coverage is non-blocking. The rejection is recorded rather than retried through another tool.

## 27. Implementation tasks from this review

These are phase work packages, not permission to give an executor a broad assignment. The parent must decompose Phases 3–7 into the required one-component/route/generator tasks with exact, non-overlapping file lists. “To be determined” means a filename has not yet been established, not permission to edit arbitrary files. Timing below is a rough planning estimate, contingent on working dependencies/environment and excludes the founder's content-production time. These estimates are not a delivery commitment.

- [ ] **T1 (P1, human-team: ~2h / Codex+gstack: ~30min)** — Parent-owned setup: Update project instructions and configure the required agent roles.
  - Surfaced by: A3, Q1: preserve orchestration and repeatable phase gates before foundation work.
  - Files: `AGENTS.md`, `.codex/config.toml`.
  - Verify: Inspect both root instruction files and supported agent configuration; check every required command, design token and never rule.

- [x] **T2 (P1, human-team: ~8h / Codex+gstack: ~2h)** — Phase 1 foundation: Prove pinned framework compatibility and native Postgres verification.
  - Surfaced by: A3, L2, P2: no application exists; compatibility, native DB and baseline performance need evidence.
  - Files: `package.json`, `pnpm-lock.yaml`.
  - Verify: Fresh install/migration, admin and server HTML, then pnpm lint && pnpm typecheck && pnpm test && pnpm build; measure baseline public JS.

- [x] **T3 (P1, human-team: ~16h / Codex+gstack: ~4h)** — Phase 2 access and media: Implement public projections, media readiness and atomic reference protection.
  - Surfaced by: A1, S1–S4, D6, P1: access, input and media attach/delete boundaries require enforcement.
  - Files: to be determined at task preparation.
  - Verify: Anonymous API/draft tests, eight rendition dimensions/formats, failed upload cleanup and both attach/delete completion orders.

- [ ] **T4 (P1, human-team: ~16h / Codex+gstack: ~4h)** — Phases 2–5 publication and contact: Make committed publication and saved enquiries observable under failures.
  - Surfaced by: E1, D6, O1: afterChange timing, old jobs, repeated requests and external failures must not violate outcomes.
  - Files: to be determined at task preparation.
  - Verify: Separate-reader publication within 60 seconds, unpublish/order/restart tests, durable deduplicated receipt and provider-failure recovery.

- [ ] **T5 (P1, human-team: ~16h / Codex+gstack: ~4h)** — Phases 3–4 rendering and discovery: Share content traversal and verify real public URLs across all outputs.
  - Surfaced by: A2, Q1, T1: media and Markdown routing, visibility and full-content serialization must agree.
  - Files: to be determined at task preparation.
  - Verify: Server HTML plus parse/content assertions for each required output; image URLs crawlable under generated robots; reserved-slug and Markdown route checks.

- [ ] **T6 (P1, human-team: ~12h / Codex+gstack: ~3h)** — Phases 3 and 6 design quality: Implement the approved journey and prove its accessibility and performance.
  - Surfaced by: P2, U1, T1: actual content, readable palette roles and public-only JS must meet budgets.
  - Files: to be determined at task preparation.
  - Verify: Zero-content and populated layouts, keyboard/axe/theme checks, four Lighthouse scores >=95, LCP <2s, home JS <120kB gzip.

- [ ] **T7 (P1, human-team: ~12h / Codex+gstack: ~4h)** — Phase 7 operations: Rehearse native deployment, rollback, storage migration and restoration.
  - Surfaced by: L1–L2, F1, O2: code rollback, data restore, media switching and job/backup completion need evidence.
  - Files: `docs/DEPLOY.md`, `.env.example`.
  - Verify: Non-Docker CI DB, failed-migration stop, matching DB/media restore, health failure, worker restart, and verification of old uploads after a storage switch.

- [ ] **T8 (P1, human-team: ~2h plus content production / Codex+gstack: ~30min verification)** — Founder-owned launch content: Supply verified product evidence and ten eligible curated destinations.
  - Surfaced by: Q2 and approved office-hours assignment: launch content must meet exact requirements without invention.
  - Files: `docs/designs/passe-culinaire-headquarters.md`.
  - Verify: Verify product example/screenshot, resolve production facts, and check all ten selected published destinations and summaries before launch.

## 28. Review approval readiness and completion summary

Approval readiness: PASS for D1–D5. The source brief, “Approve with defaults”, the explicit home page priority, public-search permission, and the latest “Approve” of the reviewed design supply the accepted scope. No new feature, cut, independent external service or weakened acceptance criterion has been approved or silently introduced. Method-level clarifications implement those existing contracts. Business facts and runtime verification remain outstanding inputs, not claimed completed work.

The CEO review concludes that the approved company-to-product launch approach is coherent. It does not conclude that an unbuilt site is production-ready.

| Review area | Result |
|---|---|
| Mode | HOLD SCOPE, applying the existing full-scope approvals |
| System audit | Greenfield application; tooling/docs only; no manifest, commits or origin |
| Scope challenge | Retain full scope; one app, Postgres and existing jobs; no new platform service |
| Architecture | 3 findings, now explicit in plan |
| Errors | 12 paths mapped; 0 unhandled policy gaps; implementation unverified |
| Security | 4 findings, including 3 high-impact risks, with planned controls |
| Data/interaction | Ordering requirements plus 10 interaction cases, all with planned handling |
| Quality | 2 findings: shared traversal and exact ten-link launch-content dependency |
| Tests | Coverage diagram and 12 requirement assertions; no existing test pass claimed |
| Performance | 2 findings; actual budgets remain mandatory and unmeasured |
| Observability | 2 gaps formalised in existing jobs, submission state, health and logs |
| Deployment | 2 risks formalised: schema-aware rollback and native DB/CI |
| Future | Reversibility 3/5; media-switch procedure added to existing deployment obligation |
| Design | 1 finding; calculated contrast roles and all main UI states mapped |
| Failure registry | 12 rows, 0 silent/unhandled policy gaps, all awaiting implementation |
| Existing code / dream delta | Recorded; no application code to reuse |
| New TODOs / scope proposals | 0 / 0 |
| CEO archive | Not required in HOLD SCOPE; the working review is this plan |
| Outside voice | Claude Code export blocked by automatic approval review; no completed outside review |
| Lake Score | N/A: no new coverage-choice question was asked |
| Diagrams | 10 ASCII diagrams: architecture, error flow, data flows, publication states, two ordering schedules, test coverage, deployment, rollback and user journey |
| Stale diagrams | 0: approved design journey still agrees with this review |
| Unresolved review policy choices | 0; production inputs and implementation proof remain outstanding |
| Engineering review | Required by configuration; no recorded engineering review yet |

Artifact status: this plan contains the review body and registries. Eight task records were written and read back at /home/robangeles/.gstack/projects/codex-passe-culinaire/tasks-ceo-review-20260925-055052.jsonl. The terminal report passed read-back; CEO review, outside-review limitation and the scope decision were saved to local history and read back successfully. Artifact synchronisation is off. The active task remains building the approved website after the requested review workflow, not declaring the planning document to be a shipped application.

## 29. Implementation progress

Historical initial checkpoint, superseded by the acceptance records in sections 30 and 33. Phase 1 started after the user's “Approve” response. The parent updated the existing AGENTS.md symlink target first, preserving tool and orchestration instructions. The builder is implementing the application scaffold within an explicit file boundary.

Parent preparation completed:
- Created standalone project builder, executor and reviewer TOML roles using the current official Codex schema. Builder uses Sol, executor uses Luna; reviewer inherits the parent model and is read-only. The installed CLI reads the configuration, but its features command does not support --strict-config.
- Started a project-owned PostgreSQL 16.15 cluster on loopback port 55432, separate from the pre-existing system database. Database: passe_culinaire. Data lives under ignored .local/postgres; private development credentials live in mode-0600 .env.
- Verified Node 22.22.3 and pnpm 11.1.3. Builder verified the proposed dependency peer ranges using registry metadata.
- Phase 1 acceptance is pending: parent full-diff inspection, all four checks, migration/admin/home browser evidence and independent reviewer verdict. No phase is accepted yet.

Agent schema source: https://learn.chatgpt.com/docs/agent-configuration/subagents

## 30. Phase 1 acceptance

Accepted after parent source review, independent review PASS and browser evidence.

Built: pinned Next 16.3.6/Payload 3.90.2/Postgres/Tailwind/sharp scaffold; initial migration; local variable fonts and licences; exact brand tokens; SSR home and working Payload admin; strict checks and a server-rendering smoke test; private local database and agent roles.

Skipped within this phase: none. Full content models/permissions/seed remain Phase 2; public routes and theme toggle remain Phase 3; admin styling remains Phase 5.

Decisions: keep Payload's supported integration; scope lint to authored application/config/test files so downloaded project tools are not linted as this application; allow only required esbuild and unrs-resolver install builds; no extra application abstraction.

Parent verification output:
```text
pnpm lint       PASS (zero warnings)
pnpm typecheck  PASS
pnpm test       PASS (1 file, 1 test)
pnpm build      PASS
Next.js 16.3.6: / static; /admin/[[...segments]] and /api/[...slug] dynamic
```

Initial migration applied to a fresh private PostgreSQL 16.15 database. Browser: home has one h1 and main landmark, all three local fonts loaded, no console errors. Mobile/tablet/desktop screenshots inspected at /tmp/passe-phase1-home-{mobile,tablet,desktop}.png. Admin returns 200 and shows its first-user form without console errors; anonymous /api/users returns 403. Reviewer task reviewer_phase1 returned PASS; no fix-first findings.

Early performance measurement: linked script files total 173733 bytes gzip including the legacy nomodule script (39373 bytes). Modern-browser baseline is 134360 bytes, above the final 120 kB home budget. This is a measured Phase 6 acceptance risk, not a relaxed requirement or a claimed pass. Verify actual browser transfer/request set and optimise before final acceptance.

## 31. Engineering review of docs/PLAN.md

Review date: 25 September 2026. Target and report: this approved plan. Baseline: 75dcd11. Scope: FULL_REVIEW, using the user's "Approve with defaults" and subsequent "Approve"; the fixed stack, complete feature list and original directory arrangement remain approved. No feature cuts or new products are proposed. The parent owns this review. Phase 2 code under construction is not credited as verified behavior.

### Scope challenge and existing solutions

The 32-file Phase 1 scaffold already passes its gate. The full plan necessarily exceeds eight files: it includes 12 requested collections, three globals, 15 blocks, public routes and discovery outputs. The original arrangement at PLAN.md:34 remains appropriate; collapsing these into one file would not reduce operational complexity. Feature answers: D1–D5. Structure: original arrangement under the user's approval of the full plan and defaults. Accepted scope: all seven phases, no cuts. Pending policy remedies: none. This record reuses approvals; it does not invent a new user answer.

[Layer 1] Reuse Payload authentication, drafts, versions, migrations, local API, official storage/email adapters and its jobs queue. [Layer 1] Use PostgreSQL transactions and transaction-scoped advisory locks for atomic media-reference rules. [Layer 1] Use supported Next cache invalidation and server rendering. Do not introduce Redis, another queue, a generic repository layer or a second CMS.

Existing authored reuse points: src/payload.config.ts:18 owns framework configuration; src/payload/collections/Users.ts owns authentication; public layout owns local fonts. Proposed shared visibility/SEO/rich-text functions have several planned callers (HTML, feeds, Markdown and structured data) with explicitly different output policies. Extract only the common publication predicate and typed document projection; keep sitemap-only exclusion separate. No verified duplicated first-party implementation exists yet, so no speculative extraction or line-savings claim is made.

History contains the approved-plan and scaffold commits, with no reverts. No TODOS.md exists. No prior learning was returned by the helper. Its current post-initial-commit review-history lookup returned NO_REVIEWS; earlier CEO records remain documented above and are not presented as fresh helper-discovered records.

Search evidence: [Payload transactions](https://payloadcms.com/docs/database/transactions), [Payload jobs](https://payloadcms.com/docs/jobs-queue/jobs), [PostgreSQL 16 locking](https://www.postgresql.org/docs/16/explicit-locking.html), [Next revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag). Installed code, rather than mutable web examples, determines exact signatures.

### Architecture review

Boundaries: one Node app, embedded CMS, one Postgres database and a persistent media directory or selected S3 adapter. Public HTML and machine outputs share safe content projections. Private preview, auth, submissions and admin bypass shared caches. Single-host failure and backups remain explicit. Distribution stays native Node on Ubuntu 24.04 with CI checks and manual deployment.

E-A1 [P1] (confidence 10/10), PLAN.md:96: "Published changes appear within 60 seconds." Installed Payload create.js:388–421 executes afterChange before commit. Immediate hook-side invalidation can read the old transaction state. Required implementation of the already-approved ordering contract: enqueue the existing Payload job with the same req, invalidate after committed visibility, and query current state rather than replaying document snapshots. Carry old/new slugs and dependent-output invalidations. A worker interval must leave headroom inside 60 seconds. No new infrastructure is authorised or needed.

E-A2 [P1] (confidence 9/10), PLAN.md:45: "Admin, authentication, preview, submissions and personalised responses must never use shared public caching." Route invalidation alone does not expire all tagged content, and stale-while-revalidate can serve an old response on the first post-publish request. Required proof: invalidate relevant tags with supported immediate-expiry semantics where correctness requires it, plus old/new route paths; test public, noIndex, unpublish and preview behavior on a production server. Do not treat a helper invocation as proof of public freshness.

The public-media endpoint is now explicitly included with Phase 2 storage implementation: /media/[filename], validated against stored filenames/variants, with bounded file delivery. This implements the already-approved crawler contract; it does not add a new feature. Media metadata mutations remain access-controlled.

Error flow: DB write fails -> transaction rollback and failed save; media in use -> conflict/clear rejection; invalid public slug -> 404; required DB read fails -> approved 503/no-store; invalid preview/job credential -> denial; email/IndexNow failure -> retained DB state and inspectable delivery/job error. The HTTP 503 implementation still needs a supported framework-boundary proof in Phase 3; an ordinary error.js boundary returning 500 is insufficient.

### Code quality review

No issues found in the accepted Phase 1 source. Parent Ponytail review found no unnecessary application abstraction to remove. The package additions each have a stated purpose in the scaffold commit. Generated migrations, lockfiles and font licences are retained.

For planned code, use a small schema field builder only where the same SEO fields are actually shared; do not erase service/event distinctions. Keep pure serializers independent of database access and side effects. Use typed exhaustive block handling, URL allowlists for controlled embeds, explicit server-only modules, and narrow public author fields. Errors must preserve useful state and avoid credential logging. Existing architecture and ordering diagrams remain accurate; add inline explanations beside transaction-lock and publication-queue hooks when implemented.

### Test review and coverage diagram

Detected framework: Vitest 5.0.1, tests/home.test.tsx. Playwright remains the approved browser framework for later phases. The existing test performs real React server rendering but is a smoke test, not CMS coverage. The following map describes proposed paths and required proof; it does not pretend future code or tests already exist.

```text
ENTRY / BRANCH                                      COVERAGE AND USER FLOW
Home -> render heading/main/product link            [smoke TESTED] home.test.tsx:7
Configuration -> missing env / invalid mode          [GAP T01] calm startup failure
CMS read -> admin/editor/anonymous                   [GAP T02 ->E2E] access + no private fields
CMS save -> incomplete draft / valid publish / bad  [GAP T03 ->E2E] field errors, draft retained
Slug -> empty/reserved/duplicate/rename/.md          [GAP T04] 404 and collision handling
Media -> valid/invalid/small/oriented/oversized      [GAP T05 ->E2E] 8 variants or useful rejection
Media delete/attach -> either transaction first     [GAP T06 ->E2E] no dangling draft reference
Seed -> fresh / repeat / editor-modified records    [GAP T07 ->E2E] no duplicates or overwrite
Contact -> invalid/spam/new/duplicate/DB failure     [GAP T08 ->E2E] fields + same receipt
Contact email -> success/failure/operator handled   [GAP T09 ->E2E] saved enquiry survives
Publish -> commit/rollback/old job/new job/retry     [GAP T10 ->E2E] current HTML within 60s
Public lookup -> found/empty/draft/missing/DB error  [GAP T11 ->E2E] full HTML, 404 or 503
Preview -> valid/expired/anonymous/cache collision  [GAP T12 ->E2E] private draft only
Search/listings -> empty/query/pagination/status    [GAP T13 ->E2E] correct public results
Discovery -> visibility/canonical/XML/JSON/Markdown [GAP T14] exact outputs and content types
Admin -> duplicate/schedule/timezone/cancel/stale   [GAP T15 ->E2E] draft-safe editor workflow
Navigation/theme/forms -> keyboard/mobile/storage [GAP T16 ->E2E] focus and recovery
Images/JS/cache -> cold/warm/mobile/third-party     [GAP T17 ->E2E] measured budgets
Operations -> DB down/migrate/backup/restore/reboot [GAP T18 ->E2E] health and durable recovery

Proposed publication sequence:
 editor save -> validate -> DB transaction [content + queued task]
                              | rollback -> neither visible
                              + commit -> worker -> expire tags + paths
                                           | failure -> retry/visible job error
                                           + success -> next read uses committed state
 Two jobs in reverse order -> invalidate only -> never restore old snapshots

Proposed media sequence:
 writer/delete -> same transaction lock -> current + draft/version refs
                   | attach after deleted ID -> reject
                   | delete with reference -> reject
                   + unreferenced delete -> DB commit -> storage cleanup
 Storage failure after DB change -> recorded recoverable cleanup condition
```

Coverage inventory: 1/19 path groups has an automated smoke test; 18 planned groups remain. This is a planning inventory, not statement or branch coverage. Browser checks also verified the Phase 1 home/admin manually. No product LLM call or prompt change exists, so no model-quality eval suite is needed. Agent role configuration follows the explicit user orchestration and has not been labelled as product AI coverage.

Required tests (proposed filenames may be fitted to the implemented modules):
- tests/config.test.ts: missing signing secret/DB URI and inconsistent provider configuration fail without revealing values.
- tests/access.integration.test.ts: admin/editor/anonymous direct REST and Local API reads/writes, field-level author projection, privilege escalation, drafts, settings and private submissions.
- tests/publication.integration.test.ts: incomplete draft survives; invalid publish rejected; rollback creates no task; successful transaction queues task; both revision orders, delete/unpublish/rename and retries preserve newest state.
- tests/media.integration.test.ts: all eight actual decoded variant dimensions/formats, small/oriented input policy, unsupported/oversized upload, public URL traversal, current/draft/version/global/Lexical references, and both concurrent attach/delete orders.
- tests/seed.integration.test.ts: fresh migration, exact requested seed counts/statuses, repeated run stable, editorial changes preserved, no testimonials.
- tests/contact.integration.test.ts: invalid/missing reply email, abuse limits, concurrent same receipt, DB failure, email success/failure, no duplicate mail, operator recovery state.
- tests/slug.test.ts and tests/visibility.test.ts: reserved names, suffix collision, noIndex versus sitemap-only exclusion, draft/public author rules.
- tests/rendering.test.tsx: each block and Lexical type, empty collections, escaped unsafe text/URLs, heading hierarchy and missing optional relationships.
- tests/discovery.test.ts: JSON-LD stable linked IDs, each schema type, safe overrides; six sitemap children, XML escaping/date/image entries, RSS/JSON full content, Markdown parity, curated ten-link production gate and complete paginated llms-full output.
- tests/site.spec.ts: five core routes plus detail/taxonomy/author/service/training/search, no-JS content, preview isolation, two-admin publish within 60 seconds, duplicate/schedule, theme storage failure, focus, keyboard, rapid contact resubmit and recovery after navigation.
- tests/operations.integration.test.ts plus deployment drill: health status, native clean DB migration, persistence after restart, backup restore and schema-aware rollback.
- Lighthouse/axe checks: all required mobile budgets and WCAG checks against representative content; no waived or silently skipped failures.

All listed tests implement existing approved behavior. No optional coverage policy or new runtime guarantee is introduced. Regression priority: Phase 1 SSR/local-font behavior and auth privacy must remain intact throughout Phase 2.

### Performance review

E-P1 [P1] (confidence 10/10), PLAN.md:103: "home-route JavaScript below 120 kB gzipped." The accepted Phase 1 HTML references 173733 gzip bytes of scripts, including 39373 bytes in a legacy nomodule script; modern scripts total 134360 bytes. This exceeds the final budget before custom interactions. Required work: confirm the real cold-browser request set, attribute framework versus application code, test supported bundler/Next options without weakening required functionality, and rerun the final budget. No claim of infeasibility or permission to raise the budget is made.

Other planned performance paths: bound database page sizes and relation depth; use indexed published/slug/search queries; avoid per-block repeated queries; constrain upload bytes/pixels and encoding concurrency; stream or paginate full exports without truncating content; keep client islands narrow; reserve hero dimensions and select existing variants. Single-VPS resource limits and actual p95/p99 remain measurement questions, not invented service promises.

### Failure modes, scope and dependency order

All 18 gap groups have an explicit planned error policy or required test above and in the CEO registry. Critical gaps with neither error handling nor tests specified: 0. Unimplemented tests remain visible; this is not a shipping clearance.

NOT in scope: newsletter (user-approved omission), live weather (two different signature details selected), automatic deployments (explicitly excluded), new capacity infrastructure, real testimonials without source material, and invented product outcomes. Nothing required by the brief is deferred out of v1.

| Step | Modules touched | Depends on |
|---|---|---|
| Foundation | app/config/fonts/styles | accepted Phase 1 |
| Content | payload/lib/migrations/scripts/tests | foundation |
| Public views | app/components/styles/tests | accepted content |
| Discovery | app/lib/tests | accepted content and public route contracts |
| Admin workflow | payload/components/tests | accepted content |
| Quality/operations | tests/docs/CI | integrated application |

Implementation is sequential while collection schemas, shared utilities and generated types are changing. Later executor tasks may run only on explicitly disjoint files. Shared layout/config/schema edits remain sequential. The user requires a parent full-diff read, four checks and independent review after every subagent; this overrides any generic worktree-parallelisation suggestion. Current lanes: builder implementation and parent-owned review/documentation, with no shared-file edits.

### Decision ledger and readiness

E-A1: approved contract from D1–D5 and PLAN.md:96; implementation detail uses built-in transactional jobs. Required proof remains pending.
E-A2: approved public/private cache contract at PLAN.md:45 and publication target at :96; no changed policy.
T01–T18: required proof of the original brief and approved phases; future paths explicitly labelled.
E-P1: original 120 kB budget retained; investigation and optimisation authorised by the build request. A proposed budget change would need a separate user decision.
Approval readiness: PASS for these existing contracts under "Approve with defaults" and final "Approve". New unresolved policy choices: 0. Implementation readiness does not mean shipping readiness.

### Implementation tasks from engineering findings

Effort estimates assume existing framework APIs and include tests; they are estimates, not deadlines.
- E1 (P1, human ~1 day / agent ~1 hour): prove committed publication and immediate dependent-output expiry; Phase 2–4 hooks/jobs/cache plus publication integration tests. Sources E-A1, E-A2, T10/T12.
- E2 (P1, human ~2 days / agent ~2 hours): complete model/access/media/contact integration proofs; src/payload, src/lib, scripts and tests. Sources T01–T09.
- E3 (P1, human ~2 days / agent ~2 hours): complete public rendering/discovery/admin workflow proofs; app/components/lib/tests. Sources T11–T16.
- E4 (P1, human ~1 day / agent ~1 hour): reduce and verify the measured home JS baseline and all mobile budgets; app/config/quality checks. Sources E-P1, T17.
- E5 (P1, human ~1 day / agent ~1 hour): verify native migrations, backup restoration, health and restart; operational scripts/docs/CI/tests. Source T18.
No new tasks from Code Quality. No standalone TODO proposals. These tasks refine the existing phase work rather than replacing it.

### Outside coverage, completion and suppressed findings

Outside voice remains unavailable: automatic approval review previously rejected sending this plan's business/architecture content to Claude Code. No retry or alternate export was attempted. The skill's exact native fallback requires undeclared Plan/TaskOutput/TaskStop capabilities and was not substituted with a general-purpose agent. Independent Phase 1 implementation review is real, separate coverage; it is not called an outside plan review.

Completion: Scope accepted as-is; Architecture 2 findings; Code Quality 0; Tests 18 planned gap groups mapped; Performance 1 finding; total 21. NOT in scope and existing reuse recorded. TODO proposals 0. Critical silent policy gaps 0. Unresolved decisions 0. Shipping issues remain until implementation proof and performance pass. Outside voice unavailable. Parallelism: one implementation lane plus parent review, subsequent shared-code work sequential. Lake Score N/A (no new coverage-choice question).
Suppressed findings: none. The unverified HTTP 503 implementation is explicitly a pending implementation proof, not an observed defect.

Engineering artifacts saved and read back: /home/robangeles/.gstack/projects/codex-passe-culinaire/robangeles-main-eng-review-test-plan-20260925-062702.md and tasks-eng-review-20260925-062702.jsonl (five tasks). Local review history records issues_open and outside unavailable. Artifact synchronisation remains off. Navigation follows the existing user-authorised build; no additional permission gate is introduced.

## 32. Pending performance decision D6

New evidence after engineering review: the isolated accepted scaffold built successfully with the installed supported webpack flag. Modern linked scripts measure 132304 bytes gzip, versus 134360 under Turbopack. Both exclude the verified nomodule legacy script; this is not an application-feature payload. The webpack probe used /tmp/passe-webpack-probe-m4v_yoy9 and did not change the working application.

E-P1 reopened for an actual constraint choice. Current approved values remain Next 16/Payload 3 and home JS below 120 kB; no relaxation has been applied. This is a measured conflict in the tested implementations, not proof that every possible Next optimisation is impossible.

Question D6 sent through request_user_input_async:
The empty Next.js 16/Payload home page measures 132–134 kB of modern-browser JavaScript with both supported bundlers, above your 120 kB limit before adding interactions. Which constraint should take priority? This clarification comes from the conflicting stack and performance requirements in your brief; Phase 2 can continue meanwhile.

Options:
A) Keep the fixed stack; allow a 160 kB home JavaScript ceiling
B) Keep the strict 120 kB ceiling; investigate a different public-site stack

Recommendation: A preserves the user's required application stack and reserves a small interaction budget. B authorises investigation only; it does not approve a replacement framework or discard completed CMS work.

| Constraint | Current approval | A | B |
|---|---|---|---|
| CMS/framework | Next 16 + Payload 3 | retained | retained pending investigation and a separate implementation choice |
| Home JS ceiling | <120 kB gzip | <160 kB gzip | <120 kB gzip |
| Other performance/accessibility requirements | unchanged | unchanged | unchanged |
| Phase 2 content work | authorised | continue | continue |

State: pending
Actual answer: none received
Accepted scope: unchanged; continue independent content work. Do not use elapsed time or the UI preselection as approval.

## 33. Phase 2 acceptance

Accepted on 25 September 2026 after parent full-diff review, repeated parent check runs, production HTTP/browser verification and independent reviewer PASS. Initial FIX FIRST findings for redirect validation and image edge-case coverage were corrected and reviewed again. A separate review passed the strict generated-type correction.

Built: all 12 requested collections, three globals and 15 page-block schemas; Lexical image/quote/code/controlled-embed definitions; draft/version and publication validation; admin/editor permissions and public author projections; media in both formats at all four widths, reference locks across current records/drafts/versions/globals, and crawler-accessible delivery; safe internal redirect fields; saved/idempotent contact handling with SMTP/Resend configuration; same-transaction publication jobs and dependency hooks; six committed schema migrations after Phase 1; repeatable seed with two configurable admins, 12 placeholders, four company pages, three draft services, two draft training entries, three draft posts and no testimonials.

Actual final parent command output:

```text
pnpm lint: eslint ... --max-warnings=0 (exit 0)
pnpm typecheck: tsc --noEmit (exit 0)
pnpm test: Test Files 2 passed (2); Tests 25 passed (25)
pnpm build: Compiled successfully; TypeScript finished; static pages 3/3
Routes: /, /_not-found, /admin/[[...segments]], /api/[...slug], /media/[filename]
git diff --cached --check: clean
```

Tests migrate a fresh separate database, seed twice, preserve editorial changes, authenticate both admins and an editor through real JWT sessions, exercise anonymous REST/Local API projections, verify reference races in both orders and saved versions, and prove job visibility only after commit plus rollback and stale-job behavior. Contact tests cover concurrent duplicate requests and provider/status-write failures. Image tests inspect every rendition, EXIF pixel orientation, alpha and stored focal coordinates. Redirect tests exercise actual create/update rejection. An additional isolated corrupt-upload probe rejected the file without changing media count or stored files.

Production verification: both administrator logins returned 200; anonymous author fields were public-only; draft journal results were empty; submissions returned 403; public media returned 200 image/webp. The seeded home block editor rendered three hydrated rich-text editors with their saved content, and no browser console messages. Native providers are configured but not falsely represented as exercised.

Skipped within Phase 2: none. Live SMTP/Resend and S3 service calls require external configuration and remain explicitly unverified. Public revalidation endpoint, dependent-output freshness within 60 seconds, public routes and preview are Phase 3–5 work. Scheduled publishing and automatic first-publication timestamp stamping remain Phase 5 editorial work. D6 remains unanswered; neither stack nor JavaScript ceiling has changed.

Decisions within approved scope: use same-site redirects; enlarge small sources to provide all eight required renditions; use Payload's supported generation hook to narrow Lexical node discriminators to string; leave the background worker disabled until its secured consumer exists. Added packages: email-nodemailer for SMTP, email-resend for Resend, storage-s3 for configurable object storage, and tsx for typed seed/test setup. All additions are pinned.

## 34. Phase 3 CMS rendering checkpoint

Accepted portion: all 15 server-rendered blocks, shared Lexical renderer, CMS-driven header/footer, persistent theme preference, the CMS home and generic page routes, bounded batched feed reads, authenticated draft reader/preview endpoint, and secured publication invalidation. This is a checkpoint, not Phase 3 acceptance.

Parent full diff review and independent reviewer PASS. Final gate after the browser-found hero gutter correction:

```text
pnpm lint: passed, zero warnings
pnpm typecheck: passed
pnpm test: 14 files passed, 82 tests passed
pnpm build: compiled successfully
/: static, revalidate 10m, expiry about 1d
/[slug]: on-demand static generation
/api/preview and /api/revalidate: dynamic server endpoints
```

Production HTTP proof: home/about/product return 200 with full text and one h1; `s-maxage=600, stale-while-revalidate=86400`. Draft responses are private/no-store and require current staff authentication; a draft-mode cookie alone gives no draft access. A committed auto-queued publication job refreshed a temporary page in 78 ms; reversed revision jobs retained current content; unpublish returned 404. The temporary record was removed. Mobile home has a 16 px gutter, no horizontal overflow at 375 px, and no browser console errors. Keyboard skip focus and theme storage-denial behaviour also pass.

Actual required-DB-failure probe: bare Next returns 500; the tested Caddy boundary returns 503/no-store and readable initial HTML, without an early successful response. Phase 7 must include this boundary. Caddy must also make the explicit `public` cache directive part of the production header; current Next includes the required shared-cache intervals but omits that redundant keyword.

Remaining Phase 3: journal/taxonomy/author/service/training routes, PostgreSQL search, contact submission UI/endpoint, redirect use, complete responsive/keyboard/error checks and all-route freshness. Background automatic job execution and scheduling remain Phase 5. Machine-readable outputs remain Phase 4. D6 remains unanswered.

## 35. Phase 3 public routes and contact checkpoint

Accepted portion: journal index/detail and category/tag/author pagination; service and training index/detail; shared listing navigation; indexed PostgreSQL search over published page/post text; a discoverable search link; private contact page and progressively enhanced server action. All new public routes provide their content in initial HTML. The search-index migration has been applied to the development database and to a fresh test database.

Parent full-diff review and independent reviewer PASS after fixes. Actual final command output:

```text
pnpm lint: eslint ... --max-warnings=0, exit 0
pnpm typecheck: tsc --noEmit, exit 0
pnpm test: Test Files 30 passed (30); Tests 189 passed (189)
pnpm build: Compiled successfully in 2.4s; TypeScript finished; static pages 7/7
```

Production HTTP fixtures exercised journal body paragraphs, category/tag/author results, service and cancelled training details, all three indexes and search. Every checked response returned 200, server text and exactly one h1. Unpublishing the test post returned 404; all temporary publishing fixtures were removed. A real author-route 500 exposed an invalid anonymous query on the private publicProfile field. The reader now relies on the collection access predicate; a PostgreSQL regression proves public profiles work, private profiles remain absent and account fields stay excluded.

Contact verification used actual browser submissions and native multipart HTTP requests with no client JavaScript. Distinct initial responses receive distinct request IDs; all contact responses are private/no-store. Validation retains text and select values; keyboard focus moves to the error or receipt. A saved enquiry with no configured email provider reports notification failure truthfully. Repeating a request returns the same receipt. Starting another enquiry now performs a native GET and opens an empty form; the earlier client navigation retained stale receipt state. Mobile width 375 px has no horizontal overflow and no console errors. Four labelled local submission probes were removed. SMTP/Resend delivery remains unverified without production configuration.

Within-scope decisions: list routes use at most 1,000 pages with an explicit display at the bound; search shows at most 1,200 matches with a refine-search note. No navigation points beyond the supported limits. Machine exports will still include all eligible content. Contact remains private instead of using shared caching, as required for per-visitor submission identifiers. Native browser no-script toggling was unavailable in the installed browse tool; direct multipart requests verified progressive enhancement without executing JavaScript.

Built: all routes and form behaviour described above. Skipped within this checkpoint: none. Remaining Phase 3: managed redirects, branded missing/error states and final responsive/keyboard/freshness acceptance. Phase 4 discovery/metadata, Phase 5 automatic publishing, Phase 6 measured quality budgets and Phase 7 deployment/CI remain. D6 is still unanswered; no performance requirement was relaxed.

## 36. Phase 3 acceptance: redirects and error delivery

Phase 3 is accepted after parent full-diff review, independent reviewer PASS after fixes, all-route HTTP verification and focused browser checks. The new Node proxy resolves managed same-site redirects using exact indexed reads and a server-only read capability, preserving admin-only REST access. It protects infrastructure paths after repeated decoding, bounds chains and avoids cycles. Actual 301, 302, 307 and 308 responses, immediate rule updates, deletion and 403 for anonymous redirect collection reads all passed. Temporary rules were removed.

Branded missing-page and retry components are built. A framework issue persisted with both root and nested not-found experiments: bare Next returns a 404 shell whose content needs hydration. The approved native Caddy boundary now supplies complete static 404 and 503 documents with local licensed fonts. These responses work with JavaScript off and the error assets remain available when Next is stopped. Caddy adds the exact `public, s-maxage=600, stale-while-revalidate=86400` header to anonymous shared-cache responses while preserving private contact/preview responses. This boundary is mandatory in production and recorded in deploy/Caddyfile; full VPS setup remains Phase 7.

Final mandatory check output:

```text
pnpm lint: eslint ... --max-warnings=0, exit 0
pnpm typecheck: tsc --noEmit, exit 0
pnpm test: Test Files 31 passed (31); Tests 194 passed (194)
pnpm build: Compiled successfully in 2.6s; TypeScript finished; static pages 7/7
Caddy validate: Valid configuration
```

Additional production-mode evidence: all route classes provide published text in initial HTML; draft/unpublished records return 404; real search excludes draft revisions; public authors exclude account fields. The transactionally queued publication path and reversed-job ordering were proved at the earlier CMS checkpoint, and the expanded content/listing/search fixtures reflected invalidation without rebuilding. Mobile journal/services/training/search all have one h1 and no horizontal overflow at 375 px. Search skip-link focus reaches main-content, fresh console is clear, and desktop search plus mobile static 404 were visually inspected. Contact native-request, duplicate, validation-retention and receipt-reset checks are recorded in Section 35.

Built: the complete Phase 3 public rendering, search, contact, preview, redirect and response-boundary scope. Skipped: no Phase 3 feature. External email delivery remains unverified; automated scheduling and continuous job execution are Phase 5. Phase 6 still requires the broader automated accessibility/performance suite and budgets. Assumptions retained: same-site redirect destinations, loopback Next behind Caddy, initial offerings and posts remain drafts, truthful empty states. D6 remains unanswered, with stack and home-JavaScript requirements unchanged. The proxy's additional indexed lookup must be included in performance measurement.

## 37. Phase 4 acceptance: discovery and publication

The parent reviewed all delegated source and tests, reran the full gate, and obtained a final reviewer PASS. The reviewer’s earlier finding that LLM summaries implied available published services, training dates and posts was corrected to truthful descriptions suitable for the empty states. Initial offerings and journal samples remain drafts.

Built: route metadata and canonical URLs; safe route-specific JSON-LD and visible related testimonials; six root-named child sitemaps and the index; full RSS and JSON Feed; Markdown article mirrors and full page/post LLM exports; editable curated LLM index; named crawler robots rules; local Fraunces OG rendering; environment-gated IndexNow submission after cache invalidation. Exports finish their database work before returning 200, use bounded document batches and stream completed temporary files. Private author fields, drafts and noIndex content are excluded according to the discovery policy.

Production-mode HTTP verification through Caddy passed with temporary fixtures subsequently deleted. Publication reached all dependent discovery outputs in 116 ms without rebuilding. Populated RSS and image sitemap XML parsed; JSON Feed contained article HTML; published article metadata and schemas matched its HTML. Generated PNG: 1200 × 630, 33,780 bytes, visually inspected. noIndex removed every export and the Markdown mirror; sitemap-only exclusion retained feed/Markdown content; unpublishing removed the mirror and feed item. Service/training quotes were present in visible HTML and Review graphs. The baseline machine endpoints returned 200 with their specified MIME/cache headers.

The HTTP probe caught two defects beyond mocks: the server font retained variable metadata, and separately compiled Next bundles created different redirect capability symbols when a feed initialised Payload first. The font is now a fully static local instance with a real PNG regression test. The server capability uses a shared registry symbol, which HTTP JSON cannot construct; a module-reload regression and cold feed-first `/feed.json`, `/`, `/journal` sequence all pass. Public redirect API access remains protected.

Actual final gate output, 25 September 2026:

```text
$ eslint src tests scripts *.mjs vitest.config.ts --max-warnings=0
$ tsc --noEmit
Test Files  47 passed (47)
     Tests  266 passed (266)
✓ Compiled successfully in 1961ms
✓ Generating static pages using 19 workers (7/7) in 310ms
GATE_EXIT=0
```

Evidence retained locally in `.local/phase4-gate-final.log`, `.local/discovery-http-baseline.json` and `.local/discovery-publication-probe.json`. IndexNow 200/202/retry/order behavior was tested with a stub provider; no live key exists and no production submission is claimed. Nine genuine curated destinations currently exist; a tenth approved published page/post remains a production content input. No fictitious offering was published to fill the index. Any future response-caching CDN needs publication-triggered purging to preserve the 60-second contract.

## 38. Phase 5 implementation direction

Use Payload’s supported admin graphics, UI fields, named/unnamed tabs, live-preview configuration, built-in duplication hooks and the supported task queue. Keep existing content field paths stable, so moving fields into visual tabs does not rename database columns. Use the existing authenticated draft endpoint for the preview iframe and refresh only an authenticated preview after an allowed same-origin save message. Use explicit scheduling identity restoration and verify permissions at execution time. Installed Payload 3.90.2's native schedule drawer silently normalises DST wall times and shows a success toast for returned server errors. A small Publish-tab panel therefore validates the original wall-clock input before queuing the supported task, rejects missing/repeated Melbourne hours, offers explicit UTC and accurately displays failures. Native immediate Publish, drafts, versions and duplication remain in use. An authenticated worker path and documented systemd cadence must run without an open browser. Test both admins and retain existing editor/global/media restrictions. Parent owns all configuration, migration, access and route integration; executor tasks own individual admin components or bounded routes.

## 39. Phase 5 acceptance: editorial workflow

Accepted locally on 25 September 2026 after parent integration and fresh independent review. Added branded Payload admin, Content/SEO/Publish tabs, effective search preview and counters, authenticated save-triggered live preview, safe draft duplication, publication timestamps, and administrator-only scheduling with the supported Payload job queue. The small custom scheduling panel rejects ambiguous/missing Melbourne times, supports explicit UTC, reports server failures accurately, and lists/cancels pending jobs. Generic job permissions remain admin-only; execution rechecks the scheduling account, including demotion. The signed worker endpoint and operator command run two bounded batches to include dependent invalidation. Committed migration adds job enums without renaming content columns and refuses rollback while affected job history exists.

Parent gate: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` passed. Actual output: `Test Files 52 passed (52)`, `Tests 293 passed (293)`, `Compiled successfully in 1554ms`, `GATE_EXIT=0`. Log: `.local/phase5-gate.log`. Independent reviewer returned PASS after fixing admin-only scheduling and again after the proxy-origin fix. Scheduling compares Origin to the configured public origin, never an untrusted forwarded host or the internal proxy URL.

Browser evidence: branded admin sign-in, SEO preview, saved draft side-by-side refresh, missing/repeated Melbourne time rejection, valid UTC job listing through real Payload JSON queries, and successful cancellation. HTTP evidence for both seeded administrators: sign in, create block draft, private authenticated preview, anonymous draft denial, immediate publication, safe duplication, and scheduled publication while the editor was closed. Public HTML and sitemap updated in 87–106 ms; scheduled HTML appeared 116–130 ms after its due instant. Expired preview returned private 401. Caddy forwarding accepted the configured public origin and reached the expected unauthenticated 401 rather than a false origin rejection. Temporary fixtures were removed and invalidation run. Evidence: `.local/phase5-browser-evidence.json` and `.local/phase5-http-evidence.json`.

Built: all Phase 5 editorial features and operator guidance in `docs/EDITORIAL.md`. Skipped: live VPS/domain execution, which needs a deployment target and private production configuration. Assumed: Melbourne default and UTC alternative; administrators schedule jobs, editors retain immediate publication but cannot manage jobs. No production services, events or sample posts were published. The ten-link content gate and Phase 6 performance budgets remain open.


## 40. Phase 6 verification checkpoint: budgets remain open

Built: isolated desktop/mobile Playwright suites, axe accessibility checks, strict home JavaScript measurement, and three-run Lighthouse CI through the deployment Caddy TLS/HTTP2 handlers. Temporary credentials exist only in the test process, provider calls are disabled, and reports remain local. The shared database guard rejects connection overrides and encoded aliases before any test reset. No production database or external service is used by these quality commands.

Loading fixes preserve the approved design: retain Fraunces optical-size and weight axes while pinning unused axes to their defaults; load the mono font when used; eagerly request early founder portraits; add a licensed outlined favicon; inline CSS; and scope Payload colour-scheme negotiation to admin routes. The last fix removes an unnecessary browser navigation restart on public pages. Neither the stack nor an acceptance limit has been changed.

Actual browser output: `20 passed (19.7s)`, `2 failed`. Both failures are the home JavaScript budget: 158,225 bytes desktop and 158,194 bytes mobile against fewer than 120,000 bytes. Prior measurements with external CSS were 146,621 bytes with Turbopack and 147,725 bytes with Webpack; switching bundlers did not meet the ceiling.

Caddy HTTPS/HTTP2 measurements use the documented 150 ms RTT, 1,638.4 kbit/s, 4x CPU mobile profile. All five routes scored 97–99 Performance and 100 Accessibility, Best Practices and SEO. Median LCP: home 2,478 ms, about 2,481 ms, CulinAIre Kitchen 2,345 ms, journal 2,326 ms, contact 1,951 ms. Reasserting saved reports with explicit median aggregation exits 1 because four medians exceed the 1,999 ms ceiling. These are failed acceptance checks, not waived requirements. Manual mobile-light and desktop-dark inspection found no new console errors.

Built/skipped/assumed: the automated harness and loading fixes are built; Phase 6 acceptance and Phase 7 deployment work are not complete. Live DNS, publicly trusted TLS, VPS execution, provider delivery and final photography have not been verified. Measurements use truthful seeded launch content and clearly labelled placeholder media. D6 remains unanswered. Any exception must cover the measured JavaScript and LCP limits explicitly; continuing work does not imply approval to relax either limit. Evidence: `docs/QUALITY.md`, `.local/phase6-e2e.log`, `.local/phase6-lighthouse-summary.json`, and local browser/Lighthouse reports.

Parent full-diff review and fresh independent code review returned PASS after database-guard fixes. Final integration gate output on 26 September 2026: `Test Files 53 passed (53)`, `Tests 296 passed (296)`, `Compiled successfully in 459ms`, `GATE_EXIT=0`. Command: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; log: `.local/phase6-gate-final.log`. Code review PASS does not accept the failed Phase 6 performance gate.


## 41. Approved performance exceptions and Phase 7 direction

On 26 September 2026 the user replied “Apporve” to the explicit choice to retain the stack and document exceptions for both measured performance limits, then asked to continue. This resolves D6/E-P1. Phase 6 is accepted locally with those disclosed exceptions; the original 120 kB and 2-second targets were not met. Preserve scores >=95 in every Lighthouse category. Default regression guards use <160,000 bytes home JavaScript and <=2,600 ms median mobile LCP, providing a small tolerance around 158,225 bytes and 2,481 ms. `QUALITY_STRICT_BUDGETS=true` restores the original failing targets for ongoing optimisation. This is an approved trade-off, not a retroactive claim that the original gate passed.

Phase 7 uses one native Node process behind Caddy, PostgreSQL 16, persistent local media, and a systemd timer calling the existing authenticated job endpoint every ten seconds. Disable embedded autoRun when the timer is installed. Add a bounded, independent database health probe; nightly matched database/media backups during a brief write pause; a restore rehearsal in a separate local database; and GitHub Actions using native PostgreSQL without service containers. Builds use isolated seeded data with the production canonical origin, never production database credentials; clear persisted route/data caches before the new process serves live content. No live VPS, DNS or external delivery is assumed available.


## 42. Phase 7 implementation and operations rehearsal

Built: bounded Node health route using a one-connection PostgreSQL probe with connection/query/server timeouts and a response deadline; matching local database/media backup with checksums, atomic completion and retention; systemd application, ten-second worker and nightly backup units; startup revalidation/warm-up; native PostgreSQL GitHub Actions matrix for integration/browser/performance; completed environment reference and Ubuntu deployment/recovery/S3 runbook. Direct `pg` and `@types/pg` dependencies make health independent of unbounded CMS initialisation while reusing the already installed driver version.

The parent reviewed the full executor diff and integrated it. The final 306-test, 56-file integration gate passes. Browser output is `22 passed (19.3s)` under the approved regression ceilings. Final Lighthouse assertions and independent review pass, as recorded below.

Actual rehearsal restored a matching PostgreSQL 16 dump and 351 media files to a separate database/directory in 714 ms; page data and all media bytes matched. A failing SQL transaction rolled back and stopped the subsequent rollout command. Healthy HTTP returned private/no-store 200; an unreachable database returned private/no-store 503 in 224 ms with only a status value. Startup invalidation replaced cached build content with the distinct restored page title; restored media returned 200 with the correct MIME type and identical bytes. Evidence: `.local/phase7-restore-evidence.json`, `.local/phase7-health-failure.json`.

Configuration checks: actionlint 1.7.12 PASS; systemd-analyze verify PASS with the future Node executable path substituted locally (one unrelated host-unit warning); backup wrapper bash syntax PASS. These do not claim a live service install, reboot or hosted CI run. Native application/test migrations and idempotent seed execute in the ordinary gate. Live VPS/DNS/public TLS, external mail/S3, off-host backups, the ten-link LLM content gate and final assets remain explicit production inputs. No existing project tool files or unrelated user work were removed.


## 43. Phase 7 local acceptance and final handoff

Accepted locally on 26 September 2026 after parent full-diff review and fresh independent reviewer PASS. Review fixes canonicalise backup/media paths before archiving, preserve damaged old manifests without failing new backups, and gate Caddy proxy traffic with service readiness. Caddy remains available for static 503 pages and error assets while Next is down or warming. The app removes stale readiness before startup and after shutdown; warm-up creates it only after successful database health, broad invalidation and route checks. Real HTTP rehearsal confirms closed/open/down states; regression tests cover successful and failed warm-up. The final design supersedes the transient service-binding experiment, which would have removed the static fallback.

Actual final verification output:

```text
pnpm lint: exit 0
pnpm typecheck: exit 0
Test Files  56 passed (56)
     Tests  306 passed (306)
Compiled successfully in 446ms
GATE_EXIT=0
Playwright: 22 passed (19.3s)
Lighthouse: 5 URLs, 15 runs; all assertions processed successfully
PERFORMANCE_EXIT=0
```

Final Lighthouse medians: home 2,102 ms, about 2,478 ms, CulinAIre Kitchen 1,952 ms, journal 2,330 ms, contact 2,327 ms. Every route/run scored at least 97 Performance and 100 Accessibility, Best Practices and SEO. Both browser JavaScript assertions pass the approved <160,000-byte ceiling. These results pass the approved exceptions, not the original 120 kB/<2-second targets. Strict mode remains available. Logs: `.local/phase7-readiness-gate.log`, `.local/phase7-e2e.log`, `.local/phase7-performance-final.log`, `.local/phase7-lighthouse-final-summary.json`.

Built: all seven implementation phases, committed CMS migrations/seed, public/editorial/discovery features, quality checks, health, backup/recovery tooling, native CI configuration and deployment runbook. Skipped because no target/credentials were supplied: live VPS installation/reboot, hosted GitHub Actions execution, DNS/public certificate issuance, live mail/S3 and off-host backup delivery. No automatic deployment was added. Assumptions: one Ubuntu 24.04 VPS, PostgreSQL 16, local media by default, one timer-driven worker, manual releases and brief maintenance windows.

Production inputs still required: repository remote and approved deployment target/domain, private production configuration, final photographs and confirmed copy/capabilities, notification provider/recipient, off-host backup destination/retention, and a tenth genuinely published curated LLM destination. Initial offerings/posts remain drafts. The website is not claimed live or launch-content complete. Deployment procedures and the recovery evidence are in `docs/DEPLOY.md`.


## 44. Reopened design review: culinary character and trust

The user rejected the current visual result and specified French culinary elegance, professionalism, nostalgia and romanticism, bridging old and new. Technical phase acceptance does not establish visual acceptance. The home priority and truthful-content constraints stand.

The full initial audit, seven-dimension findings, pending decisions, journey, image provenance, verification limits and implementation handoff are recorded in [the design review](designs/trust-review/REVIEW.md). Two responsive visual studies and desktop/mobile captures are stored alongside it. Initial design completeness: 3/10 against the revised brief. No post-fix score, approved mockup or completed design review is claimed.

Historical checkpoint: the user rejected the limited basis of both initial studies and requested extensive audience and reference research. Neither A nor B is approved. They are superseded by the research checkpoint below. No production code or database content changed.

## 45. Research before redesign

The user explicitly redirected the review to extensive target-market, culinary-personality, reference-site and credibility research. That desk-research pass is now documented in [the research report](designs/research-20260926/RESEARCH.md), with 15 annotated reference sites in [the visual library](designs/research-20260926/index.html), browser screenshots, primary-source links, Melbourne agency case studies, audience hypotheses, evidence gaps and a revised creative brief. No customer interviews or conversion validation are claimed.

The key recommendation is to derive the next composition from Alex and Rob’s specific culinary practice and present-day work, with an early company explanation, founder evidence and a concrete product path. Three structurally different approaches are specified for exploration: founders at work; documented history alongside present work; and an authored useful kitchen publication. These are pending proposals, not new implementation approvals. The first two colour/layout studies are superseded and should not be implemented.

Existing exact brand tokens, truthful content, accessibility and performance contracts remain. The initial 3/10 design-completeness rating is unchanged. Research supplies the missing basis for the next visual round; it does not establish that the existing website is now trustworthy.

## 46. Selected calligraphic identity direction

On 26 September 2026 the user selected the **middle composition, study 02**, from the three calligraphic P/C studies responding to their Almost French Patisserie reference: “The middle, no doubt”. This authorises refinement of that diagonal monogram, preserving its sweeping descender and interlaced initials. The earlier six brandmark explorations are not the selected direction.

The selection and first vector working proof are recorded in [the identity study](designs/monogram-refinement-20260926/selected-02/index.html). The proof preserves the chosen silhouette and adds positive/reversed assets, reinforced small-use variants and a header specimen. It is not final production lettering: control-point cleanup, crossing refinement and favicon simplification remain. Existing lowercase Fraunces lettering, exact colour tokens and accessibility requirements stand. The selected monogram may accompany the existing wordmark.

This is approval of the monogram direction, not of a homepage composition, new copy, photography or a completed design review. D1–D4 remain open. Production source files are unchanged.

## 47. Six homepage studies with the selected logo

The user explicitly requested six homepage design studies, each using selected calligraphic monogram 02, in the same browser comparison workflow as the design review. Six responsive local previews and a gstack ratings/comments board are now available. The [study record](designs/homepage-studies-20260926/README.md) documents compositions, source imagery, checks, live URLs and feedback storage.

A: formal culinary house; B: editorial journal; C: asymmetrical split; D: founders first; E: facing notebook pages; F: dark atelier. All use the selected logo and preserve factual founder content and the company-to-product path. Proposed copy and generated photography are labelled. No homepage selection, production-content approval or completed design-review score is inferred. Production application source is unchanged; D1–D4 remain pending.

## 48. Homepage feedback: C with F’s palette

The user submitted board feedback selecting **C**, rated 5/5, requesting F’s elegant dark palette and moving the hero image left so the chef and the work are visible. The original submission is saved in [feedback-round-1.json](designs/homepage-studies-20260926/feedback-round-1.json). Zero values for other studies are not treated as explicit rejection ratings.

The [C2 prototype](designs/homepage-studies-20260926/c2.html) preserves C’s split layout with F’s charcoal/bone treatment. The image is in the left desktop column and its frame is shifted towards the right side of the source to show the hands and pastries. Mobile retains the introduction before the image. Both desktop and mobile rendering were inspected; menu navigation and image loading pass. A separate original/revision comparison board preserves the original six-study feedback.

D1 now has an explicit selected direction: C with F’s palette and revised image placement. The exact C2 rendering is available for review. D2–D4, final copy, real imagery and production implementation review remain open; prototype text or image selection is not blanket public-content approval. Application code is unchanged.

The user subsequently instructed: “Do not apply it yet I want to see it again in the browser comparison board”. Keep C2 as a preview only. Do not apply the proposed redesign to the application before the user explicitly authorises implementation after reviewing the comparison. The original/revision board was reopened in Grid mode.

## 49. Remove the duplicate founder strip in the preview

The user’s second board feedback favours Option B, the dark C2 refinement, and requests removal of the founder/credential row directly beneath the hero because it is redundant. Both submitted and pending messages agree; originals are preserved in `docs/designs/homepage-studies-20260926/feedback-round-2*.json`.

The [C3 preview](designs/homepage-studies-20260926/c3.html) removes only that row. The dedicated founder biographies remain. A separate comparison presents C2 as A and C3 as B. The change is verified in desktop/mobile previews. The explicit instruction not to implement the redesign remains in force; application source is unchanged.

## 50. Clearer monogram on the dark preview

The user confirmed the latest Option B (C3) as the clear winner and asked for greater logo visibility because its fine strokes appeared blurry on dark. The saved submission is `docs/designs/homepage-studies-20260926/feedback-round-3.json`.

The [C4 preview](designs/homepage-studies-20260926/c4.html) introduces reinforced SVG variants at slightly larger header/hero sizes, preserving the selected silhouette and bone colour. Desktop/mobile visual checks and image/overflow checks pass. The focused comparison is available for feedback. This remains preview-only; the explicit no-implementation instruction is unchanged.

## 51. C4 visual direction selected

The latest board submission chooses **B**, stating “Option B is the winner”. This is C4: C’s split composition with F’s charcoal/bone treatment, left-column photograph framed around the chef’s hands and tartlets, the duplicate credentials row removed, and the reinforced, slightly larger P/C monogram. The original feedback is preserved in [feedback-round-4.json](designs/homepage-studies-20260926/feedback-round-4.json). [approved-design.json](designs/homepage-studies-20260926/approved-design.json) records the exact selected assets and hashes.

Approved visual reference: `/home/robangeles/Documents/My AI Projects/codex-passe-culinaire/docs/designs/homepage-studies-20260926/c4.html`, with `c4.css`, `c2.css`, `studies.css` and referenced local assets. Desktop screenshot: `docs/designs/homepage-studies-20260926/screens/c4-desktop.jpg`. Monogram working vectors remain trace-derived with optical reinforcement; no print/embroidery validation is claimed.

The explicit instruction “Do not apply it yet” remains in force. This is visual selection, not an explicit implementation instruction. Application source is unchanged. Final copy, genuine work/founder photography, product evidence, remaining responsive/accessibility decisions and engineering verification remain open. Do not claim a completed design review or revise its score solely from this selection.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|---|---|---|---:|---|---|
| CEO Review | /plan-ceo-review | Scope and strategy | 1 documented | Scope approved | Existing company-to-product priority retained |
| Outside Review | Claude Code plan review | Independent challenge | 0 completed | Unavailable | Historical plan export rejection; no outside result claimed |
| Eng Review | /plan-eng-review | Architecture and tests | 2 logged | Historical plan findings; implementation accepted locally | Seven phases subsequently verified; performance exceptions explicitly approved |
| Design Review | /plan-design-review | Culinary identity and trust | 1 in progress | C4 visual direction approved; implementation held | Initial 3/10; 15 references assessed; middle P/C selected; C structure plus F palette requested |
| DX Review | /plan-devex-review | Developer experience | 0 | Not run | Not separately invoked |

OUTSIDE COVERAGE: no external design review completed. Automatic approval review rejected external mockup generation containing founder/product details. Business-specific proposals were built locally; generic concept photography contains no company details.

VERDICT: existing scope and local engineering acceptance retained. Visual acceptance reopened. Design review and redesign implementation are not cleared. Any implementation changes require the existing engineering verification and independent diff review gates. Live deployment and production content inputs remain outstanding.

**UNRESOLVED DECISIONS:**
- D1: C4 visual direction selected, including the clearer logo. Preview only; implementation awaits explicit authorisation.
- D2: founder/product hierarchy and homepage treatment of unpublished collections.
- D3: public photography treatment and proposed headline/example wording.
- D4: responsive navigation and dark-theme composition for the selected direction.

## 52. C4 implementation authorised and CEO scope review

The user explicitly instructed “Let’s apply this visual update” and invoked plan-ceo-review. The earlier preview-only hold is superseded. HOLD SCOPE follows the previously approved defaults: implement C4 through the existing CMS without expanding the business/product scope. [The implementation review](designs/c4-implementation-plan.md) records architecture, failure paths, approval ledger, sequence and acceptance. Charcoal is the first-visit default; explicit light and system preferences remain available. Existing exact tokens and engineering/performance contracts remain. Final acceptance awaits actual checks.


## 53. C4 implementation accepted locally

The approved C4 treatment is applied to the local published homepage through the existing CMS, with a private pre-update backup. The shared header/footer carry the selected reinforced P/C mark. The first-visit theme is charcoal; explicit light/system choices persist. The product example, founder biographies and company scope remain editable, and the generated concept image is visibly disclosed. Existing sample services, events and posts remain drafts.

Implementation and evidence: [C4 verification record](designs/c4-implementation/README.md). Lint and typecheck pass; 57 test files / 311 tests pass; production build passes; 26 browser tests pass. All five tested routes pass the existing three-run Lighthouse assertions: median performance 99–100 and other categories 100, median LCP 1.802–2.179s. Home JavaScript is 145,732 bytes gzip under the approved 160,000-byte limit. The selected mark is a cacheable SVG asset, and standard stylesheet delivery replaces experimental CSS inlining to keep the new layout within budget. No check or budget was relaxed.

The local content-update command refuses remote database/media destinations, unexpected editorial changes and unpublished homepage edits. Repeated seed/application is non-destructive. Independent diff review initially requested the database guard; the fix and subsequent stylesheet adjustment received fresh READY reviews. The source and actual production-rendered page were inspected on desktop and mobile, including light mode. Local preview: http://localhost:3000. External deployment and authentic founder photography remain outside this update.

## GSTACK REVIEW REPORT

| Review | Trigger | Scope | Status | Evidence |
| --- | --- | --- | --- | --- |
| CEO review | Explicit plan-ceo-review invocation | HOLD SCOPE, apply selected C4 | DONE_WITH_CONCERNS | Existing default approvals and current implementation instruction; scoped plan persisted |
| Outside plan challenge | Standard skill step | External Claude challenge | Unavailable | Automatic approval review rejected unauthorised plan export; prescribed native fallback unavailable |
| Independent implementation review | AGENTS.md gate | Complete implementation and follow-up fixes | READY | Local target guard fixed, then independently re-reviewed; stylesheet configuration separately re-reviewed |
| Design/browser verification | Approved C4 application | Actual desktop/mobile/light/dark site | Passed locally | Screenshots, 26 browser tests and five-route Lighthouse evidence |

VERDICT: C4 implemented and verified locally under the user's explicit authorisation. D1–D4 for this implementation are resolved by the selected composition and tested responsive/theme behaviour. Outside-provider coverage remains unavailable; no clean external review is claimed. Production deployment, authentic photography and unconfirmed business facts are not assumed complete.

## 54. Kitchen operations storyboard authorised

The user described the broader CulinAIre Kitchen scope and approved building the proposed five-chapter browser storyboard plus a representative receiving-to-prep animation. [The storyboard plan](designs/kitchen-operations-story-proposal.md) controls this preview-only work. Product capability availability and automatic connections are still pending confirmation. Keep sample records visibly illustrative and leave production source/CMS unchanged while this concrete prototype is reviewed. Parent owns integration and verification; the executor owns only the SVG illustration.

The storyboard is now available at http://127.0.0.1:4182/kitchen-operations-story/. [Implementation evidence](designs/kitchen-operations-story/README.md) includes five desktop/mobile states, keyboard/no-JavaScript/reduced-motion checks and a once-only transfer animation. Required application checks pass (311 tests plus lint, types and build). Independent preview review passed. Await storyboard feedback and capability confirmation before integrating it into the homepage.

## 55. Kitchen animation study replaces the rejected storyboard

Historical record of study 02, superseded by the 65-second study in section 56.

The user rejected the architectural layout and barely visible motion, and clarified that the experience should behave like an animation without chapter clicks. The [new animation study](designs/kitchen-animation/README.md) uses an illustrated kitchen, moving characters and props, and an automatic finite 32-second timeline with pause/replay. This prototype-specific motion treatment follows the user's latest direction; the production homepage and CMS remain unchanged. Reduced motion and no-JavaScript retain the full static narrative. Capability availability and automatic connections remain unconfirmed.

Application checks pass: lint, typecheck, 57 files / 311 tests, production build. Browser checks cover actual playback, stopping, pause/replay, offscreen behaviour, small viewports, reduced motion and no JavaScript. Independent review returned READY after a mobile caption clipping fix and a fresh review of all five captions at 320px and 390px. User visual acceptance remains open.


## 56. Chef and owner story, study 03

The user accepted the previous animation as a starting point and requested substantially better human faces, a realistic working-day sequence and a selling tool for chefs and owners, allowing a minute or longer. The revised [study 03](designs/kitchen-animation/README.md) runs for 65 seconds across nine acts: forecast demand; draw stock for mise en place; prepare ingredients; bake or cook; record usage, returns and waste; inspect and receive orders; manage rosters and share handovers; upload sales; review the day for the next preparation plan.

Generated adult character artwork replaces the distorted vector faces. Faces remain intact while a separate working forearm and kitchen props animate. Close views make actions more visible, while an adjacent CulinAIre Kitchen panel explains the record or decision involved. The sample stock and sales quantities reconcile. Human-entered actions are described explicitly; automatic integrations, autonomous forecasts, availability and savings remain unconfirmed. This local preview does not change the production homepage or CMS.

Actual checks: lint and typecheck pass; 57 test files / 311 tests pass; production build passes. A real 65-second browser run verifies automatic playback, stopping, pause/resume, replay and keyboard seeking. All nine record panels fit at five tested widths from 320 to 1440 pixels. Reduced motion, no JavaScript and missing-asset fallbacks retain the full narrative. Current results are in `checks-v3.json`; previous `checks.json` and `screens/` are explicitly historical study-02 evidence. User visual acceptance and any future production integration/performance verification remain open. Independent review returned READY after the obsolete evidence was corrected and the final stable-height checks were supplied. All nine acts retain the same film height at each tested width, preventing page movement during chapter transitions.


## 57. Rebuild the rejected kitchen film with consistent physical staging

The user rejected study 03 for scale, overlapping people/props and mediocre movement, and explicitly requested sustained work on a substantially better animation. Prior control tests and sampled screenshots did not establish acceptable motion; the record now makes that distinction explicit.

[Study 04](designs/kitchen-animation/cinema/README.md) uses an original metre-based 3D kitchen, jointed adult characters, fixed limb lengths, attached hand tools and close camera shots. Its 80-second day starts with forecasting and follows pantry stock, preparation, cooking, usage/waste, receiving, rosters/handover, sales upload and tomorrow’s review. Illustrative figures and capability caveats remain unchanged.

The authoring renderer is isolated from the application. The preview uses prerendered desktop/mobile H.264 films with synchronised HTML records and finite accessible playback. No homepage or CMS integration is approved by this work; user visual acceptance remains open. Verification evidence and licences live with the study.

Final study-04 evidence: the native 80-second film runs in 80.026 seconds with zero dropped frames in the measured browser run; pause/replay/seeking/offscreen/reduced-motion and no-JavaScript/media-failure fallbacks pass. Both desktop/mobile Axe runs report zero violations. All nine chapters fit nine viewport widths from 320 to 1600px. Application lint, types, 311 tests and build pass. Independent visual and native-player review returned PASS with no fix-first findings. User visual acceptance remains separate and open.


## 58. Study 04 characters rejected as robotic

The user's explicit feedback, “They look like robots”, rejects the procedural character treatment. Study 04 is not visually accepted. Its technical evidence remains historical and must not be described as proof of acceptable human animation.

The next bounded experiment is [a human motion study](designs/kitchen-animation/human-motion/README.md): one painted chef, shown close up, whisking through a generated frame sequence. It tests anatomy, human warmth and temporal consistency before another whole-film rebuild. This is a change of medium and an experiment, not an approved replacement art direction. The full kitchen narrative, production homepage and CMS remain unchanged. The source resolution and limitations are recorded explicitly.

## 59. Complete illustrated kitchen film replaces the short proof

The user challenged the five-second proof because it did not deliver the requested long animation. The [complete illustrated film](designs/kitchen-animation/atelier/README.md) now runs for 80 seconds across all nine operations: forecast, pantry transfer, preparation, cooking, usage/waste, receiving, roster/handover, sales upload and tomorrow's review. The primary kitchen-animation preview entry opens this version. Earlier studies are historical, not visually accepted replacements.

Nine generated painted scene sheets replace the procedural 3D characters. The film uses offline RIFE 4.25 interpolation and a native H.264 player with synchronised illustrative HTML records. Original assets, exact prompts, source resolution, renderer provenance, MIT licence and reproduction commands are retained with the preview. The resulting film is 960 × 640, 24 fps, 1,920 frames and 14,407,752 bytes. Source drawings are lower resolution and interpolation can retain drawing shifts or soft moving details; technical checks do not establish perfect human animation.

Actual native-browser verification: 80.013 seconds uninterrupted playback, zero dropped frames, all nine chapters across nine widths (81 layout states), zero desktop/mobile Axe violations, no page errors. Finite stop, replay, seek, manual pause, offscreen pause/resume, reduced-motion start, no-JavaScript narrative and media-failure fallback pass. Parent inspected actual desktop/mobile screenshots and decoded action sequences covering the complete film, pantry transfer, oven loading, waste, handover and sales. The final application gate passed: lint, typecheck, 57 test files / 311 tests, production build. Evidence is linked in the film README.

This completes the long local preview, not user aesthetic acceptance or homepage deployment. Capability availability, integrations and future production performance remain unconfirmed. Production application and CMS are unchanged. Independent source and sampled visual review passed; final browser review is recorded below.

Final independent review: PASS, no required fixes. Reviewer independently loaded desktop/mobile Chromium, checked the root redirect and chapter updates, confirmed no horizontal overflow, and reviewed the complete verification evidence. User visual acceptance remains open.

## 60. Illustrated style retained; contact motion rejected

The user described the illustrated film as beautiful but reported glitchy movement and fingers/hands passing through tablets and objects. This retains the visual direction while rejecting the current motion. The prior source/browser PASS and zero dropped frames do not establish acceptable character animation. [The contact-motion audit and recovery record](designs/kitchen-animation/atelier/native/README.md) identify the faulty transitions and candidate approach.

Dense inspection confirms failures at the tablet (68.4–70.2s), pantry pear transfer (12.7–16.4s), waste release (41.9–44.8s) and oven withdrawal (36.4–38.25s). Whole-frame optical-flow interpolation between independent drawings fails to preserve object identity, grip and occlusion. A floating receipt was also present in an original contact drawing and has been corrected with imagegen. All exact prompts and candidate starting frames are saved in the repository.

A native image-to-video candidate uses the pinned official Wan2.2 TI2V 5B model. The first low-memory test completed 40 diffusion steps, then exhausted system memory during decoding. The prior boot's kernel logs at approximately 19:20 record global OOM and killed VS Code processes. The subsequent workstation restart cleared the temporary model and render files. No usable native clip or visual acceptance was established. The low-memory fallback is rejected, and the current 80-second movie remains unchanged.

Recovery uses persistent ignored `.local/` storage, requires a full-GPU render with at least 22 GiB free, and must enforce a 14 GiB RAM / 1 GiB swap cgroup limit around rendering. A dedicated 64 MiB containment test successfully limited and killed only its own oversized test process. Model download is separately limited to 2 GiB RAM with no swap. On 27 September the user requested continuation following the proposed temporary server pause. The scoped tablet render temporarily stops the unrelated `llama-server.service`, with systemd `ExecStopPost` and shell restoration configured; the service configuration is unchanged. The persistent model download is complete. The 49-frame pilot rendered successfully inside the cap in 6m44s and the unrelated model server was confirmed restored. Independent dense visual review rejected the pilot: downward fingertip drag along the bezel, a malformed withdrawal, and unwanted camera pullback. A longer 121-frame, 768 × 512 candidate now uses an explicit inward withdrawal instruction; its quality remains unverified. The waste prompt was corrected to match its starting image before further scene renders. Production application and CMS remain unchanged.

Application lint, types, 57 files / 311 tests and build passed for the initial native authoring script and its provenance correction before the restart. The resource-containment and latent-checkpoint revisions still require final source verification. No animation improvement is claimed from those engineering checks.

Post-restart verification: restored the existing project PostgreSQL 16 cluster on loopback port 55432, then lint, types, 57 files / 311 tests and production build passed. Targeted renderer safety checks verify unbounded-process/swap refusal, insufficient-GPU refusal, checkpoint identity matching and batch-preserving roundtrip. The generated systemd command preserves the working directory and memory ceilings. Native video quality remains unverified, and the full motion correction is unfinished.

Final corrective-source review returned PASS after adding exact latent shape/type/finite-value validation before fresh checkpointing and before resumed decoding. Independent review confirms both paths use the same normalization. The script remains an unverified rendering candidate, not a completed animation fix. The persistent model download continues under the capped `passe-wan-download.service`; no render is queued automatically and the unrelated `llama-server.service` is still running.

## 61. Native sales motion accepted; full replacement in progress

On 27 September 2026 the 121-frame, 768 × 512 sales source passed parent and independent dense contact review. Its fingertip separates cleanly from the tablet, the hand returns to the bench, and the subsequent thinking gesture preserves coherent hands, face and props. Parent checked the exact eight-second retimed chapter at 960 × 640 / 24 fps. This is acceptance of one scene, not of the full replacement film.

A bounded offline assembler now preserves the nine chapter times and exact 80-second / 1,920-frame output. Source hashes and decoded frame counts are validated; time mapping is linear across each native clip; interpolation only adds frames between adjacent generated video frames. The existing film and poster are protected. The synthetic full-duration fixture, overwrite refusal, one-frame refusal and exclusive-publication checks passed. After parent source review and fixes, lint, types, 57 test files / 311 tests and production build passed; independent assembler review returned PASS. Remaining scenes, whole-film visual review and browser verification are outstanding.


## 62. Four native sources reviewed; GPU scheduling conflict

On 27 September, pantry, forecast and preparation joined sales in passing parent and independent visual review. The pear remains visible through basket placement; the pencil stays coherent during writing and rest; the whisk grip and bowl rim remain stable during stirring. Source clips, settings, contact sheets and individual reviews are retained in `atelier/native/evidence/`.

Cooking is explicitly rejected. Around frame 78 its small white cloth changes into a large black fabric. A revised prompt keeps both grips on the tray throughout a restrained inspection of the pastry batch. Do not substitute a short trim for a completed cooking action.

The seven-scene batch completed forecast, preparation and cooking, then failed safely during waste model loading because a separate image-generation job occupied about 19 GB of GPU memory. The RAM/swap/GPU limits stayed unchanged. The model-server start request was restored and subsequently reported active. A scheduling question asks the user to reserve the GPU before another batch. Existing source clips remain intact; four sources still need rendering plus the rejected cooking replacement. CPU-only retiming checks then completed for forecast (9 seconds), pantry and preparation (10 seconds each). Parent and independent dense reviews passed, with exact decoded frame counts and hashes recorded. Sales had already passed its eight-second retiming check. Full assembly and browser review remain pending. No corrected full film or production integration is claimed.


## 63. GPU reserved; six native scenes accepted

The user replied “GPU Ready”, authorising the remaining render window. Waste completed and passed dense parent/independent review after resolving an initial false positive: a peeling beside the bowl follows a down-left path into it and is occluded by the near rim. Receiving also passed, with the pear continuously supported between both hands. Both scenes subsequently passed parent review at their final eight- and ten-second lengths. Six accepted sources and their original provenance now live in `atelier/native/clips/`.

The local model server restarted automatically between waste and receiving. A temporary runtime service condition now prevents restarts during the reserved batch; a test start confirmed it stays inactive. The ineffective runtime mask was removed. `ExecStopPost` and the shell fallback both call the scoped cleanup that verifies/removes the exact temporary condition, reloads systemd and starts the service. Its persistent service file is unchanged. Restoration must be verified after rendering. The existing 14 GiB RAM / 1 GiB swap and GPU ceilings remain unchanged.

Roster, tomorrow and cooking replacement are still rendering. Complete-film assembly, browser playback and final acceptance remain outstanding. Production application and CMS remain unchanged.


## 64. Corrected continuous-motion film completed and verified

All nine 121-frame native sources passed parent and independent dense contact review. The replacement preserves the painted visual direction and the full 80-second story, with linear retiming and clean cuts instead of interpolation between separately drawn poses. The corrected oven scene keeps both hands on the tray during pastry inspection; its caption matches that action. Approved clips, prompt/model provenance and individual reviews are retained in `atelier/native/`.

The new local preview is 960 × 640, 24 fps, 1,920 frames and 15,723,622 bytes, SHA-256 `ddbb6f430ccb1e91972ff0eb94d7b07da585dbbdd63882b8a3226b2cc2397176`. Parent reviewed full progression, contact transitions and every cut; independent final review passed dense cooking/sales frames and all 13 frames around every chapter boundary. No required motion fixes remain from those reviews. This is not a claim of user aesthetic acceptance.

Actual browser verification completed 80.013 seconds of uninterrupted playback with zero dropped frames. All nine chapters fit nine widths (81 states); desktop/mobile Axe and page errors are zero. Pause, seeking, replay, finite stop, offscreen pause/resume, reduced-motion start, no-JavaScript and failed-media fallbacks pass. Parent inspected actual desktop/mobile screenshots and the oven scene in the gstack browser. `atelier/evidence/verification.json` binds the served MP4 hash, browser report and screenshots. Application lint, typecheck, 57 test files / 311 tests and production build passed.

The temporary model-server restart condition was removed; its runtime drop-in list is empty and the service was verified active/running. Persistent service configuration is unchanged. The original application and CMS remain unchanged: this completes the corrected local film preview, with production integration and user aesthetic acceptance still separate.

Final independent integration review returned PASS with no required fixes. Source hashes, timeline, final media, screenshots and browser-report bindings were verified; current guide links and normalised prompt/image provenance also pass. The completed local preview is ready for the user to view.


## 65. Painted film rejected; photorealistic AI video selected

After watching the section-64 film, the user rejected its appearance and perceived smoothness. That feedback supersedes the prior internal visual reviews: the film is not aesthetically accepted. Technical playback passes remain historical evidence only. Retiming approximately five-second sources to seven- and ten-second chapters also stretched the working pace; this approach must not carry into the new direction.

The user explicitly chose photorealistic AI-generated video over real footage. The [new production treatment](designs/kitchen-animation/photoreal/TREATMENT.md) proposes a 75–90 second kitchen-day film, with 15 naturally paced shots, consistent fictional people and kitchen, forecast-first operations and controlled illustrative record inserts. No photorealistic footage has been generated yet. The session has no connected dedicated video generator or configured provider credentials; provider access and a spending limit remain unresolved. An access question is pending. No paid generation or production integration has occurred.

The prior files are preserved as rejected historical studies. The local model server was restored after the completed earlier batch; no new local GPU batch is started for this reset.


## 66. Initial Remotion culinary film checkpoint, superseded by section 67

The user asked to use Remotion, confirmed local rendering without a separate video-generation account, and explicitly instructed implementation. The initial deliverable was a complete 80-second Remotion film built from original photographic kitchen scenes and frame-driven operational graphics. This replaces the cloud-generator dependency of section 65 for the current study. It is a motion editorial, not a claim of generated live-action human movement. The full forecast-first story remains: pantry draw, recipe/preparation and baking, service, usage/returns/waste, delivery inspection, roster/handover, sales upload and tomorrow's review.

The new study lives in `docs/designs/kitchen-animation/remotion-film/`. Remotion and its CLI/bundler/renderer are pinned authoring-only development dependencies, needed to author, preview and export the requested film. No Remotion runtime is added to the production homepage. Reuse the native finite-video player behaviour, local brand fonts and selected P/C mark. Original generated photography is copied into the project with prompts and provenance. Local evaluation does not require a Remotion account; eligibility for eventual commercial use follows Remotion's current licence. No licence purchase or paid cloud generation is performed.

Parent owns direction, integration, rendering and acceptance. Two bounded executor tasks own the film composition and the static preview page respectively; assets, render harness, plan and verification remain on the parent. Full application checks, native rendered-film review, responsive playback/accessibility checks and independent diff review are required before delivery. Artistic acceptance remains the user's. No production integration is authorised by this local preview.


The completed study includes a 1920 × 1080 desktop edit and a separately composed 1080 × 1350 phone edit, both 80 seconds / 2,400 frames at 30 fps. Six original photographs, exact prompts and image hashes are retained. Figures consistently describe 24 pear tart portions, 21 sold and 3 unsold; unsold stock is not automatically waste. The sample stock ledger reconciles to 15.3 kg after a short delivery.

Both exports completed full uninterrupted browser playback. The desktop run reported 3 dropped frames and the phone run 4, each from 2,411 reported frames including setup. Sixty viewport/chapter states passed overflow checks; desktop/mobile Axe and page errors were zero. Player controls, finite stop, reduced motion, offscreen pause and media/no-JavaScript fallbacks passed. Hidden-tab pause was tested through a synthetic visibility event. Parent inspected actual playback progression, desktop/phone pages and encoded transitions. The checks and source manifests bind the final export hashes in the study directory.

Application lint, typecheck, 57 test files / 311 tests and production build passed; direct study-source ESLint also passed. The local kitchen-animation entry now opens the Remotion study. The production application and CMS remain unchanged, and user aesthetic acceptance remains outstanding.

Independent final review returned PASS after replacing whole-scene dissolves with clean cuts to prevent ghosted titles and figures. Both corrected movies were re-exported and the complete browser verification repeated. Current source/output hashes, refreshed playback contacts and all desktop/phone cut sheets were verified. No required review fixes remain; the local study is ready for user viewing.


The 80-second scope and verification above are a historical checkpoint retained in Git commit `16a79ab`. Section 67 defines the current deliverable and acceptance evidence.

## 67. Expand the Remotion film across the full requested operation

On 28 September 2026 the user requested continuation after identifying missing coverage: Waste Management, Rostering, Inventory, Purchasing, Receiving, Mise en Place, Production, Sales, Recipe Lab, Patisserie Lab and Cocktail Lab. The revised local study runs 128 seconds over fifteen chapters, retaining forecasting, stock transfers, menu costing and team messaging. Parent inspected the sibling CulinAIre Kitchen product source to ground the three lab workflows; details and limits are in the film's COVERAGE.md. Five additional original photographic assets broaden the story to savoury work, bar, stockroom, production and waste. Human poses remain photographic stills.

One shared Remotion composition recomposes records for landscape and portrait. Chapters cut cleanly, with animated records inside each scene. The existing finite native video player remains, and the chapter buttons/transcript match the new timeline. No cloud video service, local diffusion batch, new package, product data access, or production homepage integration is part of this expansion. Full rendered-frame and browser checks plus independent review are required before delivery.


The expanded desktop and portrait exports are complete: 128 seconds, 3,840 frames at 30 fps. Both completed uninterrupted browser playback, with 1 dropped desktop frame of 3,850 reported and 3 dropped phone frames of 3,851, including setup. Ninety chapter/viewport states passed without overflow; desktop/phone Axe and page errors were zero. Controls, finite stop, reduced motion, offscreen pause and media/no-JavaScript fallbacks passed. Hidden-tab pause used a synthetic visibility event. Final source/output hashes are bound in the render manifests and browser checks.

Parent and independent review inspected all fourteen encoded transitions and final chapter contact sheets in both formats; parent also inspected the actual desktop and phone preview pages. Application lint, typecheck, 57 test files / 311 tests and production build passed after integration, alongside direct study-source ESLint. No new dependency was added. The roughly 50 MB landscape and 46 MB portrait files are local study masters, not accepted production homepage assets. Aesthetic acceptance and production integration remain separate.

Final independent review returned PASS. The current plan, README, review evidence, manifests and playback checks agree. No required fixes remain from that review.
