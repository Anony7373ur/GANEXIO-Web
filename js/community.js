/* Forum dan obrolan. Data tersimpan di peramban; obrolan ikut diperbarui antar tab. */
(() => {
  G.init('community');
  const $ = G.$, CATS = ['Pengumuman', 'Pertanian', 'Kesehatan', 'Pendidikan', 'Pasar', 'Keamanan', 'Umum'];
  const ROOMS = [['umum', 'Umum', 'users'], ['pasar', 'Pasar', 'store'], ['darurat', 'Darurat', 'alert'], ['info', 'Pengumuman', 'flag']];
  $('#fc').innerHTML = CATS.map(c => `<option>${c}</option>`).join('');
  $('#fcat').innerHTML = '<option value="">Semua kelompok</option>' + CATS.map(c => `<option>${c}</option>`).join('');
  const nm = () => { $('#nm').textContent = G.name() || 'Atur nama'; };
  $('#nameBtn').onclick = () => { localStorage.removeItem('gx_name'); G.askName().then(nm); };
  nm();

  /* Forum */
  function posts() {
    const q = $('#q').value.trim().toLowerCase(), c = $('#fcat').value, so = $('#fso').value;
    const rows = Store.all('posts').filter(p => (!c || p.category === c) && (!q || (p.title + p.body).toLowerCase().includes(q)));
    rows.sort((a, b) => so === 'pop' ? b.likes + b.replies.length - a.likes - a.replies.length : new Date(b.created) - new Date(a.created));
    $('#posts').innerHTML = rows.length ? rows.map(p => `<article class="card post lift" data-id="${p.id}" tabindex="0" role="button"><div class="row between"><span class="badge b-vio">${G.esc(p.category)}</span><span class="muted">${G.ago(p.created)}</span></div>
      <h3 style="margin-top:.4rem">${G.esc(p.title)}</h3><p class="pre muted">${G.esc(p.body.slice(0, 150))}${p.body.length > 150 ? '...' : ''}</p>
      <p class="muted">${G.icon('user')} ${G.esc(p.author)} &bull; ${G.icon('heart')} ${p.likes} &bull; ${G.icon('chat')} ${p.replies.length} balasan</p></article>`).join('') : G.empty('book', 'Belum ada tulisan yang cocok.');
  }
  $('#ff').addEventListener('submit', e => { e.preventDefault(); G.submit(e.target, async () => {
    const who = await G.askName(); nm(); if (!who) throw new Error('Nama diperlukan untuk menulis.');
    const f = e.target; Store.add('posts', { title: f.title.value.trim(), body: f.body.value.trim(), category: f.category.value, author: who, likes: 0, likedBy: [], replies: [] });
    f.title.value = ''; f.body.value = ''; G.toast('Tulisan terkirim');
  }); });
  function thread(id) {
    const p = Store.all('posts').find(x => x.id === id); if (!p) return;
    const m = G.modal(`<h2>${G.esc(p.title)}</h2><p class="muted">${G.esc(p.author)} &bull; ${G.date(p.created)} &bull; <span class="badge b-vio">${G.esc(p.category)}</span></p><p class="pre" style="margin:.8rem 0">${G.esc(p.body)}</p>
      <button class="btn btn-ghost btn-sm" data-like type="button">${G.icon('heart')} Suka (${p.likes})</button><h3 style="margin:1rem 0 .3rem">Balasan (${p.replies.length})</h3>
      ${p.replies.map(r => `<div class="reply"><b>${G.esc(r.author)}</b> <span class="muted">${G.ago(r.at)}</span><p class="pre">${G.esc(r.body)}</p></div>`).join('') || '<p class="muted">Belum ada balasan.</p>'}
      <form id="rf"><div class="msg-err" role="alert"></div><div class="field" style="margin-top:.8rem"><textarea name="body" placeholder="Tulis balasan..." required></textarea></div><button class="btn btn-primary" type="submit">${G.icon('send')}Balas</button></form>`, true);
    m.querySelector('[data-like]').onclick = async () => { const who = await G.askName(); if (!who) return; nm(); Store.update('posts', id, x => x.likedBy.includes(who) ? { likes: x.likes - 1, likedBy: x.likedBy.filter(n => n !== who) } : { likes: x.likes + 1, likedBy: [...x.likedBy, who] }); m.close(); thread(id); };
    m.querySelector('#rf').onsubmit = e => { e.preventDefault(); G.submit(e.target, async () => { const who = await G.askName(); if (!who) throw new Error('Nama diperlukan untuk membalas.'); nm(); Store.update('posts', id, x => ({ replies: [...x.replies, { author: who, body: e.target.body.value.trim(), at: new Date().toISOString() }] })); m.close(); thread(id); }); };
  }
  $('#posts').addEventListener('click', e => { const c = e.target.closest('.post'); if (c) thread(+c.dataset.id); });
  $('#posts').addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('.post'); if (c) thread(+c.dataset.id); } });
  $('#q').oninput = G.debounce(posts); $('#fcat').onchange = posts; $('#fso').onchange = posts;

  /* Obrolan */
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
    const who = await G.askName(); nm(); if (!who) return;
    Store.add('chat', { room, author: who, body: t.value.trim() }); t.value = '';
  });
  G.$$('[data-tab]').forEach(t => t.onclick = () => { G.$$('[data-tab]').forEach(x => x.classList.toggle('on', x === t)); $('#forum').hidden = t.dataset.tab !== 'forum'; $('#chat').hidden = t.dataset.tab !== 'chat'; if (t.dataset.tab === 'chat') chat(); });
  addEventListener('gx:posts', posts); addEventListener('gx:chat', chat);
  addEventListener('storage', e => { if (e.key === 'gx_chat') chat(); if (e.key === 'gx_posts') posts(); });
  posts();
})();
