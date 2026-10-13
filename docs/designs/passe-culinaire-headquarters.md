# Design: Passe Culinaire company headquarters

Generated through office-hours on 2026-09-25.
Branch: main. Repository: codex-passe-culinaire; no remote configured.
Status: APPROVED. The user approved the reviewed design and proposed sketch with "Approve" on 2026-09-25.
Mode: business website strategy within the approved implementation scope.

## Decisions already made

- The user approved `docs/PLAN.md` with defaults. Preserve the seven phases, fixed stack, collections, routes, blocks, machine-readable outputs, quality budgets and orchestration. This document guides the public experience; it does not replace the build specification.
- The user explicitly selected the home page outcome: "Chefs and owners understanding you and exploring CulinAIre Kitchen". Give that journey priority in the page hierarchy.
- Keep the company wider than its first product. Training, advisory and publishing remain supported in v1, even while their initial content is unpublished.
- The approved defaults are the production domain passeculinaire.com; a plain Node VPS with local Postgres, Caddy and systemd; local media with an S3 switch; SMTP with a Resend switch; no newsletter; founder-supplied brand assets with development placeholders; lowercase Fraunces wordmark and seasonal hero selection.
- Required contact reply email, separate event draft state and attendance status, and the five core smoke routes were included in the approved plan.
- Public search is authorised for this work and future public searches in this session. This is not authority to disclose credentials or private material. Research here used general category terms.

## Problem and launch outcome

A chef or restaurant owner evaluating the company needs to understand who Alex and Rob are, why they understand kitchen work, and how Passe Culinaire relates to CulinAIre Kitchen. The site must make it easy to continue to the product or contact the founders, without implying that unpublished training and services are available to book.

The desired result is a credible company headquarters that the founders can update themselves. A visitor should leave with a correct understanding of the company and a useful next step. The build also serves press, partners, future hires, investors and automated readers, but they do not set the home page's first-screen priority.

Without this site, the company lacks the requested central place for its story, product, future offerings and publications. The current repo has tooling and a build plan, but no application. The founders' present enquiry channels and publishing workflow have not been supplied; do not invent them.

## Evidence and its limits

