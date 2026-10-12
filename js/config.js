/* =====================================================================
   GANEXIO.ID - PUSAT PENGATURAN ISI WEBSITE
   Semua teks, nama, foto, dan kontak yang harus Anda isi ada di file ini.
   TIP VS CODE: tekan Ctrl+Shift+F lalu cari  TODO-ISI  untuk menemukan
   semua bagian yang masih harus diisi (di file HTML, JS, dan CSS).
   ===================================================================== */
const CONFIG = {

  /* ---------- IDENTITAS WEBSITE ---------- */
  site: {
    name: 'Ganexio',
    domain: 'ganexio.id',
    tagline: 'Menghubungkan desa terpencil dengan dunia',
    // TODO-ISI: ringkasan 1-2 kalimat tentang Ganexio untuk halaman depan
    about: 'Ganexio.id adalah portal digital untuk desa terpencil. Melalui jaringan Starlink dan WiFi desa, warga dapat meminta pasokan dari kota, berjualan, berdiskusi, memantau lingkungan, dan mengakses internet dalam satu tempat.',
    email: 'tim@ganexio.id' // TODO-ISI: email resmi tim
  },

  /* ---------- PROFIL DESA ---------- */
  village: {
    name: '[TODO-ISI: Nama Desa]',
    district: '[TODO-ISI: Kecamatan]',
    regency: '[TODO-ISI: Kabupaten]',
    province: '[TODO-ISI: Provinsi]',
    // TODO-ISI: foto utama desa (taruh file di folder img/, lalu tulis nama filenya). Kosongkan untuk memakai gambar placeholder.
    heroPhoto: '',
    // TODO-ISI: deskripsi singkat desa (2-4 kalimat)
    description: 'Tulis di sini penjelasan singkat tentang desa Anda: letak, suasana, mata pencaharian, dan keunikan desa.',
    vision: 'TODO-ISI: Tulis visi desa.',
    mission: ['TODO-ISI: Misi desa pertama', 'TODO-ISI: Misi desa kedua', 'TODO-ISI: Misi desa ketiga'],
    // TODO-ISI: angka kependudukan (boleh diganti teks, misalnya "1.250")
    stats: [
      { label: 'Penduduk', value: 1250, suffix: ' jiwa' },
      { label: 'Kepala keluarga', value: 340, suffix: ' KK' },
      { label: 'Dusun', value: 4, suffix: '' },
      { label: 'Jarak ke kota', value: 62, suffix: ' km' }
    ],
    // TODO-ISI: daftar dusun. Dipakai pada form pasokan, pengantaran pasar, dan laporan.
    hamlets: ['Dusun 1', 'Dusun 2', 'Dusun 3', 'Dusun 4'],
    // TODO-ISI: sejarah desa (urutkan dari yang paling lama)
    history: [
      { year: '19xx', title: 'TODO-ISI: Awal berdirinya desa', text: 'Ceritakan asal-usul desa.' },
      { year: '20xx', title: 'TODO-ISI: Peristiwa penting', text: 'Ceritakan peristiwa yang diingat warga.' },
      { year: '2026', title: 'Jaringan Ganexio hadir', text: 'Internet Starlink dan WiFi desa mulai menjangkau seluruh dusun.' }
    ],
    // TODO-ISI: potensi desa. image = nama file di folder img/ (kosongkan untuk placeholder)
    potentials: [
      { title: 'TODO-ISI: Hasil bumi', text: 'Jelaskan hasil pertanian atau perkebunan unggulan.', image: '' },
      { title: 'TODO-ISI: Hasil laut / ternak', text: 'Jelaskan hasil perikanan atau peternakan.', image: '' },
      { title: 'TODO-ISI: Wisata & kerajinan', text: 'Jelaskan wisata alam atau kerajinan khas.', image: '' }
    ],
    // TODO-ISI: fasilitas desa (ic = nama ikon: book, heart, home, drop, bolt, wifi, pin, users)
    facilities: [
      { ic: 'book', title: 'Sekolah', text: 'TODO-ISI: nama dan jenjang sekolah' },
      { ic: 'heart', title: 'Kesehatan', text: 'TODO-ISI: puskesmas pembantu / posyandu' },
      { ic: 'home', title: 'Balai Desa', text: 'TODO-ISI: lokasi dan fungsi balai desa' },
      { ic: 'drop', title: 'Air bersih', text: 'TODO-ISI: sumber air bersih desa' },
      { ic: 'bolt', title: 'Listrik', text: 'TODO-ISI: PLN / panel surya / genset' },
      { ic: 'wifi', title: 'WiFi Starlink', text: 'Titik WiFi desa tersedia di setiap dusun.' }
    ],
    hours: [ // TODO-ISI: jam pelayanan kantor desa
      { day: 'Senin - Kamis', time: '08.00 - 15.00' },
      { day: 'Jumat', time: '08.00 - 11.30' },
      { day: 'Sabtu - Minggu', time: 'Tutup (darurat hubungi kontak desa)' }
    ],
    // TODO-ISI: alamat peta (Google Maps > Bagikan > Sematkan peta > salin alamat src). Kosongkan jika belum ada.
    mapEmbedUrl: '',
    // TODO-ISI: foto galeri desa (nama file di img/). Kosongkan untuk placeholder.
    gallery: ['', '', '', '', '', '']
  },

  /* ---------- PERANGKAT DESA (foto profil) ---------- */
  officials: [
    // TODO-ISI: nama, jabatan, nomor HP, dan foto (file di img/, misalnya 'kades.jpg')
    { name: '[TODO-ISI: Nama Kepala Desa]', role: 'Kepala Desa', phone: '08xxxxxxxxxx', photo: '' },
    { name: '[TODO-ISI: Nama Sekretaris]', role: 'Sekretaris Desa', phone: '08xxxxxxxxxx', photo: '' },
    { name: '[TODO-ISI: Nama Bendahara]', role: 'Bendahara Desa', phone: '08xxxxxxxxxx', photo: '' },
    { name: '[TODO-ISI: Nama Kepala Dusun]', role: 'Kepala Dusun', phone: '08xxxxxxxxxx', photo: '' }
  ],

  /* ---------- TIM PENGEMBANG (3 developer) ---------- */
  team: [
    // TODO-ISI: nama, peran, singkat tentang diri, foto (file di img/)
    { name: '[TODO-ISI: Developer 1]', role: 'Ketua Tim / Backend', bio: 'TODO-ISI: tulis profil singkat.', photo: '' },
    { name: '[TODO-ISI: Developer 2]', role: 'Frontend / UI', bio: 'TODO-ISI: tulis profil singkat.', photo: '' },
    { name: '[TODO-ISI: Developer 3]', role: 'Jaringan / Database', bio: 'TODO-ISI: tulis profil singkat.', photo: '' }
  ],

  /* ---------- KONTAK ---------- */
  contacts: {
    emergency: [ // Nomor darurat nasional (sudah benar, tidak perlu diubah)
      { name: 'Darurat Umum', number: '112', ic: 'alert' },
      { name: 'Polisi', number: '110', ic: 'shield' },
      { name: 'Pemadam Kebakaran', number: '113', ic: 'flame' },
      { name: 'Ambulans', number: '119', ic: 'heart' },
      { name: 'Basarnas (SAR)', number: '115', ic: 'life' }
    ],
    external: [ // TODO-ISI: kontak pihak luar desa
      { name: 'Kantor Kecamatan', role: 'Pemerintah kecamatan', phone: '08xxxxxxxxxx', email: '' },
      { name: 'Puskesmas / RS Terdekat', role: 'Layanan kesehatan dan rujukan', phone: '08xxxxxxxxxx', email: '' },
      { name: 'Pemasok Bahan Pangan (Kota)', role: 'Rekanan pengiriman pasokan', phone: '08xxxxxxxxxx', email: '' },
      { name: 'Pemasok Bahan Bangunan (Kota)', role: 'Rekanan pengiriman pasokan', phone: '08xxxxxxxxxx', email: '' },
      { name: 'Tim Pengembang Ganexio', role: 'Bantuan website dan jaringan', phone: '08xxxxxxxxxx', email: 'tim@ganexio.id' }
    ]
  },

  /* ---------- CCTV ---------- */
  // TODO-ISI: tulis alamat video kamera pada "url". Jika kosong, website menampilkan tayangan DEMO.
  // kind: 'iframe' (halaman pemutar WebRTC/HLS), 'mjpeg' (aliran MJPEG), 'snapshot' (foto yang diperbarui tiap 3 detik)
  cameras: [
    { id: 1, name: 'Balai Desa', location: 'Halaman depan balai desa', url: '', kind: 'iframe', scene: 'plaza' },
    { id: 2, name: 'Pasar Desa', location: 'Area pasar dan jalan utama', url: '', kind: 'iframe', scene: 'market' },
    { id: 3, name: 'Gerbang Desa', location: 'Jalan masuk desa', url: '', kind: 'iframe', scene: 'road' },
    { id: 4, name: 'Dermaga / Sungai', location: 'Titik pantau air', url: '', kind: 'iframe', scene: 'water' }
  ],

  /* ---------- PASAR DESA ---------- */
  market: {
    categories: ['Makanan', 'Hasil Kebun', 'Hasil Ternak', 'Hasil Laut', 'Kerajinan', 'Kebutuhan Harian'],
    // Ongkos antar motor per dusun (Rupiah). TODO-ISI: sesuaikan dengan jarak sebenarnya.
    deliveryFees: { 'Dusun 1': 3000, 'Dusun 2': 5000, 'Dusun 3': 7000, 'Dusun 4': 10000 }
  },

  /* ---------- PASOKAN DARI KOTA: contoh barang cepat pilih ---------- */
  supplyCatalog: {
    pangan: [['Beras', 'kg'], ['Minyak goreng', 'liter'], ['Gula', 'kg'], ['Telur', 'kg'], ['Mi instan', 'dus'], ['Garam', 'kg'], ['Obat-obatan dasar', 'paket']],
    sumber_daya: [['Bibit padi', 'kg'], ['Pupuk', 'karung'], ['Bahan bakar', 'liter'], ['Tabung gas LPG', 'tabung'], ['Pipa air', 'batang'], ['Panel surya kecil', 'unit']],
    bahan_bangunan: [['Semen', 'sak'], ['Seng', 'lembar'], ['Kayu balok', 'batang'], ['Paku', 'kg'], ['Pasir', 'rit'], ['Cat tembok', 'kaleng']]
  },

  /* ---------- INTERNET STARLINK ---------- */
  starlink: {
    plan: '[TODO-ISI: nama paket Starlink]',
    speed: '[TODO-ISI: kecepatan, mis. 100-200 Mbps]',
    dishes: 1, // TODO-ISI: jumlah antena
    accessPoints: 4 // TODO-ISI: jumlah titik WiFi desa
  },
  links: [ // Situs yang sering dibuka (boleh ditambah)
    { group: 'Berita', title: 'Kompas', url: 'https://www.kompas.com', text: 'Berita nasional' },
    { group: 'Berita', title: 'Antara', url: 'https://www.antaranews.com', text: 'Kantor berita nasional' },
    { group: 'Belajar', title: 'Wikipedia', url: 'https://id.wikipedia.org', text: 'Ensiklopedia bebas' },
    { group: 'Belajar', title: 'Ruangguru', url: 'https://www.ruangguru.com', text: 'Belajar untuk pelajar' },
    { group: 'Pemerintah', title: 'Indonesia.go.id', url: 'https://indonesia.go.id', text: 'Portal layanan publik' },
    { group: 'Pemerintah', title: 'BMKG', url: 'https://www.bmkg.go.id', text: 'Cuaca dan gempa' },
    { group: 'Kesehatan', title: 'Kemenkes', url: 'https://kemkes.go.id', text: 'Informasi kesehatan' },
    { group: 'Hiburan', title: 'YouTube', url: 'https://www.youtube.com', text: 'Video belajar dan hiburan' }
  ],

  /* ---------- AKSES PETUGAS (tanpa login) ----------
     Fitur khusus (Dana Desa, ubah status pasokan, kotak masuk pesan) dibuka dengan PIN.
     TODO-ISI: ganti PIN sebelum website dipakai sungguhan. PIN demo ditampilkan agar juri dapat mencoba. */
  pins: { admin: '2468', bendahara: '1357', showDemoHint: true }
};
