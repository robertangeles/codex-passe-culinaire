import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = { expireTime: 87000 }

export default withPayload(nextConfig)
