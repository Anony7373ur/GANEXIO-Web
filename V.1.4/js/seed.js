/* DATA CONTOH agar setiap halaman terlihat hidup saat dinilai.
   TODO-ISI: hapus atau ganti dengan data desa yang sebenarnya.
   Naikkan SEED_VERSION agar data contoh dibuat ulang di peramban yang sudah pernah membuka website. */
const SEED_VERSION = 5;
function makeSeedBase() {
  const D = d => new Date(Date.now() - d * 864e5).toISOString();
  const H = h => new Date(Date.now() - h * 36e5).toISOString();
  const M = (m, day) => { const t = new Date(); t.setMonth(t.getMonth() - m, day); t.setHours(9, 0, 0, 0); return t.toISOString(); };
  const S = CONFIG.supply, hm = CONFIG.village.hamlets.map(h => h.name);
  const sup = (id, code, name, cat, items, mode, dest, status, days, extra = {}) => ({
    id, code, name, phone: '08xxxxxxxxxx', category: cat, custom: '', items, urgency: 'biasa', mode, destination: dest, payment: S.payments[0], note: '',
    vehicle: S.vehicles.pickup, supplier: S.suppliers[cat], driver: S.drivers[id % 4], plate: 'BB ' + (1200 + id * 37) + ' XX', eta: 'Perkiraan tiba 1 hari', fee: 220000,
    auto: false, status, confirmed: status === 'selesai', paid: status === 'selesai', created: D(days),
    history: [{ status: 'menunggu', at: D(days) }, ...(status !== 'menunggu' ? [{ status: 'proses', at: D(days - .3) }] : []), ...(['dalam perjalanan', 'sampai', 'selesai'].includes(status) ? [{ status: 'dalam perjalanan', at: D(days - .6) }] : []), ...(['sampai', 'selesai'].includes(status) ? [{ status: 'sampai', at: D(days - .9) }] : []), ...(status === 'selesai' ? [{ status: 'selesai', at: D(days - 1) }] : [])], ...extra
  });
  const prod = (id, name, cat, price, stock, delivery, seller, shop, desc, img, hours, d) => ({ id, name, category: cat, price, stock, delivery, seller, phone: '08xxxxxxxxxx', shop, hours, description: desc, image: 'img/prod-' + img + '.svg', created: D(d) });
  const rec = [];
  CONFIG.cameras.forEach(c => { for (let d = 0; d < CONFIG.cctvPolicy.recordingDays; d++) [6, 12, 18].forEach(h => { const t = new Date(); t.setDate(t.getDate() - d); t.setHours(h, 0, 0, 0); if (t < new Date()) rec.push({ id: rec.length + 1, camId: c.id, cam: c.name, start: t.toISOString(), mins: 30 }); }); });
  return {
    supplies: [
      sup(1, 'PSK-2610-0001', 'Bu Rosmaida', 'pangan', [{ name: 'Beras', qty: 100, unit: 'kg' }, { name: 'Minyak goreng', qty: 20, unit: 'liter' }], 'balai', 'Titik distribusi desa (kantor/balai desa)', 'selesai', 5),
      sup(2, 'PSK-2610-0002', 'Pak Anwar', 'bahan_bangunan', [{ name: 'Semen', qty: 40, unit: 'sak' }, { name: 'Seng', qty: 30, unit: 'lembar' }], 'dusun', hm[2], 'dalam perjalanan', 1.2, { vehicle: S.vehicles.colt, fee: 590000, urgency: 'mendesak', note: 'Perbaikan atap balai dusun.', payment: S.payments[1] }),
      sup(3, 'PSK-2610-0003', 'Kelompok Tani Maju', 'kustom', [{ name: 'Mesin penggiling kopi', qty: 2, unit: 'unit' }], 'gudang', 'Gudang atau posko desa', 'menunggu', 1.5, { custom: 'Peralatan pengolahan kopi', vehicle: { name: 'Ditentukan setelah pemasok ditemukan', cap: '-', fee: 0 }, eta: 'Estimasi proses 5-14 hari (belum ada mitra tetap)', fee: 0, driver: '-', plate: '-', payment: S.payments[3] })
    ],
    funds: [
      { id: 1, type: 'masuk', kind: 'dana_desa', amount: 45000000, category: 'Dana Desa', description: 'Pencairan dana desa tahap 1', created: M(5, 5) },
      { id: 2, type: 'keluar', kind: 'pembelian', amount: 12500000, category: 'Pembangunan', description: 'Pembelian material jalan dusun', created: M(5, 18) },
      { id: 3, type: 'masuk', kind: 'iuran', amount: 2400000, category: 'Iuran Warga', description: 'Iuran kebersihan dan keamanan', created: M(4, 3) },
      { id: 4, type: 'keluar', kind: 'pembelian', amount: 6800000, category: 'Kesehatan', description: 'Pembelian obat posyandu', created: M(4, 14) },
      { id: 5, type: 'keluar', kind: 'pembelian', amount: 9300000, category: 'Pasokan dari Kota', description: 'Pembelian beras dan minyak untuk warga', created: M(3, 7) },
      { id: 6, type: 'masuk', kind: 'penjualan', amount: 4200000, category: 'Hasil Usaha Desa', description: 'Penjualan beras dan minyak ke warga (kios desa)', created: M(3, 12) },
      { id: 7, type: 'masuk', kind: 'dana_desa', amount: 45000000, category: 'Dana Desa', description: 'Pencairan dana desa tahap 2', created: M(3, 20) },
      { id: 8, type: 'keluar', kind: 'pembelian', amount: 15200000, category: 'Pembangunan', description: 'Perbaikan jembatan penghubung dusun', created: M(2, 9) },
      { id: 9, type: 'masuk', kind: 'iuran', amount: 3100000, category: 'Iuran Warga', description: 'Iuran warga bulan ini', created: M(2, 25) },
      { id: 10, type: 'keluar', kind: 'pembelian', amount: 4500000, category: 'Pendidikan', description: 'Pembelian buku dan alat tulis SD', created: M(1, 6) },
      { id: 11, type: 'masuk', kind: 'penjualan', amount: 5600000, category: 'Hasil Usaha Desa', description: 'Penjualan kopi dan hasil kebun lewat pasar desa', created: M(1, 14) },
      { id: 12, type: 'keluar', kind: 'operasional', amount: 1200000, category: 'Jaringan & Teknologi', description: 'Perangkat WiFi desa dan kabel', created: M(1, 15) },
      { id: 13, type: 'masuk', kind: 'iuran', amount: 2800000, category: 'Iuran Warga', description: 'Iuran warga bulan ini', created: M(0, 2) },
      { id: 14, type: 'keluar', kind: 'pembelian', amount: 3900000, category: 'Lainnya', description: 'Listrik dan pemeliharaan kantor desa', created: M(0, 4) }
    ],
    fundcfg: { budget: { 'Pembangunan': 40000000, 'Kesehatan': 12000000, 'Pendidikan': 10000000, 'Pasokan dari Kota': 20000000, 'Jaringan & Teknologi': 8000000, 'Lainnya': 8000000 }, paid: {} },
    products: [
      prod(1, 'Kopi Bubuk Lokal', 'Hasil Kebun', 45000, 24, 'keduanya', 'Bu Marta Siagian', 'Dusun Sipagabu Dolok, depan gereja', 'Kopi sangrai bubuk dari kebun warga, kemasan 250 gram.', 'kopi', 'Setiap hari 07.00 - 18.00', 6),
      prod(2, 'Madu Hutan', 'Hasil Kebun', 85000, 18, 'keduanya', 'Pak Binsar', 'Dusun Huta Toruan', 'Madu hutan murni, botol 500 ml.', 'madu', 'Senin - Sabtu 08.00 - 17.00', 5),
      prod(3, 'Beras Lokal', 'Kebutuhan Harian', 14000, 200, 'keduanya', 'Kelompok Tani Maju', 'Dusun Nawasan, gudang kelompok', 'Beras dari sawah desa, harga per kilogram.', 'beras', 'Senin - Jumat 08.00 - 16.00', 5),
      prod(4, 'Telur Ayam Kampung', 'Hasil Ternak', 4000, 120, 'motor', 'Pak Jaya', 'Dusun Pamaratan', 'Harga per butir, diantar pagi hari.', 'telur', 'Setiap hari 06.00 - 10.00', 4),
      prod(5, 'Keripik Singkong', 'Makanan', 15000, 55, 'keduanya', 'Warung Bu Nur', 'Dusun Batu Hallung', 'Keripik singkong renyah, bungkus 250 gram.', 'keripik', 'Setiap hari 08.00 - 20.00', 3),
      prod(6, 'Pisang Raja', 'Hasil Kebun', 20000, 0, 'keduanya', 'Pak Anton', 'Dusun Sianggungon', 'Satu sisir, dipetik saat dipesan.', 'pisang', 'Senin - Sabtu 07.00 - 15.00', 2),
      prod(7, 'Ulos Tenun Tangan', 'Kerajinan', 350000, 6, 'ambil', 'Ibu Lena Sitorus', 'Dusun Sigaol, rumah tenun', 'Kain ulos tenun tangan. Pembelian sebaiknya datang langsung melihat motif.', 'ulos', 'Senin - Sabtu 09.00 - 16.00', 2),
      prod(8, 'Ikan Mas Segar', 'Hasil Ikan', 38000, 30, 'keduanya', 'Pak Rudi', 'Dusun Sitabotabo, kolam', 'Ikan mas dari kolam warga, harga per kilogram.', 'ikan', 'Pagi 06.00 - 10.00', 1)
    ],
    orders: [
      { id: 1, code: 'PSN-2610-0001', productId: 2, product: 'Madu Hutan', price: 85000, qty: 2, method: 'motor', buyer: 'Bu Rosmaida', phone: '08xxxxxxxxxx', hamlet: hm[0], address: 'Rumah cat hijau dekat gereja', fee: 5000, payment: 'Tunai saat ambil atau saat diantar', slot: 'Pagi (07.00 - 10.00)', pickCode: '4821', seller: 'Pak Binsar', status: 'diantar', created: D(1) }
    ],
    posts: [
      { id: 1, title: 'Jadwal kerja bakti perbaikan jalan dusun', body: 'Warga diharapkan hadir hari Minggu pukul 07.00. Bawa cangkul dan sekop. Konsumsi disiapkan ibu-ibu PKK.', category: 'Pengumuman', author: 'Admin Desa', image: '', loc: null, likes: 12, likedBy: [], replies: [{ author: 'Pak Anwar', body: 'Siap, kami dari dusun Pamaratan ikut membantu.', at: H(20) }], created: D(2) },
      { id: 2, title: 'Tips menyimpan hasil panen agar tahan lama', body: 'Ada yang punya pengalaman menyimpan gabah di musim hujan? Gabah saya sering lembap.', category: 'Pertanian', author: 'Pak Jaya', image: 'img/gal-kebun.svg', loc: { label: 'Kebun Dusun Nawasan' }, likes: 7, likedBy: [], replies: [{ author: 'Bu Marta', body: 'Jemur sampai kering, lalu simpan di tempat berventilasi.', at: H(30) }], created: D(3) },
      { id: 3, title: 'Posyandu balita bulan ini', body: 'Posyandu diadakan Kamis pagi. Bawa buku KIA.', category: 'Kesehatan', author: 'Bu Rosmaida', image: '', loc: null, likes: 9, likedBy: [], replies: [], created: D(1) }
    ],
    chat: [
      { id: 1, room: 'umum', author: 'Bu Rosmaida', body: 'Selamat pagi semuanya, mari saling menjaga kebersihan lingkungan.', created: H(5) },
      { id: 2, room: 'umum', author: 'Pak Anwar', body: 'Betul, minggu ini kami bersihkan parit di dusun.', created: H(4) },
      { id: 3, room: 'pasar', author: 'Pak Rudi', body: 'Ikan mas segar baru dipanen pagi ini.', created: H(3) },
      { id: 4, room: 'darurat', author: 'Admin Desa', body: 'Kanal ini khusus kabar darurat. Hubungi 112 untuk bantuan segera.', created: H(8) }
    ],
    tickets: [
      { id: 1, code: 'TKT-2610-0001', type: 'laporan', target: 'admin', subject: 'Lampu jalan dusun mati', body: 'Lampu jalan dekat jembatan mati sejak tiga hari lalu.', name: 'Pak Anwar', phone: '08xxxxxxxxxx', extra: { jenis: 'Infrastruktur (jalan, jembatan, lampu)', dusun: hm[4], pihak: 'Petugas listrik desa', tanggal: D(3).slice(0, 10), jujur: true }, status: 'ditangani', created: D(2) }
    ],
    cctvlog: [
      { id: 1, cam: 'Kantor Desa', who: 'Bu Rosmaida', at: H(26), reason: 'Memeriksa kegiatan di halaman kantor' },
      { id: 2, cam: 'Persimpangan Jalan Utama', who: 'Pak Anwar', at: H(10), reason: 'Memastikan jalan aman' }
    ],
    cctvsnap: [{ id: 1, cam: 'Jembatan / Aliran Air', who: 'Pak Anwar', at: H(30), reason: 'Bukti kondisi jembatan untuk laporan' }],
    cctvrec: rec,
    cctvblock: [],
    history: [], bookmarks: []
  };
}

