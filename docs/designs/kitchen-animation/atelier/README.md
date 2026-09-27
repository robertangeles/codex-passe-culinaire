# A day in the kitchen: corrected 80-second film

> **Current status, 27 September 2026: rejected by the user for appearance and motion quality.** Prior review passes below are historical technical/internal evidence, not aesthetic acceptance. The user selected [photorealistic AI-generated video](../photoreal/TREATMENT.md) for the replacement. The current replacement is the [80-second Remotion film study](../remotion-film/README.md), using original photographic scenes and animated kitchen records.

The complete local preview now uses nine reviewed continuous-motion scenes. This replaces the version the user liked visually but rejected for glitchy movement and hands passing through props. Parent and independent contact review passed, followed by full-film and browser verification. User aesthetic acceptance remains separate.

Open http://127.0.0.1:4182/kitchen-animation/atelier/?v=native-20260927 . Start the server if needed:

```sh
node docs/designs/kitchen-animation/cinema/serve-preview.mjs
```

The primary `/kitchen-animation/` entry also opens this preview. Production application and CMS integration are unchanged.

## Film and story

[kitchen-day.mp4](kitchen-day.mp4) is muted H.264, **80 seconds, 1,920 frames, 24 fps, 960 × 640**, 15,723,622 bytes. [render-manifest.json](render-manifest.json) records every approved source hash, chapter time, encoding setting and final digest. [verification.json](evidence/verification.json) binds the served file to the reviewed browser results and screenshots.

| Time | Kitchen action | Illustrative record |
| --- | --- | --- |
| 0–9s | Review the morning plan | Forecast, recipes and menu cost |
| 9–19s | Transfer a pear from pantry crate to section basket | Inventory and stock transfer |
| 19–29s | Whisk the preparation batch | Recipe quantities and batch cost |
| 29–39s | Check the pastry batch at the oven | Preparation and section handover |
| 39–47s | Separate preparation waste | Usage, returns and waste |
| 47–57s | Inspect delivered produce | Purchase order and shortage |
| 57–65s | Review the roster together | Roster and team message |
| 65–73s | Check receipts and the tablet | Sales upload and daily review |
| 73–80s | Review tomorrow’s plan | Sales, preparation and closing stock |

The shared [story](../cinema/story.mjs) remains a kitchen-led illustration, not a product screen or an automatic-integration claim. Its sample figures reconcile: 80 forecast versus 74 actual covers, 24 planned versus 21 sold tarts, and 15.3 kg closing pear stock. A single-item gesture illustrates the operation rather than every unit in a batch.

## Motion and reproduction

The warm painted characters, ivory jackets, olive cabinetry, copper and walnut remain. Each scene now starts from one coherent reference and is generated as a continuous 121-frame video. This removes the old method’s repeated per-pose easing and interpolation between incompatible drawings. Individual shots are retimed linearly to their chapter lengths, then joined with clean hard cuts.

The [native source guide](native/README.md) includes the nine accepted clips, exact prompts, seeds, pinned model revision, licences and resource limits. Sources are 768 × 512, upscaled to the 960 × 640 delivery size; the film is not native HD. No video model runs in the browser, and no application dependency was added. Rebuild from the checked sources:

```sh
mkdir -p .local/kitchen-motion
python3 docs/designs/kitchen-animation/atelier/assemble-native-film.py \
  --input-dir docs/designs/kitchen-animation/atelier/native/clips \
  --output .local/kitchen-motion/kitchen-day-candidate.mp4
```

The assembler verifies source hashes and full decoded frame counts and protects the current preview from direct overwrite. Review a candidate before replacing the movie, poster and manifest. Legacy `render-film.mjs` and the old RIFE files are historical; they do not produce this corrected film. The [recovery record](native/RECOVERY.md) preserves failed approaches and their diagnoses.

## Verification

The film plays once when at least half the picture is visible. Pause, replay, seeking and optional chapter navigation remain available. Offscreen and hidden-tab playback pause; manual pause survives scrolling. Reduced-motion users start paused. Missing video or disabled JavaScript retains a poster and the complete HTML narrative.

The [motion review](evidence/motion-review.md) covers all nine scenes, dense hand/prop transitions, and every chapter boundary. [Desktop](evidence/desktop.png), [mobile](evidence/mobile.png) and [oven browser](evidence/browser-oven.jpg) captures show the actual page.

Actual browser results: **80.013 seconds** uninterrupted playback, **zero dropped frames**, all nine chapters at nine widths (**81 layout states**), zero desktop/mobile Axe violations and zero page errors. Finite stop, replay, seeking, manual pause, offscreen pause/resume, reduced-motion start, no-JavaScript narrative and media-failure fallback pass. [checks.json](evidence/checks.json) contains the detailed results.

```sh
node docs/designs/kitchen-animation/atelier/verify.mjs
```

Application verification passed `pnpm lint && pnpm typecheck && pnpm test && pnpm build`: 57 test files, 311 tests, production build. The temporary GPU reservation was removed and the local model server was verified running again. No production deployment or homepage integration was performed.
