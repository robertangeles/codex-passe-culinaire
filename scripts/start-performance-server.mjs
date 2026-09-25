import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const caddy = process.env.CADDY_BIN || (existsSync('.local/bin/caddy') ? path.resolve('.local/bin/caddy') : 'caddy')
mkdirSync('.local/quality-caddy', { recursive: true })
const source = readFileSync('deploy/Caddyfile', 'utf8')
if (!source.startsWith('{')) throw new Error('Expected the deployment Caddy global options block.')
const configPath = path.resolve('.local/quality.Caddyfile')
// Keep the deployment handlers and compression; isolate local certificates and
// never install a development CA into the machine's trust store.
writeFileSync(configPath, source.replace(/^\{/, `{
  skip_install_trust
  auto_https disable_redirects
  storage file_system {
    root ${JSON.stringify(path.resolve('.local/quality-caddy'))}
  }`))
const next = spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', '3100'], { stdio: ['ignore', 'pipe', 'pipe'] })
const proxy = spawn(caddy, ['run', '--config', configPath, '--adapter', 'caddyfile'], {
  env: { ...process.env, SITE_ADDRESS: 'https://localhost:3443', APP_ROOT: root, PORT: '3100', CADDY_ADMIN: 'off' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let nextReady = false
let proxyReady = false
let announced = false
let stopping = false
function output(child, chunk) {
  const text = chunk.toString()
  process.stdout.write(text)
  if (child === next && text.includes('Ready')) nextReady = true
  if (child === proxy && text.includes('serving initial configuration')) proxyReady = true
  if (nextReady && proxyReady && !announced) {
    announced = true
    console.log('QUALITY_SERVER_READY')
  }
}
function stop(code) {
  if (stopping) return
  stopping = true
  process.exitCode = code
  next.kill('SIGTERM')
  proxy.kill('SIGTERM')
  setTimeout(() => { next.kill('SIGKILL'); proxy.kill('SIGKILL') }, 5000).unref()
}
for (const child of [next, proxy]) {
  child.stdout.on('data', chunk => output(child, chunk))
  child.stderr.on('data', chunk => output(child, chunk))
  child.on('error', () => { console.error('Could not start the local performance server. Check Node and Caddy.'); stop(1) })
  child.on('exit', code => { if (!stopping) stop(code || 1) })
}
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
