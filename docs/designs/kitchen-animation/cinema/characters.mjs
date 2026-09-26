import {THREE,material,box,cylinder,sphere,segment,setSegment,contactShadow} from './geometry.mjs'
const vec=(x,y,z)=>new THREE.Vector3(x,y,z)
const up=vec(0,1,0)
// All limbs are solved in metres. Tools use the same hand targets as the arm rig.
function elbow(start,end,l1,l2,bend){
 const delta=end.clone().sub(start), distance=Math.min(l1+l2-.001,Math.max(.025,delta.length())), direction=delta.normalize()
 const along=(l1*l1-l2*l2+distance*distance)/(2*distance)
 const perpendicular=bend.clone().addScaledVector(direction,-bend.dot(direction)).normalize()
 return start.clone().addScaledVector(direction,along).addScaledVector(perpendicular,Math.sqrt(Math.max(0,l1*l1-along*along)))
}
export function createCharacter({role='chef',skin='#bb805d',hair='#49372d',clothes='#f2ebd9',apron='#46583f'}={}){
 const group=new THREE.Group(), body=new THREE.Group();group.add(body)
 const skinMat=material(skin,.88), hairMat=material(hair,.95), cloth=material(clothes,.92), pants=material(role==='chef'?'#333b31':'#515747',.95), shoe=material('#302b25',.75), apronMat=material(apron,.94), ivory=material('#eee6d5',.9), brass=material('#b29b68',.45,.35)
 // Adult silhouette: 1.76m high, 0.43m shoulders, 0.24m head.
 const torso=box(.40,.48,.225,cloth,0,1.20,0,body,.065)
 sphere(.185,.078,.108,cloth,0,1.407,0,body)
 box(.31,.14,.21,pants,0,.94,0,body,.045)
 const neck=cylinder(.061,.065,.105,skinMat,0,1.474,0,body)
 const head=new THREE.Group();head.position.set(0,1.62,0);body.add(head)
 sphere(.101,.135,.100,skinMat,0,0,0,head)
 sphere(.057,.047,.059,skinMat,0,-.080,.021,head)
 // Small, symmetrical features. The head is one rigid object, never stretched.
 for(const side of [-1,1]){
  sphere(.016,.027,.013,skinMat,side*.101,-.01,-.003,head)
  sphere(.012,.005,.004,ivory,side*.036,.020,.094,head)
  sphere(.005,.005,.003,material('#33382d'),side*.036,.020,.098,head)
  const brow=box(.038,.006,.008,hairMat,side*.039,.043,.092,head,.003);brow.rotation.z=side*-.06
 }
 sphere(.015,.023,.027,skinMat,0,-.004,.101,head)
 const mouth=box(.033,.004,.008,material('#895c47'),0,-.049,.097,head,.002)
 sphere(.095,.061,.100,hairMat,0,.085,-.012,head)
 if(role==='chef'){
  cylinder(.106,.103,.060,ivory,0,.129,-.005,head,32)
  sphere(.105,.035,.100,ivory,0,.160,-.005,head)
  sphere(.045,.042,.045,hairMat,0,.010,-.108,head)
  // Double-breasted jacket, short collar, practical apron and tied waist.
  for(const side of [-1,1])for(let i=0;i<3;i++)sphere(.009,.009,.006,brass,side*.058,1.34-i*.067,.119,body)
  for(const side of [-1,1]){const collar=box(.10,.070,.018,ivory,side*.045,1.438,.071,body,.008);collar.rotation.z=side*-.34}
  box(.355,.39,.022,apronMat,0,.79,.127,body,.016)
  box(.38,.027,.029,apronMat,0,1.01,.126,body,.008)
  box(.13,.105,.006,material('#59694d'),.078,.836,.142,body,.007)
  for(const side of [-1,1]){const tie=box(.023,.11,.009,apronMat,side*.017,.958,.145,body,.004);tie.rotation.z=side*.18}
 }else if(role==='owner'){
  // Silver swept hair, a quiet dark knit and a brass watch.
  for(let i=0;i<5;i++)sphere(.04,.035,.086,hairMat,-.073+i*.035,.090+Math.sin(i)*.01,-.005,head)
  const seam=box(.012,.22,.008,material('#727a63'),0,1.28,.12,body,.003);seam.rotation.z=.02
 }else{
  for(const side of [-1,1])box(.10,.105,.01,cloth,side*.097,1.28,.12,body,.01)
  box(.018,.39,.016,material('#dfd0b4'),0,1.22,.125,body,.004)
  sphere(.081,.038,.087,hairMat,0,-.072,.012,head)
  // Keep the mouth and chin clear, suggesting a short beard without a mask.
  sphere(.051,.022,.035,skinMat,0,-.047,.087,head)
 }
 const arms=[]
 for(const side of [-1,1]){
  const shoulder=vec(side*.218,1.362,0), hand=vec(side*.22,1.065,.38), bend=vec(side,-.15,-.1), joint=elbow(shoulder,hand,.29,.285,bend)
  sphere(.068,.083,.074,cloth,shoulder.x,shoulder.y,shoulder.z,body)
  const upper=segment(shoulder,joint,.063,cloth,body), fore=segment(joint,hand,.050,cloth,body)
  const elbowMesh=sphere(.057,.057,.057,cloth,0,0,0,body)
  const cuff=segment(joint,hand,.053,ivory,body)
  const palm=new THREE.Group();body.add(palm)
  sphere(.039,.041,.048,skinMat,0,0,0,palm)
  for(let f=0;f<4;f++)sphere(.008,.021,.009,skinMat,(f-1.5)*.015,-.016,.028,palm)
  sphere(.014,.025,.013,skinMat,side*.034,.008,.004,palm)
  if(role==='owner'&&side===-1){const watch=cylinder(.022,.022,.008,brass,0,.035,0,palm);watch.rotation.x=Math.PI/2}
  arms.push({side,shoulder,upper,fore,cuff,elbowMesh,palm,bend,hand:hand.clone()})
 }
 const legs=[]
 for(const side of [-1,1]){
  const hip=vec(side*.10,.92,0), foot=vec(side*.105,.075,.018), knee=elbow(hip,foot,.405,.405,vec(0,0,1))
  const upper=segment(hip,knee,.074,pants,group), lower=segment(knee,foot,.06,pants,group)
  const kneeMesh=sphere(.066,.064,.067,pants,0,0,0,group)
  const boot=box(.13,.105,.24,shoe,foot.x,.060,foot.z+.04,group,.038)
  legs.push({side,hip,upper,lower,kneeMesh,boot})
 }
 const shadow=contactShadow(.67,.58,0,0,group,.35)
 function pose({x=0,z=0,yaw=0,walk=0,phase=0,left=[-.22,1.08,.34],right=[.22,1.08,.34],lean=0,look=0,crouch=0}={}){
  group.position.set(x,0,z);group.rotation.y=yaw
  const bob=walk*.013*Math.sin(phase*Math.PI*4)
  body.position.y=.94*(1-Math.cos(lean))+bob-crouch;body.position.z=-.94*Math.sin(lean);body.rotation.x=lean;head.rotation.x=look
  for(const arm of arms){
   const target=new THREE.Vector3().fromArray(arm.side===-1?left:right)
   const reach=target.clone().sub(arm.shoulder);if(reach.length()>.574)target.copy(arm.shoulder).add(reach.setLength(.574))
   const joint=elbow(arm.shoulder,target,.29,.285,arm.bend)
   setSegment(arm.upper,arm.shoulder,joint);setSegment(arm.fore,joint,target);arm.elbowMesh.position.copy(joint)
   const near=target.clone().lerp(joint,.12);setSegment(arm.cuff,near,target)
   arm.palm.position.copy(target);arm.palm.rotation.set(.12,0,arm.side*-.07);arm.hand.copy(target)
  }
  for(const leg of legs){
   const cycle=((phase+(leg.side===-1?0:.5))%1+1)%1
   let step, lift
   if(cycle<.5){step=.19-.76*cycle;lift=0}else{const u=(cycle-.5)*2;step=-.19+.38*(u*u*(3-2*u));lift=Math.sin(u*Math.PI)*.11}
   const foot=vec(leg.side*.105,.075+lift*walk,.018+step*walk)
   const hip=leg.hip.clone();hip.y+=bob-crouch
   const joint=elbow(hip,foot,.425,.425,vec(0,0,1))
   setSegment(leg.upper,hip,joint);setSegment(leg.lower,joint,foot);leg.kneeMesh.position.copy(joint)
   leg.boot.position.set(foot.x,foot.y-.025,foot.z+.04);leg.boot.rotation.x=walk*(cycle>.5?-.18*Math.sin((cycle-.5)*Math.PI*2):0)
  }
 }
 function handWorld(side){group.updateMatrixWorld(true);return body.localToWorld(arms[side==='left'?0:1].hand.clone())}
 pose()
 return {group,pose,handWorld,head,body,arms,legs,shadow,dimensions:{height:1.80,shoulders:.44}}
}
