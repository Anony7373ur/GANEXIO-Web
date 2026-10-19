/* Dana desa tambahan: pengajuan pengeluaran + persetujuan Kepala Desa, bukti nota, APBDes, dan laporan PDF per periode.
   Semua warga dapat MELIHAT. Bendahara mengajukan dan mengatur APBDes; Kepala Desa menyetujui atau menolak. */
(() => {
  const $ = G.$, F = CONFIG.fund, role = G.role(), isB = ['bendahara', 'developer'].includes(role), isK = ['kades', 'developer'].includes(role);
  const tx = () => Store.all('funds').slice().sort((a, b) => new Date(b.created) - new Date(a.created));
  const sum = (a, f) => a.filter(f).reduce((s, x) => s + x.amount, 0), saldo = () => sum(tx(), t => t.type === 'masuk') - sum(tx(), t => t.type === 'keluar');
  const SB = { menunggu: 'b-warn', disetujui: 'b-ok', ditolak: 'b-bad' };
  const INCOME_MAP = { 'Dana Desa': 'Dana Desa', 'Iuran Warga': 'Pendapatan Asli Desa', 'Iuran Pasar': 'Pendapatan Asli Desa', 'Hasil Usaha Desa': 'Pendapatan Asli Desa', Bantuan: 'Alokasi Dana Desa', Lainnya: 'Bagi Hasil Pajak/Retribusi' };

  if (role === 'kades') { const rb = $('#roleBar'); if (rb) rb.innerHTML = `<span><span class="badge b-ok">${G.icon('key')} Mode Kepala Desa aktif</span> <span class="muted">Anda dapat menyetujui atau menolak pengajuan pengeluaran.</span></span>`; }

  /* ---------- Pengajuan dan persetujuan ---------- */
  function drawReq() {
    const rs = Store.all('fundreq').slice().reverse(), pend = rs.filter(r => r.status === 'menunggu').length;
    $('#p-req').innerHTML = `<div class="split"><div class="card"><h2>Pengajuan pengeluaran</h2><p class="muted" style="margin-bottom:.8rem">Pengeluaran ${G.money(F.approvalMin)} ke atas wajib diajukan bendahara dan disetujui Kepala Desa sebelum dicatat. Semua pengajuan terbuka untuk warga.</p>
      ${isB ? `<form id="rqF"><div class="msg-err" role="alert"></div><div class="field"><label>Keperluan</label><input name="d" required maxlength="140"></div><div class="two"><div class="field"><label>Jumlah (Rp)</label><input name="a" type="number" min="1" required></div><div class="field"><label>Kelompok</label><select name="c">${F.budgetCats.map(c => `<option>${G.esc(c)}</option>`).join('')}</select></div></div><div class="field"><label>Jenis</label><select name="k"><option value="pembelian">Pembelian / pembangunan</option><option value="operasional">Operasional</option><option value="upah">Upah</option><option value="lainnya">Lainnya</option></select></div><div class="field"><label>Bukti / nota / penawaran (foto)</label><input name="r" type="file" accept="image/*" multiple></div><button class="btn btn-primary btn-block" type="submit">${G.icon('send')}Ajukan ke Kepala Desa</button></form>` : `<p class="warn-box">${G.icon('lock')} Pengajuan dibuat oleh bendahara. <button class="btn btn-ghost btn-sm" data-unl="bendahara" type="button">Masuk mode Bendahara</button></p>`}</div>
      <div class="stack"><p class="muted">${pend} pengajuan menunggu persetujuan${isK ? '' : ' Kepala Desa'}.</p>${rs.map(r => `<article class="card"><div class="row between"><b>${G.esc(r.desc)}</b><span class="badge ${SB[r.status]}">${r.status}</span></div><p class="price">${G.money(r.amount)}</p><p class="muted">${G.esc(r.category)} &bull; diajukan ${G.esc(r.by)} &bull; ${G.date(r.created)}</p>
        ${(r.receipts || []).length ? `<div class="row">${r.receipts.map((x, i) => `<div class="photo" style="width:90px;cursor:pointer" data-rq="${r.id}" data-i="${i}">${G.img(x, 'photo', 'Bukti ' + (i + 1))}</div>`).join('')}</div>` : '<p class="muted">Tanpa lampiran bukti.</p>'}
        ${r.decision ? `<p class="${r.status === 'disetujui' ? 'plus' : 'minus'}">${G.icon(r.status === 'disetujui' ? 'check' : 'x')} ${r.status === 'disetujui' ? 'Disetujui' : 'Ditolak'} ${G.esc(r.decision.by)} (${G.date(r.decision.at)})${r.decision.note ? ': ' + G.esc(r.decision.note) : ''}</p>` : ''}
        ${isK && r.status === 'menunggu' ? `<div class="row"><button class="btn btn-primary btn-sm" data-dec="ok" data-id="${r.id}" type="button">${G.icon('check')}Setujui</button><button class="btn btn-ghost btn-sm" data-dec="no" data-id="${r.id}" type="button">${G.icon('x')}Tolak</button></div>` : ''}</article>`).join('') || G.empty('file', 'Belum ada pengajuan.')}${!isK && rs.some(r => r.status === 'menunggu') ? `<p class="muted"><button class="btn btn-ghost btn-sm" data-unl="kades" type="button">Masuk mode Kepala Desa</button> untuk menyetujui.</p>` : ''}</div></div>`;
    const f = $('#rqF'); if (f) f.onsubmit = e => { e.preventDefault(); G.submit(f, async () => { Store.add('fundreq', { desc: f.d.value.trim(), amount: Math.round(+f.a.value), category: f.c.value, kind: f.k.value, by: G.name() || 'Bendahara', status: 'menunggu', receipts: await G.readImages(f.r) }); G.toast('Pengajuan dikirim ke Kepala Desa'); }); };
  }
  document.addEventListener('click', e => {
    const u = e.target.closest('[data-unl]'); if (u) G.unlock(u.dataset.unl);
    const q = e.target.closest('[data-rq]'); if (q) { const r = Store.all('fundreq').find(x => x.id === +q.dataset.rq); G.modal(`<div class="photo">${G.img(r.receipts[+q.dataset.i], 'photo', 'Bukti')}</div><p class="muted" style="margin-top:.5rem">${G.esc(r.desc)}</p>`, true); }
    const c = e.target.closest('[data-rc]'); if (c) { const t = Store.all('funds').find(x => x.id === +c.dataset.rc); G.modal(`<h2>Bukti transaksi</h2><p class="muted">${G.esc(t.description)} &bull; ${G.money(t.amount)}</p><div class="stack">${(t.receipts || []).map(x => `<div class="photo">${G.img(x, 'photo', 'Bukti')}</div>`).join('')}</div>`, true); }
    const d = e.target.closest('[data-dec]'); if (d && isK) decide(+d.dataset.id, d.dataset.dec === 'ok');
  });
  function decide(id, ok) {
    const r = Store.all('fundreq').find(x => x.id === id);
    const m = G.modal(`<h2>${ok ? 'Setujui' : 'Tolak'} pengajuan</h2><p>${G.esc(r.desc)} &bull; <b>${G.money(r.amount)}</b></p><form><div class="msg-err" role="alert"></div><div class="field"><label>Catatan${ok ? ' (opsional)' : ' (alasan, wajib)'}</label><input name="n" ${ok ? '' : 'required'} maxlength="140"></div><button class="btn btn-primary" type="submit">${ok ? 'Setujui dan catat ke kas' : 'Tolak pengajuan'}</button></form>`);
    const f = m.querySelector('form'); f.onsubmit = e => { e.preventDefault(); G.submit(f, async () => {
      const now = new Date().toISOString(), by = G.name() || 'Kepala Desa';
      if (ok) { if (r.amount > saldo()) throw new Error('Saldo kas tidak cukup untuk menyetujui pengajuan ini.'); Store.add('funds', { type: 'keluar', kind: r.kind, amount: r.amount, category: r.category, description: r.desc, receipts: r.receipts || [], approvedBy: by, reqId: r.id, created: now }); }
      Store.update('fundreq', id, { status: ok ? 'disetujui' : 'ditolak', decision: { by, note: f.n.value.trim(), at: now } }); m.close(); G.toast(ok ? 'Disetujui dan dicatat ke kas' : 'Pengajuan ditolak');
    }); };
  }

  /* ---------- APBDes: rencana dan realisasi ---------- */
  function drawApb() {
    const a = Store.get('apbdes', { year: new Date().getFullYear(), pendapatan: {}, belanja: {} }), list = tx(), yr = new Date().getFullYear();
    const realP = {}, realB = {}; list.filter(t => new Date(t.created).getFullYear() === yr).forEach(t => { if (t.type === 'masuk') { const k = INCOME_MAP[t.category] || 'Bagi Hasil Pajak/Retribusi'; realP[k] = (realP[k] || 0) + t.amount; } else { const k = F.bidang[t.category] || 'Penyelenggaraan Pemerintahan Desa'; realB[k] = (realB[k] || 0) + t.amount; } });
    const row = (n, plan, real) => { const p = plan ? Math.round(real / plan * 100) : 0; return `<div><div class="row between"><span>${G.esc(n)}</span><b>${G.money(real)} / ${G.money(plan)}</b></div><div class="hbar"><i style="width:${Math.min(100, p)}%;${p > 100 ? 'background:var(--bad)' : ''}"></i></div><span class="muted">${p}%</span></div>`; };
    const tp = Object.values(a.pendapatan).reduce((s, x) => s + x, 0), tb = Object.values(a.belanja).reduce((s, x) => s + x, 0);
    $('#p-apb').innerHTML = `<div class="card"><div class="row between"><h2 style="margin:0">APBDes Tahun ${a.year}</h2>${isB ? `<button class="btn btn-primary btn-sm" id="apbEdit" type="button">${G.icon('pen')}Ubah rencana</button>` : ''}</div><p class="muted">Rencana anggaran pendapatan dan belanja desa dibanding realisasi kas tahun berjalan. Belanja dikelompokkan menurut bidang APBDes.</p>
      <div class="split" style="margin-top:1rem"><div class="stack"><h3>Pendapatan (rencana ${G.money(tp)})</h3>${Object.entries(a.pendapatan).map(([k, v]) => row(k, v, realP[k] || 0)).join('')}</div><div class="stack"><h3>Belanja (rencana ${G.money(tb)})</h3>${Object.entries(a.belanja).map(([k, v]) => row(k, v, realB[k] || 0)).join('')}</div></div>
      <p class="muted" style="margin-top:1rem">Surplus/defisit rencana: <b>${G.money(tp - tb)}</b></p></div>`;
    const b = $('#apbEdit'); if (b) b.onclick = () => {
      const m = G.modal(`<h2>Ubah rencana APBDes</h2><form><div class="msg-err" role="alert"></div><h3>Pendapatan</h3>${Object.keys(a.pendapatan).map(k => `<div class="field"><label>${G.esc(k)} (Rp)</label><input data-p="${G.esc(k)}" type="number" min="0" value="${a.pendapatan[k]}"></div>`).join('')}<h3>Belanja</h3>${Object.keys(a.belanja).map(k => `<div class="field"><label>${G.esc(k)} (Rp)</label><input data-b="${G.esc(k)}" type="number" min="0" value="${a.belanja[k]}"></div>`).join('')}<button class="btn btn-primary" type="submit">Simpan</button></form>`, true);
      m.querySelector('form').onsubmit = e => { e.preventDefault(); const n = { ...a, pendapatan: {}, belanja: {} }; G.$$('[data-p]', m).forEach(i => n.pendapatan[i.dataset.p] = +i.value || 0); G.$$('[data-b]', m).forEach(i => n.belanja[i.dataset.b] = +i.value || 0); Store.set('apbdes', n); m.close(); G.toast('APBDes disimpan'); drawApb(); };
    };
  }

  /* ---------- Laporan PDF (dibuat langsung di peramban, tanpa internet) ---------- */
  function pdf(pages) {
    const enc = s => String(s).replace(/[^\x20-\x7e\xa0-\xff]/g, '?').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'), objs = [];
    const add = s => objs.push(s); add('<< /Type /Catalog /Pages 2 0 R >>'); add(''); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const kids = [];
    pages.forEach((ops, i) => {
      const c = ops.map(o => o.t === 't' ? `BT /F${o.b ? 2 : 1} ${o.size} Tf ${o.x} ${o.y} Td (${enc(o.s)}) Tj ET` : o.t === 'l' ? `${o.x1} ${o.y1} m ${o.x2} ${o.y2} l S` : `${o.c} rg ${o.x} ${o.y} ${o.w} ${o.h} re f 0 g`).join('\n');
      add(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`); add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${5 + i * 2} 0 R >>`); kids.push(`${6 + i * 2} 0 R`);
    });
    objs[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
    let out = '%PDF-1.4\n', off = [];
    objs.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const x = out.length; out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${off.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
    return new Blob([Uint8Array.from(out, c => c.charCodeAt(0) & 255)], { type: 'application/pdf' });
  }
  function report(from, to) {
    const V = CONFIG.village, list = tx().filter(t => { const d = new Date(t.created); return d >= from && d <= to; }).reverse(), before = tx().filter(t => new Date(t.created) < from), open = sum(before, t => t.type === 'masuk') - sum(before, t => t.type === 'keluar');
    const inc = sum(list, t => t.type === 'masuk'), out = sum(list, t => t.type === 'keluar'), pages = [[]]; let y = 790;
    const T = (x, s, size = 10, b = false) => pages[pages.length - 1].push({ t: 't', x, y, s, size, b }), L = () => pages[pages.length - 1].push({ t: 'l', x1: 40, y1: y - 4, x2: 555, y2: y - 4 });
    const nl = (d = 15) => { y -= d; if (y < 60) { pages.push([]); y = 790; T(40, 'Laporan Keuangan ' + V.name + ' (lanjutan)', 9, false); y -= 20; } };
    const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID'), fmt = d => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    T(40, 'LAPORAN KEUANGAN ' + V.name.toUpperCase(), 16, true); nl(20); T(40, `Kec. ${V.district}, Kab. ${V.regency}, ${V.province}`, 10); nl(); T(40, `Periode: ${fmt(from)} s.d. ${fmt(to)}   |   Dicetak: ${fmt(new Date())}`, 10); nl(10); L(); nl(20);
    T(40, 'RINGKASAN', 12, true); nl(); [['Saldo awal', open], ['Total pemasukan', inc], ['Total pengeluaran', out], ['Saldo akhir', open + inc - out]].forEach(([k, v], i) => { T(50, k, 10, i === 3); T(420, rp(v), 10, i === 3); nl(); });
    nl(6); [['PEMASUKAN PER KELOMPOK', 'masuk'], ['PENGELUARAN PER KELOMPOK', 'keluar']].forEach(([h, ty]) => { T(40, h, 12, true); nl(); const by = {}; list.filter(t => t.type === ty).forEach(t => by[t.category] = (by[t.category] || 0) + t.amount); Object.entries(by).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => { T(50, k, 10); T(420, rp(v), 10); nl(); }); if (!Object.keys(by).length) { T(50, '-', 10); nl(); } nl(6); });
    T(40, 'DAFTAR TRANSAKSI', 12, true); nl(); T(40, 'Tanggal', 9, true); T(105, 'Keterangan', 9, true); T(360, 'Kelompok', 9, true); T(470, 'Jumlah', 9, true); nl(12); L(); nl(8);
    list.forEach(t => { T(40, fmt(new Date(t.created)), 9); T(105, t.description.slice(0, 58) + (t.approvedBy ? ' [disetujui]' : ''), 9); T(360, t.category.slice(0, 18), 9); T(470, (t.type === 'masuk' ? '+ ' : '- ') + rp(t.amount), 9); nl(13); });
    if (!list.length) { T(40, 'Tidak ada transaksi pada periode ini.', 10); nl(); }
    nl(30); T(60, 'Mengetahui,', 10); T(400, 'Bendahara Desa,', 10); nl(14); T(60, 'Kepala Desa', 10); nl(48); T(60, '( ...................................... )', 10); T(380, '( ...................................... )', 10);
    return pdf(pages);
  }
  function drawLap() {
    const n = new Date(), ym = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    $('#p-lap').innerHTML = `<div class="card"><h2>Laporan keuangan (PDF)</h2><p class="muted" style="margin-bottom:.8rem">Pilih periode. Laporan dibuat langsung di perangkat Anda, bisa dipakai tanpa internet, dan terbuka untuk semua warga.</p><div class="two"><div class="field"><label for="lf">Dari bulan</label><input id="lf" type="month" value="${n.getFullYear()}-01"></div><div class="field"><label for="lt">Sampai bulan</label><input id="lt" type="month" value="${ym(n)}"></div></div><div class="row"><button class="btn btn-primary" id="lDl" type="button">${G.icon('download')}Unduh PDF</button><button class="btn btn-ghost" id="lPr" type="button">${G.icon('print')}Cetak halaman Dana Desa</button></div></div>`;
    $('#lDl').onclick = () => { const [fy, fm] = $('#lf').value.split('-').map(Number), [ty, tm] = $('#lt').value.split('-').map(Number); if (!fy || !ty) return G.toast('Pilih periode', 'err'); const from = new Date(fy, fm - 1, 1), to = new Date(ty, tm, 0, 23, 59, 59); if (to < from) return G.toast('Periode tidak valid', 'err'); const a = document.createElement('a'); a.href = URL.createObjectURL(report(from, to)); a.download = `laporan-keuangan-${$('#lf').value}-${$('#lt').value}.pdf`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); G.toast('Laporan PDF dibuat'); };
    $('#lPr').onclick = () => print();
  }

  const TABS = [['req', 'Pengajuan dan persetujuan', 'clip', drawReq], ['apb', 'APBDes', 'stat', drawApb], ['lap', 'Laporan PDF', 'file', drawLap]];
  $('#ptabs').innerHTML = TABS.map(([k, l, ic], i) => `<button class="tab ${i ? '' : 'on'}" data-t="${k}" type="button">${G.icon(ic)}${l}</button>`).join('');
  const show = k => { G.$$('#ptabs .tab').forEach(x => x.classList.toggle('on', x.dataset.t === k)); TABS.forEach(t => $('#p-' + t[0]).hidden = t[0] !== k); TABS.find(t => t[0] === k)[3](); };
  $('#ptabs').onclick = e => { const b = e.target.closest('[data-t]'); if (b) show(b.dataset.t); };
  ['fundreq', 'funds', 'apbdes'].forEach(c => addEventListener('gx:' + c, () => { const on = G.$('#ptabs .tab.on').dataset.t; if (on !== 'lap' && !$('#p-' + on).querySelector('input:focus,textarea:focus')) TABS.find(t => t[0] === on)[3](); }));
  show('req');
})();
