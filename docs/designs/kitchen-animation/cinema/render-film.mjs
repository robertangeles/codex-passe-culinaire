// Deterministic 24fps source render. ffmpeg is an authoring tool, not a site dependency.
import {chromium} from '@playwright/test'
import {spawn} from 'node:child_process'
import {once} from 'node:events'
import {fileURLToPath} from 'node:url'
const mobile=process.argv.includes('--mobile'),width=mobile?720:1600,height=mobile?720:900
const base=process.env.CINEMA_URL||'http://127.0.0.1:4182/kitchen-animation/cinema/'
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']})
const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'})
await page.goto(base+'authoring.html?paused');await page.waitForFunction(()=>window.__cinema);await page.evaluate(()=>document.fonts.ready)
await page.addStyleTag({content:`html,body{width:${width}px;height:${height}px;overflow:hidden}main{padding:0;width:${width}px;max-width:none}.masthead,.intro,.chapters,.closing,.transcript,footer,.transport,.progress-track,.story,.scene-caption{display:none!important}.film{border:0;display:block;width:${width}px;height:${height}px}.picture,#stage{height:${height}px!important;min-height:${height}px!important;width:${width}px}`})
await page.evaluate(()=>{window.__cinema.renderer.setPixelRatio(1);window.__cinema.seek(0)})
const out=fileURLToPath(new URL(mobile?'./kitchen-day-mobile.mp4':'./kitchen-day.mp4',import.meta.url))
const ffmpeg=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-framerate','24','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']})
let pipeError;ffmpeg.stdin.on('error',e=>{pipeError=e})
for(let frame=0;frame<80*24;frame++){const encoded=await page.evaluate(t=>{window.__cinema.seek(t);return window.__cinema.renderer.domElement.toDataURL('image/jpeg',.94).split(',')[1]},frame/24);const image=Buffer.from(encoded,'base64');if(pipeError)throw pipeError;if(!ffmpeg.stdin.write(image))await once(ffmpeg.stdin,'drain');if(frame%240===0)console.log(`Rendered ${mobile?'mobile':'desktop'} ${frame/24} / 80 seconds`)}
ffmpeg.stdin.end();const [code]=await once(ffmpeg,'close');await browser.close();if(code!==0)throw Error(`ffmpeg exit ${code}`);console.log(`Rendered 1920 frames: ${out}`)
