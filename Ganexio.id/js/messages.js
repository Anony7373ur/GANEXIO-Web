/* Pesan, permohonan surat, dan laporan. Setiap pengiriman mendapat kode tiket. */
(() => {
  G.init('messages');
  const $ = G.$, admin = G.role() === 'admin';
  const KINDS = {
    surat: ['Jenis surat', ['Surat Keterangan Domisili', 'Surat Keterangan Tidak Mampu', 'Surat Keterangan Usaha', 'Surat Pengantar KTP/KK', 'Surat Keterangan Kelahiran', 'Surat Keterangan Kematian', 'Lainnya']],
    laporan: ['Kategori laporan', ['Infrastruktur (jalan, jembatan)', 'Keamanan', 'Kesehatan', 'Lingkungan', 'Listrik dan air', 'Jaringan / Starlink']]
  };
  const BADGE = { baru: 'b-warn', dibaca: 'b-info', selesai: 'b-ok' }, TN = { pesan: 'Pesan', surat: 'Permohonan Surat', laporan: 'Laporan' };
  $('#ham').innerHTML = CONFIG.village.hamlets.map(h => `<option>${G.esc(h)}</option>`).join('');
  $('#nm').value = G.name();
  if (admin) $('#inboxTab').hidden = false;

  function setType() {
    const t = $('#f').type.value, k = KINDS[t];
    $('#targetF').hidden = t !== 'pesan'; $('#kindF').hidden = !k; $('#hamF').hidden = t !== 'laporan';
    if (k) { $('#kindL').textContent = k[0]; $('#kind').innerHTML = k[1].map(x => `<option>${G.esc(x)}</option>`).join(''); }
  }
  $('#types').addEventListener('change', setType); setType();

  const stepper = t => { const flow = ['baru', 'dibaca', 'selesai'], idx = flow.indexOf(t.status); return `<div class="stepper">${['Terkirim', 'Dibaca petugas', 'Selesai'].map((s, i) => `<div class="st ${i <= idx ? 'done' : ''}"><i>${i <= idx ? '&#10003;' : i + 1}</i>${s}</div>`).join('')}</div>`; };
  const card = (t, staff) => `<article class="card" style="box-shadow:none"><div class="row between"><b>${G.esc(t.subject)}</b><span class="badge ${BADGE[t.status]}">${t.status}</span></div>
    <p class="muted">${t.code} &bull; ${TN[t.type]}${t.extra.jenis ? ' &bull; ' + G.esc(t.extra.jenis) : ''}${t.extra.dusun ? ' &bull; ' + G.esc(t.extra.dusun) : ''} &bull; untuk ${t.target === 'admin' ? 'Admin Desa' : 'Developer'} &bull; ${G.date(t.created)}</p>
    ${staff ? `<p class="muted">${G.icon('user')} ${G.esc(t.name)} ${t.phone ? '(' + G.esc(t.phone) + ')' : ''}</p>` : ''}<p class="pre">${G.esc(t.body)}</p>${t.extra.file ? `<p class="muted">${G.icon('image')} Lampiran: ${G.esc(t.extra.file)}</p>` : ''}${stepper(t)}
    ${staff ? `<div class="row" style="margin-top:.6rem">${['baru', 'dibaca', 'selesai'].map(s => `<button class="btn btn-ghost btn-sm" data-t="${t.id}" data-s="${s}">${s}</button>`).join('')}</div>` : ''}</article>`;
  function lists() {
    const all = Store.all('tickets').slice().reverse();
    $('#mine').innerHTML = all.slice(0, 5).map(t => card(t, false)).join('') || G.empty('mail', 'Belum ada tiket.');
    if (admin) $('#inbox').innerHTML = all.map(t => card(t, true)).join('') || G.empty('mail', 'Kotak masuk kosong.');
  }
  $('#f').addEventListener('submit', e => { e.preventDefault(); G.submit(e.target, async () => {
    const f = e.target, type = f.type.value, id = G.nextId('tickets'), kind = KINDS[type] ? f.kind.value : '';
    const target = type === 'pesan' ? f.target.value : (kind.startsWith('Jaringan') ? 'developer' : 'admin');
    localStorage.setItem('gx_name', f.name.value.trim());
    const t = Store.add('tickets', { code: G.code('TKT', id), type, target, subject: f.subject.value.trim(), body: f.body.value.trim(), name: f.name.value.trim(), phone: f.phone.value.trim(), extra: { jenis: kind, dusun: type === 'laporan' ? f.dusun.value : '', file: f.file.files[0] ? f.file.files[0].name : '' }, status: 'baru' });
    f.subject.value = ''; f.body.value = ''; f.file.value = '';
    const m = G.modal(`<h2>${G.icon('check')} Terkirim</h2><p>Kode tiket Anda:</p><p class="price" style="font-size:1.6rem;margin:.5rem 0">${t.code}</p><p class="muted">Simpan kode ini untuk melacak jawaban di tab "Lacak Tiket".</p><button class="btn btn-primary" data-cp type="button">${G.icon('copy')}Salin Kode</button>`);
    m.querySelector('[data-cp]').onclick = () => G.copy(t.code);
  }); });
  $('#tf').addEventListener('submit', e => {
    e.preventDefault(); const c = $('#tc').value.trim().toUpperCase(), t = Store.all('tickets').find(x => x.code === c);
    $('#tres').innerHTML = t ? card(t, false) : `<div class="card">${G.empty('search', 'Kode tiket tidak ditemukan. Periksa kembali penulisannya.')}</div>`;
  });
  $('#inbox').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { Store.update('tickets', +b.dataset.t, { status: b.dataset.s }); G.toast('Status tiket diperbarui'); } });
  const tabs = G.$$('[data-tab]');
  tabs.forEach(t => t.onclick = () => { tabs.forEach(x => x.classList.toggle('on', x === t)); ['form', 'track', 'inbox'].forEach(id => $('#' + id).hidden = id !== t.dataset.tab); });
  addEventListener('gx:tickets', lists); lists();
})();
