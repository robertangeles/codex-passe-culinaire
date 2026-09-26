import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
const url='http://127.0.0.1:4182/kitchen-animation/human-motion/';
const context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(url);await page.waitForFunction(()=>window.__humanMotion?.canvas.width===627);
assert.equal(await page.evaluate(()=>window.__humanMotion.playing),false);
assert.equal(await page.locator('#play-button').getAttribute('aria-label'),'Play movement study');
const frames=[];
for(let i=0;i<16;i++) {frames.push(await page.evaluate(t=>{window.__humanMotion.seek(t);return window.__humanMotion.canvas.toDataURL()},(i+.1)/12))}
assert.equal(new Set(frames).size,16);
const layouts=[];
for(const width of [320,390,640,768,1440,1600]) {await page.setViewportSize({width,height:960});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);layouts.push({width,overflow});}
await page.setViewportSize({width:1440,height:960});
const axeDesktop=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.length}));
await page.setViewportSize({width:390,height:844});
const axeMobile=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.length}));
await page.setViewportSize({width:1440,height:960});await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();await page.waitForFunction(()=>window.__humanMotion?.playing);
await page.waitForTimeout(500);await page.evaluate(()=>window.__humanMotion.pause());const paused=await page.evaluate(()=>window.__humanMotion.time);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.__humanMotion.time),paused);
await page.evaluate(()=>{window.__humanMotion.seek(0);window.__humanMotion.play()});const start=Date.now();await page.waitForFunction(()=>window.__humanMotion.time>=window.__humanMotion.duration,{},{timeout:10000});const elapsed=Date.now()-start;
assert.equal(await page.evaluate(()=>window.__humanMotion.playing),false);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__humanMotion.time),16*4/12);
await page.locator('#replay-button').click();await page.waitForFunction(()=>window.__humanMotion.playing&&window.__humanMotion.time<1);
const nojsContext=await browser.newContext({javaScriptEnabled:false});const nojs=await nojsContext.newPage();await nojs.goto(url);assert.equal(await nojs.locator('.sprite-fallback').isVisible(),true);assert.equal(await nojs.locator('.player').isVisible(),false);
const failed=await context.newPage();await failed.route('**/sprite-sheet.png',r=>r.abort());await failed.goto(url);await failed.locator('#load-fallback').waitFor({state:'visible'});
const result={elapsed,uniqueFrames:new Set(frames).size,layouts,axeDesktop,axeMobile,errors,reducedMotion:true,pause:true,finite:true,replay:true,nojs:true,assetFailure:true};
await fs.writeFile(new URL('./evidence/checks.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
assert.equal(axeDesktop.length+axeMobile.length+errors.length,0);
} finally {await browser.close()}
