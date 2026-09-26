import { readFile, writeFile } from 'node:fs/promises'
const template = await readFile(new URL('./index.template.html', import.meta.url), 'utf8')
const actors = await readFile(new URL('./actors.svg', import.meta.url), 'utf8')
await writeFile(new URL('./index.html', import.meta.url), template.replace('<!-- ACTORS -->', actors))
