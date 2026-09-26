import {chapters,duration} from '../cinema/story.mjs'

const video=document.querySelector('#kitchen-film')
const play=document.querySelector('#play')
const seek=document.querySelector('#seek')
const stage=document.querySelector('#stage')
const reduced=matchMedia('(prefers-reduced-motion: reduce)')
const allowAutoplay=!new URLSearchParams(location.search).has('paused')
let active=-1
let manualPause=false
let started=false
let resumeOnView=false
let visible=false
let failed=false

video.src='kitchen-day.mp4'
video.muted=true

function update(time){
  const t=Math.min(duration,Math.max(0,time))
  const index=Math.max(0,chapters.findLastIndex(chapter=>t>=chapter.at))
  const chapter=chapters[index]
  if(index!==active){
    active=index
    document.querySelector('#chapter-time').textContent=chapter.time
    document.querySelector('#chapter-title').textContent=chapter.title
    document.querySelector('#chapter-body').textContent=chapter.body
    document.querySelector('#module').textContent=chapter.module
    document.querySelector('#question').textContent=chapter.question
    document.querySelector('#rows').replaceChildren(...chapter.rows.map(([label,value])=>{
      const row=document.createElement('div')
      const name=document.createElement('span')
      const data=document.createElement('strong')
      name.textContent=label
      data.textContent=value
      row.append(name,data)
      return row
    }))
    document.querySelectorAll('[data-chapter]').forEach((button,i)=>button.setAttribute('aria-current',i===index?'step':'false'))
  }
  document.querySelectorAll('#rows>div').forEach((row,i)=>row.classList.toggle('arrived',t-chapter.at>1+i*.5))
  document.querySelector('#progress').style.width=`${t/duration*100}%`
  seek.value=String(t)
  document.querySelector('#time').textContent=`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')} / 1:20`
}

function controls(){
  const playing=!video.paused&&!video.ended
  play.textContent=playing?'Pause film':video.ended?'Replay film':'Play film'
  play.setAttribute('aria-label',playing?'Pause the kitchen film':video.ended?'Replay the kitchen film':'Play the kitchen film')
}

async function start(){
  if(failed)return
  started=true
  if(video.ended||video.currentTime>=duration-.05)video.currentTime=0
  try{await video.play()}catch{controls()}
}

play.addEventListener('click',()=>{
  if(video.paused||video.ended){manualPause=false;resumeOnView=false;start()}
  else{manualPause=true;resumeOnView=false;video.pause()}
})
seek.addEventListener('input',()=>{
  manualPause=true
  resumeOnView=false
  video.pause()
  video.currentTime=Number(seek.value)
  update(Number(seek.value))
})
document.querySelectorAll('[data-chapter]').forEach((button,index)=>button.addEventListener('click',()=>{
  manualPause=true
  resumeOnView=false
  video.pause()
  video.currentTime=chapters[index].at+.05
  update(video.currentTime)
}))

for(const event of ['play','pause','ended'])video.addEventListener(event,controls)
for(const event of ['timeupdate','seeked','loadedmetadata'])video.addEventListener(event,()=>update(video.currentTime))
video.addEventListener('ended',()=>update(duration))
video.addEventListener('loadeddata',()=>{
  document.querySelector('#poster').hidden=true
  document.querySelector('.transport').hidden=false
  document.querySelector('.chapters').hidden=false
  maybeResume()
})
video.addEventListener('error',()=>{
  failed=true
  video.hidden=true
  document.querySelector('#poster').hidden=false
  document.querySelector('#film-fallback').hidden=false
  play.disabled=true
  seek.disabled=true
  document.querySelectorAll('[data-chapter]').forEach(button=>button.disabled=true)
})

function maybeResume(){
  if(visible&&(!started||resumeOnView)&&!manualPause&&!document.hidden&&allowAutoplay&&!reduced.matches){
    resumeOnView=false
    start()
  }
}
new IntersectionObserver(entries=>{
  visible=entries[0].intersectionRatio>=.5
  if(!visible){
    if(!video.paused&&!video.ended&&!manualPause)resumeOnView=true
    video.pause()
  }else{
    maybeResume()
  }
},{threshold:[0,.5,1]}).observe(stage)

document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    if(!video.paused&&!video.ended&&!manualPause)resumeOnView=true
    video.pause()
  }else{
    maybeResume()
  }
})
reduced.addEventListener('change',()=>{
  if(reduced.matches){resumeOnView=false;video.pause()}
})

let clockFrame=0
function tick(){
  clockFrame=0
  if(video.paused||video.ended)return
  update(video.currentTime)
  clockFrame=requestAnimationFrame(tick)
}
video.addEventListener('play',()=>{cancelAnimationFrame(clockFrame);tick()})
video.addEventListener('pause',()=>{cancelAnimationFrame(clockFrame);clockFrame=0;update(video.currentTime)})

update(0)
controls()
window.__filmAPI={video,duration,get time(){return video.currentTime},get playing(){return !video.paused&&!video.ended},seek(time){manualPause=true;resumeOnView=false;video.pause();video.currentTime=Math.min(duration,Math.max(0,time));update(video.currentTime)},play(){manualPause=false;resumeOnView=false;return start()},pause(){manualPause=true;resumeOnView=false;video.pause()}}
window.__film=window.__filmAPI
