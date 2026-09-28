# Contact page design review

Status: design review complete. The user selected B on the comparison board, commenting “this is the best option”. No application files have changed during this planning review.

## Scope and existing contracts

Review /contact only, on main (no origin remote configured). Existing user approvals establish the C4 charcoal shell, selected P/C geometry, local Fraunces/Inter fonts, restrained culinary identity, Australian English, centred homepage widths, light/system theme support and accessible forms. There is no root DESIGN.md; AGENTS.MD and the approved C4 plan supply the existing design contract. No new brand-system consultation is necessary to restate those decisions.

The current form already supplies six fields, server-side validation, progressive enhancement, focus transfer, duplicate-request protection, durable saved receipts and honest notification failure messaging. Preserve those behaviours and field requirements. Venue remains optional; role and topic remain required. Contact recipient details and delivery credentials remain private configuration, not invented public copy.

## Observed problems

The current page separates a large quiet hero, boilerplate prose and the form into three padded sections. The first desktop input starts around 852px down a 1440px-wide page. At 390px it starts around 557px. The form and hero use the older inner-column offsets rather than the current homepage gutters. The page feels unfinished because spacing separates the invitation from the action and the form has little visual hierarchy.

Initial design impression: 4/10. This is an assessment of the presentation, not a claim that the working delivery system is broken.

## Approved direction and decision ledger

B, The quiet desk, is approved. The submitted feedback selects B explicitly; the two zero star values are the board defaults and are not interpreted as negative ratings. No new confirmation of the selected option is needed.

The approved composition uses a charcoal background, understated green-grey form fields, a ruled form heading, and the headline “A conversation. A place to begin.” A short invitation follows: “Tell us what’s happening in your kitchen, or what you have in mind.” The desktop left column contains the invitation and small founder context; the right column holds the complete form. All six existing fields remain. The existing header and footer are reused, not replaced by the abbreviated prototype shell.

Decision D1: apply B's visual composition and wording. Evidence: submitted feedback.json and the user's “Sent feedback” message. Previous approved contracts govern the unchanged fields, theme preferences, exact mark, typography, factual founder names and accessible behaviour. The proposal to use A is superseded. New accepted design decisions: one.

## Approved mockup and evidence

Artifact directory: `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/contact-20260928/`.

| Surface | Approved artifact | Constraint |
| --- | --- | --- |
| Desktop | b-1440.png | Two columns; full form and submit visible at 1440 × 1000 |
| Phone | b-390.png | One column; explicit field labels; full-width submit |
| Responsive study | b.html | Layout reference, not production validation or delivery code |
| User choice | feedback.json and approved.json | B; “this is the best option” |

Board: http://127.0.0.1:43947/boards/b-20260928-081301-wwjd4t/
Responsive preview: http://127.0.0.1:4186/b.html

The exploratory generated raster is not approved: despite an automated quality-check pass, it invented founder titles/signatures, changed the logo and marked role optional. Those details are excluded from both HTML studies. Parent inspected the exact-font, exact-monogram desktop and phone studies. Four 390/1440px prototype checks returned zero main-content Axe violations and zero overflow. The selected B also had no page overflow at 320, 375, 390, 740, 768, 800, 1024, 1440 and 1920px. These are prototype checks, not application acceptance or proof of production form delivery.

## Pass 1: Information architecture

3/10 → 9/10. The original page separates title, boilerplate and form with large padded sections; the approved B presents invitation and action together. The three priorities are the invitation, the enquiry, and modest factual context. At 1440px the first field moves from roughly 852px to 335px, and the send button ends near 863px. On phone the title wraps to three lines, so the first field starts near 545px: B's mobile advantage is clearer grouping, not a claim of radically reduced scrolling.

```text
Existing public header, exact P/C mark and navigation
Contact main, aligned to the homepage container
├─ Desktop left: Contact → headline → invitation → founder context / About link
└─ Desktop right: Your enquiry → fields → Send message / server result
Phone: invitation → form → existing footer
```

Required fields retain their current values and validation. Name/email form the first desktop pair; venue/role the second; topic and message span both columns. No extra introductory CTA duplicates Send message. On mobile, preserve reading and focus order in the DOM without CSS reordering. This is the same layout decision D1; no second approval is needed.

## Pass 2: Interaction state coverage

8/10 → 9/10. Existing server-action behaviour is already specified and tested. Carry it into the approved form region without changing persistence or delivery semantics. Prototype state buttons are not production interface elements.

