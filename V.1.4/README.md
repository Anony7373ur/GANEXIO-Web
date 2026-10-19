# Ganexio - Desa Sipagabu (versi lomba)

> Status: semua bagian utama, Developer Mode, server sinkronisasi, PWA, logistik, pasar lanjutan, persetujuan dana desa, dan pemantauan jaringan sudah dikerjakan. Tanpa server, website tetap berjalan dengan data di perangkat.

Website statis untuk desa terpencil: HTML, CSS, dan JavaScript murni. Tanpa server, tanpa login, tanpa instalasi.
Data (permintaan, pesanan, forum, obrolan, dana desa, tiket) tersimpan di peramban lewat `js/store.js`, jadi semua fitur berfungsi saat dinilai.

## Cara membuka
- Klik dua kali `index.html`, atau di VS Code pasang ekstensi **Live Server** lalu klik "Go Live".
- Untuk di internet: unggah seluruh folder ke Netlify, Vercel, GitHub Pages, atau hosting biasa, lalu arahkan domain `ganexio.id`.

## Yang harus Anda isi sendiri
Di VS Code tekan **Ctrl+Shift+F** dan cari `TODO-ISI`. Hampir semuanya ada di **`js/config.js`**:
- nama desa, deskripsi, visi-misi, sejarah, potensi, fasilitas, jam pelayanan, peta
- foto: taruh file di folder `img/`, lalu tulis nama filenya (contoh `photo: 'kades.jpg'`). Jika kosong atau salah, tampil gambar placeholder
- foto dan profil 3 developer (`team`), perangkat desa (`officials`)
- kontak desa dan pihak luar, alamat CCTV, paket Starlink, PIN petugas
- data contoh (pasokan, dana desa, produk, forum) ada di `js/seed.js`. Hapus atau ganti sebelum dipakai sungguhan. Tombol "Atur ulang data contoh" ada di kaki halaman.

## Akses petugas (pengganti login)
Tombol **Petugas** di kanan atas membuka fitur khusus dengan PIN (PIN demo ada di `js/config.js`, bagian `pins`):
- **Bendahara**: membuka Dana Desa (kas, grafik, tambah/hapus catatan, ekspor CSV, cetak)
- **Admin Desa**: mengubah status pasokan dan membaca kotak masuk pesan
Warga biasa tidak perlu login. Cukup mengisi nama saat pertama menulis atau memesan.

## Fitur
1. Pasokan dari kota: pangan, sumber daya alam, bahan bangunan; banyak barang per permintaan, kode tiket, pelacakan bertahap
2. Dana desa digital: terkunci PIN bendahara, grafik 6 bulan, rincian per kelompok, cari, CSV, cetak
3. Pasar desa: cari, urut, filter, beli (antar motor dengan ongkos per dusun atau ambil di toko), jual, kelola pesanan
4. CCTV desa: tampilan 1, 2, atau banyak kamera, perbesar, ambil gambar. Tanpa alamat kamera tampil tayangan DEMO
5. Forum (kelompok, cari, suka, balas) dan obrolan beberapa ruang (ikut diperbarui antar tab)
6. Internet Starlink: cek sambungan nyata, diagram cara kerja, situs cepat, kotak alamat
7. Informasi desa: profil, visi-misi, sejarah, peta, kependudukan, potensi, fasilitas, pemerintahan, galeri, jam pelayanan
8. Pesan, permohonan surat, dan laporan ke admin atau developer, dengan kode tiket dan pelacakan
9. Kontak: nomor darurat nasional, perangkat desa (WhatsApp, telepon, salin), pihak luar

Aksesibilitas: tulisan besar, tombol ukuran tulisan, tautan "lewati ke isi", fokus keyboard jelas, kontras tinggi, menghormati pengaturan "kurangi animasi", tampilan ponsel.

## CCTV sungguhan
Isi `url` dan `kind` di `cameras` pada `js/config.js`:
`iframe` (halaman pemutar WebRTC/HLS dari go2rtc atau MediaMTX), `mjpeg`, atau `snapshot`.

## Menyambung ke server nanti
Semua akses data lewat `js/store.js` (`all`, `add`, `update`, `remove`). Ganti isinya dengan `fetch()` ke API Anda, halaman lain tidak perlu diubah.
`database/schema.sql` berisi rancangan tabel SQL sebagai acuan. Saat ada server, tambahkan kembali login dan batasan jaringan desa.

## Keterbatasan versi ini
- Data hanya ada di peramban masing-masing pengguna (belum dibagikan antarperangkat)
- PIN tersimpan di `config.js` sehingga hanya cocok untuk demo, bukan keamanan sungguhan
- Unggah foto produk dan lampiran belum ada (butuh server)

