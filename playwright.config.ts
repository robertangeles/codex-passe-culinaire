import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45000,
  expect: { timeout: 10000 },
  outputDir: '.local/playwright-results',
  reporter: [['list'], ['html', { outputFolder: '.local/playwright-report', open: 'never' }]],
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure', screenshot: 'only-on-failure', reducedMotion: 'reduce' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'pnpm start --hostname 127.0.0.1 --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: false,
    timeout: 60000,
  },
})
