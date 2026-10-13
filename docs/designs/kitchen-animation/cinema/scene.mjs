import * as h from './geometry.mjs'
import {createCharacter} from './characters.mjs'
import {createKitchen} from './room.mjs'
import {createProps} from './props.mjs'
import {RoomEnvironment} from './vendor/RoomEnvironment.js'
import {chapters,duration} from './story.mjs'
const {THREE}=h, V=(x,y,z)=>new THREE.Vector3(x,y,z)
const stage=document.querySelector('#stage'),renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true})
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.localClippingEnabled=true;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;stage.prepend(renderer.domElement)
renderer.domElement.setAttribute('aria-label','Animated miniature kitchen, following a chef and restaurant owner through their working day')
renderer.domElement.setAttribute('role','img')
const scene=new THREE.Scene();scene.background=new THREE.Color('#e8e1d4')
const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.26
scene.add(new THREE.HemisphereLight('#ffefd3','#646c56',1.4))
const sun=new THREE.DirectionalLight('#fff0d1',2.7);sun.position.set(-3,8,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:25});sun.shadow.bias=-.00015;sun.shadow.normalBias=.012;scene.add(sun)
const fill=new THREE.DirectionalLight('#e2edff',.7);fill.position.set(4,4,-2);scene.add(fill)
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),h.material('#e8e1d4'));ground.rotation.x=-Math.PI/2;ground.position.y=-.13;ground.receiveShadow=true;scene.add(ground)
const room=createKitchen(THREE,h);h.batchStaticMeshes(room.group,new Set([room.ovenDoor,room.ovenTray,room.pantryDoor]));scene.add(room.group)
const props=createProps(THREE,h);scene.add(props.group)
// Slice the actual fruit volume at each knife contact, then let each slice fall.
const cutPlane=new THREE.Plane(V(-1,0,0),100)
props.pearWhole.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.clippingPlanes=[cutPlane]}})
const sliceParts=[...props.pearSlices.children],slices=[]
for(let i=0;i<5;i++){const g=new THREE.Group(),offset=(i-2)*.026;for(const part of sliceParts.slice(i*3,i*3+3)){g.add(part);part.position.x-=offset}props.pearSlices.add(g);slices.push(g)}
const cutFace=h.sphere(.001,.051,.035,h.material('#f1d99a'),0,0,0,scene)
const uploadProgress=h.box(.125,.007,.002,h.material('#889e6d'),0,.044,.012,props.tablet,.001)
const chef=createCharacter();scene.add(chef.group)
const owner=createCharacter({role:'owner',skin:'#d1a17d',hair:'#a3a496',clothes:'#414b3c'});scene.add(owner.group)
const supplier=createCharacter({role:'supplier',skin:'#8d5d40',hair:'#352b25',clothes:'#ac8060'});scene.add(supplier.group)
const stockBasket=props.crate.clone();stockBasket.scale.setScalar(.65);scene.add(stockBasket)
const pencil=new THREE.Group();h.cylinder(.004,.004,.15,h.material('#ad8050'),0,-.035,0,pencil,8);h.cylinder(.004,0,.022,h.material('#38362d'),0,-.12,0,pencil,8);scene.add(pencil)
const peel=h.sphere(.027,.003,.008,h.material('#b8b66c'),0,0,0,scene);peel.visible=false
const steam=new THREE.Group();scene.add(steam)
for(let i=0;i<8;i++){const mat=new THREE.MeshBasicMaterial({color:'#f8f1df',transparent:true,opacity:.12,depthWrite:false});const puff=new THREE.Mesh(new THREE.SphereGeometry(.023,12,8),mat);steam.add(puff)}
const camera=new THREE.OrthographicCamera(-5,5,3,-3,.1,100)
let renderedWidth=0,renderedHeight=0
let viewHeight=6.8,current=0,playing=false,previous=0,activeChapter=-1,activeShot=-1
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), ease=v=>{v=clamp(v);return v*v*(3-2*v)}, mix=(a,b,u)=>a+(b-a)*u, between=(t,a,b)=>ease((t-a)/(b-a))
function resize(){const w=stage.clientWidth,ht=stage.clientHeight;if(w!==renderedWidth||ht!==renderedHeight){renderer.setSize(w,ht,false);renderedWidth=w;renderedHeight=ht}camera.left=-viewHeight*w/ht/2;camera.right=-camera.left;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix()}
function place(o,x,y,z,yaw=0){o.position.set(x,y,z);o.rotation.set(0,yaw,0);o.visible=true}
function handProp(o,person,hand,yOffset=0){o.position.copy(person.handWorld(hand));o.position.y+=yOffset;o.rotation.set(0,person.group.rotation.y,0);o.visible=true}
function carried(o,person,yOffset,scale=1){o.position.copy(person.handWorld('left')).add(person.handWorld('right')).multiplyScalar(.5);o.position.y-=yOffset;o.rotation.set(0,person.group.rotation.y,0);o.scale.setScalar(scale);o.visible=true}
function walking(t,a,b,from,to){const u=clamp((t-a)/(b-a)),s=ease(u),dx=to[0]-from[0],dz=to[1]-from[1],dist=Math.hypot(dx,dz),speed=6*u*(1-u)*dist/(b-a);return {x:mix(from[0],to[0],s),z:mix(from[1],to[1],s),yaw:Math.atan2(dx,dz),walk:clamp(speed/.8),phase:s*dist/.76}}
function localHand(person,world,crouch=0){const q=world.clone().sub(V(person.x,0,person.z)).applyAxisAngle(V(0,1,0),-person.yaw);q.y+=crouch;return q.toArray()}
const shots=[
 [0,[8.8,7,10],[0,.75,-.35],7.2],
 [2.8,[2.5,2.9,3.2],[-.70,1.20,-.6],1.70],
 [9,[6,5.5,8],[-1.2,.95,-.4],5.7],
 [12,[-.8,3.0,2.6],[-3.65,1.32,-1.6],2.7],
 [15,[5.5,5,7],[-1.1,.95,-.4],5.1],
 [19,[2.1,2.65,2.6],[0,1.19,-.53],1.55],
 [24,[-1.8,2.5,2.6],[.58,1.22,-.56],1.55],
 [29,[5.2,4.3,4.3],[1.1,.9,-1.2],4.1],
 [32,[4.0,2.4,-.2],[1.45,.78,-2.0],2.65],
 [37,[4,2.7,.5],[1.45,.8,-2.1],2.6],
 [39,[2.7,2.8,3.5],[.15,1.15,-.52],1.85],
 [43,[1.8,2.45,2.5],[.55,1.26,-.55],1.70],
 [47,[1,4.4,6],[-2.6,1,1.0],4.6],
 [50,[-.4,2.8,4.2],[-2.8,1.20,1.15],2.3],
 [57,[.8,3.8,5.8],[3.2,1.12,1.25],2.8],
 [65,[1.9,2.7,4.7],[3.4,1.18,1.1],1.95],
 [73,[8.8,7,10],[0,.75,-.35],7.2]
]
function poseScene(t){
 for(const object of props.group.children)object.visible=false
 stockBasket.visible=false;pencil.visible=false;peel.visible=false;cutFace.visible=false;cutPlane.constant=100;supplier.group.visible=false;steam.visible=false
 room.ovenDoor.rotation.y=0;room.ovenTray.visible=false;room.pantryDoor.visible=false
 place(props.board,0,.978,-.43);place(props.pearWhole,.065,.982,-.4);place(props.pearSlices,.21,.982,-.36);props.pearSlices.visible=t>=19;for(let i=0;i<5;i++){slices[i].position.set((i-2)*.026,0,0);slices[i].rotation.set(0,0,0);slices[i].visible=true}
 place(props.bowl,.64,.951,-.49);place(props.whisk,.64,1.20,-.49)
 place(props.tray,1.3,.951,-.34);place(props.tarts,1.3,.951,-.34)
 place(props.ledger,-.87,.951,-.44);place(props.wasteBowl,.34,.951,-.36)
 place(props.salesSheets,3.68,1.001,1.04)
 let cp={x:-.8,z:-1.10,yaw:0,look:.25,left:[-.16,1.03,.44],right:[.13,1.13,.45]}, op={x:3.45,z:.58,yaw:0,look:.17,left:[-.105,1.11,.33],right:[.035,1.26,.34]}
 if(t<9){cp.right=[.13+.018*Math.sin(t*4),1.10+.006*Math.cos(t*8),.46+.016*Math.sin(t*3)];cp.look=.2+.025*Math.sin(t);}
 else if(t<12){cp={...cp,...walking(t,9,12,[-.8,-1.1],[-3.75,-1.08]),look:.05}}
 else if(t<15){const turn=between(t,12,12.5);cp={...cp,x:-3.75,z:-1.08,yaw:mix(-Math.PI/2,-Math.PI,turn),look:.10,left:[-.19,1.24,.43],right:[.19,1.24,.43]};}
 else if(t<19){cp={...cp,...walking(t,15,18.5,[-3.75,-1.08],[-.3,-1.1]),left:[-.195,1.13,.38],right:[.195,1.13,.38],look:.07};if(t>18.5)cp.yaw=mix(Math.PI/2,0,between(t,18.5,19))}
 else if(t<24){const chop=(1-Math.cos((t-19)*2*Math.PI*1.4))*.035;cp={...cp,x:0,z:-.95,look:.27,left:[.018,1.065,.48],right:[.105-Math.min(5,Math.floor((t-19)*1.4))*.015,1.027+chop,.41]};}
 else if(t<29){const phase=(t-24)*2*Math.PI*1.45;cp={...cp,x:.55,z:-1.03,look:.24,left:[-.015,1.08,.53],right:[.10+Math.cos(phase)*.045,1.25+Math.sin(phase)*.007,.53+Math.sin(phase)*.037]};}
 else if(t<32){cp={...cp,...walking(t,29,31.4,[1.2,-1.10],[1.45,-1.54]),left:[-.25,1.09,.36],right:[.25,1.09,.36],look:.18};cp.yaw=mix(Math.PI/2,Math.PI,between(t,29,31.4));}
 else if(t<37){const lower=between(t,32,33.7),push=between(t,33.7,35.2),retract=between(t,35.4,36.4);cp={...cp,x:1.45,z:mix(-1.54,-1.70,push),yaw:Math.PI,crouch:.20*lower*(1-retract),look:.23,left:[-.25,mix(1.09,1.07,lower)*(1-retract)+1.15*retract,mix(.36,.47,push)*(1-retract)+.27*retract],right:[.25,mix(1.09,1.07,lower)*(1-retract)+1.15*retract,mix(.36,.47,push)*(1-retract)+.27*retract]};}
 else if(t<39){cp={...cp,x:1.45,z:-1.45,yaw:Math.PI,look:.2,left:[-.22,1.12,.25],right:[.08,1.1,.34]}}
 else if(t<43){cp={...cp,x:0,z:-.94,look:.25,left:[-.15,1.08,.4],right:[.31,1.15,.44]};}
 else if(t<47){cp={...cp,x:.60,z:-1.03,look:.2,left:[-.11,1.12,.37],right:[.035,1.24,.39]};}
 else if(t<57){cp={...cp,x:-2.8,z:.52,yaw:0,look:.18,left:[-.2,1.12,.30],right:[.13,1.21+.015*Math.sin(t*2),.41]};if(t<50)cp={...cp,...walking(t,47,49.8,[-2.4,-.8],[-2.8,.52])}}
 else {cp={...cp,x:2.60,z:1.90,yaw:Math.PI/2,look:.02,left:[-.20,1.04,.23],right:[.20,1.15+.025*Math.sin(t*2),.27]};op.look=t<65?-.02:.18;}
 // Gentle respiratory movement, kept inside the joint rig.
 cp.left=cp.left.map((v,i)=>i===1?v+.003*Math.sin(t*1.5):v);cp.right=cp.right.map((v,i)=>i===1?v+.003*Math.sin(t*1.5):v)
 if(cp.walk>.01 && !(t>=15&&t<19) && !(t>=29&&t<32)){cp.left=[-.24,1.03,.10+Math.sin(cp.phase*Math.PI*2)*.16];cp.right=[.24,1.03,.10-Math.sin(cp.phase*Math.PI*2)*.16]}
 // The owner holds a tablet from its bottom edge, tapping with the free hand.
 op.right=[-.035,1.25,.30+.006*Math.sin(t*3)]
 if(t>=65&&t<69){const lift=between(t,65.7,66.7),lower=between(t,68,69),held=lift*(1-lower);op.right=[mix(.23,.18,held),mix(1.013,1.32,held),mix(.46,.34,held)];op.look=.15+.12*held}
 if(t>=69&&t<69.6){const reach=between(t,69,69.6);op.right=[mix(.23,-.035,reach),mix(1.013,1.25,reach),mix(.46,.30,reach)]}
 uploadProgress.visible=t>=69.6&&t<73;uploadProgress.scale.x=Math.max(.001,between(t,69.6,72))
 chef.pose(cp);owner.pose(op)
 handProp(props.tablet,owner,'left');props.tablet.rotation.y=op.yaw+Math.PI;props.tablet.rotation.x=-.20
 if(t<9){handProp(pencil,chef,'right');pencil.rotation.z=-.15}
 if(t>=12&&t<19){carried(stockBasket,chef,.13,.65)}else if(t<12){place(stockBasket,-3.75,1.21,-1.72);stockBasket.scale.setScalar(.65)}else {place(stockBasket,-1.42,.951,-.35);stockBasket.scale.setScalar(.65)}
 if(t>=19&&t<24){handProp(props.knife,chef,'right');props.pearWhole.scale.setScalar(1)
  const cuts=Math.min(5,Math.floor((t-19)*1.4)),cutX=.112-cuts*.015
  cutPlane.constant=cutX;cutFace.visible=cuts>0;cutFace.position.set(cutX,1.035,-.40);cutFace.scale.z=.035*Math.sqrt(Math.max(.001,1-((cutX-.065)/.046)**2))
  for(let i=0;i<5;i++){const born=19+(i+1)/1.4,u=between(t,born,born+.28);slices[i].visible=t>=born;slices[i].position.set(mix((.105-i*.015)-.21,(i-2)*.026,u),mix(.045,0,u),mix(-.04,0,u));slices[i].rotation.z=mix(Math.PI/2,0,u)}}else {place(props.knife,.25,.988,-.12,Math.PI/2);props.knife.rotation.z=-Math.PI/2;props.pearWhole.scale.setScalar(1)}
 if(t>=24)props.pearWhole.visible=false
 props.filling.rotation.y=Math.max(0,Math.min(t-24,5))*2*Math.PI*.6
 if(t>=24&&t<29){handProp(props.whisk,chef,'right')}
 if(t<29)props.tarts.visible=false
 if(t>=65.7&&t<69){handProp(props.salesSheets,owner,'right',-.012);props.salesSheets.rotation.x=-between(t,65.7,66.7)*(1-between(t,68,69))*1.15}
 if(t>=29&&t<35.4){carried(props.tray,chef,.017);props.tray.position.add(V(0,0,.14).applyAxisAngle(V(0,1,0),cp.yaw));props.tarts.position.copy(props.tray.position);props.tarts.rotation.copy(props.tray.rotation)}
 if(t>=29&&t<37)room.ovenDoor.rotation.y=-Math.PI/2
 if(t>=35.4&&t<39){place(props.tray,1.45,.853,-2.31);place(props.tarts,1.45,.853,-2.31)}
 if(t>=37&&t<39){room.ovenDoor.rotation.y=-(1-between(t,37,38))*Math.PI/2;room.ovenDoor.updateMatrixWorld(true);const handle=V(.80,.40,.065).applyMatrix4(room.ovenDoor.matrixWorld);cp.crouch=.16;cp.right=localHand(cp,handle,.16);chef.pose(cp)}
 if(t>=39&&t<43){const transfer=between(t,39.7,41.5);props.wasteBowl.position.set(.32,.951,-.46);cp.right=[mix(.06,.31,transfer),1.045+.15*Math.sin(transfer*Math.PI),mix(.46,.49,transfer)];chef.pose(cp);if(t<41.5){handProp(peel,chef,'right',-.025)}else{place(peel,.32,mix(1.04,1.00,between(t,41.5,41.8)),-.46)}}
 if(t>=43&&t<47){handProp(props.tablet,chef,'left');props.tablet.rotation.y=Math.PI;props.tablet.rotation.x=-.18}
 if(t>=47){
  supplier.group.visible=true
  let sp={x:-2.8,z:1.98,yaw:Math.PI,look:.16,left:[-.30,1.28,.37],right:[.30,1.28,.37]}
  if(t<49.5)sp={...sp,...walking(t,47,49.5,[-3.70,2.55],[-2.8,1.98])}
  const lower=between(t,49.5,50.7),release=between(t,50.95,51.6)
  if(t>=49.5)sp={...sp,...walking(t,49.5,50.7,[-2.8,1.98],[-2.8,1.77])}
  sp.left=[mix(-.30,-.23,release),mix(mix(1.28,1.175,lower),1.02,release),mix(mix(.37,.51,lower),.16,release)]
  sp.right=[mix(.30,.23,release),sp.left[1],sp.left[2]]
  supplier.pose(sp)
  if(t<50.7)carried(props.crate,supplier,.20);else place(props.crate,-2.8,.975,1.26)
 }

 if(t>=51&&t<54){handProp(props.pearWhole,chef,'right',-.03);props.pearWhole.scale.setScalar(1);cp.look=.12;}
 if(t>=39){steam.visible=t<43;steam.children.forEach((p,i)=>{const u=((t*.4+i*.12)%1);p.position.set(1.3+Math.sin(i*2+u*3)*.07,1.03+u*.25,-.32+Math.cos(i*3)*.06);p.scale.setScalar(.5+u*1.7);p.material.opacity=(1-u)*.13})}
 return {cp,op}
}
function updateCopy(index,t){const c=chapters[index];if(index!==activeChapter){activeChapter=index;document.querySelector('#chapter-time').textContent=c.time;document.querySelector('#chapter-title').textContent=c.title;document.querySelector('#chapter-body').textContent=c.body;document.querySelector('#module').textContent=c.module;document.querySelector('#question').textContent=c.question;document.querySelector('#rows').replaceChildren(...c.rows.map(([label,value])=>{const row=document.createElement('div');const name=document.createElement('span');name.textContent=label;const data=document.createElement('strong');data.textContent=value;row.append(name,data);return row}));document.querySelectorAll('[data-chapter]').forEach((b,i)=>b.setAttribute('aria-current',i===index?'step':'false'))}
 const local=t-c.at;document.querySelectorAll('#rows>div').forEach((r,i)=>r.classList.toggle('arrived',local>1+i*.5));document.querySelector('#progress').style.width=`${t/duration*100}%`;document.querySelector('#seek').value=t;document.querySelector('#time').textContent=`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')} / 1:20`
}
function seek(t){current=clamp(t,0,duration);const index=chapters.findIndex(c=>current>=c.at&&current<c.end);updateCopy(index<0?chapters.length-1:index,current);const pose=poseScene(current);const shotIndex=shots.findLastIndex(s=>s[0]<=current),shot=shots[shotIndex],elapsed=current-shot[0];const drift=clamp(elapsed/10)*.025;camera.position.fromArray(shot[1]);camera.lookAt(new THREE.Vector3().fromArray(shot[2]));viewHeight=shot[3]*(1-drift);if((current>=9&&current<12)||(current>=15&&current<19)){const target=V(pose.cp.x,1.04,pose.cp.z+.25);camera.position.copy(target).add(V(4.5,3.5,5.5));camera.lookAt(target);viewHeight=3.6}if(stage.clientWidth/stage.clientHeight<1.2)viewHeight*=shotIndex===0||current>=73?1.55:1.10;resize();renderer.render(scene,camera);activeShot=shotIndex;return current}
function setPlaying(value){playing=value;document.querySelector('#play').textContent=value?'Pause film':current>=duration?'Replay film':'Play film';document.querySelector('#play').setAttribute('aria-label',value?'Pause the kitchen film':current>=duration?'Replay the kitchen film':'Play the kitchen film')}
window.__cinema={seek,renderer,scene,chef,owner,supplier,props,room,camera,duration,poseScene,get time(){return current},get playing(){return playing},get shot(){return activeShot},play(){if(current>=duration)seek(0);setPlaying(true)},pause(){setPlaying(false)}}
document.querySelector('#seek').max=duration;document.querySelector('#seek').addEventListener('input',e=>{setPlaying(false);seek(Number(e.target.value))})
document.querySelector('#play').addEventListener('click',()=>{if(current>=duration)seek(0);setPlaying(!playing)})
document.querySelectorAll('[data-chapter]').forEach((b,i)=>b.addEventListener('click',()=>{seek(chapters[i].at+.05);setPlaying(false)}))
function tick(now){if(playing){seek(Math.min(duration,current+(now-previous)/1000));if(current>=duration)setPlaying(false)}previous=now;requestAnimationFrame(tick)}
window.addEventListener('resize',()=>seek(current));document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false)});setPlaying(false);seek(0);requestAnimationFrame(tick)
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!new URLSearchParams(location.search).has('paused'))setPlaying(true)
