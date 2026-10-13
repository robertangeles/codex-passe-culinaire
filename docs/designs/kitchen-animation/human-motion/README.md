# Human motion study

The user rejected study 04's procedural people as robotic. Passing playback and layout checks did not make those characters visually acceptable.

This isolated proof changes the medium to a painted culinary illustration and tests one close-up whisking action before committing to another full film. It is not a completed replacement for the kitchen operations story and is not integrated into the homepage.

Preview: http://127.0.0.1:4182/kitchen-animation/human-motion/

The source is a 16-frame, 4 by 4 sprite sheet created using the built-in image-generation tool. The exact prompt is in `prompt.txt`. The generated file was copied to `sprite-sheet.png`; the original remains in the generation directory. The actual output is 1254 by 1254 pixels, despite the requested 4096 pixels. Each frame therefore has about 313 pixels of source resolution. This proof is not a production-resolution animation asset.

The chef is fictional. This is illustrative artwork, not founder photography, product footage or evidence of a product capability. Generated drawings can vary between frames; visual continuity must be judged separately from playback correctness. No claim of user visual acceptance is made.

The browser presents the source drawings in sequence. It does not attach a moving arm to a still photograph. The finite preview includes pause, replay and seeking, and respects reduced motion.

## Verification

Run `node docs/designs/kitchen-animation/human-motion/verify.mjs` with the existing preview server on port 4182. Browser evidence is saved in `evidence/checks.json`; desktop and mobile screenshots are beside it. The measured preview completes in approximately 5.35 seconds, exposes 16 distinct drawings and stops after four whisking cycles. Pause, replay, reduced motion, no-JavaScript and missing-image fallbacks pass. Six widths from 320 to 1600px have no horizontal overflow; desktop and mobile Axe checks have no reported violations.

Application checks also pass: `pnpm lint`, `pnpm typecheck`, 57 test files / 311 tests, and `pnpm build`. These establish no application regression, not visual quality.

Independent read-only review returned READY for this bounded preview, with no blocking implementation findings. It explicitly noted pose/background variation, repeated whisking cycles and softness from the small source frames. The parent inspected the source sequence and actual desktop/mobile captures. This is a direction experiment, not a production-quality full film. User visual acceptance remains open.
