# SatVantage Copiloto — extensão Chrome (MVP)

Extensão **independente** do app SatVantage. Lê o texto (e opcionalmente uma captura) da aba ativa e envia, junto com a sua pergunta, para o backend Next. **Não** acessa sessão, saldo, chave nem cookies da conta SatVantage.

**Site oficial registrado:** https://sat-vantage-iau60jdhv-gislanesena.vercel.app/  
Quando a aba é esse domínio (ou `localhost` em dev), o Copiloto usa o **mapa do site** e responde com tom empático / “vendendo” a plataforma com honestidade.

## Requisitos

1. Chrome (ou Chromium / Edge baseado em Chromium).
2. Backend: produção no Vercel (padrão em `popup.js`) **ou** `npm run dev` local — nesse caso troque `API_BASE` para `http://localhost:3000`.
3. (Opcional, análise de imagem) `ANTHROPIC_API_KEY` no `.env.local`, ou endpoint `/extension/analisar-imagem` em `AGENTS_API_URL`.

## Instalar (carregar sem compactação)

1. Abra o Chrome e vá em `chrome://extensions`.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione esta pasta: `extension/`.
5. Se já estava carregada, clique em **Atualizar** após mudanças.

## Usar

1. Abra o site oficial ou outra página http/https.
2. Clique no ícone da extensão.
3. No site oficial: sugestões “Mapa do site”, “Herança”, “Conectar carteira”, etc.
4. Pergunte em texto (**Analisar página**) ou use **📷 Selecionar área da tela**.
5. Respostas em dois modos:
   - **Avaliação** (ex.: “isso é golpe?”) → badge de risco (no site oficial: risco baixo + confirmação).
   - **Guia** (ex.: “onde fica a herança?”) → passo a passo com o mapa SatVantage.

## Arquivos

| Arquivo | Função |
| --- | --- |
| `manifest.json` | MV3 + ícones + hosts oficiais |
| `icons/` | Logo 16/48/128 + logo do popup |
| `content.js` | Extrai texto visível |
| `popup.*` | UI, captura/recorte, chips oficiais |

Backend: `app/api/extension/analisar`, `app/api/extension/analisar-imagem` · mapa em `lib/extension-satvantage-site.ts`.