## Developer Mode (khusus tim developer)
- Buka lewat tombol **Developer** di halaman Kontak (bagian Akses petugas), lalu masukkan PIN developer (`CONFIG.pins.developer` di `js/config.js`, **ganti sebelum dipakai**). Alamat langsung: `developer.html`.
- **Diagnosa**: lingkungan peramban, penyimpanan, integritas data, isian config yang belum diisi, aset, performa, dan audit aksesibilitas semua halaman.
- **Data dan SQL**: lihat, tambah, ubah koleksi data, jalankan kueri SQL sederhana, dan unduh skema SQL.
- **Frontend**: daftar berkas dan ukuran, token warna, kontras, galeri ikon, media query dan animasi.
- **Backend**: rancangan API (OpenAPI), skema, dan panduan menyambung ke server.
- **Log dan Konsol**: log kesalahan dan performa antar halaman, serta konsol kecil.
- Setelah mengubah berkas, jalankan `node tools/make-manifest.js` agar daftar berkas di tab Frontend diperbarui.

## Catatan terbaru
- **Akses Internet**: tidak ada lagi mode offline/online. Pencarian hanya bisa saat online. Mesin "Ganexio" menampilkan hasil Wikipedia (Web) dan Wikimedia Commons (Gambar) di halaman; mesin lain dan tab Video/Berita/Peta membuka tab baru. Riwayat, penanda, dan Rancangan Jaringan tetap bisa dipakai offline.
- **Foto desa dari internet**: dicari otomatis dari Wikimedia Commons (`village.onlineImageQueries` di `js/config.js`), disimpan 7 hari, dipakai di latar welcome dan bagian "Foto dari Internet" di Informasi Desa lengkap dengan pembuat dan lisensi. Ganti dengan foto sendiri lewat `village.photo`.
- **Welcome**: layar muat, logo efek glitch (hanya di welcome), partikel di hero, dan transisi antar halaman yang memudar dengan warna terpadu. Semua dimatikan oleh Pengaturan > Kurangi animasi.
- **Animasi interaktif**: miring 3D dan sorot cahaya pada kartu, muncul saat digulir, bilah kemajuan gulir, percikan saat berhasil, tombol berkilau.
- **Kaki halaman**: tentang website, pengembang (Gabriel Christian Ronaldo Panjaitan), dan infrastruktur server/WiFi/provider. Isian infrastruktur ada di `CONFIG.infra` dan masih berupa **rancangan**: ganti dengan perangkat dan penyedia yang benar-benar dipakai (`TODO-ISI`).

## Server sinkronisasi (opsional, tanpa instalasi paket)
- Butuh Node.js 22.13 atau lebih baru. Jalankan: `GX_SECRET=teks-rahasia-panjang node server/server.js` lalu buka `http://localhost:8080`.
- Server menyajikan website, menyimpan data bersama di `server/ganexio.db` (SQLite bawaan Node), sinkronisasi antarperangkat dengan pembaruan langsung (SSE), dan memeriksa PIN (token bertanda tangan). Dana desa, pengajuan, CCTV blokir, voucher, gangguan, gudang, dan tugas kurir hanya bisa diubah peran yang berwenang; penulisan oleh peran lain ditolak server.
- **Offline-first**: perubahan disimpan di perangkat, masuk antrean, dan dikirim otomatis saat sinyal kembali (lihat Developer Mode > Sinkronisasi).
- Variabel: `PORT`, `GX_SECRET` (wajib diganti), `GX_CORS_ORIGIN` (bila website di host lain, isi juga `CONFIG.api.url`), `GX_AGENT_KEY` (kunci telemetri router).
- Telemetri jaringan: router/agen dapat mengirim `POST /api/telemetry` dengan header `x-agent-key` berisi `{dusun, up, clients, rx, tx}`. Setelah tersambung, set `CONFIG.net.simulate` ke `false`.
- Di hosting statis (Netlify dll.) server tidak ada, dan website otomatis memakai data lokal.

## PWA (dipasang seperti aplikasi, jalan offline)
`manifest.webmanifest`, `sw.js`, dan `js/pwa.js`. Aktif di http(s) atau localhost, bukan file://. Setelah dibuka sekali, seluruh halaman tersimpan dan bisa dipakai tanpa internet. Jalankan `node tools/make-manifest.js` setiap mengubah berkas agar daftar tembolok di `sw.js` ikut diperbarui, dan ubah `VERSION` di `sw.js`.

## Fitur lanjutan
- **Logistik dan Gudang** (`logistik.html`): tugas kurir dengan bukti serah terima (foto + tanda tangan), stok gudang desa, pesanan kolektif (ongkos dibagi), rute motor estafet, dan perbandingan harga pemasok (impor CSV atau API).
- **Pasar**: ulasan bintang, verifikasi penjual oleh admin, chat per pesanan, dasbor Toko Saya, dan permintaan pembeli dari kota.
- **Dana desa**: pengajuan di atas batas (`CONFIG.fund.approvalMin`) wajib disetujui Kepala Desa, bukti nota, APBDes rencana vs realisasi, dan laporan PDF per periode.
- **Pemantauan jaringan** (Akses Internet): status dan pemakaian per dusun, voucher WiFi, pengumuman gangguan yang tampil di semua halaman.
- **Peran dan PIN**: admin, bendahara, kades, kurir, developer. PIN tidak ditampilkan di website; lihat dan ubah di Developer Mode > PIN dan Akses (bawaan di `CONFIG.pins`).
