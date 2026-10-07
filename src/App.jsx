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
import { ARCANO_TITULO, ARCANOS, EXPLICACOES, LOGOS_TEXTO, SIGNOS_TEXTO } from './lib/conteudo';

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

function WhatsappIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.34zm-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.89 9.88zm8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.47-8.41z" />
    </svg>
  );
}

function CartaoArcano({ rotulo, valor, titulo, texto, explicacao, abrirModal, busca, buscaUrl }) {
  const [aberto, setAberto] = useState(false);
  return (
    <article className="arcano-card">
      <button type="button" className="arcano-topo" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}>
        <span className="arcano-valor">{valor}</span>
        <span className="arcano-rotulo">{rotulo}</span>
        {titulo && <span className="arcano-titulo">{titulo}</span>}
        <span className={`arcano-chevron ${aberto ? 'aberto' : ''}`}>
          <Icone d={ICONS.chevron} size={16} />
        </span>
      </button>
      {aberto && <p className="arcano-texto">{texto}</p>}
      <div className="arcano-acoes">
        <button type="button" className="btn-mini" onClick={() => abrirModal(rotulo, explicacao)}>
          Saber mais
        </button>
        {busca && (
          <a className="btn-mini busca" href={buscaUrl} target="_blank" rel="noopener noreferrer">
            <Icone d={ICONS.busca} size={14} /> Pesquisar “{busca}”
          </a>
        )}
      </div>
    </article>
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

  const abrirModal = useCallback((titulo, texto) => setModal({ titulo, texto }), []);

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

  const cartoes = useMemo(() => {
    if (!resultado) return [];
    return [
      {
        id: 'urgencia',
        rotulo: 'Urgência Interior',
        valor: resultado.urgenciaInterior,
        titulo: `Arcano ${resultado.urgenciaInterior} — ${ARCANO_TITULO[resultado.urgenciaInterior]}`,
        texto: ARCANOS[resultado.urgenciaInterior],
        explicacao: EXPLICACOES.urgencia,
      },
      {
        id: 'tonica',
        rotulo: 'Tônica Fundamental',
        valor: resultado.tonicaFundamental,
        titulo: `Arcano ${resultado.tonicaFundamental} — ${ARCANO_TITULO[resultado.tonicaFundamental]}`,
        texto: ARCANOS[resultado.tonicaFundamental],
        explicacao: EXPLICACOES.tonica,
      },
      {
        id: 'dia',
        rotulo: 'Tônica do Dia',
        valor: resultado.tonicaDoDia,
        titulo: `Arcano ${resultado.tonicaDoDia} — ${ARCANO_TITULO[resultado.tonicaDoDia]}`,
        texto: ARCANOS[resultado.tonicaDoDia],
        explicacao: EXPLICACOES.dia,
      },
      {
        id: 'signo',
        rotulo: 'Signo Zodiacal',
        valor: resultado.signoZodiacal,
        titulo: null,
        texto: SIGNOS_TEXTO[resultado.signoZodiacal],
        explicacao: EXPLICACOES.signo,
        busca: resultado.signoZodiacal,
      },
      {
        id: 'zodiaco',
        rotulo: 'Zodíaco Regente',
        valor: resultado.zodiacoRegente,
        titulo: null,
        texto: SIGNOS_TEXTO[resultado.zodiacoRegente],
        explicacao: EXPLICACOES.zodiaco,
        busca: resultado.zodiacoRegente,
      },
      {
        id: 'logos',
        rotulo: 'Logos Regente',
        valor: resultado.logosRegente,
        titulo: null,
        texto: LOGOS_TEXTO[resultado.logosRegente],
        explicacao: EXPLICACOES.logos,
        busca: resultado.logosRegente === 'Nenhum' ? null : resultado.logosRegente,
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
            <p className="hero-eyebrow">Cabala · Tarot · Autoconhecimento</p>
            <h1>
              Descubra os números <em>da sua existência</em>
            </h1>
            <p className="hero-sub">
              Informe seu nome completo de nascimento e a data de nascimento para revelar a urgência
              interior, a tônica fundamental, a tônica do dia e as regências do seu ciclo atual.
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

              <p className="dica">Toque em um cartão para ler o significado, ou em “Saber mais” para ver como o número é calculado.</p>

              <div className="arcano-grade">
                {cartoes.map((c) => (
                  <CartaoArcano
                    key={c.id}
                    rotulo={c.rotulo}
                    valor={c.valor}
                    titulo={c.titulo}
                    texto={c.texto}
                    explicacao={c.explicacao}
                    abrirModal={abrirModal}
                    busca={c.busca}
                    buscaUrl={c.busca ? `${BUSCA_URL}${encodeURIComponent(c.busca)}` : undefined}
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

        <section className="cta">
          <div className="container">
            <h2>Quer aprender mais sobre Gnosis e como incluir o conhecimento desta ferramenta no seu dia a dia?</h2>
            <p>Faça como milhares de pessoas no Brasil: entre para o grupo de WhatsApp da sede mais próxima a você e fique por dentro.</p>
            <p className="cta-destaque">Será um prazer ter você conosco!</p>
            <a className="btn-cta" href="https://gnosisbrasil.com/locais" target="_blank" rel="noopener noreferrer">
              Participe para Saber Mais <Icone d={ICONS.seta} size={16} />
            </a>
          </div>
        </section>
      </main>

      <footer className="rodape">
        <div className="container">
          <p>
            Instituto Gnosis Brasil © {new Date().getFullYear()} | gnosisbrasil.com
          </p>
          <p>
            Tem alguma sugestão?{' '}
            <a href="mailto:webmaster@gnosisbrasil.com">Fale Conosco!</a>
          </p>
        </div>
      </footer>

      {modal && (
        <div className="modal-fundo" onClick={() => setModal(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={modal.titulo} onClick={(e) => e.stopPropagation()}>
            <h2>{modal.titulo}</h2>
            <div className="modal-texto">{modal.texto}</div>
            <button type="button" className="btn-primario" onClick={() => setModal(null)}>
              Fechar
            </button>
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
