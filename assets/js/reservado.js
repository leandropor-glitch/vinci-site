/* Áreas reservadas (contratação da IA em teste).
   Abrir uma vez com ?acesso=vinci-teste libera este navegador; ?acesso=sair tranca de novo.
   Página inteira reservada: <html data-reservado-pagina> -> visitante comum vai para a página inicial.
   Trecho reservado: elemento com hidden e data-reservado -> só aparece para quem tem acesso. */
(function () {
  var CHAVE = "vinci-acesso-reservado", ok = false;
  try {
    var q = new URLSearchParams(location.search).get("acesso");
    if (q === "vinci-teste") localStorage.setItem(CHAVE, "1");
    if (q === "sair") localStorage.removeItem(CHAVE);
    ok = localStorage.getItem(CHAVE) === "1";
  } catch (e) {}
  var raiz = document.documentElement;
  if (raiz.hasAttribute("data-reservado-pagina") && !ok) {
    raiz.style.display = "none";
    location.replace("/");
    return;
  }
  if (!ok) return;
  function abrir() {
    var els = document.querySelectorAll("[data-reservado]");
    for (var i = 0; i < els.length; i++) els[i].hidden = false;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", abrir); else abrir();
})();
