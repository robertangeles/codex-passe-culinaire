module.exports = {
  ci: {
    collect: {
      startServerCommand: 'node scripts/start-performance-server.mjs',
      startServerReadyPattern: 'QUALITY_SERVER_READY',
      url: ['/', '/about', '/culinaire-kitchen', '/journal', '/contact'].map(path => `https://localhost:3443${path}`),
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--headless --no-sandbox --disable-dev-shm-usage --ignore-certificate-errors',
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
        throttlingMethod: 'simulate',
        throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        'categories:accessibility': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        'categories:best-practices': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        'categories:seo': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        'largest-contentful-paint': ['error', { maxNumericValue: process.env.QUALITY_STRICT_BUDGETS === 'true' ? 1999 : 2600, aggregationMethod: 'median' }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.local/lighthouse-report' },
  },
}
