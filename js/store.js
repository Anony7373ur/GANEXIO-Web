/* Penyimpanan data di peramban (localStorage). Tanpa server dan tanpa login.
   Setiap "tabel" (supplies, funds, products, ...) berisi daftar objek.
   Nanti jika sudah ada server, cukup ganti isi fungsi di file ini dengan fetch() ke API;
   halaman lain tidak perlu diubah. Struktur tabel SQL ada di database/schema.sql. */
const Store = (() => {
  const P = 'gx_', mem = {};
  const read = (k, d) => { try { const v = localStorage.getItem(P + k); return v ? JSON.parse(v) : (k in mem ? mem[k] : d); } catch (e) { return k in mem ? mem[k] : d; } };
  const write = k_v => { const [k, v] = k_v; mem[k] = v; try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} };
  const emit = n => window.dispatchEvent(new CustomEvent('gx:' + n));
  const all = n => read(n, []);
  const add = (n, o) => {
    const a = all(n); o.id = a.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
    o.created = o.created || new Date().toISOString(); a.push(o); write([n, a]); emit(n); return o;
  };
  const update = (n, id, patch) => { const a = all(n), i = a.findIndex(x => x.id === id); if (i < 0) return null; a[i] = { ...a[i], ...(typeof patch === 'function' ? patch(a[i]) : patch) }; write([n, a]); emit(n); return a[i]; };
  const remove = (n, id) => { write([n, all(n).filter(x => x.id !== id)]); emit(n); };
  const get = (k, d) => read(k, d), set = (k, v) => write([k, v]);
  /* Data contoh dibuat sekali. Hapus lewat tombol "Atur ulang data contoh" di kaki halaman. */
  function seed(force) {
    if (!force && read('seed_v', 0) === SEED_VERSION) return;
    const s = makeSeed(); Object.keys(s).forEach(k => write([k, s[k]])); write(['seed_v', SEED_VERSION]);
  }
  const reset = () => { Object.keys(localStorage).filter(k => k.startsWith(P)).forEach(k => localStorage.removeItem(k)); Object.keys(mem).forEach(k => delete mem[k]); seed(true); };
  return { all, add, update, remove, get, set, seed, reset };
})();
