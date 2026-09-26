import {chapters,duration} from './story.mjs'
const video=document.querySelector('#kitchen-film'),play=document.querySelector('#play'),seek=document.querySelector('#seek'),stage=document.querySelector('#stage')
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 700px)')
const allowAutoplay=!new URLSearchParams(location.search).has('paused')
let active=-1,manualPause=false,started=false,resumeOnView=false,visible=false,failed=false
video.src=mobile.matches?'kitchen-day-mobile.mp4':'kitchen-day.mp4';video.muted=true
function update(t){
 const index=Math.max(0,chapters.findLastIndex(c=>t>=c.at)),c=chapters[index]
 if(index!==active){active=index;document.querySelector('#chapter-time').textContent=c.time;document.querySelector('#chapter-title').textContent=c.title;document.querySelector('#chapter-body').textContent=c.body;document.querySelector('#module').textContent=c.module;document.querySelector('#question').textContent=c.question;document.querySelector('#rows').replaceChildren(...c.rows.map(([label,value])=>{const row=document.createElement('div'),name=document.createElement('span'),data=document.createElement('strong');name.textContent=label;data.textContent=value;row.append(name,data);return row}));document.querySelectorAll('[data-chapter]').forEach((b,i)=>b.setAttribute('aria-current',i===index?'step':'false'))}
 document.querySelectorAll('#rows>div').forEach((r,i)=>r.classList.toggle('arrived',t-c.at>1+i*.5))
 document.querySelector('#progress').style.width=`${t/duration*100}%`;seek.value=t;document.querySelector('#time').textContent=`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')} / 1:20`
}
function controls(){const playing=!video.paused&&!video.ended;play.textContent=playing?'Pause film':video.ended?'Replay film':'Play film';play.setAttribute('aria-label',playing?'Pause the kitchen film':video.ended?'Replay the kitchen film':'Play the kitchen film')}
async function start(){if(failed)return;started=true;if(video.ended||video.currentTime>=duration-.05)video.currentTime=0;try{await video.play()}catch{controls()}}
play.addEventListener('click',()=>{if(video.paused||video.ended){manualPause=false;start()}else{manualPause=true;resumeOnView=false;video.pause()}})
seek.addEventListener('input',()=>{manualPause=true;resumeOnView=false;video.pause();video.currentTime=Number(seek.value);update(Number(seek.value))})
document.querySelectorAll('[data-chapter]').forEach((button,i)=>button.addEventListener('click',()=>{manualPause=true;resumeOnView=false;video.pause();video.currentTime=chapters[i].at+.05;update(video.currentTime)}))
for(const event of ['play','pause','ended'])video.addEventListener(event,controls)
for(const event of ['timeupdate','seeked','loadedmetadata'])video.addEventListener(event,()=>update(video.currentTime))
video.addEventListener('loadeddata',()=>{document.querySelector('#poster').hidden=true;document.querySelector('.transport').hidden=false;document.querySelector('.chapters').hidden=false;if(visible&&!started&&allowAutoplay&&!reduced.matches&&!manualPause)start()})
video.addEventListener('error',()=>{failed=true;video.hidden=true;document.querySelector('#poster').hidden=false;document.querySelector('#film-fallback').hidden=false;play.disabled=true;seek.disabled=true;document.querySelectorAll('[data-chapter]').forEach(b=>b.disabled=true)})
new IntersectionObserver(entries=>{visible=entries[0].intersectionRatio>=.5;if(!visible){resumeOnView=!video.paused&&!video.ended;video.pause()}else if(!manualPause&&allowAutoplay&&!reduced.matches&&(!started||resumeOnView)){resumeOnView=false;start()}},{threshold:[0,.5,1]}).observe(stage)
document.addEventListener('visibilitychange',()=>{if(document.hidden){resumeOnView=false;video.pause()}})
reduced.addEventListener('change',()=>{if(reduced.matches){resumeOnView=false;video.pause()}})
// Keep an in-progress film on its chosen source during viewport changes.
// Both encodes contain the same story; contain sizing preserves the whole frame.
let clockFrame=0
function tick(){clockFrame=0;if(video.paused||video.ended)return;update(video.currentTime);clockFrame=requestAnimationFrame(tick)}
video.addEventListener('play',()=>{cancelAnimationFrame(clockFrame);tick()})
video.addEventListener('pause',()=>{cancelAnimationFrame(clockFrame);clockFrame=0;update(video.currentTime)})
update(0);controls()
window.__film={video,duration,get time(){return video.currentTime},get playing(){return !video.paused&&!video.ended},seek(t){video.pause();video.currentTime=t;update(t)},play:start,pause(){video.pause()}}
