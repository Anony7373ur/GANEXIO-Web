/* Pencatat galat dan aktivitas data untuk Developer Mode (disimpan di sessionStorage, maksimal 150 entri). */
(function () {
  const push = (k, o) => { try { const a = JSON.parse(sessionStorage.getItem(k) || '[]'); a.push({ t: new Date().toISOString(), page: location.pathname.split('/').pop() || 'index.html', ...o }); sessionStorage.setItem(k, JSON.stringify(a.slice(-150))); } catch (e) {} };
  window.addEventListener('error', e => push('gx_errlog', { msg: e.message, src: (e.filename || '').split('/').pop() + ':' + e.lineno }));
  window.addEventListener('unhandledrejection', e => push('gx_errlog', { msg: 'Promise ditolak: ' + (e.reason && e.reason.message || e.reason), src: '' }));
  window.__gxLog = push;
})();
/* Penyimpanan data di peramban (localStorage). Tanpa server dan tanpa login.
   Setiap "tabel" (supplies, funds, products, ...) berisi daftar objek.
   Nanti jika sudah ada server, cukup ganti isi fungsi di file ini dengan fetch() ke API;
   halaman lain tidak perlu diubah. Struktur tabel SQL ada di database/schema.sql. */
const Store = (() => {
  const P = 'gx_', mem = {};
  const read = (k, d) => { try { const v = localStorage.getItem(P + k); return v ? JSON.parse(v) : (k in mem ? mem[k] : d); } catch (e) { return k in mem ? mem[k] : d; } };
  const write = k_v => { const [k, v] = k_v; mem[k] = v; try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} };
  const emit = (n, op, id) => { window.dispatchEvent(new CustomEvent('gx:' + n)); if (window.__gxLog) window.__gxLog('gx_devlog', { op: op || 'set', name: n, id }); };
  /* Id unik berbasis waktu agar beberapa perangkat tidak bentrok saat sinkronisasi (data contoh memakai id kecil). */
  let seq = 0; const dev = Math.floor(Math.random() * 100), newId = () => Date.now() * 1000 + dev * 10 + (seq++ % 10);
  const hooks = { doc: null, kv: null }, SYNC_KV = ['fundcfg', 'apbdes'];
  const all = n => read(n, []);
  const add = (n, o) => {
    const a = all(n); o.id = o.id || newId(); o.created = o.created || new Date().toISOString(); o._u = Date.now();
    a.push(o); write([n, a]); emit(n, 'add', o.id); if (hooks.doc) hooks.doc(n, o.id, o, false); return o;
  };
  const update = (n, id, patch) => {
    const a = all(n), i = a.findIndex(x => x.id === id); if (i < 0) return null;
    a[i] = { ...a[i], ...(typeof patch === 'function' ? patch(a[i]) : patch), _u: Date.now() }; write([n, a]); emit(n, 'update', id); if (hooks.doc) hooks.doc(n, id, a[i], false); return a[i];
  };
  const remove = (n, id) => { write([n, all(n).filter(x => x.id !== id)]); emit(n, 'remove', id); if (hooks.doc) hooks.doc(n, id, {}, true); };
  /* Terapkan perubahan dari server tanpa memicu pengiriman balik. Mengembalikan true bila data lokal berubah. */
  const applyRemote = (n, id, doc, del, upd) => {
    const a = all(n), i = a.findIndex(x => x.id === id), cur = i >= 0 ? a[i] : null;
    if (cur && (cur._u || 0) > upd) return false;
    if (del) { if (i < 0) return false; a.splice(i, 1); } else if (i >= 0) a[i] = { ...doc, _u: upd }; else a.push({ ...doc, _u: upd });
    write([n, a]); return true;
  };
  const get = (k, d) => read(k, d);
  const set = (k, v) => { write([k, v]); if (hooks.kv && SYNC_KV.includes(k)) hooks.kv(k, v); };
  const applyKv = (k, v, upd) => { if ((read('_u_' + k, 0)) > upd) return false; write([k, v]); write(['_u_' + k, upd]); return true; };
  /* Data contoh dibuat sekali. Hapus lewat tombol "Atur ulang data contoh" di kaki halaman. */
  function seed(force) {
    if (!force && read('seed_v', 0) === SEED_VERSION) return;
    const s = makeSeed(); Object.keys(s).forEach(k => write([k, s[k]])); write(['seed_v', SEED_VERSION]);
  }
  const reset = () => { Object.keys(localStorage).filter(k => k.startsWith(P)).forEach(k => localStorage.removeItem(k)); Object.keys(mem).forEach(k => delete mem[k]); seed(true); };
  return { all, add, update, remove, get, set, seed, reset, newId, hooks, applyRemote, applyKv, SYNC_KV, emit };
})();