/* Data awal untuk logistik, pasar (ulasan, verifikasi), dana desa (pengajuan, APBDes), dan pemantauan jaringan. TODO-ISI: ganti dengan data nyata. */
function makeSeedExtra() {
  const base = makeSeedBase(), D = d => new Date(Date.now() - d * 864e5).toISOString(), F = d => new Date(Date.now() + d * 864e5).toISOString(), H = CONFIG.village.hamlets.map(h => h.name);
  const BASE = { Beras: 14000, 'Minyak goreng': 18000, Gula: 17000, Telur: 30000, 'Mi instan': 115000, Garam: 8000, Semen: 70000, Seng: 65000, 'Kayu balok': 85000, Paku: 25000, Pasir: 600000, 'Cat tembok': 180000, 'Bibit padi': 15000, Pupuk: 180000, 'Tabung gas LPG': 22000, 'Bahan bakar': 12000 };
  const sup = CONFIG.supply.suppliers, prices = []; let pid = 1;
  Object.entries(sup).forEach(([cat, sp], i) => (CONFIG.supply.catalog[cat] || []).forEach(([name, unit]) => { if (BASE[name]) [0.97, 1.0, 1.05].forEach((m, k) => prices.push({ id: pid++, supplier: k === 0 ? sp.name : k === 1 ? sp.name + ' (cabang)' : sp.name + ' (agen)', cat, item: name, unit, price: Math.round(BASE[name] * m * (1 + i * .004) / 100) * 100, updated: D(2) })); }));
  const netlog = []; let nid = 1;
  H.forEach((h, hi) => { for (let k = 47; k >= 0; k--) { const t = new Date(Date.now() - k * 18e5), hr = t.getHours() + t.getMinutes() / 60, load = Math.max(0, Math.sin((hr - 6) / 24 * Math.PI * 2 - 1) * .5 + .55), up = !(hi === 3 && k >= 20 && k <= 23); netlog.push({ id: nid++, at: t.toISOString(), dusun: h, up: up ? 1 : 0, clients: up ? Math.round(3 + load * (14 - hi)) : 0, rx: up ? +(load * (9 - hi * .5) + .8).toFixed(1) : 0, tx: up ? +(load * (3 - hi * .2) + .3).toFixed(1) : 0 }); } });
  const code = (n) => 'GX-' + (n * 7919 % 99991).toString(36).toUpperCase().padStart(5, '0');
  return {
    warehouse: [
      { id: 1, name: 'Beras', unit: 'kg', qty: 120, min: 50, loc: 'Rak A', updated: D(1), log: [{ at: D(3), delta: 200, by: 'Admin Desa', note: 'Stok awal' }, { at: D(1), delta: -80, by: 'Admin Desa', note: 'Dibagikan ke dusun' }] },
      { id: 2, name: 'Minyak goreng', unit: 'liter', qty: 40, min: 20, loc: 'Rak A', updated: D(2), log: [] }, { id: 3, name: 'Gula', unit: 'kg', qty: 35, min: 40, loc: 'Rak A', updated: D(2), log: [] },
      { id: 4, name: 'Semen', unit: 'sak', qty: 30, min: 20, loc: 'Gudang B', updated: D(4), log: [] }, { id: 5, name: 'Seng', unit: 'lembar', qty: 18, min: 20, loc: 'Gudang B', updated: D(4), log: [] },
      { id: 6, name: 'Tabung gas LPG', unit: 'tabung', qty: 12, min: 10, loc: 'Gudang C', updated: D(1), log: [] }, { id: 7, name: 'Bibit padi', unit: 'kg', qty: 60, min: 30, loc: 'Rak C', updated: D(5), log: [] }
    ],
    batches: [
      { id: 1, item: 'Beras', unit: 'kg', cat: 'pangan', price: 14200, fee: 180000, target: 300, deadline: F(2), status: 'terbuka', created: D(1), participants: [{ name: base.products[0].seller, qty: 50, hamlet: H[0], at: D(1) }, { name: base.products[1].seller, qty: 80, hamlet: H[1], at: D(1) }] },
      { id: 2, item: 'Semen', unit: 'sak', cat: 'bahan_bangunan', price: 68000, fee: 350000, target: 100, deadline: F(3), status: 'terbuka', created: D(1), participants: [{ name: base.products[2].seller, qty: 20, hamlet: H[2], at: D(1) }] }
    ],
    prices, netlog,
    outages: [{ id: 1, dusun: H[3], cause: 'Antena tertutup pohon, teknisi memangkas dahan', status: 'selesai', start: D(1), end: D(0.9), created: D(1) }],
    vouchers: [1, 2, 3, 4, 5, 6].map(n => ({ id: n, code: code(n), hours: n < 4 ? 24 : 72, quotaMb: n < 4 ? 500 : 1500, dusun: H[n % H.length], status: n === 1 ? 'dipakai' : 'baru', usedBy: n === 1 ? 'Bu Sari' : '', usedAt: n === 1 ? D(0.3) : '', created: D(2) })),
    reviews: [{ id: 1, productId: 1, buyer: 'Bu Sari', stars: 5, text: 'Barang sesuai dan penjual ramah.', created: D(2) }, { id: 2, productId: 1, buyer: 'Pak Anwar', stars: 4, text: 'Bagus, pengantaran agak sore.', created: D(1) }, { id: 3, productId: 2, buyer: 'Bu Sari', stars: 5, text: 'Segar dan murah.', created: D(1) }],
    verifications: [{ id: 1, seller: base.products[0].seller, by: 'Admin Desa', created: D(5) }, { id: 2, seller: base.products[1].seller, by: 'Admin Desa', created: D(4) }],
    ordermsgs: [{ id: 1, orderId: (base.orders[0] || {}).id || 1, author: (base.orders[0] || {}).buyer || 'Bu Sari', body: 'Mohon diantar sebelum jam 5 sore ya.', created: D(0.5) }],
    cityreq: [{ id: 1, product: 'Kopi arabika', qty: '50 kg', buyer: 'Kedai Kopi di kota', contact: '08xxxxxxxxxx', note: 'Butuh pasokan rutin tiap bulan.', status: 'baru', created: D(1) }],
    fundreq: [
      { id: 1, desc: 'Beli semen dan seng untuk perbaikan balai dusun', amount: 3500000, category: 'Pembangunan', kind: 'pembelian', by: 'Bendahara', status: 'menunggu', receipts: [], created: D(1) },
      { id: 2, desc: 'Pembelian obat dan vitamin posyandu', amount: 1800000, category: 'Kesehatan', kind: 'pembelian', by: 'Bendahara', status: 'disetujui', receipts: [], decision: { by: 'Kepala Desa', note: 'Disetujui untuk kebutuhan posyandu', at: D(3) }, created: D(4) }
    ],
    apbdes: { year: new Date().getFullYear(), pendapatan: { 'Dana Desa': 720000000, 'Alokasi Dana Desa': 380000000, 'Pendapatan Asli Desa': 25000000, 'Bagi Hasil Pajak/Retribusi': 12000000 }, belanja: { 'Penyelenggaraan Pemerintahan Desa': 400000000, 'Pelaksanaan Pembangunan Desa': 520000000, 'Pembinaan Kemasyarakatan': 90000000, 'Pemberdayaan Masyarakat': 90000000, 'Penanggulangan Bencana dan Keadaan Mendesak': 37000000 } }
  };
}
function makeSeed() { return { ...makeSeedBase(), ...makeSeedExtra() }; }
