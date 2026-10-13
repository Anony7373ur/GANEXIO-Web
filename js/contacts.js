/* Kontak penting: darurat, pemerintah desa, pihak luar, tim developer, dan akses petugas (dipindah dari bar atas). */
(() => {
  G.init('contacts');
  const $ = G.$, C = CONFIG.contacts;
  $('#emerg').innerHTML = C.emergency.map((e, i) => `<a href="${G.tel(e.number)}" style="animation:fadeUp .5s ${i * 60}ms both"><span class="cat-ic" style="--c1:#d7263d;--c2:#ff5c6c">${G.icon(e.ic)}</span><div><b>${e.number}</b><span class="muted">${G.esc(e.name)}</span></div></a>`).join('');
  const actions = (phone, email) => `<div class="row" style="margin-top:.8rem">${phone ? `<a class="btn btn-primary btn-sm" href="${G.tel(phone)}">${G.icon('phone')}Telepon</a><a class="btn btn-ghost btn-sm" href="${G.wa(phone)}" target="_blank" rel="noopener">${G.icon('chat')}WhatsApp</a><button class="btn btn-ghost btn-sm" data-cp="${G.esc(phone)}" type="button" aria-label="Salin nomor">${G.icon('copy')}</button>` : ''}${email ? `<a class="btn btn-ghost btn-sm" href="mailto:${G.esc(email)}">${G.icon('mail')}Email</a>` : ''}</div>`;
  const person = o => `<article class="card lift team">${G.img(o.photo, 'profile', o.name, 'avatar')}<h3>${G.esc(o.name)}</h3><span class="badge b-info">${G.esc(o.role)}</span>${o.bio ? `<p class="muted" style="margin-top:.4rem">${G.esc(o.bio)}</p>` : ''}${o.note ? `<p class="muted" style="margin-top:.4rem">${G.esc(o.note)}</p>` : ''}<p class="muted" style="margin-top:.4rem">${G.esc(o.phone || '')}</p>${actions(o.phone, o.email)}</article>`;
  $('#desa').innerHTML = CONFIG.officials.map(person).join('');
  $('#team').innerHTML = CONFIG.team.map(person).join('');
  $('#luar').innerHTML = C.external.map(o => `<article class="card lift"><h3>${G.esc(o.name)}</h3><p class="muted">${G.esc(o.role)}</p><p style="margin-top:.3rem">${G.esc(o.phone)}</p>${actions(o.phone, o.email)}</article>`).join('');
  document.addEventListener('click', e => { const b = e.target.closest('[data-cp]'); if (b) G.copy(b.dataset.cp); });

  /* Akses petugas: dibuka dengan PIN, tanpa login */
  const r = G.role();
  $('#staff').innerHTML = `<div class="row between"><div><h3>${G.icon('key')} Akses petugas desa</h3><p class="muted">Khusus perangkat desa. Warga biasa tidak perlu masuk. Dana Desa tetap bisa dilihat semua warga.</p>${r ? `<span class="badge b-ok">Mode ${G.ROLE_NAME[r]} aktif</span>` : '<span class="badge">Belum masuk mode petugas</span>'}</div>
    <div class="row"><button class="btn btn-primary btn-sm" data-r="admin" type="button">${G.icon('user')}Masuk sebagai Admin Desa</button><button class="btn btn-primary btn-sm" data-r="bendahara" type="button">${G.icon('wallet')}Masuk sebagai Bendahara</button>${r ? `<button class="btn btn-ghost btn-sm" id="out" type="button">${G.icon('x')}Keluar</button>` : ''}</div></div>`;
  G.$$('#staff [data-r]').forEach(b => b.onclick = () => G.unlock(b.dataset.r));
  const out = $('#out'); if (out) out.onclick = () => { sessionStorage.removeItem('gx_role'); location.reload(); };
})();
