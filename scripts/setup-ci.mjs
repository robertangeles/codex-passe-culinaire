import { randomBytes } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'

if (process.env.GITHUB_ACTIONS !== 'true' || existsSync('.env'))
  throw new Error('CI fixture setup requires a fresh GitHub Actions workspace without .env.')
const password = randomBytes(24).toString('hex')
const sql = `CREATE ROLE passe_ci LOGIN PASSWORD '${password}';
CREATE DATABASE passe_culinaire OWNER passe_ci;
CREATE DATABASE passe_culinaire_test OWNER passe_ci;`
const result = spawnSync('sudo', ['-u', 'postgres', 'psql', '-p', '55432', '-v', 'ON_ERROR_STOP=1'], { input: sql, stdio: ['pipe', 'ignore', 'pipe'] })
if (result.error || result.status !== 0) throw new Error('Could not initialise the native CI database cluster.')
const values = {
  DATABASE_URI: `postgresql://passe_ci:${password}@127.0.0.1:55432/passe_culinaire`,
  TEST_DATABASE_URI: `postgresql://passe_ci:${password}@127.0.0.1:55432/passe_culinaire_test`,
  PAYLOAD_SECRET: randomBytes(32).toString('hex'), REVALIDATE_SECRET: randomBytes(32).toString('hex'), CRON_SECRET: randomBytes(32).toString('hex'),
  NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
  ROB_ADMIN_EMAIL: 'rob-ci@example.test', ALEX_ADMIN_EMAIL: 'alex-ci@example.test',
  ROB_ADMIN_PASSWORD: randomBytes(24).toString('hex'), ALEX_ADMIN_PASSWORD: randomBytes(24).toString('hex'),
  MEDIA_STORAGE: 'local', MEDIA_DIR: './media', MAIL_PROVIDER: 'smtp', SMTP_HOST: '', CONTACT_TO_ADDRESS: '', RUN_JOBS: 'false', INDEXNOW_KEY: '',
}
writeFileSync('.env', Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { mode: 0o600, flag: 'wx' })
console.log('Created isolated CI fixture databases and private configuration.')
