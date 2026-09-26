// Local design server with byte ranges, required for reliable native-video seeking.
import {createServer} from 'node:http'
import {createReadStream} from 'node:fs'
import {stat} from 'node:fs/promises'
import {resolve,extname,sep} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,''),port=Number(process.env.DESIGN_PORT||4182)
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm','.md':'text/plain; charset=utf-8'}
createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname))
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  let info=await stat(path);if(info.isDirectory()){path=resolve(path,'index.html');info=await stat(path)}
  let start=0,end=info.size-1,status=200
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range)
   if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return}
   start=match[1]?Number(match[1]):Math.max(0,info.size-Number(match[2]));end=match[1]&&match[2]?Math.min(Number(match[2]),info.size-1):info.size-1
   if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return}status=206
  }
  const headers={'Content-Type':types[extname(path)]||'application/octet-stream','Content-Length':Math.max(0,end-start+1),'Accept-Ranges':'bytes','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
  if(status===206)headers['Content-Range']=`bytes ${start}-${end}/${info.size}`
  res.writeHead(status,headers);if(req.method==='HEAD'||!info.size){res.end();return}
  const stream=createReadStream(path,{start,end});res.on('close',()=>stream.destroy());stream.on('error',()=>res.destroy()).pipe(res)
 }catch(error){res.writeHead(error.code==='ENOENT'?404:400);res.end('Preview unavailable.')}
}).listen(port,'127.0.0.1',()=>console.log(`Design preview: http://127.0.0.1:${port}/kitchen-animation/cinema/`))
