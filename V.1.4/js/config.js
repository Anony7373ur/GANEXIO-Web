/* =====================================================================
   GANEXIO - DESA SIPAGABU : PUSAT PENGATURAN ISI WEBSITE
   Semua teks, nama, foto, dan kontak ada di file ini.
   TIP VS CODE: tekan Ctrl+Shift+F lalu cari  TODO-ISI  untuk menemukan
   bagian yang masih harus dicek atau diisi sendiri.
   Sumber data desa: Wikipedia (Sipagabu, Nassau, Toba), BPS 2018, Permendagri 6/2008.
   Mohon cocokkan dengan data resmi kantor desa sebelum dipakai sungguhan.
   ===================================================================== */
const CONFIG = {

  /* ---------- IDENTITAS ---------- */
  site: {
    name: 'Ganexio',
    tagline: 'Menghubungkan desa dengan dunia',
    about: 'Ganexio adalah portal digital Desa Sipagabu. Dengan satu website, warga dapat meminta pasokan dari kota, berbelanja di pasar desa, memantau fasilitas umum, berdiskusi, mencari informasi di internet, dan mengurus layanan desa, dengan pencatatan yang terbuka dan mudah dipakai.',
    goals: [
      'Mempermudah warga memperoleh kebutuhan dari kota dengan pengiriman yang dapat dilacak.',
      'Menggerakkan ekonomi desa lewat pasar lokal dan pengelolaan dana desa yang transparan.',
      'Menghubungkan warga, perangkat desa, dan dunia luar melalui forum, obrolan, dan akses internet.',
      'Menjaga keamanan bersama dengan pemantauan fasilitas umum yang tercatat dan bertanggung jawab.'
    ],
    email: 'tim@ganexio.id', // TODO-ISI: email resmi tim
    version: '1.0',
    developer: { name: 'Gabriel Christian Ronaldo Panjaitan', email: 'gabrielcrpanjaitan@gmail.com', role: 'Developer dan pengelola website' }
  },

  /* ---------- PROFIL DESA SIPAGABU ---------- */
  village: {
    name: 'Desa Sipagabu', short: 'Sipagabu',
    district: 'Nassau', formerDistrict: 'Habinsaran', regency: 'Toba', province: 'Sumatera Utara',
    postal: '22383', code: '12.12.21.2004',
    // Foto asli desa (opsional): taruh file di folder img/ lalu tulis namanya, mis. 'sipagabu.jpg'.
    // TODO-ISI: kosong = memakai ilustrasi bawaan. Foto otomatis dipakai sebagai latar halaman Beranda.
    photo: '',
    // Foto dari internet (Wikimedia Commons) yang dicari otomatis saat online. Urutan: nama desa, kecamatan, kabupaten, danau.
    onlineImageQueries: ['Sipagabu', 'Kecamatan Nassau Toba', 'Toba Regency', 'Danau Toba'],
    useOnlinePhoto: true,
    mapQuery: 'Desa Sipagabu, Nassau, Toba, Sumatera Utara', // dipakai untuk peta Google
    description: 'Sipagabu adalah sebuah desa di Kecamatan Nassau, Kabupaten Toba, Sumatera Utara. Wilayah ini semula termasuk Kecamatan Habinsaran dan kini masuk Kecamatan Nassau. Penduduknya mayoritas bersuku Toba dan beragama Kristen, dengan kehidupan yang erat dengan pertanian dan hutan di sekitar desa.',
    // TODO-ISI: ganti dengan visi dan misi resmi dari RPJM Desa Sipagabu
    vision: 'Terwujudnya Desa Sipagabu yang mandiri, sejahtera, dan terhubung, dengan pelayanan yang terbuka bagi seluruh warga.',
    mission: [
      'Meningkatkan pelayanan desa yang cepat, terbuka, dan mudah diakses semua dusun.',
      'Memperkuat ekonomi warga lewat pertanian, usaha kecil, dan pasar desa.',
      'Mengelola dana desa secara transparan dan dapat dipertanggungjawabkan.',
      'Memperluas akses internet, pendidikan, dan kesehatan bagi seluruh warga.',
      'Menjaga adat, budaya Batak Toba, dan kerukunan antarwarga.'
    ],
    // Dusun menurut Wikipedia (Sipagabu, Nassau, Toba). TODO-ISI: cocokkan dengan data desa. Ongkos antar motor (Rp) per dusun juga sesuaikan.
    hamlets: [
      { name: 'Dusun Sipagabu Dolok', fee: 5000 }, { name: 'Dusun Huta Toruan', fee: 5000 }, { name: 'Dusun Batu Hallung', fee: 7000 }, { name: 'Dusun Nawasan', fee: 7000 },
      { name: 'Dusun Pamaratan', fee: 8000 }, { name: 'Dusun Sianggungon', fee: 8000 }, { name: 'Dusun Sigaol', fee: 10000 }, { name: 'Dusun Sitabotabo', fee: 10000 }
    ],
    // Kependudukan. Sumber: Wikipedia (data 2015), BPS 2018. TODO-ISI: perbarui dengan data desa terbaru.
    stats: [
      { label: 'Penduduk (2015)', value: 531, suffix: ' jiwa' },
      { label: 'Luas wilayah (BPS 2018)', value: 34.84, suffix: ' km²', dec: 2 },
      { label: 'Kepadatan', value: 15, suffix: ' jiwa/km²' }
    ],
    demography: [
      ['Jumlah penduduk', '531 jiwa (data 2015)'], ['Suku mayoritas', 'Batak Toba'], ['Agama mayoritas', 'Kristen'],
      ['Luas wilayah', '34,84 km² (BPS 2018). Sumber lain mencatat 50,36 km²'], ['Jumlah dusun', '8 dusun'],
      ['Jumlah kepala keluarga', '-  (TODO-ISI)'], ['Mata pencaharian utama', 'Pertanian dan hasil hutan (TODO-ISI: cek data desa)']
    ],
    // Sejarah ditulis hati-hati dari sumber yang ada. TODO-ISI: tambahkan cerita lisan dari tetua adat dan tokoh desa.
    history: [
      { year: 'Dahulu', title: 'Wilayah adat Batak Toba', text: 'Sipagabu dihuni masyarakat Batak Toba yang hidup dari berladang dan hasil hutan. TODO-ISI: tulis asal-usul nama Sipagabu dan marga pendiri huta.' },
      { year: '2008', title: 'Dicatat dalam wilayah Habinsaran', text: 'Permendagri Nomor 6 Tahun 2008 mencatat Sipagabu semula sebagai wilayah Kecamatan Habinsaran.' },
      { year: 'Kini', title: 'Bagian Kecamatan Nassau', text: 'Sipagabu tercatat sebagai salah satu dari 10 desa di Kecamatan Nassau, Kabupaten Toba, dengan kode pos 22383.' },
      { year: '2026', title: 'Ganexio hadir', text: 'Portal digital Ganexio dibuat untuk membantu warga Sipagabu terhubung, bertransaksi, dan mengurus layanan desa.' }
    ],
    // Fasilitas yang tercatat. "-" berarti belum ada atau belum tercatat. TODO-ISI: cek langsung di desa.
    facilities: [
      { ic: 'book', title: 'Sekolah Dasar', text: 'SDN 173622 Sipagabu' },
      { ic: 'book', title: 'SMP / SMA / SMK', text: '-' },
      { ic: 'home', title: 'Gereja', text: '4 bangunan gereja' },
      { ic: 'home', title: 'Masjid / Langgar', text: '-' },
      { ic: 'heart', title: 'Puskesmas / Pustu', text: '-' },
      { ic: 'home', title: 'Kantor / Balai Desa', text: '- (TODO-ISI: isi jika ada)' },
      { ic: 'bolt', title: 'Listrik', text: '- (TODO-ISI: cek)' },
      { ic: 'wifi', title: 'WiFi Desa (Ganexio)', text: '- (belum terpasang, lihat rancangan di Akses Internet)' }
    ],
    hours: [ // TODO-ISI: jam pelayanan kantor desa
      { day: 'Senin - Kamis', time: '08.00 - 15.00' }, { day: 'Jumat', time: '08.00 - 11.30' }, { day: 'Sabtu - Minggu', time: 'Tutup (darurat hubungi kontak desa)' }
    ],
    // Galeri memakai ilustrasi bawaan. TODO-ISI: ganti dengan foto asli (nama file di folder img/)
    gallery: [
      { src: 'gal-panorama.svg', cap: 'Perbukitan sekitar desa' }, { src: 'gal-kantor.svg', cap: 'Kantor desa' }, { src: 'gal-sekolah.svg', cap: 'SDN 173622 Sipagabu' },
      { src: 'gal-gereja.svg', cap: 'Rumah ibadah' }, { src: 'gal-kebun.svg', cap: 'Lahan pertanian' }, { src: 'gal-jalan.svg', cap: 'Jalan desa' }
    ]
  },

  /* ---------- PEMERINTAH DESA ---------- */
  officials: [
    // Kepala Desa tercatat pada Wikipedia (2020). TODO-ISI: pastikan nama yang menjabat sekarang. Foto: nama file di img/.
    { name: 'Ebin Siagian', role: 'Kepala Desa Sipagabu', phone: '08xxxxxxxxxx', photo: '', note: 'Tercatat menjabat pada 2020. TODO-ISI: cek pejabat terbaru.' },
    { name: '[TODO-ISI: nama]', role: 'Sekretaris Desa', phone: '08xxxxxxxxxx', photo: '' },
    { name: '[TODO-ISI: nama]', role: 'Bendahara Desa', phone: '08xxxxxxxxxx', photo: '' },
    { name: '[TODO-ISI: nama]', role: 'Kepala Dusun', phone: '08xxxxxxxxxx', photo: '' }
  ],

  /* ---------- TIM DEVELOPER (tampil di halaman Kontak) ---------- */
  team: [
    // TODO-ISI: nama, peran, nomor HP, email, profil singkat, dan foto (nama file di folder img/) tiga developer
    { name: 'Gabriel Christian Ronaldo Panjaitan', role: 'Developer dan pengelola website', phone: '08xxxxxxxxxx', email: 'gabrielcrpanjaitan@gmail.com', bio: 'TODO-ISI: tulis profil singkat.', photo: '' },
    { name: '[TODO-ISI: Developer 2]', role: 'Frontend / UI', phone: '08xxxxxxxxxx', email: '', bio: 'TODO-ISI: tulis profil singkat.', photo: '' },
    { name: '[TODO-ISI: Developer 3]', role: 'Jaringan / Database', phone: '08xxxxxxxxxx', email: '', bio: 'TODO-ISI: tulis profil singkat.', photo: '' }
  ],

  /* ---------- KONTAK ---------- */
  contacts: {
    emergency: [
      { name: 'Darurat Umum', number: '112', ic: 'alert' }, { name: 'Polisi', number: '110', ic: 'shield' }, { name: 'Pemadam Kebakaran', number: '113', ic: 'flame' },
      { name: 'Ambulans', number: '119', ic: 'heart' }, { name: 'Basarnas (SAR)', number: '115', ic: 'life' }
    ],
    external: [
      { name: 'Kantor Camat Nassau', role: 'Pemerintah Kecamatan Nassau (pusat di Desa Lumban Rau Tengah)', phone: '08xxxxxxxxxx', email: 'kec.nassau@tobakab.go.id' },
      { name: 'Dinas Komunikasi dan Informatika Kab. Toba', role: 'Pengajuan akses internet BAKTI untuk fasilitas desa', phone: '08xxxxxxxxxx', email: '' },
      { name: 'Puskesmas / RS Terdekat', role: 'Layanan kesehatan dan rujukan', phone: '08xxxxxxxxxx', email: '' },
      { name: 'Pemasok Bahan Pangan (kota)', role: 'Rekanan pasokan sembako', phone: '08xxxxxxxxxx', email: '' },
      { name: 'Pemasok Bahan Bangunan (kota)', role: 'Rekanan pasokan bahan bangunan', phone: '08xxxxxxxxxx', email: '' }
    ]
  },

  /* ---------- CCTV (HANYA AREA PUBLIK) ---------- */
  // url kosong = tayangan bawaan (simulasi lokal). kind: 'iframe' | 'mjpeg' | 'snapshot'.
  // ATURAN: kamera hanya boleh dipasang di area umum. Dilarang di halaman rumah, kamar, kamar mandi, atau area pribadi.
  cameras: [
    { id: 1, name: 'Kantor Desa', location: 'Halaman depan kantor desa (area publik)', url: '', kind: 'iframe', scene: 'plaza', area: 'Fasilitas pemerintah' },
    { id: 2, name: 'Persimpangan Jalan Utama', location: 'Simpang jalan desa (jalan umum)', url: '', kind: 'iframe', scene: 'road', area: 'Jalan umum' },
    { id: 3, name: 'Titik Kumpul / Lapangan', location: 'Lapangan terbuka desa (area umum)', url: '', kind: 'iframe', scene: 'market', area: 'Ruang terbuka' },
    { id: 4, name: 'Jembatan / Aliran Air', location: 'Titik pantau banjir (area umum)', url: '', kind: 'iframe', scene: 'water', area: 'Fasilitas umum' }
  ],
  cctvPolicy: { maxSnapshotsPerHour: 3, idleLockMinutes: 5, recordingDays: 7 },

  /* ---------- PASOKAN DARI KOTA ---------- */
  supply: {
    stepMs: 6000, // MODE OTOMATIS: status permintaan baru maju otomatis tiap 6 detik (menunggu > proses > dalam perjalanan > sampai). Isi 0 untuk mematikan; status lalu diubah admin.
    categories: [
      { id: 'pangan', ic: 'basket', title: 'Bahan Pangan', hint: 'Beras, minyak, gula, telur', lead: '1-2 hari' },
      { id: 'sumber_daya', ic: 'leaf', title: 'Sumber Daya Alam', hint: 'Bibit, pupuk, bahan bakar, air', lead: '2-3 hari' },
      { id: 'bahan_bangunan', ic: 'brick', title: 'Bahan Bangunan', hint: 'Semen, seng, kayu, pasir', lead: '2-4 hari' },
      { id: 'kesehatan', ic: 'heart', title: 'Kesehatan', hint: 'Obat dasar, alat kesehatan', lead: '1-2 hari' },
      { id: 'pendidikan', ic: 'book', title: 'Pendidikan', hint: 'Buku, alat tulis, seragam', lead: '2-4 hari' },
      { id: 'peralatan', ic: 'bolt', title: 'Peralatan & Jaringan', hint: 'Perkakas, kabel, panel surya', lead: '3-5 hari' },
      { id: 'kustom', ic: 'plus', title: 'Kustom (di luar daftar)', hint: 'Barang khusus. Butuh proses lebih lama karena belum ada mitra tetap', lead: '5-14 hari' }
    ],
    catalog: {
      pangan: [['Beras', 'kg'], ['Minyak goreng', 'liter'], ['Gula', 'kg'], ['Telur', 'kg'], ['Mi instan', 'dus'], ['Garam', 'kg']],
      sumber_daya: [['Bibit padi', 'kg'], ['Pupuk', 'karung'], ['Bahan bakar (solar)', 'liter'], ['Tabung gas LPG', 'tabung'], ['Pipa air', 'batang']],
      bahan_bangunan: [['Semen', 'sak'], ['Seng', 'lembar'], ['Kayu balok', 'batang'], ['Paku', 'kg'], ['Pasir', 'rit'], ['Cat tembok', 'kaleng']],
      kesehatan: [['Paracetamol', 'strip'], ['Vitamin', 'botol'], ['Masker', 'kotak'], ['Alat tensi', 'unit']],
      pendidikan: [['Buku tulis', 'dus'], ['Pensil', 'dus'], ['Seragam sekolah', 'set'], ['Papan tulis', 'unit']],
      peralatan: [['Kabel LAN outdoor', 'meter'], ['Cangkul', 'buah'], ['Panel surya', 'unit'], ['Genset kecil', 'unit']],
      kustom: []
    },
    // Moda pengiriman: tidak hanya ke dusun. TODO-ISI: sesuaikan titik pengambilan dengan kondisi desa.
    modes: [
      { id: 'dusun', title: 'Antar ke dusun', hint: 'Diantar sampai ke dusun pilihan', surcharge: 40000, needDusun: true },
      { id: 'balai', title: 'Titik distribusi desa (kantor/balai desa)', hint: 'Diturunkan di satu titik, warga mengambil sendiri', surcharge: 0 },
      { id: 'gudang', title: 'Gudang atau posko desa', hint: 'Barang disimpan di gudang desa, diambil sesuai jadwal', surcharge: 0 },
      { id: 'transit', title: 'Pos transit di jalan utama', hint: 'Ambil di pos transit jika jalan ke desa rusak atau terputus', surcharge: -20000 },
      { id: 'kolektif', title: 'Pengiriman kolektif (gabung warga lain)', hint: 'Menunggu jadwal rombongan, ongkos lebih hemat', surcharge: -40000 }
    ],
    payments: ['Bayar tunai di lokasi saat barang diambil', 'Bayar tunai di lokasi saat barang diantar', 'Dari kas desa (perlu persetujuan bendahara)', 'Patungan kelompok tani / warga'],
    // Kendaraan. TODO-ISI: sesuaikan dengan mitra angkutan sebenarnya.
    vehicles: {
      motor: { name: 'Motor roda tiga / bak', cap: '±300 kg', fee: 60000 },
      pickup: { name: 'Pickup L300 / Grand Max', cap: '±1 ton', fee: 180000 },
      engkel: { name: 'Truk Engkel (CDE)', cap: '±2,5 ton', fee: 350000 },
      colt: { name: 'Truk Colt Diesel (CDD)', cap: '±5 ton', fee: 550000 },
      tangki: { name: 'Mobil tangki kecil', cap: '±2.000 liter', fee: 400000 }
    },
    // Pemasok CONTOH. TODO-ISI: ganti dengan toko/perusahaan yang benar-benar bekerja sama.
    suppliers: {
      pangan: { name: 'UD Sembako Mitra (contoh)', type: 'Toko grosir', source: 'Gudang grosir Balige' },
      sumber_daya: { name: 'Toko Tani Makmur (contoh)', type: 'Toko pertanian', source: 'Agen pupuk Laguboti' },
      bahan_bangunan: { name: 'TB Bangun Jaya (contoh)', type: 'Toko bangunan', source: 'Gudang bahan bangunan Balige' },
      kesehatan: { name: 'Apotek Sehat (contoh)', type: 'Apotek', source: 'Apotek mitra Balige' },
      pendidikan: { name: 'Toko Buku Cerdas (contoh)', type: 'Toko buku', source: 'Distributor alat tulis Balige' },
      peralatan: { name: 'CV Teknik Nusantara (contoh)', type: 'Distributor peralatan', source: 'Distributor Medan' },
      kustom: { name: 'Sedang dicari tim Ganexio', type: 'Belum ada mitra tetap', source: 'Survei pemasok (butuh waktu lebih lama)' }
    },
    drivers: ['Pak Hotma', 'Pak Binsar', 'Pak Rudolf', 'Pak Mangapul']
  },

  /* ---------- PASAR DESA ---------- */
  market: {
    categories: ['Makanan', 'Hasil Kebun', 'Hasil Ternak', 'Hasil Ikan', 'Kerajinan', 'Kebutuhan Harian'],
    payments: ['Tunai saat ambil atau saat diantar', 'Transfer / QRIS (sesuai penjual)'],
    slots: ['Pagi (07.00 - 10.00)', 'Siang (11.00 - 14.00)', 'Sore (15.00 - 18.00)']
  },

  /* ---------- DANA DESA & BIAYA TEKNOLOGI ---------- */
  fund: {
    households: 140, // TODO-ISI: jumlah kepala keluarga (KK) Sipagabu. Contoh perkiraan dari 531 jiwa.
    marketFeePct: 2, // iuran pasar desa (% dari penjualan pasar). Ubah sesuai kesepakatan musyawarah desa.
    tiers: [ // Kondisi ekonomi desa berdasarkan rata-rata pendapatan per bulan. TODO-ISI: sesuaikan.
      { max: 3000000, label: 'Terbatas', capPct: 10, note: 'Prioritaskan intranet desa dan akses gratis (BAKTI/4G). Upah developer sukarela atau sangat kecil.' },
      { max: 10000000, label: 'Berkembang', capPct: 15, note: 'Bisa menambah sambungan cadangan dan upah developer kecil.' },
      { max: 1e12, label: 'Mandiri', capPct: 20, note: 'Mampu membiayai internet utama, perawatan rutin, dan upah developer layak.' }
    ],
    // Komponen biaya bulanan (perkiraan). fixed = biaya tetap yang harus dibayar. TODO-ISI: sesuaikan dengan kondisi nyata.
    techItems: [
      { id: 'domain', name: 'Domain dan hosting (dibagi per bulan)', amount: 45000, fixed: true, kind: 'operasional' },
      { id: 'internet', name: 'Langganan internet (4G / satelit)', amount: 300000, fixed: true, kind: 'operasional' },
      { id: 'listrik', name: 'Listrik server dan WiFi', amount: 60000, fixed: true, kind: 'operasional' },
      { id: 'rawat', name: 'Perawatan perangkat dan cadangan penggantian', amount: 150000, fixed: false, kind: 'operasional' },
      { id: 'upah', name: 'Upah tim developer (3 orang, disesuaikan)', amount: 600000, fixed: false, kind: 'upah' }
    ],
    approvalMin: 1000000, // pengeluaran sama atau di atas nilai ini wajib disetujui Kepala Desa
    bidang: { 'Pembangunan': 'Pelaksanaan Pembangunan Desa', 'Kesehatan': 'Pembinaan Kemasyarakatan', 'Pendidikan': 'Pemberdayaan Masyarakat', 'Pasokan dari Kota': 'Pemberdayaan Masyarakat', 'Jaringan & Teknologi': 'Penyelenggaraan Pemerintahan Desa', 'Lainnya': 'Penyelenggaraan Pemerintahan Desa' }, // kelompok biaya -> bidang APBDes
    budgetCats: ['Pembangunan', 'Kesehatan', 'Pendidikan', 'Pasokan dari Kota', 'Jaringan & Teknologi', 'Lainnya']
  },

  /* ---------- AKSES INTERNET ---------- */
  engines: [
    { id: 'google', name: 'Google', web: 'https://www.google.com/search?q=%s', img: 'https://www.google.com/search?tbm=isch&q=%s', vid: 'https://www.google.com/search?tbm=vid&q=%s', news: 'https://www.google.com/search?tbm=nws&q=%s', map: 'https://www.google.com/maps/search/%s' },
    { id: 'bing', name: 'Bing', web: 'https://www.bing.com/search?q=%s', img: 'https://www.bing.com/images/search?q=%s', vid: 'https://www.bing.com/videos/search?q=%s', news: 'https://www.bing.com/news/search?q=%s', map: 'https://www.bing.com/maps?q=%s' },
    { id: 'ddg', name: 'DuckDuckGo (privasi)', web: 'https://duckduckgo.com/?q=%s', img: 'https://duckduckgo.com/?iax=images&ia=images&q=%s', vid: 'https://duckduckgo.com/?iax=videos&ia=videos&q=%s', news: 'https://duckduckgo.com/?iar=news&ia=news&q=%s', map: 'https://duckduckgo.com/?iaxm=maps&q=%s' },
    { id: 'brave', name: 'Brave Search (hemat iklan)', web: 'https://search.brave.com/search?q=%s', img: 'https://search.brave.com/images?q=%s', vid: 'https://search.brave.com/videos?q=%s', news: 'https://search.brave.com/news?q=%s', map: 'https://www.openstreetmap.org/search?query=%s' },
    { id: 'wiki', name: 'Wikipedia (ensiklopedia)', web: 'https://id.wikipedia.org/w/index.php?search=%s', img: 'https://commons.wikimedia.org/w/index.php?search=%s', vid: 'https://commons.wikimedia.org/w/index.php?search=%s+video', news: 'https://id.wikinews.org/w/index.php?search=%s', map: 'https://www.openstreetmap.org/search?query=%s' },
    { id: 'yt', name: 'YouTube (video)', web: 'https://www.youtube.com/results?search_query=%s', img: 'https://www.youtube.com/results?search_query=%s', vid: 'https://www.youtube.com/results?search_query=%s', news: 'https://www.youtube.com/results?search_query=%s+berita', map: 'https://www.youtube.com/results?search_query=%s' }
  ],
  quickSearches: ['Cuaca Toba hari ini', 'Harga kopi hari ini', 'Harga pupuk subsidi', 'Cara membuat KTP', 'Beasiswa 2026', 'Bantuan sosial desa', 'Budidaya kopi arabika', 'Pertolongan pertama'],
  links: [
    { group: 'Berita', title: 'Kompas', url: 'https://www.kompas.com', text: 'Berita nasional' }, { group: 'Berita', title: 'Antara', url: 'https://www.antaranews.com', text: 'Kantor berita nasional' }, { group: 'Berita', title: 'Antara Sumut', url: 'https://sumut.antaranews.com', text: 'Berita Sumatera Utara' },
    { group: 'Belajar', title: 'Wikipedia', url: 'https://id.wikipedia.org', text: 'Ensiklopedia bebas' }, { group: 'Belajar', title: 'Rumah Belajar', url: 'https://belajar.kemendikdasmen.go.id', text: 'Belajar dari Kemendikdasmen' }, { group: 'Belajar', title: 'Khan Academy', url: 'https://id.khanacademy.org', text: 'Pelajaran gratis' },
    { group: 'Pemerintah', title: 'Indonesia.go.id', url: 'https://indonesia.go.id', text: 'Portal layanan publik' }, { group: 'Pemerintah', title: 'Kab. Toba', url: 'https://tobakab.go.id', text: 'Pemerintah Kabupaten Toba' }, { group: 'Pemerintah', title: 'BPS', url: 'https://www.bps.go.id', text: 'Data statistik' },
    { group: 'Kesehatan', title: 'Kemenkes', url: 'https://kemkes.go.id', text: 'Informasi kesehatan' }, { group: 'Kesehatan', title: 'Sehat Negeriku', url: 'https://sehatnegeriku.kemkes.go.id', text: 'Berita kesehatan' },
    { group: 'Pertanian', title: 'Kementan', url: 'https://www.pertanian.go.id', text: 'Informasi pertanian' }, { group: 'Pertanian', title: 'Panel Harga Pangan', url: 'https://panelharga.badanpangan.go.id', text: 'Harga pangan harian' },
    { group: 'Cuaca & Peta', title: 'BMKG', url: 'https://www.bmkg.go.id', text: 'Cuaca dan gempa' }, { group: 'Cuaca & Peta', title: 'OpenStreetMap', url: 'https://www.openstreetmap.org', text: 'Peta dunia' },
    { group: 'Hiburan', title: 'YouTube', url: 'https://www.youtube.com', text: 'Video belajar dan hiburan' }
  ],

  /* ---------- SERVER (opsional) ----------
     Kosongkan url bila website dan server berada di alamat yang sama (node server/server.js). Isi mis. 'https://api.ganexio.id' bila server di host lain. */
  api: { url: '' },
  /* Pemantauan jaringan. simulate=true: tampilan angka langsung diberi variasi kecil di sekitar sampel terakhir. Isi false bila telemetri asli (POST /api/telemetry dari router) sudah tersambung. */
  net: { simulate: true, sampleEveryMin: 30 },

  /* ---------- AKSES PETUGAS (tanpa login). TODO-ISI: GANTI PIN sebelum dipakai sungguhan ---------- */
  // PIN developer tidak ditampilkan di layar. TODO-ISI: ganti semua PIN sebelum website dipakai sungguhan.
  /* ---------- INFRASTRUKTUR (tampil di kaki halaman) ----------
     TODO-ISI: ganti isian berikut dengan perangkat dan penyedia yang SEBENARNYA dipakai. Isian bawaan adalah rancangan yang disarankan. */
  infra: {
    status: 'Rancangan',
    server: [['Perangkat server', 'Mini PC Intel N100, RAM 16 GB, SSD NVMe 512 GB (disarankan)'], ['Sistem operasi', 'Debian / Ubuntu Server'], ['Perangkat lunak', 'Nginx, SQLite lalu PostgreSQL, dnsmasq, Squid'], ['Daya cadangan', 'UPS 600-1000 VA, opsional panel surya dan baterai LiFePO4']],
    network: [['Uplink internet', '[TODO-ISI: Telkomsel / Indosat / XL / BAKTI / radio point-to-point]'], ['WiFi desa', 'Access point luar ruangan per dusun (kelas TP-Link Omada EAP225-Outdoor)'], ['Router utama', 'Mikrotik hAP ac2 atau setara'], ['Penghubung antar dusun', 'Radio 5 GHz point-to-point']],
    web: [['Domain', 'ganexio.id'], ['Hosting website', '[TODO-ISI: Netlify / GitHub Pages / server desa]'], ['Penyimpanan data', 'Peramban (localStorage), siap disambung ke server'], ['Teknologi', 'HTML, CSS, JavaScript tanpa framework']]
  },

  pins: { admin: '2468', bendahara: '1357', kades: '4680', kurir: '8642', developer: '9753' }, // PIN awal. Ubah lewat Developer Mode > PIN (tidak ditampilkan di website)

  /* ---------- GAMBAR LATAR PER HALAMAN (abu-abu transparan) ----------
     Kosong = ilustrasi bawaan img/bg-NAMA.svg. TODO-ISI: ganti dengan foto asli (nama file di img/). */
  backgrounds: { supplies: '', funds: '', market: '', cctv: '', community: '', internet: '', info: '', messages: '', contacts: '' }
};
