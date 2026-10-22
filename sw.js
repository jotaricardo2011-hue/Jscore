const V="jscore-shell-v8",L="jscore-libs";
const SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
/* bibliotecas externas baixadas já na instalação, para PDF, ABC e fontes funcionarem sem internet */
const LIBS=["https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js","https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js","https://cdnjs.cloudflare.com/ajax/libs/abcjs/6.4.4/abcjs-basic-min.js"];
const FONTCSS="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
async function precacheLibs(){const c=await caches.open(L);const add=u=>c.match(u).then(h=>h||c.add(u));
 await Promise.allSettled(LIBS.map(add));
 try{const r=await fetch(FONTCSS);if(!r.ok)return;const t=await r.clone().text();await c.put(FONTCSS,r);
  const us=[...t.matchAll(/\/\*\s*latin\s*\*\/\s*@font-face\s*\{[^}]*?url\((https:[^)]+)\)/g)].map(m=>m[1]);await Promise.allSettled(us.map(add))}catch(e){}}
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>precacheLibs().catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==L).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request;const u=new URL(r.url);
 if(r.method==="POST"&&u.pathname.endsWith("/share-target")){
  e.respondWith((async()=>{const fd=await r.formData();const c=await caches.open("jscore-share");for(const k of await c.keys())await c.delete(k);let i=0;
   for(const f of fd.getAll("files")){await c.put(new Request(new URL("shared/"+(i++)+"-"+encodeURIComponent(f.name),self.registration.scope).href),new Response(f,{headers:{"Content-Type":f.type||"application/octet-stream"}}))}
   return Response.redirect(new URL("./?share=1",self.registration.scope).href,303)})());return}
 if(r.method!=="GET")return;
 if(/cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.host)){
  e.respondWith(caches.open(L).then(c=>c.match(r).then(h=>h||fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res}))));return}
 if(u.origin===location.origin){
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match("index.html"))));}
});
