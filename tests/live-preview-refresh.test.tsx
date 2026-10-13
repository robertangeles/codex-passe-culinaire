import { describe, expect, it } from 'vitest'
import { isTrustedPreviewMessage, resolveSameOriginServerURL } from '../src/components/LivePreviewRefresh'

const origin = 'https://passeculinaire.test'
const parent = {} as Window
const payloadMessage = { type: 'payload-document-event', data: { id: 42 } }

function message(overrides: Partial<MessageEvent<unknown>> = {}): Pick<MessageEvent<unknown>, 'data' | 'origin' | 'source'> {
  return { data: payloadMessage, origin, source: parent, ...overrides }
}

describe('live preview refresh trust boundary', () => {
  it('uses the current origin by default and accepts only a same-origin configured URL', () => {
    expect(resolveSameOriginServerURL(undefined, origin)).toBe(origin)
    expect(resolveSameOriginServerURL(origin, origin)).toBe(origin)
    expect(resolveSameOriginServerURL('https://other.test', origin)).toBeNull()
    expect(resolveSameOriginServerURL('https://user@passeculinaire.test', origin)).toBeNull()
  })

  it('accepts a Payload save message only from the same-origin parent window', () => {
    expect(isTrustedPreviewMessage(message(), parent, origin)).toBe(true)
    expect(isTrustedPreviewMessage(message({ origin: 'https://other.test' }), parent, origin)).toBe(false)
    expect(isTrustedPreviewMessage(message({ source: {} as Window }), parent, origin)).toBe(false)
    expect(isTrustedPreviewMessage(message({ data: { type: 'other-message' } }), parent, origin)).toBe(false)
  })
})
