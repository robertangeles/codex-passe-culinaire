# Kitchen animation study

Preview: http://127.0.0.1:4182/kitchen-animation/

The user rejected the thin architectural storyboard and barely visible motion. This second study replaces it with an illustrated kitchen and a 32-second sequence: a recipe, a walking delivery character, preparation with a moving hand and whisk, a plate passing across the bench, and closing records. Playback starts when at least 35% of the scene is visible, runs once, and pauses offscreen or in a hidden tab. Pause and replay remain available. Reduced motion shows a still; the complete five-chapter narrative is always in HTML.

This is a browser animation study for visual feedback, not an approved homepage integration. Production source and CMS content are unchanged. Product availability and automatic connections remain unconfirmed. Sample quantities are labelled illustrative. The background was generated from a generic French-kitchen illustration prompt; the characters and props are original SVG artwork. Local fonts retain their supplied OFL licences.

The user's request for a visible, passive animation authorises this finite sequence in the prototype. It does not introduce looping motion or autoplay video into the application.

## Files and local use

- `index.template.html`: page content, with an SVG insertion marker.
- `actors.svg`: independently posed character and prop groups.
- `film.js`: native Web Animations timeline, playback and motion preferences.
- `film.css`: responsive presentation, including a full-scene mobile composition.
- `index.html`: generated, directly viewable page.
- `checks.json` and `screens/`: actual browser check results and captured states.
- `animation-preview.mp4`: a cropped recording of this browser animation, supplied for convenient viewing, not used by the page.

From the repository root:

```sh
node docs/designs/kitchen-animation/build-preview.mjs
python3 -m http.server 4182 --bind 127.0.0.1 --directory docs/designs
```

Then visit the preview URL. No additional packages are needed.

## Verification

Actual application commands completed successfully:

```text
pnpm lint       exit 0
pnpm typecheck  exit 0
pnpm test       57 test files passed; 311 tests passed
pnpm build      compiled successfully; static pages generated
```

Browser checks exercised the real 32-second playback, then verified no loop, pause/resume, replay, offscreen pause, 390px and 320px layouts, reduced-motion and JavaScript-disabled behaviour. No page errors were observed. Automated WCAG checks at 320px and the desktop opening state found no violations. All five mobile captions were also checked for vertical clipping at 320px and 390px. Screenshots were inspected for receiving, preparation and service; visual acceptance remains with the user. The application checks do not establish this standalone animation's future production performance budget.

Independent review: READY after fixing a 320px caption clipping defect. A fresh review independently verified all five captions at 320px and 390px. User visual acceptance and production integration remain open.
