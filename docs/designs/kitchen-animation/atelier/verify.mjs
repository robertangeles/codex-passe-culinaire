import {chromium} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {chapters,duration} from '../cinema/story.mjs'
const url='http://127.0.0.1:4182/kitchen-animation/atelier/'
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
const results={errors:[],layouts:[],chapters:[]}
try{
 const context=await browser.newContext({viewport:{width:1440,height:1050},reducedMotion:'reduce'})
 const page=await context.newPage()
 page.on('pageerror',e=>results.errors.push(e.message))
 await page.goto(url+'?paused')
 await page.waitForFunction(()=>window.__film?.video.readyState>=2)
 assert.equal(await page.evaluate(()=>window.__film.video.duration),duration)
 assert.equal(await page.evaluate(()=>window.__film.playing),false)
 for(const width of [320,390,640,768,1024,1100,1280,1440,1600]){
  await page.setViewportSize({width,height:1050})
  for(let i=0;i<chapters.length;i++){
   const t=chapters[i].at+.4
   await page.evaluate(t=>window.__film.seek(t),t)
   await page.waitForFunction(t=>!window.__film.video.seeking&&Math.abs(window.__film.video.currentTime-t)<.1,t)
   assert.equal(await page.locator('#chapter-title').textContent(),chapters[i].title)
   const layout=await page.evaluate(()=>{const story=document.querySelector('.story'),picture=document.querySelector('.picture'),stage=document.querySelector('#stage');return{pageOverflow:document.documentElement.scrollWidth>innerWidth,storyOverflow:story.scrollHeight>story.clientHeight+2,pictureOverflow:picture.getBoundingClientRect().right>innerWidth,stageHeight:Math.round(stage.getBoundingClientRect().height)}})
   results.layouts.push({width,chapter:i+1,...layout})
   assert.equal(layout.pageOverflow||layout.storyOverflow||layout.pictureOverflow,false,JSON.stringify(results.layouts.at(-1)))
  }
 }
 await page.setViewportSize({width:1440,height:1050})
 await page.evaluate(()=>window.__film.seek(2))
 await page.waitForFunction(()=>!window.__film.video.seeking)
 await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)})
 await page.screenshot({path:fileURLToPath(new URL('./evidence/desktop.png',import.meta.url)),fullPage:true})
 results.axeDesktop=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.length}))
 for(let i=0;i<chapters.length;i++){
  await page.locator('[data-chapter]').nth(i).click()
  await page.waitForFunction(()=>!window.__film.video.seeking)
  assert.equal(await page.locator('#chapter-title').textContent(),chapters[i].title)
  assert.equal(await page.evaluate(()=>window.__film.playing),false)
  results.chapters.push({title:chapters[i].title,time:await page.evaluate(()=>window.__film.time)})
 }
 await page.setViewportSize({width:390,height:844})
 await page.evaluate(()=>window.__film.seek(33))
 await page.waitForFunction(()=>!window.__film.video.seeking)
 await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)})
 await page.screenshot({path:fileURLToPath(new URL('./evidence/mobile.png',import.meta.url)),fullPage:true})
 results.axeMobile=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.length}))
 const nojs=await browser.newContext({javaScriptEnabled:false})
 const staticPage=await nojs.newPage();await staticPage.goto(url)
 assert.equal(await staticPage.locator('.transcript li').count(),9)
 assert.equal(await staticPage.locator('#rows>div').count(),3)
 assert.equal(await staticPage.locator('#poster').isVisible(),true)
 const failed=await context.newPage();await failed.route('**/kitchen-day.mp4',r=>r.abort());await failed.goto(url);await failed.locator('#film-fallback').waitFor({state:'visible'});assert.equal(await failed.locator('#poster').isVisible(),true)
 await page.setViewportSize({width:1440,height:800});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(url)
 await page.locator('#stage').scrollIntoViewIfNeeded()
 await page.waitForFunction(()=>window.__film?.playing)
 await page.locator('#play').click();const paused=await page.evaluate(()=>window.__film.time);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.__film.time),paused)
 await page.locator('.transcript summary').click();await page.locator('footer').scrollIntoViewIfNeeded();await page.locator('#stage').scrollIntoViewIfNeeded();await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.__film.playing),false)
 await page.locator('#play').click();await page.waitForFunction(()=>window.__film.playing)
 await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!window.__film.playing)
 await page.locator('#stage').scrollIntoViewIfNeeded();await page.waitForFunction(()=>window.__film.playing)
 await page.evaluate(()=>{window.__film.seek(0);window.__film.play()})
 const started=Date.now();await page.waitForFunction(()=>window.__film.video.ended,null,{timeout:100000})
 results.playbackMs=Date.now()-started
 results.video=await page.evaluate(()=>{const q=window.__film.video.getVideoPlaybackQuality();return{duration:window.__film.video.duration,time:window.__film.time,playing:window.__film.playing,totalFrames:q.totalVideoFrames,droppedFrames:q.droppedVideoFrames}})
 assert.equal(results.video.time,duration);assert.equal(results.video.playing,false)
 await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.__film.time),duration)
 await page.locator('#play').click();await page.waitForFunction(()=>window.__film.playing&&window.__film.time<2)
 assert.deepEqual(results.errors,[]);assert.deepEqual(results.axeDesktop,[]);assert.deepEqual(results.axeMobile,[])
 Object.assign(results,{reducedMotion:true,noJavaScript:true,mediaFailure:true,manualPause:true,offscreenPauseResume:true,finite:true,replay:true})
 await writeFile(new URL('./evidence/checks.json',import.meta.url),JSON.stringify(results,null,2)+'\n')
 console.log(JSON.stringify({playbackMs:results.playbackMs,video:results.video,layoutStates:results.layouts.length,axeDesktop:results.axeDesktop,axeMobile:results.axeMobile,errors:results.errors,finite:true,replay:true}))
}finally{await browser.close()}
