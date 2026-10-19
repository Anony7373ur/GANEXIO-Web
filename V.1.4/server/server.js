/* Ganexio - server sinkronisasi (tanpa dependensi, Node.js 22.13+ dengan node:sqlite).
   Menjalankan: node server/server.js   (lalu buka http://localhost:8080)
   Fungsi: menyajikan website, menyimpan data bersama di SQLite (server/ganexio.db), sinkronisasi antarperangkat,
   kejadian waktu nyata (SSE), PIN dan peran (token bertanda tangan), penerima telemetri jaringan.
   Variabel lingkungan: PORT, GX_SECRET (wajib diganti), GX_CORS_ORIGIN (bila website di host lain), GX_AGENT_KEY (kunci telemetri). */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');
const ROOT = path.join(__dirname, '..'), PORT = +process.env.PORT || 8080, SECRET = process.env.GX_SECRET || 'ganti-rahasia-ini-sebelum-produksi';
const CORS = process.env.GX_CORS_ORIGIN || '', AGENT = process.env.GX_AGENT_KEY || '';
const db = new DatabaseSync(process.env.GX_DB || path.join(__dirname, 'ganexio.db'));
db.exec(`CREATE TABLE IF NOT EXISTS docs(col TEXT NOT NULL, id INTEGER NOT NULL, json TEXT NOT NULL, upd INTEGER NOT NULL, del INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(col,id));
CREATE INDEX IF NOT EXISTS idx_docs_upd ON docs(upd);
CREATE TABLE IF NOT EXISTS kv(key TEXT PRIMARY KEY, json TEXT NOT NULL, upd INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS pins(role TEXT PRIMARY KEY, hash TEXT NOT NULL);`);
const hash = p => crypto.createHash('sha256').update(SECRET + ':' + p).digest('hex');
const DEFAULT_PINS = { admin: '2468', bendahara: '1357', kades: '4680', kurir: '8642', developer: '9753' };
for (const [r, p] of Object.entries(DEFAULT_PINS)) db.prepare('INSERT OR IGNORE INTO pins(role,hash) VALUES(?,?)').run(r, hash(p));

/* Aturan tulis: koleksi yang hanya boleh diubah peran tertentu. Koleksi lain terbuka untuk semua warga. */
const RULES = { funds: ['bendahara', 'kades'], fundreq: ['bendahara', 'kades'], cctvblock: ['admin'], vouchers: ['admin'], outages: ['admin'], verifications: ['admin'], warehouse: ['admin', 'kurir'], deliveries: ['admin', 'kurir'], netlog: ['agent'], prices: ['admin'] };
const KV_RULES = { fundcfg: ['bendahara'], apbdes: ['bendahara'] };
const sign = (role, exp) => { const b = role + '.' + exp; return b + '.' + crypto.createHmac('sha256', SECRET).update(b).digest('hex'); };
const roleOf = req => { const t = String(req.headers['x-gx-token'] || '').split('.'); if (t.length !== 3) return ''; const [r, e, s] = t; return +e > Date.now() && sign(r, e).split('.')[2] === s ? r : ''; };
const can = (rules, key, role) => !rules[key] || rules[key].includes(role) || role === 'developer';

const clients = new Set(); const broadcast = () => clients.forEach(res => res.write('event: sync\ndata: ' + Date.now() + '\n\n'));
const tries = new Map();
const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); };
const body = req => new Promise((ok, no) => { let b = ''; req.on('data', c => { b += c; if (b.length > 8e6) { no(new Error('terlalu besar')); req.destroy(); } }); req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch (e) { no(e); } }); });

