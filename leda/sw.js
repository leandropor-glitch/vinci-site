// /leda/ virou a página de contratação da Leda em 12/11/2026; a conversa foi para /leda-conversa/.
// Este arquivo só desliga o service worker antigo de /leda/ nos aparelhos que abriram a conversa aqui.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    await caches.delete("leda-v1");
    await self.registration.unregister();
  })());
});
