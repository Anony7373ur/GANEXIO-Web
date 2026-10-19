/* Developer Mode: alat diagnosis dan informasi frontend/backend. Hanya terbuka dengan PIN developer (CONFIG.pins.developer).
   Catatan: PIN di sisi peramban hanya pembatas tampilan, bukan keamanan sungguhan. Untuk produksi gunakan login di server. */
(() => {
  G.init('dev');
  const $ = G.$, $$ = G.$$, esc = G.esc;
  if (G.role() !== 'developer') { $('#locked').hidden = false; $('#openPin').onclick = () => G.unlock('developer'); return; }
  $('#devApp').hidden = false;
  $('#d-log').insertAdjacentHTML('beforebegin', '<section id="d-sync" hidden></section><section id="d-pins" hidden></section>');
  const B = { ok: 'b-ok', warn: 'b-warn', err: 'b-bad', info: 'b-info' }, BL = { ok: 'OK', warn: 'Perhatian', err: 'Galat', info: 'Info' };
  const row = (s, a, b) => `<div class="dv-row"><span class="badge ${B[s]}">${BL[s]}</span><b>${esc(a)}</b>${b ? `<span class="muted">${esc(b)}</span>` : ''}</div>`;
  const kb = n => (n / 1024).toFixed(1) + ' KB';
  const dl = (name, text, type = 'text/plain') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); };
  const keys = () => Object.keys(localStorage).filter(k => k.startsWith('gx_'));
  const colls = () => keys().map(k => k.slice(3)).filter(k => Array.isArray(Store.get(k, null)));
  const typeOf = v => v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v === 'number' ? (Number.isInteger(v) ? 'integer' : 'number') : typeof v;
  const fields = name => { const f = {}; Store.all(name).slice(0, 30).forEach(r => Object.keys(r).forEach(k => { f[k] = f[k] || typeOf(r[k]); })); return f; };

  /* =============== DIAGNOSA =============== */
  const CHECKS = {
    env: ['Lingkungan peramban', async () => { const n = navigator, s = screen; let ok = true; try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); } catch (e) { ok = false; }
      return [['info', 'Peramban', n.userAgent], ['info', 'Bahasa / zona waktu', `${n.language} / ${Intl.DateTimeFormat().resolvedOptions().timeZone}`], ['info', 'Layar / viewport', `${s.width}x${s.height} / ${innerWidth}x${innerHeight} @${devicePixelRatio}x`], [navigator.onLine ? 'ok' : 'warn', 'Status jaringan', navigator.onLine ? 'online' : 'offline (fungsi lokal tetap berjalan)'],
        [ok ? 'ok' : 'err', 'localStorage', ok ? 'tersedia' : 'TIDAK tersedia: data tidak akan tersimpan'], [location.protocol === 'file:' ? 'warn' : 'ok', 'Protokol', location.protocol + (location.protocol === 'file:' ? ' (pemeriksaan berkas dan iframe terbatas; gunakan Live Server)' : '')], ['info', 'Sentuh / kurangi animasi', `${'ontouchstart' in window ? 'ya' : 'tidak'} / ${matchMedia('(prefers-reduced-motion: reduce)').matches ? 'ya' : 'tidak'}`], [typeof structuredClone === 'function' && CSS.supports('color', 'color-mix(in srgb, red, blue)') ? 'ok' : 'warn', 'Fitur modern (color-mix, structuredClone)', 'dibutuhkan oleh CSS dan JS situs']]; }],
    store: ['Penyimpanan', async () => { const items = keys().map(k => [k, (k.length + (localStorage.getItem(k) || '').length) * 2]).sort((a, b) => b[1] - a[1]), tot = items.reduce((s, x) => s + x[1], 0), pct = tot / (5 * 1024 * 1024) * 100;
      return [[pct > 80 ? 'err' : pct > 50 ? 'warn' : 'ok', 'Total terpakai', `${kb(tot)} dari kira-kira 5 MB (${pct.toFixed(1)}%)`], ...items.slice(0, 8).map(([k, b]) => ['info', k, kb(b)]), ['info', 'sessionStorage', keys.length ? Object.keys(sessionStorage).join(', ') || '-' : '-']]; }],
    data: ['Integritas data', async () => {
      const out = [], A = n => Store.all(n), ids = n => A(n).map(x => x.id), dup = a => a.filter((x, i) => a.indexOf(x) !== i);
      colls().forEach(n => { const d = dup(ids(n)).filter(x => x !== undefined); if (d.length) out.push(['err', `ID ganda di ${n}`, d.join(', ')]); });
      const prod = new Set(ids('products')); const orph = A('orders').filter(o => !prod.has(o.productId)); out.push([orph.length ? 'warn' : 'ok', 'Pesanan tanpa produk', orph.length ? orph.map(o => o.code).join(', ') : 'tidak ada']);
      const codes = [...A('supplies'), ...A('orders'), ...A('tickets')].map(x => x.code); const dc = dup(codes); out.push([dc.length ? 'err' : 'ok', 'Kode tiket/pesanan unik', dc.length ? 'ganda: ' + dc.join(', ') : 'semua unik']);
      const ST = ['menunggu', 'proses', 'dalam perjalanan', 'sampai', 'selesai']; const bad = A('supplies').filter(s => !ST.includes(s.status) || !(s.items || []).length); out.push([bad.length ? 'err' : 'ok', 'Status dan barang pasokan', bad.length ? bad.map(s => s.code).join(', ') : 'valid']);
      const f = A('funds'), sal = f.reduce((s, t) => s + (t.type === 'masuk' ? t.amount : -t.amount), 0); out.push([sal < 0 ? 'err' : 'ok', 'Saldo kas', G.money(sal)]); out.push([f.some(t => !(t.amount > 0)) ? 'err' : 'ok', 'Jumlah transaksi > 0', f.some(t => !(t.amount > 0)) ? 'ada yang tidak valid' : 'valid']);
      const pr = A('products').filter(p => p.stock < 0 || p.price < 0); out.push([pr.length ? 'err' : 'ok', 'Stok dan harga produk', pr.length ? 'ada nilai negatif' : 'valid']); return out; }],
    todo: ['Isian TODO-ISI di config', async () => { const hits = []; (function walk(o, p) { if (typeof o === 'string') { if (o.includes('TODO-ISI')) hits.push(p); } else if (o && typeof o === 'object') Object.keys(o).forEach(k => walk(o[k], p + (Array.isArray(o) ? `[${k}]` : '.' + k))); })(CONFIG, 'CONFIG');
      return [[hits.length ? 'warn' : 'ok', `${hits.length} isian masih TODO-ISI`, hits.length ? 'Isi sebelum dipublikasikan' : 'Semua terisi'], ...hits.slice(0, 40).map(h => ['info', h, ''])]; }],
    assets: ['Aset gambar dan berkas', async () => {
      const imgs = new Set(['img/logo.png', 'img/logo-white.png', 'img/favicon.png', 'img/placeholder-photo.svg', 'img/placeholder-profile.svg', 'img/placeholder-product.svg']);
      const add = s => { if (s && !/^(data:|https?:)/.test(s)) imgs.add(s.startsWith('img/') ? s : 'img/' + s); };
      add(CONFIG.village.photo); (CONFIG.village.gallery || []).forEach(g => add(g.src)); CONFIG.officials.forEach(o => add(o.photo)); (CONFIG.team || []).forEach(o => add(o.photo)); Store.all('products').forEach(p => add(p.image)); G.PAGES.forEach(p => imgs.add(`img/bg-${p.id}.svg`)); imgs.add('img/bg-home.svg');
      const test = src => new Promise(r => { const i = new Image(); const t = setTimeout(() => r(false), 4000); i.onload = () => { clearTimeout(t); r(true); }; i.onerror = () => { clearTimeout(t); r(false); }; i.src = src; });
      const res = await Promise.all([...imgs].map(async s => [s, await test(s)])), miss = res.filter(x => !x[1]);
      const out = [[miss.length ? 'warn' : 'ok', `${res.length - miss.length}/${res.length} gambar termuat`, miss.length ? 'Ada yang hilang: ganti nama berkas atau hapus rujukan' : '']]; miss.forEach(m => out.push(['err', 'Tidak ditemukan', m[0]]));
      if (location.protocol !== 'file:') { for (const f of ['css/style.css', 'js/config.js', 'js/store.js', 'js/app.js', 'js/seed.js', 'index.html']) { try { const r = await fetch(f, { method: 'HEAD' }); out.push([r.ok ? 'ok' : 'err', f, r.ok ? 'tersedia' : 'status ' + r.status]); } catch (e) { out.push(['err', f, 'gagal dimuat']); } } } return out; }],
    perf: ['Performa', async () => { const nav = performance.getEntriesByType('navigation')[0], res = performance.getEntriesByType('resource'); const out = [];
      if (nav) { out.push([nav.domContentLoadedEventEnd < 1500 ? 'ok' : 'warn', 'DOMContentLoaded', Math.round(nav.domContentLoadedEventEnd) + ' ms']); out.push([nav.loadEventEnd < 3000 ? 'ok' : 'warn', 'Load', Math.round(nav.loadEventEnd) + ' ms']); }
      out.push(['info', 'Sumber daya dimuat', `${res.length} berkas, ${kb(res.reduce((s, r) => s + (r.transferSize || 0), 0))} ditransfer`]); if (performance.memory) out.push(['info', 'Memori JS', kb(performance.memory.usedJSHeapSize)]);
      const n = await new Promise(r => { let f = 0, t0 = performance.now(); (function l(t) { f++; if (t - t0 < 1500) requestAnimationFrame(l); else r(Math.round(f / ((t - t0) / 1000))); })(t0); }); out.push([n >= 50 ? 'ok' : n >= 30 ? 'warn' : 'err', 'Frame rate (1,5 detik)', n + ' fps']); out.push(['info', 'Jumlah elemen DOM', document.getElementsByTagName('*').length]); return out; }]
  };
  function audit(doc, label) {
    const out = [], w = doc.defaultView; const T = (c, m, d) => out.push([c ? 'ok' : 'warn', m, d || '']);
    const noAlt = [...doc.images].filter(i => !i.hasAttribute('alt')); T(!noAlt.length, 'Gambar punya alt', noAlt.length ? noAlt.length + ' gambar tanpa alt' : '');
    const noName = [...doc.querySelectorAll('button,a[href]')].filter(b => !(b.textContent.trim() || b.getAttribute('aria-label') || b.getAttribute('title') || b.querySelector('img[alt]'))); T(!noName.length, 'Tombol/tautan punya nama', noName.length ? noName.length + ' tanpa nama' : '');
    const noLbl = [...doc.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]),select,textarea')].filter(i => !(i.getAttribute('aria-label') || i.closest('label') || (i.id && doc.querySelector(`label[for="${i.id}"]`)) || i.getAttribute('title') || i.placeholder)); T(!noLbl.length, 'Isian punya label', noLbl.length ? noLbl.length + ' tanpa label' : '');
    const ids = [...doc.querySelectorAll('[id]')].map(e => e.id), d = ids.filter((x, i) => ids.indexOf(x) !== i); T(!d.length, 'ID unik', d.join(', '));
    T(doc.querySelectorAll('h1').length === 1, 'Tepat satu h1', doc.querySelectorAll('h1').length + ' h1'); T(!!doc.documentElement.lang, 'Atribut lang', doc.documentElement.lang); T(!!doc.querySelector('meta[name=viewport]'), 'Meta viewport', ''); T(!!doc.title, 'Judul halaman', doc.title);
    const small = [...doc.querySelectorAll('button,.btn,a.tab,.tab')].filter(b => { const r = b.getBoundingClientRect(); return r.width && (r.height < 34 || r.width < 34); }); T(!small.length, 'Area sentuh >= 34px', small.length ? small.length + ' terlalu kecil' : '');
    const ov = doc.documentElement.scrollWidth > doc.documentElement.clientWidth + 1; out.push([ov ? 'err' : 'ok', `Tidak ada scroll horizontal (${w.innerWidth}px)`, ov ? `scrollWidth ${doc.documentElement.scrollWidth}` : '']); return out;
  }
  const PG = G.PAGES.map(p => p.href).concat('index.html', 'developer.html');
  const auditFrame = (src, width) => new Promise(r => { const f = document.createElement('iframe'); f.style.cssText = `position:fixed;left:-9999px;top:0;width:${width}px;height:800px;border:0`; f.src = src; const t = setTimeout(() => { f.remove(); r(null); }, 6000); f.onload = () => setTimeout(() => { clearTimeout(t); let res = null; try { res = audit(f.contentDocument, src); } catch (e) {} f.remove(); r(res); }, 900); document.body.append(f); });
  CHECKS.a11y = ['Aksesibilitas dan HP (semua halaman, 360 px)', async () => {
    if (location.protocol === 'file:') return [['warn', 'Tidak dapat dijalankan dari file://', 'Gunakan Live Server atau hosting agar iframe dapat dibaca']];
    const out = []; for (const p of PG) { const r = await auditFrame(p, 360); if (!r) { out.push(['warn', p, 'tidak dapat dibaca']); continue; } const bad = r.filter(x => x[0] !== 'ok'); out.push([bad.length ? (bad.some(x => x[0] === 'err') ? 'err' : 'warn') : 'ok', p, bad.length ? bad.map(x => x[1] + (x[2] ? ' (' + x[2] + ')' : '')).join('; ') : 'lolos semua pemeriksaan']); } return out; }];
  function drawDiag() {
    $('#d-diag').innerHTML = `<div class="row between" style="margin-bottom:1rem"><p class="muted" style="max-width:60ch">Jalankan pemeriksaan otomatis untuk lingkungan, penyimpanan, data, isian config, aset, performa, dan aksesibilitas.</p><button class="btn btn-primary" id="runAll" type="button">${G.icon('refresh')}Jalankan semua</button></div><div class="stack">${Object.entries(CHECKS).map(([k, [t]]) => `<div class="card"><div class="row between"><h3>${esc(t)}</h3><button class="btn btn-ghost btn-sm" data-run="${k}" type="button">Jalankan</button></div><div id="r-${k}" class="muted" style="margin-top:.4rem">Belum dijalankan.</div></div>`).join('')}</div>`;
  }
  async function run(k) { const el = $('#r-' + k); el.innerHTML = '<div class="spinner"></div>'; try { el.innerHTML = (await CHECKS[k][1]()).map(r => row(...r)).join(''); } catch (e) { el.innerHTML = row('err', 'Pemeriksaan gagal', e.message); } }
  $('#d-diag').addEventListener('click', async e => { const b = e.target.closest('[data-run]'); if (b) run(b.dataset.run); if (e.target.closest('#runAll')) for (const k of Object.keys(CHECKS)) await run(k); });

  /* =============== DATA DAN SQL =============== */
  let cur = null;
  const sqlType = (name, f) => f === 'integer' ? (f === 'integer' && name === 'id' ? 'INTEGER PRIMARY KEY' : 'INTEGER') : f === 'number' ? 'REAL' : f === 'boolean' ? 'INTEGER' : 'TEXT';
  function genSql() {
    let s = `-- Diekspor dari Ganexio Developer Mode: ${new Date().toISOString()}\n-- Kolom bertipe array/objek disimpan sebagai teks JSON.\n\n`;
    colls().forEach(n => { const f = fields(n), rows = Store.all(n); if (!Object.keys(f).length) return;
      s += `CREATE TABLE IF NOT EXISTS gx_${n} (\n${Object.keys(f).map(k => `  ${k.replace(/\W/g, '_')} ${sqlType(k, f[k])}`).join(',\n')}\n);\n`;
      rows.forEach(r => { s += `INSERT INTO gx_${n} (${Object.keys(f).map(k => k.replace(/\W/g, '_')).join(', ')}) VALUES (${Object.keys(f).map(k => { const v = r[k]; return v === undefined || v === null ? 'NULL' : typeof v === 'number' ? v : typeof v === 'boolean' ? +v : "'" + (typeof v === 'object' ? JSON.stringify(v) : String(v)).replace(/'/g, "''") + "'"; }).join(', ')});\n`; }); s += '\n'; });
    return s;
  }
  function runSql(q) {
    const m = q.trim().replace(/;$/, '').match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(\w+)(?:\s+(asc|desc))?)?(?:\s+limit\s+(\d+))?$/i);
    if (!m) throw new Error('Format: SELECT kolom FROM tabel [WHERE ...] [ORDER BY kolom ASC|DESC] [LIMIT n]');
    const [, cols, tbl, where, ob, dir, lim] = m; if (!colls().includes(tbl)) throw new Error('Tabel tidak ada. Pilih: ' + colls().join(', '));
    let rows = Store.all(tbl);
    if (where) where.split(/\s+and\s+/i).forEach(c => { const w = c.match(/^(\w+)\s*(=|!=|>=|<=|>|<|like)\s*(.+)$/i); if (!w) throw new Error('Kondisi tidak dikenali: ' + c); const [, k, op, raw] = w, v = /^['"].*['"]$/.test(raw.trim()) ? raw.trim().slice(1, -1) : (isNaN(raw) ? raw.trim() : Number(raw));
      rows = rows.filter(r => { const x = r[k]; switch (op.toLowerCase()) { case '=': return x == v; case '!=': return x != v; case '>': return x > v; case '<': return x < v; case '>=': return x >= v; case '<=': return x <= v; default: return String(x).toLowerCase().includes(String(v).replace(/%/g, '').toLowerCase()); } }); });
    if (ob) rows = rows.slice().sort((a, b) => (a[ob] > b[ob] ? 1 : a[ob] < b[ob] ? -1 : 0) * (/desc/i.test(dir) ? -1 : 1));
    if (lim) rows = rows.slice(0, +lim);
    if (/^count\(\*\)$/i.test(cols.trim())) return [{ 'count(*)': rows.length }];
    const sel = cols.trim() === '*' ? null : cols.split(',').map(c => c.trim()); return rows.map(r => sel ? Object.fromEntries(sel.map(k => [k, r[k]])) : r);
  }
  const tableHtml = rows => { if (!rows.length) return G.empty('list', 'Tidak ada baris.'); const k = [...new Set(rows.flatMap(r => Object.keys(r)))].slice(0, 7); return `<div class="table-wrap"><table class="dv-tbl"><thead><tr>${k.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, 100).map(r => `<tr>${k.map(c => `<td class="mono">${esc(typeof r[c] === 'object' ? JSON.stringify(r[c]) : r[c]).slice(0, 80)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; };
  function drawData() {
    const cs = colls(); cur = cur && cs.includes(cur) ? cur : cs[0];
    $('#d-data').innerHTML = `<div class="dv-tools"><div class="card"><h3>Penjelajah data</h3><div class="row" style="margin:.6rem 0"><select id="cs" style="flex:1" aria-label="Koleksi">${cs.map(c => `<option ${c === cur ? 'selected' : ''}>${c}</option>`).join('')}</select><button class="btn btn-ghost btn-sm" id="addRec" type="button">${G.icon('plus')}Tambah</button></div><div id="cv"></div></div>
      <div class="card"><h3>Kueri SQL (baca saja)</h3><p class="muted">Subset SQL: SELECT, WHERE (AND), ORDER BY, LIMIT, count(*).</p><textarea id="sq" class="mono" style="min-height:70px;margin:.5rem 0">SELECT code, status FROM supplies ORDER BY id DESC LIMIT 5</textarea><div class="row"><button class="btn btn-primary btn-sm" id="sqRun" type="button">Jalankan</button>${["SELECT count(*) FROM funds", "SELECT description, amount FROM funds WHERE type='masuk' ORDER BY amount DESC LIMIT 3", "SELECT name, price, stock FROM products WHERE stock > 0"].map(x => `<button class="chip" data-ex="${esc(x)}" type="button">${esc(x.slice(0, 28))}...</button>`).join('')}</div><div id="sqOut" style="margin-top:.8rem"></div></div></div>
      <div class="card" style="margin-top:1rem"><h3>Cadangan dan migrasi</h3><div class="row" style="margin-top:.6rem"><button class="btn btn-ghost btn-sm" id="exAll" type="button">${G.icon('download')}Ekspor semua (JSON)</button><label class="btn btn-ghost btn-sm" style="cursor:pointer">${G.icon('plus')}Impor JSON<input id="imp" type="file" accept="application/json" hidden></label><button class="btn btn-ghost btn-sm" id="exSql" type="button">${G.icon('server')}Ekspor SQL (CREATE + INSERT)</button><button class="btn btn-ghost btn-sm" id="rst" type="button">${G.icon('refresh')}Kembalikan data contoh</button></div></div>`;
    showColl();
  }
  function showColl() {
    const el = $('#cv'); if (!cur) { el.innerHTML = G.empty('list', 'Belum ada data.'); return; } const rows = Store.all(cur);
    el.innerHTML = `<p class="muted">${rows.length} baris &bull; ${Object.entries(fields(cur)).map(([k, t]) => `${k}:${t}`).join(', ').slice(0, 220)}</p><div class="table-wrap"><table class="dv-tbl"><thead><tr><th>id</th><th>ringkas</th><th></th></tr></thead><tbody>${rows.slice(-50).reverse().map(r => `<tr><td class="mono">${r.id}</td><td class="mono">${esc(JSON.stringify(r)).slice(0, 90)}</td><td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" data-ed="${r.id}" type="button">Ubah</button> <button class="btn btn-ghost btn-sm" data-rm="${r.id}" type="button" aria-label="Hapus">${G.icon('trash')}</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  const editRec = id => { const a = Store.all(cur), r = id == null ? { ...(a[0] ? Object.fromEntries(Object.keys(a[0]).map(k => [k, typeof a[0][k] === 'number' ? 0 : Array.isArray(a[0][k]) ? [] : ''])) : {}), id: G.nextId(cur) } : a.find(x => x.id === id);
    const m = G.modal(`<h2>${id == null ? 'Tambah' : 'Ubah'} data ${esc(cur)}</h2><div class="msg-err" role="alert"></div><textarea class="mono" id="je" style="min-height:260px">${esc(JSON.stringify(r, null, 2))}</textarea><button class="btn btn-primary" id="jOk" type="button" style="margin-top:.8rem">${G.icon('check')}Simpan</button>`, true);
    m.querySelector('#jOk').onclick = () => { try { const o = JSON.parse(m.querySelector('#je').value); const arr = Store.all(cur), i = arr.findIndex(x => x.id === o.id); if (i >= 0) arr[i] = o; else arr.push(o); Store.set(cur, arr); m.close(); showColl(); G.toast('Data disimpan'); } catch (e) { m.querySelector('.msg-err').textContent = 'JSON tidak valid: ' + e.message; } }; };
  $('#d-data').addEventListener('click', async e => {
    if (e.target.closest('#addRec')) editRec(null);
    const ed = e.target.closest('[data-ed]'), rm = e.target.closest('[data-rm]'), ex = e.target.closest('[data-ex]');
    if (ed) editRec(+ed.dataset.ed);
    if (rm && await G.confirm('Hapus baris ini dari ' + cur + '?')) { Store.set(cur, Store.all(cur).filter(x => x.id !== +rm.dataset.rm)); showColl(); }
    if (ex) { $('#sq').value = ex.dataset.ex; $('#sqRun').click(); }
    if (e.target.closest('#sqRun')) { try { const r = runSql($('#sq').value); $('#sqOut').innerHTML = `<p class="muted">${r.length} baris</p>` + tableHtml(r); } catch (x) { $('#sqOut').innerHTML = `<div class="msg-err">${esc(x.message)}</div>`; } }
    if (e.target.closest('#exAll')) { const o = {}; keys().forEach(k => { try { o[k] = JSON.parse(localStorage.getItem(k)); } catch (x) { o[k] = localStorage.getItem(k); } }); dl('ganexio-backup.json', JSON.stringify(o, null, 2), 'application/json'); }
    if (e.target.closest('#exSql')) dl('ganexio-data.sql', genSql());
    if (e.target.closest('#rst') && await G.confirm('Kembalikan data contoh? Semua perubahan akan hilang.')) { Store.reset(); location.reload(); }
  });
  $('#d-data').addEventListener('change', async e => {
    if (e.target.id === 'cs') { cur = e.target.value; showColl(); }
    if (e.target.id === 'imp' && e.target.files[0]) { try { const o = JSON.parse(await e.target.files[0].text()); if (await G.confirm('Impor ' + Object.keys(o).length + ' kunci data? Data yang ada akan ditimpa.')) { Object.entries(o).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v))); location.reload(); } } catch (x) { G.toast('Berkas tidak valid: ' + x.message, 'err'); } }
  });

  /* =============== FRONTEND =============== */
  const TOK = ['--red', '--navy', '--blue', '--cyan', '--teal', '--green', '--amber', '--orange', '--plum', '--violet', '--bg', '--ink', '--muted', '--line'];
  const lum = h => { const c = h.replace('#', ''), f = c.length === 3 ? c.split('').map(x => x + x).join('') : c, v = [0, 2, 4].map(i => parseInt(f.substr(i, 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4)); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b), hi = Math.max(x, y), lo = Math.min(x, y); return ((hi + .05) / (lo + .05)); };
  function drawFront() {
    const css = []; let mq = [], kf = []; try { [...document.styleSheets].forEach(s => { [...s.cssRules].forEach(r => { if (r.type === CSSRule.MEDIA_RULE) mq.push(r.conditionText); if (r.type === CSSRule.KEYFRAMES_RULE) kf.push(r.name); }); }); } catch (e) { css.push('Aturan CSS tidak dapat dibaca (batasan file://). Gunakan Live Server.'); }
    mq = [...new Set(mq)]; kf = [...new Set(kf)];
    const M = typeof DEVMANIFEST !== 'undefined' ? DEVMANIFEST : { built: '-', files: [] }, tot = M.files.reduce((s, f) => s + f.bytes, 0), ln = M.files.reduce((s, f) => s + f.lines, 0);
    const cs = getComputedStyle(document.documentElement);
    $('#d-front').innerHTML = `<div class="stack">
      <div class="card"><h3>Stack dan struktur</h3><p class="muted">HTML, CSS, dan JavaScript murni tanpa framework dan tanpa build. Data di localStorage lewat <span class="mono">js/store.js</span>. Manifest dibuat saat pengemasan (${esc(M.built)}): ${M.files.length} berkas, ${kb(tot)}, ${ln.toLocaleString('id-ID')} baris.</p>
        <div class="table-wrap"><table class="dv-tbl"><thead><tr><th>Berkas</th><th>Ukuran</th><th>Baris</th></tr></thead><tbody>${M.files.map(f => `<tr><td class="mono">${esc(f.p)}</td><td>${kb(f.bytes)}</td><td>${f.lines || '-'}</td></tr>`).join('')}</tbody></table></div></div>
      <div class="card"><h3>Halaman dan skrip</h3><p class="muted">Urutan muat di tiap halaman: config.js, seed.js, store.js, app.js, lalu skrip halaman (<span class="mono">js/nama.js</span>). Developer menambah devmanifest.js dan dev.js.</p><div class="chips">${PG.map(p => `<a class="chip" href="${p}">${esc(p)}</a>`).join('')}</div></div>
      <div class="card"><h3>Token desain (ubah langsung untuk mencoba)</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">${TOK.filter(t => cs.getPropertyValue(t).trim()).map(t => `<div class="row" style="flex-wrap:nowrap"><input type="color" data-tok="${t}" value="${cs.getPropertyValue(t).trim().length === 7 ? cs.getPropertyValue(t).trim() : '#000000'}" style="width:44px;min-height:40px;padding:2px"><span class="mono">${t}<br><span class="muted">${esc(cs.getPropertyValue(t).trim())}</span></span></div>`).join('')}</div>
        <div class="row" style="margin-top:.8rem"><button class="btn btn-ghost btn-sm" id="tokCopy" type="button">${G.icon('copy')}Salin CSS perubahan</button><button class="btn btn-ghost btn-sm" id="tokReset" type="button">${G.icon('refresh')}Setel ulang</button></div></div>
      <div class="dv-tools"><div class="card"><h3>Media query (${mq.length})</h3>${css.map(c => `<p class="muted">${esc(c)}</p>`).join('')}<div class="stack" style="gap:.2rem">${mq.map(m => `<span class="mono">@media ${esc(m)}</span>`).join('')}</div></div><div class="card"><h3>Animasi @keyframes (${kf.length})</h3><div class="chips">${kf.map(k => `<span class="badge b-info mono">${esc(k)}</span>`).join('')}</div></div></div>
      <div class="card"><h3>Ikon (${G.iconNames.length}) - tekan untuk menyalin pemanggilan</h3><div class="gicons">${G.iconNames.map(n => `<button type="button" data-ic2="${n}">${G.icon(n)}${n}</button>`).join('')}</div></div>
      <div class="card"><h3>Komponen</h3><div class="row"><button class="btn btn-primary">Utama</button><button class="btn btn-ghost">Garis</button><button class="btn btn-light" style="background:var(--navy);color:#fff">Gelap</button><span class="badge">Netral</span><span class="badge b-ok">OK</span><span class="badge b-warn">Perhatian</span><span class="badge b-bad">Galat</span><span class="badge b-info">Info</span><span class="chip on">Chip</span></div><div class="row" style="margin-top:.8rem"><span class="cat-ic">${G.icon('truck')}</span><span class="cat-ic" style="--c1:#0a8f5b;--c2:#38c98a">${G.icon('wallet')}</span><span class="cat-ic" style="--c1:#7a1f5c;--c2:#e0407b">${G.icon('chat')}</span><div class="hbar" style="flex:1;min-width:140px"><i style="width:62%"></i></div></div></div>
      <div class="card"><h3>Penguji responsif</h3><div class="row" style="margin:.6rem 0"><select id="rp" style="width:auto">${PG.map(p => `<option>${p}</option>`).join('')}</select>${[360, 390, 768, 1024].map(w => `<button class="chip" data-w="${w}" type="button">${w}px</button>`).join('')}<button class="btn btn-ghost btn-sm" id="rOv" type="button">Cek overflow</button></div><div id="rRes" class="muted"></div><div style="overflow:auto"><iframe id="rf" class="frame" style="width:390px;height:620px" title="Pratinjau responsif"></iframe></div></div>
      <div class="card"><h3>Pemeriksa kontras (WCAG)</h3><div class="row"><input type="color" id="cA" value="#1b2236" style="width:60px"><input type="color" id="cB" value="#ffffff" style="width:60px"><b id="cR"></b></div></div></div>`;
    const load = () => { $('#rf').src = $('#rp').value; }; load(); $('#rp').onchange = load;
    const contrast = () => { const r = ratio($('#cA').value, $('#cB').value); $('#cR').innerHTML = `${r.toFixed(2)} : 1 <span class="badge ${r >= 7 ? 'b-ok' : r >= 4.5 ? 'b-ok' : r >= 3 ? 'b-warn' : 'b-bad'}">${r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA teks besar' : 'Gagal'}</span>`; }; contrast(); $('#cA').oninput = $('#cB').oninput = contrast;
  }
  const chg = {};
  $('#d-front').addEventListener('input', e => { const t = e.target.dataset.tok; if (t) { document.documentElement.style.setProperty(t, e.target.value); chg[t] = e.target.value; } });
  $('#d-front').addEventListener('click', e => {
    const w = e.target.closest('[data-w]'), ic = e.target.closest('[data-ic2]');
    if (w) $('#rf').style.width = w.dataset.w + 'px';
    if (ic) G.copy(`G.icon('${ic.dataset.ic2}')`);
    if (e.target.closest('#tokCopy')) G.copy(':root{' + Object.entries(chg).map(([k, v]) => `${k}:${v}`).join(';') + '}');
    if (e.target.closest('#tokReset')) { TOK.forEach(t => document.documentElement.style.removeProperty(t)); drawFront(); }
    if (e.target.closest('#rOv')) { try { const r = audit($('#rf').contentDocument, ''); $('#rRes').innerHTML = r.map(x => row(x[0], x[1], x[2])).join(''); } catch (x) { $('#rRes').textContent = 'Tidak dapat dibaca (gunakan Live Server).'; } }
  });

  /* =============== BACKEND =============== */
  function openapi() {
    const sch = n => ({ type: 'object', properties: Object.fromEntries(Object.entries(fields(n)).map(([k, t]) => [k, { type: t === 'null' ? 'string' : t }])) }), paths = {};
    colls().forEach(n => { const ref = { $ref: '#/components/schemas/' + n }; paths['/api/' + n] = { get: { summary: 'Daftar ' + n, responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: ref } } } } } }, post: { summary: 'Buat ' + n, requestBody: { content: { 'application/json': { schema: ref } } }, responses: { 201: { description: 'Dibuat' } } } };
      paths[`/api/${n}/{id}`] = { patch: { summary: 'Ubah ' + n, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: ref } } }, responses: { 200: { description: 'OK' } } }, delete: { summary: 'Hapus ' + n, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Dihapus' } } } }; });
    return { openapi: '3.0.3', info: { title: 'Ganexio API (rancangan)', version: '0.1.0' }, paths, components: { schemas: Object.fromEntries(colls().map(n => [n, sch(n)])) } };
  }
  const REL = [['orders.productId', 'products.id'], ['cctvrec.camId', 'cameras (CONFIG.cameras).id'], ['supplies.items[]', 'tabel anak supply_items (normalisasi)'], ['posts.replies[]', 'tabel anak post_replies'], ['tickets.history[]', 'tabel anak ticket_history']];
  function drawBack() {
    $('#d-back').innerHTML = `<div class="stack">
      <div class="card"><h3>Arsitektur saat ini</h3><p>Seluruh data tersimpan di <b>localStorage</b> peramban lewat objek <span class="mono">Store</span>. Tidak ada server, tidak ada sinkronisasi antar perangkat. Peran (admin, bendahara, developer) dibuka dengan PIN di <span class="mono">sessionStorage</span>, hanya pembatas tampilan.</p>
        <pre class="code">halaman  ->  Store.all/add/update/remove  ->  localStorage (gx_*)\n                    |\n                    +--> CustomEvent 'gx:<koleksi>'  ->  tampilan memperbarui diri\nBatas: ~5 MB per asal (origin), data per peramban, tanpa autentikasi nyata</pre></div>
      <div class="card"><h3>API Store (js/store.js)</h3><div class="table-wrap"><table class="dv-tbl"><thead><tr><th>Fungsi</th><th>Keterangan</th></tr></thead><tbody>${[['Store.all(nama)', 'Semua baris koleksi (array)'], ['Store.add(nama, objek)', 'Tambah baris, isi id dan created otomatis, kirim event'], ['Store.update(nama, id, patch|fungsi)', 'Gabungkan perubahan ke baris'], ['Store.remove(nama, id)', 'Hapus baris'], ['Store.get(kunci, bawaan) / set(kunci, nilai)', 'Nilai tunggal, mis. fundcfg, inetcfg'], ['Store.seed() / reset()', 'Isi data contoh / hapus semua lalu isi ulang']].map(r => `<tr><td class="mono">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div><p class="muted" style="margin-top:.6rem">Saat server siap, ganti isi fungsi ini dengan fetch ke API. Halaman lain tidak perlu diubah (ubah menjadi async bila perlu).</p></div>
      <div class="card"><h3>Koleksi dan model data</h3><div class="table-wrap"><table class="dv-tbl"><thead><tr><th>Koleksi</th><th>Baris</th><th>Kolom</th></tr></thead><tbody>${colls().map(n => `<tr><td class="mono">${n}</td><td>${Store.all(n).length}</td><td class="mono">${esc(Object.entries(fields(n)).map(([k, t]) => k + ':' + t).join(', '))}</td></tr>`).join('')}</tbody></table></div><h3 style="margin-top:1rem">Relasi</h3>${REL.map(r => `<p class="mono">${esc(r[0])} &rarr; ${esc(r[1])}</p>`).join('')}</div>
      <div class="card"><h3>Rancangan REST API untuk server nanti</h3><div class="table-wrap"><table class="dv-tbl"><thead><tr><th>Metode</th><th>Alamat</th><th>Fungsi</th></tr></thead><tbody>${colls().map(n => `<tr><td class="mono">GET POST</td><td class="mono">/api/${n}</td><td>Daftar / buat</td></tr><tr><td class="mono">PATCH DELETE</td><td class="mono">/api/${n}/:id</td><td>Ubah / hapus</td></tr>`).join('')}</tbody></table></div>
        <div class="row" style="margin-top:.8rem"><button class="btn btn-primary btn-sm" id="oaBtn" type="button">${G.icon('download')}Unduh OpenAPI (JSON)</button><button class="btn btn-ghost btn-sm" id="sqlBtn" type="button">${G.icon('server')}Unduh skema + data SQL</button></div></div>
      <div class="card"><h3>Daftar periksa keamanan sebelum produksi</h3>${[['err', 'PIN di config.js terlihat di kode', 'Pindahkan autentikasi ke server (sesi + hash kata sandi).'], ['err', 'Peran hanya dicek di peramban', 'Setiap endpoint harus memeriksa peran di server.'], ['warn', 'Data hanya di localStorage', 'Gunakan database server (SQLite/PostgreSQL) dan cadangan berkala.'], ['warn', 'Unggahan foto disimpan sebagai data URL', 'Simpan sebagai berkas di server dengan batas ukuran dan tipe.'], ['warn', 'Belum ada pembatasan percobaan masuk', 'Tambahkan rate limit dan log audit.'], ['ok', 'Keluaran HTML di-escape', 'Seluruh teks pengguna melewati G.esc().'], ['warn', 'Belum ada header keamanan', 'Pasang CSP, HSTS, X-Content-Type-Options di server.']].map(r => row(...r)).join('')}</div>
      <div class="card"><h3>Contoh konfigurasi server (Nginx + systemd)</h3><pre class="code">server {\n  listen 80; server_name ganexio.id;\n  root /var/www/ganexio;           # folder situs statis\n  location /api/ { proxy_pass http://127.0.0.1:3000; }\n  add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'" always;\n  add_header X-Content-Type-Options nosniff always;\n}\n\n[Service]\nExecStart=/usr/bin/node /opt/ganexio/server.js\nRestart=always\nEnvironment=NODE_ENV=production</pre>
        <p class="muted" style="margin-top:.6rem">Spesifikasi server desa dan opsi koneksi ada di halaman Akses Internet, tab Rancangan Jaringan Desa.</p></div></div>`;
  }
  $('#d-back').addEventListener('click', e => { if (e.target.closest('#oaBtn')) dl('ganexio-openapi.json', JSON.stringify(openapi(), null, 2), 'application/json'); if (e.target.closest('#sqlBtn')) dl('ganexio-data.sql', genSql()); });

  /* =============== LOG DAN KONSOL =============== */
  const ss = k => { try { return JSON.parse(sessionStorage.getItem(k) || '[]'); } catch (e) { return []; } };
  function drawLog() {
    const er = ss('gx_errlog').slice().reverse(), ev = ss('gx_devlog').slice().reverse(), rs = performance.getEntriesByType('resource').sort((a, b) => b.duration - a.duration).slice(0, 15);
    $('#d-log').innerHTML = `<div class="stack"><div class="card"><div class="row between"><h3>Galat JavaScript (${er.length})</h3><button class="btn btn-ghost btn-sm" data-clr="gx_errlog" type="button">Hapus</button></div>${er.map(x => row('err', x.msg, `${x.page} ${x.src} ${G.date(x.t)}`)).join('') || row('ok', 'Tidak ada galat tercatat sesi ini', '')}</div>
      <div class="card"><div class="row between"><h3>Aktivitas data (${ev.length})</h3><button class="btn btn-ghost btn-sm" data-clr="gx_devlog" type="button">Hapus</button></div><div class="table-wrap"><table class="dv-tbl"><tbody>${ev.slice(0, 40).map(x => `<tr><td>${G.date(x.t)}</td><td class="mono">${esc(x.op)}</td><td class="mono">${esc(x.name)}${x.id !== undefined ? ' #' + x.id : ''}</td><td>${esc(x.page)}</td></tr>`).join('') || '<tr><td>Belum ada aktivitas sesi ini.</td></tr>'}</tbody></table></div></div>
      <div class="card"><h3>Sumber daya paling lambat</h3><div class="table-wrap"><table class="dv-tbl"><tbody>${rs.map(r => `<tr><td class="mono">${esc(r.name.split('/').slice(-2).join('/'))}</td><td>${Math.round(r.duration)} ms</td><td>${kb(r.transferSize || r.encodedBodySize || 0)}</td></tr>`).join('') || '<tr><td>Tidak ada data.</td></tr>'}</tbody></table></div></div>
      <div class="card"><h3>Konsol JavaScript</h3><p class="muted">Jalankan ekspresi di halaman ini, mis. <span class="mono">Store.all('funds').length</span> atau <span class="mono">CONFIG.village.name</span>.</p><div class="row" style="flex-wrap:nowrap;margin:.5rem 0"><input id="ce" class="mono" placeholder="Ketik ekspresi lalu Enter" aria-label="Ekspresi JavaScript"><button class="btn btn-primary" id="cRun" type="button">Jalankan</button></div><pre class="code" id="co">Hasil tampil di sini.</pre></div></div>`;
  }
  const evalRun = () => { const v = $('#ce').value.trim(); if (!v) return; let out; try { const r = Function('"use strict";return (' + v + ')')(); out = typeof r === 'object' ? JSON.stringify(r, null, 2) : String(r); } catch (e) { out = 'Galat: ' + e.message; } $('#co').textContent = out; };
  $('#d-log').addEventListener('click', e => { const c = e.target.closest('[data-clr]'); if (c) { sessionStorage.removeItem(c.dataset.clr); drawLog(); } if (e.target.closest('#cRun')) evalRun(); });
  $('#d-log').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'ce') evalRun(); });


  /* =============== PIN DAN AKSES =============== */
  const PINROLES = [['admin', 'Admin Desa', 'Ubah status pasokan, kelola pesan, moderasi forum, CCTV, voucher WiFi, gangguan jaringan'], ['bendahara', 'Bendahara', 'Mencatat dan mengajukan transaksi dana desa, mengatur APBDes'], ['kades', 'Kepala Desa', 'Menyetujui atau menolak pengeluaran dana desa'], ['kurir', 'Kurir', 'Mengerjakan tugas antar dan mencatat bukti serah terima'], ['developer', 'Developer', 'Developer Mode (halaman ini)']];
  function drawPins() {
    const p = G.pins(), over = (() => { try { return JSON.parse(localStorage.getItem('gx_pins')) || {}; } catch (e) { return {}; } })();
    $('#d-pins').innerHTML = `<div class="card"><h3>PIN semua peran di website</h3><p class="muted" style="margin:.4rem 0 1rem">PIN tidak ditampilkan di bagian lain website. Ubah di sini; perubahan berlaku di perangkat ini dan, bila server tersambung, di server (PIN server disimpan terenkripsi). Bawaan ada di <span class="mono">CONFIG.pins</span> (js/config.js).</p>
      <div class="table-wrap"><table><thead><tr><th>Peran</th><th>Kewenangan</th><th>PIN</th><th></th></tr></thead><tbody>${PINROLES.map(([r, n, f]) => `<tr><td><b>${n}</b>${over[r] ? '<br><span class="badge b-warn">diubah</span>' : ''}</td><td class="muted">${f}</td><td><span class="mono" data-pin="${r}" data-v="${esc(p[r])}">••••</span></td><td><div class="row" style="flex-wrap:nowrap"><button class="btn btn-ghost btn-sm" data-show="${r}" type="button">Tampilkan</button><input data-new="${r}" inputmode="numeric" maxlength="8" placeholder="PIN baru" style="width:110px;min-height:38px" aria-label="PIN baru ${n}"><button class="btn btn-primary btn-sm" data-save="${r}" type="button">Simpan</button></div></td></tr>`).join('')}</tbody></table></div>
      <div class="row" style="margin-top:1rem"><button class="btn btn-ghost btn-sm" id="pinReset" type="button">Kembalikan PIN bawaan</button><span class="muted">PIN 4-8 angka. Ganti semua PIN bawaan sebelum website dipakai warga.</span></div></div>`;
  }
  $('#d-pins').addEventListener('click', async e => {
    const sh = e.target.closest('[data-show]'), sv = e.target.closest('[data-save]');
    if (sh) { const el = $(`[data-pin="${sh.dataset.show}"]`); const on = el.textContent !== '••••'; el.textContent = on ? '••••' : el.dataset.v; sh.textContent = on ? 'Tampilkan' : 'Sembunyikan'; }
    if (sv) {
      const r = sv.dataset.save, v = $(`[data-new="${r}"]`).value.trim(); if (!/^\d{4,8}$/.test(v)) return G.toast('PIN harus 4-8 angka', 'err');
      let o = {}; try { o = JSON.parse(localStorage.getItem('gx_pins')) || {}; } catch (x) {} o[r] = v; localStorage.setItem('gx_pins', JSON.stringify(o));
      if (typeof Sync !== 'undefined' && Sync.state !== 'off') { try { await fetch(Sync.base + '/api/pins', { method: 'POST', headers: { 'content-type': 'application/json', 'x-gx-token': Sync.token() }, body: JSON.stringify({ pins: { [r]: v } }) }); } catch (x) {} }
      if (r === 'developer') sessionStorage.setItem('gx_pin', v);
      G.toast('PIN disimpan'); drawPins();
    }
  });
  $('#d-pins').addEventListener('click', async e => { if (e.target.id === 'pinReset' && await G.confirm('Kembalikan semua PIN ke bawaan di perangkat ini?')) { localStorage.removeItem('gx_pins'); G.toast('PIN dikembalikan'); drawPins(); } });

  /* =============== SINKRONISASI =============== */
  function drawSync() {
    const st = typeof Sync === 'undefined' ? 'off' : Sync.state, q = (() => { try { return JSON.parse(localStorage.getItem('gx__q')) || { ops: {}, kv: {} }; } catch (e) { return { ops: {}, kv: {} }; } })(), ops = Object.values(q.ops);
    $('#d-sync').innerHTML = `<div class="stack"><div class="card"><h3>Status sinkronisasi</h3><div class="dv-row"><span class="badge ${st === 'online' ? 'b-ok' : st === 'offline' ? 'b-warn' : 'b-info'}">${st}</span><b>${st === 'online' ? 'Tersambung ke server' : st === 'offline' ? 'Server tidak terjangkau, perubahan diantre' : 'Tidak ada server (mode data lokal)'}</b></div>
      <div class="dv-row"><b>Alamat server</b><span class="muted mono">${esc(Sync.base || location.origin)}</span></div><div class="dv-row"><b>Antrean kirim</b><span class="muted">${ops.length} dokumen, ${Object.keys(q.kv).length} pengaturan</span></div><div class="dv-row"><b>Sinkron terakhir</b><span class="muted">${localStorage.getItem('gx__since') > 0 ? G.date(new Date(+localStorage.getItem('gx__since'))) : '-'}</span></div><div class="dv-row"><b>Token peran</b><span class="muted">${Sync.token() ? 'aktif (' + esc(Sync.token().split('.')[0]) + ')' : 'tidak ada'}</span></div>
      <div class="row" style="margin-top:.8rem"><button class="btn btn-primary btn-sm" id="syNow" type="button">${G.icon('refresh')}Sinkron sekarang</button><button class="btn btn-ghost btn-sm" id="syFull" type="button">Sinkron penuh (unduh ulang)</button></div></div>
      <div class="card"><h3>Isi antrean (${ops.length})</h3>${ops.length ? `<div class="table-wrap"><table><thead><tr><th>Koleksi</th><th>ID</th><th>Aksi</th><th>Waktu</th></tr></thead><tbody>${ops.map(o => `<tr><td>${esc(o.col)}</td><td class="mono">${o.id}</td><td>${o.del ? 'hapus' : 'simpan'}</td><td>${G.date(new Date(o.upd))}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Antrean kosong.</p>'}</div></div>`;
  }
  $('#d-sync').addEventListener('click', async e => {
    if (e.target.closest('#syNow')) { await Sync.flush(); drawSync(); G.toast('Sinkronisasi dijalankan'); }
    if (e.target.closest('#syFull')) { await Sync.flush(true); drawSync(); G.toast('Sinkron penuh dijalankan'); }
  });
  addEventListener('gx:syncstate', () => { if (!$('#d-sync').hidden) drawSync(); });

  /* =============== LATAR HITAM + HUJAN 0 DAN 1, SAPAAN =============== */
  const mx = document.createElement('canvas'); mx.id = 'matrix'; document.body.prepend(mx);
  const mctx = mx.getContext('2d'); let drops = [], mraf = 0, on = localStorage.getItem('gx_matrix') !== 'off';
  const fit = () => { mx.width = innerWidth; mx.height = innerHeight; const cols = Math.ceil(innerWidth / 16); drops = Array.from({ length: cols }, () => ({ y: -Math.random() * innerHeight / 16, v: .25 + Math.random() * .9, d: Math.random() })); };
  fit(); addEventListener('resize', fit);
  const rain = () => {
    mraf = requestAnimationFrame(rain); if (document.hidden) return;
    mctx.fillStyle = 'rgba(0,0,0,.08)'; mctx.fillRect(0, 0, mx.width, mx.height); mctx.font = '15px monospace';
    drops.forEach((c, i) => { if (c.d > .08 || Math.random() > .97) { const ch = Math.random() > .5 ? '1' : '0', x = i * 16, y = c.y * 16; mctx.fillStyle = '#d9ffe6'; mctx.fillText(ch, x, y); mctx.fillStyle = 'rgba(0,255,100,.75)'; mctx.fillText(Math.random() > .5 ? '1' : '0', x, y - 16); } c.y += c.v; if (c.y * 16 > mx.height && Math.random() > .975) { c.y = 0; c.v = .25 + Math.random() * .9; c.d = Math.random(); } });
  };
  const setRain = v => { on = v; localStorage.setItem('gx_matrix', v ? 'on' : 'off'); cancelAnimationFrame(mraf); mctx.clearRect(0, 0, mx.width, mx.height); mx.style.opacity = v ? 1 : 0; if (v) rain(); const b = $('#rainBtn'); if (b) b.innerHTML = G.icon('bolt') + 'Hujan 0 dan 1: ' + (v ? 'Hidup' : 'Mati'); };
  $('#dtabs').insertAdjacentHTML('afterend', '');
  $('#dtabs').parentElement.insertAdjacentHTML('afterbegin', `<div class="row between" style="margin-bottom:.8rem"><span class="muted mono">&gt; ganexis@dev:~$ sesi developer aktif</span><button class="btn btn-ghost btn-sm" id="rainBtn" type="button"></button></div>`);
  $('#rainBtn').onclick = () => setRain(!on); setRain(on);
  const greet = () => {
    const g = document.createElement('div'); g.id = 'devGreet'; g.innerHTML = '<div class="gt"><p class="gl" id="g1"></p><p class="gl" id="g2"></p><h1 class="gbig" id="g3"></h1></div><small>Ketuk untuk melewati</small>'; document.body.append(g);
    const type = (el, txt, ms) => new Promise(res => { let i = 0; const t = setInterval(() => { el.textContent = txt.slice(0, ++i); if (i >= txt.length) { clearInterval(t); res(); } }, ms); });
    const close = () => { g.classList.add('out'); setTimeout(() => g.remove(), 800); };
    g.onclick = close;
    (async () => { await type($('#g1'), '> otentikasi developer ... OK', 22); await type($('#g2'), '> memuat alat diagnosis, data, dan sinkronisasi ... OK', 18); await type($('#g3'), 'Selamat bekerja, Ganexis DEV.', 55); $('#g3').classList.add('done'); setTimeout(close, 1500); })();
  };
  document.body.classList.add('dev-dark'); greet();

  /* =============== TAB =============== */
  const TABS = [['diag', 'Diagnosa', 'shield', drawDiag], ['data', 'Data dan SQL', 'server', drawData], ['front', 'Frontend', 'camera', drawFront], ['back', 'Backend', 'wallet', drawBack], ['sync', 'Sinkronisasi', 'refresh', drawSync], ['pins', 'PIN dan Akses', 'key', drawPins], ['log', 'Log dan Konsol', 'list', drawLog]], seen = {};
  $('#dtabs').innerHTML = TABS.map(([k, l, ic], i) => `<button class="tab ${i ? '' : 'on'}" data-t="${k}" type="button">${G.icon(ic)}${l}</button>`).join('');
  const show = k => { $$('#dtabs .tab').forEach(x => x.classList.toggle('on', x.dataset.t === k)); TABS.forEach(t => $('#d-' + t[0]).hidden = t[0] !== k); const t = TABS.find(x => x[0] === k); if (!seen[k] || k === 'log' || k === 'back') { t[3](); seen[k] = 1; } };
  $('#dtabs').onclick = e => { const b = e.target.closest('[data-t]'); if (b) show(b.dataset.t); };
  show('diag');
})();
