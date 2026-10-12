-- REFERENSI untuk nanti saat website tersambung ke server. Versi lomba menyimpan data di peramban (js/store.js); setiap tabel di sini setara dengan satu "tabel" di Store.
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'warga' CHECK(role IN ('warga','admin','bendahara','developer')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS supply_requests(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  category TEXT NOT NULL CHECK(category IN ('pangan','sumber_daya','bahan_bangunan')),
  item TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'biasa' CHECK(urgency IN ('biasa','mendesak')),
  note TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK(status IN ('menunggu','diproses','dikirim','selesai','ditolak')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS fund_transactions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('masuk','keluar')),
  amount INTEGER NOT NULL CHECK(amount>0),
  description TEXT NOT NULL,
  category TEXT DEFAULT 'Umum',
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL CHECK(price>=0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0),
  category TEXT NOT NULL DEFAULT 'Lainnya',
  delivery TEXT NOT NULL DEFAULT 'keduanya' CHECK(delivery IN ('motor','ambil','keduanya')),
  shop_location TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  qty INTEGER NOT NULL CHECK(qty>0),
  method TEXT NOT NULL CHECK(method IN ('motor','ambil')),
  address TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'baru' CHECK(status IN ('baru','diterima','diantar','selesai','batal')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS forum_posts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS forum_replies(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS chat_messages(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  room TEXT NOT NULL DEFAULT 'umum',
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_room ON chat_messages(room,id);
CREATE TABLE IF NOT EXISTS cameras(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT DEFAULT '',
  stream_url TEXT DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'iframe' CHECK(kind IN ('iframe','mjpeg','snapshot')),
  active INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS village_info(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS contacts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL CHECK(scope IN ('desa','luar')),
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  note TEXT DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  target TEXT NOT NULL CHECK(target IN ('admin','developer')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'baru' CHECK(status IN ('baru','dibaca','selesai')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quick_links(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);
