import { chromium, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { writeFile } from 'node:fs/promises'
const url=process.env.KITCHEN_PREVIEW_URL || 'http://127.0.0.1:4182/kitchen-animation/'
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
try {
 const context=await browser.newContext({viewport:{width:1440,height:1100}})
 const page=await context.newPage()
 const errors=[];page.on('pageerror',error=>errors.push(error.message))
 const result={durationSeconds:65,errors}
 await page.goto(url);await page.locator('.film-body').scrollIntoViewIfNeeded();await page.waitForFunction(()=>ready)
 await expect(page.locator('#film')).toHaveAttribute('data-playing','true')
 result.autoplay=true
 // Exercise the real complete timeline, including all chapter transitions.
 await page.waitForFunction(()=>elapsed===65000,null,{timeout:75000})
 await expect(page.locator('#film')).toHaveAttribute('data-act','8')
 await expect(page.locator('#film')).toHaveAttribute('data-playing','false')
 await page.waitForTimeout(300);expect(await page.evaluate(()=>elapsed)).toBe(65000);result.endsWithoutLoop=true
 await page.locator('#replay').click();await page.waitForTimeout(300);expect(await page.evaluate(()=>elapsed)).toBeLessThan(2000);result.replay=true
 await page.locator('#play-pause').click();const stopped=await page.evaluate(()=>elapsed);await page.waitForTimeout(250);expect(await page.evaluate(()=>elapsed)).toBe(stopped);result.pause=true
 await page.locator('#play-pause').click();await page.waitForTimeout(250);expect(await page.evaluate(()=>elapsed)).toBeGreaterThan(stopped);result.resume=true
 await page.locator('footer').scrollIntoViewIfNeeded();await expect(page.locator('#film')).toHaveAttribute('data-playing','false');result.offscreenPause=true
 await page.locator('.film-body').scrollIntoViewIfNeeded();await expect(page.locator('#film')).toHaveAttribute('data-playing','true')
 // Keyboard seeking pauses intentionally and keeps image, captions and records in sync.
 await page.locator('#scrub').focus();await page.keyboard.press('End');await expect(page.locator('#film')).toHaveAttribute('data-act','8');await expect(page.locator('#film')).toHaveAttribute('data-playing','false');result.keyboardSeek=true
 result.motion=[]
 for(const [selector,start,end] of [['#chef-working-arm',14600,14850],['#stock-basket',8500,10200],['#oven-door',23500,24600],['#supplier-position',37500,39100],['#sales-slip',52000,54500]]){
  const transforms=[]
  for(const t of [start,end])transforms.push(await page.evaluate(({selector,t})=>{pause();userPaused=true;elapsed=t;render();return getComputedStyle(document.querySelector(selector)).transform},{selector,t}))
  expect(transforms[0]).not.toBe(transforms[1]);result.motion.push({selector,transforms})
 }
 result.layouts=[]
 for(const width of [1440,1024,768,390,320]){
  await page.setViewportSize({width,height:width>740?1100:844})
  const heights=[]
  for(let index=0;index<9;index++){
   await page.evaluate(index=>{elapsed=acts[index].at+3000;render()},index)
   const layout=await page.evaluate(()=>{const record=document.querySelector('.record:not([hidden])');const panel=document.querySelector('.records').getBoundingClientRect();return {height:document.querySelector('.film').getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth,clipped:[...record.querySelectorAll('h2,dt,dd')].some(e=>{const r=e.getBoundingClientRect();return r.right>panel.right+.5||r.left<panel.left-.5||r.bottom>panel.bottom+.5})}})
   expect(layout.overflow).toBe(false);expect(layout.clipped).toBe(false);heights.push(layout.height)
  }
  expect(Math.max(...heights)-Math.min(...heights)).toBeLessThanOrEqual(.5)
  result.layouts.push({width,nineChaptersFit:true,heights})
 }
 result.axe=[]
 for(const width of [1440,320]){
  await page.setViewportSize({width,height:1100});await page.evaluate(()=>{elapsed=55000;render()})
  const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
  const violations=report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));result.axe.push({width,violations});expect(violations).toEqual([])
 }
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('#transport')).toBeHidden();await expect(page.locator('#film')).toHaveAttribute('data-playing','false');const still=await page.evaluate(()=>elapsed);await page.waitForTimeout(200);expect(await page.evaluate(()=>elapsed)).toBe(still);result.reducedMotion=true
 const staticContext=await browser.newContext({javaScriptEnabled:false});const staticPage=await staticContext.newPage();await staticPage.goto(url);await expect(staticPage.locator('.narrative li')).toHaveCount(9);await expect(staticPage.locator('#transport')).toBeHidden();result.noJS=true;await staticContext.close()
 const failedContext=await browser.newContext();const failedPage=await failedContext.newPage();await failedPage.route('**/people-v3.webp',route=>route.abort());await failedPage.goto(url);await expect(failedPage.locator('#motion-note')).toContainText('could not load');await expect(failedPage.locator('#transport')).toBeHidden();await expect(failedPage.locator('.narrative li')).toHaveCount(9);result.assetFailureFallback=true;await failedContext.close()
 expect(errors).toEqual([])
 await writeFile(new URL('./checks-v3.json',import.meta.url),JSON.stringify(result,null,2)+'\n')
 console.log(JSON.stringify(result,null,2));await context.close()
} finally {await browser.close()}
