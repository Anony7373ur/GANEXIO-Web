/* Dana desa: hanya dapat dibuka dengan PIN bendahara */
(() => {
  G.init('funds');
  const $ = G.$;
  if (G.role() !== 'bendahara') { $('#locked').hidden = false; $('#openPin').onclick = () => G.unlock('bendahara'); return; }
  $('#area').hidden = false;
  const CATS = ['Dana Desa', 'Iuran Warga', 'Pembangunan', 'Kesehatan', 'Pendidikan', 'Pasokan dari Kota', 'Jaringan & Internet', 'Lainnya'];
  $('#cat').innerHTML = CATS.map(c => `<option>${c}</option>`).join('');
  $('#dt').value = new Date().toISOString().slice(0, 10);
  const tx = () => Store.all('funds').slice().sort((a, b) => new Date(b.created) - new Date(a.created));
  const sum = (a, t) => a.filter(x => x.type === t).reduce((s, x) => s + x.amount, 0);

  function moneyAnim(el, to) { const t0 = performance.now(), f = t => { const p = Math.min((t - t0) / 900, 1); el.textContent = G.money(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
  function kpi() {
    const a = tx(), m = sum(a, 'masuk'), k = sum(a, 'keluar');
    $('#kpi').innerHTML = [['Saldo kas', m - k, 'coin', '#0a8f5b', '#38c98a'], ['Total pemasukan', m, 'up', '#1e6fef', '#12c2e9'], ['Total pengeluaran', k, 'down', '#d7263d', '#ff6a4d'], ['Jumlah catatan', a.length, 'file', '#5b3fd1', '#8f6bff']]
      .map(([l, v, ic, c1, c2], i) => `<div class="card"><span class="cat-ic" style="--c1:${c1};--c2:${c2}">${G.icon(ic)}</span><div><span class="muted">${l}</span><b data-v="${v}" data-m="${i < 3 ? 1 : 0}">0</b></div></div>`).join('');
    G.$$('#kpi b').forEach(b => b.dataset.m === '1' ? moneyAnim(b, +b.dataset.v) : G.countUp(b, b.dataset.v));
  }
  function chart() {
    const now = new Date(), months = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ k: d.getFullYear() * 12 + d.getMonth(), l: d.toLocaleString('id-ID', { month: 'short' }), m: 0, o: 0 }); }
    tx().forEach(t => { const d = new Date(t.created), k = d.getFullYear() * 12 + d.getMonth(), b = months.find(x => x.k === k); if (b) b[t.type === 'masuk' ? 'm' : 'o'] += t.amount; });
    const max = Math.max(1, ...months.map(x => Math.max(x.m, x.o))), W = 520, H = 230, bw = 28, gap = (W - 40) / 6;
    $('#chart').innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik pemasukan dan pengeluaran">
      ${[0, .5, 1].map(f => `<line x1="30" x2="${W}" y1="${190 - f * 160}" y2="${190 - f * 160}" stroke="#e3e6f0"/><text x="26" y="${194 - f * 160}" text-anchor="end" font-size="10" fill="#5e6780">${f ? Math.round(max * f / 1e6) + 'jt' : '0'}</text>`).join('')}
      ${months.map((x, i) => { const cx = 40 + i * gap, h1 = x.m / max * 160, h2 = x.o / max * 160; return `<rect class="bar" x="${cx}" y="${190 - h1}" width="${bw}" height="${h1}" rx="5" fill="#0a8f5b" style="animation-delay:${i * 80}ms"><title>Masuk ${G.money(x.m)}</title></rect><rect class="bar" x="${cx + bw + 4}" y="${190 - h2}" width="${bw}" height="${h2}" rx="5" fill="#d7263d" style="animation-delay:${i * 80 + 40}ms"><title>Keluar ${G.money(x.o)}</title></rect><text x="${cx + bw + 2}" y="212" text-anchor="middle" font-size="12" fill="#1b2236">${x.l}</text>`; }).join('')}</svg>`;
    const by = {}; tx().filter(t => t.type === 'keluar').forEach(t => by[t.category] = (by[t.category] || 0) + t.amount);
    const tot = Object.values(by).reduce((a, b) => a + b, 0) || 1;
    $('#byCat').innerHTML = Object.entries(by).sort((a, b) => b[1] - a[1]).map(([c, v]) => `<div><div class="row between"><span>${G.esc(c)}</span><b>${G.money(v)}</b></div><div class="hbar"><i style="width:${Math.round(v / tot * 100)}%"></i></div></div>`).join('') || G.empty('wallet', 'Belum ada pengeluaran.');
  }
  function list() {
    const q = $('#q').value.trim().toLowerCase(), ft = $('#ft').value;
    const rows = tx().filter(t => (!ft || t.type === ft) && (!q || (t.description + t.category).toLowerCase().includes(q)));
    $('#list').innerHTML = rows.length ? `<table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jumlah</th><th class="no-print"></th></tr></thead><tbody>${rows.map(t => `<tr><td>${G.date(t.created, true)}</td><td><b>${G.esc(t.description)}</b><br><span class="badge">${G.esc(t.category)}</span></td><td class="${t.type === 'masuk' ? 'plus' : 'minus'}">${t.type === 'masuk' ? '+' : '-'} ${G.money(t.amount)}</td><td class="no-print"><button class="btn btn-ghost btn-sm" data-del="${t.id}" aria-label="Hapus catatan">${G.icon('trash')}</button></td></tr>`).join('')}</tbody></table>` : G.empty('wallet', 'Tidak ada catatan yang cocok.');
  }
  const all = () => { kpi(); chart(); list(); };
  $('#f').addEventListener('submit', e => {
    e.preventDefault();
    G.submit(e.target, async () => {
      const f = e.target, amount = Math.round(Number(f.amount.value)), type = f.type.value;
      if (!(amount > 0) || !f.description.value.trim()) throw new Error('Isi jumlah dan keterangan.');
      const a = tx(); if (type === 'keluar' && amount > sum(a, 'masuk') - sum(a, 'keluar')) throw new Error('Saldo tidak cukup untuk pengeluaran ini.');
      Store.add('funds', { type, amount, category: f.category.value, description: f.description.value.trim(), created: new Date(f.date.value + 'T09:00:00').toISOString() });
      f.amount.value = ''; f.description.value = ''; G.toast('Catatan disimpan'); all();
    });
  });
  $('#list').addEventListener('click', async e => { const b = e.target.closest('[data-del]'); if (b && await G.confirm('Hapus catatan ini?')) { Store.remove('funds', +b.dataset.del); all(); } });
  $('#q').oninput = G.debounce(list); $('#ft').onchange = list;
  $('#csvBtn').onclick = () => G.csv('dana-desa.csv', [['Tanggal', 'Jenis', 'Kelompok', 'Keterangan', 'Jumlah'], ...tx().map(t => [new Date(t.created).toISOString().slice(0, 10), t.type, t.category, t.description, t.amount])]);
  $('#prBtn').onclick = () => print();
  all();
})();
