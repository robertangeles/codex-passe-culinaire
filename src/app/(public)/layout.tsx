import type { Metadata } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'

import PublicShell from '../../components/PublicShell'
import '../../styles/globals.css'
import { themeInitScript } from '../../lib/theme-script'

const fraunces = localFont({
  src: '../../fonts/fraunces-latin-variable.woff2',
  display: 'swap',
  variable: '--loaded-fraunces',
  weight: '100 900',
})
const inter = localFont({
  src: '../../fonts/inter-latin-variable.woff2',
  display: 'swap',
  variable: '--loaded-inter',
  weight: '100 900',
})
const jetbrainsMono = localFont({
  src: '../../fonts/jetbrains-mono-latin-variable.woff2',
  display: 'swap',
  variable: '--loaded-jetbrains-mono',
  preload: false,
  weight: '100 800',
})

export const metadata: Metadata = {
  title: 'Passe Culinaire',
  description: 'Passe Culinaire is a Melbourne company for chefs and restaurant owners.',
}

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-AU"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  )
}
