import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: { alias: { '@payload-config': fileURLToPath(new URL('./src/payload.config.ts', import.meta.url)) } },
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environment: 'node',
    env: { NEXT_PUBLIC_SERVER_URL: 'https://passeculinaire.test' },
  },
})
