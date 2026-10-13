type Policy = {
  _status?: 'draft' | 'published' | null
  noIndex?: boolean | null
  excludeFromSitemap?: boolean | null
  seo?: { noIndex?: boolean | null; excludeFromSitemap?: boolean | null } | null
}

export function isIndexable(document: Policy): boolean {
  return document.noIndex !== true && document.seo?.noIndex !== true
}

export function isPublishedExport(document: Policy): boolean {
  return document._status === 'published' && isIndexable(document)
}

export function isInSitemap(document: Policy, publicationRequired = true): boolean {
  return (!publicationRequired || document._status === 'published') && isIndexable(document)
    && document.excludeFromSitemap !== true && document.seo?.excludeFromSitemap !== true
}
