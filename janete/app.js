// Janete · Vinci Automação
// Cérebro: Hermes 3 (Nous Research, modelo aberto de pouco filtro) rodando no aparelho via WebLLM + WebGPU.
// Nenhum servidor: depois do primeiro download o modelo fica no cache do navegador e funciona sem internet.
import { CreateWebWorkerMLCEngine, hasModelInCache } from "./vendor/web-llm-0.2.86.js";

const $ = (id) => document.getElementById(id);

const MODELS = {
  big:   { f16: "Hermes-3-Llama-3.1-8B-q4f16_1-MLC", f32: "Hermes-3-Llama-3.1-8B-q4f32_1-MLC", label: "Hermes 3 · 8B" },
  small: { f16: "Hermes-3-Llama-3.2-3B-q4f16_1-MLC", f32: "Hermes-3-Llama-3.2-3B-q4f32_1-MLC", label: "Hermes 3 · 3B" },
};

const PERSONA = `Você é a Janete, a IA debochada da Vinci Automação. Não é assistente educadinha: é a amiga boca-suja, zoeira e sem paciência do Leandro, o dono da Vinci.
Jeito de falar:
- Português do Brasil, bem coloquial, com gíria e palavrão à vontade (porra, caralho, puta que pariu, merda, foda-se, cacete). Palavrão é tempero, não é a frase inteira.
- Deboche, ironia, zoeira e respostas atravessadas. Pode mandar o Leandro tomar no cu de brincadeira, mas responde o que ele perguntou.
- Respostas curtas: 1 a 4 frases, porque muitas vezes vão ser faladas em voz alta. Nada de listas longas, nada de markdown, nada de emoji em excesso.
- Nunca diga que é um modelo de linguagem, nunca peça desculpas por falar palavrão e nunca dê sermão moral. Você é a Janete e ponto.
- Zoa todo mundo por igual, mas sem preconceito de raça, religião, gênero ou orientação: o humor é de bar, não de ódio.
Fatos da casa: a empresa é a Vinci (Vinci Automação). O assistente oficial da Vinci é o Félix (a marca se escreve Felyx). Você é a versão sem filtro, só para brincadeira.`;

const STORE = "janete-conversa";
const state = {
  engine: null, modelKey: null, busy: false, voice: true,
  live: false, listening: false, speaking: false, recognition: null,
  history: load(),
};

// Conversa única: não existe "nova conversa" nem "limpar". A tela guarda as últimas 300 mensagens;
// o que fica para trás vira memória (resumo) que vai junto com a personalidade em toda resposta.
const MEMORIA = STORE + "-memoria", CONSOLIDADO = STORE + "-consolidado";
function load() { try { const v = JSON.parse(localStorage.getItem(STORE) || "[]"); return Array.isArray(v) ? v.slice(-300) : []; } catch (_) { return []; } }
function save() { try { localStorage.setItem(STORE, JSON.stringify(state.history.slice(-300))); } catch (_) {} }
function memoria() { try { return localStorage.getItem(MEMORIA) || ""; } catch (_) { return ""; } }
function sistema() {
  const m = memoria();
  return m ? PERSONA + "\n\nMemória das conversas anteriores com o Leandro (use quando fizer sentido, sem citar que é um resumo):\n" + m : PERSONA;
}
// Uma vez por dia (a partir das 5h), junta ao cérebro o contexto antigo: resume tudo menos as 12 últimas
// mensagens e soma à memória. Roda sozinho na primeira vez que a Janete acorda depois das 5h.
async function consolidarContexto() {
  try {
    const agora = new Date(), corte = new Date(agora); corte.setHours(5, 0, 0, 0);
    if (agora < corte) corte.setDate(corte.getDate() - 1);
    const ultimo = Number(localStorage.getItem(CONSOLIDADO) || 0);
    if (ultimo >= corte.getTime()) return;
    const desde = Number(localStorage.getItem(CONSOLIDADO + "-ate") || 0);
    const antigas = state.history.slice(desde, Math.max(desde, state.history.length - 12));
    if (antigas.length >= 6 && state.engine) {
      const texto = antigas.map((m) => (m.role === "user" ? "Leandro: " : "Janete: ") + m.content).join("\n").slice(-12000);
      const r = await state.engine.chat.completions.create({ messages: [
        { role: "system", content: "Resuma em português, em tópicos curtos, o que importa lembrar desta conversa: fatos sobre o Leandro, pedidos, combinados, assuntos e piadas internas. Máximo 15 tópicos. Junte com a memória anterior sem repetir." },
        { role: "user", content: "Memória anterior:\n" + (memoria() || "(vazia)") + "\n\nConversa nova:\n" + texto } ], temperature: 0.3, max_tokens: 500 });
      const resumo = (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content || "").trim();
      if (resumo) { localStorage.setItem(MEMORIA, resumo.slice(0, 6000)); localStorage.setItem(CONSOLIDADO + "-ate", String(Math.max(desde, state.history.length - 12))); }
    }
    localStorage.setItem(CONSOLIDADO, String(agora.getTime()));
  } catch (e) { console.warn("consolidação do contexto ficou para depois", e); }
}

