const C='ritmo-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html'])))});
self.addEventListener('activate',e=>self.clients.claim());
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    return caches.open(C).then(c=>{c.put(e.request,resp.clone());return resp;});
  }).catch(()=>caches.match('./index.html'))));
});
