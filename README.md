# igb-numerologia

Calculadora de Numerologia Gnóstica do Instituto Gnosis Brasil — somente frontend (React + Vite, sem backend).

Reescreve o site atual com a identidade visual Gnosis (a mesma do Busca e do Fórum: azul `#2350a0`, dourado `#ecc805`, Fraunces + Montserrat), mantendo cálculos, textos e recursos:

- Urgência Interior, Tônica Fundamental, Tônica do Dia
- Signo Zodiacal, Zodíaco Regente, Logos Regente
- Acontecimentos do Dia (24h) e Anos Importantes (100 anos)
- Compartilhar/copiar no WhatsApp, link com `?nome&data`
- Pesquisa do signo/regente na [Busca Gnosis](https://busca.gnosisbrasil.com)
- Dados salvos no navegador (`localStorage`, mesma chave do site atual)

## Rodar

```bash
npm i
npm run dev      # http://localhost:5173
npm run build    # gera dist/ (deploy estático, ex. Cloudflare Pages)
npm run preview  # serve o build em http://localhost:4173
npm run lint
```

## Estrutura

- `src/lib/numerologia.js` — motor de cálculo (fórmulas idênticas às do site atual)
- `src/lib/conteudo.js` — textos dos arcanos, signos, logos e explicações
- `src/App.jsx` — telas (formulário, mapa, acontecimentos, anos, CTA)
- `src/index.css` — identidade visual Gnosis
- `public/` — `numeros-bg.webp` (Typus Arithmeticae, Margarita Philosophica, Gregor Reisch, 1503 — Boécio e Pitágoras, domínio público, via Wikimedia Commons), `logo-sol.png`, `logoGnosis.png`, `favicon.svg`
