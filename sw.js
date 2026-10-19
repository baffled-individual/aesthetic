// Bump VERSION on every release (and keep it in sync with the version shown in More > About).
const VERSION="1.3.1",PREFIX="baffled-app-",CACHE=PREFIX+VERSION,ASSETS=["./","index.html","manifest.webmanifest","icon.svg"];
// Install: download every asset fresh (bypassing HTTP cache) into a NEW versioned cache. All-or-nothing:
// if anything fails, the partial cache is deleted and the old version keeps running.
self.addEventListener("install",e=>e.waitUntil((async()=>{try{const c=await caches.open(CACHE);await Promise.all(ASSETS.map(async u=>{const r=await fetch(new Request(u,{cache:"reload"}));if(!r.ok)throw new Error(u+" "+r.status);await c.put(u,r)}))}catch(err){await caches.delete(CACHE);throw err}})()));
// Activate: remove only OLD app-asset caches (never touches IndexedDB/localStorage), then take over.
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith("baffled-")&&k!==CACHE)await caches.delete(k);await self.clients.claim()})()));
// The page asks to switch only when the user taps Update, so a running session never mixes old and new files.
self.addEventListener("message",e=>{if(e.data&&e.data.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
 e.respondWith((async()=>{const c=await caches.open(CACHE);if(r.mode==="navigate"){const h=await c.match("index.html");if(h)return h}
  const h=await c.match(r,{ignoreSearch:true});if(h)return h;
  try{return await fetch(r)}catch(_){if(r.mode==="navigate"){const f=await c.match("index.html");if(f)return f}return Response.error()}})())});
