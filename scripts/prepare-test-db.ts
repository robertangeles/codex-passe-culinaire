import { spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'
import { validateTestDatabase } from './test-database.mjs'

process.loadEnvFile('.env')

const testUri = validateTestDatabase(process.env.DATABASE_URI, process.env.TEST_DATABASE_URI)

const mediaDir = path.resolve('.local/test-media')
rmSync(mediaDir, { recursive: true, force: true })
const env = {
  ...process.env,
  DATABASE_URI: testUri,
  MEDIA_DIR: mediaDir,
  MEDIA_STORAGE: 'local',
  MAIL_PROVIDER: 'smtp',
  RUN_JOBS: 'false',
  CONTACT_TO_ADDRESS: '',
  SMTP_HOST: '',
  RESEND_API_KEY: '',
}
function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}.`)
}

run('psql', [testUri, '-v', 'ON_ERROR_STOP=1', '-c', 'SET client_min_messages = warning; DROP SCHEMA public CASCADE; CREATE SCHEMA public;'])
run('pnpm', ['migrate'])
run('pnpm', ['seed'])
run('pnpm', ['seed'])
