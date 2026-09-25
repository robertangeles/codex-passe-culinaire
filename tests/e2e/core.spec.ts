import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const publicRoutes = [
  {
    path: '/',
    heading: 'passe culinaire',
    htmlText: 'A company built by chefs in Melbourne.',
  },
  {
    path: '/about',
    heading: 'About',
    htmlText: 'Alex Charasse and Rob Angeles are its founders.',
  },
  {
    path: '/culinaire-kitchen',
    heading: 'CulinAIre Kitchen',
    htmlText: "CulinAIre Kitchen uses AI to help organise a prep list from today's menu",
  },
  {
    path: '/journal',
    heading: 'Journal',
    htmlText: 'Journal entries',
  },
  {
    path: '/contact',
    heading: 'Contact',
    htmlText: 'Tell us what you need.',
  },
] as const

test.describe('core public routes', () => {
  for (const route of publicRoutes) {
    test(`${route.path} renders accessible server content`, async ({ page, baseURL }) => {
      const runtimeErrors: string[] = []
      const thirdPartyAssets: string[] = []
      const expectedOrigin = new URL(baseURL ?? 'http://localhost:3100').origin

      page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text())
      })
      page.on('pageerror', (error) => runtimeErrors.push(error.message))
      page.on('request', (request) => {
        if (request.resourceType() !== 'script' && request.resourceType() !== 'font') return
        if (new URL(request.url()).origin !== expectedOrigin) thirdPartyAssets.push(request.url())
      })

      const response = await page.goto(route.path)
      expect(response?.status(), `${route.path} response status`).toBe(200)
      expect(response?.headers()['critical-ch'], 'Public navigation does not restart for admin colour-scheme hints').toBeUndefined()

      const html = await response?.text()
      expect(html, `${route.path} server response`).toContain(route.htmlText)

      await expect(page.getByRole('main')).toHaveCount(1)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.heading)

      const hasHorizontalOverflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalOverflow, `${route.path} horizontal overflow`).toBe(false)

      const accessibility = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect(accessibility.violations, `${route.path} axe violations`).toEqual([])

      expect(thirdPartyAssets, `${route.path} third-party script or font requests`).toEqual([])
      expect(runtimeErrors, `${route.path} browser errors`).toEqual([])
    })
  }
})

test('skip link moves keyboard focus to the main content', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')

  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await expect(skipLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
})

test('theme control exposes choices and persists the selected theme', async ({ page }) => {
  await page.goto('/')

  const themeControl = page.getByRole('combobox', { name: 'Colour theme' })
  await expect(themeControl).toHaveValue('system')
  await expect(themeControl.locator('option')).toHaveText(['System', 'Light', 'Dark'])

  await themeControl.selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('passe-theme'))).toBe('dark')

  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Colour theme' })).toHaveValue('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('mobile navigation links can be reached and followed by keyboard', async ({ page }) => {
  const mainNavigation = page.getByRole('navigation', { name: 'Main navigation' })
  await page.goto('/')

  const aboutLink = mainNavigation.getByRole('link', { name: 'About' })
  await expect(aboutLink).toBeVisible()

  let aboutLinkFocused = false
  for (let tabCount = 0; tabCount < 12; tabCount += 1) {
    await page.keyboard.press('Tab')
    aboutLinkFocused = await aboutLink.evaluate((link) => link === document.activeElement)
    if (aboutLinkFocused) break
  }
  expect(aboutLinkFocused, 'About is reachable through the mobile keyboard order').toBe(true)

  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/about$/u)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About')
})
