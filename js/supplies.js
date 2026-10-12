/* Pasokan dari kota: buat permintaan, lacak, dan (mode admin) ubah status */
(() => {
  G.init('supplies');
  const $ = G.$, admin = G.role() === 'admin';
  const CAT = { pangan: ['basket', 'Bahan Pangan'], sumber_daya: ['leaf', 'Sumber Daya Alam'], bahan_bangunan: ['brick', 'Bahan Bangunan'] };
  const FLOW = ['menunggu', 'diproses', 'dikirim', 'selesai'];
  const BADGE = { menunggu: 'b-warn', diproses: 'b-info', dikirim: 'b-vio', selesai: 'b-ok', ditolak: 'b-bad' };
  const LABEL = { menunggu: 'Menunggu', diproses: 'Diproses', dikirim: 'Dikirim', selesai: 'Tiba' };
  $('#hamlet').innerHTML = CONFIG.village.hamlets.map(h => `<option>${G.esc(h)}</option>`).join('');
  let items = [{ name: '', qty: '', unit: '' }];

  const stepper = (status) => {
    const idx = FLOW.indexOf(status);
    return `<div class="stepper">${FLOW.map((s, i) => `<div class="st ${i <= idx ? 'done' : ''} ${status === 'ditolak' && i === 0 ? 'bad' : ''}"><i>${i <= idx ? '&#10003;' : i + 1}</i>${LABEL[s]}</div>`).join('')}</div>`;
  };
  $('#flowDemo').innerHTML = stepper('diproses');

  const cat = () => $('#f').category.value;
  function drawQuick() {
    $('#quick').innerHTML = CONFIG.supplyCatalog[cat()].map(([n, u]) => `<button class="chip" type="button" data-n="${G.esc(n)}" data-u="${G.esc(u)}">${G.icon('plus')}${G.esc(n)}</button>`).join('');
  }
  function drawItems() {
    $('#items').innerHTML = items.map((it, i) => `<div class="row" style="flex-wrap:nowrap;align-items:flex-end">
      <div class="field" style="flex:2;margin:0"><label>Barang</label><input data-i="${i}" data-k="name" value="${G.esc(it.name)}" maxlength="60" placeholder="Nama barang"></div>
      <div class="field" style="flex:1;margin:0"><label>Jumlah</label><input data-i="${i}" data-k="qty" type="number" min="1" step="any" value="${G.esc(it.qty)}" inputmode="decimal"></div>
      <div class="field" style="flex:1;margin:0"><label>Satuan</label><input data-i="${i}" data-k="unit" value="${G.esc(it.unit)}" maxlength="15" placeholder="kg"></div>
      ${items.length > 1 ? `<button class="btn btn-ghost btn-sm" type="button" data-rm="${i}" aria-label="Hapus barang">${G.icon('x')}</button>` : ''}</div>`).join('');
  }
  $('#items').addEventListener('input', e => { const i = e.target.dataset.i; if (i !== undefined) items[i][e.target.dataset.k] = e.target.value; });
  $('#items').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { items.splice(+b.dataset.rm, 1); drawItems(); } });
  $('#addItem').onclick = () => { items.push({ name: '', qty: '', unit: '' }); drawItems(); };
  $('#quick').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    const last = items[items.length - 1];
    if (!last.name) { last.name = b.dataset.n; last.unit = b.dataset.u; } else items.push({ name: b.dataset.n, qty: '', unit: b.dataset.u });
    drawItems();
  });
  $('#cats').addEventListener('change', () => { drawQuick(); items = [{ name: '', qty: '', unit: '' }]; drawItems(); });

  $('#f').addEventListener('submit', e => {
    e.preventDefault();
    G.submit(e.target, async () => {
      const clean = items.filter(i => i.name.trim()).map(i => ({ name: i.name.trim(), qty: Number(i.qty), unit: i.unit.trim() }));
      if (!clean.length) throw new Error('Tambahkan minimal satu barang.');
      if (clean.some(i => !(i.qty > 0) || !i.unit)) throw new Error('Isi jumlah dan satuan untuk setiap barang.');
      const who = await G.askName(); if (!who) throw new Error('Nama diperlukan agar permintaan dapat dilacak.');
      const f = e.target, id = G.nextId('supplies');
      const r = Store.add('supplies', { code: G.code('PSK', id), name: who, category: f.category.value, items: clean, urgency: f.urgency.value, hamlet: f.hamlet.value, note: f.note.value.trim(), status: 'menunggu', history: [{ status: 'menunggu', at: new Date().toISOString() }] });
      f.reset(); items = [{ name: '', qty: '', unit: '' }]; drawQuick(); drawItems();
      const m = G.modal(`<h2>${G.icon('check')} Permintaan terkirim</h2><p>Simpan kode tiket ini untuk melacak:</p><p class="price" style="font-size:1.6rem;margin:.5rem 0">${r.code}</p><div class="row"><button class="btn btn-primary" data-go type="button">Lacak Sekarang</button><button class="btn btn-ghost" data-cp type="button">${G.icon('copy')}Salin Kode</button></div>`);
      m.querySelector('[data-go]').onclick = () => { m.close(); showTab('track'); $('#q').value = r.code; renderList(); };
      m.querySelector('[data-cp]').onclick = () => G.copy(r.code);
    });
  });

  function renderKpi() {
    const all = Store.all('supplies'), c = s => all.filter(x => x.status === s).length;
    $('#kpi').innerHTML = [['Menunggu', c('menunggu'), 'clock'], ['Diproses', c('diproses'), 'refresh'], ['Dikirim', c('dikirim'), 'truck'], ['Tiba', c('selesai'), 'check']]
      .map(([l, n, ic]) => `<div class="card" style="padding:1rem"><span class="cat-ic sm">${G.icon(ic)}</span><div><b>${n}</b><span class="muted">${l}</span></div></div>`).join('');
  }
  function renderList() {
    const q = $('#q').value.trim().toLowerCase(), fs = $('#fs').value;
    const rows = Store.all('supplies').slice().reverse().filter(r => (!fs || r.status === fs) && (!q || (r.code + r.name + r.items.map(i => i.name).join(' ')).toLowerCase().includes(q)));
    $('#list').innerHTML = rows.length ? rows.map(r => `<article class="card">
      <div class="row between"><b>${G.icon(CAT[r.category][0])} ${CAT[r.category][1]} &bull; ${r.code}</b><span class="badge ${BADGE[r.status]}">${r.status}</span></div>
      <ul style="margin:.5rem 0 .3rem 1.1rem">${r.items.map(i => `<li><b>${G.esc(i.name)}</b> &mdash; ${i.qty} ${G.esc(i.unit)}</li>`).join('')}</ul>
      <p class="muted">${G.icon('pin')} ${G.esc(r.hamlet)} &bull; ${G.icon('user')} ${G.esc(r.name)} &bull; ${G.date(r.created)} ${r.urgency === 'mendesak' ? '<span class="badge b-bad">Mendesak</span>' : ''}</p>
      ${r.note ? `<p class="pre muted">Catatan: ${G.esc(r.note)}</p>` : ''}
      ${r.status === 'ditolak' ? '' : stepper(r.status)}
      ${admin ? `<div class="field" style="margin:.8rem 0 0"><label>Ubah status (mode admin)</label><select data-id="${r.id}">${[...FLOW, 'ditolak'].map(s => `<option ${s === r.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div>` : ''}</article>`).join('') : G.empty('truck', 'Belum ada permintaan yang cocok.');
  }
  $('#list').addEventListener('change', e => {
    const id = +e.target.dataset.id; if (!id) return;
    Store.update('supplies', id, r => ({ status: e.target.value, history: [...r.history, { status: e.target.value, at: new Date().toISOString() }] }));
    G.toast('Status diperbarui');
  });
  $('#q').oninput = G.debounce(renderList); $('#fs').onchange = renderList;
  const showTab = t => { G.$$('#tabs .tab').forEach(x => x.classList.toggle('on', x.dataset.tab === t)); $('#new').hidden = t !== 'new'; $('#track').hidden = t !== 'track'; if (t === 'track') renderList(); };
  G.$$('#tabs .tab').forEach(t => t.onclick = () => showTab(t.dataset.tab));
  addEventListener('gx:supplies', () => { renderKpi(); renderList(); });
  drawQuick(); drawItems(); renderKpi(); renderList();
})();
