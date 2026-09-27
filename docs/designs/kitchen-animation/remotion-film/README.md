# A day in the kitchen: Remotion film

A complete culinary motion editorial for Passe Culinaire and CulinAIre Kitchen, built with Remotion 4.0.529. Original photographic scenes are combined with frame-driven kitchen records. People retain their photographic poses; this is not live-action footage or generated human-action video.

Preview: http://127.0.0.1:4182/kitchen-animation/remotion-film/

```sh
pnpm film:preview
```

The film plays once when visible, muted, with pause/replay, keyboard seeking and fullscreen controls. It pauses offscreen and when the tab is hidden; reduced-motion users start paused. The static poster and full written story remain available without JavaScript or if media fails. Chapter buttons are optional. The browser chooses the portrait film on initial loads up to 760px wide and keeps that choice through playback to avoid interrupting a film on resize.

## Film

Both versions last 80 seconds, with 2,400 frames at 30 fps:

- Desktop: 1920 × 1080, `kitchen-day.mp4`.
- Portrait: 1080 × 1350, `kitchen-day-mobile.mp4`, with recomposed headings and records for phone readability.

The photos are generated 1672 × 941 originals. The film graphics and text are rendered at the stated output dimensions; the photography is scaled to fit, not claimed to be native 1080p footage. No model runs in the visitor's browser. Remotion is an authoring dependency, not a production homepage dependency.

| Time | Kitchen story | Record or decision |
| --- | --- | --- |
| 0–6s | A day in the kitchen | The work behind service |
| 6–14s | Before the first knife | 80 forecast covers; 24 pear tart portions planned |
| 14–22s | From pantry to pastry | 3.0 kg drawn from 8.0 kg opening stock |
| 22–32s | Weigh, prepare, bake | 2.4 kg recipe use; 24 portions; recipe and menu cost reviewed |
| 32–38s | The craft reaches the pass | The finished pear and almond tart |
| 38–46s | Account for the stock | 2.4 kg recipe use; 0.3 kg returned; 0.3 kg waste |
| 46–54s | Inspect and receive | 12 kg ordered; 10 kg received; 2 kg short |
| 54–62s | People and handover | Roster, section responsibilities and team message |
| 62–72s | Sales and daily review | 74 covers; 21 portions sold; 3 unsold |
| 72–80s | The whole kitchen | Connected records inform tomorrow; 15.3 kg closing pear stock |

Figures illustrate one scenario. Unsold portions are not automatically classified as waste. The scenes, people and records are fictional illustrations, not customer evidence, actual product screens or claims of automatic product behaviour. The quantity is expressed as portions to match the full-size tart in the photography.

## Source and assets

- [Film.tsx](Film.tsx): desktop composition.
- [MobileFilm.tsx](MobileFilm.tsx): portrait composition.
- [index.ts](index.ts): both registered compositions.
- [render.mjs](render.mjs): local export and representative-frame rendering.
- [image-provenance.json](image-provenance.json): exact prompts, built-in image generator provenance and original image hashes. No paid video-generation service was used.
- `public/`: six generated photographs, the selected P/C monogram and self-hosted fonts with their OFL licences.

Frames use deterministic Remotion timing. Photograph moves are restrained; the substantive animation is the transfer, allocation, delivery comparison, handover and sales review. The original failed painted films are preserved in their historical study folders.

Open the editable timeline:

```sh
pnpm film:studio
```

This serves Remotion Studio on port 4183. The ordinary film preview remains on port 4182.

Render candidates with bounded resources on this Linux workstation:

```sh
systemd-run --user --scope -p MemoryMax=6G -p MemorySwapMax=512M pnpm film:render
systemd-run --user --scope -p MemoryMax=6G -p MemorySwapMax=512M pnpm film:render:mobile
```

Outputs go to ignored `.local/remotion-kitchen/candidate.mp4` and `candidate-mobile.mp4`, with matching manifests. The script does not overwrite preview movies. It uses concurrency 2, H.264/yuv420p, CRF 18 and the installed Playwright Chromium. Each manifest binds output bytes to source, image, font, mark and lockfile hashes, captured before rendering and checked again afterwards. Changing a bound source during rendering fails verification. Inspect candidates before copying to the preview filenames.

```sh
node docs/designs/kitchen-animation/remotion-film/render.mjs --stills
node docs/designs/kitchen-animation/remotion-film/render.mjs --mobile --stills
node docs/designs/kitchen-animation/remotion-film/verify.mjs
```

## Scope and licence

This is a local design study. Production homepage and CMS remain unchanged. Visual acceptance belongs to the user and is separate from playback and accessibility checks.

Remotion permits free evaluation and free commercial use for eligible individuals and organisations of up to three people. Larger commercial organisations need the appropriate company licence. No licence purchase was made. See the [current official licence FAQ](https://www.remotion.dev/docs/license/faq).

## Verification

Both complete exports played to their 80-second finite stop in Chromium. The instrumented desktop run recorded 3 dropped frames and the phone run 4, each out of 2,411 reported video frames (including setup playback), with no page errors. These are local workstation measurements, not guarantees for every device.

All 60 chapter/viewport combinations (320–1440px) passed overflow checks. Desktop and phone Axe checks reported zero violations. Pause/replay, manual-pause persistence, offscreen pause/resume, reduced-motion changes, fullscreen controls, keyboard seeking, no-JavaScript poster/transcript and failed-media fallback passed. Hidden-tab handling was exercised with a synthetic visibility-change event. Parent inspected actual desktop/phone screenshots, full-run progression captures and encoded transition frames. Independent review caught overlapping text during the original dissolves. Both exports now use clean chapter cuts, with one scene visible at a time; people remain still photographic subjects.

[evidence/checks.json](evidence/checks.json) binds these results to the two served MP4 hashes. [Desktop progression](evidence/desktop-playback-contact.jpg) and [phone progression](evidence/mobile-playback-contact.jpg) come from the actual uninterrupted playback runs. Render manifests separately bind export bytes to source and assets.

Application lint, typecheck, all 57 test files / 311 tests and production build passed. The study source also passed a direct ESLint check because it is outside the application's usual lint paths. Production performance budgets were not remeasured because this study is not integrated into the homepage.

[Final independent review](evidence/review.md) passed after the transition correction and fresh export/playback checks.
