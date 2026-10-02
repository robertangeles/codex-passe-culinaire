import { randomUUID } from 'node:crypto'
import AxeBuilder from '@axe-core/playwright'
import { expect, request as apiRequest, test, type Page } from '@playwright/test'

async function assertLayout(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('main h1')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
}

test('company catalogues retain real entries, statuses and pagination in their editorial layouts', async ({ page, browser, baseURL }, testInfo) => {
  test.setTimeout(180000)
  expect(new URL(baseURL ?? '').port).toBe('3100')
  const admin = await apiRequest.newContext({ baseURL })
  const records: { collection: 'services' | 'events'; id: number }[] = []
  const marker = randomUUID().slice(0, 8)
  const secret = process.env.CRON_SECRET
  if (!secret || !process.env.ROB_ADMIN_EMAIL || !process.env.ROB_ADMIN_PASSWORD) throw new Error('Isolated quality credentials are required.')
  let headers: Record<string, string> = {}
  const flush = async () => expect((await admin.post('/api/jobs/run', { headers: { Authorization: `Bearer ${secret}` } })).status()).toBe(200)
  const titles = Array.from({ length: 13 }, (_, i) => `Company ${marker} ${String(i + 1).padStart(2, '0')}`)
  titles[0] += ' preparation notes for a working kitchen and the people who make each service possible'
  const serviceSlugs = titles.map((_, i) => `service-${marker}-${i}`)
  const eventSlugs = titles.map((_, i) => `training-${marker}-${i}`)
  try {
    // The quality seed contains drafts only. The public empty states remain honest.
    await page.goto('/services')
    await expect(page.getByRole('heading', { name: 'Service details are being prepared.' })).toBeVisible()
    await page.getByRole('main').getByRole('link', { name: /Discuss your kitchen/u }).first().click()
    await expect(page).toHaveURL(/\/contact$/u)
    await page.goBack()
    await expect(page).toHaveURL(/\/services$/u)
    await page.goto('/training')
    await expect(page.getByRole('main')).toContainText('There are no upcoming training dates.')
    const login = await admin.post('/api/users/login', { data: { email: process.env.ROB_ADMIN_EMAIL, password: process.env.ROB_ADMIN_PASSWORD } })
    expect(login.status()).toBe(200)
    const credentials = await login.json() as { token?: string }
    if (!credentials.token) throw new Error('Quality login returned no token.')
    headers = { Authorization: `Bearer ${credentials.token}` }
    const create = async (collection: 'services' | 'events', data: Record<string, unknown>) => {
      const response = await admin.post(`/api/${collection}`, { headers, data: { seo: { metaTitle: 'Company layout fixture', metaDescription: 'Temporary company page fixture for browser verification.' }, ...data } })
      expect(response.status()).toBe(201)
      records.push({ collection, id: ((await response.json()) as { doc: { id: number } }).doc.id })
    }
    for (let i = 0; i < titles.length; i++) {
      await create('services', { title: titles[i], slug: serviceSlugs[i], oneLiner: i === 1 ? undefined : 'Temporary service for layout verification.', whoItIsFor: i === 2 ? undefined : 'Kitchen teams reviewing their daily preparation.', _status: 'published' })
      await create('events', { title: titles[i], slug: eventSlugs[i], descriptionSummary: i === 1 ? undefined : 'Temporary training session for layout verification.', startDate: new Date(Date.now() + (i + 1) * 86400000).toISOString(), eventStatus: i === 0 ? 'sold-out' : 'upcoming', _status: 'published' })
    }
    await create('events', { title: `Past ${marker}`, slug: `past-${marker}`, eventStatus: 'past', _status: 'published' })
    await create('events', { title: `Cancelled ${marker}`, slug: `cancelled-${marker}`, eventStatus: 'cancelled', _status: 'published' })
    await create('services', { title: `Private service ${marker}`, slug: `private-service-${marker}`, _status: 'draft' })
    await create('events', { title: `Private training ${marker}`, slug: `private-training-${marker}`, _status: 'draft' })
    const committedAt = Date.now()
    await flush()
    for (const route of ['services', 'training']) {
      const fresh = await page.request.get(`/${route}`)
      expect(await fresh.text()).toContain(titles[0])
      expect(Date.now() - committedAt).toBeLessThan(60000)
    }
    for (const route of ['services', 'training'] as const) {
      const response = await page.goto(`/${route}`)
      expect(response?.status()).toBe(200)
      const html = await response?.text()
      expect(html).toContain(titles[0])
      expect(html).not.toContain(`Private ${route === 'services' ? 'service' : 'training'} ${marker}`)
      if (route === 'training') {
        await expect(page.getByRole('main')).toContainText('Sold out')
        await expect(page.getByRole('main').getByRole('link', { name: `Past ${marker}`, exact: true })).toBeVisible()
        await expect(page.getByRole('main').getByRole('link', { name: `Cancelled ${marker}`, exact: true })).toBeVisible()
      }
      await assertLayout(page)
      await page.screenshot({ path: testInfo.outputPath(`${route}-populated.png`), fullPage: true })
      if (testInfo.project.name === 'desktop') {
        for (const width of [390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 })
          for (const theme of ['light', 'dark']) {
            await page.getByRole('combobox', { name: 'Colour theme' }).selectOption(theme)
            await assertLayout(page)
            await page.screenshot({ path: testInfo.outputPath(`${route}-${width}-${theme}.png`), fullPage: true })
          }
        }
        await page.evaluate(() => { document.documentElement.style.zoom = '2' })
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
        await page.evaluate(() => { document.documentElement.style.zoom = '' })
      }
      await page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: 'Next' }).click()
      await expect(page).toHaveURL(new RegExp(`/${route}/page/2$`, 'u'))
      await expect(page.getByRole('main').getByRole('link', { name: titles[12], exact: true })).toBeVisible()
      const slug = route === 'services' ? serviceSlugs[12] : eventSlugs[12]
      await page.getByRole('main').getByRole('link', { name: titles[12], exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`/${route}/${slug}$`, 'u'))
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles[12])
      await page.goBack()
      await expect(page).toHaveURL(new RegExp(`/${route}/page/2$`, 'u'))
      expect((await page.goto(`/${route}/page/999`))?.status()).toBe(404)
      await page.goto(`/${route}/page/1`)
      await expect(page).toHaveURL(new RegExp(`/${route}$`, 'u'))
      const noJs = await browser.newContext({ javaScriptEnabled: false })
      try {
        const plain = await noJs.newPage()
        await plain.goto(`${baseURL}/${route}`)
        await expect(plain.getByRole('main').getByRole('link', { name: titles[0], exact: true })).toBeVisible()
      } finally { await noJs.close() }
    }
  } finally {
    for (const record of records.reverse()) expect((await admin.delete(`/api/${record.collection}/${record.id}`, { headers })).status()).toBe(200)
    await flush()
    await admin.dispose()
  }
})

