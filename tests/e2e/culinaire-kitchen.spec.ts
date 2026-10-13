import AxeBuilder from '@axe-core/playwright'
import { expect, request as apiRequest, test } from '@playwright/test'
import type { Page as ContentPage, Media } from '../../src/payload-types'

test('the product page preserves editable content and plays its film only on request', async ({ page, browser, baseURL }, testInfo) => {
  test.setTimeout(180000)
  expect(new URL(baseURL ?? '').port).toBe('3100')
  const secret = process.env.CRON_SECRET
  if (!secret || !process.env.ROB_ADMIN_EMAIL || !process.env.ROB_ADMIN_PASSWORD) throw new Error('Isolated quality credentials are required.')
  const admin = await apiRequest.newContext({ baseURL })
  let original: ContentPage | undefined
  let headers: Record<string, string> = {}
  const flush = async () => expect((await admin.post('/api/jobs/run', { headers: { Authorization: `Bearer ${secret}` } })).status()).toBe(200)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    const login = await admin.post('/api/users/login', { data: { email: process.env.ROB_ADMIN_EMAIL, password: process.env.ROB_ADMIN_PASSWORD } })
    expect(login.status()).toBe(200)
    const { token } = await login.json() as { token?: string }
    if (!token) throw new Error('Quality login returned no token.')
    headers = { Authorization: `Bearer ${token}` }
    const response = await admin.get('/api/pages?where[slug][equals]=culinaire-kitchen&depth=0', { headers })
    expect(response.status()).toBe(200)
    original = ((await response.json()) as { docs: ContentPage[] }).docs[0]
    if (!original) throw new Error('Seeded product page is missing.')
    const { approvedCulinaireKitchenLayout } = await import('../../scripts/culinaire-kitchen-content')
    const layout = approvedCulinaireKitchenLayout()
    const publish = async (nextLayout: ContentPage['layout']) => {
      const start = Date.now()
      expect((await admin.patch(`/api/pages/${original?.id}`, { headers, data: { layout: nextLayout, _status: 'published' } })).status()).toBe(200)
      await flush()
      const updated = await page.goto('/culinaire-kitchen')
      expect(updated?.status()).toBe(200)
      expect(Date.now() - start).toBeLessThan(60000)
      return updated
    }
    const published = await publish(layout)
    expect(await published?.text()).toContain('Behind every')
    await expect(page.locator('main h1')).toHaveText(/Behind every\s+service\./u)
    const text = await page.locator('main').innerText()
    for (const feature of ['Rostering', 'Inventory', 'Purchasing', 'Receiving', 'Mise en Place', 'Production', 'Waste Management', 'Sales', 'Recipe Lab', 'Patisserie Lab', 'Cocktail Lab']) {
      expect(text.toLowerCase()).toContain(feature.toLowerCase())
    }
    await expect(page.getByRole('main').getByRole('link', { name: /Visit CulinAIre Kitchen/u }).first()).toHaveAttribute('href', 'https://www.culinaire.kitchen')
    await expect(page.locator('main h1')).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
    if ((page.viewportSize()?.width ?? 0) > 800) {
      const rows = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Plan the day.', exact: true }) })
      const paragraphs = await rows.locator('p').evaluateAll(nodes => nodes.map(node => ({ x: node.getBoundingClientRect().x, y: node.getBoundingClientRect().y })))
      expect(paragraphs).toHaveLength(3)
      expect(paragraphs[1].x).toBeGreaterThan(paragraphs[0].x + 100)
      expect(paragraphs[2].x).toBe(paragraphs[1].x)
    }
    await page.screenshot({ path: testInfo.outputPath('culinaire-kitchen-approved.png'), fullPage: true })

    const custom: ContentPage['layout'] = [...(layout ?? [])]
    const labsIndex = custom.findIndex(block => block.blockName === 'Kitchen labs')
    expect(labsIndex).toBeGreaterThan(0)
    custom.splice(labsIndex, 0, { blockType: 'plainStatement', statement: 'An independently edited product-page interlude.' })
    await publish(custom)
    const customText = await page.locator('main').innerText()
    expect(customText.indexOf('An independently edited product-page interlude.')).toBeLessThan(customText.indexOf('Three disciplines.'))
    expect((await (await page.request.get('/llms-full.txt')).text()).replaceAll('\\', '')).toContain('An independently edited product-page interlude')

    const mediaResponse = await admin.get('/api/media?where[placeholder][equals]=false&limit=1&depth=0', { headers })
    expect(mediaResponse.status()).toBe(200)
    const media = ((await mediaResponse.json()) as { docs: Media[] }).docs[0]
    if (!media) throw new Error('Seeded concept image is missing.')
    const withMedia = custom.map(block => block.blockType === 'hero' ? { ...block, image: media.id } : block)
    await publish(withMedia)
    const heroImage = page.locator('main img').first()
    await expect(heroImage).toHaveAttribute('alt', media.alt)
    await expect.poll(() => heroImage.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await publish(layout)

    // Normal motion must not attach or start the product-page film on visibility.
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const mediaRequests: string[] = []
    page.on('request', request => { if (request.url().endsWith('.mp4')) mediaRequests.push(request.url()) })
    await page.reload()
    const film = page.locator('#film')
    const video = film.locator('video[data-kitchen-video]')
    await video.scrollIntoViewIfNeeded()
    await expect(film.getByRole('button', { name: 'Play the kitchen film', exact: true })).toBeVisible()
    await page.waitForTimeout(350)
    expect(mediaRequests).toEqual([])
    await expect(video).not.toHaveAttribute('src', /./u)
    await film.getByRole('button', { name: 'Play the kitchen film', exact: true }).click()
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true)
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.duration)).toBe(128)
    const portrait = (page.viewportSize()?.width ?? 0) <= 760
    await expect(video).toHaveAttribute('src', new RegExp(portrait ? 'portrait-v1.mp4' : 'landscape-v1.mp4'))
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
    await video.scrollIntoViewIfNeeded()
    await page.waitForTimeout(350)
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
    await film.getByRole('button', { name: 'Play the kitchen film', exact: true }).click()
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')) })
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')) })
    await page.waitForTimeout(250)
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
    await film.getByRole('slider', { name: 'Film position' }).evaluate((slider: HTMLInputElement) => { slider.value = '127'; slider.dispatchEvent(new Event('input', { bubbles: true })) })
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(127)
    await film.getByRole('button', { name: 'Play the kitchen film', exact: true }).click()
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.ended)).toBe(true)
    await film.getByRole('button', { name: 'Replay the kitchen film', exact: true }).click()
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(5)
    await film.getByRole('button', { name: 'Pause the kitchen film', exact: true }).click()

    await page.route('**/films/kitchen-day/*.mp4', route => route.abort())
    await page.reload()
    await video.scrollIntoViewIfNeeded()
    await film.getByRole('button', { name: 'Play the kitchen film', exact: true }).click()
    await expect(film.locator('[data-film-error]')).toBeVisible()
    await expect(film.locator('[data-film-poster]')).toBeVisible()
    await expect(film.locator('#kitchen-film-transcript li')).toHaveCount(15)
    await page.unroute('**/films/kitchen-day/*.mp4')

    const plainContext = await browser.newContext({ javaScriptEnabled: false, baseURL })
    try {
      const plain = await plainContext.newPage()
      await plain.goto('/culinaire-kitchen')
      await expect(plain.locator('main h1')).toHaveText(/Behind every\s+service\./u)
      await expect(plain.locator('#film').getByRole('link', { name: 'landscape film' })).toBeVisible()
      await expect(plain.locator('#film').getByRole('link', { name: 'portrait film' })).toBeVisible()
    } finally { await plainContext.close() }

    const draft = layout?.map(block => block.blockType === 'hero' ? { ...block, heading: 'Private product draft fixture' } : block)
    expect((await admin.patch(`/api/pages/${original.id}?draft=true`, { headers, data: { layout: draft, _status: 'draft' } })).status()).toBe(200)
    await flush()
    await page.goto('/culinaire-kitchen')
    await expect(page.locator('main h1')).not.toHaveText('Private product draft fixture')
    const preview = await admin.get('/api/preview?collection=pages&slug=culinaire-kitchen', { headers, maxRedirects: 0 })
    expect(preview.status()).toBe(303)
    const previewPage = await admin.get('/culinaire-kitchen', { headers })
    expect(previewPage.headers()['cache-control']).toMatch(/private|no-store/u)
    expect(await previewPage.text()).toContain('Private product draft fixture')
    await admin.get('/api/preview?exit=1', { maxRedirects: 0 })
    expect(errors).toEqual([])
  } finally {
    if (original) expect((await admin.patch(`/api/pages/${original.id}`, { headers, data: { layout: original.layout, seo: original.seo, _status: 'published' } })).status()).toBe(200)
    await flush()
    await admin.dispose()
  }
})
