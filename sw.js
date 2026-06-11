const C='meridian-v4';
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html'])));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  // network first, fallback to cache
  e.respondWith(
    fetch(e.request).then(resp=>{
      const clone=resp.clone();
      caches.open(C).then(c=>c.put(e.request,clone));
      return resp;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});

// ── Web Push: el servidor envía el aviso del Pomodoro aunque la app
//    esté cerrada o con la pantalla bloqueada (iOS 16.4+ y Android).
self.addEventListener('push',e=>{
  let d={title:'Meridian',body:''};
  try{ if(e.data) d=Object.assign(d,e.data.json()); }
  catch(_){ if(e.data) d.body=e.data.text(); }
  e.waitUntil(self.registration.showNotification(d.title,{
    body:d.body,
    icon:'./icon.png',
    badge:'./icon.png',
    tag:'pomodoro',
    renotify:true,
    vibrate:[200,100,200],
    data:{url:'./'}
  }));
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const c of list){ if('focus'in c) return c.focus(); }
      if(clients.openWindow) return clients.openWindow('./');
    })
  );
});
