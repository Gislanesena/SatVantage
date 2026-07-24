# SatVantage Copiloto — extensão Chrome (Side Panel)

Extensão **independente** do app. Chama só os endpoints Next.js em produção:

Também mostra a **cotação do Bitcoin** via `GET /api/market/btc` (CoinGecko, sem chave).

**Site oficial:** https://sat-vantage-gislanesena.vercel.app/  
Quando a aba é esse domínio (ou `localhost` em dev), o Copiloto usa o **mapa do site**.

## Instalar

1. `chrome://extensions` → **Modo do desenvolvedor**
2. **Carregar sem compactação** → pasta `extension/`
3. Após mudanças: **Atualizar** a extensão
**https://sat-vantage-gislanesena.vercel.app**

- `POST /api/extension/analisar`
- `POST /api/extension/analisar-imagem`
- `GET /api/market/btc`

Não há chave de IA na extensão. Não usa FastAPI/`agents-api` direto.

## Instalar (carregar sem compactação)

### Opção A — pasta `extension/` (mais rápida)

1. Abra o Chrome → `chrome://extensions`
2. Ative **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione a pasta: `web/extension/`
5. Clique no ícone SatVantage → abre o **Side Panel**

1. Clique no ícone (popup clássico).
2. **Analisar página** / **Selecionar área** — como antes.
3. **Preço do Bitcoin** (botão ou chip) — cotação BRL/USD no painel.

Backend: `app/api/extension/analisar`, `analisar-imagem`, `app/api/market/btc`.
### Opção B — pasta de build `dist/`

No terminal:

```bash
cd web/extension
npm run build
```

Isso gera `web/extension/dist/`. Em `chrome://extensions` → **Carregar sem compactação** → escolha `dist/`.

Após mudanças no código: em `chrome://extensions` clique em **Atualizar** na extensão.

## Backend / CORS (importante para o demo)

A extensão local chama a **URL de produção**, não o `localhost`.

CORS nas rotas `web/app/api/extension/*` e `web/app/api/market/btc` já está com `Access-Control-Allow-Origin: *` (hackathon).  
**Para valer em produção:** commit + push + novo deploy na Vercel.

## Ferramentas do painel

| Ação | Destino |
| --- | --- |
| É o site oficial? | Heurística local (`domain-check.js`) |
| Analisar página | Produção `/api/extension/analisar` |
| Selecionar área | Captura + `/api/extension/analisar-imagem` |
| Preço do Bitcoin | Produção `/api/market/btc` |

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
