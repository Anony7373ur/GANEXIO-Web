/* Pasokan dari kota: permintaan, jenis kustom, titik serah-terima (tidak hanya dusun), dan pelacakan bertahap.
   MODE OTOMATIS: status permintaan baru maju otomatis tiap CONFIG.supply.stepMs (6 detik):
   Menunggu -> Diproses -> Dalam perjalanan -> Sampai di lokasi. "Selesai" hanya setelah barang diambil dan dibayar di lokasi. */
(() => {
  G.init('supplies');
  const $ = G.$, S = CONFIG.supply, admin = G.role() === 'admin';
  const ST = ['menunggu', 'proses', 'dalam perjalanan', 'sampai', 'selesai'];
  const LB = ['Menunggu', 'Diproses', 'Dalam perjalanan', 'Sampai di lokasi', 'Selesai'];
  const NOTE = ['Permintaan diterima, menunggu verifikasi petugas desa.', 'Petugas memesan barang ke pemasok dan menyiapkan armada.', 'Barang dalam perjalanan menuju lokasi serah-terima.', 'Barang sudah sampai. Ambil di lokasi, periksa, lalu bayar di tempat.', 'Selesai: barang sudah diambil dan dibayar.'];
  const BADGE = { menunggu: 'b-warn', proses: 'b-info', 'dalam perjalanan': 'b-vio', sampai: 'b-ok', selesai: 'b-ok' };
  const cat = id => S.categories.find(c => c.id === id) || S.categories[0];
  const mode = id => S.modes.find(m => m.id === id) || S.modes[0];
  const blank = () => ({ name: '', qty: '', unit: '' });
  const shown = {}; // persen terakhir yang tampil per permintaan (agar truk bergerak mulus)
  let items = [blank()];

  /* ---------- Formulir ---------- */
  $('#cats').innerHTML = S.categories.map((c, i) => `<label class="choice"><input type="radio" name="category" value="${c.id}" ${i ? '' : 'checked'}><span>${G.icon(c.ic)}<b>${G.esc(c.title)}<small>${G.esc(c.hint)} &bull; proses ${G.esc(c.lead)}</small></b></span></label>`).join('');
  $('#modes').innerHTML = S.modes.map((m, i) => `<label class="choice"><input type="radio" name="mode" value="${m.id}" ${i ? '' : 'checked'}><span>${G.icon(m.id === 'dusun' ? 'bike' : m.id === 'kolektif' ? 'users' : 'pin')}<b>${G.esc(m.title)}<small>${G.esc(m.hint)}${m.surcharge ? ' &bull; ' + (m.surcharge > 0 ? '+' : '-') + G.money(Math.abs(m.surcharge)) : ''}</small></b></span></label>`).join('');
  $('#dest').innerHTML = CONFIG.village.hamlets.map(h => `<option>${G.esc(h.name)}</option>`).join('');
  $('#pay').innerHTML = S.payments.map(p => `<option>${G.esc(p)}</option>`).join('');
  const form = $('#f'), val = n => form.elements[n].value;

  function drawQuick() {
    const list = S.catalog[val('category')] || [];
    $('#quick').innerHTML = list.length ? list.map(([n, u]) => `<button class="chip" type="button" data-n="${G.esc(n)}" data-u="${G.esc(u)}">${G.icon('plus')}${G.esc(n)}</button>`).join('') : '<span class="muted">Ketik sendiri nama barang yang dibutuhkan.</span>';
  }
  function drawItems() {
    $('#items').innerHTML = items.map((it, i) => `<div class="row" style="flex-wrap:nowrap;align-items:flex-end">
      <div class="field" style="flex:2;margin:0"><label>Barang</label><input data-i="${i}" data-k="name" value="${G.esc(it.name)}" maxlength="60" placeholder="Nama barang"></div>
      <div class="field" style="flex:1;margin:0"><label>Jumlah</label><input data-i="${i}" data-k="qty" type="number" min="1" step="any" value="${G.esc(it.qty)}" inputmode="decimal"></div>
      <div class="field" style="flex:1;margin:0"><label>Satuan</label><input data-i="${i}" data-k="unit" value="${G.esc(it.unit)}" maxlength="15" placeholder="kg"></div>
      ${items.length > 1 ? `<button class="btn btn-ghost btn-sm" type="button" data-rm="${i}" aria-label="Hapus barang">${G.icon('x')}</button>` : ''}</div>`).join('');
  }
  const clean = () => items.filter(i => i.name.trim()).map(i => ({ name: i.name.trim(), qty: Number(i.qty), unit: i.unit.trim() }));

  /* Pilihan kendaraan sederhana berdasarkan jenis dan jumlah barang. TODO-ISI: sesuaikan aturan dengan armada nyata. */
  function vehicleFor(c, list) {
    const V = S.vehicles;
    if (c === 'kustom') return { name: 'Ditentukan setelah pemasok ditemukan', cap: '-', fee: 0 };
    const total = list.reduce((s, i) => s + (i.qty || 0), 0), names = list.map(i => i.name.toLowerCase()).join(' ');
    if (c === 'sumber_daya' && /solar|bensin|bahan bakar/.test(names)) return V.tangki;
    if (c === 'bahan_bangunan') return total > 100 ? V.colt : V.engkel;
    if (total <= 30 && list.length <= 3) return V.motor;
    return total > 300 ? V.engkel : V.pickup;
  }
  const feeFor = (v, m, c) => c === 'kustom' ? 0 : Math.max(0, v.fee + m.surcharge);
  function est() {
    const c = cat(val('category')), m = mode(val('mode')), list = clean(), v = vehicleFor(c.id, list), fee = feeFor(v, m, c.id);
    $('#destF').hidden = !m.needDusun;
    $('#customF').hidden = c.id !== 'kustom';
    $('#est').innerHTML = `<b>Perkiraan</b><div class="row between" style="margin-top:.4rem"><span>Lama ${c.id === 'kustom' ? 'pengadaan' : 'proses'}</span><b>${G.esc(c.lead)}</b></div>
      <div class="row between"><span>Kendaraan</span><b>${G.esc(v.name)}</b></div><div class="row between"><span>Ongkos angkut</span><b>${c.id === 'kustom' ? 'Dihitung setelah pemasok ditemukan' : G.money(fee)}</b></div>
      <p class="muted" style="margin-top:.4rem">Harga barang sesuai nota pemasok. Semua dibayar di lokasi saat barang diambil atau diantar.</p>`;
  }
  form.addEventListener('change', e => { if (e.target.name === 'category') { items = [blank()]; drawQuick(); drawItems(); } est(); });
  $('#items').addEventListener('input', e => { const i = e.target.dataset.i; if (i !== undefined) { items[i][e.target.dataset.k] = e.target.value; est(); } });
  $('#items').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { items.splice(+b.dataset.rm, 1); drawItems(); est(); } });
  $('#addItem').onclick = () => { items.push(blank()); drawItems(); };
  $('#quick').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return; const last = items[items.length - 1];
    if (!last.name) { last.name = b.dataset.n; last.unit = b.dataset.u; } else items.push({ name: b.dataset.n, qty: '', unit: b.dataset.u });
    drawItems(); est();
  });

  form.addEventListener('submit', e => { e.preventDefault(); G.submit(form, async () => {
    const list = clean(), c = cat(val('category')), m = mode(val('mode'));
    if (!list.length) throw new Error('Tambahkan minimal satu barang.');
    if (list.some(i => !(i.qty > 0) || !i.unit)) throw new Error('Isi jumlah dan satuan untuk setiap barang.');
    const custom = val('custom').trim();
    if (c.id === 'kustom' && !custom) throw new Error('Tulis nama kategori atau jenis barang kustom.');
    const who = await G.askName(); if (!who) throw new Error('Nama diperlukan agar permintaan dapat dilacak.');
    const id = G.nextId('supplies'), v = vehicleFor(c.id, list), isC = c.id === 'kustom', now = new Date().toISOString();
    const r = Store.add('supplies', {
      code: G.code('PSK', id), name: who, phone: G.profile().phone || '', category: c.id, custom: isC ? custom : '', items: list, urgency: val('urgency'),
      mode: m.id, destination: m.needDusun ? val('dest') : m.title, payment: val('payment'), note: val('note').trim(), vehicle: v, supplier: S.suppliers[c.id],
      driver: isC ? '-' : S.drivers[id % S.drivers.length], plate: isC ? '-' : 'BB ' + (1200 + id * 37) + ' XX',
      eta: isC ? `Estimasi proses ${c.lead} (belum ada mitra tetap)` : `Perkiraan tiba ${c.lead}`, fee: feeFor(v, m, c.id),
      auto: S.stepMs > 0, status: 'menunggu', confirmed: false, paid: false, created: now, history: [{ status: 'menunggu', at: now }]
    });
    form.reset(); items = [blank()]; drawQuick(); drawItems(); est();
    const md = G.modal(`<h2>${G.icon('check')} Permintaan terkirim</h2><p>Simpan kode tiket ini untuk melacak:</p><p class="price" style="font-size:1.6rem;margin:.5rem 0">${r.code}</p>${isC ? '<p class="warn-box">Barang kustom perlu pencarian pemasok, jadi prosesnya lebih lama.</p>' : ''}<div class="row" style="margin-top:.8rem"><button class="btn btn-primary" data-go type="button">${G.icon('truck')}Lacak Sekarang</button><button class="btn btn-ghost" data-cp type="button">${G.icon('copy')}Salin Kode</button></div>`);
    md.querySelector('[data-go]').onclick = () => { md.close(); showTab('track'); $('#q').value = r.code; list_(); };
    md.querySelector('[data-cp]').onclick = () => G.copy(r.code);
  }); });

  /* ---------- Kemajuan otomatis ---------- */
  const stepOf = r => (S.stepMs || 6000) * (r.category === 'kustom' ? 3 : 1);
  function advance() {
    if (!S.stepMs) return;
    Store.all('supplies').forEach(r => {
      if (!r.auto || r.status === 'selesai') return;
      const cur = ST.indexOf(r.status), t = Math.min(3, Math.floor((Date.now() - new Date(r.created)) / stepOf(r)));
      if (t <= cur) return;
      const hist = [...r.history]; for (let i = cur + 1; i <= t; i++) hist.push({ status: ST[i], at: new Date(new Date(r.created).getTime() + i * stepOf(r)).toISOString() });
      Store.update('supplies', r.id, { status: ST[t], history: hist });
    });
  }

  /* ---------- Daftar dan pelacakan ---------- */
  const row = (a, b) => `<div class="row between" style="align-items:flex-start;flex-wrap:nowrap"><span class="muted">${a}</span><b style="text-align:right">${b}</b></div>`;
  function card(r) {
    const idx = ST.indexOf(r.status), pct = idx * 25, c = cat(r.category), m = mode(r.mode), from = shown[r.id] ?? pct; shown[r.id] = pct;
    const v = r.vehicle || {}, sp = r.supplier || {}, isC = r.category === 'kustom';
    const ship = idx >= 1 ? `<div class="card" style="box-shadow:none;margin-top:.8rem"><b>${G.icon('truck')} Pengiriman dan asal barang</b><div class="stack" style="gap:.3rem;margin-top:.5rem">
        ${row('Pemasok / toko', G.esc(sp.name || '-') + (sp.type ? ' (' + G.esc(sp.type) + ')' : ''))}${row('Sumber barang', G.esc(sp.source || '-'))}${row('Kendaraan', G.esc(v.name || '-') + (v.cap && v.cap !== '-' ? ' &bull; ' + G.esc(v.cap) : ''))}${row('Sopir dan plat', G.esc(r.driver || '-') + ' &bull; ' + G.esc(r.plate || '-'))}</div></div>`
      : `<p class="muted" style="margin-top:.6rem">Pemasok dan armada ditentukan petugas saat permintaan diproses.</p>`;
    return `<article class="card" data-req="${r.id}">
      <div class="row between"><b>${G.icon(c.ic)} ${G.esc(c.title)}${r.custom ? ': ' + G.esc(r.custom) : ''} &bull; ${r.code}</b><span class="badge ${BADGE[r.status]}">${LB[idx]}</span></div>
      <ul style="margin:.5rem 0 .3rem 1.1rem">${r.items.map(i => `<li><b>${G.esc(i.name)}</b> &mdash; ${i.qty} ${G.esc(i.unit)}</li>`).join('')}</ul>
      <p class="muted">${G.icon('user')} ${G.esc(r.name)} &bull; ${G.date(r.created)} ${r.urgency === 'mendesak' ? '<span class="badge b-bad">Mendesak</span>' : ''}</p>
      <div class="track"><div class="track-line"><div class="track-fill" style="width:${from}%" data-p="width" data-to="${pct}"></div></div>
        <div class="track-truck ${idx === 2 ? 'moving' : ''}" style="left:${from}%" data-p="left" data-to="${pct}">${G.icon(idx === 4 ? 'check' : 'truck')}</div>
        <div class="track-steps">${LB.map((l, i) => `<span class="${i <= idx ? 'on' : ''} ${i === idx ? 'now' : ''}">${i === idx && idx < 4 ? '<i class="dotpulse"></i>' : ''}${l}</span>`).join('')}</div></div>
      <p><b>${G.esc(NOTE[idx])}</b>${r.auto && idx < 3 ? ' <span class="muted">(tahap berikutnya sekitar ' + Math.round(stepOf(r) / 1000) + ' detik)</span>' : ''}</p>
      <div class="stack" style="gap:.3rem;margin-top:.6rem">${row('Cara menerima', G.esc(m.title) + (r.destination && r.destination !== m.title ? '<br><span class="muted">' + G.esc(r.destination) + '</span>' : ''))}${row('Pembayaran', G.esc(r.payment))}${row('Ongkos angkut', isC ? 'Dihitung setelah pemasok ditemukan' : G.money(r.fee))}${row('Estimasi', G.esc(r.eta))}</div>
      ${isC ? '<p class="warn-box" style="margin-top:.7rem">Barang kustom belum punya mitra tetap: tim Ganexio mencari pemasok lebih dulu, sehingga prosesnya lebih lama.</p>' : ''}
      ${ship}${r.proof ? `<div class="card" style="box-shadow:none;margin-top:.7rem"><b>${G.icon('check')} Bukti serah terima kurir</b><p class="muted">Diterima oleh ${G.esc(r.proof.receiver)} &bull; ${G.date(r.proof.at)}</p><div class="row">${r.proof.photo ? `<div class="photo" style="width:150px">${G.img(r.proof.photo, 'photo', 'Foto bukti')}</div>` : ''}<img src="${r.proof.sign}" alt="Tanda tangan" style="height:64px;background:#fff;border:1px solid var(--line);border-radius:10px"></div></div>` : ''}${r.note ? `<p class="pre muted" style="margin-top:.5rem">Catatan: ${G.esc(r.note)}</p>` : ''}
      ${idx === 3 && !r.confirmed ? `<button class="btn btn-primary" data-ok="${r.id}" type="button" style="margin-top:.8rem">${G.icon('check')}Sudah diambil dan dibayar</button>` : ''}
      <details style="margin-top:.7rem"><summary class="muted" style="cursor:pointer">Riwayat tahap</summary><ul style="margin:.4rem 0 0 1.1rem">${r.history.map(h => `<li>${LB[ST.indexOf(h.status)]} &mdash; ${G.date(h.at)}</li>`).join('')}</ul></details>
      ${admin ? `<div class="field" style="margin:.8rem 0 0"><label>Ubah status (mode admin, menghentikan simulasi)</label><select data-id="${r.id}">${ST.map((s, i) => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${LB[i]}</option>`).join('')}</select></div>` : ''}</article>`;
  }
  function list_() {
    const q = $('#q').value.trim().toLowerCase(), fs = $('#fs').value;
    const rows = Store.all('supplies').slice().reverse().filter(r => (!fs || r.status === fs) && (!q || (r.code + r.name + (r.custom || '') + r.items.map(i => i.name).join(' ')).toLowerCase().includes(q)));
    const box = $('#list'), open = G.$$('details[open]', box).map(d => d.closest('[data-req]').dataset.req);
    box.innerHTML = rows.length ? rows.map(card).join('') : G.empty('truck', 'Belum ada permintaan yang cocok.');
    open.forEach(id => { const d = box.querySelector(`[data-req="${id}"] details`); if (d) d.open = true; });
    G.icons(box);
    /* geser truk dan isi garis ke posisi terbaru agar tampil beranimasi */
    requestAnimationFrame(() => requestAnimationFrame(() => G.$$('[data-to]', box).forEach(el => { el.style[el.dataset.p] = el.dataset.to + '%'; })));
  }
  function kpi() {
    const all = Store.all('supplies'), n = (...s) => all.filter(x => s.includes(x.status)).length;
    $('#kpi').innerHTML = [['Menunggu / diproses', n('menunggu', 'proses'), 'clock'], ['Dalam perjalanan', n('dalam perjalanan'), 'truck'], ['Siap diambil', n('sampai'), 'pin'], ['Selesai', n('selesai'), 'check']]
      .map(([l, v, ic]) => `<div class="card" style="padding:1rem"><span class="cat-ic sm">${G.icon(ic)}</span><div><b>${v}</b><span class="muted">${l}</span></div></div>`).join('');
  }
  $('#list').addEventListener('click', e => {
    const b = e.target.closest('[data-ok]'); if (!b) return; const id = +b.dataset.ok, now = new Date().toISOString();
    Store.update('supplies', id, r => ({ status: 'selesai', confirmed: true, paid: true, history: [...r.history, { status: 'selesai', at: now }] })); G.toast('Terima kasih. Permintaan selesai.');
  });
  $('#list').addEventListener('change', e => {
    const id = +e.target.dataset.id; if (!id) return; const now = new Date().toISOString(), st = e.target.value;
    Store.update('supplies', id, r => ({ status: st, auto: false, confirmed: st === 'selesai', paid: st === 'selesai', history: [...r.history, { status: st, at: now }] })); G.toast('Status diperbarui');
  });
  $('#q').oninput = G.debounce(list_); $('#fs').onchange = list_;
  const showTab = t => { G.$$('#tabs .tab').forEach(x => x.classList.toggle('on', x.dataset.tab === t)); $('#new').hidden = t !== 'new'; $('#track').hidden = t !== 'track'; if (t === 'track') list_(); };
  G.$$('#tabs .tab').forEach(t => t.onclick = () => showTab(t.dataset.tab));
  addEventListener('gx:supplies', () => { kpi(); list_(); });
  addEventListener('storage', e => { if (e.key === 'gx_supplies') { kpi(); list_(); } });

  /* Alur pasokan di samping formulir: sorotan berputar terus (animasi diam) */
  $('#flowSteps').innerHTML = LB.map(l => `<span>${l}</span>`).join('');
  let k = 0; const flow = () => G.$$('#flowSteps span').forEach((s, i) => { s.classList.toggle('on', i <= k); s.classList.toggle('now', i === k); });
  flow(); setInterval(() => { k = (k + 1) % LB.length; flow(); }, 1600);

  drawQuick(); drawItems(); est(); kpi(); list_();
  advance(); setInterval(advance, 1000);
})();
