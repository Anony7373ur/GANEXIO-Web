/* Pesan, permohonan surat, dan laporan/pengaduan. Laporan wajib disertai pernyataan jujur dan menyebut pihak/lokasi terkait.
   Setelah diverifikasi, petugas langsung mendatangi pihak terkait (status "ditangani"). Semua data tersimpan di peramban (bekerja tanpa internet). */
(() => {
  G.init('messages');
  const $ = G.$, admin = G.role() === 'admin';
  const KINDS = {
    surat: ['Jenis surat', ['Surat Keterangan Domisili', 'Surat Keterangan Tidak Mampu', 'Surat Keterangan Usaha', 'Surat Pengantar KTP/KK', 'Surat Keterangan Kelahiran', 'Surat Keterangan Kematian', 'Surat Pengantar Nikah', 'Lainnya']],
    laporan: ['Kategori laporan', ['Infrastruktur (jalan, jembatan, lampu)', 'Keamanan dan ketertiban', 'Kesehatan dan gizi', 'Lingkungan dan sampah', 'Listrik dan air bersih', 'Jaringan dan internet', 'Pendidikan', 'Pertanian, hama, dan irigasi', 'Bantuan sosial tidak tepat sasaran', 'Penyalahgunaan CCTV atau data warga', 'Kekerasan, perundungan, atau pelecehan', 'Dana desa dan pelayanan perangkat desa', 'Lainnya (tulis di isi laporan)']]
  };
  const TN = { pesan: 'Pesan', surat: 'Permohonan Surat', laporan: 'Laporan' };
  const BADGE = { baru: 'b-warn', dibaca: 'b-info', ditangani: 'b-vio', selesai: 'b-ok' };
  const FLOW = { laporan: [['baru', 'Terkirim'], ['dibaca', 'Diverifikasi'], ['ditangani', 'Petugas mendatangi pihak terkait'], ['selesai', 'Selesai']], other: [['baru', 'Terkirim'], ['dibaca', 'Dibaca petugas'], ['selesai', 'Selesai']] };
  $('#ham').innerHTML = CONFIG.village.hamlets.map(h => `<option>${G.esc(h.name)}</option>`).join('');
  $('#nm').value = G.name(); $('#ph').value = G.profile().phone || ''; $('#tgl').value = new Date().toISOString().slice(0, 10); $('#tgl').max = $('#tgl').value;
  if (admin) $('#inboxTab').hidden = false;
  let photo = '';

  function setType() {
    const t = $('#f').type.value, k = KINDS[t];
    $('#targetF').hidden = t !== 'pesan'; $('#kindF').hidden = !k; $('#repF').hidden = t !== 'laporan';
    if (k) { $('#kindL').textContent = k[0]; $('#kind').innerHTML = k[1].map(x => `<option>${G.esc(x)}</option>`).join(''); }
  }
  $('#types').addEventListener('change', setType); setType();
  $('#fl').onchange = async e => { try { photo = e.target.files[0] ? await G.resizeImage(e.target.files[0], 800, .72) : ''; $('#flp').src = photo; $('#flp').hidden = !photo; } catch (x) { G.toast(x.message, 'err'); } };

  const fl = t => FLOW[t.type === 'laporan' ? 'laporan' : 'other'];
  const stepper = t => { const f = fl(t), idx = f.findIndex(s => s[0] === t.status); return `<div class="stepper">${f.map(([, l], i) => `<div class="st ${i <= idx ? 'done' : ''}"><i>${i <= idx ? '&#10003;' : i + 1}</i>${l}</div>`).join('')}</div>`; };
  function card(t, staff) {
    const x = t.extra || {}, hist = t.history || [], at = s => (hist.find(h => h.status === s) || {}).at;
    return `<article class="card" style="box-shadow:none"><div class="row between"><b>${G.esc(t.subject)}</b><span class="badge ${BADGE[t.status]}">${t.status}</span></div>
      <p class="muted">${t.code} &bull; ${TN[t.type]}${x.jenis ? ' &bull; ' + G.esc(x.jenis) : ''} &bull; untuk ${t.target === 'admin' ? 'Admin Desa' : 'Developer'} &bull; ${G.date(t.created)}</p>
      ${staff ? `<p class="muted">${G.icon('user')} ${G.esc(t.name)} ${t.phone ? '(' + G.esc(t.phone) + ') <a href="' + G.wa(t.phone) + '" target="_blank" rel="noopener">WhatsApp</a>' : ''}</p>` : ''}
      <p class="pre">${G.esc(t.body)}</p>
      ${t.type === 'laporan' ? `<div class="stack" style="gap:.2rem;margin:.4rem 0"><span class="muted">${G.icon('pin')} ${G.esc(x.dusun || '-')} &bull; kejadian ${G.esc(x.tanggal || '-')}</span><span>${G.icon('user')} Pihak/lokasi terkait: <b>${G.esc(x.pihak || '-')}</b></span>${x.jujur ? `<span class="badge b-ok">${G.icon('check')} Pelapor menyatakan jujur</span>` : ''}</div>` : ''}
      ${x.image ? `<div class="photo" style="max-width:260px;margin:.4rem 0">${G.img(x.image, 'photo', 'Foto pendukung')}</div>` : ''}
      ${stepper(t)}
      ${t.type === 'laporan' && t.status === 'ditangani' ? `<p class="warn-box" style="margin-top:.5rem">Petugas desa sedang/sudah mendatangi <b>${G.esc(x.pihak || 'pihak terkait')}</b>${at('ditangani') ? ' sejak ' + G.date(at('ditangani')) : ''}.</p>` : ''}
      ${staff ? `<div class="row" style="margin-top:.6rem">${fl(t).map(([s, l]) => `<button class="btn btn-ghost btn-sm" data-t="${t.id}" data-s="${s}" type="button">${G.esc(l)}</button>`).join('')}</div>` : ''}</article>`;
  }
  function lists() {
    const me = G.name(), all = Store.all('tickets').slice().reverse(), mine = all.filter(t => t.name === me);
    $('#mine').innerHTML = mine.slice(0, 5).map(t => card(t, false)).join('') || G.empty('mail', me ? 'Anda belum mengirim layanan.' : 'Isi nama Anda pada formulir agar tiket tampil di sini.');
    if (admin) $('#inbox').innerHTML = `<div class="toolbar"><select id="ifs"><option value="">Semua status</option><option>baru</option><option>dibaca</option><option>ditangani</option><option>selesai</option></select><select id="ift"><option value="">Semua jenis</option><option value="pesan">Pesan</option><option value="surat">Surat</option><option value="laporan">Laporan</option></select></div><div class="stack" id="ilist"></div>`, inboxList();
  }
  function inboxList() {
    const el = $('#ilist'); if (!el) return; const s = $('#ifs').value, ty = $('#ift').value;
    el.innerHTML = Store.all('tickets').slice().reverse().filter(t => (!s || t.status === s) && (!ty || t.type === ty)).map(t => card(t, true)).join('') || G.empty('mail', 'Kotak masuk kosong.');
  }

  $('#f').addEventListener('submit', e => { e.preventDefault(); G.submit(e.target, async () => {
    const f = e.target, type = f.type.value, id = G.nextId('tickets'), kind = KINDS[type] ? f.kind.value : '', now = new Date().toISOString();
    const x = { jenis: kind, image: photo };
    if (type === 'laporan') {
      if (!f.pihak.value.trim()) throw new Error('Tulis pihak atau lokasi terkait yang akan didatangi petugas.');
      if (!f.jujur.checked) throw new Error('Pernyataan jujur wajib dicentang untuk mengirim laporan.');
      if (f.body.value.trim().length < 20) throw new Error('Jelaskan laporan dengan lebih rinci (minimal 20 huruf).');
      Object.assign(x, { dusun: f.dusun.value, tanggal: f.tanggal.value, pihak: f.pihak.value.trim(), jujur: true });
    }
    const target = type === 'pesan' ? f.target.value : (kind.startsWith('Jaringan') ? 'developer' : 'admin');
    G.setName(f.name.value.trim());
    const t = Store.add('tickets', { code: G.code('TKT', id), type, target, subject: f.subject.value.trim(), body: f.body.value.trim(), name: f.name.value.trim(), phone: f.phone.value.trim(), extra: x, status: 'baru', history: [{ status: 'baru', at: now }] });
    f.subject.value = ''; f.body.value = ''; f.pihak.value = ''; f.jujur.checked = false; f.fl.value = ''; photo = ''; $('#flp').hidden = true;
    const m = G.modal(`<h2>${G.icon('check')} Terkirim</h2><p>Kode tiket Anda:</p><p class="price" style="font-size:1.6rem;margin:.5rem 0">${t.code}</p><p class="muted">${type === 'laporan' ? 'Setelah diverifikasi, petugas akan langsung mendatangi pihak terkait.' : 'Simpan kode ini untuk melacak jawaban.'}</p><button class="btn btn-primary" data-cp type="button">${G.icon('copy')}Salin Kode</button>`);
    m.querySelector('[data-cp]').onclick = () => G.copy(t.code);
  }); });
  $('#tf').addEventListener('submit', e => {
    e.preventDefault(); const c = $('#tc').value.trim().toUpperCase(), t = Store.all('tickets').find(x => x.code === c);
    $('#tres').innerHTML = t ? card(t, false) : `<div class="card">${G.empty('search', 'Kode tiket tidak ditemukan. Periksa penulisannya.')}</div>`;
  });
  $('#inbox').addEventListener('click', e => {
    const b = e.target.closest('[data-t]'); if (!b || !admin) return; const now = new Date().toISOString();
    Store.update('tickets', +b.dataset.t, t => ({ status: b.dataset.s, history: [...(t.history || []), { status: b.dataset.s, at: now }] })); G.toast('Status tiket diperbarui');
  });
  $('#inbox').addEventListener('change', inboxList);
  const tabs = G.$$('[data-tab]');
  tabs.forEach(t => t.onclick = () => { tabs.forEach(x => x.classList.toggle('on', x === t)); ['form', 'track', 'inbox'].forEach(id => $('#' + id).hidden = id !== t.dataset.tab); });
  addEventListener('gx:tickets', lists); lists();
})();
