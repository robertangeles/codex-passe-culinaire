# A day in the kitchen: complete illustrated film

**Current review status:** the user likes the artwork but has rejected the contact motion. Fingers and props visibly merge in several transitions. The correction and render-recovery work is documented in [native/README.md](native/README.md); no corrected full film is available yet.

The complete replacement film runs for **80 seconds**, across nine scenes. This follows the user's rejection of the robotic 3D characters and of a five-second motion sample as a substitute for the requested long animation. Visual acceptance remains with the user.

Open http://127.0.0.1:4182/kitchen-animation/atelier/ after starting the local preview server:

```sh
node docs/designs/kitchen-animation/cinema/serve-preview.mjs
```

The primary `/kitchen-animation/` entry now leads here. Previous studies remain available as historical work. This is a local design preview; production source and CMS are unchanged.

## Film and story

[kitchen-day.mp4](kitchen-day.mp4) contains 1,920 frames at 24 fps, 960 × 640 pixels, with no audio. It is 14,407,752 bytes. [render-manifest.json](render-manifest.json) records its SHA-256 digest and decoded frame count.

| Time | Kitchen action | Illustrative business record |
| --- | --- | --- |
| 0–9s | Chef reviews the morning plan | Expected covers, recipe and menu cost |
| 9–19s | Pear moves from pantry crate to preparation basket | Stock transfer to section |
| 19–29s | Chef mixes the preparation batch | Recipe quantities and batch cost |
| 29–39s | Tray moves into the oven | Preparation and section handover |
| 39–47s | Chef separates preparation waste | Usage, returns and waste |
| 47–57s | Chef lifts and inspects delivered produce | Purchase order and shortage |
| 57–65s | Chef and owner review the roster | Roster and team message |
| 65–73s | Owner checks receipts and uses the tablet | Sales uploaded for review |
| 73–80s | Chef and owner review tomorrow's plan | Sales, preparation and closing stock |

The shared narrative is in [story.mjs](../cinema/story.mjs). Records are illustrative, not a product interface or an assertion that automatic integrations exist. Forecast 80 covers versus 74 actual, 24 planned tarts versus 21 sold, and 15.3 kg closing pear stock reconcile in the sample. Single-item gestures illustrate the work rather than depicting every unit in the batch.

## Artwork and rendering

Nine original illustrated pose sheets were generated with the imagegen skill. [assets/](assets/) contains the originals, [prompts/](prompts/) contains the exact prompts, and [assets/manifest.json](assets/manifest.json) records scene timing and the selected pose order. The visual direction is a warm painted kitchen with consistent adult chef and owner characters, ivory jackets, olive cabinetry, copper and walnut.

Each original sheet is 1,254 × 1,254 pixels, with six poses in a two-column, three-row grid. Each extracted image is 623 × 414 pixels after a two-pixel edge crop, then resized to the film dimensions. The film therefore is not native high-definition footage. Interpolated movement can retain small drawing shifts or softness around moving hands and objects. The verification below establishes functioning playback and reviewed sequences, not perfect anatomy or user approval.

Offline rendering uses [Practical-RIFE 4.25](https://github.com/hzwer/Practical-RIFE) to interpolate the drawings into continuous motion. Its MIT licence is retained in [RIFE-LICENSE.txt](RIFE-LICENSE.txt). `setup-renderer.py` pins source revision and checksums for downloaded authoring files and model weights. The renderer uses the existing local Python environment (PyTorch, NumPy and OpenCV), FFmpeg and the repository's Sharp dependency. No application package was added and no model runs or downloads in the visitor's browser.

```sh
python3 docs/designs/kitchen-animation/atelier/setup-renderer.py
node docs/designs/kitchen-animation/atelier/render-film.mjs
# Optional: regenerate one temporary scene, then assemble the full film.
node docs/designs/kitchen-animation/atelier/render-film.mjs --only pantry
node docs/designs/kitchen-animation/atelier/render-film.mjs --assemble
```

The default authoring cache is `/tmp/passe-rife`; set `RIFE_DIR` to change it. Temporary scene clips are in `/tmp/passe-atelier-render`. GPU allocation is capped to leave other local workloads running. `--only` does not overwrite the complete film.

## Browser behaviour and verification

The native video begins when at least half of the picture is visible and stops after one complete play. Pause, replay, seek and optional chapter navigation remain available. Manual pause is preserved across scrolling. Offscreen or hidden-tab playback pauses. Reduced-motion users start with a paused film. Missing media and disabled JavaScript retain the poster and complete HTML narrative.

Run browser verification with the local preview server active:

```sh
node docs/designs/kitchen-animation/atelier/verify.mjs
```

[evidence/checks.json](evidence/checks.json) records native playback duration, decoded/dropped browser frames, nine chapter states across nine widths (320–1600px), desktop/mobile Axe results, chapter seeking, manual pause, offscreen resume, finite playback and replay, reduced motion, no JavaScript and failed-media fallback. [Desktop](evidence/desktop.png) and [mobile](evidence/mobile.png) screenshots document the actual page. Decoded [whole-film](evidence/whole-film.jpg), [pantry-motion](evidence/pantry-motion.jpg) and [action-sequences](evidence/action-sequences.jpg) contact sheets document sampled artwork and movement.

Parent visual verification includes the actual desktop/mobile page and decoded action sequences. Independent source and sampled visual review passed; the final native-player review is recorded in the plan. User aesthetic acceptance and production integration remain separate.
