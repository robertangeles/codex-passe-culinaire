#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(root, 'assets');
const manifestPath = path.join(assets, 'manifest.json');
const temp = '/tmp/passe-atelier-render';
const output = path.join(root, 'kitchen-day.mp4');
const fps = 24;
const threads = Math.max(1, Math.min(2, Number(process.env.ATELIER_THREADS) || 2));
const args = process.argv.slice(2);
const onlyAt = args.indexOf('--only');
const only = onlyAt < 0 ? null : args[onlyAt + 1];
const assembleOnly = args.includes('--assemble');
const knownArgs = new Set(['--assemble', '--only', only]);
const unexpected = args.filter((arg, index) => !knownArgs.has(arg) && !(onlyAt >= 0 && index === onlyAt + 1));
if (unexpected.length || (onlyAt >= 0 && !only)) throw new Error('Usage: render-film.mjs [--only chapter-id | --assemble]');

function run(command, commandArgs, capture = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: ['ignore', capture ? 'pipe' : 'ignore', 'pipe'] });
    let errors = '';
    let output = '';
    child.stderr.setEncoding('utf8').on('data', (chunk) => { errors += chunk; });
    if (capture) child.stdout.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
    child.once('error', reject);
    child.once('close', (code) => code === 0 ? resolve(output) : reject(new Error(`${command} failed (${code}): ${errors.trim()}`)));
  });
}

function chapterFrames(chapter) {
  const frames = Math.round((chapter.end - chapter.at) * fps);
  if (frames < 1 || Math.abs(frames / fps - (chapter.end - chapter.at)) > 1e-7) throw new Error(`${chapter.id}: chapter duration must resolve to whole 24fps frames`);
  return frames;
}

async function extractSheet(chapter, width, height) {
  const source = path.join(assets, chapter.src);
  try { await stat(source); } catch { throw new Error(`${chapter.id}: missing artwork ${source}`); }
  const sheet = sharp(source);
  const meta = await sheet.metadata();
  const cellWidth = meta.width / chapter.columns;
  const cellHeight = meta.height / chapter.rows;
  if (!Number.isInteger(cellWidth) || !Number.isInteger(cellHeight) || chapter.columns * chapter.rows !== chapter.frames) throw new Error(`${chapter.id}: image ${meta.width}×${meta.height} is not an exact regular frame-sheet grid`);
  const dir = path.join(temp, chapter.id, 'source');
  await mkdir(dir, { recursive: true });
  for (let index = 0; index < chapter.frames; index++) {
    const sourceIndex = chapter.order?.[index] ?? index;
    const col = sourceIndex % chapter.columns;
    const row = Math.floor(sourceIndex / chapter.columns);
    await sheet.clone().extract({ left: col * cellWidth + 2, top: row * cellHeight + 2, width: cellWidth - 4, height: cellHeight - 4 }).resize(width, height).png().toFile(path.join(dir, `${String(index + 1).padStart(3, '0')}.png`));
  }
  return dir;
}

async function render(chapter, manifest) {
  const sourceDir = await extractSheet(chapter, manifest.width, manifest.height);
  const clip = path.join(temp, `${chapter.id}.mp4`);
  const duration = chapter.end - chapter.at;
  await run('python3', [path.join(root, 'render-inbetweens.py'), '--input', sourceDir, '--output', clip, '--duration', String(duration), '--mode', chapter.mode, '--fps', String(fps)]);
  console.log(`Rendered ${chapter.id}: ${duration}s`);
}

async function sha256(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

async function writeFinal(manifest, chapters) {
  if (!chapters.length) throw new Error('No chapter clips selected for assembly');
  const list = path.join(temp, 'clips.ffconcat');
  await writeFile(list, `ffconcat version 1.0\n${chapters.map((chapter) => `file '${path.join(temp, `${chapter.id}.mp4`)}'`).join('\n')}\n`);
  const clipList = ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-map', '0:v:0', '-fps_mode', 'passthrough', '-c:v', 'libx264', '-threads', String(threads), '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', output];
  await run('ffmpeg', clipList);
  await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', output, '-frames:v', '1', path.join(root, 'poster.jpg')]);
  const bytes = (await stat(output)).size;
  const decoded = await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', output, '-map', '0:v:0', '-f', 'framemd5', '-'], true);
  const frames = decoded.split('\n').filter((line) => line && !line.startsWith('#')).length;
  const expectedFrames = chapters.reduce((total, chapter) => total + chapterFrames(chapter), 0);
  if (frames !== expectedFrames) throw new Error(`Assembled film has ${frames} frames; expected ${expectedFrames}`);
  await writeFile(path.join(root, 'render-manifest.json'), `${JSON.stringify({ width: manifest.width, height: manifest.height, fps, duration: frames / fps, frames, sha256: await sha256(output), bytes }, null, 2)}\n`);
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.fps !== fps || !Number.isInteger(manifest.width) || !Number.isInteger(manifest.height) || !Array.isArray(manifest.chapters)) throw new Error(`Invalid manifest: ${manifestPath}`);
await mkdir(temp, { recursive: true });
const chapters = only ? manifest.chapters.filter((chapter) => chapter.id === only) : manifest.chapters;
if (only && chapters.length !== 1) throw new Error(`Unknown chapter id: ${only}`);
for (const chapter of chapters) {
  if (!['once', 'cycle'].includes(chapter.mode) || !Number.isFinite(chapter.at) || !Number.isFinite(chapter.end) || chapter.end <= chapter.at) throw new Error(`${chapter.id}: invalid timing or mode`);
  chapterFrames(chapter);
}
if (!assembleOnly) {
  if (only) await rm(path.join(temp, `${only}.mp4`), { force: true });
  else for (const chapter of chapters) await rm(path.join(temp, `${chapter.id}.mp4`), { force: true });
  for (const chapter of chapters) await render(chapter, manifest);
}
if (!only) {
  await writeFinal(manifest, chapters);
  console.log(`Complete film: ${output}`);
} else console.log(`Chapter preview: ${path.join(temp, `${only}.mp4`)}`);
