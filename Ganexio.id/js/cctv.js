/* CCTV desa. Kamera tanpa alamat (url kosong di js/config.js) menampilkan tayangan DEMO buatan. */
(() => {
  G.init('cctv');
  const $ = G.$, cams = CONFIG.cameras;
  const PAL = { plaza: ['#1b2a4a', '#27402e'], market: ['#2c2140', '#3d2f24'], road: ['#1b2b3b', '#2b2f33'], water: ['#10304c', '#0c4c5c'] };
  const scan = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 4; const x = c.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, 0, 4, 1); return c; })();

  function scene(ctx, w, h, t, kind, seed) {
    const [sky, gr] = PAL[kind] || PAL.plaza, hz = h * .52;
    let g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, sky); g.addColorStop(1, '#42547a'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, hz);
    ctx.fillStyle = gr; ctx.fillRect(0, hz, w, h - hz);
    if (kind === 'plaza') { ctx.fillStyle = '#6b768f'; ctx.fillRect(w * .28, hz - h * .26, w * .44, h * .26); ctx.fillStyle = '#d7263d'; ctx.fillRect(w * .26, hz - h * .29, w * .48, h * .05); ctx.fillStyle = '#2a2f45'; ctx.fillRect(w * .47, hz - h * .13, w * .06, h * .13); ctx.fillStyle = '#7e8aa8'; ctx.fillRect(w * .33, hz - h * .2, w * .07, h * .07); ctx.fillRect(w * .6, hz - h * .2, w * .07, h * .07); }
    if (kind === 'market') { ['#e0a100', '#d7263d', '#1e6fef', '#0a8f5b'].forEach((c, i) => { const x = w * (.06 + i * .24); ctx.fillStyle = c; ctx.fillRect(x, hz - h * .16, w * .2, h * .06); ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x + 4, hz - h * .1, w * .2 - 8, h * .1); }); }
    if (kind === 'road') { ctx.fillStyle = '#3b4048'; ctx.beginPath(); ctx.moveTo(w * .42, hz); ctx.lineTo(w * .58, hz); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill(); ctx.fillStyle = '#e8e2b0'; for (let i = 0; i < 6; i++) { const p = ((i / 6 + t * .25) % 1), y = hz + p * p * (h - hz), s = 2 + p * 8; ctx.fillRect(w / 2 - s / 2, y, s, 4 + p * 18); } }
    if (kind === 'water') { for (let i = 0; i < 9; i++) { ctx.strokeStyle = 'rgba(180,225,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); const y = hz + (i + 1) * (h - hz) / 10; for (let x = 0; x <= w; x += 12) ctx.lineTo(x, y + Math.sin(x * .03 + t * 2 + i) * 4); ctx.stroke(); } ctx.fillStyle = '#5a3d25'; ctx.fillRect(w * .08, hz + h * .08, w * .34, h * .05); }
    /* orang / kendaraan yang bergerak */
    for (let i = 0; i < 3; i++) {
      const sp = .05 + ((seed + i) % 3) * .03, x = (((t * sp + i * .37 + seed * .13) % 1.2) - .1) * w, y = hz + (h - hz) * (.25 + i * .22), s = 1 + i * .35;
      if (kind === 'road' && i < 2) { ctx.fillStyle = i ? '#f5b800' : '#d7263d'; ctx.fillRect(x, y - 10 * s, 34 * s, 10 * s); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + 6 * s, y, 5 * s, 0, 7); ctx.arc(x + 28 * s, y, 5 * s, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = ['#f08c00', '#5b8cff', '#ff6a8d'][i]; ctx.beginPath(); ctx.roundRect(x, y - 30 * s, 12 * s, 24 * s, 4 * s); ctx.fill(); ctx.fillStyle = '#e9c9a5'; ctx.beginPath(); ctx.arc(x + 6 * s, y - 36 * s, 6 * s, 0, 7); ctx.fill(); ctx.fillStyle = '#222'; ctx.fillRect(x + 1 * s, y - 7 * s, 4 * s, 8 * s + Math.sin(t * 8 + i) * 2); ctx.fillRect(x + 7 * s, y - 7 * s, 4 * s, 8 * s - Math.sin(t * 8 + i) * 2); }
    }
    for (let i = 0; i < 50; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * .07})`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    ctx.fillStyle = ctx.createPattern(scan, 'repeat'); ctx.fillRect(0, 0, w, h);
    g = ctx.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, h * .9); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  const view = (c, i) => {
    if (!c.url) return `<canvas class="feed" width="640" height="360" data-scene="${c.scene}" data-seed="${i}"></canvas><span class="cam-tag demo">DEMO</span>`;
    const u = G.esc(c.url);
    return c.kind === 'iframe' ? `<iframe src="${u}" title="${G.esc(c.name)}" allow="autoplay; fullscreen" loading="lazy"></iframe>` : `<img src="${u}" alt="${G.esc(c.name)}" ${c.kind === 'snapshot' ? 'data-snap="' + u + '"' : ''}>`;
  };
  const box = (c, i) => `<div class="cam-view"><span class="cam-tag rec">REC</span>${view(c, i)}<span class="cam-tag time" data-clock></span></div>`;
  $('#cams').innerHTML = cams.map((c, i) => `<article class="card cam lift" data-i="${i}" tabindex="0" role="button" aria-label="Perbesar kamera ${G.esc(c.name)}">${box(c, i)}<div class="cam-info"><div><b>${G.esc(c.name)}</b><br><span class="muted">${G.icon('pin')} ${G.esc(c.location)}</span></div><span class="badge b-ok">Online</span></div></article>`).join('');
  $('#onl').textContent = cams.length + ' kamera aktif';

  const open = card => {
    if (!card) return; const i = +card.dataset.i, c = cams[i];
    const m = G.modal(`<h2>${G.esc(c.name)}</h2>${box(c, i)}<p class="muted" style="margin:.6rem 0">${G.icon('pin')} ${G.esc(c.location)}</p><div class="row"><button class="btn btn-primary btn-sm" data-snap type="button">${G.icon('image')}Ambil gambar</button></div>`, true);
    const sn = m.querySelector('[data-snap]'); sn.onclick = () => { const cv = m.querySelector('canvas'); if (!cv) return G.toast('Ambil gambar hanya untuk tayangan demo', 'err'); const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'cctv-' + c.name.toLowerCase().replace(/\W+/g, '-') + '.png'; a.click(); };
  };
  $('#cams').addEventListener('click', e => open(e.target.closest('.cam')));
  $('#cams').addEventListener('keydown', e => { if (e.key === 'Enter') open(e.target.closest('.cam')); });
  $('#layout').onclick = e => { const b = e.target.closest('[data-l]'); if (!b) return; G.$$('#layout .tab').forEach(x => x.classList.toggle('on', x === b)); $('#cams').className = 'cams ' + b.dataset.l; };

  let last = 0;
  (function loop(ts) {
    if (!document.hidden && ts - last > 66) { last = ts; G.$$('canvas.feed').forEach(cv => scene(cv.getContext('2d'), cv.width, cv.height, ts / 1000, cv.dataset.scene, +cv.dataset.seed)); }
    requestAnimationFrame(loop);
  })(0);
  const clock = () => G.$$('[data-clock]').forEach(e => e.textContent = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }));
  clock(); setInterval(clock, 1000);
  setInterval(() => G.$$('img[data-snap]').forEach(i => { i.src = i.dataset.snap + (i.dataset.snap.includes('?') ? '&' : '?') + 't=' + Date.now(); }), 3000);
})();
