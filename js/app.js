/* Ganexio.id - fungsi bersama: ikon, menu, kaki halaman, akses petugas (PIN), dan alat bantu.
   Daftar kategori, judul, warna, dan petunjuk ada di PAGES (ubah teksnya jika perlu). */
const G = (() => {
  const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  /* Ikon putih bergaya garis. Tiap ikon kategori dibuat sesuai fungsinya. */
  const ICONS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    truck: '<path d="M1 6h13v10H1z"/><path d="M14 9h4l4 4v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    wallet: '<path d="M3 7a2 2 0 012-2h13v4"/><path d="M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2z"/><circle cx="16.5" cy="14.5" r="1.2"/>',
    store: '<path d="M4 9l1-5h14l1 5"/><path d="M4 9a2.7 2.7 0 005.3 0 2.7 2.7 0 005.4 0A2.7 2.7 0 0020 9"/><path d="M5 12v8h14v-8"/>',
    camera: '<rect x="3" y="6" width="14" height="8" rx="2"/><path d="M17 9l4-2v8l-4-2"/><path d="M8 14v4M5 20h6"/>',
    chat: '<path d="M3 5h12v8H8l-3 3v-3H3z"/><path d="M17 9h4v8h-2v3l-3-3h-5v-2"/>',
    dish: '<path d="M5 5c-1.5 5 1 10.5 7 12.5l5-5C11.500 10 7.500 7.500 5 5z"/><path d="M9.500 9.500L14 5"/><path d="M12 17.500L10 21h6"/><path d="M15 3.500a6 6 0 015.500 5.500"/><path d="M14 7a2.500 2.500 0 012.500 2.500"/>',
    book: '<path d="M2 5c3-1 7-1 10 1v14c-3-2-7-2-10-1z"/><path d="M22 5c-3-1-7-1-10 1v14c3-2 7-2 10-1z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    phone: '<path d="M5 3h4l2 5-2.500 1.500a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>', plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12l5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    basket: '<path d="M3 9h18l-2 11H5z"/><path d="M8 9l4-6 4 6"/>', leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19l8-8"/>',
    brick: '<path d="M3 5h18v14H3z"/><path d="M3 10h18M3 15h18M9 5v5M15 10v5M9 15v4"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>', send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    bike: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8M10 9H7"/>',
    pin: '<path d="M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.500"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>', down: '<path d="M12 5v14M5 12l7 7 7-7"/>', coin: '<circle cx="12" cy="12" r="9"/><path d="M14.500 9a3 3 0 00-5 1.500c0 3 5 1.500 5 4.500a3 3 0 01-5 1.500M12 6.500V8M12 16v1.500"/>',
    tip: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-4 10.500c.8.8 1 1.500 1 2.500h6c0-1 .2-1.700 1-2.500A6 6 0 0012 3z"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4L10 14"/><path d="M18 14v6H4V6h6"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.500"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6"/><circle cx="17" cy="9" r="2.500"/><path d="M17 14c3 0 5 1.500 5 5"/>',
    heart: '<path d="M12 20s-8-5-8-11a4.500 4.500 0 018-2.500A4.500 4.500 0 0120 9c0 6-8 11-8 11z"/>', drop: '<path d="M12 3s6 6.500 6 11a6 6 0 01-12 0c0-4.500 6-11 6-11z"/>',
    bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>', wifi: '<path d="M2 9a15 15 0 0120 0"/><path d="M5 13a10 10 0 0114 0"/><path d="M8.500 16.500a5 5 0 017 0"/><path d="M12 20v.01"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>', shield: '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/>',
    flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
    life: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.600 5.600l3.500 3.500M14.900 14.900l3.500 3.500M18.400 5.600l-3.500 3.500M9.100 14.900l-3.500 3.500"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', download: '<path d="M12 4v11M7 11l5 5 5-5M4 20h16"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 17l5-5 4 4 3-3 6 6"/>', file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>', refresh: '<path d="M20 11a8 8 0 00-14-4L4 9M4 4v5h5M4 13a8 8 0 0014 4l2-2M20 20v-5h-5"/>',
    textsize: '<path d="M3 19L8 5l5 14M5 14h6M15 19l3-8 3 8M16 17h4"/>', map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3.500 3.500 3.500 14.500 0 18M12 3c-3.500 3.500-3.500 14.500 0 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.500v.01"/>', reply: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 016 6v3"/>'
  };
  const icon = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" ${S} aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------- Kategori. c1/c2 = warna gradasi lencana dan aksen halaman ---------- */
  const PAGES = [
    { id: 'supplies', href: 'supplies.html', ic: 'truck', c1: '#e8590c', c2: '#ff922b', title: 'Pasokan dari Kota', desc: 'Minta bahan pangan, sumber daya alam, dan bahan bangunan dari kota, lalu lacak pengirimannya.', hint: 'Pilih jenis kebutuhan, tambahkan barang, lalu tekan "Kirim Permintaan". Simpan kode tiketnya untuk melacak.' },
    { id: 'funds', href: 'funds.html', ic: 'wallet', c1: '#0a8f5b', c2: '#38c98a', title: 'Dana Desa Bersama', desc: 'Catatan kas digital desa yang transparan. Hanya dapat dikelola administrator keuangan.', lock: 'bendahara', hint: 'Masukkan PIN bendahara untuk membuka dana desa. Tanpa PIN, halaman ini tetap terkunci.' },
    { id: 'market', href: 'market.html', ic: 'store', c1: '#e0a100', c2: '#f08c00', title: 'Pasar Desa', desc: 'Produk warga yang hanya ada di desa. Diantar motor atau diambil langsung di toko.', hint: 'Cari barang, tekan "Beli", lalu pilih diantar motor atau ambil di toko. Ingin berjualan? Tekan "Jual Barang".' },
    { id: 'cctv', href: 'cctv.html', ic: 'camera', c1: '#14213d', c2: '#3a5ba0', title: 'CCTV Desa', desc: 'Pantau lingkungan desa bersama-sama. Terbuka untuk semua warga.', pub: true, hint: 'Pilih tampilan 1, 2, atau banyak kamera. Tekan sebuah kamera untuk memperbesar.' },
    { id: 'community', href: 'community.html', ic: 'chat', c1: '#7a1f5c', c2: '#e0407b', title: 'Forum dan Obrolan', desc: 'Berdiskusi di forum dan mengobrol langsung dengan warga desa.', hint: 'Forum untuk tulisan yang bisa dibalas. Obrolan untuk berbincang langsung di ruang pilihan.' },
    { id: 'internet', href: 'internet.html', ic: 'dish', c1: '#1e6fef', c2: '#12c2e9', title: 'Internet Starlink', desc: 'Buka situs di luar desa yang sulit dijangkau, melalui jaringan satelit Starlink.', hint: 'Periksa sambungan, lalu ketik alamat situs atau pilih situs yang sering dibuka.' },
    { id: 'info', href: 'info.html', ic: 'book', c1: '#0f8b8d', c2: '#2bbf9a', title: 'Informasi Desa', desc: 'Profil, sejarah, wilayah, potensi, fasilitas, dan pemerintahan desa.', hint: 'Pilih judul di sebelah kiri untuk menuju bagian yang ingin dibaca.' },
    { id: 'messages', href: 'messages.html', ic: 'mail', c1: '#5b3fd1', c2: '#8f6bff', title: 'Pesan dan Permohonan', desc: 'Kirim pesan, ajukan surat, atau laporkan masalah kepada admin desa dan developer.', hint: 'Pilih jenis layanan, isi formulir, lalu simpan kode tiket untuk melacak jawabannya.' },
    { id: 'contacts', href: 'contacts.html', ic: 'phone', c1: '#d7263d', c2: '#ff5c6c', title: 'Kontak Penting', desc: 'Nomor darurat, perangkat desa, dan pihak luar yang bisa dihubungi.', pub: true, hint: 'Tekan tombol "Telepon" atau "WhatsApp" untuk menghubungi.' }
  ];
  const PAGE = id => PAGES.find(p => p.id === id);
  const catBadge = (id, size = '') => { const p = PAGE(id); return `<span class="cat-ic ${size}" style="--c1:${p.c1};--c2:${p.c2}">${icon(p.ic)}</span>`; };

  /* ---------- Alat bantu ---------- */
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID');
  const date = (s, long) => { const d = new Date(s); return isNaN(d) ? '' : d.toLocaleString('id-ID', long ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  const ago = s => { const m = Math.round((Date.now() - new Date(s)) / 6e4); return m < 1 ? 'baru saja' : m < 60 ? m + ' menit lalu' : m < 1440 ? Math.round(m / 60) + ' jam lalu' : Math.round(m / 1440) + ' hari lalu'; };
  const code = (p, id) => { const d = new Date(); return `${p}-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${String(id).padStart(4, '0')}`; };
  const nextId = n => Store.all(n).reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
  const wa = p => 'https://wa.me/' + String(p).replace(/\D/g, '').replace(/^0/, '62');
  const tel = p => 'tel:' + String(p).replace(/[^+\d]/g, '');
  const init2 = n => (String(n).trim()[0] || '?').toUpperCase();
  const color = n => ['#d7263d', '#1e6fef', '#0a8f5b', '#7a1f5c', '#e0a100', '#0f8b8d', '#5b3fd1'][[...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0) % 7];
  const PH = { photo: 'img/placeholder-photo.svg', profile: 'img/placeholder-profile.svg', product: 'img/placeholder-product.svg' };
  /* Gambar dengan placeholder otomatis. src = nama file di folder img/ atau alamat lengkap. Kosong = placeholder. */
  const img = (src, kind = 'photo', alt = '', cls = '') => {
    const u = src ? (/^(https?:|data:|\/|img\/)/.test(src) ? src : 'img/' + src) : PH[kind];
    return `<img class="${cls}" src="${esc(u)}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${PH[kind]}'">`;
  };
  const empty = (ic, msg) => `<div class="empty">${icon(ic)}<p>${esc(msg)}</p></div>`;
  const debounce = (f, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };
  function csv(name, rows) {
    const t = rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'text/csv' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const copy = async txt => { try { await navigator.clipboard.writeText(txt); toast('Disalin: ' + txt); } catch (e) { toast('Salin manual: ' + txt, 'err'); } };
  function countUp(el, to, suffix = '') { const t0 = performance.now(), n = Number(to); if (isNaN(n)) { el.textContent = to + suffix; return; } const f = t => { const p = Math.min((t - t0) / 1000, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))).toLocaleString('id-ID') + suffix; if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }

  function toast(msg, type = 'ok') {
    const t = document.createElement('div'); t.className = 'toast ' + type; t.setAttribute('role', 'status');
    t.innerHTML = icon(type === 'ok' ? 'check' : 'alert') + '<span>' + esc(msg) + '</span>'; document.body.append(t); setTimeout(() => t.remove(), 3600);
  }
  function modal(html, wide) {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="modal-box ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><button class="btn btn-ghost btn-sm modal-x" data-close type="button" aria-label="Tutup">${icon('x')}Tutup</button>${html}</div>`;
    const close = () => { m.remove(); document.removeEventListener('keydown', onKey); m.dispatchEvent(new Event('closed')); };
    const onKey = e => e.key === 'Escape' && close();
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey); document.body.append(m); icons(m); m.close = close;
    const f = m.querySelector('input,textarea,select'); if (f) setTimeout(() => f.focus(), 50);
    return m;
  }
  const confirmBox = msg => new Promise(res => {
    const m = modal(`<h2>${esc(msg)}</h2><div class="row"><button class="btn btn-primary" data-y type="button">Ya</button><button class="btn btn-ghost" data-close type="button">Batal</button></div>`);
    let ok = false; m.querySelector('[data-y]').onclick = () => { ok = true; m.close(); }; m.addEventListener('closed', () => res(ok));
  });
  /* Kirim formulir dengan tombol terkunci sementara */
  async function submit(form, fn) {
    const btn = form.querySelector('[type=submit]'), err = form.querySelector('.msg-err'); if (err) err.textContent = '';
    btn.disabled = true; try { await fn(); } catch (e) { if (err) err.textContent = e.message; else toast(e.message, 'err'); } btn.disabled = false;
  }

  /* ---------- Nama pengguna (tanpa login) dan akses petugas (PIN) ---------- */
  const name = () => localStorage.getItem('gx_name') || '';
  const askName = () => new Promise(res => {
    if (name()) return res(name());
    const m = modal(`<h2>Siapa nama Anda?</h2><p class="muted" style="margin-bottom:1rem">Nama ini tampil di tulisan, obrolan, dan pesanan Anda. Tidak perlu daftar atau masuk.</p>
      <form><div class="field"><input name="n" maxlength="40" placeholder="Contoh: Bu Sari" autocomplete="name" required></div><button class="btn btn-primary btn-block" type="submit">Simpan Nama</button></form>`);
    let done = false;
    m.querySelector('form').onsubmit = e => { e.preventDefault(); const v = e.target.n.value.trim(); if (!v) return; localStorage.setItem('gx_name', v); done = true; m.close(); res(v); };
    m.addEventListener('closed', () => { if (!done) res(''); });
  });
  const role = () => sessionStorage.getItem('gx_role') || '';
  const ROLE_NAME = { admin: 'Admin Desa', bendahara: 'Bendahara' };
  function unlockDialog(want) {
    const hint = CONFIG.pins.showDemoHint;
    const row = (r, label) => `<form class="card" data-r="${r}" style="box-shadow:none;margin-bottom:.8rem"><b>${label}</b>${hint ? `<span class="muted"> (PIN demo: ${CONFIG.pins[r]})</span>` : ''}
      <div class="row" style="margin-top:.5rem;flex-wrap:nowrap"><input name="p" type="password" inputmode="numeric" placeholder="PIN" aria-label="PIN ${label}" autocomplete="off"><button class="btn btn-primary" type="submit">Buka</button></div><div class="msg-err" style="margin:.5rem 0 0"></div></form>`;
    const m = modal(`<h2>${icon('key')} Akses petugas</h2><p class="muted" style="margin-bottom:1rem">Fitur khusus dibuka dengan PIN, tanpa login. Warga biasa tidak perlu melakukan ini.</p>
      ${want ? row(want, ROLE_NAME[want]) : row('admin', 'Admin Desa') + row('bendahara', 'Bendahara (Dana Desa)')}${role() ? '<button class="btn btn-ghost btn-block" data-out type="button">Keluar dari mode petugas</button>' : ''}`);
    $$('form[data-r]', m).forEach(f => f.onsubmit = e => {
      e.preventDefault(); const r = f.dataset.r;
      if (f.p.value === CONFIG.pins[r]) { sessionStorage.setItem('gx_role', r); location.reload(); } else { f.querySelector('.msg-err').textContent = 'PIN salah. Coba lagi.'; f.p.select(); }
    });
    const out = $('[data-out]', m); if (out) out.onclick = () => { sessionStorage.removeItem('gx_role'); location.reload(); };
  }

  /* ---------- Kerangka halaman ---------- */
  function icons(root = document) {
    $$('[data-ic]', root).forEach(e => { e.outerHTML = icon(e.dataset.ic); });
    $$('[data-cat]', root).forEach(e => { e.outerHTML = catBadge(e.dataset.cat, e.dataset.size || ''); });
  }
  function ripple() {
    document.addEventListener('click', e => {
      const b = e.target.closest('.btn'); if (!b || b.disabled) return;
      const r = b.getBoundingClientRect(), s = document.createElement('span'); s.className = 'rip'; s.style.left = e.clientX - r.left + 'px'; s.style.top = e.clientY - r.top + 'px'; b.append(s); setTimeout(() => s.remove(), 650);
    });
  }
  const SIZES = [15, 17, 19, 22];
  const applySize = () => document.documentElement.style.setProperty('--fs', SIZES[+localStorage.getItem('gx_fs') || 1] + 'px');

  function shell(cur) {
    const r = role();
    const skip = document.createElement('a'); skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Lewati ke isi halaman';
    const top = document.createElement('header'); top.className = 'topbar';
    top.innerHTML = `<a class="brand" href="index.html" aria-label="Ganexio.id beranda"><img src="img/logo-white.png" alt="Logo Ganexio"><span>Ganexio<small>.id</small></span></a>
      <div class="top-actions">
        <button class="tbtn" id="fsBtn" type="button" aria-label="Ubah ukuran tulisan" title="Ubah ukuran tulisan">${icon('textsize')}<span>Tulisan</span></button>
        <button class="tbtn ${r ? 'on' : ''}" id="roleBtn" type="button" title="Akses petugas">${icon('key')}<span>${r ? ROLE_NAME[r] : 'Petugas'}</span></button>
        <button class="tbtn" id="menuBtn" type="button" aria-label="Buka menu">${icon('menu')}<span>Menu</span></button></div>`;
    const links = [{ href: 'index.html', ic: 'home', c1: '#14213d', c2: '#d7263d', title: 'Beranda', id: 'home' }, ...PAGES].map(p =>
      `<a href="${p.href}" class="${cur === p.id ? 'on' : ''}" style="--c1:${p.c1}"><span class="cat-ic sm" style="--c1:${p.c1};--c2:${p.c2}">${icon(p.ic)}</span>${esc(p.title)}</a>`).join('');
    const dr = document.createElement('aside'); dr.className = 'drawer'; dr.innerHTML = `<div class="drawer-head"><img src="img/logo-white.png" alt="">Menu Ganexio</div><nav>${links}</nav>`;
    const sc = document.createElement('div'); sc.className = 'scrim';
    const ft = document.createElement('footer'); ft.className = 'foot';
    ft.innerHTML = `<div class="foot-in"><div><b style="color:#fff">${esc(CONFIG.site.name)}.id</b><br>${esc(CONFIG.site.tagline)}<br><small>&copy; 2026 ${esc(CONFIG.site.domain)} &mdash; Karya tim pengembang Ganexio</small></div>
      <div class="net" id="net"><i class="dot"></i><span>Memeriksa sambungan...</span></div>
      <div class="no-print"><button id="resetBtn" type="button">Atur ulang data contoh</button></div></div>`;
    document.body.prepend(skip, top, dr, sc); document.body.append(ft);
    const tg = o => { dr.classList.toggle('open', o); sc.classList.toggle('open', o); };
    $('#menuBtn').onclick = () => tg(true); sc.onclick = () => tg(false); document.addEventListener('keydown', e => e.key === 'Escape' && tg(false));
    $('#roleBtn').onclick = () => unlockDialog();
    $('#fsBtn').onclick = () => { localStorage.setItem('gx_fs', ((+localStorage.getItem('gx_fs') || 1) + 1) % SIZES.length); applySize(); toast('Ukuran tulisan diubah'); };
    $('#resetBtn').onclick = async () => { if (await confirmBox('Hapus semua data buatan Anda dan kembalikan data contoh?')) { Store.reset(); localStorage.removeItem('gx_name'); location.reload(); } };
    const net = () => { const el = $('#net'), on = navigator.onLine; el.className = 'net ' + (on ? 'ok' : 'warn'); el.querySelector('span').textContent = on ? 'Perangkat tersambung ke jaringan' : 'Sedang offline: data tersimpan di perangkat ini'; };
    net(); addEventListener('online', net); addEventListener('offline', net);
  }

  /* Dipanggil oleh setiap halaman dengan id halaman. */
  function init(id) {
    Store.seed(); applySize(); ripple();
    const p = PAGE(id); document.body.dataset.page = id;
    if (p) { document.body.style.setProperty('--c1', p.c1); document.body.style.setProperty('--c2', p.c2); }
    shell(id);
    const main = $('#main'), ph = $('#pagehead');
    if (ph && p) ph.innerHTML = `<div class="page-head"><span class="cat-ic lg" style="--c1:${p.c1};--c2:${p.c2}">${icon(p.ic)}</span><div><h1>${esc(p.title)}</h1><p>${esc(p.desc)}</p></div></div><div class="hint">${icon('tip')}<span>${esc(p.hint)}</span></div>`;
    icons(); return main;
  }
  const tile = (p, i, extra = '') => `<a class="tile" href="${p.href}" style="--c1:${p.c1};--c2:${p.c2};--d:${i * 70}ms">${extra}${catBadge(p.id)}<h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><span class="go">Buka ${icon('send')}</span></a>`;

  return { icon, icons, PAGES, PAGE, catBadge, $, $$, esc, money, date, ago, code, nextId, wa, tel, init2, color, img, empty, debounce, csv, copy, countUp, toast, modal, confirm: confirmBox, submit, name, askName, role, unlock: unlockDialog, init, tile, ROLE_NAME };
})();
