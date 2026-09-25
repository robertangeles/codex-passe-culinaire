import { spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'

process.loadEnvFile('.env')

const appUri = process.env.DATABASE_URI
const testUri = process.env.TEST_DATABASE_URI
if (!appUri || !testUri) throw new Error('DATABASE_URI and TEST_DATABASE_URI are required for integration tests.')
const app = new URL(appUri)
const test = new URL(testUri)
if (decodeURIComponent(app.pathname) === decodeURIComponent(test.pathname) || test.pathname !== '/passe_culinaire_test' || !['127.0.0.1', 'localhost'].includes(test.hostname))
  throw new Error('TEST_DATABASE_URI must target the separate local passe_culinaire_test database.')

const mediaDir = path.resolve('.local/test-media')
rmSync(mediaDir, { recursive: true, force: true })
const env = { ...process.env, DATABASE_URI: testUri, MEDIA_DIR: mediaDir, CONTACT_TO_ADDRESS: '', SMTP_HOST: '', RESEND_API_KEY: '' }
function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}.`)
}

run('psql', [testUri, '-v', 'ON_ERROR_STOP=1', '-c', 'SET client_min_messages = warning; DROP SCHEMA public CASCADE; CREATE SCHEMA public;'])
run('pnpm', ['migrate'])
run('pnpm', ['seed'])
run('pnpm', ['seed'])
