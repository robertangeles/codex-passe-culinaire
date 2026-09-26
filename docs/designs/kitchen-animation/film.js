const acts = JSON.parse(document.querySelector('#story-data').textContent)
const duration = acts.at(-1).end
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
const smallScreen = matchMedia('(max-width: 740px)')
const film = document.querySelector('#film')
const illustration = document.querySelector('#illustration')
const playButton = document.querySelector('#play-pause')
const transport = document.querySelector('#transport')
const scrub = document.querySelector('#scrub')
const motionNote = document.querySelector('#motion-note')
const animations = []
let elapsed = 0
let startedAt = 0
let playing = false
let visible = false
let userPaused = false
let ready = false
let frame
let currentAct = -1

// One clock drives paused native animations, so seeking and resuming never restart a finished effect.
function animate(selector, keyframes, start, length, options = {}) {
  for (const element of document.querySelectorAll(selector)) {
    const animation = element.animate(keyframes, {delay:start, duration:length, fill:'both', easing:'ease-in-out', ...options})
    animation.pause()
    animation.currentTime = 0
    animations.push(animation)
  }
}
function show(selector, start, end, stay = false) {
  animate(selector, [{opacity:0,offset:0},{opacity:1,offset:.08},{opacity:1,offset:.92},{opacity:stay?1:0,offset:1}],start,end-start)
}
function origin(selector, value) {
  document.querySelector(selector).style.transformOrigin = value
}
function rig() {
  show('#planning-sheet',0,7000)
  animate('#planning-sheet',[{transform:'translate(-60px,-40px) rotate(-5deg)'},{transform:'translate(0,0)'}],0,1800)
  show('#pantry-stock',7000,14000)
  show('#stock-basket',7400,14300)
  animate('#stock-basket',[{transform:'translate(-180px,-35px)'},{transform:'translate(15px,0)'}],7800,4000)
  show('#prep-board',14000,22500)
  origin('#prep-board','580px 300px')
  animate('#prep-board',[{transform:'scaleY(.35)'},{transform:'scaleY(.35)'}],0,duration)
  origin('#mixing-bowl','670px 300px')
  show('#chef-knife',14000,18100)
  show('#chef-whisk',18300,23200)
  show('#mixing-bowl',17900,23600)
  animate('#mixing-bowl',[{transform:'translate(-55px,-10px) scale(.55)'},{transform:'translate(-55px,-10px) scale(.55)'}],0,duration)
  origin('#chef-working-arm','370px 365px')
  animate('#chef-working-arm',[{transform:'rotate(0deg)'},{transform:'rotate(9deg)'},{transform:'rotate(0deg)'}],14500,700,{iterations:5,fill:'none'})
  animate('#chef-working-arm',[{transform:'rotate(10deg)'},{transform:'rotate(28deg)'},{transform:'rotate(10deg)'}],18500,850,{iterations:5,fill:'none'})
  animate('#chef-working-arm',[{transform:'rotate(0deg)'},{transform:'rotate(8deg)'},{transform:'rotate(0deg)'}],31000,1400,{iterations:3,fill:'none'})
  animate('#chef-position,#chef-arm-position',[
    {transform:'translate(0,0)',offset:0},{transform:'translate(0,0)',offset:7/65},
    {transform:'translate(-115px,0)',offset:9/65},{transform:'translate(-115px,0)',offset:11/65},
    {transform:'translate(0,0)',offset:14/65},{transform:'translate(0,0)',offset:23/65},
    {transform:'translate(130px,0)',offset:25/65},{transform:'translate(130px,0)',offset:28/65},
    {transform:'translate(0,0)',offset:30/65},{transform:'translate(0,0)',offset:37/65},
    {transform:'translate(-130px,0)',offset:39/65},{transform:'translate(-130px,0)',offset:42/65},
    {transform:'translate(0,0)',offset:44/65},{transform:'translate(0,0)',offset:1}
  ],0,duration)

  show('#oven,#oven-door',23000,30300)
  origin('#oven-door','865px 465px')
  animate('#oven-door',[{transform:'scaleY(1)'},{transform:'scaleY(.15)',offset:.22},{transform:'scaleY(.15)',offset:.45},{transform:'scaleY(1)',offset:.55},{transform:'scaleY(1)',offset:.73},{transform:'scaleY(.15)',offset:1}],23200,5800)
  show('#bake-tray',23800,29800)
  animate('#bake-tray',[{transform:'translate(-150px,-50px)'},{transform:'translate(0,0)',offset:.4},{transform:'translate(0,0)',offset:.8},{transform:'translate(-90px,-50px)'}],24000,5400)
  show('#steam',27500,30000)
  animate('#steam',[{transform:'translate(0,10px)'},{transform:'translate(-8px,-18px)'}],27600,1800,{iterations:1})

  show('#stock-record,#waste-scale',30200,36800)
  animate('#stock-record',[{transform:'translate(-30px,25px) rotate(-4deg)'},{transform:'translate(0,0)'}],30500,1600)
  animate('#waste-scale',[{transform:'translate(80px,-30px)'},{transform:'translate(0,0)'}],30700,1700)
  show('#supplier-position',37000,43700)
  animate('#supplier-position',[{transform:'translate(-260px,0)'},{transform:'translate(0,0)',offset:.4},{transform:'translate(0,0)',offset:.85},{transform:'translate(-45px,0)'}],37100,6100)
  show('#receiving-scale,#receiving-cart',38100,43600)
  show('#received-crate',39400,43700)
  animate('#received-crate',[{transform:'translate(-115px,-70px)'},{transform:'translate(0,6px)'}],39500,1800)
  show('#thermometer',40400,43200)
  animate('#thermometer',[{transform:'translate(-25px,-40px)'},{transform:'translate(-25px,15px)'},{transform:'translate(-25px,-40px)'}],40400,2600)

  show('#owner-position',44100,65000,true)
  animate('#owner-position',[{transform:'translate(160px,0)'},{transform:'translate(0,0)'}],44100,1800)
  show('#roster-sheet',44500,50800)
  animate('#roster-sheet',[{transform:'translate(40px,-20px)'},{transform:'translate(0,0)'}],44700,1800)
  show('#service-plates',46500,50900)
  animate('#service-plates',[{transform:'translate(-170px,-30px)'},{transform:'translate(0,-30px)'}],46600,3300)
  show('#sales-slip',51300,57000)
  animate('#sales-slip',[{transform:'translate(-80px,40px)'},{transform:'translate(140px,10px) scale(.85)'}],51500,4400)
  animate('.forecast-bar,.actual-bar',[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],53200,2100)
  show('#connection-lines',58400,62200)
  animate('#connection-lines',[{strokeDashoffset:180},{strokeDashoffset:0}],58400,3200)
  show('#scene-end',59900,65000,true)
  acts.forEach((act,index)=>{
    for(let row=0;row<3;row++)animate(`#record-${index} .record-row:nth-child(${row+1})`,[{opacity:.2,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],act.at+500+row*550,700)
  })
}
function formatTime(value) {
  const seconds = Math.floor(value/1000)
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`
}
function setCamera() {
  illustration.setAttribute('viewBox', smallScreen.matches ? acts[currentAct].camera.join(' ') : acts[currentAct].desktopCamera.join(' '))
}
function render() {
  const index = acts.reduce((found,act,i)=>elapsed>=act.at?i:found,0)
  if(index!==currentAct){
    currentAct=index
    const act=acts[index]
    film.dataset.act=String(index)
    document.querySelectorAll('.record').forEach((record,i)=>{record.hidden=i!==index})
    document.querySelector('#act-number').textContent=String(index+1).padStart(2,'0')
    document.querySelector('#caption').textContent=act.caption
    document.querySelector('#scene-time').textContent=act.time
    document.querySelector('#scene-title').textContent=act.title
    document.querySelector('#record-action').textContent=act.action
    setCamera()
  }
  animations.forEach(animation=>{animation.currentTime=elapsed})
  scrub.value=String(elapsed/1000)
  scrub.setAttribute('aria-valuetext',`${formatTime(elapsed)} of 1 minute 5 seconds`)
  document.querySelector('#time').textContent=`${formatTime(elapsed)} / 1:05`
  film.dataset.playing=String(playing)
}
function renderButton(){
  document.querySelector('#play-label').textContent=playing?'Pause':elapsed>=duration?'Play again':'Play'
  playButton.setAttribute('aria-label',playing?'Pause animation':elapsed>=duration?'Play animation again':'Play animation')
  document.querySelector('#pause-icon').style.display=playing?'':'none'
}
function tick(now){
  if(!playing)return
  elapsed=Math.min(duration,now-startedAt)
  render()
  if(elapsed>=duration){pause();return}
  frame=requestAnimationFrame(tick)
}
function play(){
  if(playing||!ready||reducedMotion.matches||document.hidden)return
  if(elapsed>=duration)elapsed=0
  playing=true
  startedAt=performance.now()-elapsed
  renderButton();render();frame=requestAnimationFrame(tick)
}
function pause(){
  if(playing)elapsed=Math.min(duration,performance.now()-startedAt)
  playing=false
  cancelAnimationFrame(frame)
  renderButton();render()
}
function startIfVisible(){if(visible&&!userPaused&&elapsed<duration)play()}
function reducedState(){
  pause();elapsed=3500;render()
  transport.hidden=true
  motionNote.textContent='Your reduced-motion preference is on. The complete story is available below.'
  motionNote.hidden=false
}
rig();render();renderButton()
playButton.addEventListener('click',()=>{if(playing){userPaused=true;pause()}else{userPaused=false;play()}})
document.querySelector('#replay').addEventListener('click',()=>{pause();elapsed=0;userPaused=false;play()})
scrub.addEventListener('input',()=>{const position=Number(scrub.value)*1000;userPaused=true;pause();elapsed=position;render();renderButton()})
smallScreen.addEventListener('change',setCamera)
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)reducedState();else{transport.hidden=!ready;motionNote.hidden=true;elapsed=0;userPaused=true;render();renderButton()}})
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else startIfVisible()})
const observer=new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.75
  if(visible)startIfVisible();else if(playing)pause()
},{threshold:.75})
// Wait for both image assets before starting. A missing asset leaves the complete HTML story readable.
Promise.all(['assets/kitchen-setting.webp','assets/people-v3.webp'].map(src=>new Promise((resolve,reject)=>{
  const image=new Image();image.onload=resolve;image.onerror=reject;image.src=src
}))).then(()=>{
  ready=true;transport.hidden=false
  if(reducedMotion.matches)reducedState()
  observer.observe(document.querySelector('.film-body'))
}).catch(()=>{
  pause();transport.hidden=true;motionNote.textContent='The illustration could not load. The complete story is available below.';motionNote.hidden=false
})
