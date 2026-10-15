# Website policy research and scope

Reviewed 15 October 2026 for the public Passe Culinaire website. The published pages are original, site-specific text informed by the sources below. They do not copy either template verbatim.

## Verified operating facts

- The operator is PASSE CULINAIRE PTY LTD, ABN 23 700 551 800. [ABN Lookup](https://abr.business.gov.au/ABN/View?abn=23700551800) lists the company as active. The postal address comes from the existing public footer and remains an operator-supplied fact.
- The public contact form collects name, email, optional venue, role, topic and message. It persists the enquiry in Payload/PostgreSQL. A keyed hash of the connecting IP is stored for rate limiting; the raw IP is not stored in the enquiry record. The notification is sent through Resend to the configured team inbox. See `src/components/ContactForm.tsx`, `src/lib/contact.ts` and `src/payload/collections/forms.ts`.
- The production database and web service are in Render Singapore. See `docs/DEPLOY.md`. [Resend says](https://resend.com/security/gdpr) it stores message content and delivery records in the United States, regardless of sending region.
- No public account registration, checkout, newsletter signup or analytics integration is enabled by the site code. The Payload administration area does use sign-in cookies. The policy avoids promising that infrastructure creates no technical logs or cookies.

## Legal guidance applied

- [PwC's privacy policy template](https://www.pwc.com.au/about-us/social-impact/Privacy-Policy-Template.docx.pdf) says to replace example fields and tailor the document to real collection, handling and use. It is guidance, not legal advice.
- [OAIC APP 1 guidance](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-1-app-1-open-and-transparent-management-of-personal-information) calls for collection categories, purposes, access/correction, complaints and likely overseas recipients/countries. The page covers each. The contact form also links the policy at collection, consistent with [OAIC APP 5 guidance](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-5-app-5-notification-of-the-collection-of-personal-information).
- [OAIC small-business guidance](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/organisations/small-business) describes Privacy Act coverage exceptions. We have not established whether Passe Culinaire is an APP entity, so the page makes no exemption or compliance-certification claim.
- [Sprintlaw's terms guide](https://sprintlaw.com.au/articles/terms-and-conditions-sample-pdf-for-australian-businesses/) warns that generic terms may not fit the business and that online display alone may not incorporate sale terms into a contract. The site has no online sale, so the published terms are limited to website use. A separate agreement is needed before selling or providing CulinAIre Kitchen, training or advisory services.
- [ACCC guidance](https://www.accc.gov.au/consumers/buying-products-and-services/contracts) confirms contract terms cannot remove statutory consumer rights. The website terms preserve those rights and avoid broad exclusion, indemnity and unilateral retroactive-change clauses.

## Follow-through

Before introducing a newsletter, analytics, advertising pixels, online payment, booking, customer account or new service provider, update the actual collection practice, form notice and policy together. Establish a routine for reviewing and deleting old enquiries; the current application does not automate retention. Obtain Australian legal review of customer-facing product or service terms before paid offerings use them. These published website terms are not a substitute for those agreements.
