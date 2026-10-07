import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BUSCA_URL,
  acontecimentosDoDia,
  anosImportantes,
  aplicarMascaraData,
  calcular,
  linkWhatsApp,
  validarDataBR,
} from './lib/numerologia';
import { ARCANO_TITULO, ARCANOS, EXPLICACOES, LOGOS_SUBTITULO, LOGOS_TEXTO, SIGNOS_TEXTO } from './lib/conteudo';

const STORAGE_KEY = 'dadosUsuario';

function lerSalvos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Icone({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  busca: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
  relogio: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  calendario: 'M8 2v4 M16 2v4 M3 8h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  copiar: 'M9 9h11v11H9z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  seta: 'M7 17L17 7 M7 7h10v10',
  restaurar: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5',
  limpar: 'M18 6L6 18 M6 6l12 12',
  fechar: 'M18 6L6 18 M6 6l12 12',
  chevron: 'M6 9l6 6 6-6',
};

const SOCIALS = [
  {
    title: 'YouTube',
    href: 'https://youtube.com/gnosisbrasilcanal',
    svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  },
  {
    title: 'Instagram',
    href: 'https://instagram.com/gnosisbrasil',
    svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
  },
  {
    title: 'Facebook',
    href: 'https://facebook.com/gnosisbrasil',
    svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  },
  {
    title: 'TikTok',
    href: 'https://www.tiktok.com/@gnosisbrasil',
    svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  },
];

function WhatsappIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.34zm-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.89 9.88zm8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.47-8.41z" />
    </svg>
  );
}

function CartaoArcano({ rotulo, valor, subtitulo, calculo, significado, busca, buscaUrl, longo, abrirModal }) {
  return (
    <button
      type="button"
      className="mapa-card"
      onClick={() => abrirModal({ rotulo, valor, subtitulo, calculo, significado, busca, buscaUrl })}
    >
      <span className="mapa-rotulo">{rotulo}</span>
      <span className={`mapa-valor${longo ? ' longo' : ''}`}>{valor}</span>
      {subtitulo && <span className="mapa-sub">{subtitulo}</span>}
      <span className="mapa-cta">Ler significado</span>
    </button>
  );
}

