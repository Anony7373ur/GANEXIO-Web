/* Sinkronisasi antarperangkat dengan server Ganexio (server/server.js). Bekerja offline-first:
   semua perubahan disimpan dulu di perangkat, masuk antrean, lalu dikirim saat jaringan kembali.
   Jika server tidak ada (mis. hosting statis atau file://), website tetap berjalan dengan data lokal. */
const Sync = (() => {
  const A = (typeof CONFIG !== 'undefined' && CONFIG.api) || {}, base = A.url || '', ls = localStorage;
  const COLS = ['supplies', 'funds', 'fundreq', 'products', 'orders', 'ordermsgs', 'reviews', 'verifications', 'cityreq', 'posts', 'chat', 'tickets', 'cctvlog', 'cctvsnap', 'cctvrec', 'cctvblock', 'warehouse', 'deliveries', 'batches', 'vouchers', 'outages', 'netlog', 'prices'];
  let state = 'off', since = +ls.getItem('gx__since') || 0, busy = false, es = null, timer = null;
  const rq = () => { try { return JSON.parse(ls.getItem('gx__q')) || { ops: {}, kv: {} }; } catch (e) { return { ops: {}, kv: {} }; } };
  const save = q => { try { ls.setItem('gx__q', JSON.stringify(q)); } catch (e) {} };
  const pending = () => { const q = rq(); return Object.keys(q.ops).length + Object.keys(q.kv).length; };
  const set = s => { state = s; window.dispatchEvent(new CustomEvent('gx:syncstate', { detail: { state, pending: pending() } })); };
  const tok = () => sessionStorage.getItem('gx_token') || '';
  const headers = () => ({ 'content-type': 'application/json', 'x-gx-token': tok() });
  async function auth(role, pin) {
    const r = await fetch(base + '/api/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ role, pin }) });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'PIN salah'); sessionStorage.setItem('gx_token', d.token); sessionStorage.setItem('gx_pin', pin); return d;
  }
  async function ensureToken() { const r = sessionStorage.getItem('gx_role'), p = sessionStorage.getItem('gx_pin'); const t = tok().split('.'); if (r && p && (!t[1] || +t[1] < Date.now() + 6e4)) { try { await auth(r, p); } catch (e) {} } }
  async function flush(full) {
    if (state === 'off' || busy) return; busy = true;
    try {
      await ensureToken(); const q = rq(), ops = Object.values(q.ops), kv = Object.values(q.kv);
      const r = await fetch(base + '/api/sync', { method: 'POST', headers: headers(), body: JSON.stringify({ since: full ? 0 : since, ops, kv }) });
      if (!r.ok) throw new Error('http ' + r.status); const d = await r.json(), q2 = rq(), touched = new Set();
      const rej = new Set((d.rejected || []).map(x => x.col ? x.col + ':' + x.id : 'kv:' + x.kv));
      ops.forEach(o => { const k = o.col + ':' + o.id; if (q2.ops[k] && q2.ops[k].upd === o.upd) delete q2.ops[k]; });
      kv.forEach(o => { if (q2.kv[o.key] && q2.kv[o.key].upd === o.upd) delete q2.kv[o.key]; });
      save(q2);
      d.changes.forEach(c => { if (Store.applyRemote(c.col, c.id, c.doc, c.del, c.upd)) touched.add(c.col); });
      d.kv.forEach(k => { if (Store.applyKv(k.key, k.val, k.upd)) touched.add(k.key); });
      since = d.now - 2000; ls.setItem('gx__since', since); touched.forEach(c => Store.emit(c, 'sync'));
      if (rej.size) { window.dispatchEvent(new CustomEvent('gx:syncrejected', { detail: [...rej] })); ls.setItem('gx__since', 0); since = 0; setTimeout(() => flush(true), 50); }
      set('online');
    } catch (e) { set('offline'); } finally { busy = false; }
  }
  const queueDoc = (col, id, doc, del) => { if (!COLS.includes(col)) return; const q = rq(); q.ops[col + ':' + id] = { col, id, doc, del: !!del, upd: Date.now() }; save(q); set(state); flush(); };
  const queueKv = (key, val) => { const q = rq(); q.kv[key] = { key, val, upd: Date.now() }; save(q); set(state); flush(); };
  let started = false;
  function go() {
    if (started) return; started = true; ls.setItem('gx__server', '1'); set('offline'); Store.hooks.doc = queueDoc; Store.hooks.kv = queueKv;
    flush(); timer = setInterval(() => { if (state === 'offline') probe(); flush(); }, 8000);
    try { es = new EventSource(base + '/api/events'); es.addEventListener('sync', () => flush()); } catch (e) {}
    addEventListener('online', () => flush()); document.addEventListener('visibilitychange', () => { if (!document.hidden) flush(); });
  }
  /* Periksa apakah server Ganexio ada. Bila pernah tersambung tetapi sekarang tidak terjangkau (offline), perubahan tetap diantre. */
  async function probe() {
    if (location.protocol === 'file:' && !base) return set('off');
    try { const c = new AbortController(), t = setTimeout(() => c.abort(), 2500), r = await fetch(base + '/api/health', { signal: c.signal, cache: 'no-store' }); clearTimeout(t); const d = await r.json(); if (d.ok && d.name === 'ganexio') return go(); ls.removeItem('gx__server'); return set('off'); }
    catch (e) { if (ls.getItem('gx__server') === '1') { if (!started) { Store.hooks.doc = queueDoc; Store.hooks.kv = queueKv; set('offline'); setTimeout(probe, 5000); addEventListener('online', probe, { once: true }); } } else set('off'); }
  }
  const start = probe;
  Store.hooks.doc = (col, id, doc, del) => { if (state === 'off') return; queueDoc(col, id, doc, del); };
  Store.hooks.kv = (k, v) => { if (state !== 'off') queueKv(k, v); };
  start();
  return { flush, auth, pending, get state() { return state; }, base, token: tok };
})();
