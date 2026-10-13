# Homepage hero alignment

The homepage image hero previously used the full viewport width while the editorial rows below used a centred, capped width. At 1440px the hero began at x=0 and the other rows at x=64.

The scoped hero CSS now uses the same desktop, tablet and phone width rules as HomeEditorial. Mobile content padding no longer adds a second horizontal inset. Interior-page hero rules and the film are unchanged.

Validation on the local production build: all eight widths in checks.json (320 to 1920px) have identical hero/editorial left and right edges, no horizontal overflow and no page errors. Parent inspected actual desktop, tablet and phone screenshots. Lint, typecheck, all 57 test files / 311 tests and production build passed. Independent CSS review returned PASS. No new dependencies or permanent automated tests were added for this CSS-only change. No new Lighthouse measurement or remote deployment is claimed.

No durable operational learning arose from this small layout correction.
