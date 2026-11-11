// Janete Lite excluída do site em 08/11/2026 (pedido do Leandro).
// Este arquivo fica só para limpar os aparelhos que já tinham a Janete Lite instalada:
// apaga a página guardada da Janete, desliga o service worker e recarrega a aba, que agora leva para a Leda.
// O cérebro baixado (cache do WebLLM) fica: a Leda usa o mesmo modelo.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k.startsWith("janete")).map((k) => caches.delete(k)));
    await self.registration.unregister();
    const abas = await self.clients.matchAll({ type: "window" });
    abas.forEach((c) => c.navigate(c.url).catch(() => {}));
  })());
});
