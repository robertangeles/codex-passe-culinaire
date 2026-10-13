# Kitchen operations browser storyboard

Preview: http://127.0.0.1:4182/kitchen-operations-story/

The user authorised this five-chapter storyboard and a representative animated transition with “Let's go”. This is a standalone design study. Production application source and CMS content are unchanged.

## Review the story

Choose a numbered chapter or use Previous/Next. The five chapters cover planning and purchasing, receiving and inventory, stock transfers and mise en place, rostering and messaging during service, then waste and the closing records. Select “The delivery”, then “Mise en place”, or use “Watch receiving → prep” to see the one-shot transfer. It takes 900ms; nothing loops or runs automatically on page load. Scene emphasis and chapter transitions take 240–250ms.

The architectural kitchen drawing uses the approved charcoal/bone direction, with a copper accent and working records. Desktop keeps the kitchen in context; mobile frames the relevant work area. Sample quantities and records are explicitly illustrative. Product availability and automatic integrations still require confirmation before production copy or demonstrations claim them.

## Run locally

From the repository root:

```sh
python3 -m http.server 4182 --bind 127.0.0.1 --directory docs/designs
```

Then open the preview URL above. All illustration, fonts, licences and monogram assets are local. The return/product links point to the application preview on localhost:3000.

## Verification

- Parent read the executor's complete SVG implementation and adjusted the crate layering/destination and mobile frames after visual inspection.
- Required application gates: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass; 57 test files / 311 tests. No application code changed.
- Browser checks pass for all five chapter states, one active chapter, matching illustration highlights, keyboard chapter navigation, one-shot animation on the crate only, correct final destination, reduced motion, and all five chapters visible with JavaScript disabled.
- No horizontal overflow at 390px or 320px. No browser errors. Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA checks report no violations on the tested mobile state.
- Desktop/mobile screenshots of all five states are in `screens/`; structured results are in `checks.json`.
- Independent reviewer: PASS for the preview-only storyboard. Feature availability confirmation remains a production integration dependency, not a blocker for this labelled study.

The short browser verification script used for this study is retained privately at `.local/design-update/check-story.mjs`; the app's production test suite remains unchanged.
