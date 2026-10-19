/* Service worker Ganexio: membuat website bisa dibuka tanpa internet dan dapat dipasang seperti aplikasi.
   - Halaman: coba jaringan dulu (agar pembaruan cepat sampai), jika gagal pakai salinan tersimpan.
   - Berkas statis: dari tembolok, diperbarui di belakang layar.
   - /api/ tidak disimpan (data memakai antrean sinkronisasi di js/sync.js).
   Ubah VERSION setiap kali berkas diperbarui. Daftar PRECACHE dibuat otomatis oleh: node tools/make-manifest.js */
const VERSION = 'gx-v2';
/*PRECACHE-START*/const PRECACHE = ["cctv.html","community.html","contacts.html","css/style.css","developer.html","funds.html","img/bg-cctv.svg","img/bg-community.svg","img/bg-contacts.svg","img/bg-funds.svg","img/bg-home.svg","img/bg-info.svg","img/bg-internet.svg","img/bg-logistics.svg","img/bg-market.svg","img/bg-messages.svg","img/bg-supplies.svg","img/favicon.png","img/gal-gereja.svg","img/gal-jalan.svg","img/gal-kantor.svg","img/gal-kebun.svg","img/gal-panorama.svg","img/gal-sekolah.svg","img/icon-192.png","img/icon-512.png","img/icon-maskable-512.png","img/logo-white.png","img/logo.png","img/placeholder-photo.svg","img/placeholder-product.svg","img/placeholder-profile.svg","img/prod-beras.svg","img/prod-ikan.svg","img/prod-keripik.svg","img/prod-kopi.svg","img/prod-madu.svg","img/prod-pisang.svg","img/prod-telur.svg","img/prod-ulos.svg","index.html","info.html","internet.html","js/app.js","js/cctv.js","js/community.js","js/config.js","js/contacts.js","js/dev.js","js/diagram.js","js/funds.js","js/funds2.js","js/fx.js","js/index.js","js/info.js","js/internet.js","js/logistik.js","js/market.js","js/messages.js","js/pwa.js","js/seed.js","js/store.js","js/supplies.js","js/sync.js","logistik.html","manifest.webmanifest","market.html","messages.html","supplies.html","sw.js","./"];/*PRECACHE-END*/
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => { const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; }).catch(() => m); return m || net; }));
});
