import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import AxeBuilder from '@axe-core/playwright'
import { expect, request as apiRequest, test } from '@playwright/test'

test('Journal keeps the newest hero, four following entries and older pages accessible', async ({ page, browser, baseURL }, testInfo) => {
  test.setTimeout(180000)
  // This suite runs only against the isolated quality database on port 3100.
  expect(new URL(baseURL ?? '').port).toBe('3100')
  const admin = await apiRequest.newContext({ baseURL })
  const ids: number[] = []
  let headers: Record<string, string> = {}
  let mediaId: number | undefined
  const marker = randomUUID().slice(0, 8)
  const titles = Array.from({ length: 13 }, (_, i) => `Journal layout ${marker} entry ${i + 1}`)
  titles[2] = `Journal ${marker}: preparation notes with a deliberately long title for the changing demands of a working kitchen`
  const slugs = titles.map(title => title.toLowerCase().replaceAll(':', '').replaceAll(' ', '-'))
  const secret = process.env.CRON_SECRET
  if (!secret || !process.env.ROB_ADMIN_EMAIL || !process.env.ROB_ADMIN_PASSWORD) throw new Error('Quality fixture configuration is required.')
  const flush = async () => {
    const response = await admin.post('/api/jobs/run', { headers: { Authorization: `Bearer ${secret}` } })
    expect(response.status()).toBe(200)
  }

  try {
    const login = await admin.post('/api/users/login', {
      data: { email: process.env.ROB_ADMIN_EMAIL, password: process.env.ROB_ADMIN_PASSWORD },
    })
    expect(login.status()).toBe(200)
    const credentials = await login.json() as { token?: string }
    if (!credentials.token) throw new Error('Quality login did not return a token.')
    headers = { Authorization: `Bearer ${credentials.token}` }
    const upload = await admin.post('/api/media', { headers, multipart: {
      _payload: JSON.stringify({ alt: 'Temporary Journal layout photograph' }),
      file: { name: `journal-${marker}.webp`, mimeType: 'image/webp', buffer: await readFile('public/images/journal/kitchen-notebook.webp') },
    } })
    expect(upload.status()).toBe(201)
    const uploaded = await upload.json() as { doc: { id: number } }
    mediaId = uploaded.doc.id

    for (let i = 0; i < titles.length; i++) {
      const response = await admin.post('/api/posts', { headers, data: {
        title: titles[i], slug: slugs[i], seo: { metaTitle: `Journal layout ${marker} entry ${i + 1}` }, excerpt: `Temporary Journal layout entry ${i + 1} for browser verification.`,
        // Include a missing-image entry among the four masonry items.
        heroImage: i === 3 ? undefined : mediaId,
        publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
        _status: 'published',
      } })
      expect(response.status()).toBe(201)
      const created = await response.json() as { doc: { id: number } }
      ids.push(created.doc.id)
    }
    await flush()
    const response = await page.goto('/journal')
    expect(response?.status()).toBe(200)
    const html = await response?.text()
    for (const title of titles.slice(0, 12)) expect(html).toContain(title)
    await expect(page.locator('main article')).toHaveCount(12)
    await expect(page.locator('main article').first().getByRole('heading')).toHaveText(titles[0])
    const further = page.getByRole('region', { name: 'Further reading' })
    await expect(further.locator('article')).toHaveCount(4)
    await expect(further.locator('article h2, article h3')).toHaveText(titles.slice(1, 5))
    await further.locator('article').last().scrollIntoViewIfNeeded()
    await page.evaluate(() => document.fonts.ready)
    const boxes = await further.locator('article').evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect()
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
    }))
    for (const [i, a] of boxes.entries()) for (const b of boxes.slice(i + 1)) {
      expect(a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1).toBe(false)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(accessibility.violations).toEqual([])
    await page.screenshot({ path: testInfo.outputPath('journal-populated.png'), fullPage: true })

    // Desktop also exercises resizing across the breakpoint, themes and keyboard order.
    if (testInfo.project.name === 'desktop') {
      const originalViewport = page.viewportSize()
      for (const width of [320, 390, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 })
        for (const theme of ['light', 'dark']) {
          await page.getByRole('combobox', { name: 'Colour theme' }).selectOption(theme)
          await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
          await expect.poll(() => further.locator('li').evaluateAll(nodes => {
            const boxes = nodes.map(node => node.getBoundingClientRect())
            return boxes.some((a, i) => boxes.slice(i + 1).some(b =>
              a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1))
          })).toBe(false)
          if ([390, 1440].includes(width)) {
            const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
            expect(scan.violations).toEqual([])
            await page.screenshot({ path: testInfo.outputPath(`journal-${width}-${theme}.png`), fullPage: true })
          }
        }
      }
      await page.getByRole('combobox', { name: 'Colour theme' }).selectOption('system')
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme })
        expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
      }
      // CSS zoom exercises enlarged text and images without relying on browser shortcuts.
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.evaluate(() => { document.documentElement.style.zoom = '2' })
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
      await expect(page.locator('main article').first().getByRole('heading')).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath('journal-200-percent.png'), fullPage: true })
      await page.evaluate(() => { document.documentElement.style.zoom = '' })
      if (originalViewport) await page.setViewportSize(originalViewport)
      const links = page.locator('main article a')
      await links.first().focus()
      for (let i = 0; i < await links.count(); i++) {
        await expect(links.nth(i)).toBeFocused()
        await page.keyboard.press('Tab')
      }
      await page.getByRole('combobox', { name: 'Colour theme' }).selectOption('dark')
    }

    await page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: 'Next' }).click()
    await expect(page).toHaveURL(/\/journal\/page\/2$/u)
    await expect(page.getByRole('link', { name: titles[12], exact: true })).toBeVisible()
    await page.goto(`/journal/${slugs[0]}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles[0])

    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize() ?? undefined })
    try {
      const plain = await noJs.newPage()
      await plain.goto(`${baseURL}/journal`)
      await expect(plain.locator('main article')).toHaveCount(12)
      await expect(plain.getByRole('link', { name: titles[0], exact: true })).toBeVisible()
      expect(await plain.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
    } finally { await noJs.close() }
  } finally {
    for (const id of ids) expect((await admin.delete(`/api/posts/${id}`, { headers })).status()).toBe(200)
    if (mediaId !== undefined) expect((await admin.delete(`/api/media/${mediaId}`, { headers })).status()).toBe(200)
    await flush()
    await admin.dispose()
  }
})
