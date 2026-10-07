// Motor da Numerologia Gnóstica — fórmulas idênticas às do site atual.
// Urgência Interior, Tônica Fundamental, Tônica do Dia, Signo Zodiacal,
// Zodíaco Regente, Logos Regente, Acontecimentos do Dia e Anos Importantes.

export function reduzir(n) {
  let e = n;
  while (e >= 10) {
    e = String(e)
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }
  return e;
}

export function somaDigitos(n) {
  return String(n)
    .split('')
    .reduce((a, b) => a + parseInt(b, 10), 0);
}

const SIGNOS = [
  'Capricórnio',
  'Aquário',
  'Peixes',
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
];

const LIMITES_SIGNO = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];

export function signoZodiacal(dia, mes) {
  return dia > LIMITES_SIGNO[mes - 1] ? SIGNOS[mes % 12] : SIGNOS[mes - 1];
}

const SIGNOS_REGENTES = [
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
];

const LOGOS = ['Gabriel', 'Raphael', 'Uriel', 'Michael', 'Samael', 'Zachariel', 'Orifiel', 'Nenhum'];

export const EMOJI_SIGNO = {
  'Áries': '♈️',
  Touro: '♉️',
  'Gêmeos': '♊️',
  'Câncer': '♋️',
  'Leão': '♌️',
  Virgem: '♍️',
  Libra: '♎️',
  'Escorpião': '♏️',
  'Sagitário': '♐️',
  'Capricórnio': '♑️',
  'Aquário': '♒️',
  Peixes: '♓️',
};

export function validarDataBR(data) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((data || '').trim());
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || ano < 1800 || ano > 2100) return null;
  const dt = new Date(ano, mes - 1, dia);
  if (dt.getFullYear() !== ano || dt.getMonth() !== mes - 1 || dt.getDate() !== dia) return null;
  return { dia, mes, ano };
}

export function aplicarMascaraData(valor) {
  const a = (valor || '').replace(/\D/g, '').slice(0, 8);
  if (a.length >= 5) return `${a.slice(0, 2)}/${a.slice(2, 4)}/${a.slice(4)}`;
  if (a.length >= 3) return `${a.slice(0, 2)}/${a.slice(2)}`;
  return a;
}

export function calcular(nome, dataBR, hoje = new Date()) {
  const { dia, mes, ano } = validarDataBR(dataBR) || {};
  if (!dia) throw new Error('Data de nascimento inválida. Use o formato dd/mm/aaaa.');

  const l = new Date(hoje);
  const m = new Date(l.getFullYear(), mes - 1, dia);
  if (l < m) m.setFullYear(m.getFullYear() - 1);

  const somaNascimento = String(dataBR.replace(/\D/g, ''))
    .split('')
    .map(Number)
    .reduce((a, b) => a + b, 0);
  const urgenciaInterior = reduzir(somaNascimento);
  const tonicaFundamental = reduzir(urgenciaInterior + nome.replace(/\s+/g, '').length);
  const somaHoje = [...String(l.getDate()), ...String(l.getMonth() + 1), ...String(l.getFullYear())]
    .map(Number)
    .reduce((a, b) => a + b, 0);
  const tonicaDoDia = reduzir(tonicaFundamental + somaHoje);

  const dias = Math.max(0, Math.ceil((+l - +m) / 864e5) - 1);
  let s = Math.floor(dias / (365 / 12));
  if (s === 12) s = 11;

  return {
    nome: nome.trim(),
    dataNascimento: dataBR.trim(),
    anoNascimento: ano,
    urgenciaInterior,
    tonicaFundamental,
    tonicaDoDia,
    signoZodiacal: signoZodiacal(dia, mes),
    zodiacoRegente: SIGNOS_REGENTES[s],
    logosRegente:
      dias === 0 ? 'Nenhum' : dias === 365 ? 'Orifiel' : LOGOS[Math.floor((dias - 1) / 52) % 7],
    diasDesdeAniversario: dias,
  };
}

export function acontecimentosDoDia(tonicaDoDia) {
  const lista = [];
  for (let h = 0; h < 24; h++) {
    const n = h % 12 === 0 ? 12 : h % 12;
    lista.push({ hora: `${n}h ${h < 12 ? 'AM' : 'PM'}`, tonica: reduzir(tonicaDoDia + n) });
  }
  return lista;
}

export function anosImportantes(anoNascimento) {
  const lista = [];
  let a = anoNascimento;
  while (a - anoNascimento < 100) {
    a += somaDigitos(a);
    lista.push({ ano: a, tonica: reduzir(somaDigitos(a)) });
  }
  return lista;
}

export function mensagemWhatsApp(r, url) {
  const signo = EMOJI_SIGNO[r.signoZodiacal] || '';
  return [
    '🔢 *Minha Numerologia Gnóstica*',
    '',
    `🔮 *Urgência Interior:* ${r.urgenciaInterior}`,
    `🔑 *Tônica Fundamental:* ${r.tonicaFundamental}`,
    `📅 *Tônica do Dia:* ${r.tonicaDoDia}`,
    `${signo} *Signo Zodiacal:* ${r.signoZodiacal}`,
    `🌌 *Zodíaco Regente:* ${r.zodiacoRegente}`,
    `🧩 *Logos Regente:* ${r.logosRegente}`,
    '',
    'Confira minha análise completa, acessando:',
    url,
  ].join('\n');
}

export function linkWhatsApp(r, url) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagemWhatsApp(r, url))}`;
}

export const BUSCA_URL = 'https://busca.gnosisbrasil.com/?search=';
