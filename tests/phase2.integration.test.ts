import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createLocalReq, type Payload } from 'payload'
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { REST_GET } from '@payloadcms/next/routes'
import { submitContact } from '../src/lib/contact'

vi.mock('next/cache', () => ({ unstable_cache: <A extends unknown[], R>(callback: (...args: A) => R) => callback }))

process.loadEnvFile('.env')
const testUri = process.env.TEST_DATABASE_URI
if (!testUri || testUri === process.env.DATABASE_URI) throw new Error('A separate TEST_DATABASE_URI is required.')
process.env.MEDIA_DIR = path.resolve('.local/test-media')
process.env.MEDIA_STORAGE = 'local'
process.env.MAIL_PROVIDER = 'smtp'
process.env.RUN_JOBS = 'false'
process.env.CONTACT_TO_ADDRESS = ''
process.env.SMTP_HOST = ''
process.env.RESEND_API_KEY = ''
let payload: Payload

describe('Phase 2 PostgreSQL integration', () => {
  beforeAll(async () => {
    process.env.DATABASE_URI = testUri
    const { default: config } = await import('../src/payload.config')
    payload = await (await import('payload')).getPayload({ config })
  }, 30000)
  afterAll(async () => { if (payload) await payload.destroy() })


  it('has exact seed counts and keeps editorial changes on a repeated seed', async () => {
    for (const [collection, count] of [['users', 2], ['media', 12], ['pages', 4], ['services', 3], ['events', 2], ['posts', 3], ['testimonials', 0]] as const)
      expect((await payload.count({ collection, overrideAccess: true })).totalDocs).toBe(count)
    const home = (await payload.find({ collection: 'pages', overrideAccess: true, where: { slug: { equals: 'home' } } })).docs[0]
    await payload.update({ collection: 'pages', id: home.id, overrideAccess: true, data: { title: 'Editorial home title' } })
    await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data: { tagline: 'Editorial tagline' } })
    await payload.updateGlobal({ slug: 'header', overrideAccess: true, data: { navItems: [] } })
    await payload.updateGlobal({ slug: 'footer', overrideAccess: true, data: { columns: [] } })
    execFileSync('pnpm', ['seed'], { env: { ...process.env, DATABASE_URI: testUri, MEDIA_DIR: process.env.MEDIA_DIR }, stdio: 'pipe' })
    expect((await payload.count({ collection: 'media', overrideAccess: true })).totalDocs).toBe(12)
    expect((await payload.count({ collection: 'pages', overrideAccess: true })).totalDocs).toBe(4)
    expect((await payload.findByID({ collection: 'pages', id: home.id, overrideAccess: true })).title).toBe('Editorial home title')
    expect((await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })).tagline).toBe('Editorial tagline')
    expect((await payload.findGlobal({ slug: 'header', overrideAccess: true })).navItems).toEqual([])
    expect((await payload.findGlobal({ slug: 'footer', overrideAccess: true })).columns).toEqual([])
  }, 30000)


  it('authenticates both seeded admins through real JWT session lookup', async () => {
    for (const [emailKey, passwordKey] of [['ROB_ADMIN_EMAIL', 'ROB_ADMIN_PASSWORD'], ['ALEX_ADMIN_EMAIL', 'ALEX_ADMIN_PASSWORD']] as const) {
      const email = process.env[emailKey]
      const password = process.env[passwordKey]
      if (!email || !password) throw new Error(`Missing ${emailKey} or ${passwordKey} for seeded admin test.`)
      const login = await payload.login({ collection: 'users', data: { email, password } })
      expect(login.token).toBeTruthy()
      const authenticated = await payload.auth({ headers: new Headers({ Authorization: `Bearer ${login.token}` }) })
      expect(authenticated.user?.role).toBe('admin')
      expect(authenticated.user?.id).toBe(login.user?.id)
      if (!authenticated.user) throw new Error('Seeded admin did not authenticate.')
      const req = await createLocalReq({ user: authenticated.user }, payload)
      await expect(payload.find({ collection: 'form-submissions', req, overrideAccess: false, limit: 1 })).resolves.toBeTruthy()
    }
  })

  it('keeps a reference that exists only in a saved version', async () => {
    const buffer = await sharp({ create: { width: 24, height: 24, channels: 3, background: '#F4F1EA' } }).png().toBuffer()
    const media = await payload.create({ collection: 'media', overrideAccess: true,
      data: { alt: 'Unreferenced version-only test image.' },
      file: { data: buffer, mimetype: 'image/png', name: `version-only-${randomUUID()}.png`, size: buffer.length } })
    const page = await payload.create({ collection: 'pages', overrideAccess: true, draft: true,
      data: { title: 'Version only image', slug: `version-only-${randomUUID()}`, layout: [{ blockType: 'hero', heading: 'Version only image', style: 'quiet' }], _status: 'draft' } })
    await payload.update({ collection: 'pages', id: page.id, overrideAccess: true, draft: true,
      data: { layout: [{ blockType: 'hero', heading: 'Version only image', style: 'image', image: media.id }] } })
    await payload.update({ collection: 'pages', id: page.id, overrideAccess: true, draft: true,
      data: { layout: [{ blockType: 'hero', heading: 'Version only image', style: 'quiet' }] } })
    const current = await payload.findByID({ collection: 'pages', id: page.id, overrideAccess: true, depth: 0 })
    expect(JSON.stringify(current.layout)).not.toContain(`"image":${media.id}`)
    await expect(payload.delete({ collection: 'media', id: media.id, overrideAccess: true })).rejects.toMatchObject({ status: 409 })
  })

  it('does not queue a publication job when its transaction rolls back', async () => {
    const draft = await payload.create({ collection: 'pages', overrideAccess: true, draft: true,
      data: { title: 'Rollback page', slug: `rollback-${randomUUID()}`, layout: [{ blockType: 'hero', heading: 'Rollback page', style: 'quiet' }], _status: 'draft', seo: { metaDescription: 'A page for rollback verification.' } } })
    const before = (await payload.count({ collection: 'payload-jobs', overrideAccess: true })).totalDocs
    const req = await createLocalReq({}, payload)
    const tx = await payload.db.beginTransaction()
    if (tx === null) throw new Error('Transactions are required.')
    req.transactionID = tx
    try {
      await payload.update({ collection: 'pages', id: draft.id, req, overrideAccess: true, data: { _status: 'published' } })
      await payload.db.rollbackTransaction(tx)
      req.transactionID = undefined
      expect((await payload.count({ collection: 'payload-jobs', overrideAccess: true })).totalDocs).toBe(before)
      expect((await payload.findByID({ collection: 'pages', id: draft.id, overrideAccess: true }))._status).toBe('draft')
    } finally {
      if (req.transactionID) await payload.db.rollbackTransaction(req.transactionID)
    }
  })

  it('denies editor role escalation and allows incomplete drafts but rejects invalid publication', async () => {
    const editorEmail = `test-editor-${randomUUID()}@example.test`
    const editor = await payload.create({ collection: 'users', overrideAccess: true, context: { seedProvisioning: process.env.PAYLOAD_SECRET },
      data: { name: 'Test Editor', slug: `test-editor-${randomUUID()}`, email: editorEmail, password: 'test-only-long-password', role: 'editor' } })
    const editorReq = await createLocalReq({ user: { ...editor, role: 'editor' } }, payload)
    await payload.update({ collection: 'users', id: editor.id, req: editorReq, overrideAccess: false, data: { role: 'admin', name: 'Edited name' } })
    const updated = await payload.findByID({ collection: 'users', id: editor.id, req: editorReq, overrideAccess: false })
    expect(updated.role).toBe('editor')
    expect(updated.name).toBe('Edited name')
    const login = await payload.login({ collection: 'users', data: { email: editorEmail, password: 'test-only-long-password' } })
    const authenticated = await payload.auth({ headers: new Headers({ Authorization: `Bearer ${login.token}` }) })
    expect(authenticated.user?.role).toBe('editor')
    if (!authenticated.user) throw new Error('Editor did not authenticate.')
    const authenticatedReq = await createLocalReq({ user: authenticated.user }, payload)
    const page = await payload.create({ collection: 'pages', req: authenticatedReq, overrideAccess: false, draft: true,
      data: { title: 'Editor page', slug: `editor-${randomUUID()}`, layout: [{ blockType: 'hero', heading: 'Editor page', style: 'quiet' }],
        seo: { metaDescription: 'An editor publication permission test.' }, _status: 'draft' } })
    const published = await payload.update({ collection: 'pages', id: page.id, req: authenticatedReq, overrideAccess: false,
      data: { _status: 'published' } })
    expect(published._status).toBe('published')
    const draft = await payload.create({ collection: 'posts', overrideAccess: true, draft: true,
      data: { title: 'Incomplete draft', slug: `incomplete-${randomUUID()}`, _status: 'draft' } })
    await expect(payload.update({ collection: 'posts', id: draft.id, overrideAccess: true,
      data: { _status: 'published' } })).rejects.toThrow()
    expect((await payload.findByID({ collection: 'posts', id: draft.id, overrideAccess: true }))._status).toBe('draft')
  })


  it.each([
    { label: 'long title', change: { title: 'T'.repeat(61) } },
    { label: 'long description', change: { seo: { metaDescription: 'D'.repeat(161) } } },
    { label: 'linked entity override', change: { seo: { metaDescription: 'Valid description.', structuredDataOverride: { '@id': 'https://invalid.example/id' } } } },
  ])('rejects $label on publication while keeping the draft', async ({ change }) => {
    const draft = await payload.create({ collection: 'pages', overrideAccess: true, draft: true,
      data: { title: 'Publication validation', slug: `invalid-${randomUUID()}`, layout: [{ blockType: 'hero', heading: 'Publication validation', style: 'quiet' }], _status: 'draft', seo: { metaDescription: 'Valid description.' } } })
    await expect(payload.update({ collection: 'pages', id: draft.id, overrideAccess: true, data: { ...change, _status: 'published' } })).rejects.toThrow()
    expect((await payload.findByID({ collection: 'pages', id: draft.id, overrideAccess: true }))._status).toBe('draft')
  })

  it('rejects reserved and overlong addresses', async () => {
    await expect(payload.create({ collection: 'pages', overrideAccess: true, draft: true,
      data: { title: 'Overlong address', slug: 'a'.repeat(201), _status: 'draft' } })).rejects.toThrow()
    await expect(payload.create({ collection: 'posts', overrideAccess: true, draft: true,
      data: { title: 'Reserved address', slug: 'admin', _status: 'draft' } })).rejects.toThrow()
  })

  it('returns one saved receipt and one send for concurrent duplicate contact requests', async () => {
    const oldRecipient = process.env.CONTACT_TO_ADDRESS
    const oldHost = process.env.SMTP_HOST
    process.env.CONTACT_TO_ADDRESS = 'inbox@example.test'
    process.env.SMTP_HOST = 'mock.example.test'
    const send = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    const input = { requestId: randomUUID(), name: 'Concurrent Test', email: 'cook@example.test', role: 'chef' as const, need: 'training' as const, message: 'A private test enquiry.' }
    try {
      const [one, two] = await Promise.all([submitContact(payload, input, '203.0.113.101'), submitContact(payload, input, '203.0.113.101')])
      expect(one.id).toBe(two.id)
      expect((await payload.count({ collection: 'form-submissions', overrideAccess: true, where: { requestId: { equals: input.requestId } } })).totalDocs).toBe(1)
      expect(send).toHaveBeenCalledTimes(1)
      expect(one.deliveryStatus).toBe('emailed')
      expect((await payload.findByID({ collection: 'form-submissions', id: one.id, overrideAccess: true })).deliveryStatus).toBe('emailed')
    } finally {
      send.mockRestore()
      process.env.CONTACT_TO_ADDRESS = oldRecipient
      process.env.SMTP_HOST = oldHost
    }
  })

  it('preserves a saved receipt when provider delivery or status writes fail', async () => {
    const oldRecipient = process.env.CONTACT_TO_ADDRESS
    const oldHost = process.env.SMTP_HOST
    process.env.CONTACT_TO_ADDRESS = 'inbox@example.test'
    process.env.SMTP_HOST = 'mock.example.test'
    const send = vi.spyOn(payload, 'sendEmail').mockRejectedValue(new Error('test provider failure'))
    const input = { requestId: randomUUID(), name: 'Delivery Test', email: 'cook@example.test', role: 'chef' as const, need: 'training' as const, message: 'Another private test enquiry.' }
    try {
      const receipt = await submitContact(payload, input, '203.0.113.102')
      expect(receipt.deliveryStatus).toBe('failed')
      expect((await payload.findByID({ collection: 'form-submissions', id: receipt.id, overrideAccess: true })).deliveryStatus).toBe('failed')
      send.mockResolvedValue(undefined)
      const update = vi.spyOn(payload, 'update').mockRejectedValue(new Error('test status write failure'))
      try {
        const saved = await submitContact(payload, { ...input, requestId: randomUUID() }, '203.0.113.103')
        expect(saved.deliveryStatus).toBe('saved')
        expect(send).toHaveBeenCalledTimes(1)
      } finally { update.mockRestore() }
    } finally {
      send.mockRestore()
      process.env.CONTACT_TO_ADDRESS = oldRecipient
      process.env.SMTP_HOST = oldHost
    }
  })



  it.each(['sent', 'provider failed'] as const)('reports a saved receipt if final delivery status cannot be persisted after %s', async (outcome) => {
    const oldRecipient = process.env.CONTACT_TO_ADDRESS
    const oldHost = process.env.SMTP_HOST
    process.env.CONTACT_TO_ADDRESS = 'inbox@example.test'
    process.env.SMTP_HOST = 'mock.example.test'
    const send = vi.spyOn(payload, 'sendEmail')
    if (outcome === 'sent') send.mockResolvedValue(undefined)
    else send.mockRejectedValue(new Error('test provider failure'))
    const originalUpdate = payload.update.bind(payload)
    let writes = 0
    const update = vi.spyOn(payload, 'update').mockImplementation((args) => {
      writes += 1
      if (writes === 2) return Promise.reject(new Error('test final status write failure'))
      return originalUpdate(args)
    })
    const input = { requestId: randomUUID(), name: 'Final Status Test', email: 'cook@example.test', role: 'chef' as const, need: 'advisory' as const, message: 'A private test enquiry.' }
    try {
      const receipt = await submitContact(payload, input, '203.0.113.104')
      expect(receipt.deliveryStatus).toBe('saved')
      expect(send).toHaveBeenCalledTimes(1)
      expect(writes).toBe(2)
      const stored = await payload.findByID({ collection: 'form-submissions', id: receipt.id, overrideAccess: true })
      expect(stored.deliveryStatus).toBe('saved')
      expect(stored.deliveryAttemptedAt).toBeTruthy()
    } finally {
      update.mockRestore()
      send.mockRestore()
      process.env.CONTACT_TO_ADDRESS = oldRecipient
      process.env.SMTP_HOST = oldHost
    }
  })

  it('exposes only published records and safe founder fields through anonymous REST', async () => {
    const { default: config } = await import('../src/payload.config')
    const get = REST_GET(config)
    const users = await get(new Request('http://localhost/api/users?limit=10'), { params: Promise.resolve({ slug: ['users'] }) })
    expect(users.status).toBe(200)
    const userBody = await users.json() as { docs: Record<string, unknown>[] }
    expect(userBody.docs).toHaveLength(2)
    for (const user of userBody.docs) {
      for (const key of ['email', 'role', 'sessions', 'hash', 'salt', 'password', 'loginAttempts', 'lockUntil'])
        expect(user).not.toHaveProperty(key)
    }
    const posts = await get(new Request('http://localhost/api/posts?limit=10'), { params: Promise.resolve({ slug: ['posts'] }) })
    expect(posts.status).toBe(200)
    expect((await posts.json() as { docs: unknown[] }).docs).toHaveLength(0)
  })

  it('accepts internal redirects and rejects unsafe paths on create and update', async () => {
    const safeFrom = `/journal-${randomUUID()}`
    const redirect = await payload.create({ collection: 'redirects', overrideAccess: true,
      data: { from: safeFrom, to: '/journal?category=pastry#latest', statusCode: '301' } })
    expect(redirect.from).toBe(safeFrom)
    expect(redirect.to).toBe('/journal?category=pastry#latest')
    await expect(payload.update({ collection: 'redirects', id: redirect.id, overrideAccess: true,
      data: { to: '/training#upcoming' } })).resolves.toMatchObject({ to: '/training#upcoming' })

    const unsafePaths = [
      'https://external.example/path', '//external.example/path', '/%2f%2fexternal.example',
      '/%252f%252fexternal.example', '/\\external.example', '/%5cexternal.example',
      '/journal/../contact', '/journal/%2e%2e/contact', '/%68ttps:%2f%2fexternal.example',
      '/journal\ncontact', '/journal%00contact', '/journal%20contact', '/journal%zzcontact',
    ]
    for (const unsafe of unsafePaths) {
      await expect(payload.create({ collection: 'redirects', overrideAccess: true,
        data: { from: unsafe, to: '/journal', statusCode: '301' } })).rejects.toThrow()
      await expect(payload.create({ collection: 'redirects', overrideAccess: true,
        data: { from: `/invalid-to-${randomUUID()}`, to: unsafe, statusCode: '301' } })).rejects.toThrow()
      await expect(payload.update({ collection: 'redirects', id: redirect.id, overrideAccess: true,
        data: { from: unsafe } })).rejects.toThrow()
      await expect(payload.update({ collection: 'redirects', id: redirect.id, overrideAccess: true,
        data: { to: unsafe } })).rejects.toThrow()
    }
    for (const sourceOnlyInvalid of ['/journal?tag=pastry', '/journal#top']) {
      await expect(payload.create({ collection: 'redirects', overrideAccess: true,
        data: { from: sourceOnlyInvalid, to: '/journal', statusCode: '301' } })).rejects.toThrow()
      await expect(payload.update({ collection: 'redirects', id: redirect.id, overrideAccess: true,
        data: { from: sourceOnlyInvalid } })).rejects.toThrow()
    }
    expect((await payload.findByID({ collection: 'redirects', id: redirect.id, overrideAccess: true })).to).toBe('/training#upcoming')
  }, 30000)

  it('normalises EXIF orientation and preserves transparency in the original and all renditions', async () => {
    const pixels = Buffer.alloc(40 * 20 * 3)
    for (let y = 0; y < 20; y += 1) for (let x = 0; x < 40; x += 1) {
      const offset = (y * 40 + x) * 3
      pixels[offset] = x < 20 ? 255 : 0
      pixels[offset + 2] = x < 20 ? 0 : 255
    }
    const jpeg = await sharp(pixels, { raw: { width: 40, height: 20, channels: 3 } })
      .jpeg().withMetadata({ orientation: 6 }).toBuffer()
    expect((await sharp(jpeg).metadata()).orientation).toBe(6)
    const oriented = await payload.create({ collection: 'media', overrideAccess: true,
      data: { alt: 'Red and blue EXIF orientation fixture.' },
      file: { data: jpeg, mimetype: 'image/jpeg', name: `oriented-${randomUUID()}.jpg`, size: jpeg.length } })

    const rgba = Buffer.alloc(40 * 20 * 4)
    for (let y = 4; y < 16; y += 1) for (let x = 8; x < 32; x += 1) {
      const offset = (y * 40 + x) * 4
      rgba[offset] = 255
      rgba[offset + 1] = 30
      rgba[offset + 3] = 255
    }
    const png = await sharp(rgba, { raw: { width: 40, height: 20, channels: 4 } }).png().toBuffer()
    const transparent = await payload.create({ collection: 'media', overrideAccess: true,
      data: { alt: 'Transparent test image.', focalX: 25, focalY: 75 },
      file: { data: png, mimetype: 'image/png', name: `transparent-${randomUUID()}.png`, size: png.length } })
    const saved = await payload.findByID({ collection: 'media', id: transparent.id, overrideAccess: true })
    expect(saved.focalX).toBe(25)
    expect(saved.focalY).toBe(75)

    for (const width of [undefined, 480, 960, 1440, 2400] as const) {
      for (const format of width === undefined ? ['webp'] as const : ['avif', 'webp'] as const) {
        const orientedName = width === undefined ? oriented.filename : oriented.sizes?.[`${format}${width}`]?.filename
        const transparentName = width === undefined ? transparent.filename : transparent.sizes?.[`${format}${width}`]?.filename
        expect(orientedName).toBeTruthy()
        expect(transparentName).toBeTruthy()
        const orientedBytes = await readFile(path.join(process.env.MEDIA_DIR!, orientedName!))
        const transparentBytes = await readFile(path.join(process.env.MEDIA_DIR!, transparentName!))
        const orientedMeta = await sharp(orientedBytes).metadata()
        const transparentMeta = await sharp(transparentBytes).metadata()
        expect(orientedMeta).toMatchObject({ width: width ?? 20, height: width === undefined ? 40 : width * 2 })
        expect(transparentMeta).toMatchObject({ width: width ?? 40, height: width === undefined ? 20 : width / 2 })
        expect(orientedMeta.orientation ?? 1).toBe(1)
        expect(transparentMeta.hasAlpha).toBe(true)
        const top = await sharp(orientedBytes).extract({ left: Math.floor(orientedMeta.width! / 2), top: Math.floor(orientedMeta.height! / 4), width: 1, height: 1 }).raw().toBuffer()
        const bottom = await sharp(orientedBytes).extract({ left: Math.floor(orientedMeta.width! / 2), top: Math.floor(orientedMeta.height! * 3 / 4), width: 1, height: 1 }).raw().toBuffer()
        expect(top[0]).toBeGreaterThan(top[2])
        expect(bottom[2]).toBeGreaterThan(bottom[0])
        const corner = await sharp(transparentBytes).extract({ left: 0, top: 0, width: 1, height: 1 }).ensureAlpha().raw().toBuffer()
        const centre = await sharp(transparentBytes).extract({ left: Math.floor(transparentMeta.width! / 2), top: Math.floor(transparentMeta.height! / 2), width: 1, height: 1 }).ensureAlpha().raw().toBuffer()
        expect(corner[3]).toBe(0)
        expect(centre[3]).toBeGreaterThan(240)
      }
    }
  }, 120000)

  it('writes eight usable AVIF/WebP renditions and serves a stored Unicode filename safely', async () => {
    const media = (await payload.find({ collection: 'media', overrideAccess: true, limit: 1, sort: 'id' })).docs[0]
    for (const width of [480, 960, 1440, 2400] as const) for (const format of ['avif', 'webp'] as const) {
      const rendition = media.sizes?.[`${format}${width}`]
      expect(rendition?.filename).toBeTruthy()
      const bytes = await readFile(path.join(process.env.MEDIA_DIR!, rendition!.filename!))
      const metadata = await sharp(bytes).metadata()
      expect(metadata.width).toBe(width)
      expect(metadata.format).toBe(format === 'avif' ? 'heif' : 'webp')
      if (format === 'avif') expect(metadata.compression).toBe('av1')
    }
    const buffer = await sharp({ create: { width: 32, height: 32, channels: 4, background: '#F4F1EA' } }).webp().toBuffer()
    const unicode = await payload.create({ collection: 'media', overrideAccess: true,
      data: { alt: 'Small cream square for media address testing.' },
      file: { data: buffer, mimetype: 'image/webp', name: `crème brûlée ${randomUUID()}.webp`, size: buffer.length } })
    const { GET } = await import('../src/app/(public)/media/[filename]/route')
    const valid = await GET(new Request('http://localhost/media/x'), { params: Promise.resolve({ filename: unicode.filename! }) })
    expect(valid.status).toBe(200)
    expect(valid.headers.get('content-type')).toBe('image/webp')
    expect((await GET(new Request('http://localhost/media/x'), { params: Promise.resolve({ filename: '../secret' }) })).status).toBe(400)
    const find = vi.spyOn(payload, 'find').mockRejectedValueOnce(new Error('test database outage'))
    try {
      const unavailable = await GET(new Request('http://localhost/media/x'), { params: Promise.resolve({ filename: unicode.filename! }) })
      expect(unavailable.status).toBe(503)
      expect(unavailable.headers.get('cache-control')).toBe('no-store')
    } finally { find.mockRestore() }
  }, 30000)

  it('hides drafts and auth fields from anonymous Local API reads', async () => {
    const posts = await payload.find({ collection: 'posts', overrideAccess: false, limit: 100 })
    expect(posts.docs).toHaveLength(0)
    const users = await payload.find({ collection: 'users', overrideAccess: false, limit: 100 })
    expect(users.docs.length).toBeGreaterThanOrEqual(2)
    for (const user of users.docs) {
      expect(user).not.toHaveProperty('email')
      expect(user).not.toHaveProperty('role')
      expect(user).not.toHaveProperty('sessions')
      expect(user).not.toHaveProperty('hash')
      expect(user).not.toHaveProperty('salt')
    }
  })

  it('denies editor settings and user administration', async () => {
    const admin = (await payload.find({ collection: 'users', overrideAccess: true, limit: 1 })).docs[0]
    const editorReq = await createLocalReq({ user: { ...admin, role: 'editor' } }, payload)
    await expect(payload.updateGlobal({ slug: 'site-settings', req: editorReq, overrideAccess: false, data: { tagline: 'Changed' } })).rejects.toThrow()
    await expect(payload.create({ collection: 'users', req: editorReq, overrideAccess: false,
      data: { name: 'Unapproved', slug: `unapproved-${randomUUID()}`, email: `unapproved-${randomUUID()}@example.test`, password: 'long-test-only-password', role: 'admin' } })).rejects.toThrow()
  })

  it('stores contact before delivery and never sends an idempotent retry twice', async () => {
    const requestId = randomUUID()
    const input = { requestId, name: 'Kitchen Test', email: 'kitchen@example.test', role: 'chef' as const, need: 'training' as const, message: 'We need a workshop.' }
    const peerIp = `198.51.100.${Math.floor(Math.random() * 200) + 20}`
    const first = await submitContact(payload, input, peerIp)
    expect(first.deliveryStatus).toBe('failed')
    const second = await submitContact(payload, input, peerIp)
    expect(second.id).toBe(first.id)
    const stored = await payload.find({ collection: 'form-submissions', overrideAccess: true, where: { requestId: { equals: requestId } } })
    expect(stored.totalDocs).toBe(1)
    expect(stored.docs[0].message).toBe(input.message)
    expect(stored.docs[0].deliveryStatus).toBe('failed')
  })

  it('blocks deletion of media referenced from a page draft version', async () => {
    const media = (await payload.find({ collection: 'media', overrideAccess: true, limit: 1 })).docs[0]
    await payload.create({ collection: 'pages', overrideAccess: true, draft: true,
      data: { title: 'Media version test', slug: `media-version-${randomUUID()}`,
        layout: [{ blockType: 'hero', heading: 'Media version test', style: 'image', image: media.id }], _status: 'draft' } })
    await expect(payload.delete({ collection: 'media', id: media.id, overrideAccess: true })).rejects.toMatchObject({ status: 409 })
  })


  it('runs stale publication tasks against current state and queues global dependencies', async () => {
    const oldOrigin = process.env.NEXT_PUBLIC_SERVER_URL
    const oldSecret = process.env.REVALIDATE_SECRET
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://example.test'
    process.env.REVALIDATE_SECRET = 'test-only-revalidation-secret'
    const requests: Record<string, unknown>[] = []
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      requests.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    try {
      const page = await payload.create({ collection: 'pages', overrideAccess: true, draft: true,
        data: { title: 'Current state page', slug: `current-${randomUUID()}`, layout: [{ blockType: 'hero', heading: 'Current state page', style: 'quiet' }],
          seo: { metaDescription: 'Publication state checked after the task was queued.' }, _status: 'draft' } })
      const stale = await payload.jobs.queue({ task: 'propagate-publication', input: {
        collection: 'pages', scope: 'content', documentId: String(page.id), savedSlug: 'old-page-address',
      } })
      await payload.update({ collection: 'pages', id: page.id, overrideAccess: true, data: { title: 'Current state page changed' } })
      await payload.jobs.runByID({ id: stale.id, silent: true })
      expect(requests.at(-1)).toMatchObject({ currentSlug: page.slug, savedSlug: 'old-page-address', published: false })
      expect(requests.at(-1)?.revision).toBeTruthy()

      const before = (await payload.count({ collection: 'payload-jobs', overrideAccess: true })).totalDocs
      await payload.updateGlobal({ slug: 'footer', overrideAccess: true, data: { legalText: 'Editorial legal text.' } })
      expect((await payload.count({ collection: 'payload-jobs', overrideAccess: true })).totalDocs).toBe(before + 1)
      const latest = (await payload.find({ collection: 'payload-jobs', overrideAccess: true, sort: '-id', limit: 1 })).docs[0]
      await payload.jobs.runByID({ id: latest.id, silent: true })
      expect(requests.at(-1)).toMatchObject({ collection: 'footer', scope: 'global', broadInvalidation: true })
    } finally {
      vi.unstubAllGlobals()
      process.env.NEXT_PUBLIC_SERVER_URL = oldOrigin
      process.env.REVALIDATE_SECRET = oldSecret
    }
  }, 30000)

  it('queues publication in the content transaction and exposes it after commit', async () => {
    const slug = `queue-${randomUUID()}`
    const draft = await payload.create({ collection: 'pages', overrideAccess: true, draft: true,
      data: { title: 'Queue test', slug, layout: [{ blockType: 'hero', heading: 'Queue test', style: 'quiet' }], _status: 'draft', seo: { metaDescription: 'A controlled publication test page.' } } })
    const before = (await payload.count({ collection: 'payload-jobs', overrideAccess: true })).totalDocs
    const req = await createLocalReq({}, payload)
    const tx = await payload.db.beginTransaction()
    if (tx === null) throw new Error('Transactions are required for this test.')
    req.transactionID = tx
    try {
      await payload.update({ collection: 'pages', id: draft.id, req, overrideAccess: true,
        data: { _status: 'published', publishedAt: new Date().toISOString() } })
      expect((await payload.count({ collection: 'payload-jobs', overrideAccess: true })).totalDocs).toBe(before)
      await payload.db.commitTransaction(tx)
      req.transactionID = undefined
      expect((await payload.count({ collection: 'payload-jobs', overrideAccess: true })).totalDocs).toBe(before + 1)
    } finally {
      if (req.transactionID) await payload.db.rollbackTransaction(req.transactionID)
    }
  }, 30000)

  it('serialises attachment and deletion in both lock orders', async () => {
    const buffer = await sharp({ create: { width: 24, height: 24, channels: 3, background: '#F4F1EA' } }).png().toBuffer()
    const makeMedia = async () => payload.create({ collection: 'media', overrideAccess: true,
      data: { alt: 'Small cream square used for a media race test.' },
      file: { data: buffer, mimetype: 'image/png', name: `race-${randomUUID()}.png`, size: buffer.length } })
    const first = await makeMedia()
    const firstPage = await payload.create({ collection: 'pages', overrideAccess: true, draft: true,
      data: { title: 'Reference race test', slug: `reference-race-${randomUUID()}`, layout: [{ blockType: 'hero', heading: 'Reference race test', style: 'quiet' }], _status: 'draft' } })
    const attachReq = await createLocalReq({}, payload)
    const attachTx = await payload.db.beginTransaction()
    if (attachTx === null) throw new Error('Transactions are required for this test.')
    attachReq.transactionID = attachTx
    let deleteAttempt: Promise<{ status: 'deleted' } | { status: 'rejected'; error: unknown }> | undefined
    try {
      await payload.update({ collection: 'pages', id: firstPage.id, req: attachReq, overrideAccess: true, draft: true,
        data: { layout: [{ blockType: 'hero', heading: 'Reference race test', style: 'image', image: first.id }] } })
      let settled = false
      deleteAttempt = payload.delete({ collection: 'media', id: first.id, overrideAccess: true })
        .then(() => ({ status: 'deleted' as const }), (error: unknown) => ({ status: 'rejected' as const, error }))
        .finally(() => { settled = true })
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(settled).toBe(false)
      await payload.db.commitTransaction(attachTx)
      attachReq.transactionID = undefined
      expect(await deleteAttempt).toMatchObject({ status: 'rejected', error: { status: 409 } })
      expect(await payload.findByID({ collection: 'media', id: first.id, overrideAccess: true })).toBeTruthy()
    } finally {
      if (attachReq.transactionID) await payload.db.rollbackTransaction(attachReq.transactionID)
      await deleteAttempt
    }

    const second = await makeMedia()
    const secondPage = await payload.create({ collection: 'pages', overrideAccess: true, draft: true,
      data: { title: 'Delete race test', slug: `delete-race-${randomUUID()}`, layout: [{ blockType: 'hero', heading: 'Delete race test', style: 'quiet' }], _status: 'draft' } })
    const deleteReq = await createLocalReq({}, payload)
    const deleteTx = await payload.db.beginTransaction()
    if (deleteTx === null) throw new Error('Transactions are required for this test.')
    deleteReq.transactionID = deleteTx
    let attachAttempt: Promise<{ status: 'attached' } | { status: 'rejected'; error: unknown }> | undefined
    try {
      await payload.delete({ collection: 'media', id: second.id, req: deleteReq, overrideAccess: true })
      let settled = false
      attachAttempt = payload.update({ collection: 'pages', id: secondPage.id, overrideAccess: true, draft: true,
        data: { layout: [{ blockType: 'hero', heading: 'Delete race test', style: 'image', image: second.id }] } })
        .then(() => ({ status: 'attached' as const }), (error: unknown) => ({ status: 'rejected' as const, error }))
        .finally(() => { settled = true })
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(settled).toBe(false)
      await payload.db.commitTransaction(deleteTx)
      deleteReq.transactionID = undefined
      expect(await attachAttempt).toMatchObject({ status: 'rejected', error: { status: 400 } })
      expect(await payload.findByID({ collection: 'media', id: second.id, overrideAccess: true, disableErrors: true })).toBeNull()
      const page = await payload.findByID({ collection: 'pages', id: secondPage.id, overrideAccess: true, depth: 0 })
      expect(JSON.stringify(page.layout)).not.toContain(`"image":${second.id}`)
    } finally {
      if (deleteReq.transactionID) await payload.db.rollbackTransaction(deleteReq.transactionID)
      await attachAttempt
    }
  }, 60000)
  it('searches indexed published text without exposing draft revisions or interpolating input', async () => {
    const { queryPublishedSearch } = await import('../src/lib/search')
    const marker = `quince${randomUUID().replaceAll('-', '')}`
    const privateMarker = `private${randomUUID().replaceAll('-', '')}`
    const page = await payload.create({ collection: 'pages', overrideAccess: true, data: {
      title: 'Search verification page', slug: `search-${randomUUID()}`, _status: 'published',
      layout: [{ blockType: 'plainStatement', statement: marker }],
      seo: { metaDescription: 'A page used to verify published search.' },
    } })
    const post = await payload.create({ collection: 'posts', overrideAccess: true, data: {
      title: 'Search verification post', slug: `search-${randomUUID()}`, _status: 'published',
      excerpt: marker, seo: { metaDescription: 'A post used to verify published search.' },
    } })
    await payload.update({ collection: 'posts', id: post.id, overrideAccess: true, draft: true, data: { excerpt: privateMarker, _status: 'draft' } })
    const found = await queryPublishedSearch(payload, marker)
    expect(found.hits.map(hit => `${hit.kind}:${hit.id}`).sort()).toEqual([`page:${page.id}`, `post:${post.id}`].sort())
    expect((await queryPublishedSearch(payload, privateMarker)).hits).toEqual([])
    expect((await queryPublishedSearch(payload, "' OR 1=1 --")).hits).toEqual([])
    await payload.update({ collection: 'pages', id: page.id, overrideAccess: true, data: { _status: 'draft' } })
    expect((await queryPublishedSearch(payload, marker)).hits.map(hit => hit.id)).toEqual([post.id])
    const indexes = await payload.db.pool.query<{ indexname: string }>("SELECT indexname FROM pg_indexes WHERE indexname IN ('pages_public_search_idx', 'posts_public_search_idx')")
    expect(indexes.rows).toHaveLength(2)
  })

  it('reads public author profiles through the real access policy and excludes private profiles', async () => {
    const { getPublicAuthor } = await import('../src/lib/public-content')
    const publicUser = (await payload.find({ collection: 'users', overrideAccess: true, where: { publicProfile: { equals: true } }, limit: 1 })).docs[0]
    const privateUser = (await payload.find({ collection: 'users', overrideAccess: true, where: { publicProfile: { equals: false } }, limit: 1 })).docs[0]
    expect(publicUser).toBeTruthy()
    expect(privateUser).toBeTruthy()
    const author = await getPublicAuthor(publicUser.slug)
    expect(author?.name).toBe(publicUser.name)
    expect(author).not.toHaveProperty('email')
    expect(author).not.toHaveProperty('role')
    expect(await getPublicAuthor(privateUser.slug)).toBeNull()
  })

  it('resolves managed redirects without exposing their admin-only collection', async () => {
    const { findManagedRedirect } = await import('../src/lib/redirects')
    const from = `/old-${randomUUID()}`
    const redirect = await payload.create({ collection: 'redirects', overrideAccess: true, data: { from, to: '/about', statusCode: '301' } })
    await expect(payload.find({ collection: 'redirects', overrideAccess: false })).rejects.toMatchObject({ status: 403 })
    await expect(payload.find({ collection: 'redirects', overrideAccess: false, context: { redirectLookup: true } })).rejects.toMatchObject({ status: 403 })
    expect(await findManagedRedirect(payload, from)).toEqual({ to: '/about', status: 301 })
    await payload.update({ collection: 'redirects', id: redirect.id, overrideAccess: true, data: { to: '/culinaire-kitchen', statusCode: '307' } })
    expect(await findManagedRedirect(payload, from)).toEqual({ to: '/culinaire-kitchen', status: 307 })
    await payload.delete({ collection: 'redirects', id: redirect.id, overrideAccess: true })
    expect(await findManagedRedirect(payload, from)).toBeNull()
  })

})