- User-supplied facts: both founders are chefs; Alex is a Maître Pâtissier and Maître Chocolatier, founded Almost French Patisserie and Almost French Epicure, and is CEO. Rob is a data architect trained in pastry and hot kitchen, and is CTO. The company is based in Melbourne.
- User-supplied positioning: the audience distrusts technology and AI. Lead with kitchen reality and concrete outcomes. This is a brief requirement, not a finding independently established by this research.
- [Ritz Escoffier's consulting page](https://www.ritzparis.com/ecole-ritz-escoffier/culinary-consulting) describes specific kitchen tasks, chef involvement and the engagement process. It is a useful example of making expertise legible.
- [Mise's services page](https://www.mise-group.com/services) separates training, consultancy and operational management, each with a clear next step. It is an example of organising different offers under one company.
- [Beaton's research account](https://beatonglobal.com/building-trust-and-authenticity-in-professional-services/) connects professional-services trust with relevant expertise, reliability, care and attention to client needs. Its reported market research is broader than this audience and is not proof of conversion for this site.
- No customer interviews, product-usage figures, revenue, existing conversion baseline or confirmed product feature inventory were supplied. Comparable websites establish presentation patterns, not demand for Passe Culinaire.

Research synthesis: the familiar approach is to explain the work, identify the people and provide a clear next step. The examples support that approach. The project-specific implication is that a complete publishing platform must work convincingly when several collections have no published entries. There is no evidence here for changing the approved business model or technology stack.

## Premises carried forward

1. Company credibility comes before asking a visitor to evaluate the technology. This follows the user's chef-to-chef positioning and selected home page outcome.
2. CulinAIre Kitchen is the first offer, while Passe Culinaire owns the broader relationship. This follows the original company/product distinction.
3. Published facts must remain distinguishable from development placeholders and future offerings. This follows the no-invention rule, draft seeds and requirement for real testimonials only.
4. The CMS should support later content without a rebuild of the site. This follows the approved collections, page blocks and publishing workflow.

These premises reuse the brief and actual answers. They do not assert that customers have validated an offer, that a workshop is bookable, or that product features are verified.

## Approaches compared

| Approach | How it works | Advantages | Costs and risks | Reuse and fit |
|---|---|---|---|---|
| A. Full company publishing platform with a focused launch journey | Implement the approved seven phases. Put company understanding and product exploration first, and render other content according to publication state. | Meets the full brief; founders can expand publishing without commissioning another site. | Largest implementation and operational surface; an empty-content launch must be designed deliberately. Effort XL, delivery risk medium. | Reuses the approved Payload models, blocks, routes and single-app architecture. Retained because it is already approved. |
| B. Small company site first | Build only company, founders, product and contact pages initially; add the wider CMS and discovery outputs later. | Fewest initial files and fastest route to a simple public presence; less initial operational behaviour to verify. | Defers explicit v1 requirements and changes phase acceptance. Effort M for the first release, scope-compliance risk high. | Could reuse the same stack later, but it needs a new scope decision. Not selected. |
| C. Editorial publication first | Keep the full platform, but organise the home page around a substantial body of published journal material with the product discovered through articles. | Demonstrates thinking through useful writing; provides a continuing reason to return. | Requires real editorial material before launch and makes the chosen product journey less direct. Effort XL plus continuing editorial work, launch risk high with draft-only seeds. | Reuses journal and page blocks. Not selected because it does not match the user's chosen launch priority. |

Recommendation: retain A because it fulfils the approved scope and the user's selected outcome. B and C are comparisons, not approved cuts, additions or alternate build instructions. Effort labels are relative planning estimates, not delivery promises; execution timing requires the Phase 1 compatibility and environment checks.

## Recommended public journey

```text
Chef or owner arrives
        |
        v
Company introduction in kitchen language
        |
        v
What CulinAIre Kitchen is + an accurate product link
        |                                      |
        v                                      v
Explore the product                     Read about the founders
                                               |
                                               v
                                      Contact Passe Culinaire

Published services, training and journal entries
        -> add relevant depth to the same journey
```

Use the approved home blocks and editable navigation. The Hero and Plain statement establish the company. Product spotlight gives the product route a clear, early place in the hierarchy. Founder cards and About supply the human context. Services, Upcoming events and Journal feed expand the page as their records are published. Contact remains easy to find. Keep all required blocks in the seeded layout; do not remove features because their initial queries return no public records.

Use `Explore CulinAIre Kitchen` for the principal product link, pointing to the internal product page. That page clearly identifies the external product website before linking to it. Avoid unverified capability examples, savings claims, app-store links or sign-up promises. Founder details must use only supplied facts until further copy is confirmed.

The implementation must preserve the supplied editorial design: local Fraunces, Inter and JetBrains Mono; bone/ink and charcoal/linen themes; measured prose; generous spacing; square edges; subtle motion with reduced-motion support; authentic imagery when supplied. Quiet text is preferable to giving a placeholder image the appearance of real founder or client evidence.

## Publication and empty states

| State | Public behaviour | Editorial/technical obligation |
|---|---|---|
| No published services | A concise, truthful empty state and contact path; no invented offer, price or availability. | Draft services remain editable and private. |
| No upcoming training | State that no public dates are listed. Keep published past training visible where available. | Never turn the seeded relative dates into bookable events automatically. |
| No published journal posts | A short calm note; no draft excerpts, empty cards or fabricated articles. | Published posts appear through the normal invalidation flow. |
| Missing founder portraits | Use tasteful, clearly understood placeholders or a text-led presentation. | Do not imply a placeholder depicts either founder. |
| Missing product facts or assets | Use the supplied company/product relationship and verified link; show no invented demonstration. | Product feature copy requires verified facts before publication. |
| Content lookup fails | Treat it as an error, not as an empty collection. When rendering requires a DB lookup and that lookup fails, return a calm HTTP 503 response with Cache-Control: no-store. Do not substitute an older application query result on failure. | Log the failure and preserve draft/access boundaries. Normal successful public cache responses retain the approved 600-second freshness and 86400-second stale-while-revalidate policy; publication changes invalidate affected entries. Test this distinction in production mode. |
| Contact delivery fails after saving | Distinguish a saved enquiry from a delivered notification; do not ask the visitor to submit the enquiry again. | Keep notification status, attempt time and a sanitised error on the private form-submission record. An admin finds failed notifications in Payload's form-submissions list and opens the saved record. For v1, the recovery action is to reply manually through the configured mailbox using the saved reply address and message, then record that it was handled. Automatic resend and a custom retry UI are not required. |

Required editorial checks apply to every publicly seeded page as well as collection entries. Placeholders support development; real founder assets and reviewed copy remain pre-launch content work. There must be no false customer quotes or guessed addresses in public structured data.

## Success criteria and verification

- Proposed content acceptance exercise: show the home page to three chefs or owners without explaining it. Ask them to describe the company, identify CulinAIre Kitchen's relationship to it, and find the product link. Record misunderstandings. This is a small usability check, not evidence of market demand or a statistical conversion estimate.
- Test the same journey with zero published services/events/posts and again with published fixtures. It must remain usable with keyboard navigation, on mobile and without executing client JavaScript.
- Preserve every existing technical acceptance criterion in `docs/PLAN.md`: public server-rendered content, private drafts, publication visible within 60 seconds, correct discovery endpoints, WCAG 2.2 AA, four Lighthouse mobile scores at least 95, LCP below 2.0 seconds under the specified test conditions, and home JavaScript below 120 kB gzipped.
- Verify HTML, structured data, feeds and exports describe the same published company/product facts. An accessibility or schema pass does not establish content accuracy or search placement.
- Analytics remains off by default. Initial content comprehension can be checked directly without adding a tracking vendor or inventing a conversion target.

## Distribution and operations

The public website will be served at the approved canonical domain through the documented plain Node VPS deployment. GitHub Actions checks PRs; deployment remains manual. Persist Postgres and media, run scheduled publishing jobs, test backups and restoration, and expose the bounded DB health check described in the plan.

The confirmed product destination is the URL supplied in the brief. No customer acquisition channel has been validated in this conversation. Direct sharing with known chefs and owners is a proposed initial way to evaluate comprehension, not an assumed source of traffic. Search and machine-readable publishing remain required capabilities, without a promised ranking or referral volume.

## Open facts and dependencies

- Product feature statements, authentic product screenshots, founder photographs and final brand assets still need confirmation or supply.
- Admin email addresses, contact sender/recipient configuration, social URLs, real address/organisation details and ABN remain production inputs. Keep credentials private.
- There is no committed application, package manifest or configured remote yet. Version compatibility and actual commands must be verified during Phase 1.
- The `.codex/agents/` files named in the brief were absent at the repository audit. The parent owns any supported configuration repair and the plan's integration/review gates.
- This document does not authorise publishing draft services or events, adding testimonials, changing the stack, reducing scope, or deploying to a live host.

## The assignment

Before finalising public product copy, show one working CulinAIre Kitchen workflow to one chef or owner without guiding their interpretation. Ask what it does for their kitchen and write down their wording and any confusion. Bring back one verified example and one authentic screenshot suitable for publication. This supplies concrete material for the product page without inventing a promise.

## What the decisions reveal

- "The product is the first offer, not the whole company" is the organising constraint. Preserve a company identity that can support teaching, advisory and publishing.
- Choosing "Chefs and owners understanding you and exploring CulinAIre Kitchen" supplies a clear hierarchy among the many audiences in the original brief.
- "Real quotes only. Seed with none" sets an explicit evidence standard. Apply the same standard to product claims and founder imagery.

## Handoff

Next, complete the office-hours document review, then resume the already requested CEO review against this design and `docs/PLAN.md`. Do not ask for the approved infrastructure defaults or home page priority again. Phase 1 starts only after the active review workflow concludes; `AGENTS.md` remains the first implementation file to update.

## Proposed wireframe

The [rough HTML sketch](wireframe/sketch.html) shows the home-to-product journey and initial empty-content state. The [rendered sketch](wireframe/sketch.png) is a structure proposal, not approved final artwork. It uses system fonts and placeholders deliberately; the supplied design tokens govern the production site. Grouping services, training and journal in the sketch is visual shorthand for three separate required CMS blocks, not a combined replacement block.

<!-- gstack:office-hours:concerns:start -->
## Reviewer Concerns

Disposition: COMPLETED

Stop: PASS

No unresolved findings.
<!-- gstack:office-hours:concerns:end -->
