/* Pasar desa: warga bisa datang ke toko (kode ambil + jam) atau minta diantar motor. Penjual bisa menambah foto barang.
   Fitur menghapus barang hanya muncul di mode petugas (admin). */
(() => {
  G.init('market');
  const $ = G.$, M = CONFIG.market, admin = G.role() === 'admin';
  const OST = { baru: 'b-warn', diterima: 'b-info', siap: 'b-vio', diantar: 'b-vio', selesai: 'b-ok', batal: 'b-bad' };
  const OLB = { baru: 'Menunggu penjual', diterima: 'Diterima penjual', siap: 'Siap diambil', diantar: 'Sedang diantar', selesai: 'Selesai', batal: 'Dibatalkan' };
  const DEL = { motor: ['bike', 'Diantar motor'], ambil: ['pin', 'Datang ke toko'], keduanya: ['store', 'Datang ke toko / diantar'] };
  const flow = m => m === 'ambil' ? ['baru', 'diterima', 'siap', 'selesai'] : ['baru', 'diterima', 'diantar', 'selesai'];
  const hamlet = n => CONFIG.village.hamlets.find(h => h.name === n) || CONFIG.village.hamlets[0];
  let cat = 'Semua', view = 'mine';
  const stars = n => '<span style="color:#f5b800;letter-spacing:1px">' + '\u2605'.repeat(Math.round(n)) + '<span style="color:#d5d9e6">' + '\u2605'.repeat(5 - Math.round(n)) + '</span></span>';
  const rating = id => { const r = Store.all('reviews').filter(x => x.productId === id); return r.length ? { avg: r.reduce((s, x) => s + x.stars, 0) / r.length, n: r.length } : null; };
  const verified = name => Store.all('verifications').some(v => v.seller === name);

  $('#cats').innerHTML = ['Semua', ...M.categories].map(c => `<button class="chip ${c === cat ? 'on' : ''}" type="button">${G.esc(c)}</button>`).join('');
  $('#cats').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; cat = b.textContent; G.$$('#cats .chip').forEach(x => x.classList.toggle('on', x === b)); draw(); };

  /* ---------- Daftar barang ---------- */
  function draw() {
    const q = $('#q').value.trim().toLowerCase(), dl = $('#dl').value, so = $('#sort').value;
    const rows = Store.all('products').filter(p => (cat === 'Semua' || p.category === cat) && (!q || (p.name + p.seller + p.description).toLowerCase().includes(q)) && (!dl || p.delivery === 'keduanya' || p.delivery === dl));
    rows.sort((a, b) => so === 'low' ? a.price - b.price : so === 'high' ? b.price - a.price : new Date(b.created) - new Date(a.created));
    $('#products').innerHTML = rows.length ? rows.map(p => `<article class="card prod lift">
      <div class="photo">${G.img(p.image, 'product', p.name)}</div>
      <div class="prod-body"><div class="row between"><span class="badge">${G.esc(p.category)}</span><span class="badge ${p.stock > 0 ? 'b-ok' : 'b-bad'}">${p.stock > 0 ? 'Stok ' + p.stock : 'Habis'}</span></div>
        <h3>${G.esc(p.name)}</h3>${(() => { const r = rating(p.id); return r ? `<div>${stars(r.avg)} <span class="muted">${r.avg.toFixed(1)} (${r.n} ulasan)</span></div>` : '<div class="muted">Belum ada ulasan</div>'; })()}<span class="price">${G.money(p.price)}</span><p class="muted pre">${G.esc(p.description)}</p>
        <p class="muted">${G.icon(DEL[p.delivery][0])} ${DEL[p.delivery][1]}<br>${G.icon('user')} ${G.esc(p.seller)} ${verified(p.seller) ? '<span class="badge b-ok">Terverifikasi</span>' : ''}${p.city ? ' <span class="badge b-info">Bisa ke kota</span>' : ''}<br>${G.icon('pin')} ${G.esc(p.shop)}${p.hours ? '<br>' + G.icon('clock') + ' ' + G.esc(p.hours) : ''}</p>
        <div class="row" style="margin-top:auto;padding-top:.6rem"><button class="btn btn-primary btn-sm" data-buy="${p.id}" ${p.stock > 0 ? '' : 'disabled'}>${G.icon('basket')}Pesan</button>
          ${p.phone ? `<a class="btn btn-ghost btn-sm" href="${G.wa(p.phone)}" target="_blank" rel="noopener">${G.icon('chat')}WhatsApp</a>` : ''}
          <a class="btn btn-ghost btn-sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.shop + ' Sipagabu Toba')}" target="_blank" rel="noopener" aria-label="Lihat lokasi toko">${G.icon('map')}</a>
          ${admin ? `<button class="btn btn-ghost btn-sm" data-ver="${G.esc(p.seller)}" type="button">${verified(p.seller) ? 'Cabut verifikasi' : 'Verifikasi penjual'}</button>` : ''}
          ${admin ? `<button class="btn btn-ghost btn-sm" data-del="${p.id}" aria-label="Hapus barang (petugas)">${G.icon('trash')}</button>` : ''}</div></div></article>`).join('') : G.empty('store', 'Belum ada barang yang cocok.');
  }
  $('#products').addEventListener('click', async e => {
    const ver = e.target.closest('[data-ver]'); if (ver && admin) { const ex = Store.all('verifications').find(v => v.seller === ver.dataset.ver); if (ex) Store.remove('verifications', ex.id); else Store.add('verifications', { seller: ver.dataset.ver, by: G.name() || 'Admin Desa' }); G.toast('Status verifikasi diperbarui'); draw(); return; }
    const buy = e.target.closest('[data-buy]'), del = e.target.closest('[data-del]');
    if (buy) buyModal(Store.all('products').find(p => p.id === +buy.dataset.buy));
    if (del && admin && await G.confirm('Hapus barang ini dari pasar? (hanya petugas)')) { Store.remove('products', +del.dataset.del); G.toast('Barang dihapus'); }
  });
  $('#q').oninput = G.debounce(draw); $('#sort').onchange = draw; $('#dl').onchange = draw;

  /* ---------- Pesan barang ---------- */
  async function buyModal(p) {
    const who = await G.askName(); if (!who) return;
    const opts = p.delivery === 'keduanya' ? ['ambil', 'motor'] : [p.delivery];
    const m = G.modal(`<h2>Pesan ${G.esc(p.name)}</h2><div class="row" style="flex-wrap:nowrap;margin-bottom:1rem"><div class="photo" style="width:110px;flex:none">${G.img(p.image, 'product', p.name)}</div><div><b class="price">${G.money(p.price)}</b><p class="muted">Penjual: ${G.esc(p.seller)}<br>${G.esc(p.shop)}${p.hours ? '<br>Buka: ' + G.esc(p.hours) : ''}</p></div></div>
      <form id="bf"><div class="msg-err" role="alert"></div>
      <div class="two"><div class="field"><label for="bn">Nama</label><input id="bn" name="name" value="${G.esc(who)}" required></div><div class="field"><label for="bp">Nomor HP</label><input id="bp" name="phone" value="${G.esc(G.profile().phone || '')}" inputmode="tel"></div></div>
      <div class="field"><label for="bq">Jumlah (stok ${p.stock})</label><input id="bq" name="qty" type="number" min="1" max="${p.stock}" value="1" required></div>
      <label class="lbl">Cara menerima</label><div class="choices">${opts.map((o, i) => `<label class="choice"><input type="radio" name="method" value="${o}" ${i ? '' : 'checked'}><span>${G.icon(o === 'motor' ? 'bike' : 'pin')}<b>${o === 'motor' ? 'Diantar motor' : 'Datang ke toko'}<small>${o === 'motor' ? 'Ongkos sesuai dusun tujuan' : 'Tanpa ongkos. Tunjukkan kode ambil di toko'}</small></b></span></label>`).join('')}</div>
      <div id="addr"><div class="two"><div class="field"><label for="bh">Dusun tujuan</label><select id="bh" name="hamlet">${CONFIG.village.hamlets.map(h => `<option>${G.esc(h.name)}</option>`).join('')}</select></div><div class="field"><label for="bs">Waktu antar</label><select id="bs" name="slotM">${M.slots.map(s => `<option>${G.esc(s)}</option>`).join('')}</select></div></div>
        <div class="field"><label for="ba">Alamat / patokan rumah</label><textarea id="ba" name="address" placeholder="Contoh: rumah cat hijau dekat balai desa"></textarea></div></div>
      <div id="pick"><div class="field"><label for="bw">Perkiraan waktu datang ke toko</label><select id="bw" name="slotP">${M.slots.map(s => `<option>${G.esc(s)}</option>`).join('')}</select></div></div>
      <div class="field"><label for="by">Pembayaran</label><select id="by" name="payment">${M.payments.map(s => `<option>${G.esc(s)}</option>`).join('')}</select></div>
      <div class="card" style="box-shadow:none;margin-bottom:1rem"><div class="row between"><span>Harga barang</span><b id="t1"></b></div><div class="row between"><span>Ongkos antar</span><b id="t2"></b></div><div class="row between"><b>Total</b><b class="price" id="t3"></b></div></div>
      <button class="btn btn-primary btn-block" type="submit">${G.icon('check')}Kirim Pesanan</button></form>`);
    const f = m.querySelector('#bf'), fee = () => f.method.value === 'motor' ? hamlet(f.hamlet.value).fee : 0;
    const upd = () => { const a = p.price * (+f.qty.value || 0), d = fee(); m.querySelector('#t1').textContent = G.money(a); m.querySelector('#t2').textContent = f.method.value === 'motor' ? G.money(d) : 'Gratis (datang ke toko)'; m.querySelector('#t3').textContent = G.money(a + d); m.querySelector('#addr').hidden = f.method.value !== 'motor'; m.querySelector('#pick').hidden = f.method.value !== 'ambil'; };
    f.addEventListener('input', upd); upd();
    f.addEventListener('submit', e => { e.preventDefault(); G.submit(f, async () => {
      const qty = Math.floor(+f.qty.value), cur = Store.all('products').find(x => x.id === p.id), method = f.method.value;
      if (!(qty >= 1) || qty > cur.stock) throw new Error('Jumlah melebihi stok yang tersedia.');
      if (method === 'motor' && !f.address.value.trim()) throw new Error('Isi alamat pengantaran.');
      G.setName(f.name.value.trim());
      Store.update('products', p.id, { stock: cur.stock - qty });
      const id = G.nextId('orders');
      const o = Store.add('orders', { code: G.code('PSN', id), productId: p.id, product: p.name, price: p.price, qty, method, buyer: f.name.value.trim(), phone: f.phone.value.trim(), hamlet: method === 'motor' ? f.hamlet.value : '', address: f.address.value.trim(), fee: fee(), payment: f.payment.value, slot: method === 'motor' ? f.slotM.value : f.slotP.value, pickCode: String(1000 + Math.floor(Math.random() * 9000)), seller: p.seller, shop: p.shop, hours: p.hours || '', status: 'baru' });
      m.close(); G.modal(`<h2>${G.icon('check')} Pesanan terkirim</h2><p>Kode pesanan: <b>${o.code}</b></p>${method === 'ambil' ? `<p style="margin-top:.6rem">Datang ke <b>${G.esc(p.shop)}</b> pada <b>${G.esc(o.slot)}</b> dan tunjukkan kode ambil:</p><p class="price" style="font-size:2rem;letter-spacing:.2em">${o.pickCode}</p>` : `<p style="margin-top:.6rem">Pesanan diantar ke ${G.esc(o.hamlet)} pada ${G.esc(o.slot)}. Bayar saat barang diterima.</p>`}<p class="muted" style="margin-top:.6rem">Pantau di tab Pesanan. Penjual akan mengonfirmasi pesanan Anda.</p>`);
      drawOrders();
    }); });
  }

  /* ---------- Jual barang (dengan foto) ---------- */
  $('#sellBtn').onclick = async () => {
    const who = await G.askName(); if (!who) return;
    let photo = '';
    const m = G.modal(`<h2>Jual barang</h2><form id="sf"><div class="msg-err" role="alert"></div>
      <div class="field"><label>Foto barang</label><div class="photo" id="pv" style="margin-bottom:.5rem">${G.img('', 'product', 'Foto barang')}</div><input id="pf" type="file" accept="image/*"><p class="muted">Foto dikecilkan otomatis. Tanpa foto, gambar bawaan dipakai.</p></div>
      <div class="field"><label for="sn">Nama barang</label><input id="sn" name="name" maxlength="60" required></div>
      <div class="two"><div class="field"><label for="sc">Kelompok</label><select id="sc" name="category">${M.categories.map(c => `<option>${G.esc(c)}</option>`).join('')}</select></div><div class="field"><label for="sd">Cara terima</label><select id="sd" name="delivery"><option value="keduanya">Datang ke toko dan diantar</option><option value="ambil">Hanya datang ke toko</option><option value="motor">Hanya diantar motor</option></select></div></div>
      <div class="two"><div class="field"><label for="sp">Harga (Rp)</label><input id="sp" name="price" type="number" min="0" inputmode="numeric" required></div><div class="field"><label for="ss">Stok</label><input id="ss" name="stock" type="number" min="1" inputmode="numeric" required></div></div>
      <div class="two"><div class="field"><label for="sl">Nama penjual</label><input id="sl" name="seller" value="${G.esc(who)}" required></div><div class="field"><label for="sh">Nomor WhatsApp</label><input id="sh" name="phone" value="${G.esc(G.profile().phone || '')}" inputmode="tel"></div></div>
      <div class="field"><label for="so">Lokasi toko</label><select id="so" name="hamlet">${CONFIG.village.hamlets.map(h => `<option>${G.esc(h.name)}</option>`).join('')}</select></div>
      <div class="two"><div class="field"><label for="sj">Patokan lokasi</label><input id="sj" name="spot" placeholder="Contoh: depan gereja"></div><div class="field"><label for="sw">Jam buka</label><input id="sw" name="hours" placeholder="Contoh: 07.00 - 17.00"></div></div>
      <div class="field"><label for="sx">Keterangan</label><textarea id="sx" name="description"></textarea></div>
      <label class="show-pw" style="display:flex;gap:.6rem;align-items:center;margin-bottom:.8rem"><input type="checkbox" name="city" style="width:auto;min-height:0"> Tersedia untuk pembeli dari kota</label><div class="field"><label for="scm">Minimal pembelian kota (opsional)</label><input id="scm" name="cityMin" placeholder="Contoh: 20 kg"></div>
      <button class="btn btn-primary btn-block" type="submit">${G.icon('plus')}Pasang di Pasar</button></form>`);
    m.querySelector('#pf').onchange = async e => { try { photo = await G.resizeImage(e.target.files[0], 640, .72); m.querySelector('#pv').innerHTML = G.img(photo, 'product', 'Foto barang'); } catch (x) { G.toast(x.message, 'err'); } };
    const f = m.querySelector('#sf');
    f.addEventListener('submit', e => { e.preventDefault(); G.submit(f, async () => {
      G.setName(f.seller.value.trim());
      Store.add('products', { name: f.name.value.trim(), city: f.city.checked, cityMin: f.cityMin.value.trim(), category: f.category.value, price: Math.max(0, Math.round(+f.price.value)), stock: Math.max(0, Math.round(+f.stock.value)), delivery: f.delivery.value, seller: f.seller.value.trim(), phone: f.phone.value.trim(), shop: f.hamlet.value + (f.spot.value.trim() ? ', ' + f.spot.value.trim() : ''), hours: f.hours.value.trim(), description: f.description.value.trim(), image: photo });
      m.close(); G.toast('Barang dipasang di pasar');
    }); });
  };

  /* ---------- Pesanan ---------- */
  const tabs = G.$$('[data-tab]'), PANES = ['shop', 'orders', 'store', 'city'];
  tabs.forEach(t => t.onclick = () => { tabs.forEach(x => x.classList.toggle('on', x === t)); PANES.forEach(p => $('#' + p).hidden = t.dataset.tab !== p); if (t.dataset.tab === 'orders') drawOrders(); if (t.dataset.tab === 'store') drawStore(); if (t.dataset.tab === 'city') drawCity(); });
  function orderCard(o, mine) {
    const fl = flow(o.method), idx = fl.indexOf(o.status), pickup = o.method === 'ambil', canAct = admin || (!mine && o.seller === G.name());
    return `<article class="card"><div class="row between"><b>${G.esc(o.product)} &times; ${o.qty} &bull; ${o.code}</b><span class="badge ${OST[o.status]}">${OLB[o.status]}</span></div>
      <p class="muted">${G.icon('user')} ${G.esc(o.buyer)} &rarr; ${G.esc(o.seller)} &bull; ${G.money(o.price * o.qty + o.fee)} (ongkos ${G.money(o.fee)}) &bull; ${G.date(o.created)}</p>
      <p>${G.icon(pickup ? 'pin' : 'bike')} ${pickup ? 'Datang ke toko: ' + G.esc(o.shop || '') : 'Diantar ke ' + G.esc(o.hamlet) + ': ' + G.esc(o.address)}<br><span class="muted">${G.esc(o.slot || '')} &bull; ${G.esc(o.payment || '')}</span></p>
      ${pickup && o.status !== 'batal' && o.status !== 'selesai' ? `<p class="warn-box" style="margin:.5rem 0">Kode ambil: <b style="font-size:1.3rem;letter-spacing:.2em">${G.esc(o.pickCode || '----')}</b>${o.hours ? ' &bull; toko buka ' + G.esc(o.hours) : ''}</p>` : ''}
      ${o.status === 'batal' ? '' : `<div class="stepper">${fl.map((s, i) => `<div class="st ${i <= idx ? 'done' : ''}"><i>${i <= idx ? '&#10003;' : i + 1}</i>${OLB[s]}</div>`).join('')}</div>`}
      <div class="row" style="margin-top:.6rem">${canAct && o.status !== 'batal' && o.status !== 'selesai' ? `<span class="muted">Penjual:</span>${fl.slice(1).map(s => `<button class="btn btn-ghost btn-sm" data-o="${o.id}" data-s="${s}">${OLB[s]}</button>`).join('')}<button class="btn btn-ghost btn-sm" data-o="${o.id}" data-s="batal">Batalkan</button>` : ''}
      ${(() => { const n = Store.all('ordermsgs').filter(m => m.orderId === o.id).length, rv = Store.all('reviews').some(r => r.orderId === o.id); return `<button class="btn btn-ghost btn-sm" data-chat="${o.id}" type="button">${G.icon('chat')}Chat (${n})</button>${mine && o.status === 'selesai' && !rv ? `<button class="btn btn-primary btn-sm" data-rate="${o.id}" type="button">${G.icon('check')}Beri ulasan</button>` : ''}`; })()}
      ${mine && o.status === 'baru' ? `<button class="btn btn-ghost btn-sm" data-o="${o.id}" data-s="batal">${G.icon('x')}Batalkan pesanan saya</button>` : ''}</div></article>`;
  }
  function drawOrders() {
    const me = G.name(), all = Store.all('orders').slice().reverse();
    const sets = { mine: all.filter(o => o.buyer === me), incoming: all.filter(o => o.seller === me), all };
    const rows = sets[view] || [];
    $('#orders').innerHTML = `<div class="tabs"><button class="tab ${view === 'mine' ? 'on' : ''}" data-v="mine" type="button">Pesanan saya</button><button class="tab ${view === 'incoming' ? 'on' : ''}" data-v="incoming" type="button">Pesanan masuk (penjual)</button>${admin ? `<button class="tab ${view === 'all' ? 'on' : ''}" data-v="all" type="button">Semua (petugas)</button>` : ''}</div>
      ${me ? '' : '<p class="muted" style="margin-bottom:1rem">Isi nama di Profil atau saat memesan agar pesanan Anda tampil di sini.</p>'}
      <div class="stack">${rows.map(o => orderCard(o, view === 'mine')).join('') || G.empty('truck', view === 'incoming' ? 'Belum ada pesanan masuk untuk barang Anda.' : 'Belum ada pesanan.')}</div>`;
  }
  $('#orders').addEventListener('click', e => {
    const v = e.target.closest('[data-v]'); if (v) { view = v.dataset.v; return drawOrders(); }
    const b = e.target.closest('[data-o]'); if (!b) return;
    const o = Store.all('orders').find(x => x.id === +b.dataset.o); if (!o || o.status === 'batal') return;
    if (b.dataset.s === 'batal') { const p = Store.all('products').find(x => x.id === o.productId); if (p) Store.update('products', p.id, { stock: p.stock + o.qty }); }
    Store.update('orders', o.id, { status: b.dataset.s }); G.toast('Pesanan diperbarui');
  });

  /* ---------- Chat per pesanan, ulasan, dasbor toko, jual ke kota ---------- */
  function chatModal(id) {
    const o = Store.all('orders').find(x => x.id === id); if (!o) return;
    const m = G.modal(`<h2>${G.icon('chat')} Chat pesanan ${o.code}</h2><p class="muted">${G.esc(o.buyer)} dan ${G.esc(o.seller)} &bull; ${G.esc(o.product)}</p><div class="chat-box" id="ocb" style="height:40vh"></div><form class="row" style="margin-top:.7rem;flex-wrap:nowrap"><input name="t" maxlength="300" placeholder="Tulis pesan" autocomplete="off" aria-label="Pesan"><button class="btn btn-primary" type="submit">${G.icon('send')}Kirim</button></form>`, true);
    const draw2 = () => { const me = G.name(); m.querySelector('#ocb').innerHTML = Store.all('ordermsgs').filter(x => x.orderId === id).map(x => `<div class="msg ${x.author === me ? 'me' : ''}"><span class="initial" style="background:${G.color(x.author)}">${G.init2(x.author)}</span><div class="bubble"><small>${x.author === me ? 'Anda' : G.esc(x.author)} &bull; ${G.date(x.created)}</small>${G.esc(x.body)}</div></div>`).join('') || '<p class="muted" style="text-align:center">Belum ada pesan.</p>'; const b = m.querySelector('#ocb'); b.scrollTop = b.scrollHeight; };
    draw2(); const h = () => { if (document.body.contains(m)) draw2(); }; addEventListener('gx:ordermsgs', h);
    m.querySelector('form').onsubmit = async e => { e.preventDefault(); const f = e.target, who = await G.askName(); if (!who || !f.t.value.trim()) return; Store.add('ordermsgs', { orderId: id, author: who, body: f.t.value.trim() }); f.t.value = ''; };
  }
  function rateModal(id) {
    const o = Store.all('orders').find(x => x.id === id); let n = 5;
    const m = G.modal(`<h2>Ulasan untuk ${G.esc(o.product)}</h2><div class="row" id="st" style="font-size:2rem;gap:.2rem;margin:.5rem 0"></div><form><div class="field"><textarea name="t" maxlength="200" placeholder="Ceritakan pengalaman Anda (opsional)"></textarea></div><button class="btn btn-primary" type="submit">Kirim ulasan</button></form>`);
    const dr = () => { m.querySelector('#st').innerHTML = [1, 2, 3, 4, 5].map(i => `<button type="button" data-s="${i}" class="btn btn-ghost btn-sm" style="font-size:1.6rem;color:${i <= n ? '#f5b800' : '#cfd5e6'};min-height:46px" aria-label="${i} bintang">\u2605</button>`).join(''); };
    dr(); m.querySelector('#st').onclick = e => { const b = e.target.closest('[data-s]'); if (b) { n = +b.dataset.s; dr(); } };
    m.querySelector('form').onsubmit = e => { e.preventDefault(); Store.add('reviews', { productId: o.productId, orderId: id, buyer: o.buyer, stars: n, text: e.target.t.value.trim() }); m.close(); G.toast('Terima kasih atas ulasan Anda'); drawOrders(); draw(); };
  }
  function drawStore() {
    const me = G.name(); if (!me) { $('#store').innerHTML = `<div class="card">${G.empty('user', 'Isi nama Anda (menu Profil) agar toko Anda tampil di sini.')}<div class="row" style="justify-content:center"><button class="btn btn-primary" id="stName" type="button">Isi nama</button></div></div>`; return; }
    const mine = Store.all('products').filter(p => p.seller === me), os = Store.all('orders').filter(o => o.seller === me), done = os.filter(o => o.status === 'selesai'), rev = done.reduce((s, o) => s + o.price * o.qty, 0), by = {}; done.forEach(o => by[o.product] = (by[o.product] || 0) + o.price * o.qty);
    const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5), k = d.toDateString(); return { l: d.toLocaleDateString('id-ID', { weekday: 'short' }), v: done.filter(o => new Date(o.created).toDateString() === k).reduce((s, o) => s + o.price * o.qty, 0) }; }), mx = Math.max(1, ...days.map(d => d.v));
    $('#store').innerHTML = `<div class="kpi">${[['Barang dijual', mine.length, 'store'], ['Pesanan masuk', os.length, 'truck'], ['Pesanan selesai', done.length, 'check'], ['Pendapatan', G.money(rev), 'coin']].map(([l, v, ic]) => `<div class="card"><span class="cat-ic">${G.icon(ic)}</span><div><span class="muted">${l}</span><b>${v}</b></div></div>`).join('')}</div>
      <div class="split"><div class="card"><h3>Penjualan 7 hari</h3><svg viewBox="0 0 420 180" class="chart" role="img" aria-label="Grafik penjualan">${days.map((d, i) => `<rect class="bar" x="${20 + i * 56}" y="${150 - d.v / mx * 120}" width="36" height="${d.v / mx * 120}" rx="6" fill="#f08c00"><title>${G.money(d.v)}</title></rect><text x="${38 + i * 56}" y="170" text-anchor="middle" font-size="12" fill="#5e6780">${d.l}</text>`).join('')}</svg></div>
      <div class="card"><h3>Barang terlaris</h3>${Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, v]) => `<div class="row between"><span>${G.esc(n)}</span><b>${G.money(v)}</b></div>`).join('') || '<p class="muted">Belum ada penjualan selesai.</p>'}<h3 style="margin-top:1rem">Stok menipis</h3>${mine.filter(p => p.stock <= 5).map(p => `<div class="row between"><span>${G.esc(p.name)}</span><span class="badge b-bad">${p.stock}</span></div>`).join('') || '<p class="muted">Semua stok aman.</p>'}${verified(me) ? '<p class="badge b-ok" style="margin-top:.8rem">Toko Anda terverifikasi</p>' : '<p class="muted" style="margin-top:.8rem">Minta admin desa memverifikasi toko Anda agar tampil terpercaya.</p>'}</div></div>`;
  }
  const CITY_ST = ['baru', 'diproses', 'selesai'];
  function drawCity() {
    const items = Store.all('products').filter(p => p.city), reqs = Store.all('cityreq').slice().reverse();
    $('#city').innerHTML = `<div class="split"><div class="card"><h2>Pembeli dari kota</h2><p class="muted" style="margin-bottom:.8rem">Warung, toko, atau pembeli di luar desa dapat meminta penawaran langsung dari penjual desa. Hasil bumi dan kerajinan desa dijual ke kota agar ekonomi desa berkembang.</p><form id="cf2"><div class="msg-err" role="alert"></div><div class="two"><div class="field"><label>Nama / usaha</label><input name="b" required></div><div class="field"><label>HP / WhatsApp</label><input name="c" inputmode="tel" required></div></div><div class="field"><label>Barang yang dicari</label><input name="p" list="cityitems" required placeholder="Contoh: Kopi arabika"><datalist id="cityitems">${items.map(p => `<option value="${G.esc(p.name)}">`).join('')}</datalist></div><div class="field"><label>Jumlah per pesanan</label><input name="q" required placeholder="Contoh: 50 kg"></div><div class="field"><label>Catatan</label><textarea name="n"></textarea></div><button class="btn btn-primary btn-block" type="submit">${G.icon('send')}Kirim permintaan</button></form></div>
      <div class="stack"><div class="card"><h3>Barang yang bisa dikirim ke kota</h3>${items.map(p => `<div class="row between"><span><b>${G.esc(p.name)}</b> <span class="muted">${G.esc(p.seller)}${p.cityMin ? ' &bull; min ' + G.esc(p.cityMin) : ''}</span></span><b>${G.money(p.price)}</b></div>`).join('') || '<p class="muted">Penjual dapat menandai barangnya saat menjual.</p>'}</div>
      ${reqs.map(r => `<article class="card"><div class="row between"><b>${G.esc(r.product)} &bull; ${G.esc(r.qty)}</b><span class="badge ${r.status === 'selesai' ? 'b-ok' : r.status === 'diproses' ? 'b-info' : 'b-warn'}">${r.status}</span></div><p class="muted">${G.esc(r.buyer)} &bull; ${G.esc(r.contact)} &bull; ${G.date(r.created)}</p>${r.note ? `<p class="pre">${G.esc(r.note)}</p>` : ''}${admin ? `<div class="row">${CITY_ST.map(s => `<button class="btn btn-ghost btn-sm" data-cs="${r.id}" data-s="${s}" type="button">${s}</button>`).join('')}</div>` : ''}</article>`).join('')}</div></div>`;
    $('#cf2').onsubmit = e => { e.preventDefault(); const f = e.target; Store.add('cityreq', { buyer: f.b.value.trim(), contact: f.c.value.trim(), product: f.p.value.trim(), qty: f.q.value.trim(), note: f.n.value.trim(), status: 'baru' }); G.toast('Permintaan terkirim ke penjual desa'); drawCity(); };
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-chat]'), r = e.target.closest('[data-rate]'), cs = e.target.closest('[data-cs]');
    if (c) chatModal(+c.dataset.chat); if (r) rateModal(+r.dataset.rate);
    if (cs && admin) { Store.update('cityreq', +cs.dataset.cs, { status: cs.dataset.s }); drawCity(); }
    if (e.target.closest('#stName')) G.askName().then(drawStore);
  });
  addEventListener('gx:reviews', () => { draw(); }); addEventListener('gx:verifications', draw);
  addEventListener('gx:products', draw); addEventListener('gx:orders', () => { if (!$('#orders').hidden) drawOrders(); });
  addEventListener('storage', e => { if (e.key === 'gx_products') draw(); if (e.key === 'gx_orders' && !$('#orders').hidden) drawOrders(); });
  draw();
})();
