# SatVantage Copiloto — extensão oficial (única)

**Pasta canônica:** `front/extension/`  
Não use mais `satmentor/extension/` (removida / apenas redirecionamento).

Side Panel MV3 independente do app. Backend = **Next.js** (produção Vercel ou `localhost:3000` na aba oficial):

- `POST /api/extension/analisar`
- `POST /api/extension/analisar-imagem`
- `GET /api/market/btc`

Não embute chave de IA. Não depende do `agents-api`.

## Instalar

1. Chrome → `chrome://extensions` → Modo do desenvolvedor  
2. **Carregar sem compactação** → esta pasta: `front/extension/`  
3. (Opcional) `npm run build` dentro desta pasta gera `dist/` para carregar a cópia estática

## Ferramentas

| Ação | Função |
| --- | --- |
| É o site oficial? | Heurística local (`domain-check.js`) |
| Analisar página | Texto + `/api/extension/analisar` |
| Selecionar área | Captura + `/api/extension/analisar-imagem` |
| Preço do Bitcoin | `/api/market/btc` |

## Arquivos

| Arquivo | Função |
| --- | --- |
| `manifest.json` | MV3 · Side Panel · v1.0.0 |
| `background.js` | Abre o painel |
| `popup.*` | UI do Side Panel |
| `domain-check.js` | Domínios oficiais + phishing |
| `content.js` | Texto da página + security |
| `storage.js` | Preferências / histórico |
| `build.js` | Cópia → `dist/` |
