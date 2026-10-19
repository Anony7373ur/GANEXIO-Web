/* Forum dan obrolan. Forum mendukung foto dan lokasi terkini; semua data tersimpan di peramban (bekerja tanpa internet).
   Lokasi: memakai GPS perangkat bila diizinkan (GPS tidak butuh internet); jika tidak tersedia, pilih dusun/lokasi manual. */
(() => {
  G.init('community');
  const $ = G.$, admin = G.role() === 'admin', CATS = ['Pengumuman', 'Pertanian', 'Kesehatan', 'Pendidikan', 'Pasar', 'Keamanan', 'Umum'];
  const ROOMS = [['umum', 'Umum', 'users'], ['pasar', 'Pasar', 'store'], ['darurat', 'Darurat', 'alert'], ['info', 'Pengumuman', 'flag']];
  $('#fc').innerHTML = CATS.map(c => `<option>${c}</option>`).join('');
  $('#fcat').innerHTML = '<option value="">Semua kelompok</option>' + CATS.map(c => `<option>${c}</option>`).join('');
  let photo = '', loc = null;

  /* ---------- Lampiran: foto dan lokasi ---------- */
  function drawAttach() {
    $('#attach').innerHTML = `${photo ? `<div class="photo" style="max-width:240px;margin-bottom:.5rem">${G.img(photo, 'photo', 'Foto lampiran')}</div><button class="btn btn-ghost btn-sm" id="rmPhoto" type="button">${G.icon('x')}Hapus foto</button> ` : ''}${loc ? `<span class="badge b-info">${G.icon('pin')} ${G.esc(loc.label)}</span> <button class="btn btn-ghost btn-sm" id="rmLoc" type="button">${G.icon('x')}Hapus lokasi</button>` : ''}`;
  }
  $('#attach').addEventListener('click', e => { if (e.target.closest('#rmPhoto')) { photo = ''; $('#fimg').value = ''; } if (e.target.closest('#rmLoc')) loc = null; drawAttach(); });
  $('#fimg').onchange = async e => { try { photo = await G.resizeImage(e.target.files[0], 800, .72); drawAttach(); } catch (x) { G.toast(x.message, 'err'); } };
  function pickManual() {
    const m = G.modal(`<h2>${G.icon('pin')} Pilih lokasi</h2><p class="muted" style="margin-bottom:.8rem">GPS tidak tersedia atau tidak diizinkan. Pilih lokasi Anda secara manual.</p><form><div class="field"><label for="lp">Dusun</label><select id="lp" name="d">${CONFIG.village.hamlets.map(h => `<option>${G.esc(h.name)}</option>`).join('')}</select></div><div class="field"><label for="lq">Patokan (opsional)</label><input id="lq" name="s" maxlength="60" placeholder="Contoh: dekat balai desa"></div><button class="btn btn-primary" type="submit">${G.icon('check')}Pakai lokasi ini</button></form>`);
    m.querySelector('form').onsubmit = e => { e.preventDefault(); const f = e.target; loc = { label: f.d.value + (f.s.value.trim() ? ', ' + f.s.value.trim() : '') }; m.close(); drawAttach(); };
  }
  $('#locBtn').onclick = () => {
    if (!navigator.geolocation) return pickManual();
    G.toast('Mencari lokasi...');
    navigator.geolocation.getCurrentPosition(p => { loc = { label: `Koordinat ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)} (akurasi ${Math.round(p.coords.accuracy)} m)`, lat: p.coords.latitude, lng: p.coords.longitude }; drawAttach(); G.toast('Lokasi terkini ditambahkan'); }, () => pickManual(), { timeout: 8000, maximumAge: 60000 });
  };

  /* ---------- Forum ---------- */
  const locChip = l => l ? `<span class="badge b-info">${G.icon('pin')} ${G.esc(l.label)}</span>` : '';
  function posts() {
    const q = $('#q').value.trim().toLowerCase(), c = $('#fcat').value, so = $('#fso').value;
    const rows = Store.all('posts').filter(p => (!c || p.category === c) && (!q || (p.title + p.body).toLowerCase().includes(q)));
    rows.sort((a, b) => so === 'pop' ? b.likes + b.replies.length - a.likes - a.replies.length : new Date(b.created) - new Date(a.created));
    $('#posts').innerHTML = rows.length ? rows.map(p => `<article class="card post lift" data-id="${p.id}" tabindex="0" role="button">
      <div class="row between"><span class="badge b-vio">${G.esc(p.category)}</span><span class="muted">${G.ago(p.created)}</span></div>
      <h3 style="margin-top:.4rem">${G.esc(p.title)}</h3>${p.image ? `<div class="photo" style="margin:.5rem 0">${G.img(p.image, 'photo', p.title)}</div>` : ''}
      <p class="pre muted">${G.esc(p.body.slice(0, 150))}${p.body.length > 150 ? '...' : ''}</p>
      <p class="muted" style="margin-top:.3rem">${G.icon('user')} ${G.esc(p.author)} &bull; ${G.icon('heart')} ${p.likes} &bull; ${G.icon('chat')} ${p.replies.length} balasan ${locChip(p.loc)}</p></article>`).join('') : G.empty('book', 'Belum ada tulisan yang cocok.');
  }
  $('#ff').addEventListener('submit', e => { e.preventDefault(); G.submit(e.target, async () => {
    const who = await G.askName(); if (!who) throw new Error('Nama diperlukan untuk menulis.');
    const f = e.target; Store.add('posts', { title: f.title.value.trim(), body: f.body.value.trim(), category: f.category.value, author: who, image: photo, loc, likes: 0, likedBy: [], replies: [] });
    f.title.value = ''; f.body.value = ''; photo = ''; loc = null; $('#fimg').value = ''; drawAttach(); G.toast('Tulisan terkirim');
  }); });
  function thread(id) {
    const p = Store.all('posts').find(x => x.id === id); if (!p) return;
    const m = G.modal(`<h2>${G.esc(p.title)}</h2><p class="muted">${G.esc(p.author)} &bull; ${G.date(p.created)} &bull; <span class="badge b-vio">${G.esc(p.category)}</span> ${locChip(p.loc)}</p>
      ${p.image ? `<div class="photo" style="margin:.8rem 0">${G.img(p.image, 'photo', p.title)}</div>` : ''}<p class="pre" style="margin:.8rem 0">${G.esc(p.body)}</p>
      <div class="row"><button class="btn btn-ghost btn-sm" data-like type="button">${G.icon('heart')} Suka (${p.likes})</button>${p.loc && p.loc.lat ? `<a class="btn btn-ghost btn-sm" href="https://www.google.com/maps?q=${p.loc.lat},${p.loc.lng}" target="_blank" rel="noopener">${G.icon('map')}Lihat di peta</a>` : ''}${admin ? `<button class="btn btn-ghost btn-sm" data-del type="button">${G.icon('trash')}Hapus (petugas)</button>` : ''}</div>
      <h3 style="margin:1rem 0 .3rem">Balasan (${p.replies.length})</h3>${p.replies.map(r => `<div class="reply"><b>${G.esc(r.author)}</b> <span class="muted">${G.ago(r.at)}</span><p class="pre">${G.esc(r.body)}</p></div>`).join('') || '<p class="muted">Belum ada balasan.</p>'}
      <form id="rf"><div class="msg-err" role="alert"></div><div class="field" style="margin-top:.8rem"><textarea name="body" placeholder="Tulis balasan..." required></textarea></div><button class="btn btn-primary" type="submit">${G.icon('send')}Balas</button></form>`, true);
    m.querySelector('[data-like]').onclick = async () => { const who = await G.askName(); if (!who) return; Store.update('posts', id, x => x.likedBy.includes(who) ? { likes: x.likes - 1, likedBy: x.likedBy.filter(n => n !== who) } : { likes: x.likes + 1, likedBy: [...x.likedBy, who] }); m.close(); thread(id); };
    const d = m.querySelector('[data-del]'); if (d) d.onclick = async () => { if (await G.confirm('Hapus tulisan ini? (moderasi petugas)')) { Store.remove('posts', id); m.close(); G.toast('Tulisan dihapus'); } };
    m.querySelector('#rf').onsubmit = e => { e.preventDefault(); G.submit(e.target, async () => { const who = await G.askName(); if (!who) throw new Error('Nama diperlukan untuk membalas.'); Store.update('posts', id, x => ({ replies: [...x.replies, { author: who, body: e.target.body.value.trim(), at: new Date().toISOString() }] })); m.close(); thread(id); }); };
  }
  $('#posts').addEventListener('click', e => { const c = e.target.closest('.post'); if (c) thread(+c.dataset.id); });
  $('#posts').addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('.post'); if (c) thread(+c.dataset.id); } });
  $('#q').oninput = G.debounce(posts); $('#fcat').onchange = posts; $('#fso').onchange = posts;

  /* ---------- Obrolan ---------- */
  let room = 'umum';
  $('#rooms').innerHTML = ROOMS.map(r => `<button class="tab ${r[0] === room ? 'on' : ''}" data-room="${r[0]}" type="button">${G.icon(r[2])}${r[1]}</button>`).join('');
  $('#rooms').onclick = e => { const b = e.target.closest('[data-room]'); if (!b) return; room = b.dataset.room; G.$$('#rooms .tab').forEach(x => x.classList.toggle('on', x === b)); chat(); };
  function chat() {
    const me = G.name(), rows = Store.all('chat').filter(m => m.room === room), box = $('#box');
    box.innerHTML = rows.length ? rows.map(m => `<div class="msg ${m.author === me ? 'me' : ''}"><span class="initial" style="background:${G.color(m.author)}">${G.init2(m.author)}</span><div class="bubble"><small>${m.author === me ? 'Anda' : G.esc(m.author)} &bull; ${G.date(m.created)}</small>${G.esc(m.body)}</div></div>`).join('') : '<p class="muted" style="text-align:center">Belum ada pesan. Sapa warga lain!</p>';
    box.scrollTop = box.scrollHeight;
  }
  $('#cf').addEventListener('submit', async e => {
    e.preventDefault(); const t = $('#ct'); if (!t.value.trim()) return;
    const who = await G.askName(); if (!who) return; Store.add('chat', { room, author: who, body: t.value.trim() }); t.value = '';
  });
  G.$$('[data-tab]').forEach(t => t.onclick = () => { G.$$('[data-tab]').forEach(x => x.classList.toggle('on', x === t)); $('#forum').hidden = t.dataset.tab !== 'forum'; $('#chat').hidden = t.dataset.tab !== 'chat'; if (t.dataset.tab === 'chat') chat(); });
  addEventListener('gx:posts', posts); addEventListener('gx:chat', chat);
  addEventListener('storage', e => { if (e.key === 'gx_chat') chat(); if (e.key === 'gx_posts') posts(); });
  posts();
})();
