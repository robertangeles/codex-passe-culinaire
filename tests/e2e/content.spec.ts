import { randomUUID } from 'node:crypto'
import { expect, test, type APIRequestContext } from '@playwright/test'

type JsonRecord = Record<string, unknown>

const record = (value: unknown): JsonRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a JSON object.')
  return value as JsonRecord
}

const responseDoc = (value: unknown): JsonRecord => {
  const body = record(value)
  return body.doc && typeof body.doc === 'object' ? record(body.doc) : body
}

const relationId = (doc: JsonRecord): string | number => {
  const id = doc.id
  if (typeof id !== 'string' && typeof id !== 'number') throw new Error('The API response did not include a document ID.')
  return id
}

const lexicalParagraph = (text: string) => ({
  root: {
    type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
    children: [{
      type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
      children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
    }],
  },
})

async function signIn(request: APIRequestContext) {
  const email = process.env.ROB_ADMIN_EMAIL
  const password = process.env.ROB_ADMIN_PASSWORD
  if (!email || !password) throw new Error('The generated admin fixture credentials are required.')
  const login = await request.post('/api/users/login', { data: { email, password } })
  expect(login.status()).toBe(200)
  const body = record(await login.json())
  if (typeof body.token !== 'string') throw new Error('The admin login response did not include a token.')
  const userId = record(body.user).id
  if (typeof userId !== 'string' && typeof userId !== 'number') throw new Error('The admin login response did not include a user ID.')
  return { headers: { Authorization: 'Bearer ' + body.token }, userId }
}

async function runPublicationJobs(request: APIRequestContext) {
  const secret = process.env.CRON_SECRET
  if (!secret) throw new Error('The generated cron fixture secret is required.')
  const response = await request.post('/api/jobs/run', { headers: { Authorization: 'Bearer ' + secret } })
  expect(response.status()).toBe(200)
}

