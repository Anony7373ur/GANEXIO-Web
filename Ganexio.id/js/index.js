/* Beranda (welcome): deskripsi, tujuan, fitur, dan cara memakai. Teks diatur di js/config.js (site, village) dan js/app.js (PAGES). */
(() => {
  G.init('home');
  const $ = G.$, S = CONFIG.site;
  $('#about').textContent = S.about.split('. ')[0] + '.'; // ringkas di hero; versi lengkap di bagian Tentang Ganexio
  $('#about2').textContent = S.about;
  $('#goals').innerHTML = S.goals.map(g => `<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="cat-ic sm">${G.icon('check')}</span><span>${G.esc(g)}</span></div>`).join('');
  $('#stats').innerHTML = CONFIG.village.stats.map(s => `<div class="stat"><b data-n="${s.value}" data-s="${G.esc(s.suffix || '')}" data-d="${s.dec || 0}">0</b><span>${G.esc(s.label)}</span></div>`).join('');
  G.$$('#stats b').forEach(b => {
    const to = +b.dataset.n, d = +b.dataset.d, t0 = performance.now();
    const f = t => { const p = Math.min((t - t0) / 1000, 1), v = to * (1 - Math.pow(1 - p, 3)); b.textContent = v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }) + b.dataset.s; if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  $('#tiles').innerHTML = G.PAGES.map((p, i) => G.tile(p, i)).join('');
  $('#acc').innerHTML = G.PAGES.map(p => `<details><summary>${G.catBadge(p.id, 'sm')}${G.esc(p.title)}</summary><ol>${p.how.map(h => `<li>${G.esc(h)}</li>`).join('')}</ol><a class="btn btn-primary btn-sm" href="${p.href}" style="--c1:${p.c1};--c2:${p.c2};margin-bottom:.8rem">Buka ${G.esc(p.title)}</a></details>`).join('');
})();
