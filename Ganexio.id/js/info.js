/* Informasi desa. Seluruh isi diatur di js/config.js bagian "village" dan "officials". */
(() => {
  G.init('info');
  const $ = G.$, V = CONFIG.village;
  const sec = (id, title, html) => ({ id, title, html: `<section class="card" id="s-${id}"><h2>${G.esc(title)}</h2>${html}</section>` });
  const S = [
    sec('profil', 'Profil Desa', `<div class="photo" style="margin-bottom:1rem">${G.img(V.heroPhoto, 'photo', 'Foto desa')}</div>
      <p class="pre">${G.esc(V.description)}</p><p class="muted" style="margin-top:.6rem">${G.icon('pin')} ${G.esc(V.name)}, Kec. ${G.esc(V.district)}, ${G.esc(V.regency)}, ${G.esc(V.province)}</p>`),
    sec('visi', 'Visi dan Misi', `<p><b>Visi:</b> ${G.esc(V.vision)}</p><ol style="margin:.6rem 0 0 1.2rem">${V.mission.map(m => `<li>${G.esc(m)}</li>`).join('')}</ol>`),
    sec('sejarah', 'Sejarah Desa', `<div class="timeline">${V.history.map(h => `<div class="ev"><span class="badge b-info">${G.esc(h.year)}</span><h3>${G.esc(h.title)}</h3><p class="muted">${G.esc(h.text)}</p></div>`).join('')}</div>`),
    sec('wilayah', 'Wilayah dan Peta', `${V.mapEmbedUrl ? `<iframe src="${G.esc(V.mapEmbedUrl)}" title="Peta desa" loading="lazy" style="width:100%;height:320px;border:0;border-radius:14px"></iframe>` : `<div class="photo">${G.img('', 'photo', 'Peta desa')}</div><!-- TODO-ISI: isi mapEmbedUrl di js/config.js agar peta tampil -->`}
      <p style="margin-top:.8rem"><b>Dusun:</b></p><div class="chips" style="margin-top:.4rem">${V.hamlets.map(h => `<span class="chip on" style="cursor:default">${G.icon('pin')}${G.esc(h)}</span>`).join('')}</div>`),
    sec('penduduk', 'Kependudukan', `<div class="kpi" style="margin:0">${V.stats.map(s => `<div class="card" style="box-shadow:none"><div><b>${Number(s.value).toLocaleString('id-ID')}${G.esc(s.suffix)}</b><span class="muted">${G.esc(s.label)}</span></div></div>`).join('')}</div>`),
    sec('potensi', 'Potensi Desa', `<div class="grid">${V.potentials.map(p => `<article class="card" style="box-shadow:none"><div class="photo">${G.img(p.image, 'photo', p.title)}</div><h3 style="margin-top:.7rem">${G.esc(p.title)}</h3><p class="muted">${G.esc(p.text)}</p></article>`).join('')}</div>`),
    sec('fasilitas', 'Fasilitas Desa', `<div class="grid">${V.facilities.map(f => `<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="cat-ic sm">${G.icon(f.ic)}</span><div><b>${G.esc(f.title)}</b><p class="muted">${G.esc(f.text)}</p></div></div>`).join('')}</div>`),
    sec('pemerintah', 'Pemerintahan Desa', `<div class="grid team">${CONFIG.officials.map(o => `<article class="card" style="box-shadow:none">${G.img(o.photo, 'profile', o.name, 'avatar')}<h3>${G.esc(o.name)}</h3><span class="badge b-info">${G.esc(o.role)}</span></article>`).join('')}</div>`),
    sec('galeri', 'Galeri Desa', `<div class="grid">${V.gallery.map((g, i) => `<div class="photo">${G.img(g, 'photo', 'Foto desa ' + (i + 1))}</div>`).join('')}</div>`),
    sec('jam', 'Jam Pelayanan', `<table><tbody>${V.hours.map(h => `<tr><td><b>${G.esc(h.day)}</b></td><td>${G.esc(h.time)}</td></tr>`).join('')}</tbody></table>`)
  ];
  $('#nav').innerHTML = S.map(s => `<a href="#s-${s.id}">${G.esc(s.title)}</a>`).join('');
  $('#secs').innerHTML = S.map(s => s.html).join('');
})();
