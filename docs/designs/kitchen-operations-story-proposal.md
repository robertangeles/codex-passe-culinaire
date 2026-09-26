# Proposal: A day in the kitchen, seen as a whole

Status: browser storyboard and representative transition authorised by the user (“Let’s go”). Production integration remains a subsequent step after reviewing the prototype. The user requested that the homepage's illustrative prep example explain the broader operational scope of CulinAIre Kitchen: purchasing, receiving, inventory, stock transfers, mise en place, waste, recipes, menus and costing, rostering and messaging. Which capabilities are live versus planned has been asked and is pending.

## Creative direction

Replace the small example panel with a full-width editorial story immediately after the company introduction. Keep C4's charcoal, bone, typography and restrained atmosphere. Give the product introduction a short opening above the story. The narrative follows one dish and its ingredients through a working day, making the relationships between kitchen decisions visible.

Working headline: A day in the kitchen. Seen as a whole.

Use a fine-line illustration of a kitchen and its working records: supplier crate, receiving bench, coolroom, preparation bench, pass and closing ledger. The visual should feel like a drawing from a chef's working notebook. Bone lines, quiet moss surfaces and a small copper accent carry information; all essential labels remain high-contrast. The selected monogram is an opening/closing signature, not a repeated animation device.

## Five chapters

| Chapter | Kitchen action | Product context to illustrate, subject to capability confirmation | Visual event |
| --- | --- | --- | --- |
| Before the doors open | Decide the menu, develop recipes, calculate quantities and review ingredient costs before ordering | Recipes, menu costing and purchasing records | A recipe sheet is placed beside a supplier order; the shared ingredient stays visibly linked |
| The delivery arrives | Check what was actually received and where it is stored | Receiving and inventory | Ordered and received quantities can be compared; the accepted goods appear in their storage location |
| Mise en place | Transfer ingredients to the working section and prepare components | Stock transfers and prep | The ingredient moves from storage to the pastry/prep bench; its component appears on the day's prep list |
| Service | Know who is working and share changes with the team | Rostering and messaging | A roster and a concise handover note accompany the kitchen pass; people remain the actors |
| At the close | Record waste, inspect remaining stock and review costs for the next day | Waste records, stock position and costing review | The same ingredient's records are brought together; tomorrow's planning is the final connection |

Example narrative can retain the pear tart from the approved hero to create continuity. Keep one ingredient and one batch legible throughout. Use labelled sample data if quantities are shown. Do not imply automatic stock deduction, supplier integration, stock forecasting, sales/POS integration, live margins, labour optimisation or automatic messaging unless separately verified. The user supplied functional domains, not those integrations.

The conceptual centre is cause and effect: a different received quantity matters to stock and prep; a recipe or ingredient-cost change matters to menu costing; an end-of-day waste record informs the next planning decision. Show human actions and their records. Confirm any claimed automatic propagation before depicting it.

## Interaction

Desktop: compact five-chapter navigation, one generous illustration, and a concise explanation of the kitchen action and where the product supports it. Clicking a chapter advances the state; previous/next buttons and a visible progress label make the sequence clear. Optional one-shot introductory reveal can run once when the section enters view. The story remains understandable without watching an entire sequence. No scroll interception, parallax or endless loop.

Mobile: one illustration and chapter at a time, followed by readable text and large previous/next controls. Avoid a shrunken desktop map and avoid horizontal swiping as the only navigation.

Motion: brief line emphasis, fades and small position changes that explain a specific action. Preserve the repository's short transition convention. Use an explicit Play option only if timed playback is approved later; provide pause/replay and never force visitors to wait. Reduced-motion presents complete static chapter states. Essential text exists in server-rendered HTML and is available without JavaScript.

Closing message and CTA should connect the broader view to exploring CulinAIre Kitchen. Use verified product screenshots as evidence if they can be supplied, or keep the animation explicitly labelled as an operational illustration. Do not fabricate a live product interface.

## Delivery sequence

1. Confirm capability availability and the actual relationships between records.
2. Produce a browser storyboard with all five states and the proposed copy, at desktop and mobile widths.
3. Animate one representative transition, receiving to mise en place, to establish the visual style and movement.
4. Review the concrete browser prototype before replacing the current homepage section.
5. Integrate the selected treatment using SVG/CSS and a small client controller, retaining server-rendered content. Aim to fit within the existing roughly 14kB JavaScript headroom; measure rather than promise. Preserve all existing accessibility and performance thresholds.

No production files or CMS content have been changed by this proposal.

## Browser prototype delivered

The five-chapter [interactive study](kitchen-operations-story/index.html) is implemented and locally served at http://127.0.0.1:4182/kitchen-operations-story/. It includes one explicit 900ms receiving-to-prep transfer, brief chapter/scene transitions, mobile framing, reduced-motion states and a complete no-JavaScript narrative. [Verification and screenshots](kitchen-operations-story/README.md) are retained. No application source or CMS content changed. The next decision is feedback on this concrete storyboard; production feature availability remains unconfirmed.
