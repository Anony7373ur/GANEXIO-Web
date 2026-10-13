/* DATA CONTOH (DEMO) agar setiap halaman terlihat hidup saat dinilai.
   TODO-ISI: hapus atau ganti dengan data desa yang sebenarnya.
   Naikkan SEED_VERSION agar data contoh dibuat ulang di peramban yang sudah pernah membuka website. */
const SEED_VERSION = 4;
function makeSeed() {
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
