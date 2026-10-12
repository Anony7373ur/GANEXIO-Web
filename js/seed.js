/* DATA CONTOH (DEMO) agar setiap halaman terlihat hidup saat dinilai.
   TODO-ISI: hapus atau ganti data contoh ini dengan data desa yang sebenarnya.
   Ubah SEED_VERSION agar data contoh dibuat ulang di peramban yang sudah pernah membuka website. */
const SEED_VERSION = 3;
function makeSeed() {
  const D = d => new Date(Date.now() - d * 864e5).toISOString();
  const H = h => new Date(Date.now() - h * 36e5).toISOString();
  const M = (monthsAgo, day) => { const t = new Date(); t.setMonth(t.getMonth() - monthsAgo, day); t.setHours(9, 0, 0, 0); return t.toISOString(); };
  const hist = (...s) => s.map((st, i) => ({ status: st, at: D(3 - i) }));
  return {
    supplies: [
      { id: 1, code: 'PSK-2610-0001', name: 'Bu Sari', category: 'pangan', items: [{ name: 'Beras', qty: 100, unit: 'kg' }, { name: 'Minyak goreng', qty: 20, unit: 'liter' }], urgency: 'biasa', hamlet: 'Dusun 1', note: 'Untuk persediaan posyandu dan dapur umum.', status: 'dikirim', history: hist('menunggu', 'diproses', 'dikirim'), created: D(3) },
      { id: 2, code: 'PSK-2610-0002', name: 'Pak Anwar', category: 'bahan_bangunan', items: [{ name: 'Semen', qty: 40, unit: 'sak' }, { name: 'Seng', qty: 30, unit: 'lembar' }], urgency: 'mendesak', hamlet: 'Dusun 3', note: 'Perbaikan atap balai dusun.', status: 'diproses', history: hist('menunggu', 'diproses'), created: D(2) },
      { id: 3, code: 'PSK-2610-0003', name: 'Kelompok Tani Maju', category: 'sumber_daya', items: [{ name: 'Bibit padi', qty: 50, unit: 'kg' }, { name: 'Pupuk', qty: 25, unit: 'karung' }], urgency: 'biasa', hamlet: 'Dusun 2', note: '', status: 'menunggu', history: hist('menunggu'), created: D(1) }
    ],
    funds: [
      { id: 1, type: 'masuk', amount: 45000000, category: 'Dana Desa', description: 'Pencairan dana desa tahap 1', created: M(5, 5) },
      { id: 2, type: 'keluar', amount: 12500000, category: 'Pembangunan', description: 'Material jalan dusun 2', created: M(5, 18) },
      { id: 3, type: 'masuk', amount: 2400000, category: 'Iuran Warga', description: 'Iuran kebersihan dan keamanan', created: M(4, 3) },
      { id: 4, type: 'keluar', amount: 6800000, category: 'Kesehatan', description: 'Obat posyandu dan pemeriksaan ibu hamil', created: M(4, 14) },
      { id: 5, type: 'keluar', amount: 9300000, category: 'Pasokan dari Kota', description: 'Ongkos kirim pasokan beras dan minyak', created: M(3, 7) },
      { id: 6, type: 'masuk', amount: 45000000, category: 'Dana Desa', description: 'Pencairan dana desa tahap 2', created: M(3, 20) },
      { id: 7, type: 'keluar', amount: 15200000, category: 'Pembangunan', description: 'Perbaikan jembatan penghubung dusun', created: M(2, 9) },
      { id: 8, type: 'masuk', amount: 3100000, category: 'Iuran Warga', description: 'Iuran warga bulan ini', created: M(2, 25) },
      { id: 9, type: 'keluar', amount: 4500000, category: 'Pendidikan', description: 'Buku dan alat tulis sekolah dasar', created: M(1, 6) },
      { id: 10, type: 'keluar', amount: 7600000, category: 'Jaringan & Internet', description: 'Perangkat WiFi desa dan kabel', created: M(1, 15) },
      { id: 11, type: 'masuk', amount: 2800000, category: 'Iuran Warga', description: 'Iuran warga bulan ini', created: M(0, 2) },
      { id: 12, type: 'keluar', amount: 3900000, category: 'Lainnya', description: 'Listrik dan pemeliharaan balai desa', created: M(0, 4) }
    ],
    products: [
      { id: 1, name: 'Madu Hutan Asli', category: 'Hasil Kebun', price: 85000, stock: 18, delivery: 'keduanya', seller: 'Bu Marta', phone: '08xxxxxxxxxx', shop: 'Dusun 1, depan masjid', description: 'Madu hutan murni, botol 500 ml.', image: '', created: D(6) },
      { id: 2, name: 'Ikan Asin Kering', category: 'Hasil Laut', price: 30000, stock: 40, delivery: 'keduanya', seller: 'Pak Rudi', phone: '08xxxxxxxxxx', shop: 'Dusun 4, dermaga', description: 'Ikan asin kering pilihan, per 500 gram.', image: '', created: D(5) },
      { id: 3, name: 'Tenun Khas Desa', category: 'Kerajinan', price: 250000, stock: 6, delivery: 'ambil', seller: 'Ibu Lena', phone: '08xxxxxxxxxx', shop: 'Dusun 2, rumah tenun', description: 'Kain tenun tangan dengan motif tradisional.', image: '', created: D(5) },
      { id: 4, name: 'Telur Ayam Kampung', category: 'Hasil Ternak', price: 4000, stock: 120, delivery: 'motor', seller: 'Pak Jaya', phone: '08xxxxxxxxxx', shop: 'Dusun 3', description: 'Harga per butir, diantar pagi hari.', image: '', created: D(4) },
      { id: 5, name: 'Keripik Singkong', category: 'Makanan', price: 15000, stock: 55, delivery: 'keduanya', seller: 'Warung Bu Nur', phone: '08xxxxxxxxxx', shop: 'Dusun 1', description: 'Keripik singkong renyah, bungkus 250 gram.', image: '', created: D(3) },
      { id: 6, name: 'Pisang Raja', category: 'Hasil Kebun', price: 20000, stock: 0, delivery: 'keduanya', seller: 'Pak Anton', phone: '08xxxxxxxxxx', shop: 'Dusun 2', description: 'Satu sisir, dipetik saat dipesan.', image: '', created: D(2) }
    ],
    orders: [
      { id: 1, code: 'PSN-2610-0001', productId: 1, product: 'Madu Hutan Asli', price: 85000, qty: 2, method: 'motor', buyer: 'Bu Sari', phone: '08xxxxxxxxxx', hamlet: 'Dusun 1', address: 'Rumah cat hijau dekat balai desa', fee: 3000, status: 'diantar', created: D(1) }
    ],
    posts: [
      { id: 1, title: 'Jadwal kerja bakti perbaikan jalan dusun 2', body: 'Warga diharapkan hadir hari Minggu pukul 07.00. Bawa cangkul dan sekop. Konsumsi disiapkan oleh ibu-ibu PKK.', category: 'Pengumuman', author: 'Admin Desa', likes: 12, likedBy: [], replies: [{ author: 'Pak Anwar', body: 'Siap, kami dari dusun 3 ikut membantu.', at: H(20) }], created: D(2) },
      { id: 2, title: 'Tips menyimpan hasil panen agar tahan lama', body: 'Ada yang punya pengalaman menyimpan gabah di musim hujan? Gabah saya sering lembap.', category: 'Pertanian', author: 'Pak Jaya', likes: 7, likedBy: [], replies: [{ author: 'Bu Marta', body: 'Jemur sampai kadar air rendah, lalu simpan di tempat bertumpuk dan berventilasi.', at: H(30) }], created: D(3) },
      { id: 3, title: 'Posyandu balita bulan ini', body: 'Posyandu diadakan Kamis pagi di balai dusun 1. Bawa buku KIA.', category: 'Kesehatan', author: 'Bu Sari', likes: 9, likedBy: [], replies: [], created: D(1) }
    ],
    chat: [
      { id: 1, room: 'umum', author: 'Bu Sari', body: 'Selamat pagi semuanya, WiFi di dusun 1 sudah lancar ya.', created: H(5) },
      { id: 2, room: 'umum', author: 'Pak Anwar', body: 'Betul, tadi saya sudah coba video call dengan anak di kota.', created: H(4) },
      { id: 3, room: 'pasar', author: 'Pak Rudi', body: 'Ikan segar baru datang pagi ini di dermaga.', created: H(3) },
      { id: 4, room: 'darurat', author: 'Admin Desa', body: 'Kanal ini khusus kabar darurat. Hubungi 112 untuk bantuan segera.', created: H(8) }
    ],
    tickets: [
      { id: 1, code: 'TKT-2610-0001', type: 'laporan', target: 'admin', subject: 'Lampu jalan dusun 3 mati', body: 'Lampu jalan di dekat jembatan mati sejak tiga hari lalu.', name: 'Pak Anwar', phone: '08xxxxxxxxxx', extra: { kategori: 'Infrastruktur', dusun: 'Dusun 3' }, status: 'dibaca', created: D(2) }
    ],
    speedlog: []
  };
}
