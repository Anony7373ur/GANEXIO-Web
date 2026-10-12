/* Kontak penting. Isi diatur di js/config.js bagian "contacts" dan "officials". */
(() => {
  G.init('contacts');
  const $ = G.$, C = CONFIG.contacts;
  $('#emerg').innerHTML = C.emergency.map((e, i) => `<a href="${G.tel(e.number)}" style="animation:fadeUp .5s ${i * 60}ms both"><span class="cat-ic" style="--c1:#d7263d;--c2:#ff5c6c">${G.icon(e.ic)}</span><div><b>${e.number}</b><span class="muted">${G.esc(e.name)}</span></div></a>`).join('');
  const actions = (phone, email) => `<div class="row" style="margin-top:.8rem">${phone ? `<a class="btn btn-primary btn-sm" href="${G.tel(phone)}">${G.icon('phone')}Telepon</a><a class="btn btn-ghost btn-sm" href="${G.wa(phone)}" target="_blank" rel="noopener">${G.icon('chat')}WhatsApp</a><button class="btn btn-ghost btn-sm" data-cp="${G.esc(phone)}" type="button" aria-label="Salin nomor">${G.icon('copy')}</button>` : ''}${email ? `<a class="btn btn-ghost btn-sm" href="mailto:${G.esc(email)}">${G.icon('mail')}Email</a>` : ''}</div>`;
  $('#desa').innerHTML = CONFIG.officials.map(o => `<article class="card lift team">${G.img(o.photo, 'profile', o.name, 'avatar')}<h3>${G.esc(o.name)}</h3><span class="badge b-info">${G.esc(o.role)}</span><p class="muted" style="margin-top:.4rem">${G.esc(o.phone)}</p>${actions(o.phone)}</article>`).join('');
  $('#luar').innerHTML = C.external.map(o => `<article class="card lift"><h3>${G.esc(o.name)}</h3><p class="muted">${G.esc(o.role)}</p><p style="margin-top:.3rem">${G.esc(o.phone)}</p>${actions(o.phone, o.email)}</article>`).join('');
  document.addEventListener('click', e => { const b = e.target.closest('[data-cp]'); if (b) G.copy(b.dataset.cp); });
})();
