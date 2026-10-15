import type { Metadata } from 'next'
import Link from 'next/link'

import { LegalPage } from '../../../../components/LegalPage'
import { buildPageMetadata } from '../../../../lib/seo/metadata'
import { siteOrigin } from '../../../../lib/seo/core'

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/about/privacy-policy',
    title: 'Privacy policy',
    description: 'How Passe Culinaire handles information sent through its website.',
  }, siteOrigin())
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy policy" introduction="When you write to us, you should know where your message goes and how we use it.">
      <section>
        <h2>Who this policy covers</h2>
        <p>PASSE CULINAIRE PTY LTD (ABN 23 700 551 800) operates this website. This policy covers information collected through passeculinaire.com and direct correspondence with Passe Culinaire about the website or our work. CulinAIre Kitchen and any separate service may have their own privacy terms.</p>
      </section>
      <section>
        <h2>What we collect</h2>
        <p>Our contact form asks for your name, email address, role, topic and message. You may also provide a venue name. If you contact us another way, we receive the details you choose to provide. Please leave sensitive personal information out of a general enquiry unless it is necessary.</p>
        <p>Our hosting service may receive technical information when you visit, such as your IP address, browser details, pages requested and request time. To limit repeated form submissions, our server uses your IP address to create a keyed hash. The enquiry record contains the hash, not the raw IP address. Hosting and security logs may still contain technical information.</p>
      </section>
      <section>
        <h2>How we use it</h2>
        <p>We use enquiry details to read and answer your message, route it to the right person, keep a record of the conversation, and protect the contact form from misuse. We may also use or disclose information when required by law. If you do not provide a reply address, we cannot answer your enquiry.</p>
        <p>Sending us an enquiry does not sign you up for a newsletter. We do not use contact form submissions to make decisions with legal or similarly significant effects by automated means.</p>
      </section>
      <section>
        <h2>Where the information goes</h2>
        <p>Enquiries are saved in our website database, hosted by Render in Singapore. A copy is sent to our team inbox through Resend, which stores email content and delivery records in the United States. Our authorised team members and the providers needed to host, secure and deliver the website or email may handle the information. We may also share it with professional advisers or authorities where reasonably necessary or legally required.</p>
        <p>Your information may therefore be handled outside Australia, particularly in Singapore and the United States. We take reasonable steps to protect it when using service providers.</p>
      </section>
      <section>
        <h2>Cookies, security and retention</h2>
        <p>Browsing the public website does not require a Passe Culinaire account. Staff access to the publishing system uses sign-in cookies. Our hosting and security services may keep technical logs needed to operate and protect the site.</p>
        <p>We restrict access to enquiries to authorised staff, use encrypted connections and keep records only for as long as needed to deal with the enquiry, maintain appropriate business records or meet legal obligations. We may then delete or de-identify them. No online system can be guaranteed completely secure.</p>
      </section>
      <section>
        <h2>Access, correction and complaints</h2>
        <p>You can ask what personal information we hold about you, request a correction, or raise a privacy concern through our <Link href="/contact">contact form</Link> (choose “Other” as the topic), or by post to PASSE CULINAIRE PTY LTD, Unit 27, 29 Little Collins St, Melbourne VIC 3000, Australia. We may need to verify your identity before sharing or changing information. We will consider your request and explain our response.</p>
        <p>If you are unhappy with how we handle a privacy complaint, you may be able to complain to the <a href="https://www.oaic.gov.au/privacy/privacy-complaints" rel="noreferrer">Office of the Australian Information Commissioner</a>. Please contact us first so we have a chance to address it.</p>
      </section>
      <section>
        <h2>Changes to this policy</h2>
        <p>We will update this page if our website or information handling changes. The effective date above shows when this version took effect.</p>
      </section>
    </LegalPage>
  )
}