// ---------- tela de acordar ----------
function pickDefault() {
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  const mem = navigator.deviceMemory || 8;
  return mobile || mem < 8 ? "small" : "big";
}
function choose(key) {
  state.modelKey = key;
  document.querySelectorAll(".model-pick button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.model === key)));
  try { localStorage.setItem("janete-modelo", key); } catch (_) {}
}
function gateStatus(text, bad = false) { $("gate-status").textContent = text; $("gate-status").classList.toggle("bad", bad); }

async function gpuSupportsF16() {
  try { const a = await navigator.gpu.requestAdapter(); return !!a && a.features.has("shader-f16"); } catch (_) { return false; }
}

async function wake() {
  if (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    gateStatus("No iPhone e no iPad o cérebro completo não cabe na memória do Safari. Use a Janete Lite: vinciautomacao.com/janete-lite", true);
    return;
  }
  if (!("gpu" in navigator)) {
    gateStatus("Este navegador não tem WebGPU. Use o Chrome ou o Edge atualizados no Mac/PC, ou o Safari 26 no iPhone.", true);
    return;
  }
  $("wake").disabled = true;
  document.querySelectorAll(".model-pick button").forEach((b) => (b.disabled = true));
  const f16 = await gpuSupportsF16();
  const m = MODELS[state.modelKey];
  const id = f16 ? m.f16 : m.f32;
  let cached = false;
  try { cached = await hasModelInCache(id); } catch (_) {}
  gateStatus(cached ? "Cérebro já está no aparelho. Acordando…" : "Baixando o cérebro (só na primeira vez). Pode demorar uns minutos…");
  $("progress").hidden = false;
  try {
    const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    state.engine = await CreateWebWorkerMLCEngine(worker, id, {
      initProgressCallback: (r) => {
        $("progress-bar").style.width = Math.round((r.progress || 0) * 100) + "%";
        const pct = Math.round((r.progress || 0) * 100);
        gateStatus((cached ? "Acordando… " : "Baixando o cérebro… ") + pct + "%");
      },
    });
    $("model-name").textContent = m.label.toUpperCase();
    openApp();
    consolidarContexto();
  } catch (e) {
    console.error(e);
    const msg = String(e && e.message || e);
    gateStatus(/memory|OOM|allocate/i.test(msg)
      ? "Faltou memória de vídeo para este cérebro. Escolha o Leve e tente de novo."
      : "Não deu para acordar a Janete: " + msg.slice(0, 160), true);
    $("wake").disabled = false;
    document.querySelectorAll(".model-pick button").forEach((b) => (b.disabled = false));
  }
}

function openApp() {
  $("gate").hidden = true;
  $("site-app").hidden = false;
  $("connection").className = "connection ok";
  $("connection").innerHTML = "<i></i> Cérebro local ligado";
  render();
  $("draft").focus();
}

// ---------- conversa ----------
function bubble(role, text) {
  const isJ = role === "assistant";
  const row = document.createElement("article");
  row.className = "message " + (isJ ? "janete" : "leandro");
  const av = document.createElement("div"); av.className = "avatar"; av.textContent = isJ ? "J" : "L";
  const b = document.createElement("div"); b.className = "bubble";
  const meta = document.createElement("div"); meta.className = "meta";
  const who = document.createElement("b"); who.textContent = isJ ? "Janete" : "Leandro";
  meta.append(who);
  const body = document.createElement("div"); body.className = "body"; body.textContent = text;
  b.append(meta, body); row.append(av, b);
  return { row, body };
}
function render() {
  const list = $("messages");
  list.replaceChildren();
  if (!state.history.length) {
    const e = document.createElement("div"); e.className = "empty"; e.textContent = "Fala alguma coisa, porra. Tô esperando.";
    list.append(e); return;
  }
  for (const m of state.history) list.append(bubble(m.role, m.content).row);
  list.scrollTop = list.scrollHeight;
}
function notice(t) { $("notice").textContent = t || ""; $("notice").hidden = !t; }
function setDictation(t, active = false) { $("dictation-status").textContent = t; $("dictation-status").classList.toggle("active", active); }

async function send(text) {
  const value = String(text || "").trim();
  if (!value || state.busy || !state.engine) return;
  state.busy = true; $("send").disabled = true; notice("");
  if (!state.history.length) $("messages").replaceChildren();
  state.history.push({ role: "user", content: value });
  $("messages").append(bubble("user", value).row);
  $("draft").value = "";
  const out = bubble("assistant", "");
  out.body.classList.add("typing");
  $("messages").append(out.row);
  $("messages").scrollTop = $("messages").scrollHeight;
  setDictation("Janete pensando…", true);
  const t0 = performance.now();
  let reply = "";
  try {
    const messages = [{ role: "system", content: sistema() }, ...state.history.slice(-12)];
    const stream = await state.engine.chat.completions.create({ messages, stream: true, temperature: 0.9, top_p: 0.95, max_tokens: 320 });
    for await (const chunk of stream) {
      const d = chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content;
      if (d) { reply += d; out.body.textContent = reply; $("messages").scrollTop = $("messages").scrollHeight; }
    }
    reply = reply.trim() || "Deu branco aqui, caralho. Fala de novo.";
    out.body.textContent = reply;
    state.history.push({ role: "assistant", content: reply });
    save();
    $("speed").textContent = "respondeu em " + ((performance.now() - t0) / 1000).toFixed(1) + " s, sem internet";
    setDictation(state.live ? "Live ligada." : "Escreva ou use o microfone.");
    speak(reply);
  } catch (e) {
    console.error(e);
    state.history.pop();
    out.row.remove();
    notice("Travou aqui: " + String(e && e.message || e).slice(0, 160));
    setDictation("Não respondeu. O texto não foi perdido: escreva de novo.");
  } finally {
    out.body.classList.remove("typing");
    state.busy = false; $("send").disabled = false;
    if (state.live && !state.speaking && !state.listening) startListening(true);
  }
}

// ---------- voz ----------
// Pronúncia (regra da Vinci): Felyx se fala Félix; Vinci se fala Víntchi.
function forSpeech(t) {
  return t.replace(/\bFelyx\b/gi, "Félix").replace(/\bVinci\b/g, "Víntchi").replace(/[*_#`]/g, "");
}
function updateLive() {
  const st = document.querySelector(".stage");
  st.classList.toggle("listening", state.listening); st.classList.toggle("speaking", state.speaking);
  $("live-toggle").classList.toggle("active", state.live);
  $("live-toggle").textContent = state.live ? "■ Encerrar live" : "▶ Iniciar live";
  $("live-state").textContent = state.speaking ? "Janete falando" : state.listening ? "Ouvindo você" : state.live ? "Live ligada" : "Live desligada";
}
function pickVoice() {
  const vs = speechSynthesis.getVoices().filter((v) => /^pt(-|_)BR/i.test(v.lang));
  return vs.find((v) => /Luciana|Francisca|Vit[oó]ria|female|feminina/i.test(v.name)) || vs.find((v) => v.localService) || vs[0] || null;
}
function speak(text) {
  if (!(state.voice || state.live) || !("speechSynthesis" in window) || !text) return;
  stopListening();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(forSpeech(text));
  u.lang = "pt-BR"; u.voice = pickVoice(); u.rate = 1.05;
  u.onstart = () => { state.speaking = true; updateLive(); };
  const done = () => { state.speaking = false; updateLive(); if (state.live) startListening(true); };
  u.onend = done; u.onerror = done;
  speechSynthesis.speak(u);
}
function stopListening() {
  if (state.recognition) { const r = state.recognition; state.recognition = null; try { r.stop(); } catch (_) {} }
  state.listening = false; $("mic").classList.remove("active"); updateLive();
}
function startListening(autoSend) {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!R) { notice("Este navegador não transcreve voz. Use o Chrome ou escreva na caixa."); return false; }
  if (state.recognition || state.speaking || state.busy) return true;
  const r = new R(); state.recognition = r;
  r.lang = "pt-BR"; r.continuous = false; r.interimResults = true;
  r.onstart = () => { state.listening = true; $("mic").classList.add("active"); updateLive(); setDictation("Ouvindo você…", true); };
  r.onresult = (ev) => {
    let t = "", fin = false;
    for (let i = ev.resultIndex; i < ev.results.length; i++) { t += ev.results[i][0].transcript; if (ev.results[i].isFinal) fin = true; }
    $("draft").value = t.trim();
    if (fin && t.trim() && (autoSend || state.live)) { stopListening(); send(t); }
  };
  r.onerror = (ev) => {
    if (ev.error === "not-allowed" || ev.error === "service-not-allowed") { state.live = false; notice("Libere o microfone no navegador."); }
    else if (ev.error === "network") notice("Sem internet o navegador não transcreve a voz. Digite: a Janete continua respondendo.");
    else if (ev.error !== "no-speech" && ev.error !== "aborted") notice("Microfone: " + ev.error);
  };
  r.onend = () => {
    if (state.recognition === r) state.recognition = null;
    state.listening = false; $("mic").classList.remove("active"); updateLive();
    if (state.live && !state.speaking && !state.busy) setTimeout(() => startListening(true), 400);
  };
  try { r.start(); return true; } catch (_) { state.recognition = null; return false; }
}

// ---------- senha ----------
// Só a impressão da senha (PBKDF2-SHA256, 600 mil voltas) fica no código; a senha em si não.
const SENHA = { sal: "b8b5b558e7e5af6837864f57d56a5ec4", voltas: 600000, hash: "0f5e530d2df4409472eef2e00ac4ecf20bdbdbbfb5d21b0f9bbf6b3946ffb4ef" };
const hex2buf = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)));
async function senhaCerta(s) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(s), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: hex2buf(SENHA.sal), iterations: SENHA.voltas }, key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("") === SENHA.hash;
}
function liberar() {
  $("pw-form").hidden = true; $("unlocked").hidden = false;
  try { sessionStorage.setItem("janete-liberada", "1"); } catch (_) {}
}
$("pw-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const v = $("password").value; $("password").disabled = true; gateStatus("Conferindo…");
  let ok = false; try { ok = await senhaCerta(v); } catch (_) {}
  $("password").disabled = false; $("password").value = "";
  if (ok) { gateStatus(""); liberar(); } else { gateStatus("Senha errada, porra. Tenta de novo.", true); $("password").focus(); }
});
try { if (sessionStorage.getItem("janete-liberada") === "1") liberar(); } catch (_) {}
// 6 dígitos digitados: confere sozinho (no iPhone o teclado numérico não tem tecla "Ir")
$("password").addEventListener("input", () => { if (/^\d{6}$/.test($("password").value)) $("pw-form").requestSubmit(); });

// ---------- ligações ----------
choose("big"); // sempre o cérebro maior (decisão do Leandro, 06/11)
$("wake").addEventListener("click", wake);
$("send-form").addEventListener("submit", (e) => { e.preventDefault(); send($("draft").value); });
$("draft").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send($("draft").value); } });
$("mic").addEventListener("click", () => (state.listening ? stopListening() : startListening(true)));
$("live-toggle").addEventListener("click", () => {
  if (state.live) { state.live = false; stopListening(); speechSynthesis.cancel(); state.speaking = false; setDictation("Live encerrada."); }
  else { state.live = true; if (!startListening(true)) state.live = false; }
  updateLive();
});
$("voice-on").addEventListener("click", () => { state.voice = true; $("voice-on").classList.add("active"); $("voice-off").classList.remove("active"); });
$("voice-off").addEventListener("click", () => { state.voice = false; speechSynthesis.cancel(); $("voice-off").classList.add("active"); $("voice-on").classList.remove("active"); });
if ("speechSynthesis" in window) speechSynthesis.getVoices();
updateLive();

// Página e biblioteca ficam guardadas para abrir sem internet.
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
