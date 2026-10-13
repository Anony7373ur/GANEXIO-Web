/* Internet Starlink: status sambungan nyata (latensi) dan pintu masuk ke situs luar. */
(() => {
  G.init('internet');
  const $ = G.$, S = CONFIG.starlink;
  $('#diagram').innerHTML = starlinkDiagram();
  const kpi = (ms) => {
    $('#kpi').innerHTML = [['Sambungan', ms === null ? 'Terputus' : 'Aktif', 'wifi', '#1e6fef', '#12c2e9'], ['Latensi', ms === null ? '-' : ms + ' ms', 'clock', '#0f8b8d', '#2bbf9a'], ['Paket Starlink', S.plan, 'dish', '#5b3fd1', '#8f6bff'], ['Kecepatan paket', S.speed, 'bolt', '#e0a100', '#f08c00']]
      .map(([l, v, ic, c1, c2]) => `<div class="card"><span class="cat-ic" style="--c1:${c1};--c2:${c2}">${G.icon(ic)}</span><div><span class="muted">${l}</span><b style="font-size:1.15rem">${G.esc(v)}</b></div></div>`).join('');
  };
  async function ping() {
    const t = []; for (let i = 0; i < 3; i++) {
      try { const c = new AbortController(), to = setTimeout(() => c.abort(), 4000), s = performance.now(); await fetch('https://www.gstatic.com/generate_204?x=' + Date.now(), { mode: 'no-cors', cache: 'no-store', signal: c.signal }); clearTimeout(to); t.push(performance.now() - s); } catch (e) {}
    }
    return t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : null;
  }
  async function check() {
    const card = $('#netCard'); card.className = 'card net-card'; $('#netTitle').textContent = 'Memeriksa sambungan...'; $('#netText').textContent = 'Mohon tunggu sebentar.'; kpi(null);
    const ms = await ping();
    if (ms !== null) { card.className = 'card net-card on'; $('#netTitle').textContent = 'Internet Starlink aktif'; $('#netText').textContent = `Sambungan keluar desa baik (sekitar ${ms} ms). Silakan buka situs di bawah ini.`; }
    else { card.className = 'card net-card off'; $('#netTitle').textContent = 'Internet luar belum tersedia'; $('#netText').textContent = 'Layanan desa tetap dapat dipakai. Cuaca buruk atau antena tertutup dapat mengganggu Starlink. Coba lagi nanti atau laporkan lewat halaman Pesan.'; }
    kpi(ms);
  }
  $('#recheck').onclick = check; check();
  $('#go').addEventListener('submit', e => {
    e.preventDefault(); let u = $('#url').value.trim(); if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    try { new URL(u); } catch (x) { return G.toast('Alamat situs tidak valid', 'err'); }
    window.open(u, '_blank', 'noopener');
  });
  const groups = [...new Set(CONFIG.links.map(l => l.group))];
  $('#links').innerHTML = groups.map(g => `<h3 style="margin:1rem 0 .6rem">${G.esc(g)}</h3><div class="grid">${CONFIG.links.filter(l => l.group === g).map(l => `<a class="card lift link-card" href="${G.esc(l.url)}" target="_blank" rel="noopener"><span class="cat-ic sm">${G.icon('globe')}</span><div><b>${G.esc(l.title)}</b><br><span class="muted">${G.esc(l.text)}</span></div></a>`).join('')}</div>`).join('');
})();
