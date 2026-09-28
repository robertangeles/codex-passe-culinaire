# Homepage kitchen film integration

The user approved the 128-second film and requested homepage integration on 28 September 2026. The homepage product section now includes the film, all fifteen chapters and the full written story. CMS product copy, links and any real product image remain in place. The application does not import the Remotion runtime.

`public/films/kitchen-day/` contains versioned web delivery copies derived from the approved masters in `docs/designs/kitchen-animation/remotion-film/`. Landscape is 1920 × 1080, 12,959,944 bytes. Portrait is 864 × 1080, 6,236,081 bytes. Both are H.264/yuv420p at 30 fps, 3,840 frames and 128 seconds, with no audio and the MP4 index at the front for streaming. `media-manifest.json` binds sources and outputs. The WebP posters are 100,148 and 60,516 bytes.

Reproduce with installed FFmpeg:

```sh
ffmpeg -i docs/designs/kitchen-animation/remotion-film/kitchen-day.mp4 -an -c:v libx264 -preset slow -crf 24 -threads 2 -pix_fmt yuv420p -movflags +faststart public/films/kitchen-day/landscape-v1.mp4
ffmpeg -i docs/designs/kitchen-animation/remotion-film/kitchen-day-mobile.mp4 -an -vf scale=864:1080 -c:v libx264 -preset slow -crf 24 -threads 2 -pix_fmt yuv420p -movflags +faststart public/films/kitchen-day/portrait-v1.mp4
```

Choose new versioned names when changing the media and update the component paths and manifest together. Posters use the approved source poster frames, resized to 1600/864 pixels and converted with installed Sharp to WebP quality 85. No image content was changed.

The player chooses its edit at initial viewport size, loads video only when visible or deliberately used, plays once, and preserves manual pause. Offscreen/hidden playback pauses. Reduced motion and Save-Data start paused. A static poster, written story and direct film links remain usable without JavaScript. The film is silent; all chapter copy and illustrative figures are available as HTML.

## Verification

Application lint, typecheck, all 57 test files / 311 tests and production build passed. All 32 Playwright browser checks passed. Both 128-second playthroughs completed with zero dropped frames out of 3,892 reported frames each, including setup and control checks. The initial script totals were 155,284 bytes on desktop and 155,289 on phone, below the approved 160,000-byte gzip ceiling.

Browser inspection covered the actual homepage in desktop and phone layouts, dark and light themes, and the compressed media's fifteen-chapter progression. Six widths from 320 to 1440 pixels passed overflow checks. The player and full written story passed Axe checks. Reduced motion, Save-Data, manual pause, offscreen pause/resume, finite stop, replay, seeking, fullscreen and failed-media/no-JavaScript fallbacks passed. Hidden-tab behaviour used a synthetic visibility event. Mobile checks emulate Chromium devices; no physical iPhone or Safari claim is made. The edit is selected once to avoid interrupting playback on resize.

The first browser run was discarded after a concurrent isolated-fixture reset. The resulting stale empty-content cache was moved aside, and the complete browser suite was rerun sequentially from freshly seeded fixtures. No application data was reset. The accepted evidence is `checks.json` and `browser-extra.json`.

The homepage's three Lighthouse runs scored 99 Performance and 100 in Accessibility, Best Practices and SEO, with median LCP 2,104 ms on the documented throttled mobile profile. All fifteen Lighthouse runs across the five core routes passed the existing assertions. The full results are in `lighthouse.json`. Final independent source and evidence review returned PASS, including delivery hashes and the superseded authoring-study notes. No thresholds were weakened. This change updates the application; it does not claim a remote deployment.
