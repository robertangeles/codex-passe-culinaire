import * as THREE from './vendor/three.module.js'
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js'
const materials=new Map(), geometries=new Map()
export function material(color,roughness=.75,metalness=0){const key=[color,roughness,metalness].join(':');if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness}));return materials.get(key)}
function geometry(key,create){if(!geometries.has(key))geometries.set(key,create());return geometries.get(key)}
function mesh(geo,mat,x,y,z,parent){const object=new THREE.Mesh(geo,mat);object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object}
export function box(w,h,d,mat,x,y,z,parent,radius=.025){const r=Math.min(radius,w/3,h/3,d/3);return mesh(geometry(`b:${w}:${h}:${d}:${r}`,()=>new RoundedBoxGeometry(w,h,d,2,r)),mat,x,y,z,parent)}
export function cylinder(rt,rb,height,mat,x,y,z,parent,segments=24){return mesh(geometry(`c:${rt}:${rb}:${height}:${segments}`,()=>new THREE.CylinderGeometry(rt,rb,height,segments)),mat,x,y,z,parent)}
export function sphere(rx,ry,rz,mat,x,y,z,parent){const o=mesh(geometry('sphere',()=>new THREE.SphereGeometry(1,24,16)),mat,x,y,z,parent);o.scale.set(rx,ry,rz);return o}
export function torus(radius,tube,mat,x,y,z,parent){return mesh(geometry(`t:${radius}:${tube}`,()=>new THREE.TorusGeometry(radius,tube,8,32)),mat,x,y,z,parent)}
export function label(text,width,height,foreground,background,x,y,z,parent){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.round(768*height/width);const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle=foreground;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.floor(canvas.height*.40)}px Georgia`;ctx.fillText(text,canvas.width/2,canvas.height/2,canvas.width*.91);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.MeshStandardMaterial({map:texture,roughness:.85});return mesh(new THREE.PlaneGeometry(width,height),mat,x,y,z,parent)}
export function segment(a,b,radius,mat,parent){const o=cylinder(radius,radius,1,mat,0,0,0,parent,16);setSegment(o,a,b);return o}
export function setSegment(object,a,b){object.position.copy(a).add(b).multiplyScalar(.5);object.scale.y=a.distanceTo(b);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3().subVectors(b,a).normalize())}
export function contactShadow(width,depth,x,z,parent,opacity=.18){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d');const fill=ctx.createRadialGradient(64,64,8,64,64,64);fill.addColorStop(0,'rgba(32,23,12,.55)');fill.addColorStop(1,'rgba(32,23,12,0)');ctx.fillStyle=fill;ctx.fillRect(0,0,128,128);const o=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,opacity,depthWrite:false}));o.rotation.x=-Math.PI/2;o.position.set(x,.008,z);parent.add(o);return o}
export {THREE}

// Bake the fixed set into one draw per material. Hinged and animated objects stay separate.
export function batchStaticMeshes(root, excluded=new Set()){
 root.updateMatrixWorld(true)
 const inverse=root.matrixWorld.clone().invert(),buckets=new Map()
 function collect(node){
  if(excluded.has(node))return
  if(node.isMesh&&!Array.isArray(node.material)){
   const key=`${node.material.uuid}:${node.castShadow}:${node.receiveShadow}`
   if(!buckets.has(key))buckets.set(key,{material:node.material,cast:node.castShadow,receive:node.receiveShadow,nodes:[]})
   buckets.get(key).nodes.push(node)
  }
  for(const child of node.children)collect(child)
 }
 for(const child of root.children)collect(child)
 for(const bucket of buckets.values()){
  if(bucket.nodes.length<2)continue
  const geometries=bucket.nodes.map(node=>{const g=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();g.applyMatrix4(inverse.clone().multiply(node.matrixWorld));return g})
  const merged=new THREE.BufferGeometry()
  for(const name of ['position','normal','uv']){
   const size=geometries[0].getAttribute(name).itemSize,length=geometries.reduce((sum,g)=>sum+g.getAttribute(name).array.length,0),data=new Float32Array(length)
   let offset=0;for(const g of geometries){const values=g.getAttribute(name).array;data.set(values,offset);offset+=values.length}
   merged.setAttribute(name,new THREE.BufferAttribute(data,size))
  }
  merged.computeBoundingSphere();const mesh=new THREE.Mesh(merged,bucket.material);mesh.castShadow=bucket.cast;mesh.receiveShadow=bucket.receive;root.add(mesh)
  for(const node of bucket.nodes)node.removeFromParent()
  for(const g of geometries)g.dispose()
 }
}
