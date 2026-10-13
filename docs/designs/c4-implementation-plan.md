# Approved C4 implementation: CEO review

Mode: HOLD SCOPE. The user previously approved defaults and now explicitly says to apply the selected visual update. This is a fixed design implementation, not a new business or product scope. Parent owns this plan, integration and acceptance.

## Problem and scope decisions

The current generic presentation does not convey the approved culinary identity. Leaving it unchanged fails the user's request. The selected reference supplies a split image/typography hero, dark palette, reinforced calligraphic monogram, product explanation, founder biographies and company scope.

Approval ledger:
- V1: implement the exact selected C4 composition, including clearer mark and image crop; current explicit instruction supersedes the earlier preview-only hold.
- V2: dark first visit; preserve explicit light and system settings. Existing stored light/dark preferences win.
- V3: use the selected concept image with its explicit disclosure. It must never be represented as a founder or premises photograph.
- V4: use the selected page hierarchy and verified factual text; no invented proof, savings, testimonials or newly published offerings.
- V5: native responsive navigation and existing functional destinations, retaining CMS navigation entries.

## 0G: complexity and existing work

Reuse the existing CMS blocks, responsive media pipeline, server rendering, URL validation, navigation, fonts and theme control. No new packages, collections, migration, animation framework or client rendering layer. Approximately 16 source/fixture files plus targeted tests and evidence are expected; most are paired component/CSS files. This is larger than an eight-file patch because the approved identity crosses shell, homepage, theme and content. Keep three boundaries: shared identity/theme, homepage presentation, reversible content application. Do not extend the redesign to new product features.

## 0I: sequence

1. Record this review and challenge the technical plan.
2. Add the exact approved SVG mark and local compressed concept image.
3. Implement the hero as one bounded executor task. Parent implements shell, theme and homepage editorial grouping.
4. Provide a guarded local content update with a private backup. Reuse one typed layout factory for fresh seeds and the update. Inspect existing content before changing it.
5. Read every implementation diff. Run lint, typecheck, unit/integration tests and production build; independent reviewer follows those checks.
6. Exercise desktop/mobile, dark/light/system, real links, keyboard navigation, publication rules, accessibility and production performance. Fix findings and repeat the relevant checks and independent review.

## Architecture

CMS page -> existing public access/publication projection -> BlockRenderer
  -> home hero (responsive media and approved mark)
  -> home product treatment (existing product block body and links)
  -> contiguous founder cards (grouped editorial presentation)
  -> home scope CTA (existing editable statement/link)
  -> other CMS blocks keep their existing renderer

CMS shell -> existing safe links -> desktop navigation / native mobile disclosure
Stored preference -> inline theme initialisation -> semantic CSS aliases -> theme control

Grouping must preserve CMS order and handle one, two or more founders without losing any block. Hero text remains CMS data. Home fallback still supplies exactly one h1 if the first block is not a hero. Empty media stays empty; unpublished offerings stay unpublished.

## Failure, rescue and data integrity

| Trigger | Expected behaviour | Verification |
| --- | --- | --- |
| Missing, malformed or placeholder seasonal media | Fall back to the ordinary hero image | Existing seasonal tests plus placeholder case |
| Missing home/content | Existing not-found or truthful empty state | Existing route tests |
| Edited homepage differs from known seed | Abort the scripted replacement with a clear message before writes | Guard tests |
| Draft page over published page | Abort rather than publish the draft | Compare latest and published state |
| Interrupted content update | Original page snapshot and CMS versions remain available; media upload may be reused | Backup before writes; idempotent filename/layout handling |
| Missing asset/database error | Report failure; do not claim application or acceptance | Nonzero command exit |
| localStorage denied/cleared/cross-tab update | In-memory theme still works; explicit system preference is distinct from first-visit dark | Browser test |
| Invalid link | Existing safe URL handling omits it | Existing tests |

No new async publication mechanism. Content writes continue through existing CMS hooks and database-backed invalidation: commit -> invalidation delivery -> fresh public consumer. Existing integration tests already cover ordering and dependent outputs. The visual update must not bypass them or change cache policy.

## Security and privacy

No new network hosts, secret handling, authentication path or public private-data projection. Use local media and fonts. Private backups remain ignored under .local. Administrative content updates are local tools using existing environment configuration, never a public endpoint. Do not export private environment or backup data for review.

## Product quality and design

Match approved proportions, type scale, whitespace, image focal point and optical mark weights. Use semantic aliases so the mark and panels remain legible in light mode. Use one h1, heading hierarchy, skip link, focus rings, 44px targets, reduced-motion support and a keyboard-accessible mobile menu. Native navigation must not duplicate visible links for assistive technology. Remove the duplicate credentials strip; retain full founder evidence and the company-to-product path. Generated image disclosure remains visible.

## Testing and performance

All required gates: pnpm lint, pnpm typecheck, pnpm test, pnpm build. Targeted tests cover seasonal fallback, SSR home composition/group order, content guard and theme persistence. Existing access, cache and private-preview tests stay enabled. Browser checks use the actual application, not the static study: desktop 1440px; mobile 390px and 320px; light/dark/system; menu/contact/product links; no horizontal overflow or console errors. Run existing e2e and Lighthouse harness against the production build. Existing approved limits remain: all categories >=95, home JavaScript <160kB gzip and median LCP <=2.6s. Compress the hero through the existing image pipeline and keep UI server rendered.

## Observability, rollout and recovery

Use existing application logs, browser console checks and test reports. No analytics or additional logging service. Apply locally only; no deployment or external publishing is requested. Keep an ignored pre-update snapshot and CMS version history. Revert source plus restore the saved home layout if rollback is needed; media can remain unused. The content tool must preserve SEO, slug, authorship and publication timestamps.

## Future and exclusions

Not in scope: authentic founder photography, new product claims, testimonials, new offerings, external deployment, full brand stationery, CMS schema redesign, new dependencies, research repetition or another comparison round. Future real imagery should replace the explicitly disclosed concept image through the same CMS image field. No speculative abstraction or new task backlog is necessary for this update.

## Review verdict

The scope is ready for implementation under existing user approval. Required lint, typecheck, 311 tests and production build pass. All 26 browser tests pass. Independent diff review is READY after the local destination guard fix. All 15 Lighthouse runs across five routes pass: median performance 99–100, other categories 100, LCP 1.802–2.179s. Local implementation accepted. Outside challenge unavailable: automatic approval review rejected exporting this plan to the external Claude service. The prescribed native Plan/TaskOutput/TaskStop fallback is unavailable in this host. No external clean-review credit. Local independent diff review remains required after implementation.

Implementation note: the selected mark uses a shared, same-origin SVG symbol asset. Standard cached stylesheet delivery replaces experimental CSS inlining: inlining duplicates styles in the RSC payload and exceeded the JavaScript budget with the expanded design. Measured homepage JavaScript is now 145,732 bytes gzip; all original budget assertions remain enabled.