async function api(req, res, url) {
  if (url.pathname === '/api/health') return json(res, 200, { ok: true, name: 'ganexio', time: Date.now() });
  if (url.pathname === '/api/events') { res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' }); res.write('retry: 4000\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return; }
  if (req.method !== 'POST') return json(res, 405, { error: 'method' });
  const data = await body(req), role = roleOf(req);
  if (url.pathname === '/api/auth') {
    const ip = req.socket.remoteAddress, n = (tries.get(ip) || []).filter(t => Date.now() - t < 6e4); if (n.length >= 8) return json(res, 429, { error: 'Terlalu banyak percobaan. Tunggu semenit.' });
    n.push(Date.now()); tries.set(ip, n);
    const r = db.prepare('SELECT hash FROM pins WHERE role=?').get(String(data.role)); if (!r || r.hash !== hash(String(data.pin))) return json(res, 401, { error: 'PIN salah' });
    const exp = Date.now() + 12 * 36e5; return json(res, 200, { token: sign(data.role, exp), role: data.role, exp });
  }
  if (url.pathname === '/api/pins') { if (role !== 'developer') return json(res, 403, { error: 'Hanya developer' }); for (const [r, p] of Object.entries(data.pins || {})) if (/^\d{4,8}$/.test(p) && DEFAULT_PINS[r]) db.prepare('INSERT OR REPLACE INTO pins(role,hash) VALUES(?,?)').run(r, hash(p)); return json(res, 200, { ok: true }); }
  if (url.pathname === '/api/telemetry') { if (!AGENT || req.headers['x-agent-key'] !== AGENT) return json(res, 403, { error: 'kunci agen salah' }); const now = Date.now(); db.prepare('INSERT OR REPLACE INTO docs(col,id,json,upd,del) VALUES(?,?,?,?,0)').run('netlog', now * 1000 + Math.floor(Math.random() * 999), JSON.stringify({ ...data, at: new Date().toISOString() }), now); broadcast(); return json(res, 200, { ok: true }); }
  if (url.pathname === '/api/sync') {
    const rejected = [], upd = db.prepare('INSERT INTO docs(col,id,json,upd,del) VALUES(?,?,?,?,?) ON CONFLICT(col,id) DO UPDATE SET json=excluded.json,upd=excluded.upd,del=excluded.del WHERE excluded.upd>=docs.upd');
    let wrote = false;
    for (const o of data.ops || []) { if (!can(RULES, o.col, role) || (o.col === 'netlog' && role !== 'developer')) { rejected.push({ col: o.col, id: o.id }); continue; } upd.run(String(o.col), +o.id, JSON.stringify(o.doc || {}), +o.upd || Date.now(), o.del ? 1 : 0); wrote = true; }
    const kvs = db.prepare('INSERT INTO kv(key,json,upd) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET json=excluded.json,upd=excluded.upd WHERE excluded.upd>=kv.upd');
    for (const k of data.kv || []) { if (!can(KV_RULES, k.key, role)) { rejected.push({ kv: k.key }); continue; } kvs.run(String(k.key), JSON.stringify(k.val), +k.upd || Date.now()); wrote = true; }
    const since = +data.since || 0;
    const changes = db.prepare('SELECT col,id,json,upd,del FROM docs WHERE upd>? ORDER BY upd LIMIT 2000').all(since).map(r => ({ col: r.col, id: r.id, doc: JSON.parse(r.json), upd: r.upd, del: !!r.del }));
    const kv = db.prepare('SELECT key,json,upd FROM kv WHERE upd>?').all(since).map(r => ({ key: r.key, val: JSON.parse(r.json), upd: r.upd }));
    if (wrote) broadcast();
    return json(res, 200, { now: Date.now(), changes, kv, rejected });
  }
  json(res, 404, { error: 'tidak ditemukan' });
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.sql': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (CORS) { res.setHeader('access-control-allow-origin', CORS); res.setHeader('access-control-allow-headers', 'content-type,x-gx-token,x-agent-key'); if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); } }
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    let p = decodeURIComponent(url.pathname); if (p.endsWith('/')) p += 'index.html';
    const f = path.normalize(path.join(ROOT, p));
    if (!f.startsWith(ROOT) || /[\\/](server|tools|database)[\\/]|\.db/.test(f)) { res.writeHead(403); return res.end('Terlarang'); }
    fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end('Tidak ditemukan'); } res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': /sw\.js$|\.html$/.test(f) ? 'no-cache' : 'public, max-age=300' }); res.end(b); });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}).listen(PORT, () => console.log(`Ganexio berjalan di http://localhost:${PORT}  (data: server/ganexio.db)`));
