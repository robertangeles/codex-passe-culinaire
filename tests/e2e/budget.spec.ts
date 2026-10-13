import { gzipSync } from 'node:zlib'
import { expect, test } from '@playwright/test'

const budgetBytes = process.env.QUALITY_STRICT_BUDGETS === 'true' ? 120000 : 160000

test('home JavaScript stays below its approved gzip ceiling', async ({ page }, testInfo) => {
  const scripts = new Map<string, number>()
  const pending: Promise<void>[] = []
  page.on('response', response => {
    if (response.request().resourceType() !== 'script') return
    pending.push(response.body().then(body => { scripts.set(response.url(), gzipSync(body).byteLength) }))
  })
  await page.goto('/', { waitUntil: 'networkidle' })
  await Promise.all(pending)
  const inline = await page.locator('script:not([src])').evaluateAll(elements => elements
    .filter(element => !element.getAttribute('type') || ['text/javascript', 'module'].includes(element.getAttribute('type') || ''))
    .map(element => element.textContent || '').join('\n'))
  const inlineBytes = gzipSync(inline).byteLength
  const totalBytes = [...scripts.values()].reduce((sum, size) => sum + size, inlineBytes)
  await testInfo.attach('home-javascript.json', {
    body: JSON.stringify({ budgetBytes, originalTargetBytes: 120000, totalBytes, inlineBytes, scripts: Object.fromEntries(scripts) }, null, 2),
    contentType: 'application/json',
  })
  expect(totalBytes, 'Initial loaded scripts plus executable inline scripts, gzip at default compression').toBeLessThan(budgetBytes)
})
