/* Gambar alur jaringan: satelit Starlink -> antena desa -> server/router -> WiFi dusun -> warga. */
function starlinkDiagram() {
  const c = CONFIG.starlink;
  return `<svg viewBox="0 0 800 330" role="img" aria-label="Alur internet Starlink ke desa">
  <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14213d"/><stop offset="1" stop-color="#1e6fef"/></linearGradient></defs>
  <rect x="0" y="0" width="800" height="330" rx="18" fill="url(#sk)" opacity=".08"/>
  <g fill="none" stroke="#1e6fef" stroke-width="3" class="flow"><path d="M400 70L170 230"/><path d="M400 70L650 70"/><path d="M200 255L400 255"/><path d="M430 255L600 255"/></g>
  <g transform="translate(375 28)"><rect x="12" y="14" width="26" height="18" rx="4" fill="#14213d"/><rect x="-14" y="18" width="24" height="10" fill="#12c2e9"/><rect x="40" y="18" width="24" height="10" fill="#12c2e9"/><text x="25" y="58" text-anchor="middle" font-size="14" font-weight="700" fill="#14213d">Satelit Starlink</text></g>
  <g transform="translate(640 36)"><path d="M10 30a14 14 0 0112-14 18 18 0 0135 2 12 12 0 012 24H18a12 12 0 01-8-12z" fill="#0f8b8d"/><text x="35" y="64" text-anchor="middle" font-size="14" font-weight="700" fill="#14213d">Internet / Kota</text></g>
  <g transform="translate(110 225)"><path d="M10 4c-6 12 0 26 16 30l10-10C26 18 16 12 10 4z" fill="#d7263d"/><path d="M20 14L32 2" stroke="#d7263d" stroke-width="4"/><text x="30" y="58" text-anchor="middle" font-size="14" font-weight="700" fill="#14213d">Antena (${c.dishes})</text></g>
  <g transform="translate(335 215)"><rect x="0" y="12" width="90" height="46" rx="10" fill="#14213d"/><circle cx="16" cy="35" r="4" fill="#3be08f"/><circle cx="30" cy="35" r="4" fill="#f5b800"/><rect x="48" y="30" width="30" height="8" rx="3" fill="#8f6bff"/><text x="45" y="82" text-anchor="middle" font-size="14" font-weight="700" fill="#14213d">Router + Server desa</text></g>
  <g font-size="14" font-weight="700" fill="#14213d">
   <g transform="translate(580 215)"><path d="M0 40l30-26 30 26v22H0z" fill="#f5b800"/><rect x="24" y="44" width="12" height="18" fill="#14213d"/><path d="M12 8a26 26 0 0136 0M20 0a14 14 0 0120 0" fill="none" stroke="#1e6fef" stroke-width="3"><animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite"/></path></g>
   <text x="610" y="300" text-anchor="middle">Dusun (${c.accessPoints} WiFi)</text></g>
  <g transform="translate(690 240)"><rect x="0" y="0" width="26" height="42" rx="5" fill="#7a1f5c"/><rect x="3" y="5" width="20" height="28" fill="#fff" opacity=".85"/><text x="13" y="62" text-anchor="middle" font-size="13" font-weight="700" fill="#14213d">Warga</text></g>
  </svg>`;
}
