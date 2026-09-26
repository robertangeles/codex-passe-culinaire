# A day in your kitchen: study 03

Current preview: http://127.0.0.1:4182/kitchen-animation/

This revision follows the user's request for natural-looking people, an accurate chef's working day and a selling tool for chefs and restaurant owners. The sequence now runs for **65 seconds across nine acts**. Generated illustrated adults replace the distorted SVG faces. The chef's face is kept intact while the forearm, utensils, stock, oven, receiving equipment and records animate. Camera cuts bring the relevant work closer. A panel alongside the scene connects each kitchen action to an illustrative CulinAIre Kitchen record.

## Story

| Time in film | Kitchen action | Record or decision |
| --- | --- | --- |
| 0–7s | Forecast the day | Expected covers and preparation quantities |
| 7–14s | Draw stock from the pantry | Ingredients needed by the section |
| 14–23s | Prepare ingredients | Recipe, portions and batch requirements |
| 23–30s | Begin baking or cooking | Preparation and service readiness |
| 30–37s | Record usage, returns and wastage | Where the ingredients went |
| 37–44s | Inspect and receive deliveries | Ordered versus accepted quantities |
| 44–51s | Review rosters and share handover | Section cover and the team plan |
| 51–58s | Upload sales data | Forecast versus actual covers and dishes sold |
| 58–65s | Review the whole day | Information for the next preparation plan |

Sample quantities reconcile: 3.0 kg drawn equals 2.4 kg used, 0.3 kg returned and 0.3 kg of peel waste. Opening stock of 8.0 kg, less 3.0 kg drawn, plus 0.3 kg returned and 10.0 kg received leaves 15.3 kg. Twenty-four tarts prepared and twenty-one sold leaves three unsold portions to review; no food-storage or reuse claim is made.

Playback starts when at least 75% of the combined scene and record panel is visible. It runs once, pauses offscreen or when the tab becomes hidden, and has pause, replay and a keyboard-operable timeline. Reduced motion shows a still. Nine narrative chapters are always in HTML, including with JavaScript disabled or an illustration load failure. No sound or third-party browser requests are added.

This remains a **local visual study**, not an approved homepage integration. Production source and CMS content are unchanged. Product availability and automatic connections remain unconfirmed. The people are fictional; records are labelled illustrative. The page depicts human actions and does not claim automatic purchasing, autonomous forecasting or verified savings.

## Files and local use

- `story.json`: chapter timing, wording, quantities and camera composition.
- `index.template.html`: page structure, disclosure and calls to action.
- `actors.svg`: composition of the generated characters, working-arm rig and kitchen background.
- `station-props.svg`: original vector utensils, ingredients and receiving/baking equipment.
- `assets/people-v3.webp`: generated character artwork with preserved alpha transparency. See [artwork and prompt notes](artwork-notes.md).
- `film.js`: a single clock drives paused native Web Animations so seeking does not restart completed effects.
- `film.css`: responsive presentation.
- `index.html`: generated, directly viewable page.
- `verify-preview.mjs`, `checks-v3.json` and `screens-v3/`: reproducible checks, actual results and current desktop/mobile captures.
- `animation-preview.mp4`: browser recording of the current sequence, not used by the page.

From the repository root:

```sh
node docs/designs/kitchen-animation/build-preview.mjs
python3 -m http.server 4182 --bind 127.0.0.1 --directory docs/designs
```

Then visit the preview URL. To reproduce browser checks while the server runs:

```sh
node docs/designs/kitchen-animation/verify-preview.mjs
```

No packages were added. The verification script uses the project's existing Playwright and axe dependencies. Local fonts retain their supplied OFL licences.

## Current verification

Actual application commands completed successfully:

```text
pnpm lint       exit 0
pnpm typecheck  exit 0
pnpm test       57 test files passed; 311 tests passed
pnpm build      compiled successfully; static pages generated
```

The browser check ran the actual 65-second sequence, then verified stopping without looping, replay, pause/resume, offscreen pause and keyboard seeking. It measured changing transforms for the working arm, stock movement, oven door, supplier and sales record. All nine record panels fit at 1440, 1024, 768, 390 and 320 pixels. Automated WCAG checks at 1440 and 320 pixels found no violations in the sales-review state. Reduced motion, no JavaScript and a deliberately failed character-image request each retain the complete narrative. No page errors were observed.

Desktop and mobile captures were inspected for character faces, camera framing, hand/tool placement, receiving equipment and record readability. These checks do not establish the future production performance budget or user visual acceptance.

Independent review returned READY after a fresh review of corrected study-03 documentation and the final layout checks. All nine acts now keep exactly the same film height at each tested width, preventing chapter transitions from shifting the page. User visual acceptance remains open.

Ponytail complexity review removed an unused selector binding and duplicate, unused knife/whisk drawing groups. Native browser animation and Node filesystem tools cover the implementation; no runtime framework or new dependency was added.

## Historical evidence

`checks.json` and `screens/` belong to **study 02**, the previous 32-second, five-chapter SVG-character version. They are retained as historical evidence only and do not verify this revision. The current evidence is explicitly named `checks-v3.json` and `screens-v3/`. Git history retains the earlier source and video.
