/* Pasar desa: cari, beli (antar motor / ambil di toko), jual, dan kelola pesanan */
(() => {
  G.init('market');
  const $ = G.$, M = CONFIG.market;
  const OST = { baru: 'b-warn', diterima: 'b-info', diantar: 'b-vio', selesai: 'b-ok', batal: 'b-bad' };
  const DEL = { motor: ['bike', 'Diantar motor'], ambil: ['pin', 'Ambil di toko'], keduanya: ['bike', 'Motor / ambil di toko'] };
  let cat = 'Semua';
  $('#cats').innerHTML = ['Semua', ...M.categories].map(c => `<button class="chip ${c === cat ? 'on' : ''}" type="button">${G.esc(c)}</button>`).join('');
  $('#cats').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; cat = b.textContent; G.$$('#cats .chip').forEach(x => x.classList.toggle('on', x === b)); draw(); };

  function draw() {
    const q = $('#q').value.trim().toLowerCase(), dl = $('#dl').value, so = $('#sort').value;
    let rows = Store.all('products').filter(p => (cat === 'Semua' || p.category === cat) && (!q || (p.name + p.seller + p.description).toLowerCase().includes(q)) && (!dl || p.delivery === 'keduanya' || p.delivery === dl));
    rows.sort((a, b) => so === 'low' ? a.price - b.price : so === 'high' ? b.price - a.price : new Date(b.created) - new Date(a.created));
    $('#products').innerHTML = rows.length ? rows.map(p => `<article class="card prod lift">
      <div class="photo">${G.img(p.image, 'product', p.name)}</div>
      <div class="prod-body"><div class="row between"><span class="badge">${G.esc(p.category)}</span><span class="badge ${p.stock > 0 ? 'b-ok' : 'b-bad'}">${p.stock > 0 ? 'Stok ' + p.stock : 'Habis'}</span></div>
        <h3>${G.esc(p.name)}</h3><span class="price">${G.money(p.price)}</span>
        <p class="muted pre">${G.esc(p.description)}</p>
        <p class="muted">${G.icon(DEL[p.delivery][0])} ${DEL[p.delivery][1]}<br>${G.icon('user')} ${G.esc(p.seller)}<br>${G.icon('pin')} ${G.esc(p.shop)}</p>
        <div class="row" style="margin-top:auto;padding-top:.6rem">
          <button class="btn btn-primary btn-sm" data-buy="${p.id}" ${p.stock > 0 ? '' : 'disabled'}>${G.icon('basket')}Beli</button>
          ${p.phone ? `<a class="btn btn-ghost btn-sm" href="${G.wa(p.phone)}" target="_blank" rel="noopener">${G.icon('chat')}WhatsApp</a>` : ''}
          <button class="btn btn-ghost btn-sm" data-del="${p.id}" aria-label="Hapus barang">${G.icon('trash')}</button></div></div></article>`).join('') : G.empty('store', 'Belum ada barang yang cocok.');
  }
  $('#products').addEventListener('click', async e => {
    const buy = e.target.closest('[data-buy]'), del = e.target.closest('[data-del]');
    if (buy) buyModal(Store.all('products').find(p => p.id === +buy.dataset.buy));
    if (del && await G.confirm('Hapus barang ini dari pasar?')) { Store.remove('products', +del.dataset.del); G.toast('Barang dihapus'); }
  });
  $('#q').oninput = G.debounce(draw); $('#sort').onchange = draw; $('#dl').onchange = draw;

  function buyModal(p) {
    const opts = p.delivery === 'keduanya' ? ['motor', 'ambil'] : [p.delivery];
    const m = G.modal(`<h2>Beli ${G.esc(p.name)}</h2><form id="bf"><div class="msg-err" role="alert"></div>
      <div class="two"><div class="field"><label for="bn">Nama</label><input id="bn" name="name" value="${G.esc(G.name())}" required></div><div class="field"><label for="bp">Nomor HP</label><input id="bp" name="phone" inputmode="tel"></div></div>
      <div class="field"><label for="bq">Jumlah (stok ${p.stock})</label><input id="bq" name="qty" type="number" min="1" max="${p.stock}" value="1" required></div>
      <label class="lbl">Cara menerima</label><div class="choices">${opts.map((o, i) => `<label class="choice"><input type="radio" name="method" value="${o}" ${i ? '' : 'checked'}><span>${G.icon(o === 'motor' ? 'bike' : 'pin')}<b>${o === 'motor' ? 'Diantar motor' : 'Ambil di toko'}<small>${o === 'motor' ? 'Ongkos sesuai dusun' : G.esc(p.shop)}</small></b></span></label>`).join('')}</div>
      <div id="addr"><div class="field"><label for="bh">Dusun tujuan</label><select id="bh" name="hamlet">${CONFIG.village.hamlets.map(h => `<option>${G.esc(h)}</option>`).join('')}</select></div>
      <div class="field"><label for="ba">Alamat pengantaran</label><textarea id="ba" name="address" placeholder="Contoh: rumah cat hijau dekat balai desa"></textarea></div></div>
      <div class="card" style="box-shadow:none;margin-bottom:1rem"><div class="row between"><span>Harga barang</span><b id="t1"></b></div><div class="row between"><span>Ongkos antar</span><b id="t2"></b></div><div class="row between"><b>Total</b><b class="price" id="t3"></b></div></div>
      <button class="btn btn-primary btn-block" type="submit">${G.icon('check')}Pesan Sekarang</button></form>`);
    const f = m.querySelector('#bf'), fee = () => f.method.value === 'motor' ? (M.deliveryFees[f.hamlet.value] || 0) : 0;
    const upd = () => { const a = p.price * (+f.qty.value || 0), d = fee(); m.querySelector('#t1').textContent = G.money(a); m.querySelector('#t2').textContent = f.method.value === 'motor' ? G.money(d) : 'Gratis (ambil sendiri)'; m.querySelector('#t3').textContent = G.money(a + d); m.querySelector('#addr').hidden = f.method.value !== 'motor'; };
    f.addEventListener('input', upd); upd();
    f.addEventListener('submit', e => { e.preventDefault(); G.submit(f, async () => {
      const qty = Math.floor(+f.qty.value), cur = Store.all('products').find(x => x.id === p.id);
      if (!(qty >= 1) || qty > cur.stock) throw new Error('Jumlah melebihi stok yang tersedia.');
      if (f.method.value === 'motor' && !f.address.value.trim()) throw new Error('Isi alamat pengantaran.');
      localStorage.setItem('gx_name', f.name.value.trim());
      Store.update('products', p.id, { stock: cur.stock - qty });
      const id = G.nextId('orders'), o = Store.add('orders', { code: G.code('PSN', id), productId: p.id, product: p.name, price: p.price, qty, method: f.method.value, buyer: f.name.value.trim(), phone: f.phone.value.trim(), hamlet: f.hamlet.value, address: f.address.value.trim(), fee: fee(), status: 'baru' });
      m.close(); G.toast('Pesanan ' + o.code + ' dikirim ke penjual');
    }); });
  }

  $('#sellBtn').onclick = () => {
    const m = G.modal(`<h2>Jual barang</h2><form id="sf"><div class="msg-err" role="alert"></div>
      <div class="field"><label for="sn">Nama barang</label><input id="sn" name="name" maxlength="60" required></div>
      <div class="two"><div class="field"><label for="sc">Kelompok</label><select id="sc" name="category">${M.categories.map(c => `<option>${G.esc(c)}</option>`).join('')}</select></div><div class="field"><label for="sd">Cara terima</label><select id="sd" name="delivery"><option value="keduanya">Motor dan ambil di toko</option><option value="motor">Hanya diantar motor</option><option value="ambil">Hanya ambil di toko</option></select></div></div>
      <div class="two"><div class="field"><label for="sp">Harga (Rp)</label><input id="sp" name="price" type="number" min="0" inputmode="numeric" required></div><div class="field"><label for="ss">Stok</label><input id="ss" name="stock" type="number" min="1" inputmode="numeric" required></div></div>
      <div class="two"><div class="field"><label for="sl">Nama penjual</label><input id="sl" name="seller" value="${G.esc(G.name())}" required></div><div class="field"><label for="sh">Nomor WhatsApp</label><input id="sh" name="phone" inputmode="tel"></div></div>
      <div class="field"><label for="so">Lokasi toko</label><input id="so" name="shop" placeholder="Contoh: Dusun 1, depan masjid"></div>
      <div class="field"><label for="sx">Keterangan</label><textarea id="sx" name="description"></textarea></div>
      <!-- TODO-ISI: foto produk. Setelah ada server, tambahkan unggah gambar. Sementara, isi nama file gambar di folder img/ pada produk contoh (js/seed.js, kolom image). -->
      <button class="btn btn-primary btn-block" type="submit">${G.icon('plus')}Pasang di Pasar</button></form>`);
    const f = m.querySelector('#sf');
    f.addEventListener('submit', e => { e.preventDefault(); G.submit(f, async () => {
      localStorage.setItem('gx_name', f.seller.value.trim());
      Store.add('products', { name: f.name.value.trim(), category: f.category.value, price: Math.max(0, Math.round(+f.price.value)), stock: Math.max(0, Math.round(+f.stock.value)), delivery: f.delivery.value, seller: f.seller.value.trim(), phone: f.phone.value.trim(), shop: f.shop.value.trim() || '-', description: f.description.value.trim(), image: '' });
      m.close(); G.toast('Barang dipasang di pasar');
    }); });
  };

  const tabs = G.$$('[data-tab]');
  tabs.forEach(t => t.onclick = () => { tabs.forEach(x => x.classList.toggle('on', x === t)); $('#shop').hidden = t.dataset.tab !== 'shop'; $('#orders').hidden = t.dataset.tab !== 'orders'; if (t.dataset.tab === 'orders') drawOrders(); });
  function drawOrders() {
    const rows = Store.all('orders').slice().reverse();
    $('#orders').innerHTML = rows.length ? `<div class="stack">${rows.map(o => {
      const flow = ['baru', 'diterima', 'diantar', 'selesai'], idx = flow.indexOf(o.status), pickup = o.method === 'ambil';
      return `<article class="card"><div class="row between"><b>${G.esc(o.product)} &times; ${o.qty} &bull; ${o.code}</b><span class="badge ${OST[o.status]}">${o.status}</span></div>
      <p class="muted">${G.icon('user')} ${G.esc(o.buyer)} &bull; ${G.money(o.price * o.qty + o.fee)} (ongkos ${G.money(o.fee)}) &bull; ${G.date(o.created)}</p>
      <p>${G.icon(pickup ? 'pin' : 'bike')} ${pickup ? 'Diambil sendiri di toko' : 'Diantar ke ' + G.esc(o.hamlet) + ': ' + G.esc(o.address)}</p>
      ${o.status === 'batal' ? '' : `<div class="stepper">${flow.map((s, i) => `<div class="st ${i <= idx ? 'done' : ''}"><i>${i <= idx ? '&#10003;' : i + 1}</i>${s === 'diantar' && pickup ? 'siap diambil' : s}</div>`).join('')}</div>`}
      ${o.status !== 'batal' && o.status !== 'selesai' ? `<div class="row" style="margin-top:.6rem"><span class="muted">Penjual:</span>${flow.slice(1).map(s => `<button class="btn btn-ghost btn-sm" data-o="${o.id}" data-s="${s}">${s}</button>`).join('')}<button class="btn btn-ghost btn-sm" data-o="${o.id}" data-s="batal">batalkan</button></div>` : ''}</article>`; }).join('')}</div>` : G.empty('truck', 'Belum ada pesanan.');
  }
  $('#orders').addEventListener('click', e => {
    const b = e.target.closest('[data-o]'); if (!b) return;
    const o = Store.all('orders').find(x => x.id === +b.dataset.o);
    if (b.dataset.s === 'batal') { const p = Store.all('products').find(x => x.id === o.productId); if (p) Store.update('products', p.id, { stock: p.stock + o.qty }); }
    Store.update('orders', o.id, { status: b.dataset.s }); drawOrders(); G.toast('Pesanan diperbarui');
  });
  addEventListener('gx:products', draw);
  draw();
})();
