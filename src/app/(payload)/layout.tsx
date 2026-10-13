import config from '@payload-config'
import '@payloadcms/next/css'
import '../../styles/admin.css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { ReactNode } from 'react'

import { importMap } from './admin/importMap.js'

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  if (args.name === 'schedule-publish') return { error: 'Use the Publish tab to schedule content.' }
  return handleServerFunctions({ ...args, config, importMap })
}

export default function PayloadLayout({ children }: { children: ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
