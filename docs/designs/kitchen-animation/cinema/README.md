# Study 04: a day in the kitchen

An original, 80-second miniature kitchen film. This replaces the rejected composited character approach with a consistently scaled 3D set, jointed adult characters, hand-held tools and edited close shots of kitchen work.

Preview: http://127.0.0.1:4182/kitchen-animation/cinema/

The production homepage and CMS remain unchanged. This is a local visual study; product availability and automatic integrations remain unconfirmed. All records are labelled illustrative. No claim of automatic forecasting, purchasing, stock capture or savings is made.

## Story and physical actions

| Film time | Work | Visible action |
| --- | --- | --- |
| 0–9s | Forecast, recipes and costing | Chef reviews and marks the preparation ledger |
| 9–19s | Pantry and stock transfers | Chef collects and carries a produce basket to the section |
| 19–29s | Mise en place | Knife strokes cut the fruit; slices accumulate; chef whisks almond filling |
| 29–39s | Cooking | Chef carries a tray, loads the oven and closes its side-hinged door |
| 39–47s | Usage, returns and waste | Preparation peel is transferred to the waste bowl; chef updates a record |
| 47–57s | Purchasing and receiving | Supplier sets a crate on the scale; chef inspects the fruit |
| 57–65s | Rostering and handover | Chef and owner review the next service together |
| 65–73s | Sales upload and review | Owner lifts sales sheets, reviews them, returns them and starts the upload |
| 73–80s | Tomorrow | Camera returns to the whole kitchen and reconciled daily records |

The illustrative figures reconcile: 3.0 kg drawn = 2.4 kg recipe usage + 0.3 kg returned + 0.3 kg peel waste. Opening pears 8.0 kg − 3.0 kg drawn + 0.3 kg returned + 10.0 kg accepted = 15.3 kg remaining. Ordered 12.0 kg less accepted 10.0 kg = 2.0 kg short. Prepared 24 tarts less 21 sold = 3 unsold portions to review. This does not suggest storage or reuse of unsold food.

## Rendering and playback

`authoring.html` runs the original Three.js scene. Room, people, props and routes share metre-based coordinates. Two-bone inverse kinematics keep arm lengths fixed. Held tools derive their position from the actual hand rig. Fixed room meshes are batched by material; hinged objects remain separate.

The review page uses native H.264 video, not real-time WebGL. Separate desktop and square mobile renders preserve the framing. The adjacent HTML records share the video clock. Playback starts when the picture is visible, runs once, pauses offscreen or when the tab is hidden, and offers pause, replay, seeking and chapter access. Reduced motion starts paused. The poster and complete HTML narrative remain available without animation.

From the repository root, start the preview server:

```sh
node docs/designs/kitchen-animation/cinema/serve-preview.mjs
```

The local server supports HTTP byte ranges so native video can seek before the complete file has downloaded.

Reproduce the deterministic 24fps renders with the installed Playwright package and ffmpeg:

```sh
node docs/designs/kitchen-animation/cinema/render-film.mjs
node docs/designs/kitchen-animation/cinema/render-film.mjs --mobile
```

Run the browser checks:

```sh
node docs/designs/kitchen-animation/cinema/verify.mjs
node docs/designs/kitchen-animation/cinema/verify-layout.mjs
```

## Provenance

All kitchen, character, prop geometry and motion are original code in this directory. There are no downloaded character assets or external client requests. The existing approved P/C monogram and self-hosted fonts are reused from `../assets/`; font licences remain there.

`vendor/` contains pinned Three.js 0.180.0 (`three.module.js`, `three.core.js`, `RoundedBoxGeometry.js`, `RoomEnvironment.js`) copied from the official npm archive, with leading indentation normalised. It is MIT-licensed; the complete licence is retained in `vendor/LICENSE`. This isolated authoring dependency is used for depth, articulated characters, lighting and deterministic film rendering. It is not added to the application's dependency graph or public homepage JavaScript.

## Verification and acceptance

See `evidence/checks.json` and captured desktop/mobile views for actual browser results. Motion review focuses on action sequences and contact transitions, not just UI controls. Independent review identified and prompted corrections to the crate release, actual slicing, paper placement and empty mixing bowl.

Passing technical checks and independent review do not establish user visual acceptance. This study is not a production integration or a production performance measurement.

Actual final verification: `pnpm lint` and `pnpm typecheck` exit 0; `pnpm test` passes 57 files / 311 tests; `pnpm build` completes successfully. The native browser run completes in 80.026 seconds, reports zero dropped video frames, stops without looping and replays from the beginning. Desktop and mobile Axe checks report zero WCAG 2.2 A/AA violations. The rig scan at 20 samples per second finds fixed arm lengths and no chef/island overlap.

The parent inspected dense frame sequences for cutting, whisking, carrying, oven loading, delivery setdown and waste handling, then inspected contact sheets decoded from both final native films across the whole day. Independent source/visual review passed the corrected scene; independent final native-player review also passed with no fix-first findings. The distinction remains explicit: image sequences were visually inspected; automation measured complete playback. User visual approval remains open.

Responsive checks cover all nine chapters at widths 320, 390, 700, 768, 1024, 1100, 1280, 1440 and 1600 pixels with no horizontal or story-panel overflow. Desktop film height stays fixed across chapters. The local server returns HTTP 206 for byte ranges, and native seeking was tested against that server. Final movie metadata and SHA-256 hashes are in `evidence/render-manifest.json`.
