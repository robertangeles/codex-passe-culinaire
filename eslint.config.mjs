import { defineConfig, globalIgnores } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  { rules: { '@typescript-eslint/no-explicit-any': 'error' } },
  globalIgnores(['.next/**', 'node_modules/**', 'src/payload-types.ts']),
])
