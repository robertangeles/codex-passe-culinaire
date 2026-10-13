import { expect, test } from '@playwright/test'

test('contact keeps entered values and server validation available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/contact')
    await page.getByLabel('Your name').fill('Contact validation check')
    await page.getByLabel('Email address').fill('validation@example.test')
    await page.getByLabel('Message', { exact: true }).fill('Checking that the form preserves an enquiry after a validation error.')
    await page.getByLabel('What can we help with?').selectOption('advisory')
    // Simulate a stale or tampered role value to exercise server validation,
    // without creating a submission or sending a notification.
    await page.getByLabel('Your role').evaluate((select: HTMLSelectElement) => {
      select.add(new Option('Unknown role', 'unknown-role', true, true))
    })
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('Please check the highlighted fields.')
    await expect(page.getByLabel('Your role')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByLabel('Your name')).toHaveValue('Contact validation check')
    await expect(page.getByLabel('Email address')).toHaveValue('validation@example.test')
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Checking that the form preserves an enquiry after a validation error.')
    await expect(page.getByRole('heading', { name: 'Message received' })).toHaveCount(0)
  } finally {
    await context.close()
  }
})
