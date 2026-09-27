import {bundle} from '@remotion/bundler'
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer'
import {chromium} from '@playwright/test'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'

const directory=fileURLToPath(new URL('.',import.meta.url))
const work=resolve(directory,'../../../../.local/remotion-kitchen')
const mobile=process.argv.includes('--mobile')
const compositionId=mobile?'KitchenDayMobile':'KitchenDay'
const suffix=mobile?'-mobile':''
const stills=process.argv.includes('--stills')
await mkdir(work,{recursive:true})
await mkdir(resolve(directory,'evidence'),{recursive:true})
const sources={}
for(const filename of ['Film.tsx','MobileFilm.tsx','index.ts','film.css','render.mjs','public/opening.png','public/pantry.png','public/preparation.png','public/tart.png','public/receiving.png','public/team.png','public/fraunces.woff2','public/inter.woff2','public/mono.woff2','public/monogram.svg','../../../../pnpm-lock.yaml']){
 sources[filename]=createHash('sha256').update(await readFile(resolve(directory,filename))).digest('hex')
}
const serveUrl=await bundle({entryPoint:resolve(directory,'index.ts'),publicDir:resolve(directory,'public'),outDir:resolve(work,'bundle'+suffix)})
const browser=await openBrowser('chrome',{browserExecutable:chromium.executablePath(),chromiumOptions:{gl:'swangle'}})
try {
  const options={serveUrl,puppeteerInstance:browser,timeoutInMilliseconds:60000}
  const composition=await selectComposition({...options,id:compositionId})
  assert.equal(composition.durationInFrames,2400)
  assert.equal(composition.fps,30)
  assert.equal(composition.width,mobile?1080:1920)
  assert.equal(composition.height,mobile?1350:1080)
  if(stills){
    for(const frame of [0,90,300,540,810,1050,1350,1590,1830,2130,2300,2399]){
      await renderStill({...options,composition,frame,imageFormat:'jpeg',jpegQuality:92,output:resolve(directory,`evidence/frame${suffix}-${String(frame).padStart(4,'0')}.jpg`)})
      console.log(`Reviewed-frame candidate ${frame}/2399 rendered`)
    }
  }else{
    const outputLocation=resolve(work,'candidate'+suffix+'.mp4')
    let last=-1
    await renderMedia({...options,composition,codec:'h264',pixelFormat:'yuv420p',crf:18,x264Preset:'medium',concurrency:2,outputLocation,overwrite:true,onProgress:({progress})=>{
      const step=Math.floor(progress*10)
      if(step!==last){last=step;console.log(`Render ${step*10}%`)}
    }})
    const output=await readFile(outputLocation)
    const digest=createHash('sha256').update(output).digest('hex')
    for(const [filename,hash] of Object.entries(sources)){
      assert.equal(createHash('sha256').update(await readFile(resolve(directory,filename))).digest('hex'),hash,`Source changed during render: ${filename}`)
    }
    await writeFile(resolve(work,'render-manifest'+suffix+'.json'),JSON.stringify({renderedAt:new Date().toISOString(),engine:'Remotion 4.0.529',composition:compositionId,width:composition.width,height:composition.height,fps:30,frames:2400,duration:80,codec:'h264',crf:18,concurrency:2,bytes:output.length,sha256:digest,sources},null,2)+'\n')
    console.log(JSON.stringify({outputLocation,bytes:output.length,sha256:digest}))
  }
}finally{
  await browser.close({silent:true})
}
