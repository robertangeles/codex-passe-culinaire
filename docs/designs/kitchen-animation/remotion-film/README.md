# The whole kitchen: expanded Remotion film

The expanded study covers all eleven areas the user named, plus forecasting, stock transfers, menu costing and team messaging. It runs for 128 seconds across fifteen chapters and uses eleven original photographic scenes. People remain photographic stills; motion comes from camera framing, records, transfers, charts and typography. This is an illustrative story, not actual product UI or a claim of automatic actions.

Preview: http://127.0.0.1:4182/kitchen-animation/remotion-film/

```sh
pnpm film:preview
```

The finite, muted film starts when visible. It supports pause/replay, keyboard seeking, fullscreen, offscreen/hidden-tab pause and an initially paused reduced-motion preference. Static posters and the full transcript remain available without JavaScript. The initial viewport selects the desktop or phone edit; resizing does not interrupt playback.

## Coverage

| Time | Chapter | Kitchen workflow |
| --- | --- | --- |
| 0–6s | Opening | A kitchen day connects the food, the people and the decisions behind service. |
| 6–14s | Forecast | Review expected covers and decide what the team needs to prepare. |
| 14–22s | Rostering | Review shifts and section coverage. Send the preparation plan to the team before work begins. |
| 22–32s | Recipe Lab | Set ingredients, cuisine and portions. Develop and refine the recipe, then review the menu cost. |
| 32–42s | Patisserie Lab | Develop the pastry by type and technique, with component planning and make-ahead notes. |
| 42–52s | Cocktail Lab | Choose the spirit base, flavour and style. Develop a drink specification and a batch for service. |
| 52–60s | Purchasing | Review stock against the target, prepare a purchase order and track what was ordered. |
| 60–68s | Receiving | Inspect the delivery against the purchase order. Record accepted quantities and a short delivery. |
| 68–76s | Inventory | Keep opening stock and the new delivery visible as separate batches. Draw from the older stock first. |
| 76–84s | Mise en Place | Draw the ingredients, record the transfer and organise the preparation tasks for the pastry section. |
| 84–94s | Production | Work through the preparation and baking stages, then record the completed yield for service. |
| 94–100s | Service | The savoury kitchen, pastry section and bar bring their preparation to service. |
| 100–110s | Waste Management | Separate recipe use, usable stock returned and preparation waste. Record the reason and review its cost. |
| 110–120s | Sales | Upload the sales file and compare what was planned, prepared and sold. Review unsold portions separately from waste. |
| 120–128s | The whole kitchen | CulinAIre Kitchen brings the eleven areas into view, from the three labs to the daily operation. |

The three labs are grounded in the sibling CulinAIre Kitchen repository's actual form, request and output schemas. The user calls the beverage area Cocktail Lab; its current product route is `/spirits`. [COVERAGE.md](COVERAGE.md) records source references and separates verified code support from illustrative content. No live product transaction or model-generated recipe was executed for the film.

All example figures are fictional: 80 forecast covers and 74 served; 24 tart portions prepared, 21 sold and 3 unsold for review. Opening pear stock 8 kg plus 10 kg accepted delivery gives 18 kg. A 3 kg pastry draw leaves 15 kg; 2.4 kg enters the recipe, 0.3 kg returns and 0.3 kg is prep trim. Closing stock is 15.3 kg. At an illustrative $4/kg, the trim costs $1.20. The separate savoury dish's illustrative $3.20 portion cost against a $16 menu price is 20% food cost. No savings or margin improvements are claimed.

## Authoring

Both edits use [ExpandedFilm.tsx](ExpandedFilm.tsx) and the fifteen-chapter [story.json](story.json). The desktop composition is 1920 × 1080; the recomposed phone version is 1080 × 1350. Both have 3,840 frames at 30 fps. The photographs are 1672 × 941 originals, scaled within the output; they are not native moving 1080p footage. Exact prompts and image hashes are in [image-provenance.json](image-provenance.json). Five new assets were made with the built-in image generator and saved in `public/`.

```sh
pnpm film:studio
systemd-run --user --scope -p MemoryMax=6G -p MemorySwapMax=512M pnpm film:render
systemd-run --user --scope -p MemoryMax=6G -p MemorySwapMax=512M pnpm film:render:mobile
```

Studio uses port 4183. Candidates and manifests go to ignored `.local/remotion-kitchen/`; render commands do not overwrite the preview films. Rendering uses the installed Playwright Chromium with concurrency 2, H.264/yuv420p and CRF 18. Each manifest captures source, timeline, asset, font and lockfile hashes before rendering and checks them again afterwards. Review and verify candidates before replacing the preview exports.

```sh
node docs/designs/kitchen-animation/remotion-film/render.mjs --stills
node docs/designs/kitchen-animation/remotion-film/render.mjs --mobile --stills
node docs/designs/kitchen-animation/remotion-film/verify.mjs
```

## Scope and licence

The user approved this film on 28 September 2026 and requested homepage integration. The application now uses smaller web copies; see [homepage integration](../../homepage-film-integration/README.md) for implementation and verification. This directory retains the authoring study and full-quality masters. Remotion is a development dependency; the production homepage and CMS do not load it. No new package or paid video service was added for the expansion. The earlier 80-second version is retained in Git commit `16a79ab`.

Remotion permits free evaluation and free commercial use for eligible individuals and organisations of up to three people. Larger commercial organisations require the appropriate licence. No licence purchase was made. See the [official licence FAQ](https://www.remotion.dev/docs/license/faq).

## Verification

Both final exports completed uninterrupted 128-second browser playback. Desktop reported 1 dropped frame from 3,850 reported frames; phone reported 3 from 3,851, including setup. All 90 chapter/viewport states passed without overflow. Axe reported zero violations at 390 px and 1440 px, and page errors were zero. Pause/replay, finite stop, keyboard seeking, fullscreen, manual-pause persistence, offscreen pause/resume, reduced-motion start, no-JavaScript and media-failure fallbacks passed. Hidden-tab pause was checked with a synthetic visibility event, not an operating-system tab switch.

Parent and independent review inspected the final encoded chapter progression and all fourteen cuts in both formats. Parent also inspected desktop and phone browser pages. Source and media hashes match the render manifests and `evidence/checks.json`. Application lint, typecheck, 57 test files / 311 tests and production build passed; direct study-source ESLint passed. The exports here are approximately 50 MB and 46 MB authoring masters. The user subsequently approved the film visually, and the homepage now uses 12.96 MB / 6.24 MB web copies. Delivery, homepage playback and performance checks passed; current integration evidence is in [homepage integration](../../homepage-film-integration/README.md). Remote deployment remains separate.
