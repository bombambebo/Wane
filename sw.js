// Service worker: เปิดแอปได้แม้ไม่มีอินเทอร์เน็ต (หลังเปิดออนไลน์ครั้งแรก)
const V='shift-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
const EXT=['https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(V);
  await Promise.allSettled([...SHELL.map(u=>c.add(u)),...EXT.map(u=>c.add(new Request(u,{mode:'no-cors'})))]);
  self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  const ks=await caches.keys();
  await Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)));
  await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  if(r.mode==='navigate'){
    // หน้าหลัก: ลองเอาตัวล่าสุดจากเน็ตก่อน ถ้าไม่มีเน็ตใช้ตัวที่เก็บไว้
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp));return res})
      .catch(()=>caches.match('index.html').then(x=>x||caches.match('./'))));
    return}
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))caches.open(V).then(c=>c.put(r,res.clone()));return res}).catch(()=>hit);
    return hit||net}))});
