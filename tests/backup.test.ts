import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, expect, it } from 'vitest'

const temporary: string[] = []
afterEach(() => { for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true }) })

function fixture(fail = false) {
  const root = mkdtempSync(path.join(tmpdir(), 'passe-backup-')); temporary.push(root)
  const media = path.join(root, 'media'); const backups = path.join(root, 'backups'); const bin = path.join(root, 'bin')
  mkdirSync(media); mkdirSync(bin)
  writeFileSync(path.join(media, 'fixture.txt'), 'media fixture')
  writeFileSync(path.join(bin, 'pg_dump'), fail ? '#!/bin/sh\nexit 1\n' : '#!/bin/sh\n[ "$PGHOST" = localhost ] && [ "$PGDATABASE" = fixture ] && [ "$PGUSER" = fixture ] || exit 3\nprintf "dump fixture" > "$5"\n', { mode: 0o700 })
  const run = (paused = 'true') => spawnSync(process.execPath, ['scripts/backup.mjs'], {
    encoding: 'utf8', env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, DATABASE_URI: 'postgresql://fixture@localhost/fixture', MEDIA_DIR: media, BACKUP_DIR: backups, BACKUP_WRITES_PAUSED: paused, MEDIA_STORAGE: 'local' },
  })
  return { root, media, backups, run }
}

it('completes matching archives with checksums, and preserves unrelated files during retention', () => {
  const { backups, run } = fixture()
  mkdirSync(backups)
  writeFileSync(path.join(backups, 'keep.txt'), 'unrelated')
  const old = path.join(backups, '2000-01-01T00-00-00-000Z'); mkdirSync(old)
  writeFileSync(path.join(old, 'manifest.json'), JSON.stringify({ kind: 'passe-culinaire-backup-v1', completedAt: '2000-01-01T00:00:00Z' }))
  const damaged = path.join(backups, '2001-01-01T00-00-00-000Z'); mkdirSync(damaged)
  writeFileSync(path.join(damaged, 'manifest.json'), 'invalid JSON')
  const result = run()
  expect(result.status, result.stderr).toBe(0)
  const names = readdirSync(backups)
  expect(names).toContain('keep.txt')
  expect(names).not.toContain(path.basename(old))
  const completed = names.find(name => name !== 'keep.txt' && name !== path.basename(damaged))!
  const manifest = JSON.parse(readFileSync(path.join(backups, completed, 'manifest.json'), 'utf8'))
  expect(manifest.files['database.dump']).toMatch(/^[0-9a-f]{64}$/u)
  expect(manifest.files['media.tar.gz']).toMatch(/^[0-9a-f]{64}$/u)
  expect(spawnSync('tar', ['-tzf', path.join(backups, completed, 'media.tar.gz')], { encoding: 'utf8' }).stdout).toContain('fixture.txt')
})

it('does not report completion or leave an accepted archive after dump failure', () => {
  const { backups, run } = fixture(true)
  const result = run()
  expect(result.status).toBe(1)
  expect(result.stdout).not.toContain('Backup complete')
  expect(readdirSync(backups)).toEqual([])
})

it('refuses to start without a confirmed pause of writers', () => {
  const { run } = fixture()
  expect(run('false').status).not.toBe(0)
})


it('rejects a backup directory symlink into media before archiving', () => {
  const { media, backups, run } = fixture()
  const nested = path.join(media, 'nested-backups'); mkdirSync(nested)
  symlinkSync(nested, backups, 'dir')
  const result = run()
  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('including symlink targets')
  expect(readdirSync(nested)).toEqual([])
})
