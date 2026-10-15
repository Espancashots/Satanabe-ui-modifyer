const CACHE='satanabe-ui-studio-v207-mobile-preview';
const FILES=['./','./index.html','./style.css','./app.js','./assets/icon.svg','./assets/apple-touch-icon.png','./assets/icon-192.png','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(url.pathname.startsWith('/api/')||e.request.method!=='GET'||url.origin!==location.origin)return;e.respondWith(fetch(e.request).then(res=>{if(res.ok){const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return res;}).catch(()=>caches.match(e.request)));});
