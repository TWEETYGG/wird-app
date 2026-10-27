// ورد — Service Worker: يشتغل بدون نت. مواقيت الصلاة بس هي اللي بتتحدّث (الشبكة أولاً، وبعدها آخر نسخة).
const V='wird-v1', S=self.registration.scope;
const SHELL=[S,S+'index.html',S+'manifest.webmanifest',S+'icon-192.png',S+'icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const swr=async(req,key)=>{
  const c=await caches.open(V), hit=await c.match(key||req);
  const net=fetch(req).then(r=>{ if(r&&(r.ok||r.type==='opaque')) c.put(key||req,r.clone()); return r; }).catch(()=>null);
  return hit||net.then(r=>r||new Response('',{status:504}));
};
const netFirst=async req=>{
  const c=await caches.open(V);
  try{ const r=await fetch(req); if(r&&r.ok) c.put(req,r.clone()); return r; }
  catch(e){ return (await c.match(req))||new Response('{}',{status:504}); }
};
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.hostname==='api.aladhan.com'){ e.respondWith(netFirst(r)); return; }
  if(u.hostname==='everyayah.com'||u.hostname==='api.dictionaryapi.dev'||r.headers.has('range')) return;
  if(r.mode==='navigate'){ e.respondWith(swr(S+'index.html')); return; }
  e.respondWith(swr(r));
});
