import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { validateTestDatabase } from './test-database.mjs'

if (existsSync('.env')) process.loadEnvFile('.env')
const mode = process.argv[2]
if (!['e2e', 'performance'].includes(mode)) throw new Error('Choose e2e or performance.')
const testURI = validateTestDatabase(process.env.DATABASE_URI, process.env.TEST_DATABASE_URI)

const env = {
  ...process.env,
  NEXT_PUBLIC_SERVER_URL: mode === 'performance' ? 'https://localhost:3443' : 'http://localhost:3100',
  NEXT_DIST_DIR: '.next-quality',
  MEDIA_DIR: path.resolve('.local/test-media'),
  MEDIA_STORAGE: 'local',
  MAIL_PROVIDER: 'smtp',
  SMTP_HOST: '', RESEND_API_KEY: '', CONTACT_TO_ADDRESS: '',
  RUN_JOBS: 'false', INDEXNOW_KEY: '',
  CRON_SECRET: randomBytes(32).toString('hex'),
  ROB_ADMIN_EMAIL: 'rob-quality@example.test', ALEX_ADMIN_EMAIL: 'alex-quality@example.test',
  ROB_ADMIN_PASSWORD: randomBytes(24).toString('hex'), ALEX_ADMIN_PASSWORD: randomBytes(24).toString('hex'),
  CHROME_PATH: chromium.executablePath(),
}
function run(args) {
  const result = spawnSync('pnpm', args, { env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status || 1)
}
// A fresh database must not reuse cached public records from an earlier fixture run.
rmSync(path.resolve('.next-quality/cache'), { recursive: true, force: true })
run(['exec', 'tsx', 'scripts/prepare-test-db.ts'])
env.DATABASE_URI = testURI
// Measure the approved company and product compositions in the isolated quality database.
// Browser tests still set up and restore this content explicitly.
if (mode === 'performance') {
  run(['exec', 'tsx', 'scripts/apply-about-design.ts'])
  run(['exec', 'tsx', 'scripts/apply-culinaire-kitchen-design.ts'])
}
run(['build'])
run(mode === 'e2e' ? ['exec', 'playwright', 'test', ...process.argv.slice(3)] : ['exec', 'lhci', 'autorun'])
