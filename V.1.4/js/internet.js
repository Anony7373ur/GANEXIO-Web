/* Akses Internet. PENCARIAN MEMBUTUHKAN INTERNET:
   - Mesin "Ganexio" menampilkan hasil Wikipedia dan Wikimedia Commons langsung di halaman ini (Web dan Gambar).
   - Mesin lain (Google, Bing, dll.) dan tab Video/Berita/Peta membuka hasil sebenarnya di tab baru.
   Riwayat, penanda, dan Rancangan Jaringan Desa tetap dapat dipakai tanpa internet. Data tersimpan di peramban. */
(() => {
  G.init('internet');
  const $ = G.$;
  const cfg = () => Store.get('inetcfg', { engine: 'ganexio' });
  const setCfg = p => Store.set('inetcfg', { ...cfg(), ...p });
  const eng = () => CONFIG.engines.find(e => e.id === cfg().engine) || null; // null = mesin Ganexio (di halaman ini)
  const hist = () => Store.get('history', []), bmk = () => Store.get('bookmarks', []);
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } };
  const norm = u => /^https?:\/\//i.test(u) ? u : 'https://' + u;
  const plain = s => new DOMParser().parseFromString(String(s || ''), 'text/html').body.textContent;
  let stype = 'web';
  const TYPES = [['web', 'Web', 'globe'], ['img', 'Gambar', 'image'], ['vid', 'Video', 'play'], ['news', 'Berita', 'book'], ['map', 'Peta', 'pin']];
  const addHist = o => { const h = hist(); h.unshift({ id: Date.now() + Math.random(), at: new Date().toISOString(), ...o }); Store.set('history', h.slice(0, 200)); };
  const needNet = () => `<div class="card">${G.empty('globe', 'Pencarian membutuhkan internet. Sambungkan perangkat ke jaringan lalu coba lagi.')}</div>`;

  /* ---------- Status koneksi (terukur) ---------- */
  function stats(o) {
    $('#netStats').innerHTML = [['Status', o.state || '-', 'wifi'], ['Latensi', o.ms == null ? '-' : o.ms + ' ms', 'clock'], ['Jenis jaringan', o.type || '-', 'globe'], ['Perkiraan unduh', o.down == null ? '-' : o.down + ' Mbps', 'down']]
      .map(([l, v, ic]) => `<div class="card" style="padding:.9rem"><span class="cat-ic sm">${G.icon(ic)}</span><div><span class="muted">${l}</span><b>${v}</b></div></div>`).join('');
  }
  async function check() {
    const card = $('#netCard'); card.className = 'card net-card'; $('#netTitle').textContent = 'Memeriksa sambungan...'; $('#netText').textContent = 'Mohon tunggu sebentar.'; stats({});
    const t = []; for (let i = 0; i < 3; i++) { try { const c = new AbortController(), to = setTimeout(() => c.abort(), 4000), s = performance.now(); await fetch('https://www.gstatic.com/generate_204?x=' + Date.now(), { mode: 'no-cors', cache: 'no-store', signal: c.signal }); clearTimeout(to); t.push(performance.now() - s); } catch (e) {} }
    const cn = navigator.connection || {};
    if (t.length) { const ms = Math.round(t.reduce((a, b) => a + b, 0) / t.length); card.className = 'card net-card on'; $('#netTitle').textContent = 'Internet tersambung'; $('#netText').textContent = 'Sambungan keluar desa terdeteksi. Pencarian dapat digunakan.'; stats({ state: 'Online', ms, type: cn.effectiveType ? cn.effectiveType.toUpperCase() : null, down: cn.downlink || null }); }
    else { card.className = 'card net-card off'; $('#netTitle').textContent = 'Internet luar belum tersedia'; $('#netText').textContent = 'Pencarian membutuhkan internet. Layanan desa lainnya tetap berjalan.'; stats({ state: 'Offline' }); }
    const chip = $('#onlineChip'); if (chip) { chip.className = 'badge ' + (t.length ? 'b-ok' : 'b-bad'); chip.textContent = t.length ? 'Online' : 'Offline'; }
  }
  $('#netCard').insertAdjacentHTML('afterend', '<div class="kpi" id="netStats" style="margin-bottom:1rem"></div>');
  $('#recheck').onclick = check;

  /* ---------- Penanda dan pembaca ---------- */
  const star = url => bmk().some(b => b.url === url);
  function toggleBm(title, url) {
    const b = bmk(), i = b.findIndex(x => x.url === url);
    if (i >= 0) { b.splice(i, 1); Store.set('bookmarks', b); G.toast('Penanda dihapus'); } else { b.unshift({ id: Date.now(), title, url, note: '', created: new Date().toISOString() }); Store.set('bookmarks', b); G.toast('Penanda disimpan'); }
    drawBook();
  }
  const readerBody = d => `<span class="badge b-info">${G.esc(d.site)}</span><h2 style="margin:.5rem 0">${G.esc(d.title)}</h2><div class="stack">${d.text.map(p => `<p class="pre">${G.esc(p)}</p>`).join('')}</div>
    <div class="row" style="margin-top:1rem"><button class="btn btn-ghost btn-sm" data-bm type="button">${G.icon('bookmark')}<span>${star(d.url) ? 'Hapus penanda' : 'Simpan penanda'}</span></button><button class="btn btn-ghost btn-sm" data-cp type="button">${G.icon('copy')}Salin tautan</button><a class="btn btn-primary btn-sm" href="${G.esc(d.url)}" target="_blank" rel="noopener">${G.icon('external')}Buka sumber asli</a></div>`;
  function wire(m, d) {
    m.querySelector('[data-bm]').onclick = e => { toggleBm(d.title, d.url); e.currentTarget.querySelector('span').textContent = star(d.url) ? 'Hapus penanda' : 'Simpan penanda'; };
    m.querySelector('[data-cp]').onclick = () => G.copy(d.url);
  }
  async function api(url) { const c = new AbortController(), to = setTimeout(() => c.abort(), 9000); try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error('http'); return await r.json(); } finally { clearTimeout(to); } }
  const WIKI = 'https://id.wikipedia.org/w/api.php', COMMONS = 'https://commons.wikimedia.org/w/api.php';
  async function wikiReader(title) {
    const m = G.modal('<div class="spinner"></div>', true);
    try {
      const d = await api(`${WIKI}?action=query&prop=extracts|info&exintro=1&explaintext=1&redirects=1&inprop=url&titles=${encodeURIComponent(title)}&format=json&origin=*`), p = Object.values(d.query.pages)[0];
      const doc = { title: p.title, site: 'id.wikipedia.org', url: p.fullurl || 'https://id.wikipedia.org/wiki/' + encodeURIComponent(title), text: (p.extract || 'Tidak ada ringkasan.').split(/\n+/).filter(Boolean).slice(0, 6) };
      addHist({ kind: 'visit', title: doc.title, url: doc.url }); drawHist();
      m.querySelector('.modal-box').insertAdjacentHTML('beforeend', readerBody(doc)); m.querySelector('.spinner').remove(); wire(m, doc);
    } catch (e) { m.close(); G.toast('Tidak dapat memuat halaman. Periksa internet.', 'err'); }
  }
  function openUrl(u) {
    const url = norm(u.trim());
    if (!navigator.onLine) return G.toast('Membuka situs membutuhkan internet', 'err');
    addHist({ kind: 'visit', title: host(url), url }); drawHist(); window.open(url, '_blank', 'noopener');
  }

  /* ---------- Pencarian ---------- */
  async function doSearch(q, type = stype) {
    q = q.trim(); stype = type; $('#sq').value = q; G.$$('#stypes .tab').forEach(x => x.classList.toggle('on', x.dataset.ty === type)); $('#sug').hidden = true;
    if (!q) return G.toast('Ketik kata yang ingin dicari', 'err');
    addHist({ kind: 'search', q, stype: type }); drawHist();
    const e = eng(), res = $('#results');
    if (!navigator.onLine) { res.innerHTML = needNet(); return; }
    if (e || (type !== 'web' && type !== 'img')) { // mesin lain atau jenis yang dibuka di tab baru
      const x = e || CONFIG.engines[0]; window.open(x[type].replace('%s', encodeURIComponent(q)), '_blank', 'noopener');
      res.innerHTML = `<div class="card">${G.icon('external')} Hasil ${G.esc(TYPES.find(t => t[0] === type)[1])} dari ${G.esc(x.name)} dibuka di tab baru.</div>`; return;
    }
    res.innerHTML = '<div class="spinner"></div>';
    try {
      if (type === 'web') {
        const d = await api(`${WIKI}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=10&srprop=snippet&format=json&origin=*`), r = d.query.search;
        res.innerHTML = `<p class="muted" style="margin:.8rem 0">${r.length} hasil untuk <b>"${G.esc(q)}"</b> dari Wikipedia Bahasa Indonesia.</p>` + (r.length ? `<div class="stack">${r.map(s => `<article class="card lift res" data-wiki="${G.esc(s.title)}"><span class="badge">id.wikipedia.org</span><h3 style="margin:.3rem 0"><a href="#" data-wiki="${G.esc(s.title)}">${G.esc(s.title)}</a></h3><p>${G.esc(plain(s.snippet))}...</p></article>`).join('')}</div>` : `<div class="card">${G.empty('search', 'Tidak ada hasil. Coba kata lain atau pilih mesin pencari lain.')}</div>`);
      } else {
        const d = await api(`${COMMONS}?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=16&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=420&format=json&origin=*`);
        const r = Object.values((d.query || {}).pages || {}).map(p => ({ t: p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''), thumb: (p.imageinfo || [{}])[0].thumburl, page: (p.imageinfo || [{}])[0].descriptionurl, by: plain(((p.imageinfo || [{}])[0].extmetadata || {}).Artist && p.imageinfo[0].extmetadata.Artist.value), lic: ((p.imageinfo || [{}])[0].extmetadata || {}).LicenseShortName ? p.imageinfo[0].extmetadata.LicenseShortName.value : '' })).filter(i => i.thumb);
        window.__res = r;
        res.innerHTML = `<p class="muted" style="margin:.8rem 0">${r.length} gambar untuk <b>"${G.esc(q)}"</b> dari Wikimedia Commons.</p>` + (r.length ? `<div class="grid">${r.map((i, n) => `<figure class="card lift" style="padding:.6rem" data-img="${n}"><div class="photo"><img src="${G.esc(i.thumb)}" alt="${G.esc(i.t)}" loading="lazy" onerror="this.style.visibility='hidden'"></div><figcaption class="muted" style="margin-top:.4rem">${G.esc(i.t.slice(0, 70))}</figcaption></figure>`).join('')}</div>` : `<div class="card">${G.empty('image', 'Tidak ada gambar yang cocok.')}</div>`);
      }
    } catch (err) { res.innerHTML = needNet(); }
  }
  $('#t-search').addEventListener('click', ev => {
    const w = ev.target.closest('[data-wiki]'), i = ev.target.closest('[data-img]');
    if (w || i) ev.preventDefault();
    if (w) wikiReader(w.dataset.wiki);
    if (i) { const it = window.__res[+i.dataset.img]; const m = G.modal(`<div class="photo"><img src="${G.esc(it.thumb)}" alt="${G.esc(it.t)}"></div><p style="margin:.6rem 0"><b>${G.esc(it.t)}</b></p><p class="muted">${it.by ? 'Pembuat: ' + G.esc(it.by) + '. ' : ''}${it.lic ? 'Lisensi: ' + G.esc(it.lic) + '.' : ''}</p><div class="row" style="margin-top:.6rem"><button class="btn btn-ghost btn-sm" data-bm type="button">${G.icon('bookmark')}Simpan penanda</button><a class="btn btn-primary btn-sm" href="${G.esc(it.page)}" target="_blank" rel="noopener">${G.icon('external')}Halaman sumber</a></div>`, true); m.querySelector('[data-bm]').onclick = () => toggleBm(it.t, it.page); }
  });

  /* ---------- Tab Cari dan Jelajah ---------- */
  function drawSearch() {
    const c = cfg(), groups = [...new Set(CONFIG.links.map(l => l.group))];
    $('#t-search').innerHTML = `<div class="card" style="margin-bottom:1rem">
      <div class="row between" style="margin-bottom:.8rem"><span class="muted">${G.icon('globe')} Pencarian membutuhkan internet <span id="onlineChip" class="badge">...</span></span>
        <div class="field" style="margin:0;min-width:240px"><label for="se" class="sr">Mesin pencari</label><select id="se"><option value="ganexio" ${c.engine === 'ganexio' ? 'selected' : ''}>Ganexio (hasil di halaman ini)</option>${CONFIG.engines.map(e => `<option value="${e.id}" ${e.id === c.engine ? 'selected' : ''}>${G.esc(e.name)} (tab baru)</option>`).join('')}</select></div></div>
      <form id="sf" class="search-box"><input id="sq" placeholder="Cari apa saja: cuaca, harga kopi, cara membuat KTP..." autocomplete="off" aria-label="Kata pencarian"><button class="btn btn-primary" type="submit">${G.icon('search')}Cari</button><div class="suggest" id="sug" hidden></div></form>
      <div class="eng-row" style="margin:.8rem 0 0"><div class="tabs" id="stypes" style="margin:0">${TYPES.map(([k, l, ic]) => `<button class="tab ${k === stype ? 'on' : ''}" data-ty="${k}" type="button">${G.icon(ic)}${l}</button>`).join('')}</div></div>
      <div class="chips" style="margin-top:.8rem">${CONFIG.quickSearches.map(q => `<button class="chip" data-q="${G.esc(q)}" type="button">${G.icon('search')}${G.esc(q)}</button>`).join('')}</div></div>
      <div id="results"></div>
      <h2 style="margin-top:1.5rem">Buka alamat situs</h2><form class="card row" id="go" style="flex-wrap:nowrap;margin-bottom:1rem"><input id="url" placeholder="Contoh: bmkg.go.id" aria-label="Alamat situs" inputmode="url" autocapitalize="none"><button class="btn btn-primary" type="submit">${G.icon('external')}Buka</button></form>
      <h2>Situs yang sering dibuka</h2>${groups.map(g => `<h3 style="margin:1rem 0 .6rem">${G.esc(g)}</h3><div class="grid">${CONFIG.links.filter(l => l.group === g).map(l => `<a class="card lift link-card" href="${G.esc(l.url)}" data-site="${G.esc(l.url)}"><span class="cat-ic sm">${G.icon('globe')}</span><div><b>${G.esc(l.title)}</b><br><span class="muted">${G.esc(l.text)}</span></div></a>`).join('')}</div>`).join('')}`;
    const sq = $('#sq');
    $('#se').onchange = e => { setCfg({ engine: e.target.value }); G.toast('Mesin pencari: ' + (eng() ? eng().name : 'Ganexio')); };
    $('#sf').onsubmit = e => { e.preventDefault(); doSearch(sq.value); };
    $('#stypes').onclick = e => { const b = e.target.closest('[data-ty]'); if (!b) return; stype = b.dataset.ty; G.$$('#stypes .tab').forEach(x => x.classList.toggle('on', x === b)); if (sq.value.trim()) doSearch(sq.value, stype); };
    G.$$('[data-q]').forEach(b => b.onclick = () => doSearch(b.dataset.q));
    G.$$('[data-site]').forEach(a => a.onclick = e => { e.preventDefault(); openUrl(a.dataset.site); });
    $('#go').onsubmit = e => { e.preventDefault(); if ($('#url').value.trim()) openUrl($('#url').value); };
    sq.oninput = () => {
      const v = sq.value.trim().toLowerCase(); if (v.length < 2) return $('#sug').hidden = true;
      const pool = [...new Set([...hist().filter(h => h.kind === 'search').map(h => h.q), ...CONFIG.quickSearches])].filter(s => s.toLowerCase().includes(v)).slice(0, 6);
      $('#sug').hidden = !pool.length; $('#sug').innerHTML = pool.map(s => `<button type="button" data-s="${G.esc(s)}">${G.icon('search')}${G.esc(s)}</button>`).join('');
    };
    $('#sug').onclick = e => { const b = e.target.closest('[data-s]'); if (b) doSearch(b.dataset.s); };
  }

  /* ---------- Riwayat dan penanda ---------- */
  function drawHist() {
    const q = ($('#hq') ? $('#hq').value : '').toLowerCase(), rows = hist().filter(h => !q || ((h.q || h.title || '') + (h.url || '')).toLowerCase().includes(q));
    $('#t-hist').innerHTML = `<div class="row between" style="margin-bottom:.8rem"><input id="hq" placeholder="Cari di riwayat" aria-label="Cari riwayat" style="flex:1;min-width:200px" value="${G.esc(q)}"><button class="btn btn-ghost btn-sm" id="hclr" type="button">${G.icon('trash')}Hapus semua</button></div>
      <p class="muted" style="margin-bottom:.8rem">Riwayat hanya tersimpan di perangkat ini dan tidak dibagikan.</p>
      <div class="stack">${rows.map(h => `<div class="card row between" style="padding:.8rem 1rem;flex-wrap:nowrap"><div style="min-width:0"><b>${G.icon(h.kind === 'search' ? 'search' : 'globe')} ${G.esc(h.q || h.title)}</b><br><span class="muted">${h.kind === 'search' ? 'Pencarian' : G.esc(host(h.url))} &bull; ${G.ago(h.at)}</span></div><div class="row" style="flex-wrap:nowrap"><button class="btn btn-ghost btn-sm" data-redo="${h.id}" type="button">${h.kind === 'search' ? 'Ulangi' : 'Buka'}</button><button class="btn btn-ghost btn-sm" data-hdel="${h.id}" type="button" aria-label="Hapus">${G.icon('x')}</button></div></div>`).join('') || G.empty('clock', 'Riwayat masih kosong.')}</div>`;
    const hq = $('#hq'); hq.oninput = G.debounce(() => { drawHist(); $('#hq').focus(); $('#hq').setSelectionRange(99, 99); });
    $('#hclr').onclick = async () => { if (await G.confirm('Hapus semua riwayat?')) { Store.set('history', []); drawHist(); } };
  }
  $('#t-hist').addEventListener('click', e => {
    const r = e.target.closest('[data-redo]'), d = e.target.closest('[data-hdel]');
    if (d) { Store.set('history', hist().filter(h => String(h.id) !== d.dataset.hdel)); drawHist(); }
    if (r) { const h = hist().find(x => String(x.id) === r.dataset.redo); if (!h) return; if (h.kind === 'search') { showTab('search'); doSearch(h.q, h.stype || 'web'); } else openUrl(h.url); }
  });
  function drawBook() {
    const b = bmk();
    $('#t-book').innerHTML = `<form class="card" id="bf" style="margin-bottom:1rem"><h3>Tambah penanda</h3><div class="msg-err" role="alert"></div><div class="two" style="margin-top:.6rem"><div class="field"><label for="bt">Judul</label><input id="bt" name="title" required></div><div class="field"><label for="bu">Alamat situs</label><input id="bu" name="url" placeholder="contoh: bmkg.go.id" required></div></div><div class="field"><label for="bn">Catatan (opsional)</label><input id="bn" name="note"></div><button class="btn btn-primary btn-sm" type="submit">${G.icon('plus')}Simpan penanda</button></form>
      <div class="stack">${b.map(x => `<div class="card row between" style="padding:.8rem 1rem;flex-wrap:nowrap"><div style="min-width:0"><b>${G.icon('bookmark')} ${G.esc(x.title)}</b><br><span class="muted">${G.esc(host(x.url))}${x.note ? ' &bull; ' + G.esc(x.note) : ''}</span></div><div class="row" style="flex-wrap:nowrap"><button class="btn btn-primary btn-sm" data-bo="${x.id}" type="button">Buka</button><button class="btn btn-ghost btn-sm" data-bd="${x.id}" type="button" aria-label="Hapus penanda">${G.icon('trash')}</button></div></div>`).join('') || G.empty('bookmark', 'Belum ada penanda. Tekan "Simpan penanda" saat membaca halaman.')}</div>`;
    const f = $('#bf'); f.onsubmit = e => { e.preventDefault(); G.submit(f, async () => { const u = norm(f.url.value.trim()); try { new URL(u); } catch (x) { throw new Error('Alamat situs tidak valid.'); } const l = bmk(); l.unshift({ id: Date.now(), title: f.title.value.trim(), url: u, note: f.note.value.trim(), created: new Date().toISOString() }); Store.set('bookmarks', l); G.toast('Penanda disimpan'); drawBook(); }); };
  }
  $('#t-book').addEventListener('click', e => {
    const o = e.target.closest('[data-bo]'), d = e.target.closest('[data-bd]');
    if (d) { Store.set('bookmarks', bmk().filter(x => String(x.id) !== d.dataset.bd)); drawBook(); }
    if (o) { const x = bmk().find(y => String(y.id) === o.dataset.bo); if (x) openUrl(x.url); }
  });

  /* ---------- Rancangan jaringan desa ---------- */
  const SERVERS = [
    ['Mini PC Intel N100 (disarankan)', '4 inti, RAM 16 GB, SSD NVMe 512 GB, 2x LAN, daya 10-15 W (kelas Beelink Mini S12 atau sejenis)', 'Rp 3,5-5 jt', 'Seimbang: kuat untuk Ganexio, perpustakaan offline, dan cache; hemat listrik.'],
    ['Raspberry Pi 5 8 GB + SSD', '4 inti Arm, RAM 8 GB, SSD NVMe 256 GB, casing berpendingin, daya 5-12 W', 'Rp 2,5-3,5 jt', 'Paling hemat daya, cocok untuk tenaga surya. Kinerja lebih rendah bila pengguna banyak.'],
    ['PC mini bekas (OptiPlex Micro / ThinkCentre Tiny, Core i5 gen 8+)', 'RAM 8-16 GB, SSD 256 GB, daya 20-35 W', 'Rp 1,5-3 jt', 'Termurah dan suku cadang mudah. Lebih boros listrik dan umur tidak pasti.']
  ];
  const COMMON = { server: 4000000, ups: 1200000, perHamlet: 2500000, power: 100000 };
  const OPTS = [
    { id: 'bakti', name: 'Akses BAKTI / USO untuk fasilitas desa', capex: 0, per: 0, monthly: 0, ok: () => true, note: 'Ajukan lewat Diskominfo Kab. Toba. Gratis untuk fasilitas umum (kantor desa, sekolah, puskesmas). Waktu tunggu lama dan kapasitas terbatas.' },
    { id: 'lte', name: 'Router 4G/LTE + antena luar', capex: 2500000, per: 0, monthly: 600000, ok: i => i.lte === 'ya', note: 'Perlu sinyal 4G di satu titik tinggi. Pasang antena luar di tiang. Paket data bisnis atau unlimited kuota adil.' },
    { id: 'ptp', name: 'Radio point-to-point 5 GHz ke titik berfiber', capex: 6000000, per: 700000, monthly: 500000, ok: i => i.km > 0 && i.km <= 20, note: 'Butuh garis pandang. Dua radio, tiang, dan langganan fiber di sisi kota. Cepat dan stabil bila jarak sampai sekitar 20 km.' },
    { id: 'vsat', name: 'VSAT Ku-band (reseller lokal)', capex: 12000000, per: 0, monthly: 2500000, ok: () => true, note: 'Menjangkau hampir semua lokasi. Langganan mahal dan latensi tinggi, cocok untuk cadangan.' },
    { id: 'starlink', name: 'Starlink (opsional)', capex: 6500000, per: 0, monthly: 850000, ok: () => true, note: 'Cepat dan menjangkau mana saja bila langit terbuka. Biaya perangkat dan langganan perkiraan, cek harga resmi.' }
  ];
  function plan(i) {
    const base = COMMON.server + COMMON.ups + COMMON.perHamlet * i.hamlets;
    return OPTS.map(o => { const capex = base + o.capex + o.per * i.km, monthly = o.monthly + COMMON.power; return { ...o, feasible: o.ok(i), capexT: capex, monthlyT: monthly, y1: capex + monthly * 12, kk: Math.ceil(monthly / i.kk / 500) * 500 }; });
  }
  function drawNet() {
    $('#t-net').innerHTML = `<div class="card" style="margin-bottom:1rem"><h2>Analisis singkat</h2><p>Desa memiliki jaringan lemah dan ekonomi terbatas, sehingga membeli perangkat mahal dan berlangganan Starlink sulit. Prinsip rancangan ini: <b>intranet dulu, internet belakangan</b>. Fungsi inti Ganexio (pasokan, pasar, dana desa, forum, CCTV, layanan) berjalan di server desa dan <b>tidak butuh internet</b>. Internet hanya tambahan untuk situs luar dan dapat dipasang bertahap dengan opsi termurah yang layak.</p></div>
      <div class="card diagram" style="margin-bottom:1rem"><h2>Arsitektur yang disarankan</h2>${diagram()}</div>
      <div class="card" style="margin-bottom:1rem"><h2>Server yang cocok</h2><div class="table-wrap"><table><thead><tr><th>Pilihan</th><th>Spesifikasi</th><th>Perkiraan harga</th><th>Catatan</th></tr></thead><tbody>${SERVERS.map(s => `<tr><td><b>${s[0]}</b></td><td>${s[1]}</td><td>${s[2]}</td><td>${s[3]}</td></tr>`).join('')}</tbody></table></div>
        <p class="muted" style="margin-top:.8rem">Perangkat lunak: Debian/Ubuntu Server, Nginx atau Caddy, SQLite lalu PostgreSQL, dnsmasq (nama lokal), Squid (cache hemat kuota), Kolibri dan Kiwix (perpustakaan offline), WireGuard (bantuan teknisi jarak jauh). Listrik: UPS 600-1000 VA, opsional panel surya 300-400 Wp dengan baterai LiFePO4. Harga perkiraan, cek harga terbaru.</p></div>
      <div class="card" style="margin-bottom:1rem"><h2>WiFi dan jaringan antar dusun</h2><ul class="stack" style="padding-left:1.1rem"><li><b>Titik WiFi umum</b> di kantor desa, sekolah, gereja, posyandu, dan lapangan (tidak perlu WiFi di setiap rumah).</li><li><b>Backhaul antar dusun</b> dengan radio 5 GHz point-to-point atau sektoral (kelas Ubiquiti LiteBeam/NanoBeam atau TP-Link CPE), bukan menarik kabel panjang.</li><li><b>Access point luar ruangan</b> per dusun (kelas TP-Link Omada EAP225-Outdoor atau Mikrotik cAP) dengan router Mikrotik hAP ac2 sebagai pengatur.</li><li><b>Pembatasan adil</b>: batas kecepatan per pengguna, voucher harian, dan cache lokal agar uplink terbatas cukup untuk banyak warga.</li><li><b>Pesan darurat tanpa sinyal</b>: radio LoRa mesh (kelas Meshtastic, sekitar Rp 400-900 ribu per perangkat) untuk teks antar dusun saat jaringan putus.</li></ul></div>
      <div class="card" style="margin-bottom:1rem"><h2>Hitung rancangan untuk desa Anda</h2><p class="muted" style="margin-bottom:.8rem">Perkiraan kasar. Ubah angka, hasil langsung berubah.</p>
        <form id="pf" class="two"><div class="field"><label for="pn">Jumlah dusun</label><input id="pn" type="number" min="1" max="20" value="${CONFIG.village.hamlets.length}"></div><div class="field"><label for="pk">Jumlah KK</label><input id="pk" type="number" min="10" value="140"></div><div class="field"><label for="pd">Jarak ke titik berfiber terdekat (km, 0 bila tidak tahu)</label><input id="pd" type="number" min="0" max="80" value="12"></div><div class="field"><label for="pl">Ada sinyal 4G di satu titik tinggi?</label><select id="pl"><option value="ya">Ya</option><option value="tidak">Tidak</option></select></div><div class="field"><label for="pb">Anggaran bulanan desa (Rp)</label><input id="pb" type="number" min="0" step="50000" value="700000"></div></form><div id="pres"></div></div>
      <div class="card"><h2>Tahapan pelaksanaan</h2><div class="timeline"><div class="ev"><span class="badge b-info">Bulan 0-1</span><h3>Intranet desa</h3><p class="muted">Pasang server di kantor desa, WiFi lokal di kantor desa dan sekolah, jalankan Ganexio dan perpustakaan offline.</p></div><div class="ev"><span class="badge b-info">Bulan 1-3</span><h3>Uplink termurah yang layak</h3><p class="muted">Pasang 4G atau radio point-to-point di titik tinggi, mulai dari kantor desa. Ajukan akses BAKTI untuk fasilitas umum.</p></div><div class="ev"><span class="badge b-info">Bulan 3-12</span><h3>Perluas ke dusun</h3><p class="muted">Tambah access point per dusun dari iuran dan dana desa. Evaluasi Starlink atau VSAT hanya bila uplink lain tidak memungkinkan.</p></div></div></div>`;
    const calc = () => {
      const i = { hamlets: +$('#pn').value || 1, kk: +$('#pk').value || 100, km: +$('#pd').value || 0, lte: $('#pl').value }, bud = +$('#pb').value || 0, r = plan(i).sort((a, b) => (b.feasible - a.feasible) || (a.y1 - b.y1));
      const best = r.find(x => x.feasible && x.monthlyT <= bud && x.id !== 'bakti') || r.find(x => x.feasible && x.id !== 'bakti');
      $('#pres').innerHTML = `<div class="warn-box" style="margin:.6rem 0 1rem"><b>Saran:</b> mulai dengan intranet dan ajukan BAKTI untuk fasilitas desa. Untuk uplink, pilih <b>${G.esc(best.name)}</b> (biaya awal ${G.money(best.capexT)}, bulanan ${G.money(best.monthlyT)}, sekitar ${G.money(best.kk)} per KK per bulan).</div>
        <div class="table-wrap"><table><thead><tr><th>Opsi</th><th>Awal</th><th>Bulanan</th><th>Per KK</th><th>Status</th></tr></thead><tbody>${r.map(o => `<tr><td><b>${G.esc(o.name)}</b><br><span class="muted">${G.esc(o.note)}</span></td><td>${G.money(o.capexT)}</td><td class="${o.monthlyT > bud ? 'minus' : ''}">${G.money(o.monthlyT)}</td><td>${G.money(o.kk)}</td><td>${o.feasible ? (o.monthlyT <= bud ? '<span class="badge b-ok">Layak</span>' : '<span class="badge b-warn">Melebihi anggaran</span>') : '<span class="badge b-bad">Tidak sesuai kondisi</span>'}</td></tr>`).join('')}</tbody></table></div>`;
    };
    $('#pf').addEventListener('input', calc); calc();
  }
  function diagram() {
    return `<svg viewBox="0 0 820 300" role="img" aria-label="Arsitektur jaringan desa"><rect width="820" height="300" rx="16" fill="#1e6fef" opacity=".06"/>
      <g fill="none" stroke="#1e6fef" stroke-width="3" stroke-dasharray="6 6"><path d="M130 150H235"/><path d="M345 150H430"/><path d="M520 150L640 70"/><path d="M520 150L640 150"/><path d="M520 150L640 230"/></g>
      <g font-size="13" font-weight="700" fill="#14213d" text-anchor="middle">
      <rect x="20" y="120" width="110" height="60" rx="12" fill="#0f8b8d"/><text x="75" y="156" fill="#fff">Uplink luar</text><text x="75" y="205">4G / PtP / BAKTI / VSAT</text>
      <rect x="235" y="120" width="110" height="60" rx="12" fill="#14213d"/><text x="290" y="156" fill="#fff">Router + cache</text><text x="290" y="205">Squid, DNS lokal</text>
      <rect x="430" y="110" width="90" height="80" rx="12" fill="#d7263d"/><text x="475" y="146" fill="#fff">Server</text><text x="475" y="164" fill="#fff">Ganexio</text><text x="475" y="212">+ Perpustakaan offline</text>
      <rect x="640" y="40" width="130" height="60" rx="12" fill="#f5b800"/><text x="705" y="76">AP Kantor Desa</text>
      <rect x="640" y="120" width="130" height="60" rx="12" fill="#f5b800"/><text x="705" y="156">AP Sekolah / Gereja</text>
      <rect x="640" y="200" width="130" height="60" rx="12" fill="#f5b800"/><text x="705" y="236">AP Dusun lain (PtP)</text></g></svg>`;
  }


  /* ---------- Pemantauan jaringan: status per dusun, pemakaian, voucher WiFi, dan pengumuman gangguan ---------- */
  const admin = ['admin', 'developer'].includes(G.role());
  const logs = () => Store.all('netlog'), outs = () => Store.all('outages');
  function stat(d) {
    const rows = logs().filter(x => x.dusun === d).sort((a, b) => new Date(a.at) - new Date(b.at)), day = rows.filter(x => Date.now() - new Date(x.at) < 864e5), last = rows[rows.length - 1] || { up: 0, clients: 0, rx: 0, tx: 0 }, act = outs().some(o => o.dusun === d && o.status === 'aktif');
    const j = (CONFIG.net || {}).simulate && last.up && !act ? (Math.sin(Date.now() / 7000 + d.length) * .5 + .5) : 0;
    return { rows: day, up: act ? 0 : last.up, clients: act ? 0 : Math.round(last.clients + j * 3), rx: act ? 0 : +(last.rx * (.9 + j * .2)).toFixed(1), tx: act ? 0 : +(last.tx * (.9 + j * .2)).toFixed(1), upt: day.length ? Math.round(day.filter(x => x.up).length / day.length * 100) : 0, act };
  }
  const spark = (v, w = 170, h = 42, col = '#1e6fef') => { const mx = Math.max(1, ...v); return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px"><polyline points="${v.map((x, i) => `${(i / Math.max(1, v.length - 1) * w).toFixed(1)},${(h - 4 - x / mx * (h - 8)).toFixed(1)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round"/></svg>`; };
  function drawMon() {
    const hs = CONFIG.village.hamlets.map(h => h.name), st = Object.fromEntries(hs.map(h => [h, stat(h)])), mine = (() => { try { return JSON.parse(localStorage.getItem('gx_myvoucher')); } catch (e) { return null; } })();
    const on = hs.filter(h => st[h].up).length, tot = hs.reduce((s, h) => s + st[h].clients, 0), rx = hs.reduce((s, h) => s + st[h].rx, 0), upt = Math.round(hs.reduce((s, h) => s + st[h].upt, 0) / hs.length), act = outs().filter(o => o.status === 'aktif'), vs = Store.all('vouchers').slice().reverse();
    $('#t-mon').innerHTML = `<div id="net-mon"></div>${act.map(o => `<div class="alert-banner">${G.icon('alert')}<span><b>Gangguan di ${G.esc(o.dusun)}:</b> ${G.esc(o.cause)} (sejak ${G.date(o.start)})</span>${admin ? `<button class="btn btn-ghost btn-sm" data-ofix="${o.id}" type="button" style="margin-left:auto">Tandai pulih</button>` : ''}</div>`).join('')}
      <div class="kpi">${[['Titik WiFi online', on + ' / ' + hs.length, 'wifi'], ['Perangkat terhubung', tot, 'users'], ['Unduh total', rx.toFixed(1) + ' Mbps', 'down'], ['Uptime 24 jam', upt + '%', 'clock']].map(([l, v, ic]) => `<div class="card"><span class="cat-ic">${G.icon(ic)}</span><div><span class="muted">${l}</span><b>${v}</b></div></div>`).join('')}</div>
      <div class="grid">${hs.map(h => { const s = st[h]; return `<article class="card lift" data-d="${G.esc(h)}" tabindex="0" role="button"><div class="row between"><b>${G.esc(h)}</b><span class="badge ${s.up ? 'b-ok' : 'b-bad'}">${s.act ? 'Gangguan' : s.up ? 'Online' : 'Offline'}</span></div>${spark(s.rows.map(x => x.clients))}<div class="row between muted"><span>${G.icon('users')} ${s.clients} perangkat</span><span>${G.icon('down')} ${s.rx} / ${G.icon('up')} ${s.tx} Mbps</span></div><div class="hbar"><i style="width:${s.upt}%"></i></div><span class="muted">Uptime 24 jam ${s.upt}%</span></article>`; }).join('')}</div>
      <div class="split" style="margin-top:1.2rem"><div class="card"><h2>Voucher WiFi</h2>${mine ? `<div class="warn-box" style="margin-bottom:.8rem">${G.icon('check')} Voucher aktif Anda <b>${G.esc(mine.code)}</b>: sisa <b id="vLeft"></b>, kuota ${mine.quotaMb} MB.</div>` : ''}<form id="vf" class="row" style="flex-wrap:nowrap"><input name="c" placeholder="Kode voucher, mis. GX-1A2B3" autocapitalize="characters" required aria-label="Kode voucher"><button class="btn btn-primary" type="submit">Tukar</button></form><div class="msg-err" id="vErr" role="alert" style="margin-top:.6rem"></div>
        ${admin ? `<hr style="border:0;border-top:1px solid var(--line);margin:1rem 0"><h3>Buat voucher (admin)</h3><form id="vg" class="stack"><div class="two"><div class="field" style="margin:0"><label>Jumlah</label><input name="n" type="number" min="1" max="50" value="5"></div><div class="field" style="margin:0"><label>Durasi (jam)</label><input name="h" type="number" min="1" value="24"></div></div><div class="two"><div class="field" style="margin:0"><label>Kuota (MB)</label><input name="q" type="number" min="50" value="500"></div><div class="field" style="margin:0"><label>Dusun</label><select name="d">${hs.map(h => `<option>${G.esc(h)}</option>`).join('')}</select></div></div><div class="row"><button class="btn btn-primary btn-sm" type="submit">${G.icon('plus')}Buat</button><button class="btn btn-ghost btn-sm" id="vPr" type="button">${G.icon('print')}Cetak voucher baru</button></div></form>` : ''}</div>
      <div class="card"><h2>Gangguan jaringan</h2>${admin ? `<form id="of" class="stack"><div class="two"><div class="field" style="margin:0"><label>Dusun</label><select name="d">${hs.map(h => `<option>${G.esc(h)}</option>`).join('')}</select></div><div class="field" style="margin:0"><label>Perkiraan pulih (jam)</label><input name="e" type="number" min="1" value="3"></div></div><div class="field" style="margin:0"><label>Penyebab</label><input name="c" required maxlength="120" placeholder="Contoh: antena tertutup pohon"></div><button class="btn btn-primary btn-sm" type="submit" style="align-self:start">${G.icon('alert')}Umumkan gangguan</button></form>` : '<p class="muted">Pengumuman gangguan dibuat admin desa dan tampil di semua halaman.</p>'}<div class="stack" style="margin-top:.8rem">${outs().slice().reverse().slice(0, 6).map(o => `<div class="row between"><span><span class="badge ${o.status === 'aktif' ? 'b-bad' : 'b-ok'}">${o.status}</span> <b>${G.esc(o.dusun)}</b> <span class="muted">${G.esc(o.cause)}</span></span><span class="muted">${G.date(o.start)}</span></div>`).join('') || '<p class="muted">Tidak ada catatan gangguan.</p>'}</div></div></div>
      ${admin ? `<div class="card" style="margin-top:1rem"><h2>Daftar voucher</h2><div class="table-wrap"><table><thead><tr><th>Kode</th><th>Dusun</th><th>Durasi</th><th>Kuota</th><th>Status</th></tr></thead><tbody>${vs.map(v => `<tr><td class="mono"><b>${G.esc(v.code)}</b></td><td>${G.esc(v.dusun)}</td><td>${v.hours} jam</td><td>${v.quotaMb} MB</td><td><span class="badge ${v.status === 'baru' ? 'b-ok' : 'b-info'}">${v.status}</span>${v.usedBy ? ' <span class="muted">' + G.esc(v.usedBy) + '</span>' : ''}</td></tr>`).join('')}</tbody></table></div></div>` : ''}`;
    const tick = () => { const el = $('#vLeft'); if (!el || !mine) return; const ms = new Date(mine.until) - Date.now(); el.textContent = ms > 0 ? Math.floor(ms / 36e5) + ' jam ' + Math.floor(ms % 36e5 / 6e4) + ' menit' : 'habis'; }; tick(); clearInterval(window.__vt); window.__vt = setInterval(tick, 20000);
    const vf = $('#vf'); vf.onsubmit = async e => { e.preventDefault(); const code = vf.c.value.trim().toUpperCase(), v = Store.all('vouchers').find(x => x.code === code), er = $('#vErr'); if (!v) return er.textContent = 'Kode voucher tidak ditemukan.'; if (v.status !== 'baru') return er.textContent = 'Voucher sudah dipakai.'; const who = await G.askName(); if (!who) return; Store.update('vouchers', v.id, { status: 'dipakai', usedBy: who, usedAt: new Date().toISOString() }); localStorage.setItem('gx_myvoucher', JSON.stringify({ code: v.code, quotaMb: v.quotaMb, until: new Date(Date.now() + v.hours * 36e5).toISOString() })); G.toast('Voucher aktif ' + v.hours + ' jam'); drawMon(); };
    const vg = $('#vg'); if (vg) { vg.onsubmit = e => { e.preventDefault(); const nw = []; for (let i = 0; i < +vg.n.value; i++) nw.push(Store.add('vouchers', { code: 'GX-' + Math.random().toString(36).slice(2, 7).toUpperCase(), hours: +vg.h.value, quotaMb: +vg.q.value, dusun: vg.d.value, status: 'baru', usedBy: '', usedAt: '' })); window.__newV = nw; G.toast(nw.length + ' voucher dibuat'); drawMon(); }; $('#vPr').onclick = () => { const nw = window.__newV || []; if (!nw.length) return G.toast('Buat voucher dulu', 'err'); const w = window.open('', '_blank'); w.document.write('<title>Voucher WiFi</title><body style="font-family:sans-serif;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">' + nw.map(v => `<div style="border:2px dashed #14213d;border-radius:10px;padding:12px;text-align:center"><b>Ganexio - ${CONFIG.village.name}</b><div style="font-size:22px;letter-spacing:2px;margin:8px 0">${v.code}</div>${v.hours} jam / ${v.quotaMb} MB<br>${v.dusun}</div>`).join('') + '</body>'); w.document.close(); w.print(); }; }
    const of = $('#of'); if (of) of.onsubmit = e => { e.preventDefault(); Store.add('outages', { dusun: of.d.value, cause: of.c.value.trim(), status: 'aktif', start: new Date().toISOString(), eta: +of.e.value }); G.toast('Gangguan diumumkan di seluruh halaman'); drawMon(); };
  }
  $('#t-mon').addEventListener('click', e => {
    const f = e.target.closest('[data-ofix]'); if (f && admin) { Store.update('outages', +f.dataset.ofix, { status: 'selesai', end: new Date().toISOString() }); G.toast('Ditandai pulih'); drawMon(); return; }
    const c = e.target.closest('[data-d]'); if (!c) return; const d = c.dataset.d, s = stat(d), cl = s.rows.map(x => x.clients), rx = s.rows.map(x => x.rx), o = outs().filter(x => x.dusun === d);
    G.modal(`<h2>${G.icon('wifi')} ${G.esc(d)}</h2><p class="muted">Data 24 jam terakhir (${s.rows.length} sampel).</p><h3>Perangkat terhubung</h3>${spark(cl, 560, 90, '#7a1f5c')}<h3>Kecepatan unduh (Mbps)</h3>${spark(rx, 560, 90, '#0a8f5b')}<div class="row between"><span>Uptime 24 jam</span><b>${s.upt}%</b></div><h3 style="margin-top:.8rem">Riwayat gangguan</h3>${o.map(x => `<div class="row between"><span>${G.esc(x.cause)}</span><span class="muted">${G.date(x.start)}</span></div>`).join('') || '<p class="muted">Tidak ada.</p>'}`, true);
  });
  setInterval(() => { if (!$('#t-mon').hidden && !document.querySelector('.modal') && !$('#t-mon').querySelector('input:focus')) drawMon(); }, 15000);
  addEventListener('gx:netlog', () => { if (!$('#t-mon').hidden) drawMon(); }); addEventListener('gx:outages', () => { if (!$('#t-mon').hidden) drawMon(); }); addEventListener('gx:vouchers', () => { if (!$('#t-mon').hidden && !$('#t-mon').querySelector('input:focus')) drawMon(); });

  /* ---------- Tab ---------- */
  function showTab(t) { G.$$('#itabs .tab').forEach(x => x.classList.toggle('on', x.dataset.t === t)); ['search', 'hist', 'book', 'net', 'mon'].forEach(id => $('#t-' + id).hidden = id !== t); if (t === 'hist') drawHist(); if (t === 'book') drawBook(); if (t === 'mon') drawMon(); }
  G.$$('#itabs .tab').forEach(t => t.onclick = () => showTab(t.dataset.t));
  drawSearch(); drawHist(); drawBook(); drawNet(); check();
})();
