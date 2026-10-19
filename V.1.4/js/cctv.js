/* CCTV desa (area publik saja) dengan keamanan tinggi:
   1) Gerbang: wajib nama + tujuan + persetujuan, dan setiap akses dicatat (log terbuka untuk warga).
   2) Kunci otomatis bila tidak ada aktivitas (CONFIG.cctvPolicy.idleLockMinutes).
   3) Pengambilan gambar dibatasi per jam, wajib alasan, diberi tanda air nama + waktu + kamera, dan dicatat.
   4) Rekaman lama (7 hari) bisa diputar, pemutaran dicatat. Admin (mode petugas) dapat mencabut akses penyalahguna.
   Tayangan bawaan dibuat di peramban sehingga tidak butuh internet. Isi url kamera di js/config.js untuk kamera sungguhan. */
(() => {
  G.init('cctv');
  const $ = G.$, P = CONFIG.cctvPolicy, cams = CONFIG.cameras, admin = G.role() === 'admin';
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
  const SK = 'gx_cctv_sess';
  const sess = () => { try { return JSON.parse(sessionStorage.getItem(SK)); } catch (e) { return null; } };
  const log = (cam, reason, col = 'cctvlog') => Store.add(col, { cam, who: G.name(), at: new Date().toISOString(), reason });
  const blocked = () => Store.all('cctvblock').some(b => b.name === G.name());
  let last = Date.now(), recState = null;

  /* ---------- Gerbang keamanan ---------- */
  function showGate(msg) {
    $('#main2').hidden = true; const g = $('#gate'); g.hidden = false;
    if (blocked()) { g.innerHTML = `<div class="empty">${G.icon('ban')}<h2>Akses CCTV dicabut</h2><p>Akses atas nama <b>${G.esc(G.name())}</b> dicabut oleh petugas desa karena penyalahgunaan. Hubungi kantor desa.</p></div>`; return; }
    g.innerHTML = `<h2>${G.icon('lock')} Verifikasi sebelum menonton</h2>${msg ? `<p class="warn-box" style="margin-bottom:1rem">${G.esc(msg)}</p>` : ''}
      <p class="muted" style="margin-bottom:1rem">Demi keamanan, setiap akses dicatat dengan nama dan waktu dan dapat dilihat warga lain.</p>
      <form id="gf"><div class="msg-err" role="alert"></div><div class="two"><div class="field"><label for="gn">Nama lengkap</label><input id="gn" name="name" value="${G.esc(G.name())}" maxlength="40" required></div>
      <div class="field"><label for="gr">Tujuan menonton</label><select id="gr" name="reason"><option>Memantau keamanan lingkungan</option><option>Memeriksa kondisi jalan atau jembatan</option><option>Mencari barang atau orang hilang</option><option>Memeriksa kegiatan di kantor desa</option><option>Lainnya</option></select></div></div>
      <label class="show-pw" style="display:flex;gap:.6rem;align-items:flex-start;margin-bottom:1rem"><input type="checkbox" name="ok" style="width:auto;min-height:0;margin-top:.3rem"><span>Saya hanya memakai CCTV untuk kepentingan umum, tidak menyebarkan tayangan, dan menerima bahwa tindakan saya dicatat.</span></label>
      <button class="btn btn-primary" type="submit">${G.icon('check')}Masuk</button></form>`;
    const f = $('#gf'); f.onsubmit = e => { e.preventDefault(); G.submit(f, async () => {
      if (!f.name.value.trim()) throw new Error('Isi nama Anda.'); if (!f.ok.checked) throw new Error('Centang persetujuan terlebih dahulu.');
      G.setName(f.name.value.trim()); if (blocked()) return showGate();
      sessionStorage.setItem(SK, JSON.stringify({ reason: f.reason.value, at: Date.now() })); log('Masuk halaman CCTV', f.reason.value); open_();
    }); };
  }
  function open_() { $('#gate').hidden = true; $('#main2').hidden = false; last = Date.now(); drawAll(); }
  ['pointerdown', 'keydown', 'scroll'].forEach(ev => addEventListener(ev, () => { last = Date.now(); }, { passive: true }));
  setInterval(() => { if (sess() && Date.now() - last > P.idleLockMinutes * 6e4) { sessionStorage.removeItem(SK); G.$$('.modal').forEach(m => m.close ? m.close() : m.remove()); showGate(`Terkunci otomatis karena tidak ada aktivitas ${P.idleLockMinutes} menit.`); } }, 5000);

  /* ---------- Siaran langsung ---------- */
  const view = (c, i) => {
    if (!c.url) return `<canvas class="feed" width="640" height="360" data-scene="${c.scene}" data-seed="${i}"></canvas>`;
    const u = G.esc(c.url);
    return c.kind === 'iframe' ? `<iframe src="${u}" title="${G.esc(c.name)}" allow="autoplay; fullscreen" loading="lazy"></iframe>` : `<img src="${u}" alt="${G.esc(c.name)}" ${c.kind === 'snapshot' ? 'data-snap="' + u + '"' : ''}>`;
  };
  const box = (c, i) => `<div class="cam-view"><span class="cam-tag rec">REC</span>${view(c, i)}<span class="cam-tag time" data-clock></span></div>`;
  function drawCams() {
    $('#cams').innerHTML = cams.map((c, i) => `<article class="card cam lift" data-i="${i}" tabindex="0" role="button" aria-label="Perbesar kamera ${G.esc(c.name)}">${box(c, i)}<div class="cam-info"><div><b>${G.esc(c.name)}</b><br><span class="muted">${G.icon('pin')} ${G.esc(c.location)}</span></div><span class="badge b-info">${G.esc(c.area)}</span></div></article>`).join('');
    $('#onl').textContent = cams.length + ' kamera aktif (area publik)';
  }
  function bigCam(i) {
    const c = cams[i]; log(c.name, 'Memperbesar kamera: ' + (sess() || {}).reason);
    const m = G.modal(`<h2>${G.esc(c.name)}</h2>${box(c, i)}<p class="muted" style="margin:.6rem 0">${G.icon('pin')} ${G.esc(c.location)}</p><div class="row"><button class="btn btn-primary btn-sm" data-snap type="button">${G.icon('image')}Ambil gambar</button><span class="muted">Batas ${P.maxSnapshotsPerHour} gambar per jam. Tercatat dan bertanda air.</span></div>`, true);
    m.querySelector('[data-snap]').onclick = () => snapshot(c, m.querySelector('canvas'));
  }
  function snapshot(c, cv) {
    if (!cv) return G.toast('Ambil gambar tidak tersedia untuk kamera ini', 'err');
    const me = G.name(), hourAgo = Date.now() - 36e5, used = Store.all('cctvsnap').filter(s => s.who === me && new Date(s.at) > hourAgo).length;
    if (used >= P.maxSnapshotsPerHour) return G.toast(`Batas ${P.maxSnapshotsPerHour} gambar per jam tercapai. Coba lagi nanti.`, 'err');
    const m = G.modal(`<h2>${G.icon('image')} Alasan mengambil gambar</h2><p class="muted" style="margin-bottom:.8rem">Wajib diisi dan akan tercatat bersama nama dan waktu. Sisa jatah Anda: ${P.maxSnapshotsPerHour - used} gambar jam ini.</p><form><div class="msg-err" role="alert"></div><div class="field"><textarea name="r" maxlength="160" placeholder="Contoh: bukti kondisi jembatan untuk laporan" required></textarea></div><button class="btn btn-primary" type="submit">${G.icon('download')}Simpan gambar</button></form>`);
    const f = m.querySelector('form'); f.onsubmit = e => { e.preventDefault(); G.submit(f, async () => {
      const r = f.r.value.trim(); if (r.length < 8) throw new Error('Tulis alasan yang jelas (minimal 8 huruf).');
      const t = document.createElement('canvas'); t.width = cv.width; t.height = cv.height; const x = t.getContext('2d'); x.drawImage(cv, 0, 0);
      x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, t.height - 34, t.width, 34); x.fillStyle = '#fff'; x.font = '14px sans-serif';
      x.fillText(`Ganexio CCTV - ${c.name} - ${new Date().toLocaleString('id-ID')} - diambil oleh ${me}`, 10, t.height - 12);
      const a = document.createElement('a'); a.href = t.toDataURL('image/png'); a.download = 'cctv-' + c.name.toLowerCase().replace(/\W+/g, '-') + '.png'; a.click();
      log(c.name, r, 'cctvsnap'); G.toast('Gambar disimpan dan dicatat'); m.close(); drawLogs();
    }); };
  }
  $('#cams').addEventListener('click', e => { const c = e.target.closest('.cam'); if (c) bigCam(+c.dataset.i); });
  $('#cams').addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('.cam'); if (c) bigCam(+c.dataset.i); } });
  $('#layout').onclick = e => { const b = e.target.closest('[data-l]'); if (!b) return; G.$$('#layout .tab').forEach(x => x.classList.toggle('on', x === b)); $('#cams').className = 'cams ' + b.dataset.l; };

  /* ---------- Rekaman lama ---------- */
  function drawRec() {
    const camSel = +($('#recCam') ? $('#recCam').value : cams[0].id), rows = Store.all('cctvrec').filter(r => r.camId === camSel).sort((a, b) => new Date(b.start) - new Date(a.start));
    $('#c-rec').innerHTML = `<p class="muted" style="margin-bottom:.8rem">Rekaman disimpan ${P.recordingDays} hari lalu otomatis terhapus. Pemutaran dicatat.</p><div class="field" style="max-width:360px"><label for="recCam">Kamera</label><select id="recCam">${cams.map(c => `<option value="${c.id}" ${c.id === camSel ? 'selected' : ''}>${G.esc(c.name)}</option>`).join('')}</select></div>
      <div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Jam</th><th>Durasi</th><th></th></tr></thead><tbody>${rows.map(r => { const s = new Date(r.start), e = new Date(s.getTime() + r.mins * 6e4); return `<tr><td>${G.date(r.start, true)}</td><td>${s.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td><td>${r.mins} menit</td><td><button class="btn btn-primary btn-sm" data-play="${r.id}" type="button">${G.icon('play')}Putar</button></td></tr>`; }).join('')}</tbody></table></div>`;
  }
  $('#c-rec').addEventListener('change', e => { if (e.target.id === 'recCam') drawRec(); });
  $('#c-rec').addEventListener('click', e => { const b = e.target.closest('[data-play]'); if (b) play(Store.all('cctvrec').find(r => r.id === +b.dataset.play)); });
  function play(r) {
    const i = cams.findIndex(c => c.id === r.camId), c = cams[i], total = r.mins * 60;
    log(c.name, `Memutar rekaman ${G.date(r.start)}`);
    recState = { t: 0, playing: true, speed: 1, seed: i };
    const m = G.modal(`<h2>Rekaman: ${G.esc(c.name)}</h2><div class="cam-view"><span class="cam-tag rec" style="background:#5b3fd1">REKAMAN</span><canvas class="feed" data-rec="1" width="640" height="360" data-scene="${c.scene}" data-seed="${i}"></canvas><span class="cam-tag time" id="rt"></span></div>
      <div class="row" style="margin-top:.8rem;flex-wrap:nowrap"><button class="btn btn-primary btn-sm" id="pp" type="button">${G.icon('pause')}Jeda</button><input id="sk" type="range" min="0" max="${total}" value="0" aria-label="Posisi rekaman"><select id="sp" style="width:auto" aria-label="Kecepatan"><option value="1">1x</option><option value="4">4x</option><option value="16">16x</option></select></div>`, true);
    const start = new Date(r.start).getTime(), sk = m.querySelector('#sk'), rt = m.querySelector('#rt');
    m.querySelector('#pp').onclick = e => { recState.playing = !recState.playing; e.currentTarget.innerHTML = G.icon(recState.playing ? 'pause' : 'play') + (recState.playing ? 'Jeda' : 'Putar'); };
    sk.oninput = () => { recState.t = +sk.value; }; m.querySelector('#sp').onchange = e => { recState.speed = +e.target.value; };
    const tick = setInterval(() => { if (!recState) return clearInterval(tick); if (recState.t >= total) recState.playing = false; sk.value = recState.t; rt.textContent = new Date(start + recState.t * 1000).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }); }, 200);
    m.addEventListener('closed', () => { recState = null; });
  }

  /* ---------- Log akses dan log gambar (terbuka untuk warga) ---------- */
  function logTable(col, title, note) {
    const rows = Store.all(col).slice().sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 80);
    return `<p class="muted" style="margin-bottom:.8rem">${note}</p><div class="table-wrap"><table><thead><tr><th>Waktu</th><th>Warga</th><th>Kamera / aksi</th><th>Alasan</th>${admin ? '<th></th>' : ''}</tr></thead><tbody>${rows.map(r => `<tr><td>${G.date(r.at)}</td><td><b>${G.esc(r.who)}</b></td><td>${G.esc(r.cam)}</td><td>${G.esc(r.reason || '')}</td>${admin ? `<td><button class="btn btn-ghost btn-sm" data-block="${G.esc(r.who)}" type="button">${G.icon('ban')}Cabut akses</button></td>` : ''}</tr>`).join('') || `<tr><td colspan="5">${G.empty('list', 'Belum ada catatan.')}</td></tr>`}</tbody></table></div>`;
  }
  function drawLogs() {
    $('#c-log').innerHTML = logTable('cctvlog', 'Log akses', 'Semua warga yang membuka CCTV tercatat di sini, termasuk waktu dan tujuannya.');
    $('#c-snap').innerHTML = logTable('cctvsnap', 'Log gambar', 'Daftar warga yang mengambil gambar CCTV, kamera yang diambil, dan waktunya.') + (admin ? `<h3 style="margin:1.2rem 0 .5rem">Akses yang dicabut</h3><div class="stack">${Store.all('cctvblock').map(b => `<div class="row between card" style="box-shadow:none"><span><b>${G.esc(b.name)}</b> <span class="muted">dicabut ${G.date(b.at)}</span></span><button class="btn btn-ghost btn-sm" data-unblock="${b.id}" type="button">Pulihkan</button></div>`).join('') || '<p class="muted">Tidak ada.</p>'}</div>` : '');
  }
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-block]'), u = e.target.closest('[data-unblock]');
    if (b && admin && await G.confirm('Cabut akses CCTV untuk ' + b.dataset.block + '?')) { if (!Store.all('cctvblock').some(x => x.name === b.dataset.block)) Store.add('cctvblock', { name: b.dataset.block, at: new Date().toISOString() }); G.toast('Akses dicabut'); drawLogs(); }
    if (u && admin) { Store.remove('cctvblock', +u.dataset.unblock); G.toast('Akses dipulihkan'); drawLogs(); }
  });
  G.$$('#ctabs .tab').forEach(t => t.onclick = () => { G.$$('#ctabs .tab').forEach(x => x.classList.toggle('on', x === t)); ['live', 'rec', 'log', 'snap'].forEach(id => $('#c-' + id).hidden = id !== t.dataset.t); if (t.dataset.t === 'rec') drawRec(); if (t.dataset.t === 'log' || t.dataset.t === 'snap') drawLogs(); });
  addEventListener('gx:cctvlog', drawLogs); addEventListener('gx:cctvsnap', drawLogs);
  function drawAll() { drawCams(); drawLogs(); }

  /* ---------- Animasi tayangan bawaan ---------- */
  let lastF = 0, lastTs = 0;
  (function loop(ts) {
    const dt = (ts - lastTs) / 1000; lastTs = ts;
    if (recState && recState.playing) recState.t += dt * recState.speed;
    if (!document.hidden && ts - lastF > 66) { lastF = ts; G.$$('canvas.feed').forEach(cv => scene(cv.getContext('2d'), cv.width, cv.height, cv.dataset.rec && recState ? recState.t : ts / 1000, cv.dataset.scene, +cv.dataset.seed)); }
    requestAnimationFrame(loop);
  })(0);
  const clock = () => G.$$('[data-clock]').forEach(e => e.textContent = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }));
  clock(); setInterval(clock, 1000);

  const s = sess(); if (s && Date.now() - s.at < P.idleLockMinutes * 6e4 && !blocked()) open_(); else showGate();
})();
