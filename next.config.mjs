import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  expireTime: 87000,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async rewrites() {
    return { beforeFiles: [
      { source: '/sitemap-:kind(pages|posts|taxonomies|authors|services|training).xml', destination: '/sitemaps/:kind' },
      { source: '/journal/:slug.md', destination: '/markdown/:slug' },
    ] }
  },
}

const payloadConfig = withPayload(nextConfig)

const config = {
  ...payloadConfig,
  async headers() {
    // Payload needs colour-scheme hints in its editor. Keep that hint off
    // public routes to avoid restarting navigation.
    return (await payloadConfig.headers()).map(rule =>
      rule.source === '/:path*' && rule.headers.some(header => header.key.toLowerCase() === 'critical-ch')
        ? { ...rule, source: '/admin/:path*' }
        : rule,
    )
  },
}

export default config
