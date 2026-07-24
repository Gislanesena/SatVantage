# SatVantage Copiloto — extensão Chrome (Side Panel)

Extensão **independente** do app. Chama os endpoints Next.js em produção (ou localhost quando a aba ativa é o site oficial em dev):

**https://sat-vantage-gislanesena.vercel.app**

- `POST /api/extension/analisar`
- `POST /api/extension/analisar-imagem`
- `GET /api/market/btc` — cotação Bitcoin (CoinGecko, sem chave)

Não há chave de IA na extensão. Não usa FastAPI/`agents-api` direto.

**Site oficial:** quando a aba é esse domínio (ou `localhost` em dev), o Copiloto usa o **mapa do site** e resumo local (saldo, extrato, carteira, herança).

## Instalar (carregar sem compactação)

### Opção A — pasta `extension/` (mais rápida)

1. Abra o Chrome → `chrome://extensions`
2. Ative **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione a pasta: `web/extension/`
5. Clique no ícone SatVantage → abre o **Side Panel**

### Opção B — pasta de build `dist/`

No terminal:

```bash
cd web/extension
npm run build
```

Isso gera `web/extension/dist/`. Em `chrome://extensions` → **Carregar sem compactação** → escolha `dist/`.

Após mudanças no código: em `chrome://extensions` clique em **Atualizar** na extensão.

## Backend / CORS (importante para o demo)

A extensão chama a **URL de produção** por padrão. Em aba oficial (`localhost` ou Vercel), usa a mesma origem — útil para testar código local.

CORS nas rotas `web/app/api/extension/*` e `web/app/api/market/btc` já está com `Access-Control-Allow-Origin: *` (hackathon).  
**Para valer em produção:** commit + push + novo deploy na Vercel.

## Ferramentas do painel

| Ação | Destino |
| --- | --- |
| É o site oficial? | Heurística local (`domain-check.js`) |
| Analisar página | `/api/extension/analisar` (ou resumo local no site oficial) |
| Selecionar área | Captura + `/api/extension/analisar-imagem` |
| Preço do Bitcoin | `/api/market/btc` (botão ou chip) |

Preferências (`tema`, `último modo`) e histórico das últimas 10 análises ficam em `chrome.storage.local`.

## Arquivos

| Arquivo | Função |
| --- | --- |
| `manifest.json` | MV3, Side Panel, `storage` |
| `background.js` | Abre o painel no clique |
| `popup.*` | UI do Side Panel |
| `domain-check.js` | Domínio oficial (local) |
| `storage.js` | Preferências + histórico |
| `content.js` | Texto visível da aba |
| `build.js` / `package.json` | Cópia estática → `dist/` |
