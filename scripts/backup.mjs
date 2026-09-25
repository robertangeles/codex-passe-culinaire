import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// The systemd wrapper pauses the app and workers before this process starts.
const { DATABASE_URI, MEDIA_DIR, BACKUP_DIR } = process.env
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS || 14)
if (!DATABASE_URI || !MEDIA_DIR || !BACKUP_DIR || !path.isAbsolute(MEDIA_DIR) || !path.isAbsolute(BACKUP_DIR)
  || process.env.BACKUP_WRITES_PAUSED !== 'true' || (process.env.MEDIA_STORAGE || 'local') !== 'local'
  || !Number.isInteger(retentionDays) || retentionDays < 1)
  throw new Error('Backup requires a database, absolute media/backup paths, paused writers, local storage and positive retention days.')
mkdirSync(BACKUP_DIR, { recursive: true, mode: 0o700 })
const mediaPath = realpathSync(MEDIA_DIR)
const backupPath = realpathSync(BACKUP_DIR)
if (!statSync(mediaPath).isDirectory() || backupPath.startsWith(mediaPath + path.sep) || backupPath === mediaPath)
  throw new Error('Backup directory must be outside the media directory, including symlink targets.')
let database
try { database = new URL(DATABASE_URI) } catch { throw new Error('Backup database URL is invalid.') }
if (!['postgres:', 'postgresql:'].includes(database.protocol) || database.search || database.hash
  || !['localhost', '127.0.0.1'].includes(database.hostname) || !database.pathname.slice(1))
  throw new Error('Native backup requires a local PostgreSQL URL without query overrides.')
const databaseEnv = {
  PGHOST: database.hostname, PGPORT: database.port || '5432',
  PGDATABASE: decodeURIComponent(database.pathname.slice(1)),
  PGUSER: decodeURIComponent(database.username), PGPASSWORD: decodeURIComponent(database.password),
  PGCONNECT_TIMEOUT: '10',
}
const started = new Date()
const name = started.toISOString().replace(/[:.]/g, '-')
const temporary = path.join(BACKUP_DIR, `.partial-${name}`)
const destination = path.join(BACKUP_DIR, name)
mkdirSync(temporary, { mode: 0o700 })
function run(command, args) {
  const result = spawnSync(command, args, {
    env: { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('PG'))), ...databaseEnv }, stdio: ['ignore', 'ignore', 'pipe'],
    timeout: 30 * 60 * 1000,
  })
  if (result.error || result.status !== 0) throw new Error(`${command} failed; backup was not completed.`)
}
async function checksum(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}
try {
  run('pg_dump', ['--format=custom', '--no-owner', '--no-acl', '--file', path.join(temporary, 'database.dump')])
  run('tar', ['-czf', path.join(temporary, 'media.tar.gz'), '-C', MEDIA_DIR, '.'])
  const files = {}
  for (const file of ['database.dump', 'media.tar.gz']) files[file] = await checksum(path.join(temporary, file))
  writeFileSync(path.join(temporary, 'manifest.json'), JSON.stringify({ kind: 'passe-culinaire-backup-v1', startedAt: started.toISOString(), completedAt: new Date().toISOString(), release: process.env.RELEASE_ID || 'unspecified', files }, null, 2), { mode: 0o600 })
  renameSync(temporary, destination)
  console.log(`Backup complete: ${destination}`)
  // Only remove completed backups created by this script, after a new success.
  for (const entry of readdirSync(BACKUP_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d{4}-\d\d-\d\dT\d\d-\d\d-\d\d-\d{3}Z$/.test(entry.name)) continue
    const directory = path.join(BACKUP_DIR, entry.name)
    if (!existsSync(path.join(directory, 'manifest.json'))) continue
    let manifest
    try { manifest = JSON.parse(readFileSync(path.join(directory, 'manifest.json'), 'utf8')) } catch { continue }
    if (manifest?.kind === 'passe-culinaire-backup-v1' && Date.parse(manifest.completedAt) < started.getTime() - retentionDays * 86400000)
      rmSync(directory, { recursive: true })
  }
} catch (error) {
  rmSync(temporary, { recursive: true, force: true })
  console.error(error instanceof Error ? error.message : 'Backup failed.')
  process.exitCode = 1
}
