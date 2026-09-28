# About page design review

Date: 28 September 2026. Branch/base: main (no remote configured).
Target: `/about`. User requested plan-design-review and selected **full page review**.
Status: browser studies updated with labelled founder portrait spaces at the user’s request; awaiting design feedback. No application code or CMS content changed.

## Existing contract and evidence

The audience is chefs and restaurant owners assessing Passe Culinaire and exploring CulinAIre Kitchen. The company remains broader than its first product, including training, advisory and publishing. Preserve the approved C4 charcoal default, manual light/system support, exact P/C monogram, self-hosted Fraunces/Inter, current navigation and footer, and Australian English. AGENTS.md and accepted design records supply the design system; there is no root DESIGN.md. Do not reopen approved typography or palette solely because that file is absent.

Supplied founder facts: Alex Charasse is CEO, Maître Pâtissier and Maître Chocolatier, and founded Almost French Patisserie in Richmond and Almost French Epicure on Little Collins Street, Melbourne. Rob Angeles is CTO, a chef trained in pastry and hot kitchen, and a Data Architect. The founders and company are based in Melbourne. Do not invent career dates, client counts, awards, quotes, employers, product savings or photographs of the founders.

Reuse prior research in `docs/designs/research-20260926/RESEARCH.md`: named expertise and inspectable biographies, company-to-product clarity and the distinction between authentic evidence and atmosphere. This invocation does not claim new market interviews or fresh external-site research.

The current page was opened and visually inspected at desktop and phone widths. It displays a generic About heading, detached one-sentence introduction, two visible PLACEHOLDER 10 images, CEO/CTO titles and short biographies. Large vertical gaps obscure the hierarchy. It has no next step within its page content. Initial visual assessment: **3/10**. The existing brand shell is sound; the About body is the issue.

Existing implementation: public block renderer, HeroBlock, Prose, FounderCardBlock, current CMS publication/preview and SEO machinery. FounderCardBlock accepts a placeholder media object as a renderable portrait. Existing approved no-photo policy permits a text-led presentation. Any eventual implementation must preserve arbitrary CMS content and truthful empty states rather than silently deleting blocks.

## Design studies for selection

Artifacts: `/home/robangeles/.gstack/projects/codex-passe-culinaire/designs/about-20260928/`.
Board: http://127.0.0.1:43947/boards/b-20260928-100545-6hmi4o/

- A, **The founders’ editorial**: a compact charcoal opening and side-by-side factual founder biographies. http://127.0.0.1:4187/a.html
- B, **The house folio**, recommended: charcoal opening with the approved monogram; a bone founder spread with offset names/credentials; charcoal company-to-product continuation. http://127.0.0.1:4187/b.html
- C, **The partnership**: the names become the visual anchor, linked by an ampersand, above a contrasting product continuation. http://127.0.0.1:4187/c.html

All three use supplied facts and offer product/contact links. The first iteration omitted images; the user explicitly requested portrait placeholders to judge the full composition. The current iteration includes labelled photo spaces for both founders: A uses wide 5:4 frames on desktop, B and C use upright 4:5 frames; all use upright frames on mobile. B alternates portrait/biography sides on desktop and keeps photo before biography on mobile. Their new headlines, connective copy and composition are proposals, not accepted changes. Browser studies use a representative shell; production must retain the actual PublicShell and theme control. No arbitrary founder portrait has been generated or substituted.

The gstack-generated exploratory raster was rejected as authoritative content: it invented biographical claims and did not faithfully reproduce the brand. It is not included in the chooser. The hand-authored HTML studies use exact local fonts/monogram and constrained copy instead.

Local verification repeated after adding the portrait spaces: all variants checked at 320, 390, 768, 1440 and 1920px; one h1, no horizontal overflow or browser errors. Axe WCAG A/AA checks passed on each desktop and phone study. Parent inspected all six desktop/phone screenshots and corrected mobile section spacing and founder-name wrapping. These are prototype checks, not application acceptance or production performance measurements.

External image checker, prior text-only iteration: A and B returned pass. These results do not cover the portrait revision. Automatic approval review blocked C's external image-check invocation because a local screenshot with founder/business information might be sent to an external AI service. It was not retried or routed around. C received local browser/visual checks only. No full outside design-voice review has run. The portrait revision was checked locally only, with no external screenshot transfer.

## Review sequence after feedback

All seven passes are in scope. Selection of full review authorises that scope, not any new remedy. The comparison-board feedback is the next decision point. Preserve exact prior approvals; ask about genuinely separate unresolved remedies before accepting them.

1. **Information architecture:** settle opening → founder evidence → company/product next step. Compare the selected study against a five-second scan; record exact section order and CMS ownership.
2. **Interaction states:** define no-photo, one-photo, two-photo and broken-media outcomes using genuine assets only; retain semantic links, theme state, CMS preview and loading/error contracts. No form or carousel is proposed on About.
3. **User journey:** record recognition → inspect founder expertise → understand company/first-offer relationship → product/contact. Keep uncertain copy pending and prevent repetitive mood statements.
4. **Generic design risk:** assess actual selected pixels, including oversized blank areas, decorative cards, repeated slogan sections, weak action paths and unnecessary motion. Classifier is a company credibility page serving persuasion through readable evidence. Project-specific approved plain backgrounds and restrained motion take precedence over generic skill defaults.
5. **Design-system alignment:** map exact existing tokens, 1312px editorial container, 64/32/24px gutters, display weights and semantic theme colours. Retain the reinforced P/C mark. B's fixed bone section, if selected, needs an explicit light-theme treatment.
6. **Responsive/accessibility:** preserve 16px biography text, >=44px controls, one h1 and logical founder headings. Verify keyboard, mobile menu, 200% reflow, both themes and reduced motion. Define each section's mobile order; do not suppress biographical evidence.
7. **Decision register:** reconcile accepted selection, wording, genuine-portrait policy and theme behaviour. No implementation can be described as approved merely because a prototype exists.

## Not in scope

Homepage/contact redesign, logo replacement, invented founder evidence, new public offerings, product capability claims, a new backend or CMS, deployment and unsolicited third-party integrations. No new dependency is expected. Authentic portraits have not been supplied. Labelled placeholders are explicitly authorised for the comparison studies. Whether those placeholders appear on the production site has not been approved; genuine photos and no-photo behaviour remain part of implementation planning.

## Implementation tasks

Not exported yet: visual selection and detailed design passes are pending. Parent retains plan, architecture, integration and acceptance. Later bounded implementation tasks must name files and acceptance criteria; required project checks and independent review remain mandatory before application acceptance.

## GSTACK REVIEW REPORT

| Review | Trigger | Runs | Status | Findings |
| --- | --- | --- | --- | --- |
| About design | User-invoked plan-design-review | 1 in progress | Awaiting board feedback | Initial presentation 3/10; three responsive proposals prepared |
| External image check | Study raster check | 2 completed, 1 blocked | Partial coverage | A/B pass; C external check blocked by automatic approval review |
| Outside design voices | Optional detailed review stage | 0 | Not run | No outside completeness acceptance claimed |
| Engineering | Future implementation | 0 | Required before acceptance | No application diff exists |

VERDICT: Full-page scope agreed; design selection and detailed review remain pending. No implementation approval inferred.

**UNRESOLVED DECISIONS:**
- Select or refine the About composition using the browser comparison board.
- Confirm proposed wording and resolve any separate portrait/theme requirements during the detailed passes.
