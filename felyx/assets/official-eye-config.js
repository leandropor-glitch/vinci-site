globalThis.PalanteerOfficialEyeConfig = {
  "projeto": "Palanteer",
  "componente": "Olho animado da capa da landing",
  "versao": "dupla-helice-3d-campo-onda",
  "baseVersao": "contrarrotacao-campo-continuo",
  "referencia": "https://palanteerhq.com/previa/",
  "direcao_visual": {
    "composicao": "Olho central 3D em dupla hélice sobre fundo azul-marinho escuro (#0b0c08) com campo contínuo de esferas 3D em onda suave e cards distribuídos ao redor.",
    "regra_principal": "Nenhum card pode cobrir a pupila, a íris ou as pálpebras; o contorno branco deve permanecer estritamente no formato de olho e a íris estritamente redonda.",
    "fundo_base_inalterado": {
      "corSolida": "#0b0c08",
      "gradientesCss": [
        "radial-gradient(ellipse at 65% 5%, #282a1d53, transparent 40%)",
        "radial-gradient(ellipse at 10% 45%, #1d1f1522, transparent 40%)"
      ],
      "brilhoAmbienteCentral": {
        "raioRelativo": 1.25,
        "paradas": [
          {
            "offset": 0.0,
            "cor": "rgba(207,255,13, 0.20)"
          },
          {
            "offset": 0.4,
            "cor": "rgba(190,238,0, 0.10)"
          },
          {
            "offset": 1.0,
            "cor": "rgba(32,35,24, 0.00)"
          }
        ]
      }
    },
    "paleta": {
      "pupila": "#0f100b",
      "reflexo": "#f2f4ec",
      "iris": "#d4ff29",
      "aneisInternos": "#f2f4ec",
      "aneisExternos": "#d0ff16",
      "heliceFrente": "#f2f4ec",
      "heliceFundo": "#d8ff3d",
      "espinhaPalpebra": "#f2f4ecFF",
      "fundoEsferaVale": "#d1ff1b",
      "fundoEsferaCrista": "#d8ff3d"
    }
  },
  "olho": {
    "periodoSegundos": 10,
    "profundidade": 0.49,
    "contraste": 0.38,
    "girosDaSuperficiePorSegundo": 0.52,
    "ondasDeProfundidade": 2,
    "aneis": 6,
    "sentidosAlternados": true,
    "velocidadeRelativaInicial": 0.48,
    "incrementoPorAnel": 0.16,
    "contornoMeiaLargura": 0.79,
    "contornoMeiaAltura": 0.4,
    "expoenteCurva": 0.85,
    "perspectivaFovRelativo": 4.4,
    "ordenacaoProfundidade": "z-sort back-to-front com núcleo em z=0",
    "iris": {
      "forma": "circulo_estritamente_redondo",
      "raioInicialRelativo": 0.135,
      "passoEntreAneisRelativo": 0.036,
      "particulasPorAnelBase": 22,
      "incrementoParticulasPorAnel": 6,
      "ondaRadialZ": {
        "amplitudeRelativa": 0.115,
        "velocidadeAngular": 1.35,
        "defasagemPorAnel": 0.65
      },
      "modulacaoProfundidadeAngular": {
        "harmonica": 2,
        "amplitudeRelativa": 0.025
      },
      "esferas3D": {
        "raioInternoRelativo": 0.014,
        "raioExternoRelativo": 0.012,
        "iluminacao": "gradiente_radial_especular_topo_esquerda",
        "especular": 0.9,
        "haloInterno": 0.42,
        "haloExterno": 0.22
      }
    },
    "contorno_olho": {
      "forma": "amendoa_olho_estrita",
      "respiracaoVertical": {
        "amplitude": 0.012,
        "velocidadeAngular": 0.42
      },
      "duplaHelice": {
        "fitas": 2,
        "esferasPorFita": 88,
        "voltasAoLongoDoContorno": 10,
        "velocidadeTorcao": -1.6,
        "raioTuboRelativo": 0.036,
        "profundidadeZMultiplicador": 4.5,
        "afunilamentoNosCantos": "sqrt(1 - u^2)",
        "raioEsferaFrenteRelativo": 0.0155,
        "raioEsferaFundoRelativo": 0.0135
      },
      "espinhaCentral": {
        "esferas": 64,
        "periodoSegundos": -18,
        "raioRelativo": 0.0095,
        "opacidade": 0.72
      }
    },
    "nucleo": {
      "pupilaRaioRelativo": 0.052,
      "brilhoRaioRelativo": 0.145,
      "pulsoAmplitude": 0.03,
      "pulsoVelocidade": 1.2,
      "reflexoRaioRelativo": 0.015,
      "acabamento": "esfera_vitrea_3d"
    }
  },
  "fundo": {
    "formaExterna": null,
    "cobertura": "landing e app web",
    "passoPx": 28,
    "deslocamentoMaximoPx": [
      7,
      9
    ],
    "velocidadeAngularRadianosPorSegundo": [
      0.052,
      0.064
    ],
    "opacidadeBase": 0.09,
    "movimentoReduzido": "estático",
    "esferas3D": {
      "habilitado": true,
      "spritePreRenderizadoPx": 64,
      "iluminacao": "gradiente_radial_especular_topo_esquerda",
      "diametroMinPx": 6.2,
      "diametroMaxPx": 12.0,
      "opacidadeFatorVale": 0.48,
      "opacidadeFatorCrista": 2.43,
      "suavizacaoAtrasDoOlho": {
        "raioPx": 260,
        "fatorMinimoCentro": 0.68
      }
    },
    "onda3D": {
      "perspectivaFovPx": 720,
      "amplitudeZPx": 58,
      "harmonicas": [
        {
          "freqX": 0.0092,
          "freqY": 0.0058,
          "velocidade": -0.95,
          "peso": 1.0
        },
        {
          "freqX": 0.0046,
          "freqY": -0.0084,
          "velocidade": 0.68,
          "peso": 0.55
        }
      ],
      "ordenacaoProfundidade": "z-sort back-to-front"
    }
  },
  "implementacao": {
    "renderizador": "Canvas 2D",
    "elemento": "#eyeHero",
    "elementoFundo": "#particleField",
    "otimizacao": "Pré-renderizar 2 sprites offscreen (64x64) de esfera 3D (vale e crista) para o campo de fundo e desenhar via drawImage com globalAlpha e z-sort.",
    "arquivos": [
      "site/assets/official-eye-config.js",
      "site/assets/official-eye.js",
      "site/assets/g01-hologram.js",
      "site/assets/official-eye.css"
    ]
  },
  "blocos": {
    "assistente": "#1e2016",
    "cena": "#494b42",
    "interruptor": "#51402a",
    "conexao": "#191b13",
    "comando": "#4d2f42",
    "atualizacoes": "#222419",
    "casa4d": "#26281c",
    "temperatura": "#503b42",
    "vozes": "#43443d"
  }
};
