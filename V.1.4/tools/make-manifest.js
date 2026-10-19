/* Membuat js/devmanifest.js (daftar berkas, ukuran, jumlah baris) untuk tab Frontend di Developer Mode.
   Jalankan dari folder proyek:  node tools/make-manifest.js   (jalankan ulang setiap selesai mengubah berkas) */
const fs = require('fs'), path = require('path');
const files = [];
(function walk(d) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (['node_modules', '.git', 'tools'].includes(n) || n === 'devmanifest.js') continue;
    if (fs.statSync(p).isDirectory()) walk(p);
    else { const b = fs.readFileSync(p), text = /\.(html|css|js|svg|sql|md)$/.test(n); files.push({ p: p.replace(/\\/g, '/'), bytes: b.length, lines: text ? b.toString('utf8').split('\n').length : 0 }); }
  }
})('.');
files.sort((a, b) => a.p.localeCompare(b.p));
fs.writeFileSync('js/devmanifest.js', '/* Dibuat otomatis oleh tools/make-manifest.js. Jangan diedit manual. */\nconst DEVMANIFEST = ' + JSON.stringify({ built: new Date().toISOString().slice(0, 16).replace('T', ' '), files }) + ';\n');
/* Perbarui daftar PRECACHE di sw.js */
const pre = files.map(f => f.p.replace(/^\.\//, '')).filter(p => !/^(README|database|server|tools)|\.md$|\.sql$|devmanifest/.test(p)).concat(['./']);
let sw = fs.readFileSync('sw.js', 'utf8'); sw = sw.replace(/\/\*PRECACHE-START\*\/[\s\S]*?\/\*PRECACHE-END\*\//, '/*PRECACHE-START*/const PRECACHE = ' + JSON.stringify(pre) + ';/*PRECACHE-END*/'); fs.writeFileSync('sw.js', sw);
console.log('devmanifest.js:', files.length, 'berkas');
