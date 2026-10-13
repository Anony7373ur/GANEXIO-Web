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

    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 00.3 1.800l.1.1a2 2 0 11-2.800 2.800l-.1-.1a1.700 1.700 0 00-1.800-.3 1.700 1.700 0 00-1 1.500V21a2 2 0 11-4 0v-.1a1.700 1.700 0 00-1.100-1.500 1.700 1.700 0 00-1.800.3l-.1.1a2 2 0 11-2.800-2.800l.1-.1a1.700 1.700 0 00.3-1.800 1.700 1.700 0 00-1.500-1H3a2 2 0 110-4h.1a1.700 1.700 0 001.500-1.100 1.700 1.700 0 00-.3-1.800l-.1-.1a2 2 0 112.800-2.800l.1.1a1.700 1.700 0 001.800.3H9a1.700 1.700 0 001-1.500V3a2 2 0 114 0v.1a1.700 1.700 0 001 1.500 1.700 1.700 0 001.800-.3l.1-.1a2 2 0 112.800 2.800l-.1.1a1.700 1.700 0 00-.3 1.800V9a1.700 1.700 0 001.500 1H21a2 2 0 110 4h-.1a1.700 1.700 0 00-1.500 1z"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>', star: '<path d="M12 3l2.800 5.800 6.200.9-4.500 4.400 1.100 6.200L12 17.300 6.400 20.300l1.100-6.200L3 9.700l6.200-.9z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', nav: '<path d="M3 11l18-8-8 18-2-8z"/>', server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.500v.01M7 16.500v.01"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6v.01M3 12v.01M3 18v.01"/>', ban: '<circle cx="12" cy="12" r="9"/><path d="M5.600 5.600l12.800 12.800"/>', play: '<path d="M6 4l14 8-14 8z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.500v.01"/>', reply: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 016 6v3"/>'
  };
  const icon = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" ${S} aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------- Kategori. c1/c2 = warna gradasi lencana dan aksen halaman. how = cara memakai ---------- */
  const PAGES = [
    { id: 'supplies', href: 'supplies.html', ic: 'truck', c1: '#e8590c', c2: '#ff922b', title: 'Pasokan dari Kota', desc: 'Minta pangan, bahan bangunan, obat, atau barang kustom dari kota. Lacak pengirimannya sampai diambil dan dibayar.', hint: 'Pilih jenis kebutuhan, tambahkan barang, pilih cara menerima, lalu tekan "Kirim Permintaan".',
      how: ['Pilih jenis kebutuhan (atau Kustom untuk barang khusus).', 'Tekan barang yang sering diminta atau ketik sendiri, lalu isi jumlah.', 'Pilih cara menerima: diantar ke dusun, ambil di balai desa, gudang, pos transit, atau kolektif.', 'Tekan "Kirim Permintaan" lalu simpan kode tiket.', 'Buka tab "Lacak Permintaan" untuk melihat tahap, jenis truk, dan asal barang. Saat tiba, ambil barang, bayar di lokasi, lalu tekan "Sudah diambil & dibayar".'] },
    { id: 'funds', href: 'funds.html', ic: 'wallet', c1: '#0a8f5b', c2: '#38c98a', title: 'Dana Desa Bersama', desc: 'Keuangan desa yang terbuka untuk semua warga. Hanya bendahara yang dapat mengelola.', lock: 'bendahara', hint: 'Warga dapat melihat saldo, grafik, pembelian, dan penjualan. Mengubah data hanya untuk bendahara.',
      how: ['Lihat saldo, pemasukan, dan pengeluaran di bagian atas.', 'Gunakan kolom cari dan filter untuk melihat pembelian, penjualan, atau iuran.', 'Bendahara: buka "Masuk sebagai Bendahara" di halaman Kontak lalu masukkan PIN.', 'Bendahara dapat mencatat transaksi, menagih iuran, membayar biaya server dan upah developer, serta mengatur anggaran.'] },
    { id: 'market', href: 'market.html', ic: 'store', c1: '#e0a100', c2: '#f08c00', title: 'Pasar Desa', desc: 'Produk warga yang dijual di desa. Datang ke toko atau minta diantar motor.', hint: 'Pilih barang, tekan "Pesan", pilih datang ke toko atau diantar, lalu tunjukkan kode ambil ke penjual.',
      how: ['Cari barang atau pilih kelompok.', 'Tekan "Pesan", pilih jumlah dan cara menerima.', 'Datang ke toko: pilih jam datang, simpan kode ambil. Diantar: isi dusun dan alamat.', 'Pantau pesanan di tab "Pesanan". Bayar langsung ke penjual.', 'Ingin berjualan? Tekan "Jual Barang" dan tambahkan foto.'] },
    { id: 'cctv', href: 'cctv.html', ic: 'camera', c1: '#14213d', c2: '#3a5ba0', title: 'CCTV Desa', desc: 'Pantauan area umum desa dengan pencatatan akses untuk menjaga keamanan dan privasi.', pub: true, hint: 'Isi nama di Profil, setujui aturan, lalu pilih kamera. Setiap akses dan pengambilan gambar tercatat.',
      how: ['Isi nama Anda di Profil.', 'Baca dan setujui aturan penggunaan.', 'Pilih kamera untuk melihat siaran. Tayangan memuat nama dan waktu Anda.', 'Ingin mengambil gambar? Tulis alasan, maksimal 3 kali per jam.', 'Tab "Rekaman" dan "Log" menampilkan rekaman lama dan riwayat akses.'] },
    { id: 'community', href: 'community.html', ic: 'chat', c1: '#7a1f5c', c2: '#e0407b', title: 'Forum dan Obrolan', desc: 'Berdiskusi, berbagi foto dan lokasi, dan mengobrol langsung dengan warga.', hint: 'Forum untuk tulisan yang dapat dibalas. Obrolan untuk berbincang langsung.',
      how: ['Di Forum, tulis judul dan isi, tambahkan foto bila perlu.', 'Tekan "Lokasi saya" untuk menyertakan lokasi terkini.', 'Tekan tulisan untuk membalas atau menyukai.', 'Di Obrolan, pilih ruang lalu tulis pesan dan tekan Enter.'] },
    { id: 'internet', href: 'internet.html', ic: 'globe', c1: '#1e6fef', c2: '#12c2e9', title: 'Akses Internet', desc: 'Cari dan buka situs di luar desa, simpan penanda, dan lihat rancangan jaringan desa.', hint: 'Pilih mesin pencari, ketik kata kunci, lalu tekan "Cari". Hasil terbuka di tab baru.',
      how: ['Pilih mesin pencari dan jenis pencarian (web, gambar, video, berita, peta).', 'Ketik kata kunci atau alamat situs lalu tekan "Cari".', 'Lihat Riwayat atau simpan situs ke Penanda. Aktifkan "Mode privat" bila tidak ingin dicatat.', 'Tab "Rancangan Jaringan" berisi rekomendasi server dan WiFi untuk desa.'] },
    { id: 'info', href: 'info.html', ic: 'book', c1: '#0f8b8d', c2: '#2bbf9a', title: 'Informasi Desa', desc: 'Profil, sejarah, wilayah, kependudukan, fasilitas, dan pemerintahan Desa Sipagabu.', pub: true, hint: 'Pilih judul di sebelah kiri untuk menuju bagian yang ingin dibaca.',
      how: ['Pilih judul di daftar kiri.', 'Gulir untuk membaca profil, sejarah, peta, dan fasilitas.', 'Tekan foto galeri untuk melihat lebih besar.'] },
    { id: 'messages', href: 'messages.html', ic: 'mail', c1: '#5b3fd1', c2: '#8f6bff', title: 'Pesan dan Permohonan', desc: 'Kirim pesan, ajukan surat, atau sampaikan laporan. Laporan yang benar akan didatangi petugas.', hint: 'Pilih jenis layanan, isi formulir dengan jujur, lalu simpan kode tiket.',
      how: ['Pilih Pesan, Permohonan Surat, atau Laporan.', 'Isi formulir. Untuk laporan, centang pernyataan jujur.', 'Tekan "Kirim" dan simpan kode tiket.', 'Lacak tiket: Terkirim, Diverifikasi, Petugas menuju pihak terkait, Selesai.'] },
    { id: 'contacts', href: 'contacts.html', ic: 'phone', c1: '#d7263d', c2: '#ff5c6c', title: 'Kontak Penting', desc: 'Nomor darurat, perangkat desa, tim developer, dan akses petugas.', pub: true, hint: 'Tekan "Telepon" atau "WhatsApp" untuk menghubungi. Petugas dapat masuk dengan PIN di bagian bawah.',
      how: ['Untuk darurat, tekan nomor merah di bagian atas.', 'Pilih perangkat desa lalu tekan Telepon atau WhatsApp.', 'Petugas: gunakan bagian "Akses Petugas" dan masukkan PIN.'] }
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

  /* ---------- Profil dan nama pengguna (tanpa login) ---------- */
  const profile = () => { try { return JSON.parse(localStorage.getItem('gx_profile')) || {}; } catch (e) { return {}; } };
  const saveProfile = p => localStorage.setItem('gx_profile', JSON.stringify({ ...profile(), ...p }));
  const name = () => profile().name || '';
  const setName = n => saveProfile({ name: String(n).trim() });
  const askName = () => new Promise(res => {
    if (name()) return res(name());
    const m = modal(`<h2>Siapa nama Anda?</h2><p class="muted" style="margin-bottom:1rem">Nama ini tampil di tulisan, obrolan, dan pesanan. Tidak perlu daftar atau masuk. Anda dapat melengkapi profil nanti.</p>
      <form><div class="field"><input name="n" maxlength="40" placeholder="Contoh: Bu Rosmaida" autocomplete="name" required></div><button class="btn btn-primary btn-block" type="submit">Simpan Nama</button></form>`);
    let done = false;
    m.querySelector('form').onsubmit = e => { e.preventDefault(); const v = e.target.n.value.trim(); if (!v) return; setName(v); done = true; m.close(); refreshTop(); res(v); };
    m.addEventListener('closed', () => { if (!done) res(''); });
  });
  /* Perkecil foto di peramban agar muat di penyimpanan lokal */
  const resizeImage = (file, max = 640, q = .72) => new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) return rej(new Error('Pilih berkas gambar (JPG atau PNG).'));
    if (file.size > 10 * 1024 * 1024) return rej(new Error('Ukuran gambar maksimal 10 MB.'));
    const r = new FileReader();
    r.onerror = () => rej(new Error('Gambar tidak dapat dibaca.'));
    r.onload = () => { const i = new Image(); i.onerror = () => rej(new Error('Gambar tidak dapat dibuka.')); i.onload = () => { const k = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = Math.round(i.width * k); c.height = Math.round(i.height * k); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', q)); }; i.src = r.result; };
    r.readAsDataURL(file);
  });

  /* ---------- Akses petugas (PIN) ---------- */
  const role = () => sessionStorage.getItem('gx_role') || '';
  const ROLE_NAME = { admin: 'Admin Desa', bendahara: 'Bendahara' };
  function unlockDialog(want) {
    const hint = CONFIG.pins.showDemoHint;
    const row = (r, label) => `<form class="card" data-r="${r}" style="box-shadow:none;margin-bottom:.8rem"><b>${label}</b>${hint ? `<span class="muted"> (PIN demo: ${CONFIG.pins[r]})</span>` : ''}
      <div class="row" style="margin-top:.5rem;flex-wrap:nowrap"><input name="p" type="password" inputmode="numeric" placeholder="PIN" aria-label="PIN ${label}" autocomplete="off"><button class="btn btn-primary" type="submit">Buka</button></div><div class="msg-err" style="margin:.5rem 0 0"></div></form>`;
    const m = modal(`<h2>${icon('key')} Akses petugas</h2><p class="muted" style="margin-bottom:1rem">Fitur pengelolaan dibuka dengan PIN. Warga biasa tidak perlu melakukan ini.</p>${want ? row(want, ROLE_NAME[want]) : row('admin', 'Admin Desa') + row('bendahara', 'Bendahara (Dana Desa)')}${role() ? '<button class="btn btn-ghost btn-block" data-out type="button">Keluar dari mode petugas</button>' : ''}`);
    $$('form[data-r]', m).forEach(f => f.onsubmit = e => { e.preventDefault(); const r = f.dataset.r; if (f.p.value === CONFIG.pins[r]) { sessionStorage.setItem('gx_role', r); location.reload(); } else { f.querySelector('.msg-err').textContent = 'PIN salah. Coba lagi.'; f.p.select(); } });
    const out = $('[data-out]', m); if (out) out.onclick = () => { sessionStorage.removeItem('gx_role'); location.reload(); };
  }

  /* ---------- Pengaturan ---------- */
  const SIZES = [15, 17, 19, 22], SIZE_N = ['Kecil', 'Normal', 'Besar', 'Sangat besar'];
  const settings = () => { try { return { fs: 1, anim: true, bg: true, contrast: false, ...(JSON.parse(localStorage.getItem('gx_settings')) || {}) }; } catch (e) { return { fs: 1, anim: true, bg: true, contrast: false }; } };
  const applySettings = () => {
    const s = settings(), h = document.documentElement;
    h.style.setProperty('--fs', SIZES[s.fs] + 'px'); h.dataset.anim = s.anim ? 'on' : 'off'; h.dataset.bg = s.bg ? 'on' : 'off'; h.dataset.contrast = s.contrast ? 'high' : 'normal';
  };
  const setSetting = (k, v) => { localStorage.setItem('gx_settings', JSON.stringify({ ...settings(), [k]: v })); applySettings(); };
  function settingsDialog() {
    const s = settings(), sw = (k, label, hint) => `<label class="row between" style="padding:.7rem 0;border-bottom:1px solid var(--line);cursor:pointer"><span><b>${label}</b><br><span class="muted">${hint}</span></span><input type="checkbox" data-k="${k}" ${s[k] ? 'checked' : ''} style="width:26px;min-height:26px"></label>`;
    const m = modal(`<h2>${icon('gear')} Pengaturan</h2>
      <div class="field"><label>Ukuran tulisan</label><div class="chips" id="sz">${SIZE_N.map((n, i) => `<button type="button" class="chip ${s.fs === i ? 'on' : ''}" data-i="${i}">${n}</button>`).join('')}</div></div>
      ${sw('anim', 'Animasi', 'Matikan jika perangkat lambat atau mata cepat lelah')}${sw('bg', 'Gambar latar', 'Matikan untuk menghemat baterai dan data')}${sw('contrast', 'Kontras tinggi', 'Tulisan dan garis lebih tegas')}
      <div class="row" style="margin-top:1rem">${role() ? `<button class="btn btn-ghost btn-sm" data-out type="button">${icon('key')}Keluar mode ${ROLE_NAME[role()]}</button>` : ''}<button class="btn btn-ghost btn-sm" data-pf type="button">${icon('user')}Buka profil</button><button class="btn btn-ghost btn-sm" data-wipe type="button">${icon('trash')}Hapus data saya di perangkat ini</button></div>`);
    m.querySelector('#sz').onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; setSetting('fs', +b.dataset.i); $$('#sz .chip', m).forEach(x => x.classList.toggle('on', x === b)); };
    $$('input[data-k]', m).forEach(c => c.onchange = () => { setSetting(c.dataset.k, c.checked); if (c.dataset.k === 'bg') toast(c.checked ? 'Gambar latar dinyalakan' : 'Gambar latar dimatikan'); });
    const out = $('[data-out]', m); if (out) out.onclick = () => { sessionStorage.removeItem('gx_role'); location.reload(); };
    $('[data-pf]', m).onclick = () => { m.close(); profileDialog(); };
    $('[data-wipe]', m).onclick = async () => { if (await confirmBox('Hapus profil dan semua data buatan Anda di perangkat ini?')) { Store.reset(); ['gx_profile', 'gx_settings', 'gx_engine'].forEach(k => localStorage.removeItem(k)); location.reload(); } };
  }

  /* ---------- Profil ---------- */
  function profileDialog() {
    const p = profile(), n = p.name || '', cnt = k => Store.all(k).filter(x => n && (x.name === n || x.author === n || x.buyer === n)).length;
    const m = modal(`<h2>${icon('user')} Profil saya</h2>
      <form id="pf"><div class="msg-err" role="alert"></div>
        <div class="row" style="margin-bottom:1rem;flex-wrap:nowrap"><div id="av">${avatar(p, 84)}</div><div style="flex:1"><label class="btn btn-ghost btn-sm" for="pfile" style="cursor:pointer">${icon('image')}Ganti foto</label><input id="pfile" type="file" accept="image/*" hidden><p class="muted" style="margin-top:.4rem">Foto disimpan di perangkat ini saja.</p></div></div>
        <div class="field"><label for="pn">Nama</label><input id="pn" name="name" value="${esc(n)}" maxlength="40" required></div>
        <div class="two"><div class="field"><label for="pp">Nomor HP / WhatsApp</label><input id="pp" name="phone" value="${esc(p.phone || '')}" inputmode="tel"></div>
        <div class="field"><label for="pd">Dusun</label><select id="pd" name="hamlet"><option value="">- pilih -</option>${CONFIG.village.hamlets.map(h => `<option ${p.hamlet === h.name ? 'selected' : ''}>${esc(h.name)}</option>`).join('')}</select></div></div>
        <div class="field"><label for="pb">Tentang saya (boleh kosong)</label><textarea id="pb" name="bio" maxlength="200">${esc(p.bio || '')}</textarea></div>
        <button class="btn btn-primary btn-block" type="submit">${icon('check')}Simpan Profil</button></form>
      <div class="card" style="box-shadow:none;margin-top:1rem"><b>Aktivitas saya</b><p class="muted">${cnt('supplies')} permintaan pasokan &bull; ${cnt('orders')} pesanan pasar &bull; ${cnt('posts')} tulisan forum &bull; ${cnt('tickets')} tiket layanan</p>${role() ? `<span class="badge b-ok">Mode ${ROLE_NAME[role()]} aktif</span>` : ''}</div>`);
    let photo = p.photo || '';
    m.querySelector('#pfile').onchange = async e => { try { photo = await resizeImage(e.target.files[0], 256, .8); m.querySelector('#av').innerHTML = avatar({ name: m.querySelector('#pn').value || 'A', photo }, 84); } catch (x) { toast(x.message, 'err'); } };
    m.querySelector('#pf').onsubmit = e => { e.preventDefault(); const f = e.target; saveProfile({ name: f.name.value.trim(), phone: f.phone.value.trim(), hamlet: f.hamlet.value, bio: f.bio.value.trim(), photo }); m.close(); refreshTop(); toast('Profil disimpan'); };
  }
  const avatar = (p, s = 36) => p.photo ? `<img src="${p.photo}" alt="Foto profil" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.2)">` : `<span class="initial" style="width:${s}px;height:${s}px;font-size:${s * .45}px;background:${color(p.name || 'A')}">${init2(p.name || '?')}</span>`;

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
  function refreshTop() { const b = $('#pfBtn'); if (b) { const p = profile(); b.innerHTML = avatar(p, 30) + `<span>${esc((p.name || 'Profil').split(' ')[0])}</span>`; } }

  /* Gambar latar abu-abu transparan. Foto asli dipakai jika ada, jika tidak memakai ilustrasi bawaan. */
  function background(id) {
    const el = document.createElement('div'); el.className = 'bg-layer'; el.setAttribute('aria-hidden', 'true'); document.body.prepend(el);
    const fallback = `img/bg-${id === 'home' ? 'home' : id}.svg`, own = id === 'home' ? CONFIG.village.photo : (CONFIG.backgrounds[id] || '');
    const set = u => { el.style.backgroundImage = `url("${u}")`; el.classList.add('on'); };
    if (!own) return set(fallback);
    const u = /^(https?:|img\/|\/)/.test(own) ? own : 'img/' + own, t = new Image(); t.onload = () => set(u); t.onerror = () => set(fallback); t.src = u;
  }

  function shell(cur) {
    const r = role(), v = CONFIG.village;
    const skip = document.createElement('a'); skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Lewati ke isi halaman';
    const top = document.createElement('header'); top.className = 'topbar';
    top.innerHTML = `<a class="brand" href="index.html" aria-label="Ganexio Desa ${esc(v.short)} beranda"><img src="img/logo-white.png" alt="Logo Ganexio"><span class="brand-t">${esc(CONFIG.site.name)}<small>- ${esc(v.name)}</small></span></a>
      <div class="top-actions">
        ${r ? `<button class="tbtn on" id="roleBtn" type="button" title="Mode petugas aktif">${icon('key')}<span>${ROLE_NAME[r]}</span></button>` : ''}
        <button class="tbtn" id="pfBtn" type="button" title="Profil saya" aria-label="Profil saya"></button>
        <button class="tbtn" id="setBtn" type="button" title="Pengaturan" aria-label="Pengaturan">${icon('gear')}<span>Pengaturan</span></button>
        <button class="tbtn" id="menuBtn" type="button" aria-label="Buka menu">${icon('menu')}<span>Menu</span></button></div>`;
    const links = [{ href: 'index.html', ic: 'home', c1: '#14213d', c2: '#d7263d', title: 'Beranda', id: 'home' }, ...PAGES].map(p =>
      `<a href="${p.href}" class="${cur === p.id ? 'on' : ''}" style="--c1:${p.c1}"><span class="cat-ic sm" style="--c1:${p.c1};--c2:${p.c2}">${icon(p.ic)}</span>${esc(p.title)}</a>`).join('');
    const dr = document.createElement('aside'); dr.className = 'drawer'; dr.innerHTML = `<div class="drawer-head"><img src="img/logo-white.png" alt=""><span>${esc(CONFIG.site.name)}<br><small style="font-weight:600;opacity:.85">${esc(v.name)}</small></span></div><nav>${links}</nav>`;
    const sc = document.createElement('div'); sc.className = 'scrim';
    const ft = document.createElement('footer'); ft.className = 'foot';
    ft.innerHTML = `<div class="foot-in"><div class="row" style="flex-wrap:nowrap"><img src="img/logo-white.png" alt="" style="height:44px"><div><b style="color:#fff">${esc(CONFIG.site.name)} - ${esc(v.name)}</b><br>${esc(CONFIG.site.tagline)}<br><small>&copy; 2026 Kec. ${esc(v.district)}, Kab. ${esc(v.regency)}, ${esc(v.province)}</small></div></div>
      <div class="net" id="net"><i class="dot"></i><span>Memeriksa sambungan...</span></div>
      <div class="no-print"><button id="resetBtn" type="button">Atur ulang data contoh</button></div></div>`;
    document.body.prepend(skip, top, dr, sc); document.body.append(ft);
    const tg = o => { dr.classList.toggle('open', o); sc.classList.toggle('open', o); };
    $('#menuBtn').onclick = () => tg(true); sc.onclick = () => tg(false); document.addEventListener('keydown', e => e.key === 'Escape' && tg(false));
    $('#pfBtn').onclick = profileDialog; $('#setBtn').onclick = settingsDialog; const rb = $('#roleBtn'); if (rb) rb.onclick = settingsDialog;
    $('#resetBtn').onclick = async () => { if (await confirmBox('Hapus semua data buatan Anda dan kembalikan data contoh?')) { Store.reset(); location.reload(); } };
    const net = () => { const el = $('#net'), on = navigator.onLine; el.className = 'net ' + (on ? 'ok' : 'warn'); el.querySelector('span').textContent = on ? 'Perangkat tersambung ke jaringan' : 'Sedang offline: data tersimpan di perangkat ini'; };
    net(); addEventListener('online', net); addEventListener('offline', net); refreshTop();
  }

  const howto = p => `<details class="howto"><summary>${icon('book')}Cara memakai ${esc(p.title)}</summary><ol>${p.how.map(h => `<li>${esc(h)}</li>`).join('')}</ol></details>`;

  /* Dipanggil oleh setiap halaman dengan id halaman. */
  function init(id) {
    applySettings(); Store.seed(); ripple();
    const p = PAGE(id); document.body.dataset.page = id;
    if (p) { document.body.style.setProperty('--c1', p.c1); document.body.style.setProperty('--c2', p.c2); }
    document.title = `${p ? p.title : 'Beranda'} - ${CONFIG.site.name} - ${CONFIG.village.name}`;
    background(id); shell(id);
    const main = $('#main'), ph = $('#pagehead');
    if (ph && p) ph.innerHTML = `<div class="page-head"><span class="cat-ic lg" style="--c1:${p.c1};--c2:${p.c2}">${icon(p.ic)}</span><div><h1>${esc(p.title)}</h1><p>${esc(p.desc)}</p></div></div><div class="hint">${icon('tip')}<span>${esc(p.hint)}</span></div>${howto(p)}`;
    icons(); return main;
  }
  const tile = (p, i, extra = '') => `<a class="tile" href="${p.href}" style="--c1:${p.c1};--c2:${p.c2};--d:${i * 70}ms">${extra}${catBadge(p.id)}<h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><span class="go">Buka ${icon('send')}</span></a>`;

  return { icon, icons, PAGES, PAGE, catBadge, $, $$, esc, money, date, ago, code, nextId, wa, tel, init2, color, img, empty, debounce, csv, copy, countUp, toast, modal, confirm: confirmBox, submit, name, setName, askName, profile, avatar, resizeImage, role, unlock: unlockDialog, init, tile, howto, ROLE_NAME };
})();
