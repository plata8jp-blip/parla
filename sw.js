// Service worker de Parla: permite abrir la app sin conexión.
// - Páginas: primero la red (para recibir siempre la última versión); si no hay conexión, la copia guardada.
// - CSS, JS e iconos: la copia guardada al instante y se actualiza en segundo plano.
// - Nunca intercepta peticiones a otros dominios (por ejemplo, las estadísticas de GoatCounter).
// Al publicar cambios importantes, sube VERSION para renovar la caché.

const VERSION = "parla-v1";
const SHELL = [
  "./", "index.html", "manifest.webmanifest",
  "css/styles.css", "js/data.js", "js/analytics.js", "js/store.js", "js/app.js",
  "aviso-legal.html", "privacidad.html", "cookies.html", "terminos.html", "accesibilidad.html",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-192.png", "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png", "icons/favicon-32.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("parla-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
