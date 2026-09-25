import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ list: vi.fn(), author: vi.fn(), taxonomy: vi.fn(), shell: vi.fn() }))
vi.mock('../src/lib/public-content', () => ({
  listPublicContent: mocks.list, getPublicAuthor: mocks.author, getPublicTaxonomy: mocks.taxonomy, getPublicShell: mocks.shell,
}))
import { getJournalListing, parseListingPage } from '../src/lib/journal-listing'

describe('journal listing views', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.list.mockResolvedValue({ docs: [], totalPages: 0, page: 1 })
    mocks.shell.mockResolvedValue({ siteSettings: {} })
  })
  it('bounds canonical page segments without accepting alternate number encodings', () => {
    expect(parseListingPage('1')).toBe(1)
    expect(parseListingPage('1000')).toBe(1000)
    for (const value of ['0', '01', '-2', '1e2', '2.0', '1001', '999999']) expect(parseListingPage(value)).toBeNull()
  })
  it('filters author and taxonomy lists by their public relationship IDs', async () => {
    mocks.author.mockResolvedValue({ id: 7, name: 'Author', slug: 'author', noIndex: true })
    mocks.taxonomy.mockResolvedValue({ id: 9, name: 'Pastry', slug: 'pastry' })
    const author = await getJournalListing('author', 'author')
    expect(author?.noIndex).toBe(true)
    expect(mocks.list).toHaveBeenLastCalledWith('posts', expect.objectContaining({ where: { authors: { in: [7] } } }))
    await getJournalListing('category', 'pastry')
    expect(mocks.list).toHaveBeenLastCalledWith('posts', expect.objectContaining({ where: { categories: { in: [9] } } }))
  })
  it('distinguishes a valid empty first page from missing profiles and out-of-range pages', async () => {
    expect(await getJournalListing('journal')).not.toBeNull()
    expect(await getJournalListing('journal', '', 2)).toBeNull()
    mocks.author.mockResolvedValue(null)
    mocks.list.mockClear()
    expect(await getJournalListing('author', 'private-author')).toBeNull()
    expect(mocks.list).not.toHaveBeenCalled()
  })
  it('propagates database failures instead of presenting an empty list', async () => {
    mocks.list.mockRejectedValue(new Error('Database unavailable'))
    await expect(getJournalListing('journal')).rejects.toThrow('Database unavailable')
  })
})
