/* Beranda */
(() => {
  G.init('home');
  const $ = G.$;
  $('#about').textContent = CONFIG.site.about;
  $('#stats').innerHTML = CONFIG.village.stats.map(s => `<div class="stat"><b data-n="${s.value}" data-s="${G.esc(s.suffix)}">0</b><span>${G.esc(s.label)}</span></div>`).join('');
  G.$$('#stats b').forEach(b => G.countUp(b, b.dataset.n, b.dataset.s));
  $('#tiles').innerHTML = G.PAGES.map((p, i) => G.tile(p, i, p.lock && G.role() !== p.lock ? `<span class="lock">${G.icon('lock')}Khusus bendahara</span>` : '')).join('');
  $('#diagram').innerHTML = starlinkDiagram();
  $('#team').innerHTML = CONFIG.team.map(m => `<article class="card lift">${G.img(m.photo, 'profile', m.name, 'avatar')}<h3>${G.esc(m.name)}</h3><span class="badge b-info">${G.esc(m.role)}</span><p class="muted" style="margin-top:.5rem">${G.esc(m.bio)}</p></article>`).join('');
})();
