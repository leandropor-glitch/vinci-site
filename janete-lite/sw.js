// Janete Lite excluída do site em 08/11/2026 (pedido do Leandro).
// Este arquivo fica só para limpar os aparelhos que já tinham a Janete Lite instalada:
// apaga a página guardada e o cérebro baixado (cache do WebLLM), desliga o service worker
// e recarrega a aba, que passa a mostrar a página de "não encontrado" do site.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k.startsWith("janete") || k.startsWith("webllm/")).map((k) => caches.delete(k)));
    await self.registration.unregister();
    const abas = await self.clients.matchAll({ type: "window" });
    abas.forEach((c) => c.navigate(c.url).catch(() => {}));
  })());
});