| State | What the visitor sees | Required behaviour |
| --- | --- | --- |
| Idle / empty | Visible labels, unselected role/topic prompts, editable fields, Send message | Name/email/role/topic/message required; venue explicitly optional |
| Partly completed | Entered values in the same layout | Preserve values through server validation; no stepper or forced field progression |
| Sending | Sending… on the existing disabled submit button | Keep dimensions stable and prevent repeat action; do not show success early |
| Invalid | Focused summary plus individual field messages | aria-invalid and linked errors; retain entered values; native constraints remain |
| Save unavailable | Focused “Your message could not be saved. Please try again.” | Keep values and allow retry with the existing request identity |
| Saved | Message received and the server's saved message / receipt | Show only after durable save; replace the form within the right-hand region |
| Emailed | Saved receipt plus server-confirmed notification sent text | Never infer notification success from the visual state |
| Notification failed after save | Saved receipt and explicit notification failure wording | Explain no resend is needed; do not discard the enquiry or claim delivery |
| Send another | Existing return-to-contact action | Restore a fresh form/request identity through the existing route |
| JavaScript disabled | Native form and server response | Preserve progressive enhancement and server validation |

No new data state or delivery promise is proposed. This pass preserves existing contracts; no new choice is open.

## Pass 3: User journey and emotional arc

4/10 → 9/10. The approved composition makes the page feel like contact with a small culinary company while keeping the work of writing straightforward.

| Step | Visitor does | Intended feeling | Design support |
| --- | --- | --- | --- |
| First five seconds | Recognises the brand and purpose | Oriented | Exact P/C identity, Contact label, authored headline and visible form |
| Chooses topic | Identifies the reason for writing | Understood | Existing kitchen, training, advisory, press and other categories |
| Writes | Supplies context at their own pace | Unpressured | Quiet fields, optional venue, no phone request or long explanation |
| Submits | Waits for an acknowledgement | Confident | Stable pending state; explicit failure or truthful durable receipt |
| Returns later | Remembers whether the message was saved | In control | Receipt and existing no-duplicate handling; no unsupported response deadline |

Founder context uses only the already public names Alex Charasse and Rob Angeles, with an About link. It does not claim either personally responds to every message. Five-minute success is sending an enquiry without confusion; long-term trust depends on honest receipts and actual follow-up, not decorative assurance. No unresolved journey decision remains.

## Pass 4: Generic-design risk

4/10 → 9/10. Classifier: HYBRID. The left introduction establishes identity; the form is an OPERATE surface. The existing full-width marketing-hero prescription does not apply to the form, and the user's approved centred homepage gutters remain authoritative.

Hard rejection audit: no generic card grid, no unbranded photograph, no image behind text, no repeated mood sections, no carousel and no stacked app cards. The original weak action visibility is resolved by placing the form beside the invitation. B uses no new image, ornamental icon stack, signature, gradient, shadow or gratuitous motion.

| Litmus | Result | Evidence |
| --- | --- | --- |
| Brand unmistakable in first screen? | Yes | Existing P/C mark and wordmark, plus culinary company context |
| One visual anchor? | Yes | Invitation and form form one deliberate two-column composition |
| Scannable by headlines? | Yes | Contact, invitation, Your enquiry and persistent field labels |
| One job per section? | Yes | Invitation/context on left; compose/send on right |
| Are cards necessary? | No | Form belongs to the page grid with a single heading rule |
| Does motion improve the task? | No | No new motion is specified; existing reduced-motion behaviour remains |
| Premium without shadows? | Yes | Approved study uses none; proportions, type and contrast carry the design |

D1 establishes the visual treatment. No new stylistic remedy is pending.

## Pass 5: Design-system alignment

5/10 → 9/10. There is no standalone DESIGN.md, but the complete approved contract in AGENTS.MD and C4 evidence is sufficient for this scoped page. A new global design-system exercise would duplicate existing decisions.

Use self-hosted Fraunces at light weight for the invitation and form heading; Inter for prose, labels and controls. Match the current homepage width: max 1312px, desktop 64px gutters, 32px at intermediate widths and 24px on phone. The study's layout details adapt to those production tokens; do not introduce a separate global spacing scale.

Use semantic foreground/surface aliases, subdued form surfaces and a border contrast of at least 3:1. Light and system preferences retain the existing settings and invert surfaces through the established semantic palette, not a hard-coded dark-only form. Labels remain readable, field values are at least 16px, body copy is 16–18px, display is capped at 72px. Rectangular controls have the existing 2px input radius; buttons have no radius or shadow. Keep the existing shell, navigation, theme selector and footer. Use text-decoration and visible focus for the About link.

No changes to logo geometry, fonts, global nav or brand palette are accepted or required.

## Pass 6: Responsive behaviour and accessibility

7/10 → 9/10. Preserve the approved desktop/phone layouts with continuous fitting at intermediate sizes. Stack the two page columns by 800px; retain the homepage's gutter breakpoints independently. Stack form pairs on phone, make the send button full-width there, and keep input heights at least 48px. Founder context may be omitted from the phone presentation as shown in B; no required input or contact action disappears.

