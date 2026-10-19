/* Dana desa: terbuka (hanya baca) untuk semua warga. Mencatat dan mengatur hanya bisa dilakukan bendahara (PIN). */
(() => {
  G.init('funds');
  const $ = G.$, F = CONFIG.fund, isB = G.role() === 'bendahara';
  const KINDS = {
    masuk: [['dana_desa', 'Dana desa (pemerintah)'], ['iuran', 'Iuran warga / pasar'], ['penjualan', 'Penjualan hasil usaha desa'], ['lainnya', 'Pemasukan lain']],
    keluar: [['pembelian', 'Pembelian barang / pembangunan'], ['operasional', 'Teknologi dan operasional'], ['upah', 'Upah'], ['lainnya', 'Pengeluaran lain']]
  };
  const KL = { dana_desa: 'Dana desa', iuran: 'Iuran', penjualan: 'Penjualan', pembelian: 'Pembelian', operasional: 'Teknologi', upah: 'Upah', lainnya: 'Lainnya' };
  const INCOME_CATS = ['Dana Desa', 'Iuran Warga', 'Iuran Pasar', 'Hasil Usaha Desa', 'Bantuan', 'Lainnya'];
  const cfg = () => Store.get('fundcfg', { budget: {}, paid: {} });
  const tx = () => Store.all('funds').slice().sort((a, b) => new Date(b.created) - new Date(a.created));
  const sum = (a, f) => a.filter(f).reduce((s, x) => s + x.amount, 0);
  const mk = d => { const t = new Date(d); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0'); };
  const monthLabel = () => new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const saldo = () => { const a = tx(); return sum(a, t => t.type === 'masuk') - sum(a, t => t.type === 'keluar'); };

  /* Kondisi ekonomi desa dari pendapatan asli (iuran + penjualan) rata-rata 3 bulan.
     Batas biaya teknologi = persen tertentu dari pendapatan itu (lihat CONFIG.fund.tiers). Biaya tetap dibayar penuh,
     biaya fleksibel (perawatan, upah developer) diperkecil bila desa belum mampu. */
  function economy() {
    const now = new Date(), keys = [0, 1, 2].map(i => mk(new Date(now.getFullYear(), now.getMonth() - i, 1)));
    const own = tx().filter(t => t.type === 'masuk' && ['iuran', 'penjualan'].includes(t.kind) && keys.includes(mk(t.created))).reduce((s, t) => s + t.amount, 0) / 3;
    const tier = F.tiers.find(t => own <= t.max) || F.tiers[F.tiers.length - 1], cap = Math.round(own * tier.capPct / 100);
    const fixed = F.techItems.filter(i => i.fixed).reduce((s, i) => s + i.amount, 0), flex = F.techItems.filter(i => !i.fixed).reduce((s, i) => s + i.amount, 0);
    const ratio = flex ? Math.max(0, Math.min(1, (cap - fixed) / flex)) : 0;
    const rows = F.techItems.map(i => ({ ...i, adj: i.fixed ? i.amount : Math.round(i.amount * ratio / 1000) * 1000 }));
    return { own, tier, cap, rows, fixed, total: rows.reduce((s, r) => s + r.adj, 0), short: fixed > cap };
  }
  function addTx(o) {
    if (!isB) throw new Error('Hanya bendahara yang dapat mengubah dana desa.');
    if (!(o.amount > 0) || !o.description.trim()) throw new Error('Isi jumlah dan keterangan.');
    if (o.type === 'keluar' && o.amount > saldo()) throw new Error('Saldo tidak cukup untuk pengeluaran ini.');
    if (o.type === 'keluar' && o.amount >= F.approvalMin) throw new Error('Pengeluaran ' + G.money(F.approvalMin) + ' ke atas harus diajukan di tab Pengajuan dan disetujui Kepala Desa.');
    return Store.add('funds', { type: o.type, kind: o.kind, amount: Math.round(o.amount), category: o.category, description: o.description.trim(), receipts: o.receipts || [], created: o.date ? new Date(o.date + 'T09:00:00').toISOString() : new Date().toISOString() });
  }

  /* ---------- Tampilan terbuka untuk semua warga ---------- */
  const eco = economy();
  $('#roleBar').innerHTML = isB
    ? `<span><span class="badge b-ok">${G.icon('key')} Mode Bendahara aktif</span> <span class="muted">Anda dapat mencatat dan mengatur dana desa.</span></span><span class="badge b-info">Ekonomi desa: ${G.esc(eco.tier.label)}</span>`
    : `<span>${G.icon('eye')} <b>Tampilan warga</b> <span class="muted">Semua angka terbuka. Hanya bendahara yang dapat mengubah.</span></span><span class="row"><span class="badge b-info">Ekonomi desa: ${G.esc(eco.tier.label)}</span><button class="btn btn-primary btn-sm" id="inB" type="button">${G.icon('key')}Masuk sebagai Bendahara</button></span>`;
  const inB = $('#inB'); if (inB) inB.onclick = () => G.unlock('bendahara');

  function moneyAnim(el, to) { const t0 = performance.now(), f = t => { const p = Math.min((t - t0) / 900, 1); el.textContent = G.money(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
  function kpi() {
    const a = tx(), m = sum(a, t => t.type === 'masuk'), k = sum(a, t => t.type === 'keluar');
    $('#kpi').innerHTML = [['Saldo kas', m - k, 'coin', '#0a8f5b', '#38c98a'], ['Total pemasukan', m, 'up', '#1e6fef', '#12c2e9'], ['Total pengeluaran', k, 'down', '#d7263d', '#ff6a4d'], ['Penjualan usaha desa', sum(a, t => t.kind === 'penjualan'), 'store', '#e0a100', '#f08c00'], ['Pembelian barang', sum(a, t => t.kind === 'pembelian'), 'basket', '#5b3fd1', '#8f6bff']]
      .map(([l, v, ic, c1, c2]) => `<div class="card"><span class="cat-ic" style="--c1:${c1};--c2:${c2}">${G.icon(ic)}</span><div><span class="muted">${l}</span><b data-v="${v}">0</b></div></div>`).join('');
    G.$$('#kpi b').forEach(b => moneyAnim(b, +b.dataset.v));
  }
  function chart() {
    const now = new Date(), months = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ k: mk(d), l: d.toLocaleString('id-ID', { month: 'short' }), m: 0, o: 0 }); }
    tx().forEach(t => { const b = months.find(x => x.k === mk(t.created)); if (b) b[t.type === 'masuk' ? 'm' : 'o'] += t.amount; });
    const max = Math.max(1, ...months.map(x => Math.max(x.m, x.o))), W = 520, H = 230, bw = 28, gap = (W - 40) / 6;
    $('#chart').innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik pemasukan dan pengeluaran">
      ${[0, .5, 1].map(f => `<line x1="30" x2="${W}" y1="${190 - f * 160}" y2="${190 - f * 160}" stroke="#e3e6f0"/><text x="26" y="${194 - f * 160}" text-anchor="end" font-size="10" fill="#5e6780">${f ? Math.round(max * f / 1e6) + 'jt' : '0'}</text>`).join('')}
      ${months.map((x, i) => { const cx = 40 + i * gap, h1 = x.m / max * 160, h2 = x.o / max * 160; return `<rect class="bar" x="${cx}" y="${190 - h1}" width="${bw}" height="${h1}" rx="5" fill="#0a8f5b" style="animation-delay:${i * 80}ms"><title>Masuk ${G.money(x.m)}</title></rect><rect class="bar" x="${cx + bw + 4}" y="${190 - h2}" width="${bw}" height="${h2}" rx="5" fill="#d7263d" style="animation-delay:${i * 80 + 40}ms"><title>Keluar ${G.money(x.o)}</title></rect><text x="${cx + bw + 2}" y="212" text-anchor="middle" font-size="12" fill="#1b2236">${x.l}</text>`; }).join('')}</svg>`;
  }
  function budget() {
    const a = tx(), b = cfg().budget;
    $('#budget').innerHTML = F.budgetCats.map(c => {
      const bud = b[c] || 0, used = sum(a, t => t.type === 'keluar' && t.category === c), p = bud ? Math.round(used / bud * 100) : 0;
      return `<div><div class="row between"><span>${G.esc(c)}</span><b>${G.money(used)} / ${G.money(bud)}</b></div><div class="hbar"><i style="width:${Math.min(100, p)}%;${p > 100 ? 'background:var(--bad)' : ''}"></i></div><span class="muted">${bud ? p + '% terpakai' : 'Anggaran belum diatur'}${p > 100 ? ' - melebihi anggaran' : ''}</span></div>`;
    }).join('');
  }
  function list() {
    const q = $('#q').value.trim().toLowerCase(), ft = $('#ft').value;
    const rows = tx().filter(t => (!ft || t.type === ft || t.kind === ft) && (!q || (t.description + t.category).toLowerCase().includes(q)));
    $('#list').innerHTML = rows.length ? `<table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jumlah</th>${isB ? '<th class="no-print"></th>' : ''}</tr></thead><tbody>${rows.map(t => `<tr><td>${G.date(t.created, true)}</td><td><b>${G.esc(t.description)}</b><br><span class="badge">${G.esc(t.category)}</span> <span class="badge b-info">${G.esc(KL[t.kind] || '')}</span>${(t.receipts || []).length ? ` <button class="btn btn-ghost btn-sm" data-rc="${t.id}" type="button">${G.icon('image')} Bukti (${t.receipts.length})</button>` : ''}${t.approvedBy ? ` <span class="badge b-ok">Disetujui ${G.esc(t.approvedBy)}</span>` : ''}</td><td class="${t.type === 'masuk' ? 'plus' : 'minus'}">${t.type === 'masuk' ? '+' : '-'} ${G.money(t.amount)}</td>${isB ? `<td class="no-print"><button class="btn btn-ghost btn-sm" data-del="${t.id}" aria-label="Hapus catatan">${G.icon('trash')}</button></td>` : ''}</tr>`).join('')}</tbody></table>` : G.empty('wallet', 'Tidak ada catatan yang cocok.');
  }
  const all = () => { kpi(); chart(); budget(); list(); if (isB) { drawLevy(); drawTech(); } };
  $('#q').oninput = G.debounce(list); $('#ft').onchange = list;
  $('#csvBtn').onclick = () => G.csv('dana-desa-sipagabu.csv', [['Tanggal', 'Jenis', 'Rincian', 'Kelompok', 'Keterangan', 'Jumlah'], ...tx().map(t => [new Date(t.created).toISOString().slice(0, 10), t.type, t.kind, t.category, t.description, t.amount])]);
  $('#prBtn').onclick = () => print();

  /* ---------- Panel bendahara ---------- */
  function drawLevy() {
    const e = economy(), kk = F.households, need = e.total, perKK = Math.max(500, Math.ceil(need / kk / 500) * 500), payers = Math.round(kk * .8);
    const mkey = mk(new Date()), sales = Store.all('orders').filter(o => o.status === 'selesai' && mk(o.created) === mkey).reduce((s, o) => s + o.price * o.qty, 0), fee = Math.round(sales * F.marketFeePct / 100);
    $('#t-levy').innerHTML = `<div class="split"><div class="card" style="box-shadow:none"><h3>Kondisi ekonomi desa</h3>
      <p style="margin:.4rem 0"><span class="badge b-info">${G.esc(e.tier.label)}</span></p><p class="muted">Pendapatan asli desa (iuran + penjualan) rata-rata 3 bulan: <b>${G.money(e.own)}</b> per bulan.</p>
      <p class="muted" style="margin-top:.4rem">Batas biaya teknologi: <b>${e.tier.capPct}%</b> = <b>${G.money(e.cap)}</b> per bulan.</p><p class="muted" style="margin-top:.4rem">${G.esc(e.tier.note)}</p></div>
      <div class="card" style="box-shadow:none"><h3>Iuran warga bulanan</h3><p class="muted">Usulan: ${G.money(perKK)} per KK agar biaya teknologi ${monthLabel()} (${G.money(need)}) tertutup oleh ${kk} KK.</p>
      <form id="levyF" class="stack" style="margin-top:.6rem"><div class="msg-err" role="alert"></div><div class="two"><div class="field" style="margin:0"><label>Iuran per KK (Rp)</label><input name="per" type="number" min="500" step="500" value="${perKK}" required></div><div class="field" style="margin:0"><label>KK yang sudah membayar</label><input name="n" type="number" min="1" max="${kk}" value="${payers}" required></div></div><button class="btn btn-primary btn-sm" type="submit">${G.icon('check')}Catat penerimaan iuran</button></form></div></div>
      <div class="card" style="box-shadow:none;margin-top:1rem"><h3>Iuran pasar desa (${F.marketFeePct}%)</h3><p class="muted">Penjualan pasar yang selesai bulan ini: <b>${G.money(sales)}</b>. Iuran: <b>${G.money(fee)}</b>.</p><button class="btn btn-ghost btn-sm" id="feeBtn" type="button" ${fee > 0 ? '' : 'disabled'} style="margin-top:.5rem">${G.icon('plus')}Catat iuran pasar</button></div>`;
    const f = $('#levyF'); f.onsubmit = ev => { ev.preventDefault(); G.submit(f, async () => { const per = +f.per.value, n = +f.n.value; addTx({ type: 'masuk', kind: 'iuran', amount: per * n, category: 'Iuran Warga', description: `Iuran warga ${monthLabel()} (${n} KK x ${G.money(per)})`, date: new Date().toISOString().slice(0, 10) }); G.toast('Iuran dicatat'); }); };
    const fb = $('#feeBtn'); fb.onclick = () => { try { addTx({ type: 'masuk', kind: 'iuran', amount: fee, category: 'Iuran Pasar', description: `Iuran pasar desa ${monthLabel()} (${F.marketFeePct}% dari ${G.money(sales)})`, date: new Date().toISOString().slice(0, 10) }); G.toast('Iuran pasar dicatat'); } catch (x) { G.toast(x.message, 'err'); } };
  }
  function drawTech() {
    const e = economy(), paid = cfg().paid[mk(new Date())] || {};
    $('#t-tech').innerHTML = `<p class="muted" style="margin-bottom:.8rem">Biaya server, website, dan upah developer ${monthLabel()} disesuaikan dengan kemampuan desa (batas ${G.money(e.cap)}). Biaya tetap dibayar penuh, upah dan perawatan menyesuaikan.</p>
      ${e.short ? '<p class="warn-box" style="margin-bottom:.8rem">Biaya tetap melebihi kemampuan desa bulan ini. Pertimbangkan intranet desa saja, internet gratis dari program pemerintah, atau dukungan dana desa.</p>' : ''}
      <div class="table-wrap"><table><thead><tr><th>Komponen</th><th>Normal</th><th>Disesuaikan</th><th></th></tr></thead><tbody>${e.rows.map(r => `<tr><td><b>${G.esc(r.name)}</b><br><span class="badge ${r.fixed ? 'b-info' : 'b-warn'}">${r.fixed ? 'tetap' : 'menyesuaikan'}</span></td><td>${G.money(r.amount)}</td><td><b>${G.money(r.adj)}</b></td><td>${paid[r.id] ? '<span class="badge b-ok">Sudah dibayar</span>' : `<button class="btn btn-primary btn-sm" data-pay="${r.id}" type="button" ${r.adj > 0 ? '' : 'disabled'}>Bayar</button>`}</td></tr>`).join('')}</tbody><tfoot><tr><td><b>Total</b></td><td>${G.money(F.techItems.reduce((s, i) => s + i.amount, 0))}</td><td><b>${G.money(e.total)}</b></td><td></td></tr></tfoot></table></div>`;
  }
  function drawBud() {
    const b = cfg().budget;
    $('#t-bud').innerHTML = `<form id="budF" class="stack"><div class="msg-err" role="alert"></div><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${F.budgetCats.map(c => `<div class="field" style="margin:0"><label>${G.esc(c)} (Rp)</label><input name="${G.esc(c)}" type="number" min="0" step="100000" value="${b[c] || 0}"></div>`).join('')}</div><button class="btn btn-primary" type="submit" style="align-self:start">${G.icon('check')}Simpan anggaran</button></form>`;
    const f = $('#budF'); f.onsubmit = ev => { ev.preventDefault(); const c = cfg(); F.budgetCats.forEach(k => c.budget[k] = Math.max(0, +f.elements[k].value || 0)); Store.set('fundcfg', c); G.toast('Anggaran disimpan'); budget(); };
  }
  if (isB) {
    $('#tpanel').hidden = false;
    const f = $('#f'), fill = () => { const t = f.type.value; $('#kind').innerHTML = KINDS[t].map(([v, l]) => `<option value="${v}">${l}</option>`).join(''); $('#cat').innerHTML = (t === 'masuk' ? INCOME_CATS : F.budgetCats).map(c => `<option>${G.esc(c)}</option>`).join(''); };
    f.addEventListener('change', e => { if (e.target.name === 'type') fill(); }); fill(); $('#dt').value = new Date().toISOString().slice(0, 10);
    f.addEventListener('submit', e => { e.preventDefault(); G.submit(f, async () => { addTx({ type: f.type.value, kind: f.kind.value, amount: +f.amount.value, category: f.category.value, description: f.description.value, date: f.date.value, receipts: await G.readImages($('#rcp')) }); if ($('#rcp')) $('#rcp').value = ''; f.amount.value = ''; f.description.value = ''; G.toast('Catatan disimpan'); }); });
    G.$$('#ttabs .tab').forEach(t => t.onclick = () => { G.$$('#ttabs .tab').forEach(x => x.classList.toggle('on', x === t)); ['rec', 'levy', 'tech', 'bud'].forEach(id => $('#t-' + id).hidden = id !== t.dataset.t); });
    $('#t-tech').addEventListener('click', ev => {
      const b = ev.target.closest('[data-pay]'); if (!b) return; const r = economy().rows.find(x => x.id === b.dataset.pay);
      try { addTx({ type: 'keluar', kind: r.kind, amount: r.adj, category: 'Jaringan & Teknologi', description: `${r.name} - ${monthLabel()}`, date: new Date().toISOString().slice(0, 10) }); const c = cfg(), k = mk(new Date()); c.paid[k] = { ...(c.paid[k] || {}), [r.id]: true }; Store.set('fundcfg', c); G.toast('Pembayaran dicatat'); drawTech(); }
      catch (x) { G.toast(x.message, 'err'); }
    });
    drawBud();
    const rcp = f.querySelector('[type=submit]'); rcp.insertAdjacentHTML('beforebegin', '<div class="field"><label for="rcp">Bukti / nota (foto, opsional)</label><input id="rcp" type="file" accept="image/*" multiple></div>');
    $('#list').addEventListener('click', async e => { const b = e.target.closest('[data-del]'); if (b && await G.confirm('Hapus catatan ini?')) { Store.remove('funds', +b.dataset.del); } });
  }
  addEventListener('gx:funds', all); addEventListener('storage', e => { if (e.key === 'gx_funds') all(); });
  all();
})();
