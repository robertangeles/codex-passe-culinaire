import {chromium} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
const root=fileURLToPath(new URL('.',import.meta.url))
const url='http://127.0.0.1:4182/kitchen-animation/remotion-film/'
const story=JSON.parse(await readFile(root+'story.json','utf8'))
const duration=story.duration
const starts=story.chapters.map(chapter=>chapter.at)
const moments=story.chapters.map(chapter=>chapter.end-1)
const requiredFeatures=['Waste Management','Rostering','Inventory','Purchasing','Receiving','Mise en Place','Production','Sales','Recipe Lab','Patisserie Lab','Cocktail Lab']
const results={errors:[],layouts:[],accessibility:[],playback:[]}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
const evidence=new URL('./evidence/',import.meta.url)
await mkdir(evidence,{recursive:true})
try{
 const context=await browser.newContext({viewport:{width:1440,height:1050},reducedMotion:'reduce'})
 const page=await context.newPage()
 page.on('pageerror',e=>results.errors.push(e.message))
 for(const width of [320,390,760,768,1024,1440]){
  await page.setViewportSize({width,height:1050})
  await page.goto(url+'?paused')
  await page.waitForFunction(()=>window.__film?.video.readyState>=2)
  assert.equal(await page.evaluate(()=>window.__film.playing),false)
  const buttons=await page.locator('.chapters button').evaluateAll(nodes=>nodes.map(node=>({at:Number(node.dataset.at),title:node.dataset.title,description:node.dataset.description,label:node.querySelector('.chapter-name').textContent})))
  assert.deepEqual(buttons,story.chapters.map(({at,title,description,label})=>({at,title,description,label})))
  for(const feature of requiredFeatures)assert.ok(buttons.some(button=>button.label===feature),`Missing feature ${feature}`)
  const media=await page.evaluate(()=>({width:window.__film.video.videoWidth,height:window.__film.video.videoHeight,duration:window.__film.video.duration}))
  assert.deepEqual(media,width<=760?{width:1080,height:1350,duration}:{width:1920,height:1080,duration})
  for(const time of starts){
   await page.evaluate(t=>window.__film.seek(t+.8),time)
   await page.waitForFunction(()=>!window.__film.video.seeking)
   assert.equal(await page.locator('[aria-current=step]').getAttribute('data-at'),String(time))
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)
   assert.equal(overflow,false,`Overflow at ${width}px / ${time}s`)
   results.layouts.push({width,time,overflow})
  }
  if(width===390||width===1440){
   await page.evaluate(()=>window.__film.seek(18))
   await page.waitForFunction(()=>!window.__film.video.seeking)
   await page.evaluate(()=>scrollTo(0,0))
   await page.screenshot({path:fileURLToPath(new URL(`./evidence/${width===390?'mobile':'desktop'}.jpg`,import.meta.url)),fullPage:true,type:'jpeg',quality:85})
   const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.length}))
   results.accessibility.push({width,violations});assert.deepEqual(violations,[])
  }
 }
 for(const [label,width,height] of [['desktop',1440,1050],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'})
  await page.goto(url)
  await page.locator('.transcript summary').click()
  await page.locator('#stage').scrollIntoViewIfNeeded()
  await page.waitForFunction(()=>window.__film?.playing)
  await page.locator('#play').click()
  const paused=await page.evaluate(()=>window.__film.time)
  await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__film.time),paused)
  await page.locator('footer').scrollIntoViewIfNeeded();await page.locator('#stage').scrollIntoViewIfNeeded()
  await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__film.playing),false)
  await page.locator('#play').click();await page.waitForFunction(()=>window.__film.playing)
  await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!window.__film.playing)
  await page.locator('#stage').scrollIntoViewIfNeeded();await page.waitForFunction(()=>window.__film.playing)
  await page.evaluate(()=>{window.__film.seek(0);window.__film.play()})
  const start=Date.now()
  // Observe the actual full run, capture its progression without seeking.
  for(const at of moments){
   await page.waitForFunction(t=>window.__film.time>=t,at,{timeout:20000})
   await page.locator('#stage').screenshot({path:fileURLToPath(new URL(`./evidence/${label}-${at}s.jpg`,import.meta.url)),type:'jpeg',quality:85})
  }
  await page.waitForFunction(()=>window.__film.video.ended,null,{timeout:10000})
  const metrics=await page.evaluate(()=>({time:window.__film.time,playing:window.__film.playing,totalFrames:window.__film.video.getVideoPlaybackQuality().totalVideoFrames,droppedFrames:window.__film.video.getVideoPlaybackQuality().droppedVideoFrames}))
  assert.equal(metrics.time,duration);assert.equal(metrics.playing,false)
  results.playback.push({label,elapsedMs:Date.now()-start,...metrics})
  console.log(JSON.stringify(results.playback.at(-1)))
  await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__film.time),duration)
  await page.locator('#play').click();await page.waitForFunction(()=>window.__film.playing&&window.__film.time<3)
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!window.__film.playing)
 }
 await page.setViewportSize({width:1440,height:1050});await page.goto(url+'?paused')
 await page.waitForFunction(()=>window.__film?.video.readyState>=2)
 await page.locator('#seek').focus();await page.keyboard.press('ArrowRight')
 assert.ok(await page.evaluate(()=>window.__film.time)>0)
 await page.locator('#fullscreen').click();await page.waitForFunction(()=>!!document.fullscreenElement)
 assert.equal(await page.locator('#play').isVisible(),true)
 await page.locator('#play').click();await page.waitForFunction(()=>window.__film.playing)
 await page.locator('#play').click();assert.equal(await page.evaluate(()=>window.__film.playing),false)
 await page.locator('#fullscreen').click();await page.waitForFunction(()=>!document.fullscreenElement)
 // Exercise the hidden-tab event independently from scroll visibility.
 await page.locator('#stage').scrollIntoViewIfNeeded();await page.locator('#play').click()
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))})
 assert.equal(await page.evaluate(()=>window.__film.playing),false)
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))})
 const nojs=await browser.newContext({javaScriptEnabled:false})
 const staticPage=await nojs.newPage();await staticPage.goto(url)
 assert.equal(await staticPage.locator('#poster').isVisible(),true)
 assert.equal(await staticPage.locator('.transcript li').count(),story.chapters.length)
 const failed=await context.newPage();await failed.route('**/*.mp4',r=>r.abort());await failed.goto(url)
 await failed.locator('#film-fallback').waitFor({state:'visible'})
 assert.equal(await failed.locator('#poster').isVisible(),true)
 assert.deepEqual(results.errors,[])
 results.safeguards={finite:true,replay:true,manualPause:true,offscreenPauseResume:true,reducedMotion:true,fullscreenControls:true,keyboardSeeking:true,hiddenTabPauseEvent:true,noJavaScript:true,mediaFailure:true}
 results.features=requiredFeatures
 results.duration=duration
 results.films={}
 for(const file of ['kitchen-day.mp4','kitchen-day-mobile.mp4'])results.films[file]=createHash('sha256').update(await readFile(root+file)).digest('hex')
 await writeFile(new URL('checks.json',evidence),JSON.stringify(results,null,2)+'\n')
 console.log(JSON.stringify({layouts:results.layouts.length,accessibility:results.accessibility,errors:results.errors,safeguards:results.safeguards}))
}finally{await browser.close()}
