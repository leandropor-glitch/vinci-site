// Leda: guarda a página e a biblioteca para abrir sem internet.
// O modelo em si fica no cache próprio do WebLLM (baixado uma vez, do Hugging Face).
const CACHE = "leda-v1";
const SHELL = [
  "./", "index.html", "style.css?v=l-1", "app.js?v=l-1", "worker.js",
  "vendor/web-llm-0.2.86.js", "leda-avatar.jpg", "leda-corpo.jpg", "icon-192.png", "icon-512.png", "manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("leda-") && !k.startsWith("leda-lite-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || !url.pathname.includes("/leda/")) return;
  // Rede primeiro (pega versão nova quando há internet); sem internet, usa o guardado.
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: false }).then((m) => m || caches.match(e.request, { ignoreSearch: true })))
  );
});
