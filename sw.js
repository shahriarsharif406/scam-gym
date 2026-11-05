const V = 'scamgym-v18';
const CORE = ['./', 'index.html', 'styles.css', 'data.js', 'data2.js', 'data3.js', 'en.js', 'scanner.js', 'features.js', 'features2.js', 'features3.js', 'features4.js', 'scenes.js', 'app.js', 'manifest.webmanifest', 'assets/fonts/hind-siliguri-bengali-400-normal.woff2', 'assets/fonts/hind-siliguri-bengali-500-normal.woff2', 'assets/fonts/hind-siliguri-bengali-600-normal.woff2', 'assets/fonts/hind-siliguri-bengali-700-normal.woff2', 'assets/fonts/hind-siliguri-latin-400-normal.woff2', 'assets/fonts/hind-siliguri-latin-500-normal.woff2', 'assets/fonts/hind-siliguri-latin-600-normal.woff2', 'assets/fonts/hind-siliguri-latin-700-normal.woff2', 'assets/fonts/noto-serif-bengali-bengali-600-normal.woff2', 'assets/fonts/noto-serif-bengali-bengali-700-normal.woff2', 'assets/fonts/noto-serif-bengali-bengali-800-normal.woff2', 'assets/fonts/fraunces-latin-600-normal.woff2', 'assets/fonts/fraunces-latin-800-normal.woff2', 'assets/fonts/jetbrains-mono-latin-500-normal.woff2', 'assets/sticker.png', 'assets/icon-192.png', 'assets/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.pathname.startsWith('/api/')) return;
  e.respondWith(caches.open(V).then(async (c) => {
    const hit = await c.match(e.request);
    const net = fetch(e.request).then((r) => { if (r && r.ok && (u.origin === location.origin || u.host.includes('gstatic') || u.host.includes('googleapis'))) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
