# Ganexio.id (versi lomba)

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
