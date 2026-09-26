const duration = 32000
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
const film = document.querySelector('#film')
const stage = document.querySelector('#stage')
const backdrop = document.querySelector('#backdrop')
const playButton = document.querySelector('#play-pause')
const playLabel = document.querySelector('#play-label')
const timeLabel = document.querySelector('#time')
const progress = document.querySelector('#progress-fill')
const acts = [
  { at: 0, title: 'Before opening', caption: 'A recipe becomes a menu, a cost and an order for the day ahead.' },
  { at: 6000, title: 'The delivery', caption: 'The chef checks the delivery. Ten kilos of pears are accepted and recorded.' },
  { at: 12000, title: 'Mise en place', caption: 'Ingredients move to the section. The chef records the transfer and begins preparation.' },
  { at: 20000, title: 'Service', caption: 'A prepared section and a shared handover bring the team to the pass.' },
  { at: 26000, title: 'At the close', caption: 'Waste, stock and costs are reviewed before tomorrow’s decisions.' },
]
const animations = []
let elapsed = 0
let startedAt = 0
let playing = false
let visible = false
let userPaused = false
let frame
let currentAct = -1

function animate(selector, keyframes, start, length, options = {}) {
  const element = document.querySelector(selector)
  if (!element) return
  const animation = element.animate(keyframes, { delay: start, duration: length, fill: 'both', easing: 'ease-in-out', ...options })
  animation.pause()
  animation.currentTime = 0
  animations.push(animation)
}
function appear(selector, start, end) {
  const element = document.querySelector(selector)
  if (!element) return
  if (element.classList.contains('scene-note') || selector === '#opening-card') element.style.display = 'block'
  if (selector === '#film-brand') element.style.display = 'flex'
  animate(selector, [{opacity:0,offset:0},{opacity:1,offset:.08},{opacity:1,offset:.9},{opacity:0,offset:1}],start,end-start)
}
function rig() {
  appear('#opening-card', 0, 2300)
  appear('#note-plan', 2200, 6100)
  appear('#note-receive', 6200, 12100)
  appear('#note-prep', 12300, 20100)
  appear('#note-service', 20300, 26100)
  appear('#note-close', 26200, 30900)
  const brand = document.querySelector('#film-brand')
  brand.style.display = 'flex'
  animate('#film-brand', [{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],30000,1400)

  animate('#chef', [{opacity:0,transform:'translateX(110px)'},{opacity:1,transform:'translateX(0)'}],500,1800)
  animate('#chef-head', [{transform:'rotate(0deg)'},{transform:'rotate(-8deg)'},{transform:'rotate(0deg)'}],1800,2600)
  document.querySelector('#chef-head').style.transformOrigin = '600px 290px'
  if (document.querySelector('#chef-eyelids')) {
    animate('#chef-eyelids',[{opacity:0},{opacity:1,offset:.45},{opacity:1,offset:.55},{opacity:0}],4700,180)
  }
  appear('#recipe-paper',1600,6200)
  animate('#recipe-paper',[{transform:'translate(-100px, -85px) rotate(-14deg)'},{transform:'translate(0, 0) rotate(-5deg)'}],1500,1800)

  appear('#delivery-person',6100,11200)
  appear('#delivery-crate',6100,11800)
  for(const selector of ['#delivery-person','#delivery-crate']) {
    animate(selector,[{transform:'translate(-320px, 0)'},{transform:'translate(-180px, -9px)',offset:.42},{transform:'translate(0, 0)'}],6100,2700)
  }
  for(const [selector,origin,angle] of [['#delivery-leg-left','108px 474px',13],['#delivery-leg-right','151px 475px',-13]]) {
    const element=document.querySelector(selector)
    if(element) element.style.transformOrigin=origin
    animate(selector,[{transform:`rotate(${-angle}deg)`},{transform:`rotate(${angle}deg)`},{transform:`rotate(${-angle}deg)`}],6100,650,{iterations:4})
  }
  appear('#stock-pears',9400,19100)
  animate('#stock-pears',[{transform:'translate(-110px, 185px) scale(.85)'},{transform:'translate(0, 0) scale(1)'}],9400,1800)

  appear('#prep-pear',11800,19800)
  animate('#prep-pear',[{transform:'translate(-95px, -145px) rotate(-14deg)'},{transform:'translate(0, 0) rotate(0)'}],11800,1700)
  appear('#prep-bowl',12300,20200)
  appear('#whisk',12700,20100)
  document.querySelector('#chef-upper-arm').style.transformOrigin='656px 323px'
  document.querySelector('#chef-forearm').style.transformOrigin='660px 369px'
  document.querySelector('#whisk').style.transformOrigin='660px 369px'
  animate('#chef-upper-arm',[{transform:'rotate(0deg)'},{transform:'rotate(-3deg)'},{transform:'rotate(0deg)'}],13000,1100,{iterations:6})
  for (const part of ['#chef-forearm', '#chef-hand', '#whisk']) {
    document.querySelector(part).style.transformOrigin='660px 369px'
    animate(part,[{transform:'rotate(0deg)'},{transform:'rotate(19deg)'},{transform:'rotate(0deg)'}],13000,1100,{iterations:6})
  }
  animate('#chef-head',[{transform:'rotate(-4deg)'},{transform:'rotate(3deg)'},{transform:'rotate(-4deg)'}],13000,2200,{iterations:3,composite:'add'})

  appear('#service-plate',20000,26200)
  appear('#service-hand',22400,26200)
  animate('#service-plate',[{transform:'translate(-270px, 0)'},{transform:'translate(0, 0)',offset:.6},{transform:'translate(80px, 0)'}],20000,5500)
  animate('#service-hand',[{transform:'translate(210px, 0)'},{transform:'translate(0, 0)',offset:.35},{transform:'translate(90px, 0)'}],22200,3500)
  animate('#chef-head',[{transform:'rotate(0deg)'},{transform:'rotate(8deg)'},{transform:'rotate(0deg)'}],21000,2800,{composite:'add'})

  appear('#waste-bowl',26000,31500)
  appear('#closing-ledger',26700,32000)
  animate('#waste-bowl',[{transform:'translate(-160px, -50px)'},{transform:'translate(0, 0)'}],25900,1500)
  animate('#closing-ledger',[{transform:'translate(80px, 80px) rotate(12deg)'},{transform:'translate(0, 0) rotate(-3deg)'}],26600,1800)
}
function renderClock() {
  const act = acts.reduce((found,item,index)=>elapsed>=item.at?index:found,0)
  if(act!==currentAct){
    currentAct=act;film.dataset.act=String(act)
    document.querySelector('#act-number').textContent=String(act+1).padStart(2,'0')
    document.querySelector('#act-title').textContent=acts[act].title
    document.querySelector('#caption').textContent=acts[act].caption
  }
  progress.style.transform=`scaleX(${Math.min(1,elapsed/duration)})`
  timeLabel.textContent=`0:${String(Math.floor(elapsed/1000)).padStart(2,'0')} / 0:32`
  film.dataset.playing=String(playing)
}
function renderButton(){
  playLabel.textContent=playing?'Pause':elapsed>=duration?'Play again':'Play'
  playButton.setAttribute('aria-label',playing?'Pause animation':elapsed>=duration?'Play animation again':'Play animation')
  document.querySelector('#pause-icon').style.display=playing?'':'none'
}
function tick(now){
  if(!playing)return
  elapsed=Math.min(duration,now-startedAt)
  renderClock()
  if(elapsed>=duration){pause();return}
  frame=requestAnimationFrame(tick)
}
function play(){
  if(playing||reducedMotion.matches||document.hidden)return
  if(elapsed>=duration)elapsed=0
  playing=true;startedAt=performance.now()-elapsed
  animations.forEach(a=>{a.currentTime=elapsed;if(elapsed<a.effect.getComputedTiming().endTime)a.play();else a.pause()})
  renderButton();renderClock();frame=requestAnimationFrame(tick)
}
function pause(){
  if(playing)elapsed=Math.min(duration,performance.now()-startedAt)
  playing=false;cancelAnimationFrame(frame)
  animations.forEach(a=>{a.pause();a.currentTime=elapsed})
  renderButton();renderClock()
}
function reducedState(){
  pause();elapsed=16500;animations.forEach(a=>{a.currentTime=elapsed})
  renderClock();document.querySelector('#transport').hidden=true
  document.querySelector('#motion-note').hidden=false
}
function startIfVisible(){if(visible&&!userPaused&&elapsed<duration&&!document.hidden&&!reducedMotion.matches)play()}
rig()
// A readable, complete still remains if motion is reduced or autoplay has not begun.
animations.forEach(a=>{a.currentTime=1700})
playButton.addEventListener('click',()=>{if(playing){userPaused=true;pause()}else{userPaused=false;play()}})
document.querySelector('#replay').addEventListener('click',()=>{pause();elapsed=0;userPaused=false;play()})
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)reducedState();else{document.querySelector('#transport').hidden=false;document.querySelector('#motion-note').hidden=true;elapsed=0;userPaused=true;animations.forEach(a=>{a.currentTime=1700});renderClock();renderButton()}})
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else startIfVisible()})
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.35;if(visible)startIfVisible();else if(playing)pause()},{threshold:.35})
function ready(){
  document.querySelector('#transport').hidden=false
  if(reducedMotion.matches)reducedState()
  observer.observe(stage)
}
if(backdrop.complete&&backdrop.naturalWidth>0)ready();else backdrop.addEventListener('load',ready,{once:true})
backdrop.addEventListener('error',()=>{document.querySelector('#motion-note').textContent='The illustration could not load. The complete story is available below.';document.querySelector('#motion-note').hidden=false;pause()},{once:true})
