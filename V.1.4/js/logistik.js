/* Logistik dan Gudang: tugas kurir + bukti serah terima, stok gudang desa, pesanan kolektif, rute motor estafet, dan perbandingan harga pemasok. */
(() => {
  G.init('logistics');
  const $ = G.$, S = CONFIG.supply, role = G.role(), isCour = ['kurir', 'admin', 'developer'].includes(role), isAdm = ['admin', 'developer'].includes(role);
  const HAM = CONFIG.village.hamlets, POS = [[190, 120], [330, 95], [470, 130], [610, 105], [250, 250], [420, 270], [560, 240], [700, 280]], HUB = [410, 190], KM = 0.012;
  const ST = ['baru', 'diambil', 'diantar', 'selesai'], SL = { baru: 'Menunggu kurir', diambil: 'Barang diambil', diantar: 'Sedang diantar', selesai: 'Terkirim' }, SB = { baru: 'b-warn', diambil: 'b-info', diantar: 'b-vio', selesai: 'b-ok' };
  const needRole = (txt, r) => `<div class="warn-box" style="margin-bottom:1rem">${G.icon('lock')} ${txt} <button class="btn btn-ghost btn-sm" data-unl="${r}" type="button" style="margin-left:.5rem">Masuk mode ${G.ROLE_NAME[r]}</button></div>`;
  document.addEventListener('click', e => { const b = e.target.closest('[data-unl]'); if (b) G.unlock(b.dataset.unl); });

  /* ---------- Tugas kurir (dibuat otomatis dari pasokan ke dusun dan pesanan pasar yang diantar motor) ---------- */
  const did = (ref, refId) => (refId % 1e14) * 10 + (ref === 'supply' ? 1 : 2); // id tetap agar dua perangkat tidak membuat tugas ganda
  function ensure() {
    const dl = Store.all('deliveries'), has = (t, id) => dl.some(d => d.ref === t && d.refId === id);
    Store.all('supplies').filter(s => s.mode === 'dusun' && ['dalam perjalanan', 'sampai'].includes(s.status) && !has('supply', s.id)).forEach(s => Store.add('deliveries', { id: did('supply', s.id), ref: 'supply', refId: s.id, title: `Pasokan ${s.code}`, items: s.items.map(i => `${i.name} ${i.qty} ${i.unit}`).join(', '), to: s.destination, who: s.name, status: 'baru', courier: '' }));
    Store.all('orders').filter(o => o.method === 'motor' && ['diterima', 'diantar'].includes(o.status) && !has('order', o.id)).forEach(o => Store.add('deliveries', { id: did('order', o.id), ref: 'order', refId: o.id, title: `Pesanan ${o.code}`, items: `${o.product} x ${o.qty}`, to: o.hamlet, who: o.buyer, status: 'baru', courier: '' }));
  }
  function drawKurir(filter) {
    ensure(); const me = G.name(), all = Store.all('deliveries').slice().sort((a, b) => ST.indexOf(a.status) - ST.indexOf(b.status) || new Date(b.created) - new Date(a.created)), rows = all.filter(d => filter !== 'mine' || d.courier === me);
    $('#l-kurir').innerHTML = (isCour ? '' : needRole('Hanya kurir yang dapat mengambil dan menyelesaikan tugas. Anda melihat sebagai warga.', 'kurir')) +
      `<div class="tabs"><button class="tab ${filter !== 'mine' ? 'on' : ''}" data-f="all" type="button">Semua tugas (${all.length})</button><button class="tab ${filter === 'mine' ? 'on' : ''}" data-f="mine" type="button">Tugas saya</button></div><div class="stack">${rows.map(d => `<article class="card"><div class="row between"><b>${G.icon('bike')} ${G.esc(d.title)}</b><span class="badge ${SB[d.status]}">${SL[d.status]}</span></div>
      <p class="muted">${G.esc(d.items)}</p><p>${G.icon('pin')} Tujuan: <b>${G.esc(d.to)}</b> &bull; penerima: ${G.esc(d.who)}${d.courier ? ' &bull; kurir: ' + G.esc(d.courier) : ''}</p>
      <div class="stepper">${ST.map((s, i) => `<div class="st ${i <= ST.indexOf(d.status) ? 'done' : ''}"><i>${i <= ST.indexOf(d.status) ? '&#10003;' : i + 1}</i>${SL[s]}</div>`).join('')}</div>
      ${d.proof ? `<div class="card" style="box-shadow:none;margin-top:.7rem"><b>${G.icon('check')} Bukti serah terima</b><p class="muted">Diterima oleh ${G.esc(d.proof.receiver)} &bull; ${G.date(d.proof.at)}${d.proof.note ? ' &bull; ' + G.esc(d.proof.note) : ''}</p><div class="row">${d.proof.photo ? `<div class="photo" style="width:160px">${G.img(d.proof.photo, 'photo', 'Foto bukti')}</div>` : ''}<img src="${d.proof.sign}" alt="Tanda tangan penerima" style="height:70px;background:#fff;border:1px solid var(--line);border-radius:10px"></div></div>` : ''}
      ${isCour && d.status !== 'selesai' ? `<div class="row" style="margin-top:.7rem">${d.status === 'baru' ? `<button class="btn btn-primary btn-sm" data-act="take" data-id="${d.id}" type="button">Ambil tugas</button>` : ''}${d.status === 'diambil' ? `<button class="btn btn-primary btn-sm" data-act="go" data-id="${d.id}" type="button">Mulai antar</button>` : ''}${d.status === 'diantar' ? `<button class="btn btn-primary btn-sm" data-act="done" data-id="${d.id}" type="button">${G.icon('pen')}Selesai dan catat bukti</button>` : ''}</div>` : ''}</article>`).join('') || G.empty('truck', 'Belum ada tugas. Tugas muncul otomatis saat pasokan ke dusun tiba atau pesanan pasar diantar motor.')}</div>`;
  }
  $('#l-kurir').addEventListener('click', async e => {
    const f = e.target.closest('[data-f]'); if (f) return drawKurir(f.dataset.f);
    const b = e.target.closest('[data-act]'); if (!b || !isCour) return; const id = +b.dataset.id, d = Store.all('deliveries').find(x => x.id === id);
    if (b.dataset.act === 'take') { const who = await G.askName(); if (!who) return; Store.update('deliveries', id, { status: 'diambil', courier: who }); }
    if (b.dataset.act === 'go') Store.update('deliveries', id, { status: 'diantar' });
    if (b.dataset.act === 'done') proofModal(d);
  });
  function proofModal(d) {
    let photo = '', drawn = false;
    const m = G.modal(`<h2>${G.icon('pen')} Bukti serah terima</h2><p class="muted" style="margin-bottom:.8rem">${G.esc(d.title)} &rarr; ${G.esc(d.to)}</p><form><div class="msg-err" role="alert"></div>
      <div class="field"><label for="pr">Nama penerima</label><input id="pr" name="r" required value="${G.esc(d.who || '')}"></div>
      <div class="field"><label>Foto barang di lokasi (opsional)</label><div class="photo" id="pv" style="max-width:220px;margin-bottom:.4rem">${G.img('', 'photo', 'Foto')}</div><input id="pf" type="file" accept="image/*" capture="environment"></div>
      <div class="field"><label>Tanda tangan penerima</label><canvas id="sg" width="520" height="160" style="width:100%;height:140px;background:#fff;border:2px dashed var(--line);border-radius:12px;touch-action:none"></canvas><button class="btn btn-ghost btn-sm" id="sgc" type="button" style="margin-top:.4rem">Hapus tanda tangan</button></div>
      <div class="field"><label for="pn">Catatan</label><input id="pn" name="n" maxlength="120"></div><button class="btn btn-primary btn-block" type="submit">${G.icon('check')}Simpan bukti dan selesaikan</button></form>`);
    const cv = m.querySelector('#sg'), x = cv.getContext('2d'); x.lineWidth = 3; x.lineCap = 'round'; x.strokeStyle = '#14213d'; let down = false;
    const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
    cv.onpointerdown = e => { down = true; drawn = true; const [a, b] = pt(e); x.beginPath(); x.moveTo(a, b); cv.setPointerCapture(e.pointerId); };
    cv.onpointermove = e => { if (!down) return; const [a, b] = pt(e); x.lineTo(a, b); x.stroke(); }; cv.onpointerup = () => { down = false; };
    m.querySelector('#sgc').onclick = () => { x.clearRect(0, 0, cv.width, cv.height); drawn = false; };
    m.querySelector('#pf').onchange = async e => { try { photo = await G.resizeImage(e.target.files[0], 700, .7); m.querySelector('#pv').innerHTML = G.img(photo, 'photo', 'Foto'); } catch (err) { G.toast(err.message, 'err'); } };
    const f = m.querySelector('form'); f.onsubmit = ev => { ev.preventDefault(); G.submit(f, async () => {
      if (!drawn) throw new Error('Minta penerima menandatangani di kotak tanda tangan.');
      const proof = { receiver: f.r.value.trim(), photo, sign: cv.toDataURL('image/png'), note: f.n.value.trim(), at: new Date().toISOString(), by: G.name() };
      Store.update('deliveries', d.id, { status: 'selesai', proof });
      const now = new Date().toISOString();
      if (d.ref === 'supply') Store.update('supplies', d.refId, s => s.status === 'selesai' ? { proof } : { status: 'sampai', proof, history: [...(s.history || []), { status: 'sampai', at: now }] });
      else Store.update('orders', d.refId, { status: 'selesai', proof });
      m.close(); G.toast('Bukti tersimpan. Tugas selesai.');
    }); };
  }

  /* ---------- Gudang desa ---------- */
  function drawGudang() {
    const w = Store.all('warehouse'), low = w.filter(i => i.qty < i.min);
    $('#l-gudang').innerHTML = (isCour ? '' : needRole('Hanya admin atau kurir yang dapat mengubah stok. Anda melihat sebagai warga.', 'admin')) + (low.length ? `<div class="alert-banner">${G.icon('alert')}<span><b>Stok menipis:</b> ${low.map(i => G.esc(i.name) + ' (' + i.qty + ' ' + G.esc(i.unit) + ')').join(', ')}. <a href="supplies.html">Ajukan pasokan</a></span></div>` : '') +
      `<div class="card"><div class="row between"><h2 style="margin:0">Stok gudang desa</h2>${isCour ? `<button class="btn btn-primary btn-sm" id="gAdd" type="button">${G.icon('plus')}Tambah barang</button>` : ''}</div><div class="table-wrap"><table><thead><tr><th>Barang</th><th>Stok</th><th>Lokasi</th><th>Diperbarui</th>${isCour ? '<th></th>' : ''}</tr></thead><tbody>${w.map(i => `<tr><td><b>${G.esc(i.name)}</b></td><td style="min-width:150px">${i.qty} ${G.esc(i.unit)} ${i.qty < i.min ? '<span class="badge b-bad">menipis</span>' : '<span class="badge b-ok">aman</span>'}<div class="hbar"><i style="width:${Math.min(100, Math.round(i.qty / Math.max(1, i.min * 2) * 100))}%;${i.qty < i.min ? 'background:var(--bad)' : ''}"></i></div><span class="muted">minimal ${i.min}</span></td><td>${G.esc(i.loc || '-')}</td><td class="muted">${G.ago(i.updated)}</td>${isCour ? `<td><div class="row" style="flex-wrap:nowrap"><button class="btn btn-ghost btn-sm" data-mv="${i.id}" data-d="1" type="button">+ Masuk</button><button class="btn btn-ghost btn-sm" data-mv="${i.id}" data-d="-1" type="button">- Keluar</button></div></td>` : ''}</tr>`).join('')}</tbody></table></div></div>`;
  }
  $('#l-gudang').addEventListener('click', e => {
    if (!isCour) return;
    if (e.target.closest('#gAdd')) { const m = G.modal(`<h2>Tambah barang gudang</h2><form><div class="msg-err" role="alert"></div><div class="two"><div class="field"><label>Nama</label><input name="n" required></div><div class="field"><label>Satuan</label><input name="u" required placeholder="kg"></div></div><div class="two"><div class="field"><label>Stok awal</label><input name="q" type="number" min="0" required></div><div class="field"><label>Batas minimal</label><input name="m" type="number" min="0" value="10"></div></div><div class="field"><label>Lokasi rak</label><input name="l"></div><button class="btn btn-primary" type="submit">Simpan</button></form>`); const f = m.querySelector('form'); f.onsubmit = ev => { ev.preventDefault(); Store.add('warehouse', { name: f.n.value.trim(), unit: f.u.value.trim(), qty: +f.q.value, min: +f.m.value, loc: f.l.value.trim(), updated: new Date().toISOString(), log: [{ at: new Date().toISOString(), delta: +f.q.value, by: G.name() || 'Petugas', note: 'Stok awal' }] }); m.close(); G.toast('Barang ditambahkan'); }; }
    const b = e.target.closest('[data-mv]'); if (!b) return; const it = Store.all('warehouse').find(x => x.id === +b.dataset.mv), sign = +b.dataset.d;
    const m = G.modal(`<h2>${sign > 0 ? 'Barang masuk' : 'Barang keluar'}: ${G.esc(it.name)}</h2><form><div class="msg-err" role="alert"></div><div class="field"><label>Jumlah (${G.esc(it.unit)})</label><input name="q" type="number" min="1" required></div><div class="field"><label>Catatan</label><input name="n" placeholder="Contoh: dibagikan ke dusun 2"></div><button class="btn btn-primary" type="submit">Simpan</button></form>`);
    const f = m.querySelector('form'); f.onsubmit = ev => { ev.preventDefault(); G.submit(f, async () => { const q = Math.floor(+f.q.value) * sign; if (it.qty + q < 0) throw new Error('Stok tidak cukup.'); Store.update('warehouse', it.id, x => ({ qty: x.qty + q, updated: new Date().toISOString(), log: [...(x.log || []), { at: new Date().toISOString(), delta: q, by: G.name() || 'Petugas', note: f.n.value.trim() }].slice(-30) })); m.close(); G.toast('Stok diperbarui'); }); };
  });

  /* ---------- Pesanan kolektif ---------- */
  const share = (b, qty) => { const tot = b.participants.reduce((s, p) => s + p.qty, 0) || 1; return Math.round(b.price * qty + b.fee * qty / Math.max(tot, b.target * .5)); };
  function drawKolektif() {
    const bs = Store.all('batches').slice().reverse();
    $('#l-kolektif').innerHTML = `<div class="card" style="margin-bottom:1rem"><b>${G.icon('users')} Pesan bersama, ongkos dibagi.</b><p class="muted">Warga yang butuh barang sama bergabung dalam satu pesanan. Ongkos angkut dibagi sesuai jumlah, jadi lebih murah daripada memesan sendiri (ongkos sendiri sekitar ${G.money(S.vehicles.motor.fee)} atau lebih).</p>${isAdm ? `<button class="btn btn-primary btn-sm" id="bNew" type="button">${G.icon('plus')}Buat pesanan kolektif</button>` : ''}</div>
      <div class="grid">${bs.map(b => { const tot = b.participants.reduce((s, p) => s + p.qty, 0), pct = Math.min(100, Math.round(tot / b.target * 100)), left = Math.max(0, Math.ceil((new Date(b.deadline) - Date.now()) / 864e5)), mine = b.participants.find(p => p.name === G.name());
        return `<article class="card"><div class="row between"><b>${G.esc(b.item)}</b><span class="badge ${b.status === 'terbuka' ? 'b-warn' : 'b-ok'}">${b.status}</span></div><p class="price">${G.money(b.price)} / ${G.esc(b.unit)}</p><div class="hbar"><i style="width:${pct}%"></i></div><p class="muted">${tot} dari ${b.target} ${G.esc(b.unit)} (${pct}%) &bull; ${b.status === 'terbuka' ? 'tutup ' + left + ' hari lagi' : 'sudah dipesan'}</p>
        <p class="muted">Ongkos angkut ${G.money(b.fee)} dibagi peserta. Perkiraan biaya per ${G.esc(b.unit)} termasuk ongkos: <b>${G.money(share(b, 1))}</b></p><p class="muted">${b.participants.length} peserta: ${b.participants.map(p => G.esc(p.name) + ' ' + p.qty).join(', ')}</p>
        ${mine ? `<p class="badge b-ok">Anda ikut ${mine.qty} ${G.esc(b.unit)} (sekitar ${G.money(share(b, mine.qty))})</p>` : ''}
        ${b.status === 'terbuka' ? `<form class="row" data-join="${b.id}" style="margin-top:.6rem;flex-wrap:nowrap"><input name="q" type="number" min="1" placeholder="Jumlah ${G.esc(b.unit)}" required aria-label="Jumlah"><button class="btn btn-primary btn-sm" type="submit">Ikut</button></form>${isAdm ? `<button class="btn btn-ghost btn-sm" data-close="${b.id}" type="button" style="margin-top:.5rem">Tutup dan pesan ke pemasok</button>` : ''}` : ''}</article>`; }).join('') || G.empty('users', 'Belum ada pesanan kolektif.')}</div>`;
  }
  $('#l-kolektif').addEventListener('submit', async e => {
    const f = e.target.closest('[data-join]'); if (!f) return; e.preventDefault(); const who = await G.askName(); if (!who) return;
    const q = Math.floor(+f.q.value); if (!(q > 0)) return;
    Store.update('batches', +f.dataset.join, b => { const p = b.participants.filter(x => x.name !== who); const old = b.participants.find(x => x.name === who); return { participants: [...p, { name: who, qty: (old ? old.qty : 0) + q, hamlet: (G.profile().hamlet || HAM[0].name), at: new Date().toISOString() }] }; }); G.toast('Anda bergabung di pesanan kolektif');
  });
  $('#l-kolektif').addEventListener('click', async e => {
    if (e.target.closest('#bNew')) { const m = G.modal(`<h2>Pesanan kolektif baru</h2><form><div class="msg-err" role="alert"></div><div class="two"><div class="field"><label>Barang</label><input name="i" required></div><div class="field"><label>Satuan</label><input name="u" required></div></div><div class="two"><div class="field"><label>Harga per satuan (Rp)</label><input name="p" type="number" min="0" required></div><div class="field"><label>Ongkos angkut total (Rp)</label><input name="f" type="number" min="0" value="180000"></div></div><div class="two"><div class="field"><label>Target jumlah</label><input name="t" type="number" min="1" required></div><div class="field"><label>Tutup dalam (hari)</label><input name="d" type="number" min="1" value="3"></div></div><div class="field"><label>Kategori</label><select name="c">${S.categories.filter(c => c.id !== 'kustom').map(c => `<option value="${c.id}">${G.esc(c.title)}</option>`).join('')}</select></div><button class="btn btn-primary" type="submit">Buka pesanan</button></form>`); const f = m.querySelector('form'); f.onsubmit = ev => { ev.preventDefault(); Store.add('batches', { item: f.i.value.trim(), unit: f.u.value.trim(), cat: f.c.value, price: +f.p.value, fee: +f.f.value, target: +f.t.value, deadline: new Date(Date.now() + f.d.value * 864e5).toISOString(), status: 'terbuka', participants: [] }); m.close(); G.toast('Pesanan kolektif dibuka'); }; }
    const c = e.target.closest('[data-close]'); if (!c || !isAdm) return; const b = Store.all('batches').find(x => x.id === +c.dataset.close), tot = b.participants.reduce((s, p) => s + p.qty, 0);
    if (!tot) return G.toast('Belum ada peserta', 'err'); if (!(await G.confirm(`Tutup dan buat permintaan pasokan ${tot} ${b.unit} ${b.item}?`))) return;
    const id = G.nextId('supplies'), v = S.vehicles.pickup, now = new Date().toISOString(), mode = S.modes.find(x => x.id === 'balai'), cat = S.categories.find(x => x.id === b.cat) || S.categories[0];
    Store.add('supplies', { code: G.code('PSK', id), name: 'Pesanan kolektif', phone: '', category: b.cat, custom: '', items: [{ name: b.item, qty: tot, unit: b.unit }], urgency: 'biasa', mode: 'balai', destination: mode.title, payment: S.payments[0], note: `Pesanan kolektif ${b.participants.length} peserta`, vehicle: v, supplier: S.suppliers[b.cat], driver: S.drivers[0], plate: 'BB 1234 XX', eta: `Perkiraan tiba ${cat.lead}`, fee: b.fee, auto: S.stepMs > 0, status: 'menunggu', confirmed: false, paid: false, batchId: b.id, created: now, history: [{ status: 'menunggu', at: now }] });
    Store.update('batches', b.id, { status: 'dipesan' }); G.toast('Permintaan pasokan dibuat. Lihat di Pasokan dari Kota.');
  });

  /* ---------- Rute estafet ---------- */
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) * KM * 1.3, hpos = n => { const i = HAM.findIndex(h => h.name === n); return POS[(i < 0 ? 0 : i) % POS.length]; };
  function nn(stops) { const left = [...stops], out = []; let cur = HUB; while (left.length) { left.sort((a, b) => dist(cur, hpos(a)) - dist(cur, hpos(b))); const n = left.shift(); out.push(n); cur = hpos(n); } return out; }
  const len = order => { let c = HUB, t = 0; order.forEach(n => { t += dist(c, hpos(n)); c = hpos(n); }); return t + dist(c, HUB); };
  function drawRute() {
    ensure(); const tasks = Store.all('deliveries').filter(d => d.status !== 'selesai'), stops = [...new Set(tasks.map(d => d.to))].filter(Boolean);
    if (!stops.length) { $('#l-rute').innerHTML = `<div class="card">${G.empty('route', 'Tidak ada pengantaran aktif. Rute dibuat dari tugas kurir yang belum selesai.')}</div>`; return; }
    const manual = stops, best = nn(stops), kmB = len(best), kmM = len(manual), pts = [HUB, ...best.map(hpos), HUB];
    let c = HUB, cum = 0;
    const legs = best.map((n, i) => { const d = dist(c, hpos(n)); cum += d; c = hpos(n); return { n, d, cum, min: Math.round(cum / 20 * 60 + (i + 1) * 8) }; });
    $('#l-rute').innerHTML = `<div class="split"><div class="card"><h2>Rute motor estafet terbaik</h2><p class="muted">Dari Balai Desa (hub) lalu singgah di setiap dusun tujuan dan kembali. Kecepatan 20 km/jam, 8 menit per perhentian.</p>
      <div class="stack">${legs.map((l, i) => `<div class="row between"><span><span class="badge b-info">${i + 1}</span> ${G.esc(l.n)}</span><span class="muted">${l.d.toFixed(1)} km &bull; ${l.min} mnt</span></div>`).join('')}</div>
      <hr style="border:0;border-top:1px solid var(--line);margin:.8rem 0"><div class="row between"><b>Total pergi-pulang</b><b>${kmB.toFixed(1)} km</b></div><div class="row between"><span class="muted">Bahan bakar (35 km/liter)</span><span>${(kmB / 35).toFixed(2)} liter</span></div>
      <div class="row between"><span class="muted">Jika urutan acak</span><span>${kmM.toFixed(1)} km</span></div><p class="badge b-ok" style="margin-top:.5rem">Hemat ${kmM > kmB ? Math.round((1 - kmB / kmM) * 100) : 0}% jarak</p></div>
      <div class="card"><svg viewBox="0 0 820 360" class="map-svg" role="img" aria-label="Peta rute"><rect width="820" height="360" rx="18" fill="#eaf4ec"/><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#e8590c" stroke-width="5" stroke-dasharray="10 8" class="flow"/>
      ${HAM.map((h, i) => { const [x, y] = POS[i % POS.length], on = best.includes(h.name); return `<circle cx="${x}" cy="${y}" r="${on ? 13 : 8}" fill="${on ? '#d7263d' : '#9aa5c4'}" stroke="#fff" stroke-width="3"/><text x="${x}" y="${y + 28}" text-anchor="middle" font-size="12" font-weight="700" fill="#14213d">${G.esc(h.name.replace('Dusun ', ''))}</text>${on ? `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${best.indexOf(h.name) + 1}</text>` : ''}`; }).join('')}
      <rect x="${HUB[0] - 16}" y="${HUB[1] - 16}" width="32" height="32" rx="8" fill="#14213d"/><text x="${HUB[0]}" y="${HUB[1] + 5}" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">HUB</text></svg></div></div>`;
  }

  /* ---------- Harga pemasok ---------- */
  function drawPemasok() {
    const pr = Store.all('prices'), items = [...new Set(pr.map(p => p.item))], sups = [...new Set(pr.map(p => p.supplier))];
    const q = ($('#pq') || {}).value || '', rows = items.filter(i => i.toLowerCase().includes(q.toLowerCase()));
    $('#l-pemasok').innerHTML = `<div class="card" style="margin-bottom:1rem"><div class="row between"><h2 style="margin:0">Perbandingan harga pemasok</h2><div class="row"><input id="pq" placeholder="Cari barang" value="${G.esc(q)}" style="width:200px" aria-label="Cari"><button class="btn btn-ghost btn-sm" id="pCsv" type="button">${G.icon('download')}Ekspor CSV</button>${isAdm ? `<button class="btn btn-primary btn-sm" id="pImp" type="button">${G.icon('plus')}Impor / ubah harga</button><button class="btn btn-ghost btn-sm" id="pApi" type="button">${G.icon('refresh')}Sinkron API pemasok</button>` : ''}</div></div>
      <div class="table-wrap"><table><thead><tr><th>Barang</th>${sups.map(s => `<th>${G.esc(s)}</th>`).join('')}<th>Termurah</th></tr></thead><tbody>${rows.map(i => { const row = pr.filter(p => p.item === i), min = Math.min(...row.map(r => r.price)); return `<tr><td><b>${G.esc(i)}</b><br><span class="muted">per ${G.esc(row[0].unit)}</span></td>${sups.map(s => { const r = row.find(x => x.supplier === s); return `<td class="${r && r.price === min ? 'plus' : ''}">${r ? G.money(r.price) : '-'}</td>`; }).join('')}<td><b>${G.money(min)}</b></td></tr>`; }).join('')}</tbody></table></div></div>
      <div class="card"><h3>Hitung belanja</h3><p class="muted">Pilih barang dan jumlah untuk melihat total di tiap pemasok.</p><div class="row" style="flex-wrap:nowrap"><select id="cItem">${items.map(i => `<option>${G.esc(i)}</option>`).join('')}</select><input id="cQty" type="number" min="1" value="10" style="width:110px" aria-label="Jumlah"></div><div id="cRes" class="stack" style="margin-top:.7rem"></div></div>`;
    const calc = () => { const i = $('#cItem').value, n = +$('#cQty').value || 0, r = Store.all('prices').filter(p => p.item === i).sort((a, b) => a.price - b.price); $('#cRes').innerHTML = r.map((p, k) => `<div class="row between"><span>${G.esc(p.supplier)} ${k === 0 ? '<span class="badge b-ok">termurah</span>' : ''}</span><b>${G.money(p.price * n)}</b></div>`).join(''); };
    $('#cItem').onchange = calc; $('#cQty').oninput = calc; calc(); $('#pq').oninput = G.debounce(() => { drawPemasok(); $('#pq').focus(); $('#pq').setSelectionRange(99, 99); });
  }
  $('#l-pemasok').addEventListener('click', async e => {
    if (e.target.closest('#pCsv')) return G.csv('harga-pemasok.csv', [['pemasok', 'barang', 'satuan', 'harga'], ...Store.all('prices').map(p => [p.supplier, p.item, p.unit, p.price])]);
    if (e.target.closest('#pImp') && isAdm) { const m = G.modal(`<h2>Impor atau ubah harga</h2><p class="muted" style="margin-bottom:.6rem">Tempel baris CSV: <span class="mono">pemasok,barang,satuan,harga</span>. Baris dengan pemasok dan barang yang sama akan memperbarui harga.</p><form><div class="msg-err" role="alert"></div><textarea name="t" style="min-height:160px" required placeholder="UD Sembako Mitra,Beras,kg,14500"></textarea><button class="btn btn-primary" type="submit" style="margin-top:.6rem">Terapkan</button></form>`); const f = m.querySelector('form'); f.onsubmit = ev => { ev.preventDefault(); G.submit(f, async () => { let n = 0; f.t.value.split(/\r?\n/).forEach(l => { const [s, i, u, p] = l.split(',').map(x => x.trim()); if (!s || !i || !(+p > 0) || s === 'pemasok') return; const ex = Store.all('prices').find(x => x.supplier === s && x.item === i); if (ex) Store.update('prices', ex.id, { price: +p, unit: u || ex.unit, updated: new Date().toISOString() }); else Store.add('prices', { supplier: s, item: i, unit: u || 'unit', price: +p, cat: '', updated: new Date().toISOString() }); n++; }); if (!n) throw new Error('Tidak ada baris yang valid.'); m.close(); G.toast(n + ' harga diperbarui'); }); }; }
    if (e.target.closest('#pApi') && isAdm) {
      const apis = Object.values(S.suppliers).filter(s => s.api); if (!apis.length) return G.modal(`<h2>Integrasi API pemasok</h2><p>Belum ada pemasok yang memiliki alamat API. Tambahkan <span class="mono">api: 'https://...'</span> pada pemasok di <span class="mono">CONFIG.supply.suppliers</span> (js/config.js). API harus mengembalikan JSON:</p><pre class="mono" style="white-space:pre-wrap">[{ "item": "Beras", "unit": "kg", "price": 14200 }]</pre><p class="muted">Sampai ada API, gunakan Impor CSV.</p>`);
      let n = 0; for (const s of apis) { try { const r = await fetch(s.api); (await r.json()).forEach(x => { const ex = Store.all('prices').find(y => y.supplier === s.name && y.item === x.item); if (ex) Store.update('prices', ex.id, { price: +x.price, updated: new Date().toISOString() }); else Store.add('prices', { supplier: s.name, item: x.item, unit: x.unit, price: +x.price, cat: '', updated: new Date().toISOString() }); n++; }); } catch (err) {} } G.toast(n + ' harga disinkronkan dari API');
    }
  });

  /* ---------- Tab ---------- */
  const TABS = [['kurir', 'Tugas Kurir', 'bike', () => drawKurir()], ['gudang', 'Gudang Desa', 'warehouse', drawGudang], ['kolektif', 'Pesanan Kolektif', 'users', drawKolektif], ['rute', 'Rute Estafet', 'route', drawRute], ['pemasok', 'Harga Pemasok', 'stat', drawPemasok]];
  $('#ltabs').innerHTML = TABS.map(([k, l, ic], i) => `<button class="tab ${i ? '' : 'on'}" data-t="${k}" type="button">${G.icon(ic)}${l}</button>`).join('');
  const show = k => { G.$$('#ltabs .tab').forEach(x => x.classList.toggle('on', x.dataset.t === k)); TABS.forEach(t => $('#l-' + t[0]).hidden = t[0] !== k); TABS.find(t => t[0] === k)[3](); };
  $('#ltabs').onclick = e => { const b = e.target.closest('[data-t]'); if (b) show(b.dataset.t); };
  ['deliveries', 'warehouse', 'batches', 'prices', 'supplies', 'orders'].forEach(c => addEventListener('gx:' + c, () => { const on = G.$('#ltabs .tab.on').dataset.t; if (!$('#l-' + on).querySelector('input:focus,textarea:focus')) TABS.find(t => t[0] === on)[3](); }));
  show('kurir');
})();
