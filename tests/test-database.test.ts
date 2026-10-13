import { describe, expect, it } from 'vitest'
import { validateTestDatabase } from '../scripts/test-database.mjs'

const application = 'postgresql://test-user:private-value@127.0.0.1:55432/passe_culinaire'
const isolated = 'postgresql://test-user:private-value@localhost:55432/passe_culinaire_test'

describe('destructive test database guard', () => {
  it('accepts only a separately named local test database', () => {
    expect(validateTestDatabase(application, isolated)).toBe(isolated)
    expect(() => validateTestDatabase(isolated, isolated)).toThrow('separate local')
    expect(() => validateTestDatabase(isolated.replace('/passe_', '/%70asse_'), isolated)).toThrow('separate local')
    expect(() => validateTestDatabase(application, isolated.replace('localhost', 'remote.example'))).toThrow('separate local')
    expect(() => validateTestDatabase(application, isolated.replace('passe_culinaire_test', 'other'))).toThrow('separate local')
  })

  it('rejects libpq connection overrides before a reset can run', () => {
    for (const suffix of ['?host=remote.example', '?hostaddr=203.0.113.5', '?port=5432', '?dbname=production', '?options=-csearch_path=other', '#fragment']) {
      expect(() => validateTestDatabase(application, isolated + suffix)).toThrow('without query parameters or fragments')
      expect(() => validateTestDatabase(application + suffix, isolated)).toThrow('without query parameters or fragments')
    }
  })

  it('rejects other protocols and reports malformed URLs without exposing input', () => {
    expect(() => validateTestDatabase(application, isolated.replace('postgresql:', 'https:'))).toThrow('PostgreSQL')
    expect(() => validateTestDatabase(application, 'private-value')).toThrow(/^DATABASE_URI and TEST_DATABASE_URI must be PostgreSQL URLs\.$/u)
    expect(() => validateTestDatabase(undefined, isolated)).toThrow('PostgreSQL URLs')
  })
})
