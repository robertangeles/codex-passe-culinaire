'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

type PreviewMessage = Pick<MessageEvent<unknown>, 'data' | 'origin' | 'source'>

export function resolveSameOriginServerURL(serverURL: string | undefined, currentOrigin: string): string | null {
  try {
    const current = new URL(currentOrigin)
    if (current.origin !== currentOrigin || !['http:', 'https:'].includes(current.protocol)) return null
    if (serverURL === undefined) return current.origin

    const candidate = new URL(serverURL)
    if (candidate.origin !== current.origin || candidate.username || candidate.password) return null
    return candidate.origin
  } catch {
    return null
  }
}

export function isTrustedPreviewMessage(event: PreviewMessage, parent: Window, serverOrigin: string): boolean {
  const data = event.data
  return event.source === parent
    && event.origin === serverOrigin
    && typeof data === 'object'
    && data !== null
    && 'type' in data
    && data.type === 'payload-document-event'
}

function isPayloadDocumentMessage(data: unknown): boolean {
  return typeof data === 'object'
    && data !== null
    && 'type' in data
    && data.type === 'payload-document-event'
}

export function LivePreviewRefresh({ serverURL }: { serverURL?: string }) {
  const router = useRouter()
  const serverOrigin = typeof window === 'undefined'
    ? null
    : resolveSameOriginServerURL(serverURL, window.location.origin)
  const refresh = useCallback(() => router.refresh(), [router])

  useEffect(() => {
    if (!serverOrigin) return

    const guardUntrustedPayloadMessages = (event: MessageEvent<unknown>) => {
      if (isPayloadDocumentMessage(event.data) && !isTrustedPreviewMessage(event, window.parent, serverOrigin)) {
        event.stopImmediatePropagation()
      }
    }

    window.addEventListener('message', guardUntrustedPayloadMessages, true)
    return () => window.removeEventListener('message', guardUntrustedPayloadMessages, true)
  }, [serverOrigin])

  if (!serverOrigin) return null
  return <RefreshRouteOnSave refresh={refresh} serverURL={serverOrigin} />
}