Use one h1, a form heading h2, semantic main and labelled controls. Preserve required attributes, autocomplete, native selects, error associations, focus transfer and server-action progressive enhancement. Do not replace select controls with custom menus. Test keyboard focus, native selection, 200% zoom and error recovery. If the intro title would clip, allow natural wrapping; do not use overflow hiding.

The public source must remain server-rendered, including the form and CMS introduction. Actual acceptance must cover 320/390/768/1440/1920px, dark/light/system, reduced motion, native no-JavaScript submission and truthful delivery outcomes. Automated prototype Axe checks support this plan but do not certify all assistive technologies.

## Pass 7: Decision register

One new decision resolved: B's contact-page visual composition and copy. Existing required-field, state-machine, accessibility, factual-content and CMS-editability decisions are carried forward unchanged. No new product capability, contact method or data requirement is introduced. There are no unresolved design choices to ask again. No deferred TODO is proposed.

## Content and implementation constraints

Use existing CMS-backed contact introduction content. The approved headline/invitation can replace the known seed heading and boilerplate through a guarded local content update: back up the page; confirm its current published content matches the known source; modify only the approved fields; leave unrelated blocks, metadata and drafts alone. If the published content has been edited or an independent draft exists, stop that data update and report the conflict rather than overwriting it. Keep seed sentences plain; do not add marketing prose to seed data.

The scoped route composition places the CMS introduction and factual context beside the form. Preserve the existing BlockRenderer/public projection, preview refresh, metadata, JSON-LD, request identity and action. Never silently drop arbitrary blocks to force the mockup. Engineering must verify one h1 and retained custom CMS content. These are implementation constraints for the selected design, not additional product choices.

## Not in scope

Backend delivery changes, removing required fields, new contact methods, response guarantees, booking integrations, new CMS schema, homepage changes, global shell changes, deployment or fabricated founder evidence. No new package is needed.

## Implementation tasks

- [ ] T1 (P1, human ~2h / agent ~20min): apply B's scoped contact-page composition and CMS introduction mapping. Files: contact/page.tsx, a colocated CSS module and only necessary public presentation code. Verify one h1, exact public shell, editable text and no omitted custom blocks.
- [ ] T2 (P1, human ~1h / agent ~15min): style the existing form with the approved desktop pairs, full-width topic/message and mobile stack. Files: ContactForm.tsx and ContactForm.module.css. Preserve action, native fields, validation, focus and truthful server-result rendering. Do not add preview controls to production.
- [ ] T3 (P1, human ~1h / agent ~15min): apply the approved copy locally with backup and source/draft guards. Files: a scoped update script and focused content-guard tests if needed. Reuse existing local-target/publication protections; no migration or broad seed rewrite.
- [ ] T4 (P1, human ~2h / agent ~25min): run lint/typecheck/test/build, independent source review, real desktop/phone visual checks and existing contact-flow tests against isolated test fixtures. Verify dark/light, keyboard/error recovery, no-JavaScript, receipt truthfulness, CMS preview and no viewport overflow. Recheck relevant route performance under existing budgets. Never send test mail to real recipients.

Parent owns plan, integration and acceptance. Assign bounded executor tasks with disjoint files, then inspect their diffs and run project gates. Any fix-first verdict requires another review. This review produces the plan; implementation is the next phase.

## Review summary

| Dimension | Before | After approved design specification |
| --- | --- | --- |
| Initial impression | 4 | Recorded separately |
| Information architecture | 3 | 9 |
| Interaction states | 8 | 9 |
| User journey | 4 | 9 |
| Generic-design risk | 4 | 9 |
| Design-system alignment | 5 | 9 |
| Responsive/accessibility specification | 7 | 9 |
| Overall (lowest rated dimension) | 3 | 9 |

The final score rates the approved design specification, not completed application code. One decision was accepted, none deferred. Outside design voices were not run; the automated raster checker did not establish cross-model design acceptance. Historical whole-site reviews are not represented as fresh contact-page implementation reviews.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
| --- | --- | --- | --- | --- | --- |
| Contact design | /plan-design-review | Layout, states and brand alignment | 1 | Design complete | B approved; one decision; design specification 3/10 → 9/10 |
| Contact engineering | Implementation phase | Validate scoped changes and CMS handling | 0 | Required before acceptance | No application diff exists yet |
| Outside design voice | Optional review phase | Additional design challenge | 0 | Not run | No external completeness review claimed |

VERDICT: Contact design specification complete. Engineering and implementation verification remain required before the updated page is accepted.

NO UNRESOLVED DECISIONS
