# C4 application update

The user authorised implementation of the selected C4 design on 26 September 2026. See [the scoped CEO review](../c4-implementation-plan.md) and [the approved reference](../homepage-studies-20260926/c4.html).

The application now uses the reinforced P/C monogram, charcoal first-visit theme, left photograph/right introduction, the product example, founder biographies and company scope. All page content continues through the existing CMS blocks and public publication/access projection. Explicit light and system preferences are retained. Header/footer navigation remains editable. The concept image is disclosed and does not depict the founders or their premises.

## Local content and recovery

Fresh `pnpm seed` installs include the C4 home. Repeated seeds leave existing pages unchanged. For an unchanged original seed homepage, `pnpm exec tsx scripts/apply-c4.ts` applies the approved layout. It requires a loopback website and PostgreSQL database plus local media storage, refuses edited layouts and unpublished edits, and saves the unpopulated prior page in `.local/design-update/home-before-c4-<timestamp>.json` before writing. Re-running after application is a no-op.

The actual local page was applied with a private backup. No external deployment was performed. To recover content, use the homepage's CMS version history or restore only the `layout` from that private backup through the authorised Payload API. Source rollback is separate from CMS content rollback. The concept image can remain unused after rollback.

## Evidence

Screenshots in `screens/` are of the actual application. Final validation is complete: lint, typecheck, all 57 test files / 311 tests, and production build pass. All 26 desktop/mobile browser tests pass, including route accessibility, keyboard navigation, no overflow, theme persistence and denied-storage handling. Screenshots were visually inspected at 1440px, 390px and 320px, with dark and light themes. The production application was also inspected in the gstack browser. The initial production browser suite passed 24 functional/accessibility tests but failed the JavaScript budget; repeated inline monogram paths were moved to a same-origin cacheable SVG symbol asset. No budget was relaxed.

Independent code review initially requested a database-destination guard in the local update command. The command now validates both origins and local media storage before connecting. External Claude plan review was rejected by automatic approval review because exporting potentially non-public project details was not authorised; no completed outside-provider review is claimed.


All 15 Lighthouse runs across five routes completed successfully with the unchanged approved assertions. Median scores:

| Route | Performance | Accessibility | Best practices | SEO | LCP |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home | 99 | 100 | 100 | 100 | 1.954s |
| About | 99 | 100 | 100 | 100 | 1.953s |
| CulinAIre Kitchen | 100 | 100 | 100 | 100 | 1.803s |
| Journal | 99 | 100 | 100 | 100 | 2.179s |
| Contact | 100 | 100 | 100 | 100 | 1.802s |

[Structured Lighthouse results](lighthouse.json) and [JavaScript measurement](javascript.json) preserve the figures. Home JavaScript is 145,732 bytes gzip against the approved 160,000-byte ceiling. Standard stylesheet delivery avoids duplicating the enlarged stylesheet in the inline RSC payload. No dependency or performance budget changed. The original strict 120kB JavaScript target remains an explicitly approved exception.

Independent diff review: READY after correction, followed by a fresh review of the stylesheet configuration. Local implementation accepted. The production preview is running at http://localhost:3000; this is not an external deployment. Genuine founder/premises photography remains future work. The existing draft services, training and journal content remain drafts.
