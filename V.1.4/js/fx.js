/* Efek tampilan: transisi halaman, layar muat (welcome), animasi saat digulir, miring 3D, cahaya kursor, partikel hero, percikan,
   dan foto desa dari internet (Wikimedia Commons). Efek dimatikan oleh pengaturan "Kurangi animasi" (html[data-anim=off]). */
(() => {
  const H = document.documentElement, calm = () => H.dataset.anim === 'off' || matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- Transisi antar halaman: pudar ke warna terpadu lalu halaman baru memudar masuk ---- */
  addEventListener('pageshow', () => { H.classList.remove('navout'); sessionStorage.removeItem('gx_nav'); setTimeout(() => H.classList.remove('navin'), 900); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a || calm() || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href); if (u.origin !== location.origin && u.protocol !== 'file:') return; if (u.pathname === location.pathname && u.hash) return; if (!/\.html?$|\/$/.test(u.pathname)) return;
    e.preventDefault(); sessionStorage.setItem('gx_nav', '1'); H.classList.add('navout'); setTimeout(() => { location.href = a.href; }, 280);
  });

  addEventListener('DOMContentLoaded', () => {
    /* ---- Layar muat halaman welcome ---- */
    const ld = $('#loader');
    if (ld) {
      const t0 = performance.now(), done = () => { document.body.classList.remove('loading'); ld.classList.add('out'); setTimeout(() => ld.remove(), 1000); };
      const go = () => setTimeout(done, Math.max(0, 1700 - (performance.now() - t0)));
      document.readyState === 'complete' ? go() : addEventListener('load', go);
    }
    if (calm()) return;

    /* ---- Bilah kemajuan gulir ---- */
    const bar = document.createElement('div'); bar.className = 'scrollbar-top'; document.body.append(bar);
    addEventListener('scroll', () => { const h = H.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; }, { passive: true });

    /* ---- Muncul saat digulir (elemen di bawah layar saat dimuat) ---- */
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .12 });
    setTimeout(() => $$('.tile,.stat,.sec-title,.steps3>*,.split>*,details,.kpi>*,.card.diagram').forEach(el => { if (el.getBoundingClientRect().top > innerHeight * .95) { el.classList.add('rv'); io.observe(el); } }), 450);

    /* ---- Miring 3D dan sorot cahaya mengikuti kursor ---- */
    let raf = 0;
    document.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const el = e.target.closest ? e.target.closest('.tile,.prod,.card.lift') : null, cg = $('.cursor-glow'); if (cg) { cg.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; cg.style.opacity = 1; }
      if (!el || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0; const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px');
        if (el.matches('.tile')) el.style.transform = `perspective(800px) rotateX(${((y / r.height) - .5) * -9}deg) rotateY(${((x / r.width) - .5) * 11}deg) translateY(-6px)`;
      });
    }, { passive: true });
    document.addEventListener('pointerout', e => { const el = e.target.closest && e.target.closest('.tile'); if (el && !el.contains(e.relatedTarget)) el.style.transform = ''; });
    if (matchMedia('(hover:hover)').matches) { const g = document.createElement('div'); g.className = 'cursor-glow'; document.body.append(g); }

    /* ---- Percikan saat pesan berhasil muncul ---- */
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.classList && n.classList.contains('toast') && n.classList.contains('ok')) {
        const r = n.getBoundingClientRect(), cols = ['#f5b800', '#d7263d', '#1e6fef', '#0a8f5b', '#7a1f5c'];
        for (let i = 0; i < 14; i++) { const s = document.createElement('i'); s.className = 'sparkle'; const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70; s.style.cssText = `left:${r.left + 30}px;top:${r.top + r.height / 2}px;background:${cols[i % 5]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 20}px`; document.body.append(s); setTimeout(() => s.remove(), 950); }
      }
    }))).observe(document.body, { childList: true });

    /* ---- Partikel melayang di hero (animasi diam) ---- */
    const hero = $('.hero');
    if (hero) {
      const cv = document.createElement('canvas'); cv.className = 'pt'; hero.prepend(cv); const x = cv.getContext('2d'); let w, h, P = [];
      const fit = () => { w = cv.width = hero.clientWidth; h = cv.height = hero.clientHeight; P = Array.from({ length: Math.min(36, Math.round(w / 32)) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1 + Math.random() * 2 })); };
      fit(); addEventListener('resize', fit);
      (function loop() {
        if (!document.hidden && !calm()) {
          x.clearRect(0, 0, w, h);
          P.forEach((p, i) => { p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h; x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
            for (let j = i + 1; j < P.length; j++) { const q = P[j], d = Math.hypot(p.x - q.x, p.y - q.y); if (d < 95) { x.strokeStyle = `rgba(255,255,255,${.22 * (1 - d / 95)})`; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke(); } } });
        }
        requestAnimationFrame(loop);
      })();
    }
  });

  /* ---- Foto desa dari internet (Wikimedia Commons). Hanya berjalan saat online, hasil disimpan 7 hari di peramban. ---- */
  const KEY = 'gx_onlinephotos', TTL = 7 * 864e5, BAD = /(map|peta|flag|logo|coat of arms|diagram|locator|chart|seal|icon)/i;
  const plain = s => new DOMParser().parseFromString(String(s || ''), 'text/html').body.textContent.trim();
  async function commons(q) {
    const c = new AbortController(), to = setTimeout(() => c.abort(), 9000);
    try {
      const r = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=15&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1000&format=json&origin=*`, { signal: c.signal });
      const d = await r.json(); return Object.values((d.query || {}).pages || {}).map(p => { const i = (p.imageinfo || [{}])[0], m = i.extmetadata || {}; return { title: p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '').replace(/_/g, ' '), thumb: i.thumburl, page: i.descriptionurl, w: i.width, h: i.height, mime: i.mime, by: plain((m.Artist || {}).value), lic: plain((m.LicenseShortName || {}).value), q }; }).filter(i => i.thumb && i.mime === 'image/jpeg' && i.w >= 900 && !BAD.test(i.title));
    } finally { clearTimeout(to); }
  }
  window.GXO = {
    async photos() {
      const V = CONFIG.village; if (V.useOnlinePhoto === false) return [];
      let cache = null; try { cache = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      if (cache && cache.items && cache.items.length && Date.now() - cache.at < TTL) return cache.items;
      if (!navigator.onLine) return cache && cache.items ? cache.items : [];
      const items = [], seen = new Set();
      for (const q of V.onlineImageQueries || []) { try { for (const i of await commons(q)) if (!seen.has(i.page)) { seen.add(i.page); items.push(i); } } catch (e) {} if (items.length >= 10) break; }
      if (items.length) try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), items: items.slice(0, 12) })); } catch (e) {}
      return items.slice(0, 12);
    }
  };
  /* Latar halaman welcome memakai foto dari internet bila tersedia dan tidak ada foto sendiri */
  addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page !== 'home' || CONFIG.village.photo) return;
    GXO.photos().then(list => { const el = $('.bg-layer'); if (list.length && el) { const t = new Image(); t.onload = () => { el.style.backgroundImage = `url("${list[0].thumb}")`; el.classList.add('on'); }; t.src = list[0].thumb; } }).catch(() => {});
  });
})();
