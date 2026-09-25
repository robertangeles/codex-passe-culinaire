import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  expireTime: 87000,
  async rewrites() {
    return { beforeFiles: [
      { source: '/sitemap-:kind(pages|posts|taxonomies|authors|services|training).xml', destination: '/sitemaps/:kind' },
      { source: '/journal/:slug.md', destination: '/markdown/:slug' },
    ] }
  },
}

export default withPayload(nextConfig)
