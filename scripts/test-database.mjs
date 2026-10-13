/**
 * Guard the effective libpq connection before destructive test preparation.
 * Query parameters can override host, port and database despite the URL authority.
 * @param {string | undefined} applicationURI
 * @param {string | undefined} testURI
 */
export function validateTestDatabase(applicationURI, testURI) {
  let application
  let test
  try {
    application = new URL(applicationURI || '')
    test = new URL(testURI || '')
  } catch {
    throw new Error('DATABASE_URI and TEST_DATABASE_URI must be PostgreSQL URLs.')
  }
  for (const connection of [application, test]) {
    if (!['postgres:', 'postgresql:'].includes(connection.protocol) || connection.search || connection.hash)
      throw new Error('Test preparation requires PostgreSQL URLs without query parameters or fragments.')
  }
  if (decodeURIComponent(application.pathname) === decodeURIComponent(test.pathname) || test.pathname !== '/passe_culinaire_test'
    || !['127.0.0.1', 'localhost'].includes(test.hostname))
    throw new Error('TEST_DATABASE_URI must identify the separate local passe_culinaire_test database.')
  return test.href
}