test('draft preview, publication, public exports and unpublishing stay in sync', async ({ page, request }) => {
  const admin = await signIn(request)
  const headers = admin.headers
  const marker = randomUUID().replaceAll('-', '')
  const postSlug = 'journal-flow-' + marker
  const pageSlug = 'search-flow-' + marker
  const categorySlug = 'workflow-category-' + marker
  const tagSlug = 'workflow-tag-' + marker
  const paragraph = 'Temporary content workflow paragraph ' + marker + ' records prep components before service.'
  const searchPhrase = 'prep components ' + marker
  let postId: string | number | undefined
  let pageId: string | number | undefined
  let categoryId: string | number | undefined
  let tagId: string | number | undefined

  try {
    const categoryResponse = await request.post('/api/categories', { headers, data: { name: 'Workflow ' + marker, slug: categorySlug } })
    expect(categoryResponse.status()).toBe(201)
    categoryId = relationId(responseDoc(await categoryResponse.json()))

    const tagResponse = await request.post('/api/tags', { headers, data: { name: 'Workflow ' + marker, slug: tagSlug } })
    expect(tagResponse.status()).toBe(201)
    tagId = relationId(responseDoc(await tagResponse.json()))

    const postResponse = await request.post('/api/posts', {
      headers,
      data: {
        title: 'Content workflow ' + marker,
        slug: postSlug,
        excerpt: 'A temporary journal entry about ' + searchPhrase + '.',
        body: lexicalParagraph(paragraph),
        authors: [admin.userId], categories: [categoryId], tags: [tagId],
        seo: { metaDescription: 'Temporary publication workflow entry ' + marker + '.' },
        _status: 'draft',
      },
    })
    expect(postResponse.status()).toBe(201)
    postId = relationId(responseDoc(await postResponse.json()))

    const pageResponse = await request.post('/api/pages', {
      headers,
      data: {
        title: 'Search workflow ' + marker,
        slug: pageSlug,
        layout: [
          { blockType: 'hero', heading: 'Search workflow ' + marker, style: 'quiet' },
          { blockType: 'plainStatement', statement: 'A temporary page for ' + searchPhrase + '.' },
        ],
        seo: { metaDescription: 'Temporary search workflow page ' + marker + '.' },
        _status: 'draft',
      },
    })
    expect(pageResponse.status()).toBe(201)
    pageId = relationId(responseDoc(await pageResponse.json()))

    expect((await page.goto('/journal/' + postSlug))?.status()).toBe(404)
    expect((await page.goto('/' + pageSlug))?.status()).toBe(404)

    const previewUrl = '/api/preview?collection=posts&slug=' + encodeURIComponent(postSlug)
    const preview = await request.get(previewUrl, { headers, maxRedirects: 0 })
    expect(preview.status()).toBe(303)
    expect(preview.headers()['cache-control']).toMatch(/private.*no-store/u)
    expect(preview.headers().location).toBe('/journal/' + postSlug)
    const previewHTML = await request.get('/journal/' + postSlug, { headers })
    expect(previewHTML.headers()['cache-control']).toMatch(/private|no-store/u)
    expect(await previewHTML.text()).toContain(paragraph)
    await request.get('/api/preview?exit=1', { maxRedirects: 0 })
    const anonymousPreview = await page.goto(previewUrl)
    expect(anonymousPreview?.status()).toBe(401)
    expect(anonymousPreview?.headers()['cache-control']).toMatch(/private.*no-store/u)

    for (const [collection, id] of [['posts', postId], ['pages', pageId]] as const) {
      const publish = await request.patch('/api/' + collection + '/' + id, {
        headers,
        data: { _status: 'published', publishedAt: new Date().toISOString() },
      })
      expect(publish.status()).toBe(200)
    }
    await runPublicationJobs(request)

    const articleResponse = await page.goto('/journal/' + postSlug)
    expect(articleResponse?.status()).toBe(200)
    expect(await articleResponse?.text()).toContain(paragraph)
    await expect(page.getByText(paragraph, { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Rob Angeles' })).toHaveAttribute('href', '/journal/author/rob-angeles')
    await expect(page.locator('a[href="/journal/category/' + categorySlug + '"]')).toBeVisible()
    await expect(page.locator('a[href="/journal/tag/' + tagSlug + '"]')).toBeVisible()

    for (const path of ['/journal/author/rob-angeles', '/journal/category/' + categorySlug, '/journal/tag/' + tagSlug]) {
      const listing = await request.get(path)
      expect(listing.status()).toBe(200)
      expect(await listing.text()).toContain(postSlug)
    }

    const searchResponse = await page.goto('/search?q=' + encodeURIComponent(searchPhrase))
    expect(searchResponse?.status()).toBe(200)
    await expect(page.getByRole('link', { name: 'Content workflow ' + marker })).toHaveAttribute('href', '/journal/' + postSlug)
    await expect(page.getByRole('link', { name: 'Search workflow ' + marker })).toHaveAttribute('href', '/' + pageSlug)

    for (const path of ['/services', '/training']) {
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      expect(response.headers()['content-type'], path).toMatch(/text\/html/u)
    }
    expect((await request.get('/services/ai-for-the-pass')).status()).toBe(404)
    expect((await request.get('/training/kitchen-workshop')).status()).toBe(404)

    const endpointChecks = [
      { path: '/sitemap.xml', type: /application\/xml/u, slug: 'sitemap-posts.xml' },
      { path: '/sitemap-posts.xml', type: /application\/xml/u, slug: postSlug },
      { path: '/sitemap-pages.xml', type: /application\/xml/u, slug: pageSlug },
      { path: '/feed.xml', type: /application\/rss\+xml/u, slug: postSlug },
      { path: '/feed.json', type: /application\/feed\+json/u, slug: postSlug },
      { path: '/llms.txt', type: /text\/markdown/u },
      { path: '/llms-full.txt', type: /text\/markdown/u, slug: postSlug },
      { path: '/journal/' + postSlug + '.md', type: /text\/markdown/u, slug: postSlug },
    ] as const
    for (const endpoint of endpointChecks) {
      const response = await request.get(endpoint.path)
      expect(response.status(), endpoint.path).toBe(200)
      expect(response.headers()['content-type'], endpoint.path).toMatch(endpoint.type)
      if ('slug' in endpoint && endpoint.slug) expect(await response.text(), endpoint.path).toContain(endpoint.slug)
    }

    for (const [collection, id] of [['posts', postId], ['pages', pageId]] as const) {
      const unpublish = await request.patch('/api/' + collection + '/' + id, { headers, data: { _status: 'draft' } })
      expect(unpublish.status()).toBe(200)
    }
    await runPublicationJobs(request)

    const postExports = ['/sitemap-posts.xml', '/feed.xml', '/feed.json', '/llms-full.txt', '/journal/' + postSlug + '.md']
    for (const path of postExports) expect(await (await request.get(path)).text(), path).not.toContain(postSlug)
    expect(await (await request.get('/sitemap-pages.xml')).text()).not.toContain(pageSlug)
    expect((await request.get('/journal/' + postSlug)).status()).toBe(404)
    expect((await request.get('/' + pageSlug)).status()).toBe(404)
  } finally {
    if (postId !== undefined) await request.delete('/api/posts/' + postId, { headers })
    if (pageId !== undefined) await request.delete('/api/pages/' + pageId, { headers })
    if (tagId !== undefined) await request.delete('/api/tags/' + tagId, { headers })
    if (categoryId !== undefined) await request.delete('/api/categories/' + categoryId, { headers })
    await runPublicationJobs(request)
  }
})

test('contact form confirms that an enquiry was saved without claiming email delivery', async ({ page, request }) => {
  const admin = await signIn(request)
  const marker = randomUUID()
  let formRequestId: string | undefined
  let submissionId: string | number | undefined
  try {
    await page.goto('/contact')
    const form = page.locator('form').filter({ has: page.getByRole('button', { name: 'Send message' }) })
    await form.getByLabel('Your name').fill('Workflow test ' + marker)
    await form.getByLabel('Email address').fill('workflow-' + marker + '@example.test')
    await form.getByLabel('Venue (optional)').fill('Temporary workflow fixture')
    await form.getByLabel('Your role').selectOption('chef')
    await form.getByLabel('What can we help with?').selectOption('training')
    await form.getByLabel('Message').fill('Temporary contact workflow fixture ' + marker + '.')
    formRequestId = await form.locator('input[name="requestId"]').inputValue()
    expect(formRequestId).toMatch(/^[a-f0-9-]{36}$/u)
    await form.getByRole('button', { name: 'Send message' }).click()

    const confirmation = page.getByRole('status').filter({ has: page.getByRole('heading', { name: 'Message received' }) })
    await expect(confirmation).toBeVisible()
    await expect(confirmation).toContainText('Your message has been saved. We could not send the email notification.')
    await expect(confirmation).toContainText('You do not need to send it again.')
    const receipt = await confirmation.locator('p').filter({ hasText: /^Reference /u }).textContent()
    const receiptId = receipt?.match(/^Reference (.+)$/u)?.[1]
    if (receiptId && /^[0-9]+$/u.test(receiptId)) submissionId = Number(receiptId)
    else submissionId = receiptId
    expect(submissionId).toBeTruthy()
  } finally {
    if (submissionId !== undefined) {
      const removed = await request.delete('/api/form-submissions/' + submissionId, { headers: admin.headers })
      expect([200, 204]).toContain(removed.status())
    } else if (formRequestId) {
      const lookup = await request.get('/api/form-submissions?where[requestId][equals]=' + encodeURIComponent(formRequestId), { headers: admin.headers })
      if (lookup.ok()) {
        const body = record(await lookup.json())
        if (Array.isArray(body.docs)) {
          for (const value of body.docs) {
            const id = record(value).id
            if (typeof id === 'string' || typeof id === 'number') await request.delete('/api/form-submissions/' + id, { headers: admin.headers })
          }
        }
      }
    }
  }
})