export default function App() {
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [secao, setSecao] = useState(null);

  const abrirModal = useCallback((cartao) => setModal(cartao), []);

  const mostrarToast = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(mostrarToast.t);
    mostrarToast.t = window.setTimeout(() => setToast(''), 2600);
  }, []);

  const executarCalculo = useCallback(
    (nomeCalc, dataCalc, { atualizarUrl = true } = {}) => {
      const nomeLimpo = (nomeCalc || '').trim();
      const dataLimpa = (dataCalc || '').trim();
      if (!nomeLimpo) {
        setErro('Informe o nome completo de nascimento.');
        return false;
      }
      if (!validarDataBR(dataLimpa)) {
        setErro('Informe uma data válida no formato dd/mm/aaaa.');
        return false;
      }
      try {
        const r = calcular(nomeLimpo, dataLimpa);
        setResultado(r);
        setSecao(null);
        setErro('');
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ nome: nomeLimpo, dataNascimento: dataLimpa }));
        } catch {
          /* armazenamento indisponível */
        }
        if (atualizarUrl) {
          const params = new URLSearchParams({
            nome: nomeLimpo,
            data: dataLimpa.replace(/\//g, '-'),
          });
          window.history.replaceState(null, '', `/?${params.toString()}`);
        }
        return true;
      } catch (e) {
        setErro(e.message);
        return false;
      }
    },
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nomeParam = params.get('nome');
    const dataParam = params.get('data');
    if (nomeParam && dataParam) {
      const dataBR = dataParam.replace(/-/g, '/');
      setNome(nomeParam);
      setData(dataBR);
      executarCalculo(nomeParam, dataBR, { atualizarUrl: false });
      return;
    }
    const salvos = lerSalvos();
    if (salvos) {
      setNome(salvos.nome || '');
      setData(salvos.dataNascimento || '');
    }
  }, [executarCalculo]);

  useEffect(() => {
    if (!resultado) return;
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [resultado]);

  useEffect(() => {
    if (!modal) return;
    const fechar = (e) => {
      if (e.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, [modal]);

  const cartoes = useMemo(() => {
    if (!resultado) return [];
    return [
      {
        id: 'urgencia',
        rotulo: 'Urgência Interior',
        valor: resultado.urgenciaInterior,
        subtitulo: `Arcano ${resultado.urgenciaInterior} — ${ARCANO_TITULO[resultado.urgenciaInterior]}`,
        significado: ARCANOS[resultado.urgenciaInterior],
        calculo: EXPLICACOES.urgencia,
      },
      {
        id: 'tonica',
        rotulo: 'Tônica Fundamental',
        valor: resultado.tonicaFundamental,
        subtitulo: `Arcano ${resultado.tonicaFundamental} — ${ARCANO_TITULO[resultado.tonicaFundamental]}`,
        significado: ARCANOS[resultado.tonicaFundamental],
        calculo: EXPLICACOES.tonica,
      },
      {
        id: 'dia',
        rotulo: 'Tônica do Dia',
        valor: resultado.tonicaDoDia,
        subtitulo: `Arcano ${resultado.tonicaDoDia} — ${ARCANO_TITULO[resultado.tonicaDoDia]}`,
        significado: ARCANOS[resultado.tonicaDoDia],
        calculo: EXPLICACOES.dia,
      },
      {
        id: 'signo',
        rotulo: 'Signo Zodiacal',
        valor: resultado.signoZodiacal,
        subtitulo: 'Aspectos antagônicos',
        significado: SIGNOS_TEXTO[resultado.signoZodiacal],
        calculo: EXPLICACOES.signo,
        busca: resultado.signoZodiacal,
        longo: true,
      },
      {
        id: 'zodiaco',
        rotulo: 'Zodíaco Regente',
        valor: resultado.zodiacoRegente,
        subtitulo: 'Aspectos antagônicos',
        significado: SIGNOS_TEXTO[resultado.zodiacoRegente],
        calculo: EXPLICACOES.zodiaco,
        busca: resultado.zodiacoRegente,
        longo: true,
      },
      {
        id: 'logos',
        rotulo: 'Logos Regente',
        valor: resultado.logosRegente,
        subtitulo: LOGOS_SUBTITULO[resultado.logosRegente],
        significado: LOGOS_TEXTO[resultado.logosRegente],
        calculo: EXPLICACOES.logos,
        busca: resultado.logosRegente === 'Nenhum' ? null : resultado.logosRegente,
        longo: true,
      },
    ];
  }, [resultado]);

  const acontecimentos = useMemo(
    () => (resultado ? acontecimentosDoDia(resultado.tonicaDoDia) : []),
    [resultado]
  );
  const anos = useMemo(() => (resultado ? anosImportantes(resultado.anoNascimento) : []), [resultado]);

  const copiarLink = async () => {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(linkWhatsApp(resultado, window.location.href));
      mostrarToast('Link do WhatsApp copiado com sucesso!');
    } catch {
      mostrarToast('Não foi possível copiar. Tente novamente.');
    }
  };

  const restaurar = () => {
    const salvos = lerSalvos();
    if (salvos) {
      setNome(salvos.nome || '');
      setData(salvos.dataNascimento || '');
      setErro('');
    } else {
      mostrarToast('Nenhum dado salvo neste navegador.');
    }
  };

  const irParaSecao = (id) => {
    setSecao(id);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="pagina">
      <header className="topo">
        <div className="topo-interno">
          <a className="marca" href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src="/logoGnosis.png" alt="Logo Gnosis" width="44" height="44" />
            <span className="marca-texto">
              <strong>Numerologia Gnóstica</strong>
              <small>Instituto Gnosis Brasil</small>
            </span>
          </a>
          <nav className="topo-nav">
            <a href="https://gnosisbrasil.com" target="_blank" rel="noopener noreferrer">Instituto</a>
            <a href="https://busca.gnosisbrasil.com" target="_blank" rel="noopener noreferrer">Busca</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-interno">
            <img src="/logoGnosis.png" alt="Logo Gnosis" className="hero-logo" width="92" height="92" />
            <p className="hero-eyebrow">Kabala · Tarot · Autoconhecimento</p>
            <h1>
              Numerologia <em>Gnóstica</em>
            </h1>
            <p className="hero-sub">
              A Kabala dos números revela as forças que regem a sua existência: a Urgência
              Interior, a Tônica Fundamental, a Tônica do Dia e as regências zodiacais e
              planetárias do seu ciclo atual — calculadas a partir do nome completo e da
              data de nascimento.
            </p>

            <form
              className="form-card"
              onSubmit={(e) => {
                e.preventDefault();
                executarCalculo(nome, data);
              }}
            >
              <div className="form-linha">
                <label className="campo">
                  <span>Nome completo de nascimento</span>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome Completo de Nascimento *"
                    autoComplete="name"
                  />
                </label>
                <label className="campo data">
                  <span>Data de nascimento</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={data}
                    onChange={(e) => setData(aplicarMascaraData(e.target.value))}
                    placeholder="dd/mm/aaaa *"
                    aria-label="Data de nascimento no formato dia mês ano"
                  />
                </label>
              </div>
              {erro && (
                <p className="form-erro" role="alert">
                  {erro}
                </p>
              )}
              <div className="form-acoes">
                <button type="submit" className="btn-primario">
                  Calcular
                </button>
                <button type="button" className="btn-fantasma" onClick={restaurar} title="Restaurar dados salvos">
                  <Icone d={ICONS.restaurar} size={16} /> Restaurar
                </button>
                <button
                  type="button"
                  className="btn-fantasma"
                  onClick={() => { setNome(''); setData(''); setErro(''); }}
                  title="Limpar dados"
                >
                  <Icone d={ICONS.limpar} size={16} /> Limpar
                </button>
              </div>
            </form>
          </div>
        </section>

        {resultado && (
          <section id="resultados" className="resultados">
            <div className="container">
              <div className="resultados-cabeca">
                <div>
                  <h2>Mapa de {resultado.nome}</h2>
                  <p className="resultados-sub">
                    Nascido em {resultado.dataNascimento} · {resultado.diasDesdeAniversario === 0
                      ? 'hoje é o seu aniversário'
                      : `${resultado.diasDesdeAniversario} dia(s) após o último aniversário`}
                  </p>
                </div>
                <div className="resultados-acoes">
                  <button type="button" className="btn-secundario" onClick={() => irParaSecao('acontecimentos')}>
                    <Icone d={ICONS.relogio} size={16} /> Acontecimentos do Dia
                  </button>
                  <button type="button" className="btn-secundario" onClick={() => irParaSecao('anos')}>
                    <Icone d={ICONS.calendario} size={16} /> Anos Importantes
                  </button>
                  <a
                    className="btn-whatsapp"
                    href={linkWhatsApp(resultado, window.location.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Compartilhar no WhatsApp"
                  >
                    <WhatsappIcon size={16} /> Compartilhar
                  </a>
                  <button type="button" className="btn-secundario icone" onClick={copiarLink} title="Copiar mensagem do WhatsApp">
                    <Icone d={ICONS.copiar} size={16} /> Copiar link
                  </button>
                </div>
              </div>

              <p className="dica">Toque em um cartão para ler o significado completo.</p>

              <div className="mapa-grade">
                {cartoes.map((c) => (
                  <CartaoArcano
                    key={c.id}
                    rotulo={c.rotulo}
                    valor={c.valor}
                    subtitulo={c.subtitulo}
                    calculo={c.calculo}
                    significado={c.significado}
                    abrirModal={abrirModal}
                    busca={c.busca}
                    buscaUrl={c.busca ? `${BUSCA_URL}${encodeURIComponent(c.busca)}` : undefined}
                    longo={c.longo}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {resultado && secao === 'acontecimentos' && (
          <section id="acontecimentos" className="faixa faixa-escura">
            <div className="container">
              <h2>Acontecimentos do Dia</h2>
              <p className="faixa-sub">
                A tônica de cada hora de hoje, calculada a partir da sua Tônica do Dia ({resultado.tonicaDoDia}).
              </p>
              <ol className="horas-grade">
                {acontecimentos.map((a) => (
                  <li key={a.hora} className="hora-item">
                    <span className="hora-hora">{a.hora}</span>
                    <span className="hora-tonica" title={ARCANO_TITULO[a.tonica]}>{a.tonica}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {resultado && secao === 'anos' && (
          <section id="anos" className="faixa">
            <div className="container">
              <h2>Anos Importantes</h2>
              <p className="faixa-sub">
                Os anos marcantes do seu ciclo de 100 anos a partir de {resultado.anoNascimento}, com a tônica de cada um.
              </p>
              <ol className="anos-lista">
                {anos.map((a) => (
                  <li key={a.ano} className="ano-item">
                    <span className="ano-ano">{a.ano}</span>
                    <span className="ano-tonica">Tônica {a.tonica} · {ARCANO_TITULO[a.tonica]}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <section className="podcast-cta">
          <div className="container podcast-cta-inner">
            <img src="/logo-sol.png" alt="Selo Gnosis" className="podcast-cta-sol" />
            <h2 className="podcast-cta-title">
              Leve este conhecimento para o seu dia a dia. <br />
              <span className="accent-gold">Encontre a sede mais próxima de você.</span>
            </h2>
            <p className="podcast-cta-desc">
              Faça como milhares de pessoas no Brasil: entre para o grupo de WhatsApp da sede mais
              próxima e fique por dentro. Será um prazer ter você conosco!
            </p>
            <div className="podcast-cta-actions">
              <a href="https://gnosisbrasil.com/locais/" className="btn-podcast-cta" target="_blank" rel="noopener noreferrer">
                Participe para Saber Mais →
              </a>
              <a href="https://wa.me/message/SGUYC2UIUPKSN1" className="btn-podcast-outline" target="_blank" rel="noopener noreferrer">
                Atendimento WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-glow" aria-hidden="true"></div>

        <div className="container footer-grid">
          <div className="footer-brand">
            <img src="/logo-sol.png" alt="Gnosis Brasil" />
            <strong>Numerologia Gnóstica</strong>
            <p>
              Instituto Gnosis Brasil: Ciência e Cultura Humana em Busca do Ser. Uma
              instituição filantrópica, baseada em voluntariado, dedicada à Sabedoria Universal.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Conhecimento</h4>
            <ul className="footer-links">
              <li><a href="https://gnosisbrasil.com/" target="_blank" rel="noopener noreferrer"><span className="link-arrow">›</span> O que é Gnosis</a></li>
              <li><a href="https://gnosisbrasil.com/artigos/" target="_blank" rel="noopener noreferrer"><span className="link-arrow">›</span> Artigos e Publicações</a></li>
              <li><a href="https://gnosisbrasil.com/biblioteca/" target="_blank" rel="noopener noreferrer"><span className="link-arrow">›</span> Biblioteca Gnóstica</a></li>
              <li><a href="https://gnosisbrasil.com/audios/" target="_blank" rel="noopener noreferrer"><span className="link-arrow">›</span> Áudios e Conferências</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Estudos & Práticas</h4>
            <ul className="footer-links">
              <li><a href="https://gnosisbrasil.com/cursos/" target="_blank" rel="noopener noreferrer"><span className="link-arrow">›</span> Cursos Gratuitos</a></li>
              <li><a href="https://gnosisbrasil.com/locais/" target="_blank" rel="noopener noreferrer"><span className="link-arrow">›</span> Sedes Presenciais</a></li>
              <li><a href="https://gnosisbrasil.com/gnosis-pratica/" target="_blank" rel="noopener noreferrer"><span className="link-arrow">›</span> Gnosis Prática</a></li>
              <li><a href="https://doar.gnosisbrasil.com" target="_blank" rel="noopener noreferrer"><span className="link-arrow">›</span> Doações</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Conexão</h4>
            <div className="footer-social-row">
              {SOCIALS.map((s) => (
                <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" className="social-icon-box" title={s.title} dangerouslySetInnerHTML={{ __html: s.svg }}></a>
              ))}
            </div>
            <div className="footer-actions">
              <a href="https://wa.me/message/SGUYC2UIUPKSN1" target="_blank" rel="noopener noreferrer" className="btn-wsp-footer">
                <WhatsappIcon size={18} />
                Atendimento WhatsApp
              </a>
              <a href="https://gnosisbrasil.com/locais/" className="btn-sedes-footer" target="_blank" rel="noopener noreferrer">Encontrar uma Sede</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p>© {new Date().getFullYear()} INSTITUTO GNOSIS BRASIL.</p>
            <div className="footer-bottom-links">
              <a href="mailto:webmaster@gnosisbrasil.com">Fale Conosco</a>
              <a href="https://doar.gnosisbrasil.com" target="_blank" rel="noopener noreferrer">Doações</a>
              <a href="https://gnosisbrasil.com/contato/" target="_blank" rel="noopener noreferrer">Contato</a>
            </div>
          </div>
        </div>
      </footer>

      {modal && (
        <div className="modal-fundo" onClick={() => setModal(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={modal.rotulo} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-fechar" onClick={() => setModal(null)} aria-label="Fechar">
              <Icone d={ICONS.fechar} size={16} />
            </button>
            <p className="modal-rotulo">{modal.rotulo}</p>
            <p className="modal-valor">{modal.valor}</p>
            {modal.subtitulo && <p className="modal-sub">{modal.subtitulo}</p>}
            <h3 className="modal-secao">Significado</h3>
            <div className="modal-texto">{modal.significado}</div>
            <h3 className="modal-secao">Como é calculado</h3>
            <div className="modal-texto">{modal.calculo}</div>
            <div className="modal-acoes">
              {modal.busca && (
                <a className="btn-mini busca" href={modal.buscaUrl} target="_blank" rel="noopener noreferrer">
                  <Icone d={ICONS.busca} size={14} /> Pesquisar “{modal.busca}” na Busca Gnosis
                </a>
              )}
              <button type="button" className="btn-primario" onClick={() => setModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
          <button type="button" onClick={() => setToast('')} aria-label="Fechar aviso">
            <Icone d={ICONS.fechar} size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
