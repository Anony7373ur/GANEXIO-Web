/* Informasi Desa Sipagabu. Seluruh isi diatur di js/config.js bagian "village" dan "officials". Peta skematik dibuat di halaman (tanpa internet). */
(() => {
  G.init('info');
  const $ = G.$, V = CONFIG.village;
  const sec = (id, title, html) => ({ id, title, html: `<section class="card" id="s-${id}"><h2>${G.esc(title)}</h2>${html}</section>` });
  const kv = rows => `<div class="table-wrap"><table><tbody>${rows.map(([k, v]) => `<tr><td style="width:42%"><b>${G.esc(k)}</b></td><td>${G.esc(v)}</td></tr>`).join('')}</tbody></table></div>`;

  /* Peta skematik: posisi dusun hanya perkiraan untuk ilustrasi. TODO-ISI: sesuaikan dengan peta resmi desa. */
  const POS = [[190, 120], [330, 95], [470, 130], [610, 105], [250, 250], [420, 270], [560, 240], [700, 280]];
  function mapSvg() {
    return `<svg class="map-svg" viewBox="0 0 820 360" role="img" aria-label="Peta skematik dusun ${G.esc(V.name)}">
      <rect width="820" height="360" rx="18" fill="#eaf4ec"/><path d="M0 300q120-60 240-20t260 10 320-40V360H0z" fill="#cfe6d3"/>
      <path d="M0 200q150-30 260 20t250-10 310 30" fill="none" stroke="#7fb8e6" stroke-width="16" stroke-linecap="round" opacity=".7"/>
      <path d="M170 120L330 95 470 130 610 105M250 250L420 270 560 240 700 280M190 120L250 250M330 95L420 270M470 130L560 240M610 105L700 280" stroke="#b9a37c" stroke-width="4" stroke-dasharray="8 7" fill="none"/>
      ${V.hamlets.map((h, i) => { const [x, y] = POS[i % POS.length]; return `<g class="hm" data-i="${i}" tabindex="0" role="button" aria-label="${G.esc(h.name)}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="22" fill="${i === 0 ? '#d7263d' : '#1e6fef'}" opacity=".18"><animate attributeName="r" values="20;28;20" dur="3s" repeatCount="indefinite"/></circle><circle cx="${x}" cy="${y}" r="13" fill="${i === 0 ? '#d7263d' : '#1e6fef'}" stroke="#fff" stroke-width="3"/><text x="${x}" y="${y + 38}" text-anchor="middle" font-size="13" font-weight="700" fill="#14213d">${G.esc(h.name.replace('Dusun ', ''))}</text></g>`; }).join('')}
      <text x="16" y="342" font-size="12" fill="#5e6780">Peta skematik (bukan skala). Jalan dan sungai hanya ilustrasi.</text></svg>`;
  }
  const S = [
    sec('profil', 'Profil Desa', `<div class="photo" style="margin-bottom:1rem">${G.img(V.photo, 'photo', 'Foto Desa ' + V.name)}</div><p class="pre">${G.esc(V.description)}</p>
      <div style="margin-top:1rem">${kv([['Desa', V.name], ['Kecamatan', V.district + (V.formerDistrict ? ' (sebelumnya ' + V.formerDistrict + ')' : '')], ['Kabupaten', V.regency], ['Provinsi', V.province], ['Kode pos', V.postal], ['Kode wilayah', V.code]])}</div>`),
    sec('visi', 'Visi dan Misi', `<p><b>Visi</b></p><p style="margin:.3rem 0 1rem">${G.esc(V.vision)}</p><p><b>Misi</b></p><ol style="margin:.4rem 0 0 1.2rem" class="stack">${V.mission.map(m => `<li>${G.esc(m)}</li>`).join('')}</ol>`),
    sec('sejarah', 'Sejarah Desa', `<div class="timeline">${V.history.map(h => `<div class="ev"><span class="badge b-info">${G.esc(h.year)}</span><h3>${G.esc(h.title)}</h3><p class="muted">${G.esc(h.text)}</p></div>`).join('')}</div>`),
    sec('wilayah', 'Wilayah dan Peta', `${mapSvg()}<p class="muted" style="margin:.6rem 0">Tekan sebuah dusun untuk melihat rincian.</p><div class="chips">${V.hamlets.map((h, i) => `<button class="chip" data-i="${i}" type="button">${G.icon('pin')}${G.esc(h.name)}</button>`).join('')}</div>
      <p style="margin-top:.8rem"><a class="btn btn-ghost btn-sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(V.mapQuery)}" target="_blank" rel="noopener">${G.icon('external')}Buka di Google Maps (butuh internet)</a></p>`),
    sec('penduduk', 'Kependudukan', `<div class="kpi" style="margin:0 0 1rem">${V.stats.map(s => `<div class="card" style="box-shadow:none"><div><b>${Number(s.value).toLocaleString('id-ID', { minimumFractionDigits: s.dec || 0, maximumFractionDigits: s.dec || 0 })}${G.esc(s.suffix || '')}</b><span class="muted">${G.esc(s.label)}</span></div></div>`).join('')}</div>${kv(V.demography)}`),
    sec('fasilitas', 'Fasilitas Desa', `<p class="muted" style="margin-bottom:.8rem">Tanda "-" berarti belum ada atau belum tercatat.</p><div class="grid">${V.facilities.map(f => `<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="cat-ic sm">${G.icon(f.ic)}</span><div><b>${G.esc(f.title)}</b><p class="muted">${G.esc(f.text)}</p></div></div>`).join('')}</div>`),
    sec('pemerintah', 'Pemerintahan Desa', `<div class="grid team">${CONFIG.officials.map(o => `<article class="card" style="box-shadow:none">${G.img(o.photo, 'profile', o.name, 'avatar')}<h3>${G.esc(o.name)}</h3><span class="badge b-info">${G.esc(o.role)}</span>${o.note ? `<p class="muted" style="margin-top:.4rem">${G.esc(o.note)}</p>` : ''}</article>`).join('')}</div>`),
    sec('galeri', 'Galeri Desa', `<div class="grid gal">${V.gallery.map((g, i) => `<figure class="card" style="box-shadow:none;padding:.6rem"><div class="photo">${G.img(g.src, 'photo', g.cap)}</div><figcaption class="muted" style="margin-top:.4rem">${G.esc(g.cap)}</figcaption></figure>`).join('')}</div>`),
    sec('online', 'Foto dari Internet', `<p class="muted" style="margin-bottom:.8rem">Foto desa dan wilayah sekitarnya yang diambil otomatis dari Wikimedia Commons saat perangkat online. Hak cipta tetap pada pembuatnya.</p><div id="onlineBox"><div class="spinner"></div></div>`),
    sec('jam', 'Jam Pelayanan', kv(V.hours.map(h => [h.day, h.time])))
  ];
  $('#nav').innerHTML = S.map(s => `<a href="#s-${s.id}">${G.esc(s.title)}</a>`).join('');
  $('#secs').innerHTML = S.map(s => s.html).join('');

  const hamlet = i => { const h = V.hamlets[i]; G.modal(`<h2>${G.icon('pin')} ${G.esc(h.name)}</h2><p class="muted">Dusun di ${G.esc(V.name)}, Kecamatan ${G.esc(V.district)}.</p><div class="stack" style="margin-top:.8rem"><div class="row between"><span>Ongkos antar motor (Pasar Desa)</span><b>${G.money(h.fee)}</b></div></div><div class="row" style="margin-top:1rem"><a class="btn btn-primary btn-sm" href="market.html">${G.icon('store')}Pasar Desa</a><a class="btn btn-ghost btn-sm" href="supplies.html">${G.icon('truck')}Pasokan</a></div>`); };
  $('#s-wilayah').addEventListener('click', e => { const t = e.target.closest('[data-i]'); if (t) hamlet(+t.dataset.i); });
  $('#s-wilayah').addEventListener('keydown', e => { if (e.key === 'Enter') { const t = e.target.closest('[data-i]'); if (t) hamlet(+t.dataset.i); } });
  $('#s-galeri').addEventListener('click', e => { const f = e.target.closest('figure'); if (!f) return; G.modal(`<div class="photo">${f.querySelector('.photo').innerHTML}</div><p style="margin-top:.6rem"><b>${G.esc(f.querySelector('figcaption').textContent)}</b></p>`, true); });

  /* Foto dari internet: dicari otomatis (js/fx.js, GXO.photos) dan disimpan 7 hari di peramban */
  (async () => {
    const box = $('#onlineBox'); let list = [];
    try { list = await GXO.photos(); } catch (e) {}
    if (!list.length) { box.innerHTML = G.empty('globe', navigator.onLine ? 'Belum ada foto yang ditemukan untuk wilayah ini.' : 'Foto dari internet akan muncul saat perangkat online.'); return; }
    box.innerHTML = `<div class="grid gal">${list.map((p, i) => `<figure class="card lift" style="padding:.6rem" data-o="${i}"><div class="photo"><img src="${G.esc(p.thumb)}" alt="${G.esc(p.title)}" loading="lazy" onerror="this.closest('figure').remove()"></div><figcaption class="muted" style="margin-top:.4rem">${G.esc(p.title.slice(0, 60))}</figcaption></figure>`).join('')}</div>`;
    box.addEventListener('click', e => { const f = e.target.closest('[data-o]'); if (!f) return; const p = list[+f.dataset.o]; G.modal(`<div class="photo"><img src="${G.esc(p.thumb)}" alt="${G.esc(p.title)}"></div><p style="margin:.6rem 0"><b>${G.esc(p.title)}</b></p><p class="muted">${p.by ? 'Pembuat: ' + G.esc(p.by) + '. ' : ''}${p.lic ? 'Lisensi: ' + G.esc(p.lic) + '.' : ''}</p><a class="btn btn-primary btn-sm" href="${G.esc(p.page)}" target="_blank" rel="noopener">${G.icon('external')}Halaman sumber</a>`, true); });
  })();
})();
