/* PWA: mendaftarkan service worker, tombol "Pasang aplikasi", dan pemberitahuan offline/online. Hanya aktif di http(s) atau localhost. */
(() => {
  if (location.protocol === 'file:' || !('serviceWorker' in navigator)) return;
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller && window.G) G.toast('Versi baru tersedia. Muat ulang halaman untuk memakainya.'); }); });
    }).catch(() => {});
  });
  let ev = null;
  addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); ev = e;
    const bar = document.querySelector('.foot-bar'); if (!bar || document.getElementById('installBtn')) return;
    const b = document.createElement('button'); b.id = 'installBtn'; b.type = 'button'; b.textContent = 'Pasang aplikasi'; b.style.fontWeight = '700'; bar.append(b);
    b.onclick = async () => { ev.prompt(); await ev.userChoice; ev = null; b.remove(); };
  });
  addEventListener('appinstalled', () => { const b = document.getElementById('installBtn'); if (b) b.remove(); if (window.G) G.toast('Aplikasi Ganexio terpasang'); });
  addEventListener('offline', () => window.G && G.toast('Anda offline. Perubahan disimpan dan dikirim saat tersambung.', 'err'));
  addEventListener('online', () => window.G && G.toast('Kembali online'));
})();
