import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseEnv } from 'node:util'

// Local routing policy, not a measured accuracy guarantee.
export const POLICY = Object.freeze({ model: 'jev-1.13.0', yes: 0.9, no: 0.1, maxBytes: 65536, maxQuestions: 16 })
const endpoint = 'https://api.typesafe.ai/v1/systemone'
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)

export async function evaluateDecision(input, { apiKey = '', request = fetch } = {}) {
  if (!record(input) || !(typeof input.state === 'string' && input.state.trim() || record(input.state) || Array.isArray(input.state)) || !record(input.questions)) {
    throw new Error('Provide a non-empty text state or JSON object/array, and a questions object.')
  }
  const entries = Object.entries(input.questions)
  if (!entries.length || entries.length > POLICY.maxQuestions || entries.some(([id, question]) => !/^[a-z][a-z0-9_]{0,63}$/u.test(id) || typeof question !== 'string' || !question.trim())) {
    throw new Error('Provide 1–16 named yes/no questions as non-empty strings; use lowercase IDs.')
  }
  const body = JSON.stringify({
    model: POLICY.model,
    state: input.state,
    questions: Object.fromEntries(entries.map(([id, question]) => [id, { type: 'noul', instructions: question }])),
  })
  if (Buffer.byteLength(body) > POLICY.maxBytes) throw new Error('The request exceeds the 64 KiB limit. Supply a smaller relevant excerpt.')
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('Set TYPESAFE_API_KEY in the environment or .local/typesafe.env.')

  let response
  try {
    response = await request(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
      body, redirect: 'error', signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error('TypeSafe could not be reached or timed out. Return this decision to Sol.')
  }
  // Never echo remote error bodies, request state or credentials.
  if (!response.ok) throw new Error(`TypeSafe returned HTTP ${response.status}. Return this decision to Sol; do not retry in a loop.`)
  let data
  try { data = await response.json() } catch { throw new Error('TypeSafe returned invalid JSON. Return this decision to Sol.') }
  if (!record(data) || data.model !== POLICY.model || !record(data.answers)) throw new Error('TypeSafe returned an unexpected model or response shape.')
  const decisions = Object.fromEntries(entries.map(([id]) => {
    const answer = data.answers[id]
    const probabilityYes = answer?.noul
    if (!record(answer) || answer.type !== 'noul' || typeof probabilityYes !== 'number' || !Number.isFinite(probabilityYes) || probabilityYes < 0 || probabilityYes > 1) {
      throw new Error('TypeSafe returned a missing or invalid probability. Return this decision to Sol.')
    }
    return [id, { decision: probabilityYes >= POLICY.yes ? 'yes' : probabilityYes <= POLICY.no ? 'no' : 'review', probabilityYes }]
  }))
  return { status: 'ok', model: data.model, decisions }
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log('Read JSON {"state":"relevant evidence","questions":{"is_relevant":"Does this concern the task?"}} from stdin. Returns yes/no/review and probabilityYes. Key: TYPESAFE_API_KEY or .local/typesafe.env. Sends supplied evidence to TypeSafe; never supply secrets or private customer data. No actions are executed.')
    return
  }
  try {
    let raw = ''
    process.stdin.setEncoding('utf8')
    for await (const chunk of process.stdin) {
      raw += chunk.toString()
      if (Buffer.byteLength(raw) > POLICY.maxBytes) throw new Error('Input exceeds the 64 KiB limit.')
    }
    let input
    try { input = JSON.parse(raw) } catch { throw new Error('Input must be a JSON object with state and questions.') }
    let apiKey = process.env.TYPESAFE_API_KEY
    if (!apiKey?.trim()) {
      try { apiKey = parseEnv(await readFile(new URL('../.local/typesafe.env', import.meta.url), 'utf8')).TYPESAFE_API_KEY } catch (error) {
        if (error.code !== 'ENOENT') throw new Error('The private TypeSafe key file could not be read.')
      }
    }
    console.log(JSON.stringify(await evaluateDecision(input, { apiKey })))
  } catch (error) {
    console.log(JSON.stringify({ status: 'unavailable', decision: 'review', reason: error.message }))
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main()
