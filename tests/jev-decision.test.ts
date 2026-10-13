import { describe, expect, it, vi } from 'vitest'
import { evaluateDecision, POLICY } from '../scripts/jev-decision.mjs'

const input = { state: 'A public kitchen article.', questions: { relevant: 'Is this about a kitchen?' } }
const reply = (probability: unknown) => new Response(JSON.stringify({ model: POLICY.model, answers: { relevant: { type: 'noul', noul: probability } } }))

describe('Jev decision tool', () => {
  it('sends typed questions to the fixed endpoint and preserves uncertainty at the policy boundaries', async () => {
    for (const [probability, decision] of [[0, 'no'], [0.1, 'no'], [0.11, 'review'], [0.5, 'review'], [0.89, 'review'], [0.9, 'yes'], [1, 'yes']] as const) {
      const request = vi.fn(async () => reply(probability))
      const result = await evaluateDecision(input, { apiKey: 'test-key', request })
      expect(result.decisions.relevant).toEqual({ decision, probabilityYes: probability })
      expect(request).toHaveBeenCalledWith('https://api.typesafe.ai/v1/systemone', expect.objectContaining({
        redirect: 'error', method: 'POST',
        body: JSON.stringify({ model: POLICY.model, state: input.state, questions: { relevant: { type: 'noul', instructions: input.questions.relevant } } }),
      }))
    }
  })

  it('rejects missing credentials, malformed questions and oversized state before any network call', async () => {
    const request = vi.fn()
    await expect(evaluateDecision(input, { request })).rejects.toThrow('TYPESAFE_API_KEY')
    for (const value of [{ ...input, questions: {} }, { ...input, questions: { relevant: 3 } }, { ...input, state: true }, { ...input, state: 'x'.repeat(POLICY.maxBytes) }]) {
      await expect(evaluateDecision(value, { apiKey: 'test-key', request })).rejects.toThrow()
    }
    expect(request).not.toHaveBeenCalled()
  })

  it('rejects partial, invalid or mismatched model results instead of turning them into no', async () => {
    for (const probability of [-1, 1.1, null, '0.95']) {
      await expect(evaluateDecision(input, { apiKey: 'test-key', request: async () => reply(probability) })).rejects.toThrow('invalid probability')
    }
    for (const data of [{ model: POLICY.model, answers: {} }, { model: 'another-model', answers: {} }]) {
      await expect(evaluateDecision(input, { apiKey: 'test-key', request: async () => new Response(JSON.stringify(data)) })).rejects.toThrow()
    }
    const batch = { ...input, questions: { ...input.questions, another: 'Does it mention pastry?' } }
    await expect(evaluateDecision(batch, { apiKey: 'test-key', request: async () => reply(1) })).rejects.toThrow('invalid probability')
  })

  it('returns safe failures for auth, throttling, timeout and invalid JSON without echoing remote data', async () => {
    for (const status of [401, 429, 529]) {
      const request = vi.fn(async () => new Response('private upstream details', { status }))
      await expect(evaluateDecision(input, { apiKey: 'test-key', request })).rejects.toThrow(`HTTP ${status}`)
      expect(request).toHaveBeenCalledOnce()
    }
    await expect(evaluateDecision(input, { apiKey: 'test-key', request: async () => { throw new Error('secret request details') } })).rejects.toThrow('could not be reached')
    await expect(evaluateDecision(input, { apiKey: 'test-key', request: async () => new Response('private upstream details') })).rejects.toThrow('invalid JSON')
  })
})
