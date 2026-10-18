(function () {
  "use strict";

  /* Menu do celular */
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      mobileNav.hidden = !open;
      toggle.querySelector(".menu-label").textContent = open ? "Fechar" : "Menu";
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* Sala interativa da home: luz por circuito, persiana, TV, velas e som */
  var sala = document.getElementById("sala");
  if (sala) iniciarSala(sala);

  function iniciarSala(stage) {
    var frame = stage.parentNode;
    var baseImg = stage.getAttribute("data-img");
    var baseMedia = stage.getAttribute("data-media");
    var baseSom = stage.getAttribute("data-som");
    var sizes = stage.querySelector(".layer").getAttribute("sizes");
    var tv = stage.querySelector(".tv");
    var velas = stage.querySelector(".velas");
    var botoes = [].slice.call(document.querySelectorAll(".scene-btn"));
    var somBtn = document.querySelector(".sound-btn");
    var ask = frame.querySelector(".sound-ask");
    var askText = document.getElementById("sound-ask-text");
    var eq = document.querySelector(".eq");
    var reduzir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var K = reduzir ? 0.35 : 1;
    var campos = {};
    ["luzes", "cortinas", "clima", "som"].forEach(function (k) {
      campos[k] = document.querySelector('[data-status="' + k + '"]');
    });

    function srcset(nome) {
      var b = baseImg + "sala-" + nome;
      return b + "-1000.webp 1000w, " + b + "-1600.webp 1600w, " + b + "-2376.webp 2376w";
    }
    function absoluto(u) { return new URL(u, document.baseURI).href; }
    var MASCARA = 'url("' + absoluto(baseImg + "vidro.png") + '")';
    var MASCARA_INV = 'url("' + absoluto(baseImg + "vidro-inv.png") + '")';

    /* fotos das cenas: carregadas depois que a página abre */
    var cache = {};
    function carregar(nome) {
      if (!cache[nome]) {
        var im = new Image();
        im.decoding = "async";
        im.sizes = sizes;
        im.srcset = srcset(nome);
        var pronto = im.decode ? im.decode() : new Promise(function (ok, erro) { im.onload = ok; im.onerror = erro; });
        cache[nome] = pronto.then(function () { return im; }, function () { return im; });
      }
      return cache[nome];
    }
    function preCarregar() {
      ["cheguei", "jantar", "cinema", "cinema-tv", "saindo"].forEach(function (n, i) {
        setTimeout(function () { carregar(n); }, 400 * i);
      });
    }
    if (document.readyState === "complete") setTimeout(preCarregar, 500);
    else window.addEventListener("load", function () { setTimeout(preCarregar, 500); });

    /* camadas */
    function camada(nome, classes) {
      var im = document.createElement("img");
      im.className = "layer" + (classes ? " " + classes : "");
      im.alt = "";
      im.setAttribute("aria-hidden", "true");
      im.decoding = "async";
      im.sizes = sizes;
      im.srcset = srcset(nome);
      stage.insertBefore(im, tv);
      return im;
    }
    function mostrar(el, atraso, duracao) {
      el.style.transitionDuration = Math.round(duracao * K) + "ms";
      el.style.transitionDelay = Math.round(atraso * K) + "ms";
      el.getBoundingClientRect();
      requestAnimationFrame(function () { el.classList.add("is-in"); });
    }
    function mascarar(el, mascara, comGradiente) {
      var valor = comGradiente ? mascara + ", var(--m)" : mascara;
      el.style.webkitMaskImage = valor;
      el.style.maskImage = valor;
      el.style.webkitMaskSize = "100% 100%";
      el.style.maskSize = "100% 100%";
      el.style.webkitMaskRepeat = "no-repeat";
      el.style.maskRepeat = "no-repeat";
      if (comGradiente) {
        el.style.webkitMaskComposite = "source-in";
        el.style.maskComposite = "intersect";
      }
    }

    var estado = { cena: "inicio", persiana: "aberta", geracao: 0, pedido: 0, luzes: 0 };
    var timers = [];
    function depois(ms, fn) { timers.push(setTimeout(fn, Math.round(ms * K))); }
    function limparTimers() { timers.forEach(clearTimeout); timers = []; }

    function transicao(op) {
      var g = ++estado.geracao;
      var mudaPersiana = op.persiana && op.persiana !== estado.persiana;
      (op.grupos || []).forEach(function (grupo, i) {
        var el = camada(op.nome, "g g-" + grupo);
        if (mudaPersiana) mascarar(el, MASCARA_INV, true);
        mostrar(el, (op.atrasoGrupos || 0) + i * (op.intervalo || 500), op.duracaoGrupo || 1400);
      });
      var cheia = camada(op.nome, "");
      if (mudaPersiana) mascarar(cheia, MASCARA_INV, false);
      mostrar(cheia, op.cheia.atraso, op.cheia.duracao);
      var fim = op.cheia.atraso + op.cheia.duracao;
      if (mudaPersiana) {
        moverPersiana(op.nome, op.persiana, op.cortina.atraso, op.cortina.duracao);
        fim = Math.max(fim, op.cortina.atraso + op.cortina.duracao);
        estado.persiana = op.persiana;
      }
      depois(fim + 150, function () { assentar(op.nome, g); });
    }
    function assentar(nome, g) {
      if (g !== estado.geracao) return;
      var base = camada(nome, "is-base");
      stage.insertBefore(base, stage.firstChild);
      var limpar = function () {
        if (g !== estado.geracao) return;
        [].slice.call(stage.querySelectorAll(".layer")).forEach(function (el) {
          if (el !== base && !el.classList.contains("manter")) el.parentNode.removeChild(el);
        });
        [].slice.call(stage.querySelectorAll(".trilho")).forEach(function (el) { el.parentNode.removeChild(el); });
      };
      (base.decode ? base.decode() : Promise.resolve()).then(limpar, limpar);
    }
    function visual(nome, op) {
      var pedido = ++estado.pedido;
      op.nome = nome;
      carregar(nome).then(function () { if (pedido === estado.pedido) transicao(op); });
    }

    /* persiana: desce (ou sobe) só no vão da janela, com a barra de baixo acompanhando */
    function moverPersiana(nome, destino, atraso, duracao) {
      var TOPO = 29.3, BASE = 65.1;
      var el = camada(nome, "persiana");
      mascarar(el, MASCARA, false);
      var ini = destino === "fechada" ? "inset(" + TOPO + "% 0 " + (100 - TOPO) + "% 0)" : "inset(" + BASE + "% 0 " + (100 - BASE) + "% 0)";
      var fim = "inset(" + TOPO + "% 0 " + (100 - BASE) + "% 0)";
      el.style.webkitClipPath = ini;
      el.style.clipPath = ini;
      var trilho = document.createElement("div");
      trilho.className = "trilho";
      trilho.setAttribute("aria-hidden", "true");
      trilho.innerHTML = "<i></i>";
      mascarar(trilho, MASCARA, false);
      var barra = trilho.firstChild;
      barra.style.top = (destino === "fechada" ? TOPO : BASE) + "%";
      stage.insertBefore(trilho, tv);
      var d = Math.round(duracao * K), a = Math.round(atraso * K);
      el.getBoundingClientRect();
      requestAnimationFrame(function () {
        el.style.transition = "clip-path " + d + "ms linear " + a + "ms, -webkit-clip-path " + d + "ms linear " + a + "ms";
        el.style.webkitClipPath = fim;
        el.style.clipPath = fim;
        barra.style.transition = "top " + d + "ms linear " + a + "ms";
        barra.style.top = (destino === "fechada" ? BASE : TOPO) + "%";
        trilho.style.transitionDelay = a + "ms";
        trilho.classList.add("is-on");
      });
      depois(atraso + duracao + 100, function () { trilho.style.transitionDelay = "0ms"; trilho.classList.remove("is-on"); });
    }

    /* painel de status */
    var animLuz = null;
    function status(campo, texto, atraso, mexendo) {
      depois(atraso || 0, function () {
        campos[campo].textContent = texto;
        campos[campo].classList.toggle("is-moving", !!mexendo);
      });
    }
    function contarLuzes(alvo, atraso, duracao) {
      depois(atraso, function () {
        var de = estado.luzes, t0 = performance.now(), d = Math.max(1, duracao * K);
        if (animLuz) cancelAnimationFrame(animLuz);
        campos.luzes.classList.add("is-moving");
        (function passo(t) {
          var p = Math.min(1, Math.max(0, (t - t0) / d));
          var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          var v = Math.round(de + (alvo - de) * e);
          estado.luzes = v;
          campos.luzes.textContent = v === 0 ? "Desligadas" : v + "%";
          if (p < 1) animLuz = requestAnimationFrame(passo);
          else campos.luzes.classList.remove("is-moving");
        })(t0);
      });
    }

    /* TV com o vídeo da NASA encaixado na tela */
    var QUAD = [[100, 331], [449, 388], [449, 583], [100, 622]];
    function matrizQuad(p) {
      var x0 = p[0][0], y0 = p[0][1], x1 = p[1][0], y1 = p[1][1], x2 = p[2][0], y2 = p[2][1], x3 = p[3][0], y3 = p[3][1];
      var dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
      var den = dx1 * dy2 - dx2 * dy1;
      var g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
      return [x1 - x0 + g * x1, y1 - y0 + g * y1, 0, g, x3 - x0 + h * x3, y3 - y0 + h * y3, 0, h, 0, 0, 1, 0, x0, y0, 0, 1];
    }
    function posicionarTv() {
      var w = stage.offsetWidth, h = stage.offsetHeight;
      if (!w || !h) return;
      var p = QUAD.map(function (q) { return [q[0] * w / 2376, q[1] * h / 1008]; });
      tv.style.transform = "matrix3d(" + matrizQuad(p).join(",") + ") scale(" + 1 / 854 + "," + 1 / 480 + ")";
    }
    posicionarTv();
    if (window.ResizeObserver) new ResizeObserver(posicionarTv).observe(stage);
    else window.addEventListener("resize", posicionarTv);

    var luzTv = null, brilho = null;
    function ligarTv(atraso) {
      depois(atraso, function () {
        if (!tv.getAttribute("src")) {
          var webm = tv.canPlayType && tv.canPlayType('video/webm; codecs="vp9"');
          tv.poster = baseMedia + "cinema-terra.jpg";
          tv.src = baseMedia + (webm ? "cinema-terra.webm" : "cinema-terra.mp4");
        }
        try { tv.currentTime = 0; } catch (e) { /* ainda carregando */ }
        var p = tv.play();
        if (p && p.catch) p.catch(function () {});
        tv.classList.add("is-on");
        if (!luzTv) {
          luzTv = camada("cinema-tv", "manter luz-tv");
          mostrar(luzTv, 0, 900);
          depois(950, acompanharBrilho);
        }
        sfx.tv();
      });
    }
    function desligarTv() {
      if (brilho) clearInterval(brilho);
      brilho = null;
      tv.classList.remove("is-on");
      setTimeout(function () { if (!tv.classList.contains("is-on")) tv.pause(); }, 600);
      if (luzTv) {
        var l = luzTv;
        luzTv = null;
        l.classList.remove("manter");
        l.style.transition = "opacity 500ms ease";
        l.style.opacity = "0";
        setTimeout(function () { if (l.parentNode) l.parentNode.removeChild(l); }, 650);
      }
    }
    /* a luz da TV na sala acompanha o brilho do filme */
    function acompanharBrilho() {
      if (!luzTv || brilho) return;
      var c = document.createElement("canvas");
      c.width = 16; c.height = 9;
      var ctx = c.getContext("2d", { willReadFrequently: true });
      var atual = 1;
      luzTv.style.transition = "opacity 240ms linear";
      brilho = setInterval(function () {
        if (!luzTv || tv.readyState < 2) return;
        try {
          ctx.drawImage(tv, 0, 0, 16, 9);
          var d = ctx.getImageData(0, 0, 16, 9).data, soma = 0;
          for (var i = 0; i < d.length; i += 4) soma += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          var lum = soma / (d.length / 4) / 255;
          var alvo = Math.max(0.45, Math.min(1, 0.5 + lum * 1.1));
          atual += (alvo - atual) * 0.4;
          luzTv.style.opacity = atual.toFixed(3);
        } catch (e) {
          clearInterval(brilho);
          brilho = null;
        }
      }, 200);
    }

    /* som: música por cena e efeitos sintetizados (fechadura, motor da persiana, bipe do ar) */
    var som = { ctx: null, master: null, ligado: false, decidido: false, musica: null, ruido: null };
    try {
      var salvo = sessionStorage.getItem("vinci-som");
      if (salvo) { som.decidido = true; som.ligado = salvo === "on"; }
    } catch (e) { /* sem armazenamento: pergunta de novo */ }
    function audio() {
      if (!som.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        som.ctx = new AC();
        som.master = som.ctx.createGain();
        som.master.gain.value = som.ligado ? 0.9 : 0;
        som.master.connect(som.ctx.destination);
      }
      if (som.ctx.state === "suspended") som.ctx.resume();
      return som.ctx;
    }
    var FAIXAS = {
      bossa: { arquivo: "cheguei-bossa.mp3", volume: 0.62, loop: true, rotulo: "Bossa nova" },
      jazz: { arquivo: "jantar-jazz.mp3", volume: 0.5, loop: true, rotulo: "Jazz" },
      fanfarra: { arquivo: "cinema-fanfarra.mp3", volume: 0.72, loop: false, rotulo: "Trilha de cinema" }
    };
    var MUSICA = { inicio: null, cheguei: "bossa", cinema: "fanfarra", jantar: "jazz", saindo: null };
    function pararMusica(seg) {
      var m = som.musica;
      som.musica = null;
      if (!m) return;
      if (m.ganho && som.ctx) {
        var t = som.ctx.currentTime;
        m.ganho.gain.cancelScheduledValues(t);
        m.ganho.gain.setValueAtTime(m.ganho.gain.value, t);
        m.ganho.gain.linearRampToValueAtTime(0, t + seg);
      } else m.el.volume = 0;
      setTimeout(function () {
        m.el.pause();
        if (m.ganho) m.ganho.disconnect();
        m.el.removeAttribute("src");
        m.el.load();
      }, seg * 1000 + 120);
    }
    /* chamado dentro do clique: o navegador libera o áudio e a música entra no tempo da cena */
    function tocar(nome, atraso) {
      pararMusica(1.2);
      if (!nome || !som.ligado) return;
      var ctx = audio();
      var f = FAIXAS[nome];
      var el = new Audio();
      el.preload = "auto";
      el.loop = f.loop;
      el.src = baseSom + f.arquivo;
      var ganho = null;
      if (ctx) {
        try {
          ganho = ctx.createGain();
          ganho.gain.value = 0;
          ctx.createMediaElementSource(el).connect(ganho);
          ganho.connect(som.master);
        } catch (e) { ganho = null; }
      }
      if (!ganho) el.volume = 0;
      var m = { el: el, ganho: ganho, nome: nome, comecou: false };
      som.musica = m;
      el.addEventListener("ended", function () {
        if (som.musica !== m) return;
        eq.classList.remove("is-on");
        campos.som.textContent = "Trilha encerrada";
      });
      var p = el.play();
      if (p && p.then) p.then(function () { if (som.musica === m && !m.comecou) { el.pause(); el.currentTime = 0; } }, function () {});
      depois(atraso || 0, function () {
        if (som.musica !== m) return;
        m.comecou = true;
        el.currentTime = 0;
        var q = el.play();
        if (q && q.catch) q.catch(function () {});
        if (ganho) {
          var t = som.ctx.currentTime;
          ganho.gain.setValueAtTime(0, t);
          ganho.gain.linearRampToValueAtTime(f.volume, t + 1.5);
        } else el.volume = f.volume;
      });
    }
    var sfx = {
      ok: function () { return som.ligado && som.ctx; },
      t: function (atraso) { return som.ctx.currentTime + (atraso || 0) * K / 1000; },
      ruidoBuf: function () {
        if (!som.ruido) {
          var b = som.ctx.createBuffer(1, som.ctx.sampleRate, som.ctx.sampleRate), d = b.getChannelData(0);
          for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          som.ruido = b;
        }
        return som.ruido;
      },
      tom: function (freq, ini, dur, vol, tipo, freqFim) {
        var o = som.ctx.createOscillator(), g = som.ctx.createGain();
        o.type = tipo || "sine";
        o.frequency.setValueAtTime(freq, ini);
        if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, ini + dur);
        g.gain.setValueAtTime(0.0001, ini);
        g.gain.exponentialRampToValueAtTime(vol, ini + Math.min(0.015, dur / 4));
        g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
        o.connect(g); g.connect(som.master);
        o.start(ini); o.stop(ini + dur + 0.05);
      },
      clique: function (ini, vol, freq) {
        var s = som.ctx.createBufferSource(), f = som.ctx.createBiquadFilter(), g = som.ctx.createGain();
        s.buffer = this.ruidoBuf();
        f.type = "bandpass"; f.frequency.value = freq || 2400; f.Q.value = 1.4;
        g.gain.setValueAtTime(vol, ini);
        g.gain.exponentialRampToValueAtTime(0.0001, ini + 0.04);
        s.connect(f); f.connect(g); g.connect(som.master);
        s.start(ini, Math.random() * 0.5, 0.06);
      },
      fechadura: function (atraso) {
        if (!this.ok()) return;
        var t = this.t(atraso);
        this.clique(t, 0.3, 2600);
        this.clique(t + 0.07, 0.2, 1800);
        this.tom(170, t + 0.03, 0.24, 0.045, "sawtooth", 135);
        this.tom(120, t + 0.27, 0.14, 0.24, "sine", 68);
        this.tom(1318.5, t + 0.46, 0.18, 0.07);
        this.tom(1760, t + 0.64, 0.3, 0.07);
      },
      trancar: function (atraso) {
        if (!this.ok()) return;
        var t = this.t(atraso);
        this.tom(1568, t, 0.12, 0.06);
        this.tom(1318.5, t + 0.17, 0.12, 0.06);
        this.tom(1046.5, t + 0.34, 0.22, 0.06);
        this.clique(t + 0.64, 0.26, 2200);
        this.tom(110, t + 0.66, 0.14, 0.22, "sine", 62);
      },
      bipe: function (atraso) {
        if (!this.ok()) return;
        this.tom(2093, this.t(atraso), 0.1, 0.045);
      },
      tv: function () {
        if (!this.ok()) return;
        this.tom(150, this.t(0), 0.22, 0.12, "sine", 52);
      },
      motor: function (atraso, duracao) {
        if (!this.ok()) return;
        var ctx = som.ctx, t = this.t(atraso), d = Math.max(0.8, duracao * K / 1000);
        var g = ctx.createGain(), lp = ctx.createBiquadFilter();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05, t + 0.35);
        g.gain.setValueAtTime(0.05, t + d - 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        lp.type = "lowpass"; lp.frequency.value = 420; lp.Q.value = 0.7;
        var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g2 = ctx.createGain();
        o1.type = "sawtooth"; o1.frequency.value = 96;
        o2.type = "sawtooth"; o2.frequency.value = 192.7;
        lfo.frequency.value = 5.5; lg.gain.value = 2.2;
        lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
        g2.gain.value = 0.35;
        o1.connect(lp); o2.connect(g2); g2.connect(lp);
        var n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
        n.buffer = this.ruidoBuf(); n.loop = true;
        bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 1.2; ng.gain.value = 0.25;
        n.connect(bp); bp.connect(ng); ng.connect(lp);
        lp.connect(g); g.connect(som.master);
        [o1, o2, lfo, n].forEach(function (x) { x.start(t); x.stop(t + d + 0.1); });
      }
    };
    function atualizarSomStatus(atraso) {
      var f = MUSICA[estado.cena];
      status("som", !f ? "Desligado" : som.ligado ? FAIXAS[f].rotulo : "Sem som", atraso || 0);
      depois(atraso || 0, function () { eq.classList.toggle("is-on", !!(f && som.ligado)); });
    }
    function atualizarBotaoSom() {
      somBtn.setAttribute("aria-pressed", String(som.ligado));
      somBtn.querySelector("use").setAttribute("href", som.ligado ? "#i-volume-2" : "#i-volume-x");
      somBtn.querySelector("span").textContent = som.ligado ? "Som ligado" : "Som desligado";
      if (som.master && som.ctx) {
        var t = som.ctx.currentTime;
        som.master.gain.cancelScheduledValues(t);
        som.master.gain.setValueAtTime(som.master.gain.value, t);
        som.master.gain.linearRampToValueAtTime(som.ligado ? 0.9 : 0, t + 0.4);
      }
    }
    function guardarSom() {
      try { sessionStorage.setItem("vinci-som", som.ligado ? "on" : "off"); } catch (e) { /* ok */ }
    }
    atualizarBotaoSom();
    somBtn.addEventListener("click", function () {
      som.ligado = !som.ligado;
      som.decidido = true;
      guardarSom();
      if (som.ligado) audio();
      atualizarBotaoSom();
      if (som.ligado && MUSICA[estado.cena] && !som.musica) tocar(MUSICA[estado.cena], 0);
      if (!som.ligado) pararMusica(0.5);
      atualizarSomStatus(0);
    });

    /* pergunta do som na primeira cena com música */
    var TEXTOS = {
      cheguei: "A casa recebe você com uma bossa nova. Você desliga quando quiser.",
      cinema: "O cinema começa com uma trilha de filme. Você desliga quando quiser.",
      jantar: "O jantar tem um jazz suave ao fundo. Você desliga quando quiser."
    };
    var pendente = null;
    function perguntar(nome) {
      pendente = nome;
      askText.textContent = TEXTOS[nome];
      ask.hidden = false;
      ask.querySelector('[data-sound="on"]').focus();
    }
    function decidir(ligar) {
      som.decidido = true;
      som.ligado = ligar;
      guardarSom();
      if (ligar) audio();
      atualizarBotaoSom();
      ask.hidden = true;
      var n = pendente;
      pendente = null;
      botoes.forEach(function (b) { if (b.getAttribute("data-scene") === n) b.focus(); });
      if (n) cena(n);
    }
    ask.addEventListener("click", function (e) {
      var b = e.target.closest("[data-sound]");
      if (b) decidir(b.getAttribute("data-sound") === "on");
    });
    ask.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); decidir(false); }
    });

    /* as cenas */
    var CENAS = {
      cheguei: function () {
        desligarTv();
        velas.classList.remove("is-on");
        sfx.fechadura(0);
        tocar("bossa", 900);
        if (estado.persiana === "fechada") {
          sfx.motor(500, 5000);
          status("cortinas", "Abrindo…", 500, true);
          status("cortinas", "Abertas", 5500);
        } else status("cortinas", "Abertas");
        visual("cheguei", { grupos: ["sanca", "spots", "adega", "estar", "mesa"], atrasoGrupos: 450, intervalo: 520, duracaoGrupo: 1500, cheia: { atraso: 3300, duracao: 1400 }, persiana: "aberta", cortina: { atraso: 500, duracao: 5000 } });
        contarLuzes(70, 450, 3500);
        sfx.bipe(2300);
        status("clima", "Ligando…", 2300, true);
        status("clima", "23 °C", 3800);
        atualizarSomStatus(900);
      },
      cinema: function () {
        velas.classList.remove("is-on");
        tocar("fanfarra", 2900);
        if (estado.persiana === "aberta") {
          sfx.motor(300, 5200);
          status("cortinas", "Fechando…", 300, true);
          status("cortinas", "Fechadas", 5500);
        } else status("cortinas", "Fechadas");
        visual("cinema", { cheia: { atraso: 150, duracao: 2600 }, persiana: "fechada", cortina: { atraso: 300, duracao: 5200 } });
        contarLuzes(5, 150, 2600);
        ligarTv(2700);
        sfx.bipe(1200);
        status("clima", "22 °C", 1200);
        atualizarSomStatus(2900);
      },
      jantar: function () {
        desligarTv();
        tocar("jazz", 700);
        if (estado.persiana === "fechada") {
          sfx.motor(300, 5000);
          status("cortinas", "Abrindo…", 300, true);
          status("cortinas", "Abertas", 5300);
        } else status("cortinas", "Abertas");
        visual("jantar", { cheia: { atraso: 100, duracao: 2400 }, persiana: "aberta", cortina: { atraso: 300, duracao: 5000 } });
        depois(2000, function () { velas.classList.add("is-on"); });
        contarLuzes(40, 100, 2400);
        status("clima", "23 °C", 600);
        atualizarSomStatus(700);
      },
      saindo: function () {
        tocar(null);
        desligarTv();
        velas.classList.remove("is-on");
        if (estado.persiana === "aberta") {
          sfx.motor(700, 5200);
          status("cortinas", "Fechando…", 700, true);
          status("cortinas", "Fechadas", 5900);
        } else status("cortinas", "Fechadas");
        visual("saindo", { grupos: ["mesa", "adega", "spots", "estar", "sanca"], atrasoGrupos: 300, intervalo: 450, duracaoGrupo: 1300, cheia: { atraso: 2600, duracao: 1500 }, persiana: "fechada", cortina: { atraso: 700, duracao: 5200 } });
        contarLuzes(0, 300, 3600);
        sfx.bipe(1500);
        status("clima", "Desligado", 1500);
        sfx.trancar(6300);
        atualizarSomStatus(0);
      }
    };
    function cena(nome) {
      limparTimers();
      estado.cena = nome;
      botoes.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-scene") === nome)); });
      frame.setAttribute("data-focus", nome);
      if (som.ligado) audio();
      CENAS[nome]();
    }
    botoes.forEach(function (b) {
      b.addEventListener("click", function () {
        var nome = b.getAttribute("data-scene");
        if (!som.decidido && MUSICA[nome]) { perguntar(nome); return; }
        cena(nome);
      });
      if (b.getAttribute("data-scene") === "cinema") {
        b.addEventListener("pointerenter", function () {
          if (!tv.getAttribute("src")) {
            var webm = tv.canPlayType && tv.canPlayType('video/webm; codecs="vp9"');
            tv.preload = "auto";
            tv.poster = baseMedia + "cinema-terra.jpg";
            tv.src = baseMedia + (webm ? "cinema-terra.webm" : "cinema-terra.mp4");
          }
        }, { once: true });
      }
    });
  }

  /* Galeria de projetos: filtros por tipo e foto ampliada */
  var gallery = document.querySelector(".gallery");
  if (gallery) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll(".g-item"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".g-filters .chip"));
    var counter = document.querySelector("[data-count]");
    var known = {};
    chips.forEach(function (c) { known[c.getAttribute("data-filter")] = true; });
    var applyFilter = function (key, updateUrl) {
      if (!known[key]) key = "todos";
      var n = 0;
      items.forEach(function (it) {
        var show = key === "todos" || it.getAttribute("data-cat") === key;
        it.hidden = !show;
        if (show) n++;
      });
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-filter") === key)); });
      if (counter) counter.textContent = n;
      if (updateUrl && window.history && history.replaceState) {
        try { history.replaceState(null, "", key === "todos" ? location.pathname + location.search : "#" + key); } catch (err) { /* sem histórico */ }
      }
    };
    chips.forEach(function (c) {
      c.addEventListener("click", function () { applyFilter(c.getAttribute("data-filter"), true); });
    });
    var fromHash = location.hash.replace("#", "");
    if (fromHash && known[fromHash]) applyFilter(fromHash, false);

    var dialog = document.querySelector(".lightbox");
    if (dialog && typeof dialog.showModal === "function") {
      var figure = dialog.querySelector(".lb-figure");
      var caption = dialog.querySelector(".lb-title");
      var counterLb = dialog.querySelector(".lb-n");
      var big = null;
      var current = 0, opener = null;
      var visible = function () { return items.filter(function (it) { return !it.hidden; }); };
      var show = function (idx) {
        var list = visible();
        if (!list.length) return;
        current = (idx + list.length) % list.length;
        var link = list[current].querySelector("a");
        var thumb = link.querySelector("img");
        if (!big) {
          big = document.createElement("img");
          big.className = "lb-img";
          big.decoding = "async";
          figure.insertBefore(big, figure.firstChild);
        }
        big.width = +link.getAttribute("data-w");
        big.height = +link.getAttribute("data-h");
        big.src = link.getAttribute("href");
        big.alt = thumb ? thumb.alt : "";
        caption.textContent = link.getAttribute("data-title");
        counterLb.textContent = (current + 1) + " de " + list.length;
        [current - 1, current + 1].forEach(function (j) {
          var near = list[(j + list.length) % list.length];
          if (near) { var pre = new Image(); pre.src = near.querySelector("a").getAttribute("href"); }
        });
      };
      gallery.addEventListener("click", function (e) {
        var link = e.target.closest(".g-item a");
        if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        opener = link;
        show(visible().indexOf(link.parentNode));
        dialog.showModal();
      });
      dialog.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
      dialog.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
      dialog.querySelector(".lb-close").addEventListener("click", function () { dialog.close(); });
      dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
        else if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
      });
      dialog.addEventListener("close", function () {
        if (opener) opener.focus();
      });
      var startX = null;
      dialog.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
      dialog.addEventListener("touchend", function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      });
    }
  }

  /* Formulário de contato: monta a mensagem e continua no WhatsApp */
  var form = document.getElementById("contact-form");
  if (form) {
    var phone = form.getAttribute("data-whatsapp");
    var result = document.getElementById("form-result");
    var resultLink = document.getElementById("form-result-link");
    var showError = function (input, message) {
      var err = document.getElementById(input.id + "-error");
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (err) { err.textContent = message || ""; err.hidden = !message; }
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = form.elements["nome"];
      var mensagem = form.elements["mensagem"];
      var aceite = form.elements["aceite"];
      var ok = true;
      showError(nome, nome.value.trim() ? "" : "Escreva o seu nome.");
      if (!nome.value.trim()) ok = false;
      showError(mensagem, mensagem.value.trim() ? "" : "Conte em poucas palavras o que você quer automatizar.");
      if (!mensagem.value.trim()) ok = false;
      var aceiteErr = document.getElementById("aceite-error");
      if (!aceite.checked) { ok = false; if (aceiteErr) { aceiteErr.hidden = false; } }
      else if (aceiteErr) { aceiteErr.hidden = true; }
      if (!ok) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]') || aceite;
        firstInvalid.focus();
        return;
      }
      var perfil = form.elements["perfil"].value;
      var local = form.elements["local"].value.trim();
      var email = form.elements["email"].value.trim();
      var linhas = [
        "Olá, Vinci! Vim pelo site.",
        "Nome: " + nome.value.trim(),
        "Perfil: " + perfil
      ];
      if (local) linhas.push("Imóvel: " + local);
      if (email) linhas.push("E-mail: " + email);
      linhas.push("", mensagem.value.trim());
      var url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(linhas.join("\n"));
      resultLink.href = url;
      result.hidden = false;
      result.focus();
      try { window.open(url, "_blank", "noopener"); } catch (err) { /* o link continua disponível */ }
    });
  }
})();
