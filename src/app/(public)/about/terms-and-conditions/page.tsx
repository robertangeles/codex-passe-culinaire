import type { Metadata } from 'next'
import Link from 'next/link'

import { LegalPage } from '../../../../components/LegalPage'
import { buildPageMetadata } from '../../../../lib/seo/metadata'
import { siteOrigin } from '../../../../lib/seo/core'

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    path: '/about/terms-and-conditions',
    title: 'Terms and conditions',
    description: 'Terms for using the Passe Culinaire website.',
  }, siteOrigin())
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms and conditions" introduction="These terms explain how you may use the Passe Culinaire website and what to expect from its content." imageSrc="/images/journal/kitchen-notebook.webp" imageAlt="A kitchen notebook beside a prepared dish.">
      <section>
        <h2>About these terms</h2>
        <p>This website is operated by PASSE CULINAIRE PTY LTD (ABN 23 700 551 800). These terms apply to your use of passeculinaire.com. They do not set the terms for buying CulinAIre Kitchen, training, advisory work or any other paid service. Those arrangements need separate terms agreed with you.</p>
      </section>
      <section>
        <h2>Using the website</h2>
        <p>You may browse the site and share links to its pages. Please use it lawfully and do not interfere with its operation, security or other visitors. Contact form messages should be genuine enquiries. Please do not submit unlawful content or someone else’s personal information without a proper reason.</p>
      </section>
      <section>
        <h2>Enquiries and information</h2>
        <p>Information on this site describes Passe Culinaire and its work. We take care with it, but details may change. A page or contact-form reply does not by itself create an agreement to provide a service, reserve a place or confirm a price. If you need to rely on a particular detail, please <Link href="/contact">ask us to confirm it</Link>.</p>
        <p>Kitchen, food and business decisions depend on your circumstances and applicable requirements. Website content is general information; you remain responsible for checking it before using it in your venue.</p>
      </section>
      <section>
        <h2>Content and links</h2>
        <p>Text, images, design and other material on this site belong to Passe Culinaire or their respective owners. You may view them for personal or internal business purposes. Please ask before reproducing or publishing substantial parts elsewhere. You retain ownership of material you send us; we use an enquiry only as described in our <Link href="/about/privacy-policy">privacy policy</Link>.</p>
        <p>Links to other websites are provided for convenience. Their content and terms are controlled by their operators.</p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>Nothing in these terms excludes, restricts or modifies a right or remedy that cannot lawfully be excluded, including rights under the Australian Consumer Law. We do not promise uninterrupted access to this website, and will correct problems when we become aware of them.</p>
      </section>
      <section>
        <h2>Changes and contact</h2>
        <p>We may update these website terms by publishing a new version here. Changes apply from the date shown on the new version, not retrospectively. Australian law and the law of Victoria govern these terms, subject to any mandatory protections that apply to you.</p>
        <p>For a question about these terms, use our <Link href="/contact">contact form</Link> or write to PASSE CULINAIRE PTY LTD, Unit 27, 29 Little Collins St, Melbourne VIC 3000, Australia.</p>
      </section>
    </LegalPage>
  )
}
