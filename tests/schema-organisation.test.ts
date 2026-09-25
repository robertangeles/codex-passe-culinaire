import { describe, expect, it } from 'vitest'
import type { SiteSetting, User } from '../src/payload-types'
import { buildOrganisationGraph, buildPersonSchema, type PublicPerson } from '../src/lib/seo/organisation'
import { serializeJsonLd } from '../src/lib/seo/core'

const origin = 'https://passeculinaire.example'
const person: PublicPerson = {
  id: 1,
  name: 'Alex Charasse',
  slug: 'alex-charasse',
  publicTitle: 'Maître Pâtissier',
  publicBio: {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [{
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, text: 'A chef and chocolatier.' }],
      }],
    },
  },
  portrait: { id: 2, alt: 'Portrait', filename: 'portrait.webp', createdAt: '', updatedAt: '' },
  createdAt: '2026-01-02T03:04:05.000Z',
  updatedAt: '2026-02-03T04:05:06.000Z',
}

describe('organisation and person JSON-LD', () => {
  it('builds stable organisation, website, search and brand relationships from confirmed facts', () => {
    const founder = Object.assign({}, person, { email: 'private@example.com', role: 'admin' as const, collection: 'users' as const, password: 'secret', resetPasswordToken: 'secret-token' }) as User
    const settings: SiteSetting = {
      id: 1,
      name: 'Passe Culinaire',
      description: 'A company for chefs and kitchen teams.',
      organisation: {
        legalName: 'Passe Culinaire Pty Ltd',
        city: 'Melbourne',
        region: 'Victoria',
        country: 'Australia',
        knowsAbout: [{ topic: 'Kitchen work' }, { topic: '[TO CONFIRM] future topic' }],
        founders: [founder],
      },
      socialLinks: [
        { url: 'https://example.com/passe-culinaire' },
        { url: 'https://user:secret@example.com/private' },
        { url: 'http://example.com/insecure' },
        { url: '/about' },
      ],
    }

    const graph = buildOrganisationGraph(settings, origin)
    const organisation = graph.find((node) => node['@id'] === `${origin}/#organisation`)
    const website = graph.find((node) => node['@id'] === `${origin}/#website`)
    const brand = graph.find((node) => node['@id'] === `${origin}/culinaire-kitchen#brand`)

    expect(organisation).toMatchObject({
      '@type': ['Organization', 'ProfessionalService'],
      name: 'Passe Culinaire',
      url: origin,
      legalName: 'Passe Culinaire Pty Ltd',
      address: { '@type': 'PostalAddress', addressLocality: 'Melbourne', addressRegion: 'Victoria', addressCountry: 'Australia' },
      sameAs: ['https://example.com/passe-culinaire'],
      knowsAbout: ['Kitchen work'],
      founder: [{ '@id': `${origin}/journal/author/alex-charasse#person` }],
      brand: { '@id': `${origin}/culinaire-kitchen#brand` },
    })
    expect(website).toMatchObject({
      '@type': 'WebSite',
      publisher: { '@id': `${origin}/#organisation` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    })
    expect(JSON.stringify(graph)).not.toMatch(/email|private@example|password|secret-token|role/i)
    expect(graph).toContainEqual(expect.objectContaining({ '@type': 'Person', '@id': `${origin}/journal/author/alex-charasse#person` }))
    expect(brand).toMatchObject({
      '@type': 'Brand',
      name: 'CulinAIre Kitchen',
    })
    expect(brand).not.toHaveProperty('parentOrganization')
  })

  it('projects only public person fields and omits unsafe slugs, placeholder media and unconfirmed text', () => {
    const personWithPrivateFields = Object.assign({}, person, {
      email: 'private@example.com',
      role: 'admin',
      password: 'secret',
      resetPasswordToken: 'secret-token',
    })
    const schema = buildPersonSchema(personWithPrivateFields, origin)
    expect(schema).toMatchObject({
      '@type': 'Person',
      '@id': `${origin}/journal/author/alex-charasse#person`,
      name: 'Alex Charasse',
      url: `${origin}/journal/author/alex-charasse`,
      jobTitle: 'Maître Pâtissier',
      description: 'A chef and chocolatier.',
      image: `${origin}/media/portrait.webp`,
    })
    expect(schema).not.toHaveProperty('dateCreated')
    expect(schema).not.toHaveProperty('dateModified')
    expect(JSON.stringify(schema)).not.toMatch(/email|private@example|password|secret-token|role/i)
    expect(buildPersonSchema({ ...person, slug: '../private' }, origin)).toBeNull()
    expect(buildPersonSchema({ ...person, slug: 'a'.repeat(201) }, origin)).toBeNull()
    expect(buildPersonSchema({ ...person, publicTitle: '[TO CONFIRM]', publicBio: null, portrait: { id: 2, alt: 'Portrait', filename: 'portrait.webp', createdAt: '', updatedAt: '', placeholder: true } }, origin))
      .toEqual({
        '@type': 'Person',
        '@id': `${origin}/journal/author/alex-charasse#person`,
        name: 'Alex Charasse',
        url: `${origin}/journal/author/alex-charasse`,
      })
  })

  it('escapes script termination and Unicode separators in serialized graph data', () => {
    const json = serializeJsonLd([{ '@type': 'Organization', description: '</script>&\u2028\u2029' }])
    expect(json).not.toContain('</script>')
    expect(json).toContain('\\u003c/script\\u003e\\u0026\\u2028\\u2029')
  })

  it('omits unconfirmed organization facts rather than publishing placeholders', () => {
    const settings: SiteSetting = {
      id: 2,
      name: '[TO CONFIRM]',
      description: '[TO CONFIRM] company description',
      organisation: {
        legalName: '[TO CONFIRM]',
        city: '[TO CONFIRM]',
        region: null,
        country: null,
        knowsAbout: [{ topic: '[TO CONFIRM]' }],
      },
    }
    const [organisation, website] = buildOrganisationGraph(settings, origin)
    expect(organisation).toEqual({
      '@type': ['Organization', 'ProfessionalService'],
      '@id': `${origin}/#organisation`,
      url: origin,
      brand: { '@id': `${origin}/culinaire-kitchen#brand` },
    })
    expect(website).not.toHaveProperty('name')
    expect(website).not.toHaveProperty('description')
  })
})