test('About keeps editable founder content, portrait spaces, real media and ordered blocks', async ({ page, baseURL }, testInfo) => {
  test.setTimeout(180000)
  expect(new URL(baseURL ?? '').port).toBe('3100')
  const admin = await apiRequest.newContext({ baseURL })
  const secret = process.env.CRON_SECRET
  if (!secret || !process.env.ROB_ADMIN_EMAIL || !process.env.ROB_ADMIN_PASSWORD) throw new Error('Isolated quality credentials are required.')
  let headers: Record<string, string> = {}
  let original: import('../../src/payload-types').Page | undefined
  let originalMedia: import('../../src/payload-types').Media | undefined
  const flush = async () => expect((await admin.post('/api/jobs/run', { headers: { Authorization: `Bearer ${secret}` } })).status()).toBe(200)
  try {
    const login = await admin.post('/api/users/login', { data: { email: process.env.ROB_ADMIN_EMAIL, password: process.env.ROB_ADMIN_PASSWORD } })
    expect(login.status()).toBe(200)
    const credentials = await login.json() as { token?: string }
    if (!credentials.token) throw new Error('Quality login returned no token.')
    headers = { Authorization: `Bearer ${credentials.token}` }
    const response = await admin.get('/api/pages?where[slug][equals]=about&depth=0', { headers })
    expect(response.status()).toBe(200)
    original = ((await response.json()) as { docs: import('../../src/payload-types').Page[] }).docs[0]
    if (!original) throw new Error('Seeded About page is missing.')
    // The content transform is also exercised by its guarded updater tests.
    const { approvedAboutLayout } = await import('../../scripts/about-content')
    const layout = approvedAboutLayout(original.layout)
    const publish = async (nextLayout: import('../../src/payload-types').Page['layout']) => {
      const start = Date.now()
      expect((await admin.patch(`/api/pages/${original?.id}`, { headers, data: { layout: nextLayout, _status: 'published' } })).status()).toBe(200)
      await flush()
      const updated = await page.goto('/about')
      expect(updated?.status()).toBe(200)
      expect(Date.now() - start).toBeLessThan(60000)
      return updated
    }
    const published = await publish(layout)
    expect(await published?.text()).toContain('looking forward.')
    await expect(page.locator('main h1')).toHaveText(/From the kitchen,\s*looking forward\./u)
    await expect(page.getByText('Photograph to be supplied', { exact: true })).toHaveCount(2)
    await expect(page.getByRole('main')).not.toContainText('PLACEHOLDER 10')
    await assertLayout(page)
    await page.screenshot({ path: testInfo.outputPath('about-portrait-spaces.png'), fullPage: true })
    await page.getByRole('main').getByRole('link', { name: 'Explore CulinAIre Kitchen', exact: true }).click()
    await expect(page).toHaveURL(/\/culinaire-kitchen$/u)
    await page.goBack()
    await page.getByRole('main').getByRole('link', { name: 'Start a conversation', exact: true }).click()
    await expect(page).toHaveURL(/\/contact$/u)

    const mediaResponse = await admin.get('/api/media?where[placeholder][equals]=false&limit=1&depth=0', { headers })
    expect(mediaResponse.status()).toBe(200)
    originalMedia = ((await mediaResponse.json()) as { docs: import('../../src/payload-types').Media[] }).docs[0]
    if (!originalMedia) throw new Error('Seeded concept image is missing.')
    const mediaId = originalMedia.id
    // Reuse the isolated seed image so saved About versions do not retain a disposable upload.
    expect((await admin.patch(`/api/media/${mediaId}`, { headers, data: {
      alt: 'Temporary founder media fixture', caption: 'Portrait caption fixture', credit: 'Quality fixture', focalX: 30, focalY: 40,
    } })).status()).toBe(200)
    const withMedia = layout.map(block => block.blockType === 'founderCard' && block.name === 'Alex Charasse' ? { ...block, portrait: mediaId } : block)
    const secondFounder = withMedia.findIndex(block => block.blockType === 'founderCard' && block.name === 'Rob Angeles')
    expect(secondFounder).toBeGreaterThan(0)
    withMedia.splice(secondFounder, 0, { blockType: 'plainStatement', statement: 'A custom block between the founders.' })
    await publish(withMedia)
    const image = page.getByRole('img', { name: 'Temporary founder media fixture' })
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await expect(page.getByText('Portrait caption fixture', { exact: true })).toBeVisible()
    await expect(page.getByText('Credit: Quality fixture', { exact: true })).toBeVisible()
    await expect(page.getByText('Photograph to be supplied', { exact: true })).toHaveCount(1)
    const order = await page.locator('main').innerText()
    expect(order.indexOf('Alex Charasse')).toBeLessThan(order.indexOf('A custom block between the founders.'))
    expect(order.indexOf('A custom block between the founders.')).toBeLessThan(order.indexOf('Rob Angeles'))
    await assertLayout(page)
    await page.screenshot({ path: testInfo.outputPath('about-real-media.png'), fullPage: true })
    const exports = await page.request.get('/llms-full.txt')
    expect(await exports.text()).toContain('A custom block between the founders')

    // A failed portrait request keeps its allocated frame and readable alternative.
    await page.route('**/media/**', route => route.abort())
    await page.reload()
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth === 0)).toBe(true)
    const box = await image.boundingBox()
    expect(box?.width).toBeGreaterThan(100)
    expect(box?.height).toBeGreaterThan(100)
    expect(Math.abs((box?.width ?? 0) / (box?.height ?? 1) - 0.8)).toBeLessThan(0.02)
    await expect(image).toHaveAttribute('alt', 'Temporary founder media fixture')
    await page.unroute('**/media/**')

    const draftLayout = withMedia.map(block => block.blockType === 'hero' ? { ...block, heading: 'Private About draft fixture' } : block)
    expect((await admin.patch(`/api/pages/${original.id}?draft=true`, { headers, data: { layout: draftLayout, _status: 'draft' } })).status()).toBe(200)
    await flush()
    await page.goto('/about')
    await expect(page.locator('main h1')).not.toHaveText('Private About draft fixture')
    const preview = await admin.get('/api/preview?collection=pages&slug=about', { headers, maxRedirects: 0 })
    expect(preview.status()).toBe(303)
    const previewPage = await admin.get('/about', { headers })
    expect(previewPage.headers()['cache-control']).toMatch(/private|no-store/u)
    expect(await previewPage.text()).toContain('Private About draft fixture')
    await admin.get('/api/preview?exit=1', { maxRedirects: 0 })
  } finally {
    if (original) expect((await admin.patch(`/api/pages/${original.id}`, { headers, data: { layout: original.layout, _status: 'published' } })).status()).toBe(200)
    if (originalMedia) expect((await admin.patch(`/api/media/${originalMedia.id}`, { headers, data: {
      alt: originalMedia.alt, caption: originalMedia.caption, credit: originalMedia.credit,
      focalX: originalMedia.focalX, focalY: originalMedia.focalY,
    } })).status()).toBe(200)
    await flush()
    await admin.dispose()
  }
})
